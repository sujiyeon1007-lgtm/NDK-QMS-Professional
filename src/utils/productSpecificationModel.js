/**
 * Project TITAN V1.0 — 제품등록 · Default Specification 모델
 */

import {
  createDefaultCertificatePolicy,
  normalizeCertificatePolicy,
} from "../config/certificatePolicyMaster";
import { formatCriterionDisplay } from "./inspectionCriteriaModel";

export const HARDNESS_UNITS = ["HV", "HRC", "HR15N", "HR30N", "HB", "HS"];

export const HARDNESS_ITEM_KEYS = [
  { key: "surface", label: "표면경도" },
  { key: "caseDepth", label: "경화깊이 기준" },
  { key: "effectiveDepth", label: "유효경화깊이 기준" },
  { key: "compoundLayer", label: "화합물층" },
];

/** @deprecated 검사 등록 시 측정 전용 — Master 검사 항목 목록에서 제외 */
export const LEGACY_CORE_HARDNESS_KEY = { key: "core", label: "심부경도" };

/** 검사 등록 hardnessRows / specifications에서 제외 (측정·자동계산 전용) */
export const INSPECTION_HARDNESS_EXCLUDED_KEYS = ["core", "caseDepth", "effectiveDepth"];

export const COMPOUND_LAYER_UNITS = ["μm", "mm"];

/** 조직사진 배율 옵션 (확장 가능) */
export const MICROSTRUCTURE_MAGNIFICATION_OPTIONS = [100, 200, 500, 1000];

export const DEFAULT_MICROSTRUCTURE_MAGNIFICATION = 500;

const DEFAULT_CASE_DEPTH_THRESHOLD_HV = 390;

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
    /** @deprecated Master stores offset only — measured core comes from inspection */
    coreHv: null,
    corePlusOffset: 50,
    /** 경화깊이 판정 기준 HV (제품별 · legacy flat field fallback) */
    caseDepthThresholdHv: DEFAULT_CASE_DEPTH_THRESHOLD_HV,
    grindingAllowanceMm: 0.15,
    certificateOutputMode: "all",
    depthDecimalPlaces: 2,
  };
}

