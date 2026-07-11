/**
 * Project TITAN V1.0 — 검사 항목 사용 범위 (Optional Inspection Scope)
 */

import { cloneSpecification, normalizeSpecification, INSPECTION_HARDNESS_EXCLUDED_KEYS } from "./productSpecificationModel";
import { evaluateMeasurement } from "./specJudgment";
import { resolveCriterionItemUnit } from "./inspectionCriteriaModel";
import {
  formatDepthMm,
  getCaseDepthBasisShortLabel,
  getEffectiveDepthBasisShortLabel,
} from "./heatTreatmentCalculationEngine";

/** 검사등록 메인 결과 테이블 행 순서 (항목당 1행) */
const MAIN_RESULT_ROW_ORDER = [
  { kind: "hardness", key: "surface" },
  { kind: "effectiveDepth" },
  { kind: "caseDepth" },
  { kind: "hardness", key: "compoundLayer" },
  { kind: "appearance" },
  { kind: "dimension" },
  { kind: "microstructure" },
];

function findManualHardnessRow(report, key) {
  return (report.hardnessRows || []).find(
    (row) => row.key === key && !row.autoCalculated
  );
}

function buildHardnessSummaryRow(report, key, spec) {
  const row = findManualHardnessRow(report, key);
  if (!row) return null;

  const measured = row.measuredRaw ?? row.measured ?? "";
  const unit = row.unit || resolveCriterionItemUnit(key, row, spec?.hardness?.unit || "HV");
  const result = measured
    ? `${measured}${unit === "HV" ? "HV" : ` ${unit}`}`.replace(/\s+/g, " ").trim()
    : "";

  return {
    key: row.key,
    item: row.item,
    spec: row.spec || "—",
    basis: "—",
    result,
    resultRaw: measured,
    judgment: row.judgment || evaluateMeasurement(row.spec, measured),
    inputType: "hardness",
    hardnessKey: row.key,
  };
}

function buildEffectiveDepthSummaryRow(report, scope, spec, heatCalcs) {
  const effectiveItem = spec?.hardness?.items?.find((item) => item.key === "effectiveDepth");
  const hasEffectiveSpec =
    effectiveItem &&
    !effectiveItem.disabled &&
    effectiveItem.spec &&
    effectiveItem.spec !== "없음";

  if (!hasEffectiveSpec || (!scope.hardeningDepth && !scope.hardness)) return null;

  const depthValue = heatCalcs?.effectiveDepth?.final ?? report.effectiveDepthMm;
  const basis = spec?.heatTreatment
    ? getEffectiveDepthBasisShortLabel(spec.heatTreatment)
    : "—";
  const measured = depthValue != null ? formatDepthMm(depthValue) : "";
  const result = measured ? `${measured}mm` : "";

  return {
    key: "effectiveDepth",
    item: "유효경화깊이",
    spec: effectiveItem.spec,
    basis,
    result,
    resultRaw: measured,
    judgment: measured ? evaluateMeasurement(effectiveItem.spec, measured) : "—",
    inputType: "readonly",
  };
}

function buildCaseDepthSummaryRow(report, scope, spec, heatCalcs) {
  if (!scope.hardeningDepth && !scope.hardness) return null;

  const depthValue = heatCalcs?.caseDepth?.final ?? report.hardeningDepth390;
  if (depthValue == null && !scope.hardeningDepth) return null;

  const caseThreshold = heatCalcs?.meta?.caseDepthThresholdHv;
  const basis = getCaseDepthBasisShortLabel(caseThreshold);
  const measured = depthValue != null ? formatDepthMm(depthValue) : "";
  const result = measured ? `${measured}mm` : "";
  const caseItem = spec?.hardness?.items?.find((item) => item.key === "caseDepth");
  const caseSpec =
    caseItem?.spec && caseItem.spec !== "없음" && !caseItem.disabled ? caseItem.spec : "—";

  let judgment = "—";
  if (measured) {
    judgment =
      caseSpec !== "—"
        ? evaluateMeasurement(caseSpec, measured)
        : "합격";
  }

  return {
    key: "caseDepth",
    item: "경화깊이",
    spec: caseSpec,
    basis,
    result,
    resultRaw: measured,
    judgment,
    inputType: "readonly",
  };
}

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

