/**
 * Project TITAN V1.0 — Tab별 통계 분석 (생산 · 품질 · 출고 · 영업)
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { getStatisticsScope, getDimensionField } from "../config/statisticsDashboard";
import { getSessionProductionRecords } from "./productionRecords";
import { getInspectionLogs } from "./inspectionLogSession";
import { getSessionDefectRecords } from "./defectHistorySession";
import { getShipmentEvents, getTransactionStatements } from "./titanHistorySession";
import {
  getCompletedProductionRecords,
  getProductionResultsDisplayStatus,
  getRecordWorkDate,
  isWithinAnalysisPeriod,
} from "./productionAnalytics";
import { normalizeProductUnit } from "./productUnits";
import {
  buildStatisticsKpiCards,
  buildInquiryCompanySummaryRows,
  buildInquiryDashboardCharts,
  formatStatisticsRowQty,
  getStatisticsQuantityUnitLabel,
  shiftReferenceDate,
} from "./statisticsAnalytics";

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isInPeriod(dateValue, period, referenceDate) {
  return isWithinAnalysisPeriod(dateValue, period, referenceDate);
}

function isInSearchDateRange(dateValue, search) {
  const date = dateValue || "";
  if (search.periodFrom && date < search.periodFrom) return false;
  if (search.periodTo && date > search.periodTo) return false;
  return true;
}

function matchesUnit(recordUnit, unitFilter) {
  if (!unitFilter) return true;
  return normalizeProductUnit(recordUnit) === normalizeProductUnit(unitFilter);
}

function matchesTabSearch(row, search, extraKeys = []) {
  const record = {
    company: row.company,
    partName: row.partName,
    partNo: row.partNo,
    material: row.material,
  };
  if (!matchesBasicSearch(search, record)) return false;

  for (const key of extraKeys) {
    if (!search[key]?.trim()) continue;
    if (!String(row[key] ?? "").toLowerCase().includes(search[key].toLowerCase())) return false;
  }
  if (search.unit && normalizeProductUnit(row.unit) !== normalizeProductUnit(search.unit)) return false;
  return true;
}

function filterByDimension(rows, scope, dimensionId, dimensionValue) {
  if (!dimensionValue) return rows;
  const field = getDimensionField(scope, dimensionId);
  return rows.filter((row) => String(row[field] ?? "") === dimensionValue);
}

function getDimensionOptions(rows, field) {
  const values = [...new Set(rows.map((row) => row[field]).filter((v) => v && v !== "—"))].sort((a, b) =>
    String(a).localeCompare(String(b), "ko")
  );
  return values.map((value) => ({ value, label: value }));
}

function sumQty(rows, key, unitFilter) {
  if (unitFilter) {
    return rows
      .filter((row) => normalizeProductUnit(row.unit) === normalizeProductUnit(unitFilter))
      .reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
  }
  const totals = new Map();
  rows.forEach((row) => {
    const unit = normalizeProductUnit(row.unit, "EA");
    totals.set(unit, (totals.get(unit) || 0) + (Number(row[key]) || 0));
  });
  return [...totals.entries()]
    .filter(([, qty]) => qty > 0)
    .map(([unit, qty]) => `${qty.toLocaleString("ko-KR")} ${unit === "KG" ? "kg" : unit}`)
    .join(" · ");
}

function formatQtyKpi(rows, key, unitFilter) {
  if (unitFilter) {
    const unit = normalizeProductUnit(unitFilter);
    const total = rows
      .filter((row) => normalizeProductUnit(row.unit) === unit)
      .reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
    return { value: total.toLocaleString("ko-KR"), unit: unit === "KG" ? "kg" : unit, numeric: total };
  }
  return { value: sumQty(rows, key, ""), unit: "", numeric: null };
}

function topShareLabel(rows, groupField, valueKey) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row[groupField] || "—";
    if (key === "—") return;
    groups.set(key, (groups.get(key) || 0) + (Number(row[valueKey]) || 0));
  });
  const total = [...groups.values()].reduce((sum, v) => sum + v, 0);
  if (total <= 0) return { value: "0", unit: "%", numeric: 0 };
  const top = [...groups.entries()].sort((a, b) => b[1] - a[1])[0];
  const pct = Math.round((top[1] / total) * 1000) / 10;
  return { value: String(pct), unit: "%", numeric: pct, sub: top[0] };
}

function bucketMonth(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function aggregateByField(rows, field, valueKey) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row[field] || "—";
    if (key === "—") return;
    groups.set(key, (groups.get(key) || 0) + (Number(row[valueKey]) || 0));
  });
  return [...groups.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function aggregateMonthly(rows, dateKey, valueKey, isRate = false) {
  const groups = new Map();
  const counts = new Map();
  rows.forEach((row) => {
    const key = bucketMonth(row[dateKey]);
    if (!key) return;
    if (isRate) {
      groups.set(key, (groups.get(key) || 0) + (row.judgment === "합격" ? 1 : 0));
      counts.set(key, (counts.get(key) || 0) + 1);
    } else {
      groups.set(key, (groups.get(key) || 0) + (Number(row[valueKey]) || 0));
    }
  });
  return [...groups.entries()]
    .map(([label, value]) => ({
      label,
      value: isRate ? Math.round((value / (counts.get(label) || 1)) * 1000) / 10 : value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function narrowForSelectedRow(rows, selectedRow) {
  if (!selectedRow) return rows;
  return rows.filter(
    (row) => row.company === selectedRow.company && normalizeProductUnit(row.unit) === normalizeProductUnit(selectedRow.unit)
  );
}

function buildProductionRows(period, referenceDate, search, unitFilter) {
  const records = getSessionProductionRecords().filter((record) => {
    const date = getRecordWorkDate(record) || record.incomingDate;
    return isInPeriod(date, period, referenceDate) && isInSearchDateRange(date, search);
  });

  let rows = records.map((record) => ({
    id: record.id,
    company: record.company || "—",
    partName: record.partName || "—",
    partNo: record.partNo || "—",
    material: record.material || "—",
    processName: getProductionProcessName(record) || "—",
    equipment: record.equipment || "—",
    worker: record.registrar || record.worker || "—",
    productionQty: Number(record.qty) || 0,
    unit: normalizeProductUnit(record.unit, "EA"),
    workDate: getRecordWorkDate(record) || record.incomingDate || "—",
    status: getProductionResultsDisplayStatus(record)?.label || "—",
  }));

  if (rows.length === 0) {
    return rows;
  }

  return rows
    .filter((row) => matchesUnit(row.unit, unitFilter || search.unit))
    .filter((row) => matchesTabSearch(row, search, ["equipment", "process", "worker"]));
}

function buildQualityRows(period, referenceDate, search, unitFilter) {
  let rows = getInspectionLogs().map((log) => ({
    id: log.id,
    company: log.company || "—",
    partName: log.partName || "—",
    partNo: log.partNo || "—",
    material: log.material || "—",
    processName: log.process || "—",
    assignee: log.assignee || "—",
    inspectionDate: log.inspectionDate || "—",
    judgment: log.judgment || "—",
    reprocess: log.category === "재검사" ? "Y" : "N",
    unit: normalizeProductUnit(log.unit, "EA"),
    defectQty: log.judgment === "불합격" ? 1 : 0,
  }));

  rows = rows.filter((row) => isInPeriod(row.inspectionDate, period, referenceDate) && isInSearchDateRange(row.inspectionDate, search));

  if (rows.length === 0) {
    return rows;
  }

  return rows
    .filter((row) => matchesUnit(row.unit, unitFilter || search.unit))
    .filter((row) => matchesTabSearch(row, search, ["assignee", "process"]))
    .filter((row) => !search.judgment || row.judgment === search.judgment);
}

function buildShipmentRows(period, referenceDate, search, unitFilter) {
  const events = getShipmentEvents();
  let rows = events.map((event) => ({
    id: event.id,
    company: event.company || "—",
    partName: event.partName || "—",
    partNo: event.partNo || "—",
    material: "—",
    shipmentQty: Number(event.shipQty) || 0,
    unit: normalizeProductUnit(event.unit, "EA"),
    shipDate: event.shippedAt || "—",
    manager: event.shippedBy || "—",
  }));

  rows = rows.filter((row) => isInPeriod(row.shipDate, period, referenceDate) && isInSearchDateRange(row.shipDate, search));

  if (rows.length === 0) {
    return rows;
  }

  return rows
    .filter((row) => matchesUnit(row.unit, unitFilter || search.unit))
    .filter((row) => matchesTabSearch(row, search, ["manager"]));
}

function buildSalesRows(period, referenceDate, search, unitFilter) {
  return buildShipmentRows(period, referenceDate, search, unitFilter);
}

function computeProductionKpi(rows, unitFilter) {
  const qty = formatQtyKpi(rows, "productionQty", unitFilter);
  const completed = rows.filter((row) => row.status === "생산완료" || row.status === "출고대기" || row.status === "출고완료").length;
  const inProgress = rows.filter((row) => row.status === "생산진행" || row.status === "진행중").length;
  const equipmentSet = new Set(rows.map((row) => row.equipment).filter((v) => v && v !== "—"));
  const avgNumeric = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.productionQty, 0) / rows.length)
    : 0;
  const topProcess = topShareLabel(rows, "processName", "productionQty");

  return {
    productionQty: qty.value,
    productionUnit: qty.unit,
    completedCount: completed,
    inProgressCount: inProgress,
    avgProductionQty: unitFilter
      ? `${avgNumeric.toLocaleString("ko-KR")}`
      : avgNumeric.toLocaleString("ko-KR"),
    avgProductionUnit: qty.unit,
    equipmentRunCount: equipmentSet.size,
    topProcessShare: topProcess.value,
    topProcessUnit: "%",
  };
}

function computeQualityKpi(rows) {
  const total = rows.length;
  const pass = rows.filter((row) => row.judgment === "합격").length;
  const fail = rows.filter((row) => row.judgment === "불합격").length;
  const reprocess = rows.filter((row) => row.reprocess === "Y").length;
  const passRate = total ? Math.round((pass / total) * 1000) / 10 : 0;
  const defectRate = total ? Math.round((fail / total) * 1000) / 10 : 0;
  const reprocessRate = total ? Math.round((reprocess / total) * 1000) / 10 : 0;

  return {
    inspectionCount: total,
    passCount: pass,
    failCount: fail,
    passRate,
    defectRate,
    reprocessRate,
  };
}

function computeShipmentKpi(rows, unitFilter) {
  const qty = formatQtyKpi(rows, "shipmentQty", unitFilter);
  const companies = new Set(rows.map((row) => row.company));
  const statements = getTransactionStatements().length;
  const avg = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.shipmentQty, 0) / rows.length)
    : 0;
  const productionTotal = getSessionProductionRecords().reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
  const shipTotal = rows.reduce((sum, row) => sum + row.shipmentQty, 0);
  const ratio = productionTotal ? Math.round((shipTotal / productionTotal) * 1000) / 10 : 0;

  return {
    shipmentQty: qty.value,
    shipmentUnit: qty.unit,
    completedCount: rows.length,
    companyCount: companies.size,
    avgShipmentQty: unitFilter ? avg.toLocaleString("ko-KR") : avg.toLocaleString("ko-KR"),
    avgShipmentUnit: qty.unit,
    statementCount: statements || rows.length,
    shipmentRatio: ratio,
  };
}

function computeSalesKpi(rows, unitFilter) {
  const shipment = computeShipmentKpi(rows, unitFilter);
  const items = new Set(rows.map((row) => row.partNo));
  const topCompany = topShareLabel(rows, "company", "shipmentQty");
  const topItem = topShareLabel(rows, "partName", "shipmentQty");

  return {
    totalShipmentQty: shipment.shipmentQty,
    totalShipmentUnit: shipment.shipmentUnit,
    companyCount: shipment.companyCount,
    itemCount: items.size,
    avgShipmentQty: shipment.avgShipmentQty,
    avgShipmentUnit: shipment.avgShipmentUnit,
    topCompanyShare: topCompany.value,
    topItemShare: topItem.value,
  };
}

function aggregateMonthlyCount(rows, dateKey) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = bucketMonth(row[dateKey]);
    if (!key) return;
    groups.set(key, (groups.get(key) || 0) + 1);
  });
  return [...groups.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildQualityRateBars(rows) {
  const total = rows.length;
  if (!total) {
    return [
      { label: "합격률", value: 0 },
      { label: "불량률", value: 0 },
      { label: "재처리율", value: 0 },
    ];
  }
  const pass = rows.filter((row) => row.judgment === "합격").length;
  const fail = rows.filter((row) => row.judgment === "불합격").length;
  const reprocess = rows.filter((row) => row.reprocess === "Y").length;
  return [
    { label: "합격률", value: Math.round((pass / total) * 1000) / 10 },
    { label: "불량률", value: Math.round((fail / total) * 1000) / 10 },
    { label: "재처리율", value: Math.round((reprocess / total) * 1000) / 10 },
  ];
}

function buildCharts(scope, rows, selectedRow, unitFilter) {
  const chartRows = narrowForSelectedRow(rows, selectedRow);
  const unitLabel = getStatisticsQuantityUnitLabel(unitFilter);

  return scope.charts.map((chart) => {
    if (chart.type === "line") {
      const dateKey = scope.id === "quality" ? "inspectionDate" : scope.id === "production" ? "workDate" : "shipDate";
      if (chart.valueKey === "count") {
        return { ...chart, items: aggregateMonthlyCount(chartRows, dateKey), unitLabel: "건" };
      }
      const items =
        scope.id === "quality" && chart.valueKey === "passRate"
          ? aggregateMonthly(chartRows, dateKey, chart.valueKey, true)
          : aggregateMonthly(chartRows, dateKey, chart.valueKey);
      return { ...chart, items, unitLabel: chart.unitLabel ?? unitLabel };
    }
    if (chart.type === "bar") {
      if (chart.metric === "qualityRates") {
        return { ...chart, items: buildQualityRateBars(chartRows), unitLabel: "%" };
      }
      const items = aggregateByField(chartRows, chart.groupField, chart.valueKey).slice(0, 6);
      return { ...chart, items, unitLabel };
    }
    if (chart.type === "pie") {
      const items = aggregateByField(chartRows, chart.groupField, chart.valueKey).slice(0, 5);
      return { ...chart, items, unitLabel };
    }
    return { ...chart, items: [], unitLabel };
  });
}

function mapListRow(tabId, row) {
  if (tabId === "production") {
    return {
      ...row,
      productionQtyLabel: formatStatisticsRowQty(row.productionQty, row.unit),
      unitLabel: row.unit === "KG" ? "kg" : row.unit,
      raw: row,
    };
  }
  if (tabId === "quality") {
    return {
      ...row,
      reprocessLabel: row.reprocess === "Y" ? "Y" : "N",
      raw: row,
    };
  }
  if (tabId === "shipment" || tabId === "sales") {
    return {
      ...row,
      shipmentQtyLabel: formatStatisticsRowQty(row.shipmentQty, row.unit),
      unitLabel: row.unit === "KG" ? "kg" : row.unit,
      raw: row,
    };
  }
  return { ...row, raw: row };
}

const ROW_BUILDERS = {
  production: buildProductionRows,
  quality: buildQualityRows,
  shipment: buildShipmentRows,
  sales: buildSalesRows,
};

const KPI_COMPUTERS = {
  production: computeProductionKpi,
  quality: computeQualityKpi,
  shipment: computeShipmentKpi,
  sales: computeSalesKpi,
};

export function createEmptyTabStatisticsSearch(tabId) {
  const base = { company: "", partName: "", partNo: "", material: "", unit: "", periodFrom: "", periodTo: "" };
  if (tabId === "production") return { ...base, equipment: "", process: "", worker: "" };
  if (tabId === "quality") return { ...base, assignee: "", process: "", judgment: "" };
  if (tabId === "shipment") return { ...base, manager: "" };
  return base;
}

export function buildTabStatistics(tabId, options) {
  const {
    period,
    referenceDate,
    search = {},
    unitFilter = "",
    dimensionId,
    dimensionValue = "",
    selectedRow = null,
  } = options;

  const scope = getStatisticsScope(tabId);

  if (scope.useInquiryAnalytics) {
    const inquiry = buildStatisticsKpiCards(period, referenceDate, search, unitFilter);
    const summaryRows = buildInquiryCompanySummaryRows(period, referenceDate, search, unitFilter);
    const inquiryDashboard = buildInquiryDashboardCharts(period, referenceDate, selectedRow, unitFilter, search);

    return {
      kpi: inquiry.current,
      delta: inquiry.delta,
      rows: summaryRows.map((row) => ({
        ...row,
        raw: row,
      })),
      dimensionOptions: [],
      inquiryDashboard,
      charts: [],
      scopeLabel: selectedRow ? selectedRow.company : scope.pageTitle,
    };
  }

  const buildRows = ROW_BUILDERS[tabId];
  const computeKpi = KPI_COMPUTERS[tabId];
  const filterUnit = unitFilter || search.unit || "";

  let rows = buildRows(period, referenceDate, search, filterUnit);
  rows = filterByDimension(rows, scope, dimensionId, dimensionValue).map((row, index) => ({
    ...row,
    no: index + 1,
  }));

  const kpi = computeKpi(rows, filterUnit);
  const previousDate = shiftReferenceDate(period, referenceDate, -1);
  const previousRows = filterByDimension(
    buildRows(period, previousDate, search, filterUnit),
    scope,
    dimensionId,
    dimensionValue
  );
  const previousKpi = computeKpi(previousRows, filterUnit);

  const delta = {};
  scope.kpiItems.forEach((item) => {
    const curr = Number(kpi[item.id]) || 0;
    const prev = Number(previousKpi[item.id]) || 0;
    if (item.quantity && !filterUnit) {
      delta[item.id] = null;
      return;
    }
    if (prev <= 0) {
      delta[item.id] = curr > 0 ? 100 : 0;
      return;
    }
    delta[item.id] = Math.round(((curr - prev) / prev) * 1000) / 10;
  });

  const dimensionField = getDimensionField(scope, dimensionId);
  const dimensionOptions = getDimensionOptions(buildRows(period, referenceDate, search, filterUnit), dimensionField);

  return {
    kpi,
    delta,
    rows: rows.map((row) => mapListRow(tabId, row)),
    dimensionOptions,
    charts: buildCharts(scope, rows, selectedRow, filterUnit),
    scopeLabel: selectedRow
      ? `${selectedRow.company}${selectedRow.partName !== "—" ? ` · ${selectedRow.partName}` : ""}`
      : scope.pageTitle,
  };
}
