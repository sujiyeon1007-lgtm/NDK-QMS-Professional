/**
 * Project TITAN V1.0 — 검사 리포트 작성(등록) · 판정 동기화
 */

import { getProductionProcessName } from "../config/productionProcessCodes";
import { getJournalReferenceDate } from "./workJournalData";
import { getCurrentTitanUser } from "./titanHistorySession";
import { getProductByCompanyAndPartNo } from "./productRegistrationSession";
import { resolveInspectionSpecification } from "./productInspectionSession";
import { mergeInspectionSpecification } from "./inspectionCriteriaModel";
import { findProductByPartNo } from "./masterData";
import { getProductMasterBundle } from "./productInspectionSession";
import { cloneSpecification, createDefaultSpecification } from "./productSpecificationModel";
import {
  buildScopedResultSummary,
  computeFinalJudgmentFromScope,
  getInspectionScope,
  rebuildRowsFromSpecification,
  updateSpecificationSection,
} from "./inspectionScope";
import {
  buildInspectionReportFromLog,
  normalizeInspectionReport,
} from "./inspectionReportModel";
import { applyHardeningDepthRows, migrateHardeningDepthRows } from "./hardeningDepthModel";
import {
  applyHeatTreatmentFieldEdit,
  formatDepthMm,
  syncHeatTreatmentCalculations,
} from "./heatTreatmentCalculationEngine";
import { evaluateMeasurement, summarizeJudgments } from "./specJudgment";
import { getSessionProductionRecords } from "./productionRecords";
import { getInspectionLogById, getInspectionLogs } from "./inspectionLogSession";

const APPEARANCE_STANDARDS = {
  dent: "없어야 함",
  color: "없어야 함",
  stain: "없어야 함",
};

const APPEARANCE_LABELS = {
  dent: "찍힘",
  color: "색상 이상",
  stain: "얼룩",
};

const HARDNESS_UNIT_BY_KEY = {
  surface: "hardnessUnit",
  caseDepth: "mm",
  effectiveDepth: "mm",
  compoundLayer: "μm",
  core: "hardnessUnit",
};

function resolveHardnessUnit(key, hardnessUnit = "HV") {
  const mapped = HARDNESS_UNIT_BY_KEY[key];
  if (mapped === "hardnessUnit") return hardnessUnit;
  return mapped || hardnessUnit;
}

function buildHardnessRowsFromSpec(spec) {
  if (!spec?.hardness?.enabled) return [];
  const hardnessUnit = spec.hardness.unit || "HV";
  return spec.hardness.items
    .filter((item) => !item.disabled && item.spec && item.spec !== "없음")
    .map((item) => ({
      key: item.key,
      item: item.label,
      spec: item.spec,
      measured: "",
      measuredRaw: "",
      unit: resolveHardnessUnit(item.key, hardnessUnit),
      judgment: "—",
      note: "",
    }));
}

function buildDimensionRowsFromSpec(spec) {
  if (!spec?.dimension?.enabled) return [];
  const unit = spec.dimension.unit || "mm";
  return spec.dimension.items
    .filter((item) => item.label && item.spec)
    .map((item) => ({
      id: item.id,
      item: item.label,
      spec: item.spec,
      measured: "",
      measuredRaw: "",
      unit,
      judgment: "—",
      note: "",
    }));
}

function buildAppearanceRowsFromSpec(spec) {
  if (!spec?.appearance?.enabled) return [];
  return spec.appearance.items
    .filter((item) => item.enabled)
    .map((item) => ({
      key: item.key,
      item: APPEARANCE_LABELS[item.key] || item.label,
      standard: APPEARANCE_STANDARDS[item.key] || "없어야 함",
      result: "양호",
      judgment: "합격",
    }));
}