/**
 * 검사등록 — 메인 결과 테이블 (항목당 1행 · 최종 판정만)
 * @returns {Array<{ key, item, spec, basis, result, resultRaw, judgment, inputType, hardnessKey? }>}
 */
export function buildMainInspectionResultRows(report, scope) {
  const spec = report.appliedSpecification;
  const heatCalcs = report.heatTreatmentCalculations;
  const rows = [];
  const usedKeys = new Set();

  MAIN_RESULT_ROW_ORDER.forEach((entry) => {
    if (entry.kind === "hardness") {
      if (!scope.hardness) return;
      const row = buildHardnessSummaryRow(report, entry.key, spec);
      if (row) {
        rows.push(row);
        usedKeys.add(entry.key);
      }
      return;
    }

    if (entry.kind === "effectiveDepth") {
      const row = buildEffectiveDepthSummaryRow(report, scope, spec, heatCalcs);
      if (row) rows.push(row);
      return;
    }

    if (entry.kind === "caseDepth") {
      const row = buildCaseDepthSummaryRow(report, scope, spec, heatCalcs);
      if (row) rows.push(row);
      return;
    }

    if (entry.kind === "appearance" && scope.appearance) {
      const appSummary = report.appearanceSummary || "—";
      const hasDefect = (report.appearanceRows || []).some((row) => row.result === "불량");
      rows.push({
        key: "appearance",
        item: "외관",
        spec: "이상 없음",
        basis: "—",
        result: hasDefect ? "불량" : appSummary === "—" ? "—" : "양호",
        resultRaw: hasDefect ? "불량" : "양호",
        judgment: appSummary,
        inputType: "appearance",
      });
      return;
    }

    if (entry.kind === "dimension" && scope.dimension) {
      const dimSummary = report.dimensionSummary || "—";
      rows.push({
        key: "dimension",
        item: "치수",
        spec: "도면 기준",
        basis: "—",
        result: dimSummary === "합격" ? "적합" : dimSummary === "불합격" ? "부적합" : "—",
        resultRaw: "",
        judgment: dimSummary,
        inputType: "dimension",
      });
      return;
    }

    if (entry.kind === "microstructure" && scope.microstructure) {
      const photos = report.microstructurePhotos || [];
      const hasAttachment = photos.some((photo) => Boolean(photo));
      rows.push({
        key: "microstructure",
        item: "조직",
        spec: "확인",
        basis: "—",
        result: hasAttachment ? "첨부" : report.hasMicrostructurePhoto ? "—" : "미실시",
        resultRaw: "",
        judgment: report.hasMicrostructurePhoto ? report.microstructureSummary || "—" : "—",
        inputType: "microstructure",
        hasAttachment,
      });
    }
  });

  if (scope.hardness) {
    const manualRows = (report.hardnessRows || []).filter(
      (row) =>
        !row.autoCalculated &&
        !INSPECTION_HARDNESS_EXCLUDED_KEYS.includes(row.key) &&
        !usedKeys.has(row.key)
    );
    manualRows.forEach((row, index) => {
      const measured = row.measuredRaw ?? row.measured ?? "";
      const unit = row.unit || resolveCriterionItemUnit(row.key, row, spec?.hardness?.unit || "HV");
      const result = measured
        ? `${measured}${unit === "HV" ? "HV" : ` ${unit}`}`.replace(/\s+/g, " ").trim()
        : "";
      rows.push({
        key: row.key || `hardness-${index}`,
        item: row.item,
        spec: row.spec || "—",
        basis: "—",
        result,
        resultRaw: measured,
        judgment: row.judgment || evaluateMeasurement(row.spec, measured),
        inputType: "hardness",
        hardnessKey: row.key,
      });
    });
  }

  return rows;
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

  const resolveUnit = (key, unit, item) => {
    if (key === "compoundLayer" && item?.unit) return item.unit;
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
        .filter(
          (item) =>
            !item.disabled &&
            item.spec &&
            item.spec !== "없음" &&
            !INSPECTION_HARDNESS_EXCLUDED_KEYS.includes(item.key)
        )
        .map((item) => ({
          key: item.key,
          item: item.label,
          spec: item.spec,
          measured: "",
          measuredRaw: "",
          unit: resolveUnit(item.key, hardnessUnit, item),
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
          unit: resolveUnit(item.key, hardnessUnit, item),
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
