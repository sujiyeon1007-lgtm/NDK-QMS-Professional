/**
 * Project TITAN V1.0 — Heat Treatment Calculation Engine
 * 업체+품번 Default Specification 기준 · 자동계산 → 검사자 수정 → 최종 적용 · 이력 저장
 */

import { getHardeningDepthChartPoints } from "./hardeningDepthModel";
import {
  resolveCaseDepthThresholdHv,
} from "./inspectionCriteriaModel";
import {
  CERTIFICATE_OUTPUT_MODES,
  getCertificateOutputFields,
  getHeatTreatmentConfig,
} from "./productSpecificationModel";

export const DEPTH_CALC_UNAVAILABLE = "계산 불가";

export const DEPTH_CALC_STATUS = {
  OK: "ok",
  EXACT: "exact",
  UNBRACKETED: "unbracketed",
  INSUFFICIENT: "insufficient",
  INVALID_ORDER: "invalid_order",
};

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
const DEFAULT_DEPTH_DECIMAL_PLACES = 2;

function roundDepth(value, decimalPlaces = DEFAULT_DEPTH_DECIMAL_PLACES) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(decimalPlaces));
}

function round2(value) {
  return roundDepth(value, DEFAULT_DEPTH_DECIMAL_PLACES);
}

function resolveDepthDecimalPlaces(heatTreatment) {
  const config = getHeatTreatmentConfig(heatTreatment);
  const places = Number(config.depthDecimalPlaces);
  if (!Number.isNaN(places) && places >= 0 && places <= 4) return places;
  return DEFAULT_DEPTH_DECIMAL_PLACES;
}

/**
 * 직선보간법 — threshold를 bracket하는 인접 (거리, HV) 두 점 사이에서 깊이 계산.
 * depth = x1 + (threshold - y1) * (x2 - x1) / (y2 - y1)
 */
export function interpolateDepthAtThreshold(points = [], threshold, options = {}) {
  const decimalPlaces = options.decimalPlaces ?? DEFAULT_DEPTH_DECIMAL_PLACES;

  if (threshold == null || !Number.isFinite(Number(threshold))) {
    return {
      depth: null,
      status: DEPTH_CALC_STATUS.UNBRACKETED,
      message: DEPTH_CALC_UNAVAILABLE,
    };
  }

  const hvThreshold = Number(threshold);
  const valid = (Array.isArray(points) ? points : []).filter(
    (point) =>
      !point.isCore &&
      point.depthNum != null &&
      Number.isFinite(point.depthNum) &&
      point.hv > 0
  );

  if (valid.length < 2) {
    return {
      depth: null,
      status: DEPTH_CALC_STATUS.INSUFFICIENT,
      message: "측정 데이터가 부족합니다.",
    };
  }

  for (let i = 1; i < valid.length; i += 1) {
    if (valid[i].depthNum <= valid[i - 1].depthNum) {
      return {
        depth: null,
        status: DEPTH_CALC_STATUS.INVALID_ORDER,
        message: "거리(mm) 순서가 올바르지 않습니다.",
      };
    }
  }

  for (const point of valid) {
    if (point.hv === hvThreshold) {
      return {
        depth: roundDepth(point.depthNum, decimalPlaces),
        status: DEPTH_CALC_STATUS.EXACT,
      };
    }
  }

  for (let i = 1; i < valid.length; i += 1) {
    const x1 = valid[i - 1].depthNum;
    const y1 = valid[i - 1].hv;
    const x2 = valid[i].depthNum;
    const y2 = valid[i].hv;
    const crosses =
      (y1 >= hvThreshold && y2 <= hvThreshold) || (y1 <= hvThreshold && y2 >= hvThreshold);

    if (crosses && y1 !== y2) {
      const depth = x1 + ((hvThreshold - y1) * (x2 - x1)) / (y2 - y1);
      return {
        depth: roundDepth(depth, decimalPlaces),
        status: DEPTH_CALC_STATUS.OK,
      };
    }
  }

  return {
    depth: null,
    status: DEPTH_CALC_STATUS.UNBRACKETED,
    message: DEPTH_CALC_UNAVAILABLE,
  };
}

