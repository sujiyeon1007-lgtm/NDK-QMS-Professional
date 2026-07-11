/**
 * Project TITAN V1.0 — 제품별 검사기준 (경도 · 깊이 스펙) 모델
 * 제품 스펙(spec range) · 판정 기준(judgment/calc) 분리
 */

import {
  COMPOUND_LAYER_UNITS,
  getHeatTreatmentConfig,
  INSPECTION_HARDNESS_EXCLUDED_KEYS,
} from "./productSpecificationModel";

export const SPEC_CONDITIONS = ["이상", "이하", "범위", "동일"];

/** 검사 Master — 판정 방식 (PM 제품 Master 재설계) */
export const JUDGMENT_METHODS = ["범위", "이상", "이하", "Core + 값", "고정 HV", "직접 입력"];

/** 깊이 항목 제품 스펙 조건 (판정 기준과 분리) */
export const DEPTH_SPEC_CONDITIONS = ["범위", "이상", "이하", "동일"];

/** 경화깊이 — 판정 방식 UI (judgmentHv · judgmentMethod에 매핑) */
export const CASE_DEPTH_CALC_METHOD_OPTIONS = [
  { value: "fixedHv", label: "고정 HV", judgmentMethod: "고정 HV" },
  { value: "corePlusOffset", label: "CORE + OFFSET", judgmentMethod: "Core + 값" },
];

/** @deprecated RC1 legacy judgmentMethod — load only, not shown in UI */
export const CASE_DEPTH_LEGACY_JUDGMENT_METHODS = ["HV 곡선 직선보간", "심부경도 + Offset"];

export const DEFAULT_CASE_DEPTH_JUDGMENT_HV = 390;

const CASE_DEPTH_JUDGMENT_METHOD_TO_UI = {
  "고정 HV": "fixedHv",
  "Core + 값": "corePlusOffset",
  /** legacy → nearest UI option */
  "HV 곡선 직선보간": "fixedHv",
  "심부경도 + Offset": "corePlusOffset",
};

/** UI / legacy calc key → canonical UI calc key */
export function normalizeCaseDepthCalcMethod(calcMethod) {
  if (calcMethod === "hv390" || calcMethod === "coreHvPlusOffset") {
    return calcMethod === "hv390" ? "fixedHv" : "corePlusOffset";
  }
  if (CASE_DEPTH_CALC_METHOD_OPTIONS.some((option) => option.value === calcMethod)) {
    return calcMethod;
  }
  return "fixedHv";
}

/** caseDepth item → UI 계산방식 값 (judgmentMethod 우선 · legacy judgmentHv 추론) */
export function resolveCaseDepthCalcMethod(item = {}) {
  const fromMethod = CASE_DEPTH_JUDGMENT_METHOD_TO_UI[item.judgmentMethod];
  if (fromMethod) return fromMethod;

  const hv = Number(item.judgmentHv ?? item.fixedHv ?? DEFAULT_CASE_DEPTH_JUDGMENT_HV);
  if (!Number.isNaN(hv) && hv > 0) {
    return "fixedHv";
  }
  return "fixedHv";
}

/** UI 계산방식 → caseDepth judgment patch (preserves draft strings during typing) */
export function buildCaseDepthJudgmentPatch(calcMethod, judgmentHv, corePlusOffset) {
  const normalizedMethod = normalizeCaseDepthCalcMethod(calcMethod);
  const option = CASE_DEPTH_CALC_METHOD_OPTIONS.find((row) => row.value === normalizedMethod);
  const resolvedMethod = option?.judgmentMethod ?? "고정 HV";
  const rawHv = judgmentHv == null ? "" : String(judgmentHv);
  const rawOffset = corePlusOffset == null ? "" : String(corePlusOffset);

  switch (normalizedMethod) {
    case "corePlusOffset":
      return {
        judgmentMethod: resolvedMethod,
        judgmentHv: rawHv,
        corePlusOffset: rawOffset,
      };
    case "fixedHv":
    default:
      return {
        judgmentMethod: resolvedMethod,
        judgmentHv: rawHv,
      };
  }
}

