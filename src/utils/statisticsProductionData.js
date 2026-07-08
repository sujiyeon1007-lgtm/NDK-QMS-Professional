/**
 * Project TITAN Sprint 7 — 생산통계 (Production Statistics · Analytics · Read Only)
 *
 * 생산일보/LOT Lifecycle/Control Room 데이터를 집계하여 생산 성과를 분석한다.
 * 모든 지표는 입력 금지 — 자동 계산. (더미 SessionStorage 기반)
 *
 * 단일 진입: buildProductionStatisticsSnapshot()
 */

import { getSessionProductionRecords } from "./productionRecords";
import { getEquipmentSummary } from "./equipmentWorkflowService";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } from "./workflowProcessStatus";
import { getRecordWorkDate } from "./productionAnalytics";
import { STATISTICS_DASHBOARD_TARGETS } from "./statisticsDashboardData";

/** 데모 작업자 풀 — 설비 기준 결정적 배정 (생산일보에 작업자 필드 도입 시 교체) */
const DEMO_OPERATOR_POOL = ["홍길동", "김철수", "이영희", "박민수", "정우성"];

function pad2(value) {
  return String(value).padStart(2, "0");
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthKeyOf(value) {
  const date = parseDate(value);
  return date ? `${date.getFullYear()}-${pad2(date.getMonth() + 1)}` : null;
}

function isSameMonth(value, refDate) {
  const date = parseDate(value);
  if (!date) return false;
  return date.getFullYear() === refDate.getFullYear() && date.getMonth() === refDate.getMonth();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function ratio(actual, target) {
  if (!target) return 0;
  return Math.min(999, Math.round((actual / target) * 100));
}

function buildRecentMonthKeys(refDate, count = 6) {
  const keys = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    keys.push({ key: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`, label: `${d.getMonth() + 1}월` });
  }
  return keys;
}

function isProductionDone(record) {
  return (
    record.completionStatus === "생산완료" ||
    record.productionStatus === "생산완료" ||
    Boolean(record.registered && String(record.lotNo ?? "").trim())
  );
}

function resolveProcessKey(record) {
  try {
    return resolveRecordCurrentProcess(record)?.key ?? CURRENT_PROCESS_KEYS.RECEIVED;
  } catch {
    return CURRENT_PROCESS_KEYS.RECEIVED;
  }
}

function resolveOperator(record) {
  const direct = String(record.worker ?? record.workerName ?? record.productionWorker ?? "").trim();
  if (direct) return direct;
  const equipment = String(record.equipment ?? "").trim();
  if (!equipment) return "미지정";
  let sum = 0;
  for (let i = 0; i < equipment.length; i += 1) sum += equipment.charCodeAt(i);
  return DEMO_OPERATOR_POOL[sum % DEMO_OPERATOR_POOL.length];
}

function topSumBy(rows, resolveLabel, valueField, limit = 10) {
  const groups = new Map();
  rows.forEach((row) => {
    const label = resolveLabel(row) || "—";
    if (label === "—") return;
    groups.set(label, (groups.get(label) || 0) + toNumber(row[valueField]));
  });
  return [...groups.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function buildEmptySnapshot() {
  return {
    referenceMonth: `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`,
    kpiCards: [],
    productionTrend: [],
    monthlyTrend: [],
    processProduction: [],
    equipmentProduction: [],
    workerRanking: [],
    lotStatus: [],
    goalAchievement: { value: 0, actual: 0, target: 0 },
  };
}

/**
 * 생산통계 단일 스냅샷 — 모든 섹션 자동 집계.
 * @param {{ referenceDate?: Date }} [options]
 */
export function buildProductionStatisticsSnapshot(options = {}) {
  try {
    const refDate = options.referenceDate instanceof Date ? options.referenceDate : new Date();
    const records = getSessionProductionRecords();
    const equipmentSummary = getEquipmentSummary();
    const monthKeys = buildRecentMonthKeys(refDate);

    // 이번 달 생산완료 행
    const monthDoneRows = records.filter(
      (r) => isProductionDone(r) && isSameMonth(getRecordWorkDate(r) || r.incomingDate, refDate)
    );
    const monthQty = monthDoneRows.reduce((sum, r) => sum + toNumber(r.qty), 0);
    const monthLotCount = new Set(monthDoneRows.map((r) => r.lotNo).filter(Boolean)).size;

    // LOT 상태 버킷
    const lotBuckets = { production: 0, inspection: 0, waiting: 0, shipWait: 0, done: 0 };
    records.forEach((record) => {
      const key = resolveProcessKey(record);
      if (key === CURRENT_PROCESS_KEYS.HT_RUNNING) lotBuckets.production += 1;
      else if (key === CURRENT_PROCESS_KEYS.INSPECTION_WAIT) lotBuckets.inspection += 1;
      else if (key === CURRENT_PROCESS_KEYS.RECEIVED || key === CURRENT_PROCESS_KEYS.HT_WAIT)
        lotBuckets.waiting += 1;
      else if (
        key === CURRENT_PROCESS_KEYS.SHIP_WAIT ||
        key === CURRENT_PROCESS_KEYS.CERT_DONE ||
        key === CURRENT_PROCESS_KEYS.INSPECTION_DONE ||
        key === CURRENT_PROCESS_KEYS.CERT_WAIT
      )
        lotBuckets.shipWait += 1;
      else if (key === CURRENT_PROCESS_KEYS.SHIPPED) lotBuckets.done += 1;
    });
    const activeLot = lotBuckets.production + lotBuckets.inspection + lotBuckets.waiting + lotBuckets.shipWait;

    const target = STATISTICS_DASHBOARD_TARGETS.monthlyProduction;
    const goalPct = ratio(monthQty, target);
    const avgPerLot = monthLotCount ? Math.round(monthQty / monthLotCount) : 0;

    // ── 월별 생산량 (추이/Trend) ──────────────────────────────
    const qtyByMonth = (key) =>
      records
        .filter((r) => isProductionDone(r) && monthKeyOf(getRecordWorkDate(r) || r.incomingDate) === key)
        .reduce((s, r) => s + toNumber(r.qty), 0);
    const lotByMonth = (key) =>
      new Set(
        records
          .filter((r) => isProductionDone(r) && monthKeyOf(getRecordWorkDate(r) || r.incomingDate) === key)
          .map((r) => r.lotNo)
          .filter(Boolean)
      ).size;

    const productionTrend = monthKeys.map(({ key, label }) => ({ label, value: qtyByMonth(key) }));
    const monthlyTrend = monthKeys.map(({ key, label }) => ({
      label,
      qty: qtyByMonth(key),
      lot: lotByMonth(key),
    }));

    // ── 공정별 / 설비별 / 작업자별 ────────────────────────────
    const processProduction = topSumBy(monthDoneRows, (r) => getProductionProcessName(r), "qty", 8);
    const equipmentProduction = topSumBy(monthDoneRows, (r) => String(r.equipment ?? "").trim(), "qty", 10);
    const workerRanking = topSumBy(monthDoneRows, (r) => resolveOperator(r), "qty", 10);

    // ── KPI Cards (6) ────────────────────────────────────────
    const kpiCards = [
      { id: "monthQty", label: "월 생산량", value: monthQty, unit: "EA", icon: "factory", spark: monthKeys.map(({ key }) => qtyByMonth(key)) },
      { id: "monthLot", label: "생산 완료 LOT", value: monthLotCount, unit: "건", icon: "layers", spark: monthKeys.map(({ key }) => lotByMonth(key)) },
      { id: "activeLot", label: "진행 LOT", value: activeLot, unit: "건", icon: "activity", spark: [] },
      { id: "goal", label: "목표 달성률", value: goalPct, unit: "%", icon: "target", spark: [] },
      { id: "equipment", label: "가동 설비", value: equipmentSummary.running, unit: `/${equipmentSummary.total}대`, icon: "gauge", spark: [] },
      { id: "avgLot", label: "LOT당 평균", value: avgPerLot, unit: "EA", icon: "trending", spark: [] },
    ];

    const lotStatus = [
      { id: "production", label: "생산중", value: lotBuckets.production, tone: "blue" },
      { id: "inspection", label: "검사중", value: lotBuckets.inspection, tone: "orange" },
      { id: "waiting", label: "대기", value: lotBuckets.waiting, tone: "slate" },
      { id: "shipWait", label: "출고대기", value: lotBuckets.shipWait, tone: "purple" },
      { id: "done", label: "완료", value: lotBuckets.done, tone: "green" },
    ];

    return {
      referenceMonth: `${refDate.getFullYear()}-${pad2(refDate.getMonth() + 1)}`,
      kpiCards,
      productionTrend,
      monthlyTrend,
      processProduction,
      equipmentProduction,
      workerRanking,
      lotStatus,
      goalAchievement: { value: goalPct, actual: monthQty, target },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildProductionStatisticsSnapshot]", error);
    return buildEmptySnapshot();
  }
}