export function calculateDepthAtThresholdFromRows(rows = [], threshold, options = {}) {
  const points = getHardeningDepthChartPoints(rows);
  return interpolateDepthAtThreshold(points, threshold, options);
}

function createFieldHistory(autoValue, editedValue, calcMeta = {}) {
  const auto = round2(autoValue);
  const edited =
    editedValue != null && editedValue !== "" && !Number.isNaN(Number(editedValue))
      ? round2(editedValue)
      : null;
  return {
    auto,
    edited,
    final: edited ?? auto,
    calcStatus: calcMeta.status ?? null,
    calcMessage: auto == null ? calcMeta.message ?? null : null,
  };
}

/** 경화곡선 CORE 행 · 검사 심부경도 입력 · report.coreHardnessHv 에서 심부경도(HV) 추출 */
export function resolveCoreHardnessHv(rows = [], hardnessRows = [], coreHardnessHv = null) {
  const directCore = Number(coreHardnessHv);
  if (!Number.isNaN(directCore) && directCore > 0) return directCore;

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

/** 경화깊이 판정 기준 HV — 유효경화깊이 basis와 분리 */
export function resolveCaseDepthThreshold(heatTreatment, appliedSpecification) {
  if (appliedSpecification) {
    return resolveCaseDepthThresholdHv(appliedSpecification);
  }
  const config = getHeatTreatmentConfig(heatTreatment);
  if (config.caseDepthThresholdHv > 0) return config.caseDepthThresholdHv;
  return CASE_DEPTH_THRESHOLD_HV;
}

export function getCaseDepthBasisLabel(thresholdHv) {
  const hv = Number(thresholdHv);
  if (!Number.isNaN(hv) && hv > 0) return `${hv}HV 기준`;
  return `${CASE_DEPTH_THRESHOLD_HV}HV 기준`;
}

/** 메인 검사결과 테이블 — 경화깊이 기준 열 짧은 표기 (HV390) */
export function getCaseDepthBasisShortLabel(thresholdHv) {
  const hv = Number(thresholdHv);
  if (!Number.isNaN(hv) && hv > 0) return `HV${hv}`;
  return `HV${CASE_DEPTH_THRESHOLD_HV}`;
}

/** 유효경화깊이 계산 기준에 따른 HV 임계값 — measuredCore는 검사 등록 시 측정값만 사용 */
export function resolveEffectiveDepthThreshold(heatTreatment, measuredCoreHv) {
  const config = getHeatTreatmentConfig(heatTreatment);

  switch (config.effectiveDepthBasis) {
    case "specifiedHv":
      return config.specifiedHv > 0 ? config.specifiedHv : CASE_DEPTH_THRESHOLD_HV;
    case "corePlus50": {
      const offset = config.corePlusOffset > 0 ? config.corePlusOffset : 50;
      if (measuredCoreHv != null && measuredCoreHv > 0) {
        return measuredCoreHv + offset;
      }
      return null;
    }
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
    case "corePlus50": {
      const offset = config.corePlusOffset > 0 ? config.corePlusOffset : 50;
      return `심부경도 +${offset}HV 기준`;
    }
    case "hv390":
    default:
      return "390HV 기준";
  }
}

/** 메인 검사결과 테이블 — 기준 열 짧은 표기 (HV550 · HV513 · Core+50) */
export function getEffectiveDepthBasisShortLabel(heatTreatment) {
  const config = getHeatTreatmentConfig(heatTreatment);
  switch (config.effectiveDepthBasis) {
    case "specifiedHv":
      return config.specifiedHv > 0 ? `HV${config.specifiedHv}` : "HV390";
    case "corePlus50": {
      const offset = config.corePlusOffset > 0 ? config.corePlusOffset : 50;
      return `Core+${offset}`;
    }
    case "hv390":
    default:
      return "HV390";
  }
}

/**
 * @param {{ rows?: array, heatTreatment?: object, hardnessRows?: array, edits?: object, appliedSpecification?: object, coreHardnessHv?: number|string }} params
 * edits: { effectiveDepth?, caseDepth?, grindingAllowance?, afterGrindingDepth? } 검사자 수정값
 */
export function calculateHeatTreatmentCalculations({
  rows = [],
  heatTreatment,
  hardnessRows = [],
  edits = {},
  appliedSpecification = null,
  coreHardnessHv = null,
}) {
  const config = getHeatTreatmentConfig(
    appliedSpecification?.heatTreatment ? appliedSpecification : heatTreatment
  );
  const decimalPlaces = resolveDepthDecimalPlaces(config);
  const coreHv = resolveCoreHardnessHv(rows, hardnessRows, coreHardnessHv);
  const effectiveThreshold = resolveEffectiveDepthThreshold(config, coreHv);
  const caseThreshold = resolveCaseDepthThreshold(config, appliedSpecification);

  const effectiveResult =
    effectiveThreshold != null
      ? calculateDepthAtThresholdFromRows(rows, effectiveThreshold, { decimalPlaces })
      : {
          depth: null,
          status: DEPTH_CALC_STATUS.UNBRACKETED,
          message: DEPTH_CALC_UNAVAILABLE,
        };

  const caseResult = calculateDepthAtThresholdFromRows(rows, caseThreshold, {
    decimalPlaces,
  });

  const autoEffective = effectiveResult.depth;
  const autoCase = caseResult.depth;
  const autoGrinding = config.grindingAllowanceMm ?? 0.15;

  const caseFinal = edits.caseDepth ?? autoCase;
  const grindingFinal = edits.grindingAllowance ?? autoGrinding;
  const autoAfterGrinding =
    caseFinal != null && grindingFinal != null ? round2(caseFinal - grindingFinal) : null;

  return {
    effectiveDepth: createFieldHistory(autoEffective, edits.effectiveDepth, effectiveResult),
    caseDepth: createFieldHistory(autoCase, edits.caseDepth, caseResult),
    grindingAllowance: createFieldHistory(autoGrinding, edits.grindingAllowance),
    afterGrindingDepth: createFieldHistory(autoAfterGrinding, edits.afterGrindingDepth),
    meta: {
      effectiveThresholdHv: effectiveThreshold,
      caseDepthThresholdHv: caseThreshold,
      coreHv,
      corePlusOffset: config.corePlusOffset,
      effectiveDepthBasis: config.effectiveDepthBasis,
      specifiedHv: config.specifiedHv,
      certificateOutputMode: config.certificateOutputMode,
      depthDecimalPlaces: decimalPlaces,
      effectiveDepthCalc: {
        status: effectiveResult.status,
        message: effectiveResult.message ?? null,
        thresholdHv: effectiveThreshold,
      },
      caseDepthCalc: {
        status: caseResult.status,
        message: caseResult.message ?? null,
        thresholdHv: caseThreshold,
      },
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
    appliedSpecification: report.appliedSpecification || null,
    coreHardnessHv: report.coreHardnessHv ?? null,
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

export function formatDepthMm(value, decimalPlaces = DEFAULT_DEPTH_DECIMAL_PLACES) {
  if (value == null || Number.isNaN(Number(value))) return "";
  return Number(value).toFixed(decimalPlaces);
}

export function formatDepthCalcAutoDisplay(field, decimalPlaces = DEFAULT_DEPTH_DECIMAL_PLACES) {
  if (!field) return "—";
  if (field.auto != null) return formatDepthMm(field.auto, decimalPlaces);
  if (field.calcMessage) return field.calcMessage;
  return "—";
}

export { CERTIFICATE_OUTPUT_MODES, getCertificateOutputFields };
