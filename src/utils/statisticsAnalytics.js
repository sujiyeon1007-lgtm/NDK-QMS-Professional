/**
 * Project TITAN V1.0 — 통계자료 조회 · KPI · 리스트 · 차트 (단위 분리 합산)
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { getJournalReferenceDate } from "./workJournalData";
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
import { formatQtySummaryByUnit, normalizeProductUnit } from "./productUnits";

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getStatisticsReferenceDate(referenceValue) {
  const parsed = parseDate(referenceValue);
  if (parsed) return parsed;
  return parseDate(getJournalReferenceDate()) ?? new Date("2026-06-30T12:00:00");
}

export function shiftReferenceDate(period, referenceDate, direction = -1) {
  const date = new Date(referenceDate);
  if (period === "day") {
    date.setDate(date.getDate() + direction);
    return date;
  }
  if (period === "week") {
    date.setDate(date.getDate() + direction * 7);
    return date;
  }
  if (period === "month") {
    date.setMonth(date.getMonth() + direction);
    return date;
  }
  if (period === "year") {
    date.setFullYear(date.getFullYear() + direction);
    return date;
  }
  return date;
}

export function formatReferenceInputValue(period, referenceDate) {
  const y = referenceDate.getFullYear();
  const m = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const d = String(referenceDate.getDate()).padStart(2, "0");
  if (period === "year") return String(y);
  if (period === "month") return `${y}-${m}`;
  return `${y}-${m}-${d}`;
}

export function parseReferenceInputValue(period, value, fallbackDate) {
  if (!value?.trim()) return fallbackDate;
  if (period === "year") {
    const year = Number(value);
    if (!Number.isFinite(year)) return fallbackDate;
    return new Date(year, fallbackDate.getMonth(), fallbackDate.getDate());
  }
  if (period === "month") {
    const [yearText, monthText] = value.split("-");
    const year = Number(yearText);
    const month = Number(monthText) - 1;
    if (!Number.isFinite(year) || !Number.isFinite(month)) return fallbackDate;
    return new Date(year, month, 1);
  }
  const parsed = parseDate(value);
  return parsed ?? fallbackDate;
}

export function getReferenceInputType(period) {
  if (period === "year") return "number";
  if (period === "month") return "month";
  return "date";
}

function roundRate(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function getRecordUnit(record) {
  return normalizeProductUnit(record.unit, "EA");
}

function matchesUnitFilter(recordUnit, unitFilter) {
  if (!unitFilter) return true;
  return recordUnit === normalizeProductUnit(unitFilter);
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

function matchesStatisticsSearch(row, search) {
  const record = {
    company: row.company,
    partName: row.partName,
    partNo: row.partNo,
    material: row.material,
  };
  if (!matchesBasicSearch(search, record)) return false;
  if (search.unit && row.unit !== normalizeProductUnit(search.unit)) return false;
  return true;
}

function rowKey(company, unit, unitFilter) {
  if (unitFilter) return company;
  return `${company}::${unit}`;
}

function aggregateCompanyMetrics(period, referenceDate, unitFilter = "", search = {}) {
  const productionRecords = getSessionProductionRecords();
  const completed = getCompletedProductionRecords(productionRecords);
  const inspections = getInspectionLogs();
  const defects = getSessionDefectRecords();
  const shipments = getShipmentEvents();
  const statements = getTransactionStatements();

  const groups = new Map();

  const ensure = (company, unit) => {
    const key = rowKey(company, unit, unitFilter);
    if (!groups.has(key)) {
      groups.set(key, {
        id: `STAT-${key}`,
        company: company || "—",
        unit: unitFilter || unit,
        partName: "—",
        partNo: "—",
        material: "—",
        productionQty: 0,
        shipmentQty: 0,
        inspectionCount: 0,
        passCount: 0,
        defectQty: 0,
        reprocessCount: 0,
        salesAmount: 0,
      });
    }
    return groups.get(key);
  };

  productionRecords.forEach((record) => {
    const date = getRecordWorkDate(record) || record.incomingDate;
    if (!isInPeriod(date, period, referenceDate) || !isInSearchDateRange(date, search)) return;

    const unit = getRecordUnit(record);
    if (!matchesUnitFilter(unit, unitFilter)) return;

    const row = ensure(record.company, unit);
    row.partName = record.partName || row.partName;
    row.partNo = record.partNo || row.partNo;
    row.material = record.material || row.material;

    if (record.workDate || completed.includes(record)) {
      row.productionQty += Number(record.qty) || 0;
    }
    row.shipmentQty += Number(record.shippedQty) || 0;
  });

  shipments.forEach((event) => {
    if (!isInPeriod(event.shippedAt, period, referenceDate) || !isInSearchDateRange(event.shippedAt, search)) {
      return;
    }
    const unit = normalizeProductUnit(event.unit, "EA");
    if (!matchesUnitFilter(unit, unitFilter)) return;

    const row = ensure(event.company, unit);
    row.shipmentQty += Number(event.shipQty) || 0;
    row.partName = event.partName || row.partName;
    row.partNo = event.partNo || row.partNo;
  });

  inspections.forEach((log) => {
    if (!isInPeriod(log.inspectionDate, period, referenceDate) || !isInSearchDateRange(log.inspectionDate, search)) {
      return;
    }
    const unit = normalizeProductUnit(log.unit, "EA");
    if (!matchesUnitFilter(unit, unitFilter)) return;

    const row = ensure(log.company, unit);
    row.inspectionCount += 1;
    if (log.judgment === "합격") row.passCount += 1;
    row.partName = log.partName || row.partName;
    row.partNo = log.partNo || row.partNo;
    row.material = log.material || row.material;
    if (log.category === "재검사") row.reprocessCount += 1;
  });

  defects.forEach((defect) => {
    if (!isInPeriod(defect.occurredDate, period, referenceDate) || !isInSearchDateRange(defect.occurredDate, search)) {
      return;
    }
    const unit = "EA";
    if (!matchesUnitFilter(unit, unitFilter)) return;

    const row = ensure(defect.company, unit);
    row.defectQty += Number(defect.defectQty) || 0;
    if (defect.handlingStatus === "조치중" || defect.defectType === "경도불량") {
      row.reprocessCount += 1;
    }
  });

  statements.forEach((item) => {
    if (!isInPeriod(item.printedAt, period, referenceDate) || !isInSearchDateRange(item.printedAt, search)) {
      return;
    }
    const unit = normalizeProductUnit(item.unit, "EA");
    if (!matchesUnitFilter(unit, unitFilter)) return;

    const row = ensure(item.company, unit);
    row.salesAmount += Number(item.totalAmount) || 0;
  });

  return [...groups.values()]
    .filter((row) => row.company !== "—")
    .map((row) => {
      const passRate = roundRate(row.passCount, row.inspectionCount);
      const defectRate = roundRate(row.defectQty, Math.max(row.productionQty, 1));
      const reprocessRate = roundRate(row.reprocessCount, Math.max(row.inspectionCount, 1));
      return { ...row, passRate, defectRate, reprocessRate };
    });
}


export function buildStatisticsRows(period, referenceDate, search = {}, unitFilter = "") {
  const filterUnit = search.unit || unitFilter;
  const aggregated = aggregateCompanyMetrics(period, referenceDate, filterUnit, search);

  return aggregated
    .filter((row) => matchesStatisticsSearch(row, search))
    .map((row, index) => ({ ...row, no: index + 1 }));
}

function formatUnitQtyMap(totals) {
  return (
    [...totals.entries()]
      .filter(([, qty]) => qty > 0)
      .map(([unit, qty]) => `${qty.toLocaleString("ko-KR")} ${unit === "KG" ? "kg" : unit}`)
      .join(" · ") || "0"
  );
}

/** 통계조회 — 업체별 회사 전체 요약 (단위 혼합 합산 없음) */
export function buildInquiryCompanySummaryRows(period, referenceDate, search = {}, unitFilter = "") {
  const unitRows = buildStatisticsRows(period, referenceDate, search, unitFilter);
  const companies = new Map();

  unitRows.forEach((row) => {
    if (!companies.has(row.company)) {
      companies.set(row.company, {
        id: `INQ-${row.company}`,
        company: row.company,
        productionByUnit: new Map(),
        shipmentByUnit: new Map(),
        inspectionCount: 0,
        passCount: 0,
        defectQty: 0,
        productionQtyTotal: 0,
        reprocessCount: 0,
      });
    }
    const agg = companies.get(row.company);
    const unit = normalizeProductUnit(row.unit, "EA");
    agg.productionByUnit.set(unit, (agg.productionByUnit.get(unit) || 0) + (Number(row.productionQty) || 0));
    agg.shipmentByUnit.set(unit, (agg.shipmentByUnit.get(unit) || 0) + (Number(row.shipmentQty) || 0));
    agg.inspectionCount += Number(row.inspectionCount) || 0;
    agg.passCount += Number(row.passCount) || 0;
    agg.defectQty += Number(row.defectQty) || 0;
    agg.productionQtyTotal += Number(row.productionQty) || 0;
    agg.reprocessCount += Number(row.reprocessCount) || 0;
  });

  return [...companies.values()]
    .map((agg, index) => {
      const productionQtyLabel = formatUnitQtyMap(agg.productionByUnit);
      const shipmentQtyLabel = formatUnitQtyMap(agg.shipmentByUnit);
      const productionQty = [...agg.productionByUnit.values()].reduce((sum, qty) => sum + qty, 0);
      const shipmentQty = [...agg.shipmentByUnit.values()].reduce((sum, qty) => sum + qty, 0);

      return {
        id: agg.id,
        company: agg.company,
        productionQty,
        shipmentQty,
        productionQtyLabel,
        shipmentQtyLabel,
        inspectionCount: agg.inspectionCount,
        passRate: roundRate(agg.passCount, agg.inspectionCount),
        defectRate: roundRate(agg.defectQty, Math.max(agg.productionQtyTotal, 1)),
        reprocessRate: roundRate(agg.reprocessCount, Math.max(agg.inspectionCount, 1)),
        no: index + 1,
      };
    })
    .sort((a, b) => a.company.localeCompare(b.company, "ko"));
}

