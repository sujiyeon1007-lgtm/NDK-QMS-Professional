/**
 * Project TITAN V1.0 — 검사 리포트 데이터 모델 (Final Design v1.0)
 * 검사일지 → 검사 리포트 자동 생성 · 성적서와 데이터 공유 기반
 */

import {
  buildAppearanceResultRows,
  buildDimensionResultRows,
  buildHardnessResultRows,
  summarizeJudgments,
} from "./specJudgment";
import { cloneSpecification } from "./productSpecificationModel";
import {
  buildDimensionInspectionRowsFromSpec,
  normalizeDimensionInspectionRows,
} from "./dimensionInspectionModel";
import {
  calculateHardeningDepthMetricsFromRows,
  getHardeningDepthChartPoints,
  legacyArraysToRows,
  migrateHardeningDepthRows,
  normalizeHardeningDepthRows,
  LEGACY_DEFAULT_HARDENING_HV,
  LEGACY_HARDENING_DEPTH_COLUMNS,
  HV_REFERENCE_LINE,
} from "./hardeningDepthModel";
import { buildScopedResultSummary, getInspectionScope } from "./inspectionScope";
import { syncHeatTreatmentCalculations } from "./heatTreatmentCalculationEngine";

/** @deprecated 레거시 호환 — migrateHardeningDepthRows 사용 권장 */
export const HARDENING_DEPTH_COLUMNS = LEGACY_HARDENING_DEPTH_COLUMNS;
export const DEFAULT_HARDENING_HV = LEGACY_DEFAULT_HARDENING_HV;
export { HV_REFERENCE_LINE };

const DEFAULT_SPECIFICATIONS = [
  { item: "표면경도", spec: "550 Hv 이상", unit: "Hv", note: "10N" },
  { item: "유효경화깊이", spec: "0.20 mm 이상", unit: "mm", note: "390Hv 기준" },
  { item: "화합물층", spec: "0.010 ~ 0.030", unit: "mm", note: "White Layer" },
  { item: "심부경도", spec: "280 Hv 이상", unit: "Hv", note: "CORE" },
  { item: "표면조도", spec: "Ra 1.6 이하", unit: "Ra", note: "—" },
  { item: "변형", spec: "0.05 mm 이하", unit: "mm", note: "—" },
];

const DEFAULT_RESULT_SUMMARY = [
  { category: "외관검사", result: "합격", note: "—" },
  { category: "경도검사", result: "합격", note: "—" },
  { category: "치수검사", result: "합격", note: "—" },
  { category: "조직검사", result: "합격", note: "—" },
  { category: "기타검사", result: "—", note: "—" },
];

const DEFAULT_APPEARANCE = [
  { item: "찍힘", standard: "없어야 함", result: "양호", judgment: "합격" },
  { item: "색상 이상", standard: "없어야 함", result: "양호", judgment: "합격" },
  { item: "얼룩", standard: "없어야 함", result: "양호", judgment: "합격" },
];

const DEFAULT_HARDNESS_ROWS = [
  { item: "표면경도", spec: "550~700", measured: "1078", unit: "HV", note: "", judgment: "합격" },
  { item: "유효경화깊이", spec: "0.20~0.40", measured: "0.25", unit: "mm", note: "", judgment: "합격" },
  { item: "화합물층", spec: "5~15", measured: "10", unit: "μm", note: "", judgment: "합격" },
  { item: "심부경도", spec: "250~350", measured: "297", unit: "HV", note: "", judgment: "합격" },
];

const DEFAULT_DIMENSION_ROWS = [
  { item: "전장", spec: "120±0.2", measured: "120.05", unit: "mm", judgment: "합격" },
  { item: "외경", spec: "45±0.1", measured: "44.98", unit: "mm", judgment: "합격" },
  { item: "단차", spec: "0.05 Max", measured: "0.03", unit: "mm", judgment: "합격" },
];

const DEFAULT_OTHER_ROWS = [{ item: "—", result: "—", note: "—" }];

function buildSpecificationsFromApplied(spec) {
  if (!spec) return DEFAULT_SPECIFICATIONS;
  const rows = [];

  if (spec.hardness?.enabled) {
    spec.hardness.items
      .filter((item) => !item.disabled && item.spec && item.spec !== "없음")
      .forEach((item) => {
        rows.push({
          item: item.label,
          spec: item.spec,
          unit: spec.hardness.unit || "HV",
          note: "—",
        });
      });
  }

  if (spec.dimension?.enabled) {
    spec.dimension.items
      .filter((item) => item.label && item.spec)
      .forEach((item) => {
        rows.push({
          item: item.label,
          spec: item.spec,
          unit: spec.dimension.unit || "mm",
          note: "—",
        });
      });
  }

  return rows.length ? rows : DEFAULT_SPECIFICATIONS;
}

