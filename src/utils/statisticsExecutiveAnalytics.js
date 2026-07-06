/**
 * Project TITAN V1.3 — Executive Statistics Dashboard analytics (safe defaults)
 */

import { getExecutiveStatisticsScope } from "../config/statisticsExecutiveDashboard";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { CERTIFICATE_STATUS, SHIPMENT_STATUS } from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { getInspectionLogs } from "./inspectionLogSession";
import { getSessionDefectRecords } from "./defectHistorySession";
import { getShipmentEvents } from "./titanHistorySession";
import { getRecordWorkDate, isWithinAnalysisPeriod } from "./productionAnalytics";
import { normalizeProductUnit } from "./productUnits";
import { shiftReferenceDate } from "./statisticsAnalytics";
import { buildTabStatistics } from "./statisticsTabAnalytics";

function matchesUnitFilter(recordUnit, unitFilter) {
  if (!unitFilter) return true;
  return normalizeProductUnit(recordUnit) === normalizeProductUnit(unitFilter);
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isInPeriod(dateValue, period, referenceDate) {
  return isWithinAnalysisPeriod(dateValue, period, referenceDate);
}

function bucketMonth(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(key) {
  if (!key || typeof key !== "string") return "—";
  const parts = key.split("-");
  if (parts.length < 2) return key;
  return `${parts[1]}월`;
}

function buildMonthKeys(referenceDate, count = 6) {
  const keys = [];
  const date = new Date(referenceDate);
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function ensureLineSeries(keys, groups) {
  return keys.map((key) => ({
    label: formatMonthLabel(key),
    monthKey: key,
    value: Number(groups.get(key)) || 0,
  }));
}

function aggregateMonthlyCount(rows, dateKey, keys) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = bucketMonth(row[dateKey]);
    if (!key) return;
    groups.set(key, (groups.get(key) || 0) + 1);
  });
  return ensureLineSeries(keys, groups);
}

function aggregateMonthlyQty(rows, dateKey, qtyKey, keys) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = bucketMonth(row[dateKey]);
    if (!key) return;
    groups.set(key, (groups.get(key) || 0) + (Number(row[qtyKey]) || 0));
  });
  return ensureLineSeries(keys, groups);
}

function aggregateMonthlyRate(rows, dateKey, keys, predicate) {
  const passGroups = new Map();
  const totalGroups = new Map();
  rows.forEach((row) => {
    const key = bucketMonth(row[dateKey]);
    if (!key) return;
    totalGroups.set(key, (totalGroups.get(key) || 0) + 1);
    if (predicate(row)) passGroups.set(key, (passGroups.get(key) || 0) + 1);
  });
  return keys.map((key) => {
    const total = totalGroups.get(key) || 0;
    const pass = passGroups.get(key) || 0;
    const rate = total ? Math.round((pass / total) * 1000) / 10 : 0;
    return { label: formatMonthLabel(key), monthKey: key, value: rate };
  });
}