export function normalizeHeatTreatment(heatTreatment) {
  const input = heatTreatment && typeof heatTreatment === "object" ? heatTreatment : {};
  const base = createDefaultHeatTreatment();
  const basis = EFFECTIVE_DEPTH_BASIS_OPTIONS.some((opt) => opt.value === input.effectiveDepthBasis)
    ? input.effectiveDepthBasis
    : base.effectiveDepthBasis;
  const specifiedHv = Number(input.specifiedHv);
  const corePlusOffsetRaw = Number(input.corePlusOffset);
  const grindingAllowanceMm = Number(input.grindingAllowanceMm);
  const depthDecimalPlaces = Number(input.depthDecimalPlaces);
  const caseDepthThresholdHv = Number(input.caseDepthThresholdHv);
  const certificateOutputMode = CERTIFICATE_OUTPUT_MODES.some(
    (opt) => opt.value === input.certificateOutputMode
  )
    ? input.certificateOutputMode
    : base.certificateOutputMode;

  return {
    effectiveDepthBasis: basis,
    specifiedHv: !Number.isNaN(specifiedHv) && specifiedHv > 0 ? specifiedHv : base.specifiedHv,
    coreHv: null,
    corePlusOffset:
      !Number.isNaN(corePlusOffsetRaw) && corePlusOffsetRaw > 0
        ? corePlusOffsetRaw
        : base.corePlusOffset,
    caseDepthThresholdHv:
      !Number.isNaN(caseDepthThresholdHv) && caseDepthThresholdHv > 0
        ? caseDepthThresholdHv
        : base.caseDepthThresholdHv,
    grindingAllowanceMm:
      !Number.isNaN(grindingAllowanceMm) && grindingAllowanceMm >= 0
        ? Number(grindingAllowanceMm.toFixed(2))
        : base.grindingAllowanceMm,
    depthDecimalPlaces:
      !Number.isNaN(depthDecimalPlaces) && depthDecimalPlaces >= 0 && depthDecimalPlaces <= 4
        ? depthDecimalPlaces
        : base.depthDecimalPlaces,
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
      note: "",
      magnification: DEFAULT_MICROSTRUCTURE_MAGNIFICATION,
      referencePhotos: [],
    },
    other: {
      enabled: false,
      note: "",
    },
    heatTreatment: createDefaultHeatTreatment(),
    certificatePolicy: createDefaultCertificatePolicy(),
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
    ? spec.hardness.items.map((item, index) => {
        const key = item.key || HARDNESS_ITEM_KEYS[index]?.key || `item-${index}`;
        const label = item.label || HARDNESS_ITEM_KEYS[index]?.label || item.key;
        const hasStructuredFields =
          item.value != null ||
          item.valueTo != null ||
          item.condition != null ||
          item.judgmentMethod != null ||
          item.judgmentHv != null ||
          item.fixedHv != null ||
          item.specCondition != null ||
          item.corePlusOffset != null ||
          item.coreHv != null ||
          item.unit != null;

        if (hasStructuredFields) {
          const structured = {
            key,
            label,
            value: String(item.value ?? "").trim(),
            valueTo: String(item.valueTo ?? "").trim(),
            condition: item.specCondition ?? item.condition ?? item.judgmentMethod ?? "범위",
            specCondition: item.specCondition ?? item.condition ?? "범위",
            judgmentMethod: item.judgmentMethod ?? item.condition ?? "범위",
            judgmentHv: item.judgmentHv ?? item.fixedHv ?? "",
            fixedHv: item.fixedHv ?? item.judgmentHv ?? "",
            unit: item.unit ?? "",
            coreHv: item.coreHv ?? "",
            corePlusOffset: item.corePlusOffset ?? "",
            disabled: Boolean(item.disabled),
          };
          return {
            ...structured,
            spec: structured.disabled ? "없음" : formatCriterionDisplay(structured) || "",
          };
        }

        return {
          key,
          label,
          spec: item.disabled ? "없음" : item.spec?.trim() || "",
          disabled: Boolean(item.disabled) || item.spec?.trim() === "없음",
        };
      })
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

  const normalizedHardnessItems = hardnessItems
    .filter((item) => item.key !== LEGACY_CORE_HARDNESS_KEY.key)
    .slice(0, HARDNESS_ITEM_KEYS.length);

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
      items: normalizedHardnessItems,
      surfaceEntries: Array.isArray(spec.hardness?.surfaceEntries)
        ? spec.hardness.surfaceEntries
        : undefined,
      customUnits: Array.isArray(spec.hardness?.customUnits) ? spec.hardness.customUnits : undefined,
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
      note: spec.microstructure?.note?.trim() || "",
      magnification: MICROSTRUCTURE_MAGNIFICATION_OPTIONS.includes(
        Number(spec.microstructure?.magnification)
      )
        ? Number(spec.microstructure.magnification)
        : DEFAULT_MICROSTRUCTURE_MAGNIFICATION,
      referencePhotos: Array.isArray(spec.microstructure?.referencePhotos)
        ? spec.microstructure.referencePhotos.slice(0, MICROSTRUCTURE_MAGNIFICATION_OPTIONS.length).map((photo) =>
            String(photo ?? "")
          )
        : [],
    },
    other: {
      enabled: Boolean(spec.other?.enabled),
      note: spec.other?.note?.trim() || "",
    },
    heatTreatment: normalizeHeatTreatment(spec.heatTreatment ?? base.heatTreatment),
    certificatePolicy: normalizeCertificatePolicy(spec.certificatePolicy ?? base.certificatePolicy),
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

/** 제품 Master — 문서 연결 (참조만 · 파일 저장 ❌) */
export function normalizeDocumentLinks(links) {
  if (!Array.isArray(links)) return [];
  return links
    .map((link) => ({
      documentId: String(link.documentId ?? link.id ?? "").trim(),
      type: String(link.type ?? link.documentType ?? "").trim(),
      title: String(link.title ?? "").trim(),
      documentNo: String(link.documentNo ?? "").trim(),
    }))
    .filter((link) => link.documentId);
}

export function createEmptyDocumentLink() {
  return { documentId: "", type: "", title: "", documentNo: "" };
}