function buildResultSummaryFromLog(log, hasMicro) {
  const spec = log.appliedSpecification;
  const scope = getInspectionScope(spec);
  const appearanceSummary = summarizeJudgments(
    buildAppearanceResultRows(spec, log.appearanceMeasurements)
  );
  const hardnessSummary = summarizeJudgments(
    buildHardnessResultRows(spec, log.hardnessMeasurements)
  );
  const dimensionSummary = summarizeJudgments(
    buildDimensionResultRows(spec, log.dimensionMeasurements)
  );
  const microSummary = hasMicro
    ? log.judgment === "불합격"
      ? "불합격"
      : "합격"
    : "—";

  return buildScopedResultSummary(
    {
      appearanceSummary,
      hardnessSummary,
      dimensionSummary,
      microstructureSummary: microSummary,
      hasMicrostructurePhoto: hasMicro,
      appliedSpecification: spec,
    },
    scope
  );
}

export function createReportNo(logId = "") {
  const year = new Date().getFullYear();
  const suffix = String(logId).replace(/\D/g, "").slice(-5).padStart(5, "0") || String(Date.now()).slice(-5);
  return `IR-${year}-${suffix}`;
}

/** 390Hv 기준 유효경화깊이 · 경화깊이 보간 계산 (레거시 배열) */
export function calculateHardeningDepthMetrics(depthColumns, hvValues, threshold = HV_REFERENCE_LINE) {
  const rows = legacyArraysToRows(depthColumns, hvValues);
  return calculateHardeningDepthMetricsFromRows(rows, threshold);
}

export function buildInspectionReportFromLog(log) {
  if (!log) return null;

  const hasMicro = Boolean(log.hasMicrostructurePhoto);
  const appliedSpec = log.appliedSpecification ? cloneSpecification(log.appliedSpecification) : null;

  const hardeningDepthRows = migrateHardeningDepthRows(log);
  const metrics = calculateHardeningDepthMetricsFromRows(hardeningDepthRows);
  const appearanceRows = buildAppearanceResultRows(appliedSpec, log.appearanceMeasurements);
  const hardnessRows = buildHardnessResultRows(appliedSpec, log.hardnessMeasurements);
  const dimensionRows = buildDimensionResultRows(appliedSpec, log.dimensionMeasurements);
  const dimensionInspectionRows = normalizeDimensionInspectionRows(
    log.dimensionInspectionRows?.length
      ? log.dimensionInspectionRows
      : buildDimensionInspectionRowsFromSpec(appliedSpec)
  );

  const baseReport = {
    reportNo: log.reportNo || createReportNo(log.id),
    logId: log.id,
    company: log.company,
    partName: log.partName,
    partNo: log.partNo,
    drawingNo: log.drawingNo || "",
    lotNo: log.lotNo || "",
    managementId: log.managementId,
    material: log.material,
    process: log.process || "",
    qty: log.qty,
    unit: log.unit || "EA",
    inspectionDate: log.inspectionDate,
    inspector: log.assignee,
    approver: log.approver || "—",
    specifications: buildSpecificationsFromApplied(appliedSpec),
    resultSummary: buildResultSummaryFromLog(log, hasMicro),
    finalJudgment: log.judgment === "불합격" ? "불합격" : "합격",
    hardeningDepthRows,
    hardeningDepthHv: hardeningDepthRows.map((row) => (row.hv === "" ? 0 : Number(row.hv) || 0)),
    effectiveDepthMm: metrics.effectiveDepthMm,
    hardeningDepth390: metrics.hardeningDepth390,
    appearanceRows: appearanceRows.length ? appearanceRows : DEFAULT_APPEARANCE,
    appearanceSummary: summarizeJudgments(appearanceRows) || "합격",
    hardnessRows: hardnessRows.length ? hardnessRows : DEFAULT_HARDNESS_ROWS,
    hardnessSummary: summarizeJudgments(hardnessRows) || "합격",
    dimensionRows: dimensionRows.length ? dimensionRows : DEFAULT_DIMENSION_ROWS,
    dimensionInspectionRows,
    dimensionSummary: summarizeJudgments(
      dimensionInspectionRows.length ? dimensionInspectionRows : dimensionRows
    ) || "합격",
    hasMicrostructurePhoto: hasMicro,
    microstructureJudgment: log.microstructureJudgment || "이상없음",
    microstructurePhotos: Array.isArray(log.microstructurePhotos) ? log.microstructurePhotos : [],
    microstructureSummary: hasMicro ? (log.judgment === "불합격" ? "불합격" : "합격") : "—",
    otherRows: appliedSpec?.other?.enabled
      ? [{ item: "기타", result: "—", note: appliedSpec.other.note || "—" }]
      : DEFAULT_OTHER_ROWS,
    remarks: log.note?.trim() || "특이사항 없음",
    appliedSpecification: appliedSpec,
    productMasterSpec: log.productMasterSpec ? cloneSpecification(log.productMasterSpec) : null,
    heatTreatmentEdits: log.heatTreatmentEdits || {},
    heatTreatmentCalculations: log.heatTreatmentCalculations || null,
    coreHardnessHv: log.coreHardnessHv ?? "",
  };

  const heatTreatmentCalculations = syncHeatTreatmentCalculations({
    ...baseReport,
    hardnessRows: hardnessRows.length ? hardnessRows : DEFAULT_HARDNESS_ROWS,
  });

  return normalizeInspectionReport({
    ...baseReport,
    heatTreatmentCalculations,
    effectiveDepthMm: heatTreatmentCalculations?.effectiveDepth?.final ?? metrics.effectiveDepthMm,
    hardeningDepth390: heatTreatmentCalculations?.caseDepth?.final ?? metrics.hardeningDepth390,
    grindingAllowanceMm: heatTreatmentCalculations?.grindingAllowance?.final ?? null,
    afterGrindingDepthMm: heatTreatmentCalculations?.afterGrindingDepth?.final ?? null,
  });
}

