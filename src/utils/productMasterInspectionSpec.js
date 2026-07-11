/**
 * Project TITAN - product master inspection spec SSoT
 */

import { findProductByCompanyAndPartNo, findProductByPartNo } from "./masterData";
import { getProductByCompanyAndPartNo } from "./productRegistrationSession";
import {
  cloneSpecification,
  createDefaultSpecification,
  normalizeSpecification,
} from "./productSpecificationModel";
import { normalizeInspectionCriteriaSpec } from "./inspectionCriteriaModel";
import {
  getProductInspectionByPartNo,
  getProductInspectionByProductId,
  upsertProductInspection,
} from "./productInspectionSession";
import { resolveInspectionSpecFromTemplate } from "./inspectionTemplateSession";

export function resolveMasterProduct(company, partNo) {
  const trimmedPartNo = partNo?.trim();
  if (!trimmedPartNo) return null;
  return (
    findProductByCompanyAndPartNo(company, trimmedPartNo) ??
    findProductByPartNo(trimmedPartNo)
  );
}

export function resolveProductMasterInspectionSpec(company = "", partNo = "") {
  const masterProduct = resolveMasterProduct(company, partNo);
  const registrationProduct = getProductByCompanyAndPartNo(company, partNo);
  const inspectionRecord = masterProduct
    ? getProductInspectionByProductId(masterProduct.id) ??
      getProductInspectionByPartNo(partNo)
    : getProductInspectionByPartNo(partNo);

  let spec = createDefaultSpecification();

  const templateSpec = resolveInspectionSpecFromTemplate(masterProduct?.inspectionTemplateId);
  if (templateSpec) {
    spec = cloneSpecification(templateSpec);
  }

  if (registrationProduct?.specification) {
    spec = cloneSpecification(registrationProduct.specification);
  }

  if (masterProduct?.specification) {
    spec = normalizeInspectionCriteriaSpec(
      normalizeSpecification({
        ...spec,
        ...masterProduct.specification,
        hardness: { ...spec.hardness, ...(masterProduct.specification.hardness ?? {}) },
        heatTreatment: {
          ...spec.heatTreatment,
          ...(masterProduct.specification.heatTreatment ?? {}),
        },
      })
    );
  }

  if (inspectionRecord?.specification) {
    const merged = normalizeInspectionCriteriaSpec(inspectionRecord.specification);
    spec = normalizeInspectionCriteriaSpec({
      ...spec,
      ...merged,
      hardness: { ...spec.hardness, ...(merged.hardness ?? {}) },
      appearance: merged.appearance ?? spec.appearance,
      dimension: merged.dimension ?? spec.dimension,
      microstructure: merged.microstructure ?? spec.microstructure,
      other: merged.other ?? spec.other,
      hardeningDepth: merged.hardeningDepth ?? spec.hardeningDepth,
      heatTreatment: merged.heatTreatment ?? spec.heatTreatment,
    });
  }

  return normalizeInspectionCriteriaSpec(spec);
}

export function snapshotProductMasterSpec(company = "", partNo = "") {
  return cloneSpecification(resolveProductMasterInspectionSpec(company, partNo));
}

export function getProductSpecificationForEdit(product) {
  if (!product) return normalizeInspectionCriteriaSpec(createDefaultSpecification());
  const templateSpec = resolveInspectionSpecFromTemplate(product.inspectionTemplateId);
  const fromTemplate = templateSpec ? normalizeInspectionCriteriaSpec(templateSpec) : null;
  const fromMaster = product.specification
    ? normalizeInspectionCriteriaSpec(normalizeSpecification(product.specification))
    : null;
  const fromSession = getProductInspectionByProductId(product.id)?.specification;
  if (fromMaster) {
    return fromTemplate
      ? normalizeInspectionCriteriaSpec({
          ...fromTemplate,
          ...fromMaster,
          hardness: { ...fromTemplate.hardness, ...(fromMaster.hardness ?? {}) },
          heatTreatment: { ...fromTemplate.heatTreatment, ...(fromMaster.heatTreatment ?? {}) },
        })
      : fromMaster;
  }
  if (fromSession) return normalizeInspectionCriteriaSpec(normalizeSpecification(fromSession));
  if (fromTemplate) return fromTemplate;
  return normalizeInspectionCriteriaSpec(createDefaultSpecification());
}

export function syncProductInspectionFromMaster(product) {
  if (!product?.id || !product?.partNo) return { ok: false };
  const specification = product.specification
    ? normalizeInspectionCriteriaSpec(normalizeSpecification(product.specification))
    : createDefaultSpecification();
  return upsertProductInspection({
    productId: product.id,
    partNo: product.partNo,
    specification,
    note: "",
  });
}

