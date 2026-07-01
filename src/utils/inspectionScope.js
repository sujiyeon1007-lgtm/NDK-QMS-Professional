/**
 * Project TITAN V1.0 — 검사 항목 사용 범위 (Optional Inspection Scope)
 */

import { cloneSpecification, normalizeSpecification } from "./productSpecificationModel";

export function getInspectionScope(spec) {
  const normalized = spec ? normalizeSpecification(spec) : null;
  return {
    appearance: Boolean(normalized?.appearance?.enabled),
    hardness: Boolean(normalized?.hardness?.enabled),
    hardeningDepth: Boolean(normalized?.hardeningDepth?.enabled),
    dimension: Boolean(normalized?.dimension?.enabled),
    microstructure: Boolean(normalized?.microstructure?.enabled),
    other: Boolean(normalized?.other?.enabled),
  };
}

export function buildScopedResultSummary(report, scope) {
  const rows = [];

  if (scope.appearance) {
    rows.push({
      category: "외관검사",
      result: report.appearanceSummary || "—",
      note: "—",
    });
  }
  if (scope.hardness) {
    rows.push({
      category: "경도검사",
      result: report.hardnessSummary || "—",
      note: "—",
    });
  }
  if (scope.dimension) {
    rows.push({
      category: "치수검사",
      result: report.dimensionSummary || "—",
      note: "—",
    });
  }
  if (scope.microstructure) {
    rows.push({
      category: "조직검사",
      result: report.hasMicrostructurePhoto ? report.microstructureSummary || "—" : "—",
      note: report.hasMicrostructurePhoto ? "—" : "미실시",
    });
  }
  if (scope.other) {
    rows.push({
      category: "기타검사",
      result: "—",
      note: report.appliedSpecification?.other?.note || "—",
    });
  }

  return rows;
}

export function computeFinalJudgmentFromScope(report, scope) {
  const summaries = [];

  if (scope.appearance && report.appearanceSummary && report.appearanceSummary !== "—") {
    summaries.push(report.appearanceSummary);
  }
  if (scope.hardness && report.hardnessSummary && report.hardnessSummary !== "—") {
    summaries.push(report.hardnessSummary);
  }
  if (scope.dimension && report.dimensionSummary && report.dimensionSummary !== "—") {
    summaries.push(report.dimensionSummary);
  }
  if (
    scope.microstructure &&
    report.hasMicrostructurePhoto &&
    report.microstructureSummary &&
    report.microstructureSummary !== "—"
  ) {
    summaries.push(report.microstructureSummary);
  }

  if (summaries.length === 0) return "합격";
  return summaries.some((value) => value === "불합격") ? "불합격" : "합격";
}

export function updateSpecificationSection(spec, section, patch) {
  const base = normalizeSpecification(spec);
  return cloneSpecification({
    ...base,
    [section]: {
      ...base[section],
      ...patch,
    },
  });
}

export function rebuildRowsFromSpecification(spec) {
  const normalized = normalizeSpecification(spec);
  const scope = getInspectionScope(normalized);

  const APPEARANCE_LABELS = {
    dent: "찍힘",
    color: "색상 이상",
    stain: "얼룩",
    other: "기타",
  };

  const APPEARANCE_STANDARDS = {
    dent: "없어야 함",
    color: "없어야 함",
    stain: "없어야 함",
    other: "없어야 함",
  };

  const HARDNESS_UNIT_BY_KEY = {
    surface: "hardnessUnit",
    caseDepth: "mm",
    effectiveDepth: "mm",
    compoundLayer: "μm",
    core: "hardnessUnit",
  };

  const resolveUnit = (key, unit) => {
    const mapped = HARDNESS_UNIT_BY_KEY[key];
    if (mapped === "hardnessUnit") return unit;
    return mapped || unit;
  };

  const hardnessUnit = normalized.hardness?.unit || "HV";

  const appearanceRows = scope.appearance
    ? normalized.appearance.items
        .filter((item) => item.enabled)
        .map((item) => ({
          key: item.key,
          item: APPEARANCE_LABELS[item.key] || item.label,
          standard: APPEARANCE_STANDARDS[item.key] || "없어야 함",
          result: "양호",
          judgment: "합격",
        }))
    : [];

  const hardnessRows = scope.hardness
    ? normalized.hardness.items
        .filter((item) => !item.disabled && item.spec && item.spec !== "없음")
        .map((item) => ({
          key: item.key,
          item: item.label,
          spec: item.spec,
          measured: "",
          measuredRaw: "",
          unit: resolveUnit(item.key, hardnessUnit),
          judgment: "—",
          note: "",
        }))
    : [];

  const dimensionRows = scope.dimension
    ? normalized.dimension.items
        .filter((item) => item.label && item.spec)
        .map((item) => ({
          id: item.id,
          item: item.label,
          spec: item.spec,
          measured: "",
          measuredRaw: "",
          unit: normalized.dimension.unit || "mm",
          judgment: "—",
          note: "",
        }))
    : [];

  const specifications = [];
  if (scope.hardness) {
    normalized.hardness.items
      .filter((item) => !item.disabled && item.spec && item.spec !== "없음")
      .forEach((item) => {
        specifications.push({
          item: item.label,
          spec: item.spec,
          unit: resolveUnit(item.key, hardnessUnit),
          note: "—",
        });
      });
  }
  if (scope.dimension) {
    normalized.dimension.items
      .filter((item) => item.label && item.spec)
      .forEach((item) => {
        specifications.push({
          item: item.label,
          spec: item.spec,
          unit: normalized.dimension.unit || "mm",
          note: "—",
        });
      });
  }

  const otherRows = scope.other
    ? [{ item: "기타", result: "—", note: normalized.other.note || "—" }]
    : [];

  return {
    appearanceRows,
    hardnessRows,
    dimensionRows,
    specifications,
    otherRows,
    hasMicrostructurePhoto: scope.microstructure ? false : false,
    hardeningDepthRows: scope.hardeningDepth ? undefined : [],
    hardeningDepthHv: scope.hardeningDepth ? undefined : [],
  };
}
