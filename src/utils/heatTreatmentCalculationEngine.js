/**
 * Project TITAN V1.0 — Heat Treatment Calculation Engine
 * 업체+품번 Default Specification 기준 · 자동계산 → 검사자 수정 → 최종 적용 · 이력 저장
 */

import { calculateHardeningDepthMetricsFromRows } from "./hardeningDepthModel";
import {
  CERTIFICATE_OUTPUT_MODES,
  getCertificateOutputFields,
  getHeatTreatmentConfig,
} from "./productSpecificationModel";

export const DEPTH_FIELD_KEYS = [
  "effectiveDepth",
  "caseDepth",
  "grindingAllowance",
  "afterGrindingDepth",
];

export const DEPTH_FIELD_LABELS = {
  effectiveDepth: "유효경화깊이",
  caseDepth: "경화깊이",
  grindingAllowance: "연마여유",
  afterGrindingDepth: "연마 후 경화깊이",
};

const CASE_DEPTH_THRESHOLD_HV = 390;

function round2(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(2));
}

function createFieldHistory(autoValue, editedValue) {
  const auto = round2(autoValue);
  const edited =
    editedValue != null && editedValue !== "" && !Number.isNaN(Number(editedValue))
      ? round2(editedValue)
      : null;
  return {
    auto,
    edited,
    final: edited ?? auto,
  };
}

/** 경화곡선 CORE 행 또는 경도검사 심부경도 측정값에서 심부경도(HV) 추출 */
export function resolveCoreHardnessHv(rows = [], hardnessRows = []) {
  const coreRow = rows.find((row) => row.isCore);
  if (coreRow && coreRow.hv !== "" && Number(coreRow.hv) > 0) {
    return Number(coreRow.hv);
  }

  const coreMeasure = hardnessRows.find((row) => row.key === "core" || row.item === "심부경도");
  if (coreMeasure) {
    const raw = coreMeasure.measuredRaw ?? coreMeasure.measured;
    const value = Number(String(raw).replace(/[^\d.-]/g, ""));
    if (!Number.isNaN(value) && value > 0) return value;
  }

  return null;
}

/** 유효경화깊이 계산 기준에 따른 HV 임계값 */
export function resolveEffectiveDepthThreshold(heatTreatment, coreHv) {
  const config = getHeatTreatmentConfig(heatTreatment);

  switch (config.effectiveDepthBasis) {
    case "specifiedHv":
      return config.specifiedHv > 0 ? config.specifiedHv : CASE_DEPTH_THRESHOLD_HV;
    case "corePlus50":
      return coreHv != null ? coreHv + 50 : null;
    case "hv390":
    default:
      return CASE_DEPTH_THRESHOLD_HV;
  }
}

export function getEffectiveDepthBasisLabel(heatTreatment) {
  const config = getHeatTreatmentConfig(heatTreatment);
  switch (config.effectiveDepthBasis) {
    case "specifiedHv":
      return `지정 ${config.specifiedHv}HV 기준`;
    case "corePlus50":
      return "심부경도 +50HV 기준";
    case "hv390":
    default:
      return "390HV 기준";
  }
}

/**
 * @param {{ rows?: array, heatTreatment?: object, hardnessRows?: array, edits?: object }} params
 * edits: { effectiveDepth?, caseDepth?, grindingAllowance?, afterGrindingDepth? } 검사자 수정값
 */