/** Commit caseDepth HV fields — apply defaults only on blur/save, not mid-typing */
export function finalizeCaseDepthJudgmentPatch(calcMethod, judgmentHv, corePlusOffset) {
  const normalizedMethod = normalizeCaseDepthCalcMethod(calcMethod);
  const option = CASE_DEPTH_CALC_METHOD_OPTIONS.find((row) => row.value === normalizedMethod);
  const resolvedMethod = option?.judgmentMethod ?? "고정 HV";
  const hv = Number(judgmentHv);
  const resolvedHv =
    !Number.isNaN(hv) && hv > 0 ? String(hv) : String(DEFAULT_CASE_DEPTH_JUDGMENT_HV);
  const resolvedOffset = resolveCorePlusOffset(corePlusOffset, 50);

  switch (normalizedMethod) {
    case "corePlusOffset":
      return {
        judgmentMethod: resolvedMethod,
        judgmentHv: String(DEFAULT_CASE_DEPTH_JUDGMENT_HV),
        corePlusOffset: resolvedOffset,
      };
    case "fixedHv":
    default:
      return {
        judgmentMethod: resolvedMethod,
        judgmentHv: resolvedHv,
      };
  }
}

export const HARDNESS_UNIT_OPTIONS = ["HV", "HRC", "HS"];

export { COMPOUND_LAYER_UNITS, INSPECTION_HARDNESS_EXCLUDED_KEYS };

export const INSPECTION_MASTER_ITEMS = [
  { key: "surface", label: "표면경도", type: "surface" },
  { key: "caseDepth", label: "경화깊이", type: "depth" },
  { key: "effectiveDepth", label: "유효경화깊이", type: "depth" },
  { key: "compoundLayer", label: "화합물층", type: "hardness" },
  { key: "microstructure", label: "조직검사", type: "microstructure" },
  { key: "dimension", label: "치수검사", type: "dimension" },
];

export const DEFAULT_HARDNESS_UNITS = ["HV", "HRC", "HS", "HR15N"];

const DEPTH_UNIT = "mm";
const DEFAULT_CASE_DEPTH_THRESHOLD_HV = 390;

const CRITERION_UNIT_BY_KEY = {
  surface: "hardnessUnit",
  caseDepth: "mm",
  effectiveDepth: "mm",
  compoundLayer: "μm",
  core: "hardnessUnit",
};

/** 항목별 단위 — 화합물층은 μm 고정 (HS/HV 혼용 방지) */
export function resolveCriterionItemUnit(key, item = {}, hardnessUnit = "HV") {
  if (key === "compoundLayer") {
    const itemUnit = String(item.unit ?? "").trim();
    return COMPOUND_LAYER_UNITS.includes(itemUnit) ? itemUnit : "μm";
  }
  const mapped = CRITERION_UNIT_BY_KEY[key];
  if (mapped === "hardnessUnit") return hardnessUnit || "HV";
  if (mapped) return mapped;
  const itemUnit = String(item.unit ?? "").trim();
  return itemUnit || hardnessUnit || "HV";
}

function resolveNormalizedCriterionUnit(item, defaultUnit, isCompoundLayer) {
  const itemUnit = String(item?.unit ?? "").trim();
  if (isCompoundLayer) {
    return COMPOUND_LAYER_UNITS.includes(itemUnit) ? itemUnit : "μm";
  }
  if (HARDNESS_UNIT_OPTIONS.includes(itemUnit)) return itemUnit;
  return defaultUnit;
}

function createEntryId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** 제품 스펙 블록 (합격/불합격 범위) */
export function parseFieldSpec(item = {}, defaultUnit = "") {
  return {
    min: String(item.value ?? "").trim(),
    max: String(item.valueTo ?? "").trim(),
    unit: String(item.unit ?? defaultUnit).trim(),
    condition: DEPTH_SPEC_CONDITIONS.includes(item.specCondition)
      ? item.specCondition
      : DEPTH_SPEC_CONDITIONS.includes(item.condition) && item.key !== "caseDepth"
        ? item.condition
        : "범위",
  };
}