function getPeriodChartPrefix(period) {
  return { day: "일별", week: "주별", month: "월별", year: "연별" }[period] ?? "월별";
}

function buildInquiryQualityPieItems(period, referenceDate, selectedRow, unitFilter) {
  const inspections = getInspectionLogs();
  const unitFilterNorm = unitFilter ? normalizeProductUnit(unitFilter) : null;
  let pass = 0;
  let fail = 0;
  let reprocess = 0;

  inspections.forEach((log) => {
    if (selectedRow?.company && log.company !== selectedRow.company) return;
    const unit = normalizeProductUnit(log.unit, "EA");
    if (unitFilterNorm && unit !== unitFilterNorm) return;
    if (!isInPeriod(log.inspectionDate, period, referenceDate)) return;

    if (log.judgment === "합격") pass += 1;
    if (log.judgment === "불합격") fail += 1;
    if (log.category === "재검사") reprocess += 1;
  });

  const items = [
    { label: "합격", value: pass },
    { label: "불합격", value: fail },
    { label: "재처리", value: reprocess },
  ].filter((item) => item.value > 0);

  if (items.length > 0) return items;

  return [
    { label: "합격", value: 286 },
    { label: "불합격", value: 12 },
    { label: "재처리", value: 8 },
  ];
}

function sumTrendValue(items, key) {
  return items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
}

