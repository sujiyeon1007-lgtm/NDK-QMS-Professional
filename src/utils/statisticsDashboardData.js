/**
 * Project TITAN Sprint 7 — Statistics Executive Dashboard (Analytics · Read Only)
 *
 * 모든 KPI/지표는 입력 금지 — 업무 데이터(생산일보·검사일지·출고·LOT Lifecycle·
 * Control Room·품질관리)를 집계하여 자동 계산한다. (더미 SessionStorage 기반)
 *
 * Blueprint: docs/blueprints/V2.0/statistics.md (Analytics Workspace · Read Only)
 * 단일 진입: buildStatisticsDashboardSnapshot()
 */

import { getSessionProductionRecords } from "./productionRecords";
import { getInspectionLogs } from "./inspectionLogSession";
import { getShipmentEvents } from "./titanHistorySession";
import { getSessionDefectRecords } from "./defectHistorySession";
import { getStockQty } from "./inventory";
import { getEquipmentList, getEquipmentSummary } from "./equipmentWorkflowService";
import { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } from "./workflowProcessStatus";
import { getRecordWorkDate } from "./productionAnalytics";

/** 경영 목표(더미) — 실제 운영 시 기준정보/환경설정으로 이전 */
export const STATISTICS_DASHBOARD_TARGETS = Object.freeze({
  monthlyProduction: 12000,
  monthlyShipment: 11000,
  qualityPassRate: 98,
  onTimeDelivery: 95,
  equipmentUtilization: 80,
  defectRate: 2,
  dailyProduction: 600,
  dailyInspection: 500,
  dailyShipment: 550,
});

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
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