/** 판정 기준 블록 (자동 계산 · 측정 판정 방식) */
export function parseFieldJudgment(item = {}) {
  const method = normalizeJudgmentMethod(item.judgmentMethod ?? item.judgment?.method ?? item.condition);
  const judgment = { method };

  if (method === "Core + 값" || method === "심부경도 + Offset") {
    judgment.offset = resolveCorePlusOffset(item.corePlusOffset ?? item.judgment?.offset ?? item.value);
  }
  if (
    method === "고정 HV" ||
    method === "지정 HV" ||
    method === "HV 곡선 직선보간"
  ) {
    const hv = Number(item.judgmentHv ?? item.judgment?.hv ?? item.fixedHv ?? item.value);
    judgment.hv = !Number.isNaN(hv) && hv > 0 ? hv : DEFAULT_CASE_DEPTH_THRESHOLD_HV;
  }

  return judgment;
}

/** 구조화 필드 — spec + judgment (legacy flat fields 호환) */
export function buildFieldCriterion(item, defaultUnit = "") {
  if (!item) return { disabled: true, spec: { min: "", max: "", unit: defaultUnit }, judgment: { method: "범위" } };
  return {
    disabled: Boolean(item.disabled),
    spec: parseFieldSpec(item, defaultUnit),
    judgment: parseFieldJudgment(item),
    displaySpec: item.disabled ? "없음" : item.spec?.trim() || formatCriterionDisplay(parseFieldSpec(item, defaultUnit)),
  };
}

export function formatSpecOnlyDisplay({ min, max, unit = "", condition = "범위" } = {}) {
  return formatCriterionDisplay({
    value: min,
    valueTo: max,
    condition,
    unit,
  });
}

/** 경화깊이 판정 기준 HV — 제품 Master caseDepth judgment (NOT effective depth basis) */
function resolveCaseDepthThresholdHvCore(spec) {
  const caseItem = spec?.hardness?.items?.find((item) => item.key === "caseDepth");

  if (caseItem && !caseItem.disabled) {
    const judgment = parseFieldJudgment(caseItem);
    if (
      (judgment.method === "고정 HV" || judgment.method === "HV 곡선 직선보간") &&
      judgment.hv > 0
    ) {
      return judgment.hv;
    }
    const legacyHv = Number(caseItem.judgmentHv ?? caseItem.fixedHv);
    if (!Number.isNaN(legacyHv) && legacyHv > 0) return legacyHv;
  }

  const ht = getHeatTreatmentConfig(spec);
  if (ht.caseDepthThresholdHv > 0) return ht.caseDepthThresholdHv;

  return DEFAULT_CASE_DEPTH_THRESHOLD_HV;
}

export function resolveCaseDepthThresholdHv(spec) {
  if (!spec) return DEFAULT_CASE_DEPTH_THRESHOLD_HV;
  return resolveCaseDepthThresholdHvCore(normalizeInspectionCriteriaSpec(spec));
}

/** 유효경화깊이 판정 기준 — heatTreatment basis (case depth basis와 분리) */
export function resolveEffectiveDepthJudgment(spec) {
  const ht = getHeatTreatmentConfig(spec);
  return {
    basis: ht.effectiveDepthBasis,
    specifiedHv: ht.specifiedHv,
    offset: ht.corePlusOffset,
  };
}

/** caseDepth judgment → heatTreatment.caseDepthThresholdHv 동기화 */
export function syncHeatTreatmentFromCriteria(spec) {
  if (!spec) return spec;

  return {
    ...spec,
    heatTreatment: {
      ...spec.heatTreatment,
      caseDepthThresholdHv: resolveCaseDepthThresholdHvCore(spec),
    },
  };
}

export function createEmptyDepthCriterion() {
  return {
    value: "",
    valueTo: "",
    condition: "범위",
    disabled: false,
    unit: DEPTH_UNIT,
  };
}