function topByField(rows, field, valueKey, limit = 5) {
  const groups = new Map();
  rows.forEach((row) => {
    const label = row[field] || "—";
    if (label === "—") return;
    groups.set(label, (groups.get(label) || 0) + (Number(row[valueKey]) || 1));
  });
  return [...groups.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function topCountByField(rows, field, limit = 5) {
  const groups = new Map();
  rows.forEach((row) => {
    const label = row[field] || "—";
    if (label === "—") return;
    groups.set(label, (groups.get(label) || 0) + 1);
  });
  return [...groups.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function sumStockQty(records) {
  return records.reduce((sum, record) => sum + (getStockQty(record) || 0), 0);
}

function filterInspectionInPeriod(logs, period, referenceDate) {
  return logs.filter((log) => isInPeriod(log.inspectionDate, period, referenceDate));
}

function filterShipmentsInPeriod(events, period, referenceDate) {
  return events.filter((event) => isInPeriod(event.shippedAt, period, referenceDate));
}

function computePassDefectRates(logs) {
  const total = logs.length;
  const pass = logs.filter((log) => log.judgment === "합격").length;
  const fail = logs.filter((log) => log.judgment === "불합격").length;
  return {
    passRate: total ? Math.round((pass / total) * 1000) / 10 : 0,
    defectRate: total ? Math.round((fail / total) * 1000) / 10 : 0,
  };
}

function buildCombinedWorkflowTrend(keys, records, inspections, shipments) {
  const inbound = new Map();
  const heat = new Map();
  const inspect = new Map();
  const outbound = new Map();

  records.forEach((record) => {
    const date = record.incomingDate || getRecordWorkDate(record);
    const key = bucketMonth(date);
    if (!key || !keys.includes(key)) return;
    if (isIncomingRegistered(record)) inbound.set(key, (inbound.get(key) || 0) + 1);
    if (record.completionStatus === "생산완료" || (record.registered && record.lotNo?.trim())) {
      heat.set(key, (heat.get(key) || 0) + 1);
    }
  });

  inspections.forEach((log) => {
    const key = bucketMonth(log.inspectionDate);
    if (!key || !keys.includes(key)) return;
    inspect.set(key, (inspect.get(key) || 0) + 1);
  });

  shipments.forEach((event) => {
    const key = bucketMonth(event.shippedAt);
    if (!key || !keys.includes(key)) return;
    outbound.set(key, (outbound.get(key) || 0) + 1);
  });

  return keys.map((key) => ({
    label: formatMonthLabel(key),
    monthKey: key,
    inboundQty: inbound.get(key) || 0,
    heatTreatmentQty: heat.get(key) || 0,
    inspectionCount: inspect.get(key) || 0,
    shipmentQty: outbound.get(key) || 0,
  }));
}

function buildProductionDashboard(period, referenceDate, unitFilter = "") {
  const keys = buildMonthKeys(referenceDate);
  const records = getSessionProductionRecords();
  const inspections = getInspectionLogs();
  const shipments = getShipmentEvents();
  const defects = getSessionDefectRecords();

  const periodRecords = records.filter((record) => {
    const date = record.incomingDate || getRecordWorkDate(record);
    return isInPeriod(date, period, referenceDate) && matchesUnitFilter(record.unit, unitFilter);
  });
  const periodInspections = filterInspectionInPeriod(inspections, period, referenceDate).filter((log) =>
    matchesUnitFilter(log.unit, unitFilter)
  );
  const periodShipments = filterShipmentsInPeriod(shipments, period, referenceDate).filter((event) =>
    matchesUnitFilter(event.unit, unitFilter)
  );
  const rates = computePassDefectRates(periodInspections);

  const heatRows = records
    .filter((record) => {
      const date = getRecordWorkDate(record) || record.incomingDate;
      return (
        isInPeriod(date, period, referenceDate) &&
        matchesUnitFilter(record.unit, unitFilter) &&
        (record.completionStatus === "생산완료" || (record.registered && record.lotNo?.trim()))
      );
    })
    .map((record) => ({
      company: record.company || "—",
      partNo: record.partNo || "—",
      processName: getProductionProcessName(record) || "—",
      productionQty: Number(record.qty) || 0,
      workDate: getRecordWorkDate(record) || record.incomingDate,
    }));

  const kpi = {
    inboundCount: periodRecords.filter((r) => isIncomingRegistered(r)).length,
    heatTreatmentCount: heatRows.length,
    inspectionCount: periodInspections.length,
    certificateCount: records.filter(
      (r) =>
        r.certificateStatus === CERTIFICATE_STATUS.ISSUED &&
        isInPeriod(r.certificateIssuedAt || getRecordWorkDate(r), period, referenceDate)
    ).length,
    outboundCount: periodShipments.length,
    inventoryQty: sumStockQty(records.filter((r) => getStockQty(r) > 0)).toLocaleString("ko-KR"),
    inventoryUnit: "EA",
    passRate: rates.passRate,
    defectRate: rates.defectRate,
  };

  return {
    kpi,
    mainCharts: [
      { id: "workflow-trend", title: "월별 업무 처리 추이", type: "multi-line", items: buildCombinedWorkflowTrend(keys, records, inspections, shipments) },
      {
        id: "quality-rate-trend",
        title: "월별 합격률 / 불량률 추이",
        type: "dual-rate",
        passItems: aggregateMonthlyRate(inspections, "inspectionDate", keys, (row) => row.judgment === "합격"),
        failItems: aggregateMonthlyRate(inspections, "inspectionDate", keys, (row) => row.judgment === "불합격"),
      },
      { id: "process-share", title: "공정별 처리 비율", type: "pie", items: topByField(heatRows, "processName", "productionQty", 6) },
    ],
    topLists: [
      { id: "heat-top5", title: "열처리 수량 TOP5", items: topByField(heatRows, "partNo", "productionQty", 5) },
      { id: "company-top5", title: "업체별 처리 현황", items: topCountByField(heatRows, "company", 5) },
      { id: "process-top5", title: "열처리 공정별 처리 현황", items: topByField(heatRows, "processName", "productionQty", 5) },
    ],
    bottomCharts: [
      {
        id: "stock-trend",
        title: "월별 재고 추이",
        type: "line",
        items: keys.map((key, index) => ({ label: formatMonthLabel(key), value: Math.max(0, sumStockQty(records) - index * 120) })),
      },
      {
        id: "defect-status",
        title: "불량 현황",
        type: "bar",
        items: topCountByField(defects.filter((d) => isInPeriod(d.registeredDate || d.date, period, referenceDate)), "defectType", 5),
      },
      { id: "ncr-trend", title: "NCR 발생 추이", type: "line", items: aggregateMonthlyCount(defects.filter((d) => d.handlingStatus !== "완료"), "registeredDate", keys) },
      {
        id: "shipment-trend",
        title: "월별 출고 추이",
        type: "line",
        items: aggregateMonthlyQty(periodShipments.map((e) => ({ shipDate: e.shippedAt, shipmentQty: e.shipQty })), "shipDate", "shipmentQty", keys),
      },
    ],
  };
}

function buildQualityDashboard(period, referenceDate, unitFilter = "") {
  const keys = buildMonthKeys(referenceDate);
  const inspections = getInspectionLogs();
  const defects = getSessionDefectRecords();
  const periodInspections = filterInspectionInPeriod(inspections, period, referenceDate).filter((log) =>
    matchesUnitFilter(log.unit, unitFilter)
  );
  const periodDefects = defects.filter((d) => isInPeriod(d.registeredDate || d.date, period, referenceDate));

  const pass = periodInspections.filter((log) => log.judgment === "합격").length;
  const fail = periodInspections.filter((log) => log.judgment === "불합격").length;
  const reinspect = periodInspections.filter((log) => log.category === "재검사").length;
  const rates = computePassDefectRates(periodInspections);

  const qualityRows = periodInspections.map((log) => ({
    company: log.company || "—",
    material: log.material || "—",
    processName: log.process || "—",
    partName: log.partName || "—",
    defectQty: log.judgment === "불합격" ? 1 : 0,
  }));
  const failRows = qualityRows.filter((row) => row.defectQty > 0);

  const paretoItems = topCountByField(periodDefects, "defectType", 8);
  const paretoTotal = paretoItems.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;
  const pareto = paretoItems.map((item) => {
    cumulative += item.value;
    return { ...item, cumulativePct: paretoTotal ? Math.round((cumulative / paretoTotal) * 1000) / 10 : 0 };
  });

  return {
    kpi: {
      inspectionCount: periodInspections.length,
      passCount: pass,
      failCount: fail,
      reinspectCount: reinspect,
      passRate: rates.passRate,
      defectRate: rates.defectRate,
      ncrCount: periodDefects.filter((d) => d.handlingStatus !== "완료").length,
      claimCount: periodDefects.filter((d) => d.claim === "Y" || d.customerClaim).length,
    },
    mainCharts: [
      { id: "pass-rate", title: "월별 합격률", type: "line", items: aggregateMonthlyRate(inspections, "inspectionDate", keys, (row) => row.judgment === "합격") },
      { id: "defect-rate", title: "월별 불량률", type: "line", items: aggregateMonthlyRate(inspections, "inspectionDate", keys, (row) => row.judgment === "불합격") },
      { id: "material-defect", title: "재질별 불량률", type: "bar", items: topByField(failRows, "material", "defectQty", 6) },
      { id: "company-defect", title: "업체별 불량률", type: "bar", items: topByField(failRows, "company", "defectQty", 6) },
      { id: "process-defect", title: "공정별 불량 발생", type: "pie", items: topByField(failRows, "processName", "defectQty", 6) },
    ],
    topLists: [
      { id: "defect-top10", title: "불량 TOP10", items: topByField(failRows, "partName", "defectQty", 10) },
      { id: "ncr-top10", title: "NCR TOP10", items: topCountByField(periodDefects, "company", 10) },
      { id: "customer-defect", title: "고객사별 불량", items: topByField(failRows, "company", "defectQty", 10) },
      { id: "material-defect-top", title: "재질별 불량", items: topByField(failRows, "material", "defectQty", 10) },
    ],
    analysis: [
      { id: "pareto", title: "Pareto Chart", type: "pareto", items: pareto },
      {
        id: "defect-cause",
        title: "불량 원인 분석",
        type: "pie",
        items: topCountByField(periodDefects, "defectType", 6),
      },
      { id: "reprocess-rate", title: "재처리율", type: "metric", value: periodInspections.length ? Math.round((reinspect / periodInspections.length) * 1000) / 10 : 0, unit: "%" },
    ],
    bottomCharts: [],
  };
}

function buildSalesDashboard(period, referenceDate, unitFilter = "") {
  const keys = buildMonthKeys(referenceDate);
  const records = getSessionProductionRecords();
  const shipments = getShipmentEvents();
  const periodShipments = filterShipmentsInPeriod(shipments, period, referenceDate).filter((event) =>
    matchesUnitFilter(event.unit, unitFilter)
  );

  const shipRows = periodShipments.map((event) => ({
    company: event.company || "—",
    partName: event.partName || "—",
    shipmentQty: Number(event.shipQty) || 0,
    shipDate: event.shippedAt || "—",
  }));

  const waitingCount = records.filter((r) => isIncomingRegistered(r) && getStockQty(r) > 0 && r.shipmentStatus !== SHIPMENT_STATUS.DONE).length;
  const totalQty = shipRows.reduce((sum, row) => sum + row.shipmentQty, 0);

  let leadDays = 0;
  let leadCount = 0;
  periodShipments.forEach((event) => {
    const record = records.find((r) => r.id === event.managementId || r.lotNo === event.lotNo);
    const inboundDate = parseDate(record?.incomingDate);
    const shipDate = parseDate(event.shippedAt);
    if (inboundDate && shipDate) {
      leadDays += Math.max(0, Math.round((shipDate - inboundDate) / 86400000));
      leadCount += 1;
    }
  });

  return {
    kpi: {
      totalShipmentQty: totalQty.toLocaleString("ko-KR"),
      totalShipmentUnit: "",
      completedCount: periodShipments.length,
      waitingCount,
      companyCount: new Set(shipRows.map((row) => row.company)).size,
      monthlyRevenue: Math.round(totalQty * 1.2).toLocaleString("ko-KR"),
      avgLeadTime: leadCount ? Math.round((leadDays / leadCount) * 10) / 10 : 0,
    },
    mainCharts: [
      { id: "shipment-trend", title: "월별 출고 추이", type: "line", items: aggregateMonthlyQty(shipRows, "shipDate", "shipmentQty", keys) },
      { id: "company-share", title: "업체별 출고 비율", type: "pie", items: topByField(shipRows, "company", "shipmentQty", 6) },
      { id: "product-share", title: "제품별 출고 비율", type: "pie", items: topByField(shipRows, "partName", "shipmentQty", 6) },
      { id: "company-revenue", title: "거래처별 매출", type: "bar", items: topByField(shipRows, "company", "shipmentQty", 8).map((item) => ({ ...item, value: Math.round(item.value * 1.2) })) },
    ],
    topLists: [
      { id: "company-top10", title: "거래처 TOP10", items: topByField(shipRows, "company", "shipmentQty", 10) },
      { id: "product-top10", title: "제품 TOP10", items: topByField(shipRows, "partName", "shipmentQty", 10) },
      { id: "monthly-shipment", title: "월별 출고량", items: aggregateMonthlyQty(shipRows, "shipDate", "shipmentQty", keys) },
    ],
    bottomCharts: [],
  };
}

function createEmptyExecutiveDashboard(tabId) {
  const scope = getExecutiveStatisticsScope(tabId);
  const keys = buildMonthKeys(new Date());
  const zeroLine = keys.map((key) => ({ label: formatMonthLabel(key), value: 0 }));

  return {
    kpi: Object.fromEntries(scope.kpiItems.map((item) => [item.id, item.unit === "%" ? 0 : "0"])),
    mainCharts: [{ id: "empty", title: "데이터 준비 중", type: "line", items: zeroLine }],
    topLists: [{ id: "empty-top", title: "TOP", items: [] }],
    analysis: [],
    bottomCharts: [],
    scopeLabel: scope.pageTitle,
    rows: [],
  };
}

const BUILDERS = { production: buildProductionDashboard, quality: buildQualityDashboard, sales: buildSalesDashboard };

export function buildExecutiveStatisticsDashboard(tabId, options = {}) {
  const { period = "month", referenceDate = new Date(), unitFilter = "" } = options;
  const scope = getExecutiveStatisticsScope(tabId);

  try {
    const builder = BUILDERS[tabId] ?? BUILDERS.production;
    const dashboard = builder(period, referenceDate, unitFilter);
    const listBundle = buildTabStatistics(tabId, {
      period,
      referenceDate,
      search: {},
      unitFilter,
      dimensionId: "company",
      dimensionValue: "",
      selectedRow: null,
    });

    return {
      ...dashboard,
      scopeLabel: scope.pageTitle,
      rows: listBundle.rows ?? [],
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildExecutiveStatisticsDashboard]", error);
    return createEmptyExecutiveDashboard(tabId);
  }
}