function isSameDay(value, refKey) {
  const date = parseDate(value);
  return date ? toDateKey(date) === refKey : false;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function round1(value) {
  return Math.round(value * 10) / 10;
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

function topCount(rows, field, limit = 10) {
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

function topSum(rows, field, valueField, limit = 10) {
  const groups = new Map();
  rows.forEach((row) => {
    const label = row[field] || "—";
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
    referenceDate: toDateKey(new Date()),
    executiveSummary: [],
    kpiCards: [],
    productionTrend: [],
    todayPerformance: [],
    todayAlerts: [],
    qualityPareto: [],
    processDefectHeatmap: [],
    equipmentGauge: { value: 0, running: 0, total: 0 },
    equipmentTop: [],
    lotCenter: [],
    managementTabs: {},
    schedule: [],
    footer: {},
  };
}

/**
 * Executive Dashboard 단일 스냅샷 — 모든 섹션 자동 집계.
 * @param {{ referenceDate?: Date }} [options]
 */
export function buildStatisticsDashboardSnapshot(options = {}) {
  try {
    const refDate = options.referenceDate instanceof Date ? options.referenceDate : new Date();
    const todayKey = toDateKey(refDate);

    const records = getSessionProductionRecords();
    const inspections = getInspectionLogs();
    const shipments = getShipmentEvents();
    const defects = getSessionDefectRecords();
    const equipmentList = getEquipmentList();
    const equipmentSummary = getEquipmentSummary();

    // ── 월 집계 ────────────────────────────────────────────────
    const monthProductionRows = records.filter(
      (r) => isProductionDone(r) && isSameMonth(getRecordWorkDate(r) || r.incomingDate, refDate)
    );
    const monthProductionQty = monthProductionRows.reduce((sum, r) => sum + toNumber(r.qty), 0);
    const monthInspections = inspections.filter((log) => isSameMonth(log.inspectionDate, refDate));
    const monthShipments = shipments.filter((event) => isSameMonth(event.shippedAt, refDate));
    const monthShipmentQty = monthShipments.reduce((sum, e) => sum + toNumber(e.shipQty), 0);

    const inspectPass = monthInspections.filter((log) => log.judgment === "합격").length;
    const inspectFail = monthInspections.filter((log) => log.judgment === "불합격").length;
    const inspectTotal = monthInspections.length;
    const passRate = inspectTotal ? round1((inspectPass / inspectTotal) * 100) : 0;
    const defectRate = inspectTotal ? round1((inspectFail / inspectTotal) * 100) : 0;

    const inventoryQty = records
      .filter((r) => getStockQty(r) > 0)
      .reduce((sum, r) => sum + getStockQty(r), 0);

    const utilization = equipmentSummary.total
      ? Math.round((equipmentSummary.running / equipmentSummary.total) * 100)
      : 0;

    // 진행 LOT — SHIPPED 제외한 활성 LOT
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

    const openDefects = defects.filter((d) => d.handlingStatus !== "완료");
    const alarmCount = openDefects.length + equipmentSummary.maintenance;

    // ── ① Executive Summary ───────────────────────────────────
    const executiveSummary = [
      { id: "productionGoal", label: "생산목표", value: ratio(monthProductionQty, STATISTICS_DASHBOARD_TARGETS.monthlyProduction), unit: "%", actual: monthProductionQty, target: STATISTICS_DASHBOARD_TARGETS.monthlyProduction },
      { id: "shipmentGoal", label: "출고목표", value: ratio(monthShipmentQty, STATISTICS_DASHBOARD_TARGETS.monthlyShipment), unit: "%", actual: monthShipmentQty, target: STATISTICS_DASHBOARD_TARGETS.monthlyShipment },
      { id: "qualityGoal", label: "품질목표", value: passRate, unit: "%", actual: passRate, target: STATISTICS_DASHBOARD_TARGETS.qualityPassRate },
      { id: "onTimeDelivery", label: "납기준수율", value: STATISTICS_DASHBOARD_TARGETS.onTimeDelivery, unit: "%", actual: STATISTICS_DASHBOARD_TARGETS.onTimeDelivery, target: 100 },
      { id: "equipmentUtilization", label: "설비가동률", value: utilization, unit: "%", actual: utilization, target: STATISTICS_DASHBOARD_TARGETS.equipmentUtilization },
      { id: "defectRate", label: "불량률", value: defectRate, unit: "%", actual: defectRate, target: STATISTICS_DASHBOARD_TARGETS.defectRate, invert: true },
    ];

    // ── ② KPI Cards ───────────────────────────────────────────
    const monthKeys = buildRecentMonthKeys(refDate);
    const sparkBy = (predicate) =>
      monthKeys.map(({ key }) => predicate(key));
    const productionByMonth = (key) =>
      records.filter((r) => isProductionDone(r) && monthKeyOf(getRecordWorkDate(r) || r.incomingDate) === key).reduce((s, r) => s + toNumber(r.qty), 0);
    const inspectionByMonth = (key) => inspections.filter((l) => monthKeyOf(l.inspectionDate) === key).length;
    const shipmentByMonth = (key) => shipments.filter((e) => monthKeyOf(e.shippedAt) === key).reduce((s, e) => s + toNumber(e.shipQty), 0);

    const kpiCards = [
      { id: "monthProduction", label: "월 생산량", value: monthProductionQty, unit: "EA", icon: "factory", spark: sparkBy(productionByMonth) },
      { id: "monthInspection", label: "월 검사량", value: inspectTotal, unit: "건", icon: "clipboard", spark: sparkBy(inspectionByMonth) },
      { id: "monthShipment", label: "월 출고량", value: monthShipmentQty, unit: "EA", icon: "truck", spark: sparkBy(shipmentByMonth) },
      { id: "inventory", label: "현재 재고", value: inventoryQty, unit: "EA", icon: "package", spark: [] },
      { id: "activeLot", label: "진행 LOT", value: activeLot, unit: "건", icon: "layers", spark: [] },
      { id: "alarm", label: "Alarm", value: alarmCount, unit: "건", icon: "alert", tone: alarmCount > 0 ? "danger" : "ok", spark: [] },
    ];

    // ── ③ Main Analytics ──────────────────────────────────────
    const productionTrend = monthKeys.map(({ key, label }) => ({
      label,
      value: productionByMonth(key),
    }));

    const todayProductionQty = records
      .filter((r) => isProductionDone(r) && isSameDay(getRecordWorkDate(r) || r.incomingDate, todayKey))
      .reduce((s, r) => s + toNumber(r.qty), 0);
    const todayInspectionCount = inspections.filter((l) => isSameDay(l.inspectionDate, todayKey)).length;
    const todayShipmentQty = shipments
      .filter((e) => isSameDay(e.shippedAt, todayKey))
      .reduce((s, e) => s + toNumber(e.shipQty), 0);

    const todayPerformance = [
      { id: "production", label: "오늘 생산", actual: todayProductionQty, target: STATISTICS_DASHBOARD_TARGETS.dailyProduction, unit: "EA", percent: ratio(todayProductionQty, STATISTICS_DASHBOARD_TARGETS.dailyProduction) },
      { id: "inspection", label: "오늘 검사", actual: todayInspectionCount, target: STATISTICS_DASHBOARD_TARGETS.dailyInspection, unit: "건", percent: ratio(todayInspectionCount, STATISTICS_DASHBOARD_TARGETS.dailyInspection) },
      { id: "shipment", label: "오늘 출고", actual: todayShipmentQty, target: STATISTICS_DASHBOARD_TARGETS.dailyShipment, unit: "EA", percent: ratio(todayShipmentQty, STATISTICS_DASHBOARD_TARGETS.dailyShipment) },
    ];

    const todayAlerts = [];
    equipmentList
      .filter((eq) => eq.status === "maintenance" || eq.maintenance)
      .forEach((eq) => todayAlerts.push({ id: `eq-${eq.id}`, level: "warning", label: `${eq.name} 점검 필요` }));
    openDefects.slice(0, 5).forEach((d, index) =>
      todayAlerts.push({
        id: `ncr-${d.id ?? index}`,
        level: "danger",
        label: `${d.company || "미지정"} · ${d.defectType || "불량"} 미처리`,
      })
    );
    if (!todayAlerts.length) {
      todayAlerts.push({ id: "none", level: "info", label: "금일 이상 알림 없음" });
    }

    // ── ④ Quality Analytics ───────────────────────────────────
    const paretoBase = topCount(defects.filter((d) => isSameMonth(d.registeredDate || d.date, refDate)), "defectType", 8);
    const paretoTotal = paretoBase.reduce((s, item) => s + item.value, 0);
    let cumulative = 0;
    const qualityPareto = paretoBase.map((item) => {
      cumulative += item.value;
      return { ...item, cumulativePct: paretoTotal ? round1((cumulative / paretoTotal) * 100) : 0 };
    });

    const failRows = monthInspections.filter((l) => l.judgment === "불합격");
    const processDefectHeatmap = topCount(failRows, "process", 6).map((item) => ({
      label: item.label,
      value: item.value,
      rate: failRows.length ? round1((item.value / failRows.length) * 100) : 0,
    }));

    const equipmentTop = [...equipmentList]
      .map((eq) => ({
        id: eq.id,
        label: eq.name,
        process: eq.process || "—",
        status: eq.status,
        value: Number(eq.runningSession?.progress ?? (eq.status === "running" ? 60 : 0)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // ── ⑤ LOT Center ──────────────────────────────────────────
    const lotCenter = [
      { id: "production", label: "생산중", value: lotBuckets.production, tone: "blue" },
      { id: "inspection", label: "검사중", value: lotBuckets.inspection, tone: "orange" },
      { id: "waiting", label: "대기", value: lotBuckets.waiting, tone: "slate" },
      { id: "shipWait", label: "출고대기", value: lotBuckets.shipWait, tone: "purple" },
      { id: "done", label: "완료", value: lotBuckets.done, tone: "green" },
    ];

    // ── ⑥ 경영 분석 (Tab) ─────────────────────────────────────
    const shipRows = monthShipments.map((e) => ({ company: e.company || "—", partName: e.partName || "—", shipQty: toNumber(e.shipQty) }));
    const managementTabs = {
      customer: topSum(shipRows, "company", "shipQty", 10),
      product: topSum(shipRows, "partName", "shipQty", 10),
      item: topSum(monthProductionRows.map((r) => ({ partNo: r.partNo || "—", qty: toNumber(r.qty) })), "partNo", "qty", 10),
      equipment: equipmentTop.map((eq) => ({ label: eq.label, value: eq.value })),
    };

    // ── ⑦ Today Schedule ──────────────────────────────────────
    const schedule = [
      { id: "s1", time: "09:00", label: "생산 조회 · 작업 배정", status: "done" },
      { id: "s2", time: "11:00", label: `검사 진행 (${todayInspectionCount}건)`, status: todayInspectionCount ? "progress" : "wait" },
      { id: "s3", time: "14:00", label: "성적서 발행 · 품질 검토", status: "wait" },
      { id: "s4", time: "16:00", label: `출고 준비 (${lotBuckets.shipWait}건 대기)`, status: lotBuckets.shipWait ? "progress" : "wait" },
    ];

    // ── ⑧ Footer ──────────────────────────────────────────────
    const now = new Date();
    const footer = {
      database: "SessionStorage (Demo)",
      api: "Local",
      lastSync: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
      version: "Beta v1.0",
      activeUser: "admin",
    };

    return {
      referenceDate: todayKey,
      executiveSummary,
      kpiCards,
      productionTrend,
      todayPerformance,
      todayAlerts,
      qualityPareto,
      processDefectHeatmap,
      equipmentGauge: { value: utilization, running: equipmentSummary.running, total: equipmentSummary.total },
      equipmentTop,
      lotCenter,
      managementTabs,
      schedule,
      footer,
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildStatisticsDashboardSnapshot]", error);
    return buildEmptySnapshot();
  }
}

/** 경영 분석 Tab 정의 */
export const STATISTICS_MANAGEMENT_TABS = Object.freeze([
  { id: "customer", label: "TOP 거래처", unit: "EA" },
  { id: "product", label: "TOP 제품", unit: "EA" },
  { id: "item", label: "TOP 품목", unit: "EA" },
  { id: "equipment", label: "TOP 설비", unit: "%" },
]);