export function createEmptyHardnessEntry(unit = "HV") {
  return {
    id: createEntryId("hs"),
    value: "",
    valueTo: "",
    condition: "범위",
    unit: unit || "HV",
  };
}

export function normalizeJudgmentMethod(method) {
  if (JUDGMENT_METHODS.includes(method)) return method;
  if (CASE_DEPTH_CALC_METHOD_OPTIONS.some((option) => option.judgmentMethod === method)) return method;
  if (CASE_DEPTH_LEGACY_JUDGMENT_METHODS.includes(method)) return method;
  if (SPEC_CONDITIONS.includes(method)) return method;
  return "범위";
}

export function resolveCorePlusThreshold(coreHv, offset = 50) {
  const base = Number(coreHv);
  const add = Number(offset);
  if (Number.isNaN(base) || base <= 0) return null;
  if (Number.isNaN(add) || add <= 0) return base + 50;
  return base + add;
}

export function resolveCorePlusOffset(value, fallback = 50) {
  const offset = Number(value);
  if (Number.isNaN(offset) || offset <= 0) return fallback;
  return offset;
}

export function formatCriterionDisplay({
  value,
  valueTo,
  condition,
  unit = "",
  coreHv = null,
  corePlusOffset = null,
} = {}) {
  const primary = String(value ?? "").trim();
  const secondary = String(valueTo ?? "").trim();
  const suffix = unit ? ` ${unit}` : "";
  const method = normalizeJudgmentMethod(condition);

  if (method === "Core + 값") {
    const offset = resolveCorePlusOffset(corePlusOffset ?? primary);
    if (coreHv != null && Number(coreHv) > 0) {
      const threshold = resolveCorePlusThreshold(coreHv, offset);
      return threshold != null ? `Core+${offset} → ${threshold} HV` : "";
    }
    return `Core+${offset}HV (검사 시 심부경도 + ${offset}HV)`;
  }
  if (method === "고정 HV") {
    return primary ? `${primary} HV` : "";
  }
  if (method === "직접 입력") {
    return primary || "";
  }

  if (!primary) return "";

  if (method === "범위" && secondary) {
    return `${primary} ~ ${secondary}${suffix}`.trim();
  }
  if (method === "이상") {
    return `${primary}${suffix} 이상`.trim();
  }
  if (method === "이하") {
    return `${primary}${suffix} 이하`.trim();
  }
  if (method === "동일") {
    return `${primary}${suffix}`.trim();
  }

  return `${primary}${suffix}`.trim();
}

export function formatHardnessEntryDisplay(entry) {
  if (!entry) return "";
  const body = formatCriterionDisplay(entry);
  if (!body) return "";
  const unit = String(entry.unit ?? "").trim();
  if (!unit) return body;
  if (body.startsWith(`${unit} `)) return body;
  return `${unit} ${body}`;
}

export function formatSurfaceHardnessForCertificate(entries = []) {
  const parts = entries.map(formatHardnessEntryDisplay).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  const [primary, ...rest] = parts;
  return `${primary} (${rest.join(" · ")})`;
}

function parseRangeSpec(specText) {
  const text = String(specText ?? "").trim();
  if (!text || text === "없음") return null;
  const range = text.match(/([\d.]+)\s*[~\-]\s*([\d.]+)/);
  if (range) {
    return { value: range[1], valueTo: range[2], condition: "범위" };
  }
  const min = text.match(/([\d.]+).*?이상/);
  if (min) return { value: min[1], valueTo: "", condition: "이상" };
  const max = text.match(/([\d.]+).*?이하/);
  if (max) return { value: max[1], valueTo: "", condition: "이하" };
  return {
    value: text.replace(/\s*(mm|μm|HV|HRC|HS|HR15N).*$/i, "").trim(),
    valueTo: "",
    condition: "동일",
  };
}

