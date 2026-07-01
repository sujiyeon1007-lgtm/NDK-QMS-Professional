/**
 * Project TITAN V1.0 — 제품별 검사기준 (경도 · 깊이 스펙) 모델
 */

export const SPEC_CONDITIONS = ["이상", "이하", "범위", "동일"];

export const DEFAULT_HARDNESS_UNITS = ["HV", "HRC", "HS", "HR15N"];

const DEPTH_UNIT = "mm";

function createEntryId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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

export function formatCriterionDisplay({ value, valueTo, condition, unit = "" } = {}) {
  const primary = String(value ?? "").trim();
  const secondary = String(valueTo ?? "").trim();
  const suffix = unit ? ` ${unit}` : "";

  if (!primary) return "";

  if (condition === "범위" && secondary) {
    return `${primary} ~ ${secondary}${suffix}`.trim();
  }
  if (condition === "이상") {
    return `${primary}${suffix} 이상`.trim();
  }
  if (condition === "이하") {
    return `${primary}${suffix} 이하`.trim();
  }
  if (condition === "동일") {
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

function normalizeDepthItem(item, label) {
  const base = createEmptyDepthCriterion();
  if (!item) {
    return { key: item?.key, label, ...base, spec: "", disabled: true };
  }

  const structured =
    item.value != null || item.condition
      ? {
          value: item.value ?? "",
          valueTo: item.valueTo ?? "",
          condition: SPEC_CONDITIONS.includes(item.condition) ? item.condition : base.condition,
          disabled: item.disabled === true,
          unit: item.unit || DEPTH_UNIT,
        }
      : { ...base, ...parseRangeSpec(item.spec), disabled: item.disabled === true };

  const spec = structured.disabled ? "없음" : formatCriterionDisplay(structured);

  return {
    key: item.key,
    label,
    ...structured,
    spec,
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
    normalizeDepthItem(itemMap.caseDepth ?? { key: "caseDepth", disabled: true }, "경화깊이 기준"),
    normalizeDepthItem(
      itemMap.effectiveDepth ?? { key: "effectiveDepth", disabled: false },
      "유효경화깊이 기준"
    ),
    {
      key: "compoundLayer",
      label: "화합물층",
      spec: itemMap.compoundLayer?.spec ?? "",
      disabled: itemMap.compoundLayer?.disabled === true || itemMap.compoundLayer?.spec === "없음",
    },
    {
      key: "core",
      label: "심부경도",
      spec: itemMap.core?.spec ?? "",
      disabled: itemMap.core?.disabled === true || itemMap.core?.spec === "없음",
    },
  ];

  return {
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
  const microEnabled = normalized.microstructure?.enabled !== false;
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
    { label: "조직", value: microEnabled ? "검사" : "—" },
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