function buildSpecificationsFromSpec(spec) {
  const rows = [];
  if (spec?.hardness?.enabled) {
    spec.hardness.items
      .filter((item) => !item.disabled && item.spec && item.spec !== "없음")
      .forEach((item) => {
        rows.push({
          item: item.label,
          spec: item.spec,
          unit: resolveHardnessUnit(item.key, spec.hardness.unit || "HV"),
          note: "—",
        });
      });
  }
  if (spec?.dimension?.enabled) {
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
  return rows;
}

export function buildInitialRegisterReport({ record = null, product = null } = {}) {
  const appliedSpecification = product
    ? cloneSpecification(product.specification)
    : createDefaultSpecification();

  const base = {
    reportNo: "",
    logId: "",
    company: record?.company || product?.company || "",
    partName: record?.partName || product?.partName || "",
    partNo: record?.partNo || product?.partNo || "",
    drawingNo: record?.drawingNo || product?.drawingNo || "",
    lotNo: record?.lotNo || "",
    managementId: record?.id || "",
    material: record?.material || product?.material || "",
    process: record ? getProductionProcessName(record) : product?.process || "",
    qty: record?.qty ?? 0,
    unit: record?.unit || "EA",
    inspectionDate: getJournalReferenceDate(),
    inspector: getCurrentTitanUser(),
    approver: "—",
    appliedSpecification,
    hardnessUnit: appliedSpecification?.hardness?.unit || "HV",
    specifications: appliedSpecification
      ? buildSpecificationsFromSpec(appliedSpecification)
      : [],
    hardnessRows: appliedSpecification ? buildHardnessRowsFromSpec(appliedSpecification) : [],
    dimensionRows: appliedSpecification ? buildDimensionRowsFromSpec(appliedSpecification) : [],
    appearanceRows: appliedSpecification ? buildAppearanceRowsFromSpec(appliedSpecification) : [],
    otherRows: [{ item: "—", result: "—", note: "—" }],
    hardeningDepthRows: [],
    hardeningDepthHv: [],
    hasMicrostructurePhoto: Boolean(appliedSpecification?.microstructure?.enabled),
    microstructureJudgment: "이상없음",
    microstructurePhotos: [],
    remarks: "",
    finalJudgment: "합격",
  };

  return syncReportJudgments(normalizeInspectionReport(base));
}

export function loadRegisterReportFromSearchParams(searchParams) {
  const managementId = searchParams.get("managementId")?.trim();
  if (!managementId) return buildInitialRegisterReport();

  const record = getSessionProductionRecords().find((item) => item.id === managementId);
  const product = record ? getProductByCompanyAndPartNo(record.company, record.partNo) : null;
  return buildInitialRegisterReport({ record, product });
}

export function applyProductToReport(report, partNo, company = report.company) {
  const trimmedPartNo = partNo?.trim() || report.partNo;
  const product = getProductByCompanyAndPartNo(company, trimmedPartNo);
  const masterProduct = findProductByPartNo(trimmedPartNo);
  const masterBundle = getProductMasterBundle(trimmedPartNo);
  const masterProductSpec = resolveInspectionSpecification(trimmedPartNo);
  const currentDrawing = masterBundle?.drawing;

  if (!product && !masterProduct && !masterProductSpec) {
    return syncReportJudgments({ ...report, partNo: trimmedPartNo });
  }

  let appliedSpecification = product
    ? cloneSpecification(product.specification)
    : createDefaultSpecification();

  if (masterProductSpec) {
    appliedSpecification = mergeInspectionSpecification(appliedSpecification, masterProductSpec);
  }

  const rebuilt = rebuildRowsFromSpecification(appliedSpecification);
  const scope = getInspectionScope(appliedSpecification);

  const next = {
    ...report,
    company: product?.company || masterProduct?.company || report.company,
    partName: product?.partName || masterProduct?.name || report.partName,
    partNo: product?.partNo || masterProduct?.partNo || trimmedPartNo,
    drawingNo:
      currentDrawing?.drawingNo ||
      product?.drawingNo ||
      masterProduct?.drawingNo ||
      report.drawingNo,
    material: product?.material || masterProduct?.material || report.material,
    process: product?.process || masterProduct?.process || report.process,
    appliedSpecification,
    hardnessUnit: appliedSpecification.hardness?.unit || "HV",
    specifications: rebuilt.specifications,
    hardnessRows: rebuilt.hardnessRows,
    dimensionRows: rebuilt.dimensionRows,
    appearanceRows: rebuilt.appearanceRows,
    otherRows: rebuilt.otherRows,
    hasMicrostructurePhoto: Boolean(appliedSpecification?.microstructure?.enabled),
    hardeningDepthRows: scope.hardeningDepth ? report.hardeningDepthRows || [] : [],
    hardeningDepthHv: scope.hardeningDepth ? report.hardeningDepthHv || [] : [],
  };
  return syncReportJudgments(normalizeInspectionReport(next));
}

function syncHardnessRowsFromHeatTreatment(hardnessRows, calculations) {
  if (!calculations || !hardnessRows?.length) return hardnessRows;

  const depthByKey = {
    effectiveDepth: calculations.effectiveDepth?.final,
    caseDepth: calculations.caseDepth?.final,
  };

  return hardnessRows.map((row) => {
    const depthValue = depthByKey[row.key];
    if (depthValue == null) return row;
    const measured = formatDepthMm(depthValue);
    return {
      ...row,
      measured,
      measuredRaw: measured,
      judgment: evaluateMeasurement(row.spec, measured),
    };
  });
}

export function updateHeatTreatmentCalculation(report, fieldKey, rawValue) {
  const withEdit = applyHeatTreatmentFieldEdit(report, fieldKey, rawValue);
  return syncReportJudgments(withEdit);
}

export { getInspectionScope, updateSpecificationSection, rebuildRowsFromSpecification };

export function syncReportJudgments(report) {
  const scope = getInspectionScope(report.appliedSpecification);

  const hardnessRows = scope.hardness
    ? (report.hardnessRows || []).map((row) => ({
        ...row,
        judgment: evaluateMeasurement(row.spec, row.measuredRaw ?? row.measured),
      }))
    : [];

  const dimensionRows = scope.dimension
    ? (report.dimensionRows || []).map((row) => ({
        ...row,
        judgment: evaluateMeasurement(row.spec, row.measuredRaw ?? row.measured),
      }))
    : [];

  const appearanceRows = scope.appearance
    ? (report.appearanceRows || []).map((row) => ({
        ...row,
        judgment: row.result === "양호" ? "합격" : row.result ? "불합격" : "—",
      }))
    : [];

  const appearanceSummary = scope.appearance ? summarizeJudgments(appearanceRows) : "—";
  const hardnessSummary = scope.hardness ? summarizeJudgments(hardnessRows) : "—";
  const dimensionSummary = scope.dimension ? summarizeJudgments(dimensionRows) : "—";

  const microSummary =
    scope.microstructure && report.hasMicrostructurePhoto
      ? report.microstructureJudgment === "조직이상"
        ? "불합격"
        : "합격"
      : "—";

  const metrics = scope.hardeningDepth
    ? applyHardeningDepthRows(report, report.hardeningDepthRows || [])
    : {
        hardeningDepthRows: [],
        hardeningDepthHv: [],
        effectiveDepthMm: null,
        hardeningDepth390: null,
      };

  const heatTreatmentCalculations =
    scope.hardeningDepth || scope.hardness
      ? syncHeatTreatmentCalculations({
          ...report,
          hardeningDepthRows: metrics.hardeningDepthRows,
          hardnessRows,
        })
      : null;

  const syncedHardnessRows =
    heatTreatmentCalculations && scope.hardness
      ? syncHardnessRowsFromHeatTreatment(hardnessRows, heatTreatmentCalculations)
      : hardnessRows;

  const syncedPartial = {
    ...report,
    hardnessRows: syncedHardnessRows,
    dimensionRows,
    appearanceRows,
    appearanceSummary,
    hardnessSummary: scope.hardness ? summarizeJudgments(syncedHardnessRows) : "—",
    dimensionSummary,
    microstructureSummary: microSummary,
    hardeningDepthRows: metrics.hardeningDepthRows,
    hardeningDepthHv: metrics.hardeningDepthHv,
    effectiveDepthMm:
      heatTreatmentCalculations?.effectiveDepth?.final ?? metrics.effectiveDepthMm,
    hardeningDepth390: heatTreatmentCalculations?.caseDepth?.final ?? metrics.hardeningDepth390,
    grindingAllowanceMm: heatTreatmentCalculations?.grindingAllowance?.final ?? null,
    afterGrindingDepthMm: heatTreatmentCalculations?.afterGrindingDepth?.final ?? null,
    heatTreatmentCalculations,
  };

  const resultSummary = buildScopedResultSummary(syncedPartial, scope);
  const finalJudgment = computeFinalJudgmentFromScope(
    {
      ...syncedPartial,
      appearanceSummary,
      hardnessSummary: syncedPartial.hardnessSummary,
      dimensionSummary,
      microstructureSummary: microSummary,
    },
    scope
  );

  return normalizeInspectionReport({
    ...syncedPartial,
    resultSummary,
    finalJudgment,
  });
}

export function reportToInspectionLogPayload(report, logId = null) {
  const synced = syncReportJudgments(report);
  return {
    id: logId || undefined,
    managementId: synced.managementId?.trim() || "",
    company: synced.company?.trim() || "",
    partName: synced.partName?.trim() || "",
    partNo: synced.partNo?.trim() || "",
    drawingNo: synced.drawingNo?.trim() || "",
    material: synced.material?.trim() || "",
    lotNo: synced.lotNo?.trim() || "",
    process: synced.process?.trim() || "",
    qty: synced.qty,
    unit: synced.unit || "EA",
    inspectionDate: synced.inspectionDate,
    assignee: synced.inspector?.trim() || getCurrentTitanUser(),
    judgment: synced.finalJudgment,
    note: synced.remarks?.trim() || "",
    appliedSpecification: synced.appliedSpecification,
    hardnessMeasurements: synced.hardnessRows.map((row) => ({
      key: row.key,
      measured: row.measuredRaw ?? row.measured,
      judgment: row.judgment,
    })),
    dimensionMeasurements: synced.dimensionRows.map((row) => ({
      id: row.id,
      measured: row.measuredRaw ?? row.measured,
      judgment: row.judgment,
    })),
    appearanceMeasurements: synced.appearanceRows.map((row) => ({
      key: row.key,
      result: row.result,
      judgment: row.judgment,
    })),
    hasMicrostructurePhoto: synced.hasMicrostructurePhoto,
    microstructureJudgment: synced.microstructureJudgment,
    hardeningDepthRows: synced.hardeningDepthRows,
    hardeningDepthHv: synced.hardeningDepthHv,
    heatTreatmentCalculations: synced.heatTreatmentCalculations,
    heatTreatmentEdits: synced.heatTreatmentEdits,
    microstructurePhotos: synced.microstructurePhotos,
  };
}

export function getPreviousHardeningDepthRows(partNo, excludeLogId = null, company = "") {
  const trimmedPartNo = partNo?.trim();
  const trimmedCompany = company?.trim();
  if (!trimmedPartNo) return null;

  const previous = getInspectionLogs()
    .filter((log) => {
      if (log.id === excludeLogId) return false;
      if (log.partNo?.trim().toUpperCase() !== trimmedPartNo.toUpperCase()) return false;
      if (trimmedCompany && log.company?.trim() !== trimmedCompany) return false;
      return migrateHardeningDepthRows(log).length > 0;
    })
    .sort((a, b) => (b.inspectionDate || "").localeCompare(a.inspectionDate || ""))[0];

  if (!previous) return null;
  return migrateHardeningDepthRows(previous);
}

export function registerReportFromExistingLog(logId) {
  const log = getInspectionLogById(logId);
  if (!log) return null;
  const report = buildInspectionReportFromLog(log);
  if (!report) return null;
  return syncReportJudgments({
    ...report,
    appearanceRows: report.appearanceRows.map((row, index) => ({
      ...row,
      key: ["dent", "color", "stain"][index] || `app-${index}`,
      standard: row.standard || "없어야 함",
    })),
    hardnessRows: report.hardnessRows.map((row, index) => ({
      ...row,
      key: row.key || `hv-${index}`,
      spec: String(row.spec || "").replace(/\s+(HV|HRC|mm|μm|㎛).*$/i, ""),
      measuredRaw: row.measuredRaw || String(row.measured || "").replace(/[^\d.-]/g, ""),
      unit: row.unit || "HV",
      note: row.note || "",
    })),
    dimensionRows: report.dimensionRows.map((row, index) => ({
      ...row,
      id: row.id || `dim-${index}`,
      spec: String(row.spec || "").replace(/\s+mm$/i, ""),
      measuredRaw: row.measuredRaw || String(row.measured || "").replace(/[^\d.-]/g, ""),
      unit: row.unit || "mm",
      note: row.note || "",
    })),
  });
}