function normalizeHardnessCriterionItem(item, label, defaultUnit = "HV") {
  const isCompoundLayer = item?.key === "compoundLayer";
  const resolvedDefaultUnit = isCompoundLayer ? "μm" : defaultUnit;
  const base = {
    value: "",
    valueTo: "",
    condition: "범위",
    unit: resolvedDefaultUnit,
    coreHv: "",
    corePlusOffset: "",
    disabled: true,
  };
  if (!item) {
    return { key: item?.key, label, ...base, spec: "없음" };
  }

  const structured =
    item.value != null ||
    item.condition ||
    item.judgmentMethod != null ||
    item.corePlusOffset != null ||
    item.coreHv != null ||
    item.unit != null
      ? {
          key: item.key,
          label,
          value: String(item.value ?? "").trim(),
          valueTo: String(item.valueTo ?? "").trim(),
          condition: normalizeJudgmentMethod(item.specCondition ?? item.condition ?? "범위"),
          judgmentMethod: normalizeJudgmentMethod(item.judgmentMethod ?? item.condition ?? "범위"),
          unit: resolveNormalizedCriterionUnit(item, resolvedDefaultUnit, isCompoundLayer),
          coreHv: item.coreHv ?? "",
          corePlusOffset: item.corePlusOffset ?? "",
          disabled: item.disabled === true,
        }
      : {
          ...base,
          ...parseRangeSpec(item.spec),
          disabled: item.disabled === true || item.spec === "없음",
        };

  const spec = structured.disabled
    ? "없음"
    : formatSpecOnlyDisplay({
        min: structured.value,
        max: structured.valueTo,
        unit: structured.unit,
        condition: structured.condition,
      });

  return {
    key: item.key,
    label,
    ...structured,
    spec,
  };
}

function normalizeDepthItem(item, label, options = {}) {
  const base = createEmptyDepthCriterion();
  const isCaseDepth = item?.key === "caseDepth" || label.includes("경화깊이");
  if (!item) {
    return { key: item?.key, label, ...base, spec: "", disabled: true };
  }

  const structured =
    item.value != null || item.condition || item.judgmentMethod
      ? {
          value: String(item.value ?? "").trim(),
          valueTo: String(item.valueTo ?? "").trim(),
          condition: DEPTH_SPEC_CONDITIONS.includes(item.specCondition)
            ? item.specCondition
            : DEPTH_SPEC_CONDITIONS.includes(item.condition)
              ? item.condition
              : base.condition,
          disabled: item.disabled === true,
          unit: item.unit || DEPTH_UNIT,
          judgmentMethod: isCaseDepth
            ? normalizeJudgmentMethod(item.judgmentMethod ?? "고정 HV")
            : normalizeJudgmentMethod(item.judgmentMethod ?? item.condition ?? base.condition),
          judgmentHv:
            item.judgmentHv != null
              ? String(item.judgmentHv)
              : item.fixedHv != null
                ? String(item.fixedHv)
                : String(options.defaultJudgmentHv ?? DEFAULT_CASE_DEPTH_THRESHOLD_HV),
          corePlusOffset: item.corePlusOffset ?? "",
        }
      : { ...base, ...parseRangeSpec(item.spec), disabled: item.disabled === true };

  const specDisplay = structured.disabled
    ? "없음"
    : formatSpecOnlyDisplay({
        min: structured.value,
        max: structured.valueTo,
        unit: structured.unit,
        condition: structured.condition,
      });

  return {
    key: item.key,
    label,
    ...structured,
    spec: specDisplay,
  };
}

function normalizeSurfaceEntries(spec) {
  const hardness = spec?.hardness ?? {};
  let entries = Array.isArray(hardness.surfaceEntries) ? hardness.surfaceEntries : [];

  if (entries.length === 0) {
    const legacySurface = hardness.items?.find((item) => item.key === "surface");
    if (legacySurface?.spec && legacySurface.spec !== "없음") {
      const parsed = parseRangeSpec(legacySurface.spec);
      entries = [
        {
          id: createEntryId("hs"),
          value: parsed?.value ?? legacySurface.spec,
          valueTo: parsed?.valueTo ?? "",
          condition: parsed?.condition ?? "범위",
          unit: hardness.unit || "HV",
        },
      ];
    } else {
      entries = [createEmptyHardnessEntry(hardness.unit || "HV")];
    }
  }

  return entries.slice(0, 8).map((entry) => ({
    id: entry.id || createEntryId("hs"),
    value: String(entry.value ?? "").trim(),
    valueTo: String(entry.valueTo ?? "").trim(),
    condition: SPEC_CONDITIONS.includes(entry.condition) ? entry.condition : "범위",
    unit: String(entry.unit || hardness.unit || "HV").trim().toUpperCase(),
  }));
}

