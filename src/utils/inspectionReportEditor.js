/**
 * Project TITAN V1.0 — 검사 리포트 작성(등록) · 판정 동기화
 */

import { getProductionProcessName } from "../config/productionProcessCodes";
import { getJournalReferenceDate } from "./workJournalData";
import { getCurrentTitanUser } from "./titanHistorySession";
import { getProductByCompanyAndPartNo } from "./productRegistrationSession";
import { getProductMasterBundle } from "./productInspectionSession";
import {
  resolveProductMasterInspectionSpec,
  snapshotProductMasterSpec,
} from "./productMasterInspectionSpec";
import { normalizeInspectionCriteriaSpec, resolveCriterionItemUnit } from "./inspectionCriteriaModel";
import { findProductByPartNo } from "./masterData";
import { cloneSpecification, INSPECTION_HARDNESS_EXCLUDED_KEYS } from "./productSpecificationModel";
import { resolveChargeQty } from "./equipmentChargingQty";
import {
  buildMainInspectionResultRows,
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
  buildDimensionInspectionRowsFromSpec,
  normalizeDimensionInspectionRows,
  syncDimensionInspectionRows,
} from "./dimensionInspectionModel";
import {
  applyHeatTreatmentFieldEdit,
  formatDepthMm,
  syncHeatTreatmentCalculations,
} from "./heatTreatmentCalculationEngine";
import { evaluateMeasurement, summarizeJudgments } from "./specJudgment";
import { getSessionProductionRecords } from "./productionRecords";
import { mapV13ProductListRow } from "./processFlow";
import { getDevelopmentInspectionById } from "./developmentInspectionSession";
import { getOtherInspectionById } from "./otherInspectionSession";
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

function resolveHardnessUnit(key, hardnessUnit = "HV", item = {}) {
  return resolveCriterionItemUnit(key, item, hardnessUnit);
}

function buildHardnessRowsFromSpec(spec) {
  if (!spec?.hardness?.enabled) return [];
  const hardnessUnit = spec.hardness.unit || "HV";
  return spec.hardness.items
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
      unit: resolveHardnessUnit(item.key, hardnessUnit, item),
      judgment: "—",
      note: "",
    }));
}

