/**
 * Project TITAN V2 — Workspace Header KPI metrics (read-only)
 * Thin wrappers over existing session/utils — no new business rules.
 * Falls back to WORKSPACE_HEADER_KPI_PLACEHOLDERS when live data unavailable.
 */

import {
  formatWorkspaceHeaderKpiValue,
  getWorkspaceHeaderKpiDefs,
  getWorkspaceHeaderKpiPlaceholders,
} from "../config/titanWorkspaceHeaderV2";
import { buildHomeTopKpiCounts, getHomeScreenData } from "./homeDashboardData";
import { getSessionProductionRecords } from "./productionRecords";
import { getOutboundScreenData } from "./titanScreenDataSource";
import { getEquipmentSummary } from "./equipmentWorkflowService";
import { getQualityWorkspaceSnapshot } from "./qualityWorkspaceData";
import { getIncomingDocumentArchiveRows } from "./incomingDocumentArchiveSession";
import { buildExecutiveStatisticsDashboard } from "./statisticsExecutiveAnalytics";
import { buildCompanyDashboard } from "./companyWorkspaceService";
import { buildMasterDataDashboardSnapshot } from "./masterDataDashboard";
import { getMasterDataByCategory } from "./masterData";
import { getEnvironmentSettings, getSystemStatusSummary } from "./environmentSettingsSession";
import { buildAccountingLiteMetrics, buildAccountingClosingSummary } from "./accountingClerkLiteService";

/** @typedef {'live' | 'placeholder'} WorkspaceHeaderKpiSource */

/**
 * @param {Record<string, string | number>} live
 * @param {Record<string, string | number>} placeholders
 * @param {string} key
 */