export function getAvailableHardnessUnits(spec) {
  const custom = Array.isArray(spec?.hardness?.customUnits) ? spec.hardness.customUnits : [];
  return [
    ...new Set(
      [...DEFAULT_HARDNESS_UNITS, ...custom.map((unit) => String(unit).trim().toUpperCase())].filter(Boolean)
    ),
  ];
}

export function addCustomHardnessUnit(spec, unit) {
  const normalized = String(unit ?? "").trim().toUpperCase();
  if (!normalized) return spec;
  const current = getAvailableHardnessUnits(spec);
  if (current.includes(normalized)) return spec;
  return {
    ...spec,
    hardness: {
      ...spec.hardness,
      customUnits: [...(spec.hardness?.customUnits ?? []), normalized],
    },
  };
}

export function syncStructuredHardnessItems(spec) {
  const hardness = spec?.hardness ?? {};
  const surfaceEntries = normalizeSurfaceEntries(spec);
  const surfaceSpec = formatSurfaceHardnessForCertificate(surfaceEntries);

  const itemMap = Object.fromEntries((hardness.items ?? []).map((item) => [item.key, item]));

  const nextItems = [
    {
      key: "surface",
      label: "표면경도",
      spec: surfaceSpec || itemMap.surface?.spec || "",
      disabled: !surfaceEntries.some((entry) => formatHardnessEntryDisplay(entry)),
    },
    normalizeDepthItem(
      { key: "caseDepth", ...(itemMap.caseDepth ?? {}), disabled: itemMap.caseDepth?.disabled ?? true },
      "경화깊이 기준",
      { defaultJudgmentHv: DEFAULT_CASE_DEPTH_THRESHOLD_HV }
    ),
    normalizeDepthItem(
      itemMap.effectiveDepth ?? { key: "effectiveDepth", disabled: false },
      "유효경화깊이 기준"
    ),
    normalizeHardnessCriterionItem(
      itemMap.compoundLayer ?? { key: "compoundLayer", disabled: true, unit: "μm" },
      "화합물층",
      itemMap.compoundLayer?.unit && COMPOUND_LAYER_UNITS.includes(itemMap.compoundLayer.unit)
        ? itemMap.compoundLayer.unit
        : "μm"
    ),
  ];

  const synced = {
    ...spec,
    hardness: {
      ...hardness,
      enabled: hardness.enabled !== false,
      unit: surfaceEntries[0]?.unit || hardness.unit || "HV",
      customUnits: getAvailableHardnessUnits(spec).filter((unit) => !DEFAULT_HARDNESS_UNITS.includes(unit)),
      surfaceEntries,
      items: nextItems,
    },
  };

  return syncHeatTreatmentFromCriteria(synced);
}

export function normalizeInspectionCriteriaSpec(spec) {
  if (!spec) return spec;
  return syncStructuredHardnessItems(spec);
}

export function getInspectionCriteriaSummary(spec) {
  if (!spec) return "—";
  const normalized = normalizeInspectionCriteriaSpec(spec);
  if (!normalized) return "—";
  const parts = [];
  const surface = formatSurfaceHardnessForCertificate(normalized.hardness?.surfaceEntries ?? []);
  if (surface) parts.push(surface);
  const caseDepth = normalized.hardness?.items?.find((item) => item.key === "caseDepth");
  const effective = normalized.hardness?.items?.find((item) => item.key === "effectiveDepth");
  if (caseDepth?.spec && caseDepth.spec !== "없음") parts.push(caseDepth.spec);
  if (effective?.spec && effective.spec !== "없음") parts.push(effective.spec);
  return parts.length ? parts.join(" · ") : "—";
}

