/**
 * Sprint 9 — Phase 1 · Product Specification View Builder
 *
 * Blueprint: docs/blueprints/Sprint9/heat-treatment-technology-blueprint-v1.md (§3.2 · §5.2 · §7.1)
 *
 * 역할: Product Master Popup "품질 Specification" 탭 표시용 모델을 생성한다.
 * - SSoT Key = company + partNo (Blueprint §5.2 · PM 확정 정책)
 * - 저장 위치는 productStore.specification (Architecture 유지 · Blueprint §2.3)
 * - Phase 1 은 조회(Display) + Snapshot + 열처리 계산 설정(Engine) 연동 검증 전용.
 *   (쓰기/CRUD 는 Sprint 8 persistence 확장 필요 → PM 승인 후 Phase 1b)
 *
 * ⚠️ 이 모듈은 기존 Sprint 8 Master Workspace 를 수정하지 않는다 (Additive).
 */

import {
  CERTIFICATE_OUTPUT_MODES,
  EFFECTIVE_DEPTH_BASIS_OPTIONS,
  getCertificateOutputFields,
  normalizeSpecification,
} from "./productSpecificationModel";

const CERTIFICATE_OUTPUT_FIELD_LABELS = {
  effectiveDepth: "유효경화깊이",
  caseDepth: "경화깊이",
  grindingAllowance: "연마여유",
  afterGrindingDepth: "연마 후 경화깊이",
};

function labelFrom(options, value) {
  return options.find((opt) => opt.value === value)?.label ?? value ?? "—";
}

function toDisplay(value) {
  if (value == null) return "—";
  const text = String(value).trim();
  return text === "" ? "—" : text;
}

/**
 * 제품에 실제 품질 Spec 이 등록되어 있는지 판단한다.
 * (normalizeSpecification 은 미등록 시에도 기본값을 반환하므로 raw 존재 여부로 판정)
 */
export function hasProductSpecification(product) {
  const spec = product?.specification;
  if (!spec || typeof spec !== "object") return false;
  const hardnessItems = Array.isArray(spec.hardness?.items) ? spec.hardness.items : [];
  const hasHardness = hardnessItems.some(
    (item) => String(item?.spec ?? "").trim() !== "" && !item?.disabled
  );
  const dimensionItems = Array.isArray(spec.dimension?.items) ? spec.dimension.items : [];
  const hasDimension = dimensionItems.some((item) => String(item?.spec ?? "").trim() !== "");
  const hasOther = String(spec.other?.note ?? "").trim() !== "";
  return hasHardness || hasDimension || hasOther;
}

/**
 * Product Master Popup "품질 Specification" 탭 표시 모델.
 * @param {object} product - 제품 Master row (formatMasterRowForDisplay 결과 · specification 포함 가능)
 */
export function buildProductSpecificationView(product) {
  const specification = normalizeSpecification(product?.specification);
  const heatTreatment = specification.heatTreatment;

  const outputFields = getCertificateOutputFields(heatTreatment.certificateOutputMode);
  const outputFieldLabels = Object.entries(outputFields)
    .filter(([, enabled]) => enabled)
    .map(([key]) => CERTIFICATE_OUTPUT_FIELD_LABELS[key])
    .filter(Boolean);

  return {
    hasSpecification: hasProductSpecification(product),
    identity: {
      company: toDisplay(product?.company),
      partNo: toDisplay(product?.partNo),
      partName: toDisplay(product?.name ?? product?.partName),
      material: toDisplay(product?.material),
      drawingNo: toDisplay(product?.drawingNo),
      spec: toDisplay(product?.spec),
    },
    hardness: {
      unit: specification.hardness.unit,
      items: specification.hardness.items.map((item) => ({
        key: item.key,
        label: item.label,
        spec: item.disabled ? "없음" : toDisplay(item.spec),
        unit: item.disabled || toDisplay(item.spec) === "—" ? "" : specification.hardness.unit,
      })),
    },
    heatTreatment: {
      effectiveDepthBasis: labelFrom(
        EFFECTIVE_DEPTH_BASIS_OPTIONS,
        heatTreatment.effectiveDepthBasis
      ),
      showSpecifiedHv: heatTreatment.effectiveDepthBasis === "specifiedHv",
      specifiedHv: heatTreatment.specifiedHv,
      grindingAllowanceMm: heatTreatment.grindingAllowanceMm,
      certificateOutputMode: labelFrom(
        CERTIFICATE_OUTPUT_MODES,
        heatTreatment.certificateOutputMode
      ),
      outputFieldLabels,
    },
    appearance: {
      enabled: specification.appearance.enabled,
      items: specification.appearance.items.map((item) => ({
        key: item.key,
        label: item.label,
        enabled: item.enabled !== false,
      })),
    },
    dimension: {
      enabled: specification.dimension.enabled,
      unit: specification.dimension.unit,
      items: specification.dimension.items.map((item, index) => ({
        id: item.id ?? `dim-${index}`,
        label: toDisplay(item.label),
        spec: toDisplay(item.spec),
      })),
    },
    microstructure: {
      required: Boolean(specification.microstructure.enabled),
    },
    other: {
      enabled: Boolean(specification.other.enabled),
      note: toDisplay(specification.other.note),
    },
  };
}

export default buildProductSpecificationView;
