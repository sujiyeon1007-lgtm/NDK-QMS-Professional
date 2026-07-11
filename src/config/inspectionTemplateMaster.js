/**
 * Inspection Template Master - V1.1 Production Architecture
 */

import { createDefaultSpecification, normalizeSpecification } from "../utils/productSpecificationModel";
import { normalizeInspectionCriteriaSpec } from "../utils/inspectionCriteriaModel";

export const INSPECTION_TEMPLATE_MASTER_STORAGE_KEY = "project-titan-inspection-templates-v1";

export function normalizeInspectionTemplate(template) {
  if (!template || typeof template !== "object") return null;
  const id = String(template.id ?? "").trim();
  const label = String(template.label ?? "").trim();
  if (!id || !label) return null;
  const specification = normalizeInspectionCriteriaSpec(
    normalizeSpecification(template.specification ?? createDefaultSpecification())
  );
  return {
    id,
    label,
    description: String(template.description ?? "").trim(),
    specification,
    builtIn: template.builtIn === true,
  };
}

function nitrideSpec() {
  const spec = createDefaultSpecification();
  spec.heatTreatment.effectiveDepthBasis = "hv390";
  spec.heatTreatment.certificateOutputMode = "all";
  return normalizeInspectionCriteriaSpec(spec);
}

function carburizingSpec() {
  const spec = createDefaultSpecification();
  spec.heatTreatment.effectiveDepthBasis = "specifiedHv";
  spec.heatTreatment.specifiedHv = 550;
  spec.heatTreatment.certificateOutputMode = "caseAndAfterGrinding";
  return normalizeInspectionCriteriaSpec(spec);
}

function shotSpec() {
  const spec = createDefaultSpecification();
  spec.hardeningDepth.enabled = false;
  spec.microstructure.enabled = false;
  spec.heatTreatment.certificateOutputMode = "effectiveOnly";
  return normalizeInspectionCriteriaSpec(spec);
}

let _defaultInspectionTemplates = null;

function buildDefaultInspectionTemplates() {
  return [
    {
      id: "tpl-inspection-nitride",
      label: "\uC9C8\uD654 Template",
      description: "\uC774\uC628\uC9C8\uD654 \u00B7 \uC9C8\uD654 \uACF5\uC815 \uAC80\uC0AC \uAE30\uC900",
      builtIn: true,
      specification: nitrideSpec(),
    },
    {
      id: "tpl-inspection-carburize",
      label: "\uCE68\uD0C4 Template",
      description: "\uAC00\uC2A4\uCE68\uD0C4 \u00B7 \uCE68\uD0C4 \uACF5\uC815 \uAC80\uC0AC \uAE30\uC900",
      builtIn: true,
      specification: carburizingSpec(),
    },
    {
      id: "tpl-inspection-shot",
      label: "\uC1FC\uD2B8 Template",
      description: "\uC1FC\uD2B8 \uD53C\uB2DD \uAC80\uC0AC \uAE30\uC900",
      builtIn: true,
      specification: shotSpec(),
    },
  ]
    .map((item) => normalizeInspectionTemplate(item))
    .filter(Boolean);
}

export function getDefaultInspectionTemplates() {
  if (!_defaultInspectionTemplates) {
    _defaultInspectionTemplates = buildDefaultInspectionTemplates();
  }
  return _defaultInspectionTemplates;
}

/** @deprecated Use getDefaultInspectionTemplates() — kept for static imports. */
export const DEFAULT_INSPECTION_TEMPLATES = [];

export function cloneDefaultInspectionTemplates() {
  return getDefaultInspectionTemplates().map((row) =>
    normalizeInspectionTemplate({
      ...row,
      specification: JSON.parse(JSON.stringify(row.specification)),
    })
  ).filter(Boolean);
}

export function getInspectionTemplateSpecification(template) {
  if (!template?.specification) return null;
  return normalizeInspectionCriteriaSpec(normalizeSpecification(template.specification));
}
