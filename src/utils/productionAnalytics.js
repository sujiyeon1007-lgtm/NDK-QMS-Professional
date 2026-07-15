/**
 * Project TITAN V1.0 — 생산실적 분석 (조회 · KPI · 차트)
 */

import { getProductionProcessName } from "../config/productionProcessCodes";
import { HT_TERM } from "../config/titanHeatTreatmentTerminology";
import { isIncomingRegistered } from "./productionRecords";
import { matchesBasicSearch } from "../config/listSearchStandard";
import {
  CERTIFICATE_STATUS,
  getRecordWorkflowState,
} from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { getProductionDailyReportStatus } from "./productionDailyReportStatus";
import { getPrintOutputDate } from "./titanPrintDates";
import { WORKFLOW_STATUS } from "./titanWorkflowStatus";
import { resolveChargeQty } from "./equipmentChargingQty";

function resolveProductionQty(record) {
  const chargeQty = resolveChargeQty(record, { lotNo: record?.lotNo });
  return chargeQty || (!record?.lotNo ? Number(record?.qty) || 0 : 0);
}

/** RC1 — 금일 기준 (고정 2026-06-30 사용 시 7월 생산완료 이력이 목록에서 누락됨) */
export function getReferenceDate(referenceDate) {
  if (referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())) {
    return referenceDate;
  }
  const today = getPrintOutputDate();
  const parsed = new Date(`${today}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** 설비명 표시 (LOT·마스터 설비명 그대로 사용) */
const EQUIPMENT_UNIT_MAP = {};

export function getDimensionSelectLabel(dimensionId) {
  const labels = {
    equipment: "설비 선택",
    company: "업체 선택",
    material: "재질 선택",
    process: "공정 선택",
  };
  return labels[dimensionId] ?? "항목 선택";
}

export function getDimensionShortLabel(dimensionField, value) {
  if (!value) return "전체";
  if (dimensionField === "equipment") {
    return EQUIPMENT_UNIT_MAP[value] ?? value;
  }
  return value;
}

export function getDimensionOptionLabel(dimensionField, value) {
  if (dimensionField === "equipment" && EQUIPMENT_UNIT_MAP[value]) {
    return `${EQUIPMENT_UNIT_MAP[value]} (${value})`;
  }
  return value;
}

export function getDimensionOptionsWithLabels(records, dimensionField) {
  return getDimensionOptions(records, dimensionField).map((value) => ({
    value,
    label: getDimensionOptionLabel(dimensionField, value),
  }));
}

export function formatAnalysisContextLabel(period, referenceDate = getReferenceDate()) {
  const y = referenceDate.getFullYear();
  const m = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const d = String(referenceDate.getDate()).padStart(2, "0");
  const periodLabel = { day: "일간", week: "주간", month: "월간", year: "연간" }[period] ?? period;

  if (period === "month") return `${y}-${m} ${periodLabel}`;
  if (period === "year") return `${y}년 ${periodLabel}`;
  if (period === "week") return `${y}-${m} ${periodLabel}`;
  return `${y}-${m}-${d} ${periodLabel}`;
}

export function buildAnalysisScopeLabel(dimensionField, dimensionValue, period, referenceDate = getReferenceDate()) {
  const dimensionLabels = {
    equipment: "설비",
    company: "업체",
    material: "재질",
    process: "공정",
  };
  const prefix = dimensionLabels[dimensionField] ?? "기준";
  const valueLabel = getDimensionShortLabel(dimensionField, dimensionValue);
  const y = referenceDate.getFullYear();
  const m = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const d = String(referenceDate.getDate()).padStart(2, "0");
  const periodLabel = { day: "일간", week: "주간", month: "월간", year: "연간" }[period] ?? period;

  let periodRange = `${y}-${m}`;
  if (period === "year") periodRange = `${y}`;
  if (period === "day") periodRange = `${y}-${m}-${d}`;

  return `${prefix} : ${valueLabel} / 기간 : ${periodRange} / ${periodLabel}`;
}

export function getRecordWorkDate(record) {
  return record.workDate || record.dueDate || "";
}

export function getRecordProcessName(record) {
  return getProductionProcessName(record);
}

export function getRecordWorker(record) {
  return record.registrar ?? record.worker ?? "관리자";
}

/** 열처리실적관리 — 현재상태 검색 옵션 (열처리 ~ 출고완료) */
export const PRODUCTION_RESULTS_STATUS_OPTIONS = [
  "열처리대기",
  "열처리진행",
  "열처리완료",
  "검사진행",
  "성적서대기",
  "출고대기",
  "출고완료",
];

/**
 * @returns {{ label: string, variant: string } | null}
 */
export function getProductionResultsDisplayStatus(record) {
  if (!isIncomingRegistered(record)) return null;

  const workflowState = getRecordWorkflowState(record);
  const stockQty = getStockQty(record);

  if (workflowState === "출고완료") {
    return { label: "출고완료", variant: "complete" };
  }

  if (
    workflowState === "부분출고" ||
    workflowState === "성적서 발행완료" ||
    (record.certificateStatus === CERTIFICATE_STATUS.ISSUED && stockQty > 0)
  ) {
    return { label: "출고대기", variant: "ship-wait" };
  }

  if (record.registered && record.lotNo?.trim()) {
    if (
      hasInspectionLogForManagementId(record.id) &&
      record.certificateStatus === CERTIFICATE_STATUS.PENDING
    ) {
      return { label: "검사진행", variant: "inspect" };
    }
    if (record.certificateStatus === CERTIFICATE_STATUS.PENDING && record.workDate) {
      return { label: "성적서대기", variant: "certificate" };
    }
    if (record.workDate || record.completionStatus === "생산완료") {
      return { label: HT_TERM.DONE, variant: "complete" };
    }
  }

  if (record.htlNo || record.workSheetGenerated || record.lotNo?.trim()) {
    return { label: "열처리진행", variant: "production" };
  }

  return { label: HT_TERM.WAIT, variant: "prod-wait" };
}

export function getProductionResultsRecords(records = []) {
  return records.filter((record) => getProductionResultsDisplayStatus(record) !== null);
}

export function isProductionCompleted(record) {
  const status = getProductionDailyReportStatus(record);
  return status?.variant === "complete" || status?.variant === "ship-wait";
}

export function getCompletedProductionRecords(records = []) {
  return records.filter((record) => isIncomingRegistered(record) && isProductionCompleted(record));
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(date, reference) {
  const day = (reference.getDay() + 6) % 7;
  const weekStart = new Date(reference);
  weekStart.setDate(reference.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

function isSameMonth(date, reference) {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function isSameYear(date, reference) {
  return date.getFullYear() === reference.getFullYear();
}

export function isWithinAnalysisPeriod(dateValue, period, referenceDate = getReferenceDate()) {
  const date = parseDate(dateValue);
  if (!date) return period === "year";

  switch (period) {
    case "day":
      return isSameDay(date, startOfDay(referenceDate));
    case "week":
      return isSameWeek(date, referenceDate);
    case "month":
      return isSameMonth(date, referenceDate);
    case "year":
      return isSameYear(date, referenceDate);
    default:
      return true;
  }
}

export function sumRecordQty(records = []) {
  return records.reduce((sum, record) => sum + resolveProductionQty(record), 0);
}

function getDimensionValue(record, dimensionField) {
  if (dimensionField === "process") return getRecordProcessName(record);
  if (dimensionField === "equipment") return record.equipment || "—";
  if (dimensionField === "company") return record.company || "—";
  if (dimensionField === "material") return record.material || "—";
  return record[dimensionField] || "—";
}

export function filterByAnalysisDimension(records, dimensionField, value) {
  if (!value) return records;
  return records.filter((record) => getDimensionValue(record, dimensionField) === value);
}

export function getDimensionOptions(records, dimensionField) {
  const values = new Set(
    records
      .map((record) => getDimensionValue(record, dimensionField))
      .filter((value) => value && value !== "—")
  );
  return [...values].sort((a, b) => a.localeCompare(b, "ko"));
}

export function computeProductionResultMetrics(records = [], referenceDate = getReferenceDate()) {
  const completed = getCompletedProductionRecords(records);
  const eligible = records.filter((record) => isIncomingRegistered(record));
  const todayRecords = completed.filter((record) =>
    isWithinAnalysisPeriod(getRecordWorkDate(record), "day", referenceDate)
  );
  const weekRecords = completed.filter((record) =>
    isWithinAnalysisPeriod(getRecordWorkDate(record), "week", referenceDate)
  );
  const monthRecords = completed.filter((record) =>
    isWithinAnalysisPeriod(getRecordWorkDate(record), "month", referenceDate)
  );
  const doneCount = completed.length;
  const eligibleCount = eligible.length;
  const completionRate = eligibleCount > 0 ? Math.round((doneCount / eligibleCount) * 1000) / 10 : 0;

  return {
    todayQty: sumRecordQty(todayRecords),
    weekQty: sumRecordQty(weekRecords),
    monthQty: sumRecordQty(monthRecords),
    completionRate,
  };
}

export function computePeriodQtyForRecords(records, period, referenceDate = getReferenceDate()) {
  return sumRecordQty(
    records.filter((record) => isWithinAnalysisPeriod(getRecordWorkDate(record), period, referenceDate))
  );
}

export function matchesProductionResultsSearch(record, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (search.process && getRecordProcessName(record) !== search.process) return false;
  const workDate = getRecordWorkDate(record);
  if (search.workDateFrom && workDate < search.workDateFrom) return false;
  if (search.workDateTo && workDate > search.workDateTo) return false;
  if (search.equipment && !String(record.equipment ?? "").includes(search.equipment)) return false;
  const worker = getRecordWorker(record);
  if (search.worker && !worker.includes(search.worker)) return false;
  const status = getProductionResultsDisplayStatus(record);
  if (search.status && status?.label !== search.status) return false;
  return true;
}

export function mapProductionResultRow(record) {
  const status = getProductionResultsDisplayStatus(record);
  const lotKey = String(record.lotNo ?? "").trim().toUpperCase();
  return {
    id: lotKey ? `${record.id}::${lotKey}` : record.id,
    lotNo: record.lotNo || "—",
    company: record.company || "—",
    partName: record.partName || "—",
    partNo: record.partNo || "—",
    material: record.material || "—",
    qty: resolveProductionQty(record),
    processName: getRecordProcessName(record),
    equipment: record.equipment || "—",
    worker: getRecordWorker(record),
    workDate: getRecordWorkDate(record) || "—",
    record,
    statusLabel: status?.label ?? "—",
    statusVariant: status?.variant ?? "wait",
  };
}

function bucketLabel(dateValue, period, referenceDate = getReferenceDate()) {
  const date = parseDate(dateValue);
  if (!date) return "—";
  if (period === "day") {
    return `${String(date.getHours()).padStart(2, "0")}:00`;
  }
  if (period === "week") {
    const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
    return weekdays[(date.getDay() + 6) % 7];
  }
  if (period === "month") {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  }
  if (period === "year") {
    return `${date.getMonth() + 1}월`;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function buildProductionTrendSeries(records, period = "month", referenceDate = getReferenceDate()) {
  const buckets = new Map();
  records.forEach((record) => {
    const workDate = getRecordWorkDate(record);
    if (!isWithinAnalysisPeriod(workDate, period, referenceDate)) return;
    const trendPeriod = period === "year" ? "year" : period === "week" ? "week" : "month";
    const key = bucketLabel(workDate, period === "day" ? "day" : trendPeriod === "month" ? "month" : trendPeriod, referenceDate);
    if (key === "—") return;
    buckets.set(key, (buckets.get(key) ?? 0) + resolveProductionQty(record));
  });

  const entries = [...buckets.entries()].map(([label, value]) => ({ label, value }));

  if (period === "month") {
    return entries.sort((a, b) => {
      const [am, ad] = a.label.split("/").map(Number);
      const [bm, bd] = b.label.split("/").map(Number);
      if (am !== bm) return am - bm;
      return ad - bd;
    });
  }
  if (period === "week") {
    const order = ["월", "화", "수", "목", "금", "토", "일"];
    return entries.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  }
  if (period === "year") {
    return entries.sort((a, b) => parseInt(a.label, 10) - parseInt(b.label, 10));
  }
  return entries.slice(-12);
}

export function computeProductionSummaryStats(records = [], period = "month", referenceDate = getReferenceDate()) {
  const filtered = records.filter((record) =>
    isWithinAnalysisPeriod(getRecordWorkDate(record), period, referenceDate)
  );
  const series = buildProductionTrendSeries(filtered, period, referenceDate);
  const values = series.map((item) => item.value);
  const total = sumRecordQty(filtered);
  const avg = values.length > 0 ? Math.round(total / values.length) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;

  return { total, avg, max, min, series };
}

export function aggregateProductionByField(records, field, limit = 6) {
  const totals = new Map();
  records.forEach((record) => {
    const label = getDimensionValue(record, field);
    totals.set(label, (totals.get(label) ?? 0) + resolveProductionQty(record));
  });
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** 재질별 차트 — 상위 항목 외 '기타' 묶음 (시안 기준) */
export function aggregateProductionByFieldWithOther(records, field, topLimit = 4) {
  const all = aggregateProductionByField(records, field, 99);
  if (all.length <= topLimit) return all;

  const top = all.slice(0, topLimit);
  const otherValue = all.slice(topLimit).reduce((sum, item) => sum + item.value, 0);
  if (otherValue > 0) {
    top.push({ label: "기타", value: otherValue });
  }
  return top;
}

export function narrowRecordsForSelectedRow(records, selectedRow) {
  if (!selectedRow?.record) return records;
  const { company, heatTreatment, equipment, material } = selectedRow.record;
  return records.filter(
    (record) =>
      record.company === company ||
      record.heatTreatment === heatTreatment ||
      record.equipment === equipment ||
      record.material === material
  );
}

export function buildProductionDailyStatusCounts(records = []) {
  const progress = records.filter((record) => {
    if (!isIncomingRegistered(record)) return false;
    const hasEntry =
      record.htlNo?.trim() ||
      record.workSheetGenerated ||
      (record.registered && record.lotNo?.trim());
    if (!hasEntry) return false;
    return !(
      record.completionStatus === "생산완료" ||
      record.completionStatus === WORKFLOW_STATUS.PROD_DONE
    );
  }).length;
  const done = records.filter(
    (record) =>
      record.completionStatus === "생산완료" ||
      record.completionStatus === WORKFLOW_STATUS.PROD_DONE
  ).length;

  return { prodProgress: progress, prodDone: done };
}