export function calculateHeatTreatmentCalculations({
  rows = [],
  heatTreatment,
  hardnessRows = [],
  edits = {},
}) {
  const config = getHeatTreatmentConfig(heatTreatment);
  const coreHv = resolveCoreHardnessHv(rows, hardnessRows);
  const effectiveThreshold = resolveEffectiveDepthThreshold(config, coreHv);

  const effectiveMetrics =
    effectiveThreshold != null
      ? calculateHardeningDepthMetricsFromRows(rows, effectiveThreshold)
      : { effectiveDepthMm: null };

  const caseMetrics = calculateHardeningDepthMetricsFromRows(rows, CASE_DEPTH_THRESHOLD_HV);

  const autoEffective = effectiveMetrics.effectiveDepthMm;
  const autoCase = caseMetrics.hardeningDepth390;
  const autoGrinding = config.grindingAllowanceMm ?? 0.15;

  const caseFinal = edits.caseDepth ?? autoCase;
  const grindingFinal = edits.grindingAllowance ?? autoGrinding;
  const autoAfterGrinding =
    caseFinal != null && grindingFinal != null ? round2(caseFinal - grindingFinal) : null;

  return {
    effectiveDepth: createFieldHistory(autoEffective, edits.effectiveDepth),
    caseDepth: createFieldHistory(autoCase, edits.caseDepth),
    grindingAllowance: createFieldHistory(autoGrinding, edits.grindingAllowance),
    afterGrindingDepth: createFieldHistory(autoAfterGrinding, edits.afterGrindingDepth),
    meta: {
      effectiveThresholdHv: effectiveThreshold,
      caseDepthThresholdHv: CASE_DEPTH_THRESHOLD_HV,
      coreHv,
      effectiveDepthBasis: config.effectiveDepthBasis,
      specifiedHv: config.specifiedHv,
      certificateOutputMode: config.certificateOutputMode,
      calculatedAt: new Date().toISOString(),
    },
  };
}

export function syncHeatTreatmentCalculations(report) {
  const heatTreatment = report.appliedSpecification?.heatTreatment;
  return calculateHeatTreatmentCalculations({
    rows: report.hardeningDepthRows || [],
    heatTreatment,
    hardnessRows: report.hardnessRows || [],
    edits: report.heatTreatmentEdits || {},
  });
}

export function applyHeatTreatmentFieldEdit(report, fieldKey, rawValue) {
  if (!DEPTH_FIELD_KEYS.includes(fieldKey)) return report;

  const trimmed = String(rawValue ?? "").trim();
  const nextEdits = { ...(report.heatTreatmentEdits || {}) };

  if (trimmed === "") {
    delete nextEdits[fieldKey];
  } else {
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return report;
    nextEdits[fieldKey] = parsed;
  }

  return {
    ...report,
    heatTreatmentEdits: nextEdits,
  };
}

/** 성적서·리포트 출력용 깊이 항목 (업체별 출력 방식 반영) */
export function getReportDepthOutputRows(calculations, heatTreatment) {
  if (!calculations) return [];

  const config = getHeatTreatmentConfig(heatTreatment);
  const fields = getCertificateOutputFields(config.certificateOutputMode);
  const rows = [];

  if (fields.effectiveDepth && calculations.effectiveDepth?.final != null) {
    rows.push({
      key: "effectiveDepth",
      label: DEPTH_FIELD_LABELS.effectiveDepth,
      value: calculations.effectiveDepth.final,
      unit: "mm",
    });
  }
  if (fields.caseDepth && calculations.caseDepth?.final != null) {
    rows.push({
      key: "caseDepth",
      label: DEPTH_FIELD_LABELS.caseDepth,
      value: calculations.caseDepth.final,
      unit: "mm",
    });
  }
  if (fields.grindingAllowance && calculations.grindingAllowance?.final != null) {
    rows.push({
      key: "grindingAllowance",
      label: DEPTH_FIELD_LABELS.grindingAllowance,
      value: calculations.grindingAllowance.final,
      unit: "mm",
    });
  }
  if (fields.afterGrindingDepth && calculations.afterGrindingDepth?.final != null) {
    rows.push({
      key: "afterGrindingDepth",
      label: DEPTH_FIELD_LABELS.afterGrindingDepth,
      value: calculations.afterGrindingDepth.final,
      unit: "mm",
    });
  }

  return rows;
}

export function formatDepthMm(value) {
  if (value == null || Number.isNaN(Number(value))) return "";
  return Number(value).toFixed(2);
}

export { CERTIFICATE_OUTPUT_MODES, getCertificateOutputFields };
