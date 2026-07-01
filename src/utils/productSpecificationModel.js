/**
 * Project TITAN V1.0 — 제품등록 · Default Specification 모델
 */

export const HARDNESS_UNITS = ["HV", "HRC", "HR15N", "HR30N", "HB", "HS"];

export const HARDNESS_ITEM_KEYS = [
  { key: "surface", label: "표면경도" },
  { key: "caseDepth", label: "경화깊이 기준" },
  { key: "effectiveDepth", label: "유효경화깊이 기준" },
  { key: "compoundLayer", label: "화합물층" },
  { key: "core", label: "심부경도" },
];

/** 유효경화깊이 계산 기준 (업체+품번 Default Specification) */
export const EFFECTIVE_DEPTH_BASIS_OPTIONS = [
  { value: "hv390", label: "390HV 기준" },
  { value: "specifiedHv", label: "지정 HV 기준" },
  { value: "corePlus50", label: "심부경도 +50HV 기준" },
];

/** 성적서·리포트 출력 방식 */
export const CERTIFICATE_OUTPUT_MODES = [
  { value: "effectiveOnly", label: "유효경화깊이만 출력" },
  { value: "caseOnly", label: "경화깊이만 출력" },
  { value: "afterGrindingOnly", label: "연마 후 경화깊이만 출력" },
  { value: "caseAndAfterGrinding", label: "경화깊이 + 연마 후 경화깊이 출력" },
  { value: "all", label: "모두 출력" },
];

export function createDefaultHeatTreatment() {
  return {
    effectiveDepthBasis: "hv390",
    specifiedHv: 390,
    grindingAllowanceMm: 0.15,
    certificateOutputMode: "all",
  };
}

export function normalizeHeatTreatment(heatTreatment) {
  const input = heatTreatment && typeof heatTreatment === "object" ? heatTreatment : {};
  const base = createDefaultHeatTreatment();
  const basis = EFFECTIVE_DEPTH_BASIS_OPTIONS.some((opt) => opt.value === input.effectiveDepthBasis)
    ? input.effectiveDepthBasis
    : base.effectiveDepthBasis;
  const specifiedHv = Number(input.specifiedHv);
  const grindingAllowanceMm = Number(input.grindingAllowanceMm);
  const certificateOutputMode = CERTIFICATE_OUTPUT_MODES.some(
    (opt) => opt.value === input.certificateOutputMode
  )
    ? input.certificateOutputMode
    : base.certificateOutputMode;

  return {
    effectiveDepthBasis: basis,
    specifiedHv: !Number.isNaN(specifiedHv) && specifiedHv > 0 ? specifiedHv : base.specifiedHv,
    grindingAllowanceMm:
      !Number.isNaN(grindingAllowanceMm) && grindingAllowanceMm >= 0
        ? Number(grindingAllowanceMm.toFixed(2))
        : base.grindingAllowanceMm,
    certificateOutputMode,
  };
}

export function getHeatTreatmentConfig(specOrHeatTreatment) {
  if (!specOrHeatTreatment) return normalizeHeatTreatment({});
  if (specOrHeatTreatment.effectiveDepthBasis != null) {
    return normalizeHeatTreatment(specOrHeatTreatment);
  }
  return normalizeHeatTreatment(specOrHeatTreatment.heatTreatment);
}

export function getCertificateOutputFields(mode) {
  switch (mode) {
    case "effectiveOnly":
      return {
        effectiveDepth: true,
        caseDepth: false,
        grindingAllowance: false,
        afterGrindingDepth: false,
      };
    case "caseOnly":
      return {
        effectiveDepth: false,
        caseDepth: true,
        grindingAllowance: false,
        afterGrindingDepth: false,
      };
    case "afterGrindingOnly":
      return {
        effectiveDepth: false,
        caseDepth: false,
        grindingAllowance: false,
        afterGrindingDepth: true,
      };
    case "caseAndAfterGrinding":
      return {
        effectiveDepth: false,
        caseDepth: true,
        grindingAllowance: false,
        afterGrindingDepth: true,
      };
    case "all":
    default:
      return {
        effectiveDepth: true,
        caseDepth: true,
        grindingAllowance: true,
        afterGrindingDepth: true,
      };
  }
}

export const APPEARANCE_ITEM_KEYS = [
  { key: "dent", label: "찍힘" },
  { key: "color", label: "색상 이상" },
  { key: "stain", label: "얼룩" },
  { key: "other", label: "기타" },
];

export function createEmptyHardnessItems() {
  return HARDNESS_ITEM_KEYS.map((item) => ({
    key: item.key,
    label: item.label,
    spec: "",
    disabled: false,
  }));
}