/** 검사기준 탭 — 읽기 전용 상세 항목 (미등록 시 기본값) */
export const EMPTY_INSPECTION_CRITERIA_DETAIL_LINES = [
  { label: "표면경도 기준", value: "—" },
  { label: "경화깊이 기준", value: "—" },
  { label: "유효경화깊이 기준", value: "—" },
  { label: "화합물층", value: "—" },
  { label: "조직", value: "—" },
  { label: "치수", value: "—" },
  { label: "기타 검사기준", value: "—" },
];

/** 검사기준 탭 — 읽기 전용 상세 항목 */
export function getInspectionCriteriaDetailLines(spec) {
  if (!spec) return EMPTY_INSPECTION_CRITERIA_DETAIL_LINES;

  const normalized = normalizeInspectionCriteriaSpec(spec);
  if (!normalized) return EMPTY_INSPECTION_CRITERIA_DETAIL_LINES;

  const hardness = normalized.hardness ?? {};
  const surface = formatSurfaceHardnessForCertificate(hardness.surfaceEntries ?? []);
  const items = hardness.items ?? [];
  const caseDepth = items.find((item) => item.key === "caseDepth");
  const effectiveDepth = items.find((item) => item.key === "effectiveDepth");
  const compoundLayer = items.find((item) => item.key === "compoundLayer");
  const microEnabled = normalized.microstructure?.enabled === true;
  const microPhotoCount = (normalized.microstructure?.referencePhotos ?? []).filter(Boolean).length;
  const dimensionParts = [];

  if (normalized.dimension?.enabled !== false) {
    (normalized.dimension?.items ?? [])
      .map((item) => (item.label && item.spec ? `${item.label}: ${item.spec}` : item.spec))
      .filter(Boolean)
      .forEach((item) => dimensionParts.push(item));
  }

  const otherParts = [];
  if (normalized.appearance?.enabled !== false) {
    otherParts.push("외관 검사");
  }
  if (normalized.other?.enabled && normalized.other?.note) {
    otherParts.push(normalized.other.note);
  }

  return [
    { label: "표면경도 기준", value: surface || "—" },
    {
      label: "경화깊이 기준",
      value: caseDepth?.disabled || !caseDepth?.spec || caseDepth.spec === "없음" ? "—" : caseDepth.spec,
    },
    {
      label: "유효경화깊이 기준",
      value:
        effectiveDepth?.disabled || !effectiveDepth?.spec || effectiveDepth.spec === "없음"
          ? "—"
          : effectiveDepth.spec,
    },
    {
      label: "화합물층",
      value:
        compoundLayer?.disabled || !compoundLayer?.spec || compoundLayer.spec === "없음"
          ? "—"
          : compoundLayer.spec,
    },
    { label: "조직", value: microEnabled ? (microPhotoCount ? `조직사진 ${microPhotoCount}장` : "조직사진 사용") : "—" },
    { label: "치수", value: dimensionParts.length ? dimensionParts.join(" · ") : "—" },
    { label: "기타 검사기준", value: otherParts.length ? otherParts.join(" · ") : "—" },
  ];
}

export function mergeInspectionSpecification(baseSpec, inspectionSpec) {
  if (!inspectionSpec) return baseSpec;
  return normalizeInspectionCriteriaSpec({
    ...baseSpec,
    ...inspectionSpec,
    hardness: {
      ...(baseSpec?.hardness ?? {}),
      ...(inspectionSpec.hardness ?? {}),
    },
    appearance: inspectionSpec.appearance ?? baseSpec?.appearance,
    dimension: inspectionSpec.dimension ?? baseSpec?.dimension,
    microstructure: inspectionSpec.microstructure ?? baseSpec?.microstructure,
    other: inspectionSpec.other ?? baseSpec?.other,
    heatTreatment: inspectionSpec.heatTreatment ?? baseSpec?.heatTreatment,
    hardeningDepth: inspectionSpec.hardeningDepth ?? baseSpec?.hardeningDepth,
  });
}