export function normalizeInspectionReport(report) {
  const hardeningDepthRows = normalizeHardeningDepthRows(migrateHardeningDepthRows(report));
  const metrics = calculateHardeningDepthMetricsFromRows(hardeningDepthRows);
  const hardeningHv = hardeningDepthRows.map((row) => (row.hv === "" ? 0 : Number(row.hv) || 0));

  return {
    reportNo: report.reportNo || createReportNo(report.logId),
    logId: report.logId || "",
    company: report.company?.trim() || "—",
    partName: report.partName?.trim() || "—",
    partNo: report.partNo?.trim() || "—",
    drawingNo: report.drawingNo?.trim() || "—",
    lotNo: report.lotNo?.trim() || "—",
    purchaseOrderNo: report.purchaseOrderNo?.trim() || "—",
    customerLotNo: report.customerLotNo?.trim() || "—",
    managementId: report.managementId?.trim() || "—",
    material: report.material?.trim() || "—",
    process: report.process?.trim() || "—",
    qty: Number(report.qty) || 0,
    unit: report.unit?.trim() || "EA",
    inspectionDate: report.inspectionDate?.trim() || "—",
    inspector: report.inspector?.trim() || "—",
    approver: report.approver?.trim() || "—",
    specifications: report.specifications?.length ? report.specifications : DEFAULT_SPECIFICATIONS,
    resultSummary: report.resultSummary?.length ? report.resultSummary : DEFAULT_RESULT_SUMMARY,
    finalJudgment: report.finalJudgment === "불합격" ? "불합격" : "합격",
    hardeningDepthRows,
    hardeningDepthHv: hardeningHv,
    effectiveDepthMm: report.effectiveDepthMm ?? metrics.effectiveDepthMm,
    hardeningDepth390: report.hardeningDepth390 ?? metrics.hardeningDepth390,
    grindingAllowanceMm: report.grindingAllowanceMm ?? null,
    afterGrindingDepthMm: report.afterGrindingDepthMm ?? null,
    heatTreatmentCalculations: report.heatTreatmentCalculations ?? null,
    heatTreatmentEdits: report.heatTreatmentEdits ?? {},
    coreHardnessHv: report.coreHardnessHv ?? "",
    appearanceRows:
      report.appearanceRows != null
        ? report.appearanceRows
        : DEFAULT_APPEARANCE,
    appearanceSummary: report.appearanceSummary || "합격",
    hardnessRows:
      report.hardnessRows != null ? report.hardnessRows : DEFAULT_HARDNESS_ROWS,
    hardnessSummary: report.hardnessSummary || "합격",
    dimensionRows:
      report.dimensionRows != null ? report.dimensionRows : DEFAULT_DIMENSION_ROWS,
    dimensionSummary: report.dimensionSummary || "합격",
    hasMicrostructurePhoto: Boolean(report.hasMicrostructurePhoto),
    microstructureJudgment: report.microstructureJudgment || "이상없음",
    microstructureSummary: report.microstructureSummary || "합격",
    otherRows: report.otherRows?.length ? report.otherRows : DEFAULT_OTHER_ROWS,
    remarks: report.remarks?.trim() || "특이사항 없음",
    appliedSpecification: report.appliedSpecification ?? null,
    productMasterSpec: report.productMasterSpec ?? null,
    dimensionInspectionRows: Array.isArray(report.dimensionInspectionRows)
      ? report.dimensionInspectionRows
      : [],
    microstructurePhotos: Array.isArray(report.microstructurePhotos) ? report.microstructurePhotos : [],
    mainResultRows: Array.isArray(report.mainResultRows) ? report.mainResultRows : [],
    updatedAt: report.updatedAt || new Date().toISOString(),
  };
}

export function getHardeningChartPoints(report) {
  const rows = normalizeHardeningDepthRows(migrateHardeningDepthRows(report));
  return getHardeningDepthChartPoints(rows);
}