export function createEmptyAppearanceItems() {
  return APPEARANCE_ITEM_KEYS.map((item) => ({
    key: item.key,
    label: item.label,
    enabled: true,
  }));
}

export function createEmptyDimensionItems() {
  return [];
}

export function createDefaultSpecification() {
  return {
    appearance: {
      enabled: true,
      items: createEmptyAppearanceItems(),
    },
    hardness: {
      enabled: true,
      unit: "HV",
      items: createEmptyHardnessItems(),
    },
    dimension: {
      enabled: false,
      unit: "mm",
      items: createEmptyDimensionItems(),
    },
    hardeningDepth: {
      enabled: true,
    },
    microstructure: {
      enabled: false,
    },
    other: {
      enabled: false,
      note: "",
    },
    heatTreatment: createDefaultHeatTreatment(),
  };
}

export function createEmptyProductRegistration() {
  return {
    company: "",
    partName: "",
    partNo: "",
    drawingNo: "",
    material: "",
    process: "",
    note: "",
    specification: createDefaultSpecification(),
  };
}

export function normalizeSpecification(spec = {}) {
  const base = createDefaultSpecification();
  const hardnessItems = Array.isArray(spec.hardness?.items)
    ? spec.hardness.items.map((item, index) => ({
        key: item.key || HARDNESS_ITEM_KEYS[index]?.key || `item-${index}`,
        label: item.label || HARDNESS_ITEM_KEYS[index]?.label || item.key,
        spec: item.disabled ? "없음" : item.spec?.trim() || "",
        disabled: Boolean(item.disabled) || item.spec?.trim() === "없음",
      }))
    : base.hardness.items;

  while (hardnessItems.length < HARDNESS_ITEM_KEYS.length) {
    const meta = HARDNESS_ITEM_KEYS[hardnessItems.length];
    hardnessItems.push({
      key: meta.key,
      label: meta.label,
      spec: "",
      disabled: false,
    });
  }

  return {
    appearance: {
      enabled: spec.appearance?.enabled ?? base.appearance.enabled,
      items: (() => {
        const items = Array.isArray(spec.appearance?.items)
          ? spec.appearance.items.map((item, index) => ({
              key: item.key || APPEARANCE_ITEM_KEYS[index]?.key || `app-${index}`,
              label: item.label || APPEARANCE_ITEM_KEYS[index]?.label || item.key,
              enabled: item.enabled !== false,
            }))
          : base.appearance.items;
        while (items.length < APPEARANCE_ITEM_KEYS.length) {
          const meta = APPEARANCE_ITEM_KEYS[items.length];
          items.push({ key: meta.key, label: meta.label, enabled: meta.key !== "other" });
        }
        return items.slice(0, APPEARANCE_ITEM_KEYS.length);
      })(),
    },
    hardness: {
      enabled: spec.hardness?.enabled ?? base.hardness.enabled,
      unit: HARDNESS_UNITS.includes(spec.hardness?.unit) ? spec.hardness.unit : "HV",
      items: hardnessItems.slice(0, HARDNESS_ITEM_KEYS.length),
    },
    dimension: {
      enabled: spec.dimension?.enabled ?? base.dimension.enabled,
      unit: "mm",
      items: Array.isArray(spec.dimension?.items)
        ? spec.dimension.items.map((item, index) => ({
            id: item.id || `dim-${index}`,
            label: item.label?.trim() || "",
            spec: item.spec?.trim() || "",
          }))
        : [],
    },
    hardeningDepth: {
      enabled: spec.hardeningDepth?.enabled ?? base.hardeningDepth.enabled,
    },
    microstructure: {
      enabled: Boolean(spec.microstructure?.enabled),
    },
    other: {
      enabled: Boolean(spec.other?.enabled),
      note: spec.other?.note?.trim() || "",
    },
    heatTreatment: normalizeHeatTreatment(spec.heatTreatment ?? base.heatTreatment),
  };
}

export function normalizeProductRegistration(product) {
  return {
    id: product.id || "",
    company: product.company?.trim() || "",
    partName: product.partName?.trim() || "",
    partNo: product.partNo?.trim() || "",
    drawingNo: product.drawingNo?.trim() || "",
    material: product.material?.trim() || "",
    process: product.process?.trim() || "",
    note: product.note?.trim() || "",
    specification: normalizeSpecification(product.specification),
    active: product.active !== false,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
}

export function cloneSpecification(spec) {
  return JSON.parse(JSON.stringify(normalizeSpecification(spec)));
}