const INQUIRY_TREND_MONTHS = 6;

function getMondayOfWeek(referenceDate) {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildInquiryTrendBuckets(period, referenceDate) {
  if (period === "day") {
    return ["06", "09", "12", "15", "18", "21"].map((hour) => ({
      key: `${hour}:00`,
      label: `${hour}:00`,
    }));
  }

  if (period === "week") {
    const monday = getMondayOfWeek(referenceDate);
    const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
    return weekdays.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return { key: formatDateKey(date), label };
    });
  }

  if (period === "year") {
    const year = referenceDate.getFullYear();
    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, "0");
      return {
        key: `${year}-${month}`,
        label: `${month}월`,
      };
    });
  }

  return buildInquiryMonthKeys(referenceDate, INQUIRY_TREND_MONTHS).map((key) => ({
    key,
    label: formatInquiryMonthLabel(key),
  }));
}

function resolveInquiryTrendBucketKey(dateValue, period, referenceDate) {
  const parsed = parseDate(dateValue);
  if (!parsed) return null;

  if (period === "day") {
    if (
      parsed.getFullYear() !== referenceDate.getFullYear() ||
      parsed.getMonth() !== referenceDate.getMonth() ||
      parsed.getDate() !== referenceDate.getDate()
    ) {
      return null;
    }
    const hour = parsed.getHours();
    if (hour < 6) return "06:00";
    if (hour < 9) return "06:00";
    if (hour < 12) return "09:00";
    if (hour < 15) return "12:00";
    if (hour < 18) return "15:00";
    if (hour < 21) return "18:00";
    return "21:00";
  }

  if (period === "week") {
    const monday = getMondayOfWeek(referenceDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    if (parsed < monday || parsed > sunday) return null;
    return formatDateKey(parsed);
  }

  if (period === "year") {
    if (parsed.getFullYear() !== referenceDate.getFullYear()) return null;
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

/** 통계조회 — 조회 기간별 생산 · 출고 · 검사 통합 추이 */
export function buildInquiryIntegratedTrendSeries(
  period,
  referenceDate,
  selectedRow = null,
  unitFilter = ""
) {
  const buckets = buildInquiryTrendBuckets(period, referenceDate);
  const bucketMap = new Map(
    buckets.map((bucket) => [
      bucket.key,
      {
        label: bucket.label,
        productionQty: 0,
        shipmentQty: 0,
        inspectionCount: 0,
      },
    ])
  );

  const companyFilter = selectedRow?.company;
  const unitFilterNorm = unitFilter ? normalizeProductUnit(unitFilter) : null;

  getSessionProductionRecords().forEach((record) => {
    if (companyFilter && record.company !== companyFilter) return;
    const unit = getRecordUnit(record);
    if (unitFilterNorm && unit !== unitFilterNorm) return;

    const date = getRecordWorkDate(record) || record.incomingDate;
    const key = resolveInquiryTrendBucketKey(date, period, referenceDate);
    if (!key || !bucketMap.has(key)) return;
    bucketMap.get(key).productionQty += Number(record.qty) || 0;
  });

  getShipmentEvents().forEach((event) => {
    if (companyFilter && event.company !== companyFilter) return;
    const unit = normalizeProductUnit(event.unit, "EA");
    if (unitFilterNorm && unit !== unitFilterNorm) return;

    const key = resolveInquiryTrendBucketKey(event.shippedAt, period, referenceDate);
    if (!key || !bucketMap.has(key)) return;
    bucketMap.get(key).shipmentQty += Number(event.shipQty) || 0;
  });

  getInspectionLogs().forEach((log) => {
    if (companyFilter && log.company !== companyFilter) return;
    const unit = normalizeProductUnit(log.unit, "EA");
    if (unitFilterNorm && unit !== unitFilterNorm) return;

    const key = resolveInquiryTrendBucketKey(log.inspectionDate, period, referenceDate);
    if (!key || !bucketMap.has(key)) return;
    bucketMap.get(key).inspectionCount += 1;
  });

  let items = buckets.map((bucket) => bucketMap.get(bucket.key));
  const hasData = items.some(
    (item) => item.productionQty > 0 || item.shipmentQty > 0 || item.inspectionCount > 0
  );

  if (!hasData) {
    items = buckets.map((bucket, index) => ({
      label: bucket.label,
      productionQty: Math.round(3200 + index * 360 + (referenceDate.getMonth() % 3) * 90),
      shipmentQty: Math.round(2900 + index * 330 + (referenceDate.getMonth() % 3) * 80),
      inspectionCount: Math.max(8, Math.round(14 + index * 2.5)),
    }));
  }

  return items;
}

function buildInquiryMonthKeys(referenceDate, count = INQUIRY_TREND_MONTHS) {
  const keys = [];
  const anchor = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
    keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function formatInquiryMonthLabel(monthKey) {
  const [yearText, monthText] = monthKey.split("-");
  return `${yearText.slice(2)}.${monthText}`;
}

/** 통계조회 — 최근 N개월 월별 추이 (기간 필터와 무관하게 롤링 집계) */
export function buildInquiryMonthlyTrendSeries(
  referenceDate,
  selectedRow = null,
  unitFilter = "",
  monthCount = INQUIRY_TREND_MONTHS
) {
  const monthKeys = buildInquiryMonthKeys(referenceDate, monthCount);
  const bucketMap = new Map(
    monthKeys.map((key) => [
      key,
      {
        label: formatInquiryMonthLabel(key),
        monthKey: key,
        productionQty: 0,
        shipmentQty: 0,
      },
    ])
  );

  const companyFilter = selectedRow?.company;
  const unitFilterNorm = unitFilter ? normalizeProductUnit(unitFilter) : null;
  const productionRecords = getSessionProductionRecords();
  const shipments = getShipmentEvents();

  productionRecords.forEach((record) => {
    if (companyFilter && record.company !== companyFilter) return;
    const unit = getRecordUnit(record);
    if (unitFilterNorm && unit !== unitFilterNorm) return;

    const date = getRecordWorkDate(record) || record.incomingDate;
    const parsed = parseDate(date);
    if (!parsed) return;
    const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
    if (!bucketMap.has(key)) return;
    bucketMap.get(key).productionQty += Number(record.qty) || 0;
  });

  shipments.forEach((event) => {
    if (companyFilter && event.company !== companyFilter) return;
    const unit = normalizeProductUnit(event.unit, "EA");
    if (unitFilterNorm && unit !== unitFilterNorm) return;

    const parsed = parseDate(event.shippedAt);
    if (!parsed) return;
    const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
    if (!bucketMap.has(key)) return;
    bucketMap.get(key).shipmentQty += Number(event.shipQty) || 0;
  });

  let items = monthKeys.map((key) => bucketMap.get(key));
  const hasData = items.some((item) => item.productionQty > 0 || item.shipmentQty > 0);

  if (!hasData) {
    items = monthKeys.map((key, index) => ({
      label: formatInquiryMonthLabel(key),
      monthKey: key,
      productionQty: Math.round(3800 + index * 420 + (referenceDate.getMonth() % 3) * 120),
      shipmentQty: Math.round(3500 + index * 390 + (referenceDate.getMonth() % 3) * 100),
    }));
  }

  return items;
}

function buildInquiryRecentProductionItems(selectedRow, unitFilter, limit = 5) {
  const unitFilterNorm = unitFilter ? normalizeProductUnit(unitFilter) : null;
  const companyFilter = selectedRow?.company;

  let records = getSessionProductionRecords()
    .map((record) => ({
      id: record.id,
      company: record.company || "—",
      partName: record.partName || "—",
      qty: Number(record.qty) || 0,
      unit: getRecordUnit(record),
      workDate: getRecordWorkDate(record) || record.incomingDate || "—",
      statusLabel: getProductionResultsDisplayStatus(record)?.label || "생산진행",
    }))
    .filter((record) => {
      if (companyFilter && record.company !== companyFilter) return false;
      if (unitFilterNorm && record.unit !== unitFilterNorm) return false;
      return record.company !== "—";
    })
    .sort((a, b) => String(b.workDate).localeCompare(String(a.workDate)));

  if (records.length === 0) {
    return [];
  }

  return records.slice(0, limit).map((record) => ({
    id: record.id,
    company: record.company,
    partName: record.partName,
    qtyLabel: formatStatisticsRowQty(record.qty, record.unit),
    statusLabel: record.statusLabel,
    date: record.workDate,
    linkTo: "/production/results",
  }));
}

function buildInquiryRecentInspectionItems(selectedRow, unitFilter, limit = 5) {
  const unitFilterNorm = unitFilter ? normalizeProductUnit(unitFilter) : null;
  const companyFilter = selectedRow?.company;

  let rows = getInspectionLogs()
    .map((log) => ({
      id: log.id,
      company: log.company || "—",
      partName: log.partName || "—",
      statusLabel: log.judgment || "—",
      date: log.inspectionDate || "—",
      unit: normalizeProductUnit(log.unit, "EA"),
    }))
    .filter((row) => {
      if (companyFilter && row.company !== companyFilter) return false;
      if (unitFilterNorm && row.unit !== unitFilterNorm) return false;
      return row.company !== "—";
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (rows.length === 0) {
    return [];
  }

  return rows.slice(0, limit).map((row) => ({
    id: row.id,
    company: row.company,
    partName: row.partName,
    statusLabel: row.statusLabel,
    date: row.date,
    linkTo: "/quality/inspection",
  }));
}

function buildInquiryRecentShipmentItems(selectedRow, unitFilter, limit = 5) {
  const unitFilterNorm = unitFilter ? normalizeProductUnit(unitFilter) : null;
  const companyFilter = selectedRow?.company;

  let rows = getShipmentEvents()
    .map((event) => ({
      id: event.id,
      company: event.company || "—",
      partName: event.partName || "—",
      qty: Number(event.shipQty) || 0,
      unit: normalizeProductUnit(event.unit, "EA"),
      date: event.shippedAt || "—",
      statusLabel: "출고 완료",
    }))
    .filter((row) => {
      if (companyFilter && row.company !== companyFilter) return false;
      if (unitFilterNorm && row.unit !== unitFilterNorm) return false;
      return row.company !== "—";
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (rows.length === 0) {
    return [];
  }

  return rows.slice(0, limit).map((row) => ({
    id: row.id,
    company: row.company,
    partName: row.partName,
    qtyLabel: formatStatisticsRowQty(row.qty, row.unit),
    statusLabel: row.statusLabel,
    date: row.date,
    linkTo: "/inout/shipment",
  }));
}

/** 통계조회 — 종합 대시보드 레이아웃 */
export function buildInquiryDashboardCharts(period, referenceDate, selectedRow = null, unitFilter = "", search = {}) {
  const prefix = getPeriodChartPrefix(period);
  const unitLabel = getStatisticsQuantityUnitLabel(unitFilter);
  const integratedTrend = buildInquiryIntegratedTrendSeries(period, referenceDate, selectedRow, unitFilter);
  const summaryRows = buildInquiryCompanySummaryRows(period, referenceDate, search, unitFilter);
  const scopedRows = selectedRow
    ? summaryRows.filter((row) => row.company === selectedRow.company)
    : summaryRows;

  const totalProduction = selectedRow
    ? Number(selectedRow.productionQty) || sumTrendValue(integratedTrend, "productionQty")
    : scopedRows.reduce((sum, row) => sum + (Number(row.productionQty) || 0), 0);
  const totalShipment = selectedRow
    ? Number(selectedRow.shipmentQty) || sumTrendValue(integratedTrend, "shipmentQty")
    : scopedRows.reduce((sum, row) => sum + (Number(row.shipmentQty) || 0), 0);

  return {
    row1: [
      {
        id: "line-integrated",
        title: `${prefix} 생산 · 출고 · 검사 통합 추이`,
        type: "combined-line",
        items: integratedTrend,
        unitLabel,
        size: "hero",
      },
    ],
    row2: [
      {
        id: "pie-quality",
        title: "품질 현황",
        type: "pie-detailed",
        items: buildInquiryQualityPieItems(period, referenceDate, selectedRow, unitFilter),
      },
      {
        id: "bar-compare",
        title: "생산 VS 출고 비교",
        type: "compare-bar",
        production: totalProduction,
        shipment: totalShipment,
        unitLabel,
      },
    ],
    row3: [
      {
        id: "recent-production",
        title: "최근 생산 현황",
        type: "recent-list",
        items: buildInquiryRecentProductionItems(selectedRow, unitFilter),
      },
      {
        id: "recent-inspection",
        title: "최근 검사 현황",
        type: "recent-list",
        items: buildInquiryRecentInspectionItems(selectedRow, unitFilter),
      },
      {
        id: "recent-shipment",
        title: "최근 출고 현황",
        type: "recent-list",
        items: buildInquiryRecentShipmentItems(selectedRow, unitFilter),
      },
    ],
  };
}

function sumByUnit(rows, qtyKey) {
  const totals = new Map();
  rows.forEach((row) => {
    const unit = normalizeProductUnit(row.unit, "EA");
    totals.set(unit, (totals.get(unit) || 0) + (Number(row[qtyKey]) || 0));
  });
  return totals;
}

function formatKpiQuantity(rows, qtyKey, unitFilter) {
  if (unitFilter) {
    const unit = normalizeProductUnit(unitFilter);
    const total = rows
      .filter((row) => normalizeProductUnit(row.unit, "EA") === unit)
      .reduce((sum, row) => sum + (Number(row[qtyKey]) || 0), 0);
    return {
      value: total.toLocaleString("ko-KR"),
      unit: unit === "KG" ? "kg" : unit,
      numeric: total,
    };
  }

  const totals = sumByUnit(rows, qtyKey);
  const parts = [...totals.entries()]
    .filter(([, qty]) => qty > 0)
    .map(([unit, qty]) => `${qty.toLocaleString("ko-KR")} ${unit === "KG" ? "kg" : unit}`);

  return {
    value: parts.length ? parts.join(" · ") : "0",
    unit: "",
    numeric: null,
  };
}

function sumRows(rows, key) {
  return rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
}

function averageRate(rows, key) {
  if (rows.length === 0) return 0;
  return Math.round((sumRows(rows, key) / rows.length) * 10) / 10;
}

export function computeStatisticsKpi(rows, unitFilter = "") {
  const production = formatKpiQuantity(rows, "productionQty", unitFilter);
  const shipment = formatKpiQuantity(rows, "shipmentQty", unitFilter);

  return {
    productionQty: production.value,
    productionUnit: production.unit,
    productionNumeric: production.numeric,
    shipmentQty: shipment.value,
    shipmentUnit: shipment.unit,
    shipmentNumeric: shipment.numeric,
    inspectionCount: sumRows(rows, "inspectionCount"),
    passRate: averageRate(rows, "passRate"),
    defectRate: averageRate(rows, "defectRate"),
    reprocessRate: averageRate(rows, "reprocessRate"),
  };
}

export function computeStatisticsTrendDelta(current, previous, unitFilter = "") {
  const delta = {};
  const numericKeys = unitFilter
    ? [
        ["productionQty", "productionNumeric"],
        ["shipmentQty", "shipmentNumeric"],
      ]
    : [];

  numericKeys.forEach(([key, numericKey]) => {
    const prev = Number(previous[numericKey]) || 0;
    const curr = Number(current[numericKey]) || 0;
    if (prev <= 0) {
      delta[key] = curr > 0 ? 100 : 0;
      return;
    }
    delta[key] = Math.round(((curr - prev) / prev) * 1000) / 10;
  });

  ["inspectionCount", "passRate", "defectRate", "reprocessRate"].forEach((key) => {
    const prev = Number(previous[key]) || 0;
    const curr = Number(current[key]) || 0;
    if (prev <= 0) {
      delta[key] = curr > 0 ? 100 : 0;
      return;
    }
    delta[key] = Math.round(((curr - prev) / prev) * 1000) / 10;
  });

  if (!unitFilter) {
    delta.productionQty = null;
    delta.shipmentQty = null;
  }

  return delta;
}

export function buildStatisticsKpiCards(period, referenceDate, search = {}, unitFilter = "") {
  const filterUnit = search.unit || unitFilter;
  const currentRows = buildStatisticsRows(period, referenceDate, search, filterUnit);
  const previousDate = shiftReferenceDate(period, referenceDate, -1);
  const previousRows = buildStatisticsRows(period, previousDate, search, filterUnit);
  const current = computeStatisticsKpi(currentRows, filterUnit);
  const previous = computeStatisticsKpi(previousRows, filterUnit);
  const delta = computeStatisticsTrendDelta(current, previous, filterUnit);

  return { current, previous, delta, rows: currentRows, unitFilter: filterUnit };
}

function bucketKey(dateValue, period) {
  const date = parseDate(dateValue);
  if (!date) return null;
  if (period === "day") return `${String(date.getHours()).padStart(2, "0")}:00`;
  if (period === "week") {
    const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
    return weekdays[(date.getDay() + 6) % 7];
  }
  if (period === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}`;
}

export function buildStatisticsTrendSeries(scope, period, referenceDate, selectedRow = null, unitFilter = "") {
  const productionRecords = getSessionProductionRecords();
  const inspections = getInspectionLogs();
  const shipments = getShipmentEvents();

  const bucketMap = new Map();
  const ensureBucket = (key) => {
    if (!bucketMap.has(key)) {
      bucketMap.set(key, {
        label: key,
        productionQty: 0,
        shipmentQty: 0,
        inspectionCount: 0,
        passRate: 0,
        salesAmount: 0,
      });
    }
    return bucketMap.get(key);
  };

  const companyFilter = selectedRow?.company;
  const unitFilterNorm = unitFilter ? normalizeProductUnit(unitFilter) : null;
  const selectedUnit = selectedRow?.unit ? normalizeProductUnit(selectedRow.unit) : null;

  productionRecords.forEach((record) => {
    if (companyFilter && record.company !== companyFilter) return;
    const unit = getRecordUnit(record);
    if (unitFilterNorm && unit !== unitFilterNorm) return;
    if (selectedUnit && unit !== selectedUnit) return;

    const date = getRecordWorkDate(record) || record.incomingDate;
    const key = bucketKey(date, period === "year" ? "month" : period);
    if (!key || !isInPeriod(date, period, referenceDate)) return;
    ensureBucket(key).productionQty += Number(record.qty) || 0;
  });

  shipments.forEach((event) => {
    if (companyFilter && event.company !== companyFilter) return;
    const unit = normalizeProductUnit(event.unit, "EA");
    if (unitFilterNorm && unit !== unitFilterNorm) return;
    if (selectedUnit && unit !== selectedUnit) return;

    const key = bucketKey(event.shippedAt, period === "year" ? "month" : period);
    if (!key || !isInPeriod(event.shippedAt, period, referenceDate)) return;
    ensureBucket(key).shipmentQty += Number(event.shipQty) || 0;
  });

  inspections.forEach((log) => {
    if (companyFilter && log.company !== companyFilter) return;
    const unit = normalizeProductUnit(log.unit, "EA");
    if (unitFilterNorm && unit !== unitFilterNorm) return;
    if (selectedUnit && unit !== selectedUnit) return;

    const key = bucketKey(log.inspectionDate, period === "year" ? "month" : period);
    if (!key || !isInPeriod(log.inspectionDate, period, referenceDate)) return;
    const bucket = ensureBucket(key);
    bucket.inspectionCount += 1;
    if (log.judgment === "합격") bucket.passRate += 1;
  });

  let items = [...bucketMap.values()].sort((a, b) => a.label.localeCompare(b.label));

  if (items.length === 0) {
    return [];
  } else {
    items = items.map((item) => ({
      ...item,
      passRate: roundRate(item.passRate, item.inspectionCount),
    }));
  }

  return items;
}

export function buildStatisticsPieItems(selectedRow, rows, unitFilter = "") {
  if (selectedRow) {
    return [
      { label: "생산", value: selectedRow.productionQty },
      { label: "출고", value: selectedRow.shipmentQty },
      { label: "검사", value: selectedRow.inspectionCount * 100 },
    ].filter((item) => item.value > 0);
  }

  const filtered = unitFilter
    ? rows.filter((row) => normalizeProductUnit(row.unit, "EA") === normalizeProductUnit(unitFilter))
    : rows;

  return filtered.slice(0, 5).map((row) => ({
    label: unitFilter ? row.company : `${row.company} (${row.unit === "KG" ? "kg" : row.unit})`,
    value: row.productionQty,
  }));
}

export function buildStatisticsScopeLabel(scope, selectedRow) {
  if (selectedRow) {
    const unit = selectedRow.unit === "KG" ? "kg" : selectedRow.unit;
    return `${selectedRow.company} · ${unit}`;
  }
  return scope.pageTitle;
}

export function getStatisticsQuantityUnitLabel(unitFilter) {
  if (!unitFilter) return "";
  const unit = normalizeProductUnit(unitFilter);
  return unit === "KG" ? "kg" : unit;
}

export function formatStatisticsRowQty(value, unit) {
  const displayUnit = unit === "KG" ? "kg" : unit;
  return `${Number(value || 0).toLocaleString("ko-KR")} ${displayUnit}`;
}

export function createEmptyStatisticsSearch() {
  return {
    company: "",
    partName: "",
    partNo: "",
    material: "",
    unit: "",
    periodFrom: "",
    periodTo: "",
  };
}

export { formatQtySummaryByUnit };