/** 유효경화깊이만 자동 판정 행 생성 — 경화깊이(caseDepth)는 상세 영역 전용 */
function buildAutoDepthJudgmentRows(spec, calculations) {
  if (!spec?.hardness?.enabled || !calculations) return [];

  const item = spec.hardness.items.find((row) => row.key === "effectiveDepth");
  if (!item || item.disabled || !item.spec || item.spec === "없음") return [];

  const depthValue = calculations.effectiveDepth?.final;
  if (depthValue == null) return [];

  const measured = formatDepthMm(depthValue);
  return [
    {
      key: "effectiveDepth",
      item: item.label || "유효경화깊이",
      spec: item.spec,
      measured,
      measuredRaw: measured,
      unit: "mm",
      judgment: evaluateMeasurement(item.spec, measured),
      note: "자동 계산",
      autoCalculated: true,
    },
  ];
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
          unit: resolveHardnessUnit(item.key, spec.hardness.unit || "HV", item),
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

function resolveRegisterAppliedSpecification(record, product, company = "") {
  const partNo = record?.partNo || product?.partNo || "";
  const companyName = record?.company || product?.company || company || "";

  let spec = resolveProductMasterInspectionSpec(companyName, partNo);
  spec = normalizeInspectionCriteriaSpec(spec);

  const hasSurfaceSpec = (spec.hardness?.items ?? []).some(
    (item) => item.key === "surface" && item.spec && item.spec !== "없음"
  );

  if (!hasSurfaceSpec && spec.hardness?.enabled !== false) {
    spec = normalizeInspectionCriteriaSpec({
      ...spec,
      hardness: {
        ...spec.hardness,
        enabled: true,
        surfaceEntries: [
          {
            id: "register-default-surface",
            value: "550",
            valueTo: "700",
            condition: "범위",
            unit: "HV",
          },
        ],
      },
    });
  }

  return normalizeInspectionCriteriaSpec(spec);
}

export function buildInitialRegisterReport({ record = null, product = null } = {}) {
  const resolvedProduct =
    product ??
    (record ? getProductByCompanyAndPartNo(record.company, record.partNo) : null);
  const masterProduct = record?.partNo ? findProductByPartNo(record.partNo) : null;
  const masterBundle = record?.partNo ? getProductMasterBundle(record.partNo, record.company) : null;
  const appliedSpecification = resolveRegisterAppliedSpecification(record, resolvedProduct);
  const productMasterSpec = snapshotProductMasterSpec(
    record?.company || resolvedProduct?.company || "",
    record?.partNo || resolvedProduct?.partNo || ""
  );
  const rebuilt = rebuildRowsFromSpecification(appliedSpecification);
  const scope = getInspectionScope(appliedSpecification);
  const dimensionInspectionRows = scope.dimension
    ? buildDimensionInspectionRowsFromSpec(appliedSpecification)
    : [];

  const traceRow = record
    ? mapV13ProductListRow(record, { label: "검사대기", variant: "wait" }, {
        screenKey: "inspection",
        workQty: resolveChargeQty(record, { lotNo: record.lotNo }),
      })
    : null;

  const base = {
    reportNo: "",
    logId: "",
    company: record?.company || resolvedProduct?.company || masterProduct?.company || "",
    partName: record?.partName || resolvedProduct?.partName || masterProduct?.name || "",
    partNo: record?.partNo || resolvedProduct?.partNo || masterProduct?.partNo || "",
    drawingNo:
      masterBundle?.drawing?.drawingNo ||
      record?.drawingNo ||
      resolvedProduct?.drawingNo ||
      masterProduct?.drawingNo ||
      "",
    lotNo: record?.lotNo || "",
    purchaseOrderNo: record?.purchaseOrderNo || "",
    customerLotNo: record?.customerLotNo || "",
    managementId: record?.id || "",
    material: record?.material || resolvedProduct?.material || masterProduct?.material || "",
    process:
      (record ? getProductionProcessName(record) : "") ||
      resolvedProduct?.process ||
      masterProduct?.process ||
      "",
    incomingDate: traceRow?.incomingDate || record?.incomingDate || "",
    productionDate: traceRow?.productionDate || "",
    inboundQtyLabel: traceRow?.inboundQtyLabel || "",
    workQtyLabel: traceRow?.workQtyLabel || "",
    qty: record?.qty ?? 0,
    unit: record?.unit || "EA",
    inspectionDate: getJournalReferenceDate(),
    inspector: getCurrentTitanUser(),
    approver: "—",
    appliedSpecification,
    productMasterSpec,
    hardnessUnit: appliedSpecification?.hardness?.unit || "HV",
    specifications: rebuilt.specifications,
    hardnessRows: rebuilt.hardnessRows,
    dimensionRows: rebuilt.dimensionRows,
    dimensionInspectionRows,
    appearanceRows: rebuilt.appearanceRows,
    otherRows: rebuilt.otherRows,
    hardeningDepthRows: [],
    hardeningDepthHv: [],
    coreHardnessHv: "",
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
  if (managementId) {
    const record = getSessionProductionRecords().find((item) => item.id === managementId);
    const product = record ? getProductByCompanyAndPartNo(record.company, record.partNo) : null;
    return buildInitialRegisterReport({ record, product });
  }

  const devId = searchParams.get("devId")?.trim();
  if (devId) {
    const dev = getDevelopmentInspectionById(devId);
    if (dev) {
      const base = buildInitialRegisterReport();
      return syncReportJudgments({
        ...base,
        company: dev.company || base.company,
        partName: dev.partName || base.partName,
        material: dev.material || base.material,
        remarks: [dev.testPurpose, dev.measurementItems, dev.note].filter(Boolean).join(" · "),
      });
    }
  }

  const otherId = searchParams.get("otherId")?.trim();
  if (otherId) {
    const other = getOtherInspectionById(otherId);
    if (other) {
      const base = buildInitialRegisterReport();
      return syncReportJudgments({
        ...base,
        company: other.company || base.company,
        partName: other.partName || base.partName,
        material: other.material || base.material,
        remarks: other.note || base.remarks,
      });
    }
  }

  return buildInitialRegisterReport();
}

export function applyProductToReport(report, partNo, company = report.company) {
  const trimmedPartNo = partNo?.trim() || report.partNo;
  const companyName = company?.trim() || report.company;
  const product = getProductByCompanyAndPartNo(companyName, trimmedPartNo);
  const masterProduct = findProductByPartNo(trimmedPartNo);
  const masterBundle = getProductMasterBundle(trimmedPartNo, companyName);

  if (!product && !masterProduct) {
    return syncReportJudgments({ ...report, partNo: trimmedPartNo, company: companyName });
  }

  const productMasterSpec = snapshotProductMasterSpec(companyName, trimmedPartNo);
  const appliedSpecification = cloneSpecification(productMasterSpec);
  const rebuilt = rebuildRowsFromSpecification(appliedSpecification);
  const scope = getInspectionScope(appliedSpecification);

  const next = {
    ...report,
    company: product?.company || masterProduct?.company || companyName || report.company,
    partName: product?.partName || masterProduct?.name || report.partName,
    partNo: product?.partNo || masterProduct?.partNo || trimmedPartNo,
    drawingNo:
      masterBundle?.drawing?.drawingNo ||
      product?.drawingNo ||
      masterProduct?.drawingNo ||
      report.drawingNo,
    material: product?.material || masterProduct?.material || report.material,
    process: product?.process || masterProduct?.process || report.process,
    productMasterSpec,
    appliedSpecification,
    hardnessUnit: appliedSpecification.hardness?.unit || "HV",
    specifications: rebuilt.specifications,
    hardnessRows: rebuilt.hardnessRows,
    dimensionRows: rebuilt.dimensionRows,
    dimensionInspectionRows: scope.dimension
      ? buildDimensionInspectionRowsFromSpec(appliedSpecification)
      : [],
    appearanceRows: rebuilt.appearanceRows,
    otherRows: rebuilt.otherRows,
    hasMicrostructurePhoto: Boolean(appliedSpecification?.microstructure?.enabled),
    hardeningDepthRows: scope.hardeningDepth ? report.hardeningDepthRows || [] : [],
    hardeningDepthHv: scope.hardeningDepth ? report.hardeningDepthHv || [] : [],
  };
  return syncReportJudgments(normalizeInspectionReport(next));
}

function syncHardnessRowsFromHeatTreatment(hardnessRows, calculations, appliedSpecification) {
  const manualRows = (hardnessRows || []).map((row) => ({
    ...row,
    judgment: evaluateMeasurement(row.spec, row.measuredRaw ?? row.measured),
  }));

  const autoDepthRows = buildAutoDepthJudgmentRows(appliedSpecification, calculations);
  return [...manualRows, ...autoDepthRows];
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

  const dimensionInspectionRows = scope.dimension
    ? syncDimensionInspectionRows(report.dimensionInspectionRows || [])
    : [];

  const dimensionSummary = scope.dimension
    ? summarizeJudgments(
        dimensionInspectionRows.length
          ? dimensionInspectionRows
          : dimensionRows
      )
    : "—";

  const appearanceRows = scope.appearance
    ? (report.appearanceRows || []).map((row) => ({
        ...row,
        judgment: row.result === "양호" ? "합격" : row.result ? "불합격" : "—",
      }))
    : [];

  const appearanceSummary = scope.appearance ? summarizeJudgments(appearanceRows) : "—";
  const hardnessSummary = scope.hardness ? summarizeJudgments(hardnessRows) : "—";

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
      ? syncHardnessRowsFromHeatTreatment(
          hardnessRows,
          heatTreatmentCalculations,
          report.appliedSpecification
        )
      : hardnessRows;

  const syncedPartial = {
    ...report,
    hardnessRows: syncedHardnessRows,
    dimensionRows,
    dimensionInspectionRows,
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
  const mainResultRows = buildMainInspectionResultRows(syncedPartial, scope);
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
    mainResultRows,
    finalJudgment,
  });
}

export { buildMainInspectionResultRows };

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
    purchaseOrderNo: synced.purchaseOrderNo?.trim() || "",
    customerLotNo: synced.customerLotNo?.trim() || "",
    process: synced.process?.trim() || "",
    qty: synced.qty,
    unit: synced.unit || "EA",
    inspectionDate: synced.inspectionDate,
    assignee: synced.inspector?.trim() || getCurrentTitanUser(),
    judgment: synced.finalJudgment,
    note: synced.remarks?.trim() || "",
    appliedSpecification: synced.appliedSpecification,
    productMasterSpec: synced.productMasterSpec ?? null,
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
    dimensionInspectionRows: synced.dimensionInspectionRows ?? [],
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
    coreHardnessHv: synced.coreHardnessHv ?? "",
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