function pickMetric(live, placeholders, key) {
  const liveValue = live[key];
  if (liveValue != null && liveValue !== "" && !(typeof liveValue === "number" && Number.isNaN(liveValue))) {
    return { value: liveValue, source: /** @type {WorkspaceHeaderKpiSource} */ ("live") };
  }
  return {
    value: placeholders[key],
    source: /** @type {WorkspaceHeaderKpiSource} */ ("placeholder"),
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthPrefix() {
  return todayIso().slice(0, 7);
}

function buildHomeMetrics() {
  const records = getSessionProductionRecords();
  const { counts } = getHomeScreenData(records);
  const topKpi = buildHomeTopKpiCounts(records);
  const activeLots =
    (counts.HT_RUNNING ?? 0) +
    (counts.HT_WAIT ?? 0) +
    (counts.INSPECTION_WAIT ?? 0) +
    (counts.CERT_WAIT ?? 0);

  return {
    workflowActive: activeLots || topKpi.workProgress + topKpi.inspectWait,
    inspectionWait: counts.INSPECTION_WAIT ?? topKpi.inspectWait,
    shipWait: counts.SHIP_WAIT ?? topKpi.todayShipment,
  };
}

function buildOperationsMetrics() {
  const records = getSessionProductionRecords();
  const topKpi = buildHomeTopKpiCounts(records);
  const { counts } = getHomeScreenData(records);
  const outbound = getOutboundScreenData(records);

  return {
    todayInbound: topKpi.todayIncoming,
    shipScheduled: outbound.counts.shipNotDone ?? counts.SHIP_WAIT,
    inspectionRequest: counts.INSPECTION_WAIT,
  };
}

function buildProductionMetrics() {
  const records = getSessionProductionRecords();
  const { counts } = getHomeScreenData(records);
  const equipment = getEquipmentSummary();

  return {
    inProduction: counts.HT_RUNNING ?? 0,
    chargeWait: counts.HT_WAIT ?? 0,
    equipmentRunning: equipment.running,
  };
}

function buildQualityMetrics() {
  const snapshot = getQualityWorkspaceSnapshot();
  return {
    inspectionWait: snapshot.counts.inspectionWait,
    certWait: snapshot.counts.certNotIssued,
    ncrCount: snapshot.counts.defectTotal,
  };
}

function buildDocumentsMetrics() {
  const rows = getIncomingDocumentArchiveRows();
  const month = currentMonthPrefix();
  const today = todayIso();

  return {
    unconfirmedDocs: rows.length,
    newPurchaseOrders: rows.filter(
      (row) =>
        row.documentType === "purchaseOrder" &&
        (String(row.receivedDate ?? "").startsWith(month) || row.receivedDate === today)
    ).length,
  };
}

function buildStatisticsMetrics() {
  const dashboard = buildExecutiveStatisticsDashboard("production", {
    period: "month",
    referenceDate: new Date(),
  });
  const kpi = dashboard?.kpi ?? {};

  return {
    monthProduction: kpi.heatTreatmentCount ?? kpi.inboundCount ?? 0,
    qualityPassRate: kpi.passRate ?? 0,
  };
}

function buildAccountingClerkMetrics() {
  const metrics = buildAccountingLiteMetrics();
  return {
    issuedStatements: metrics.totalStatements,
    pendingStatements: metrics.pendingStatements,
    companyCount: metrics.companyCount,
  };
}

function buildAccountingMetrics() {
  const closing = buildAccountingClosingSummary();
  const dashboard = buildExecutiveStatisticsDashboard("sales", {
    period: "month",
    referenceDate: new Date(),
  });
  const outboundCount = dashboard?.kpi?.outboundCount;

  return {
    monthSales: outboundCount ?? 0,
    taxInvoiceCount: closing?.taxInvoiceCount ?? closing?.issuedCount ?? 0,
    closingStatus: closing?.statusLabel ?? closing?.closingStatus ?? "진행중",
  };
}

function buildMasterDataMetrics() {
  const snapshot = buildMasterDataDashboardSnapshot();
  const summary = Object.fromEntries((snapshot.summary ?? []).map((row) => [row.id, row.count]));

  return {
    companies: summary.companies ?? getMasterDataByCategory("companies").length,
    products: summary.products ?? getMasterDataByCategory("products").length,
    equipment: summary.equipment ?? getMasterDataByCategory("equipment").length,
  };
}

function buildCompanyMetrics() {
  const dashboard = buildCompanyDashboard();
  const equipmentCount = getMasterDataByCategory("equipment").length;
  const companyCount = getMasterDataByCategory("companies").length;

  return {
    employees: dashboard.employeeCount,
    companies: companyCount,
    equipment: equipmentCount,
  };
}

function buildEnvironmentMetrics() {
  const settings = getEnvironmentSettings();
  const status = getSystemStatusSummary();
  const activeUsers = (settings.users ?? []).filter((user) => user.active !== false);

  return {
    userCount: activeUsers.length,
    backupStatus: status.dbStatus === "정상" ? "정상" : status.dbStatus,
  };
}

/** @type {Record<string, () => Record<string, string | number>>} */
const LIVE_METRIC_BUILDERS = {
  home: buildHomeMetrics,
  operations: buildOperationsMetrics,
  production: buildProductionMetrics,
  quality: buildQualityMetrics,
  documents: buildDocumentsMetrics,
  statistics: buildStatisticsMetrics,
  accountingClerk: buildAccountingClerkMetrics,
  accounting: buildAccountingMetrics,
  masterData: buildMasterDataMetrics,
  company: buildCompanyMetrics,
  environment: buildEnvironmentMetrics,
};

/**
 * @param {string} sectionId
 * @returns {{ values: Record<string, string | number>, sources: Record<string, WorkspaceHeaderKpiSource> }}
 */
export function buildWorkspaceHeaderMetrics(sectionId) {
  const placeholders = getWorkspaceHeaderKpiPlaceholders(sectionId);
  /** @type {Record<string, string | number>} */
  let live = {};

  try {
    const builder = LIVE_METRIC_BUILDERS[sectionId];
    if (builder) live = builder();
  } catch {
    live = {};
  }

  const defs = getWorkspaceHeaderKpiDefs(sectionId);
  /** @type {Record<string, string | number>} */
  const values = {};
  /** @type {Record<string, WorkspaceHeaderKpiSource>} */
  const sources = {};

  defs.forEach((def) => {
    const picked = pickMetric(live, placeholders, def.valueKey);
    values[def.valueKey] = picked.value;
    sources[def.valueKey] = picked.source;
  });

  return { values, sources };
}

/**
 * @param {string} sectionId
 * @returns {Array<{ id: string, label: string, display: string, source: WorkspaceHeaderKpiSource }>}
 */
export function getWorkspaceHeaderKpiItems(sectionId) {
  const defs = getWorkspaceHeaderKpiDefs(sectionId);
  const { values, sources } = buildWorkspaceHeaderMetrics(sectionId);

  return defs.map((def) => ({
    id: def.id,
    label: def.label,
    display: formatWorkspaceHeaderKpiValue(values[def.valueKey], def),
    source: sources[def.valueKey] ?? "placeholder",
  }));
}
