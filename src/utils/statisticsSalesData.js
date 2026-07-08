/**
 * Project TITAN Sprint 7 — 영업통계 (Sales Statistics · Analytics · Read Only)
 *
 * 출고관리 · LOT Lifecycle · 거래처/제품 Master 데이터를 집계하여 영업 실적을 분석한다.
 * 모든 지표는 입력 금지 — 자동 계산. (더미 SessionStorage 기반)
 *
 * 단일 진입: buildSalesStatisticsSnapshot()
 */

import { getShipmentEvents } from "./titanHistorySession";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { getStockQty } from "./inventory";
import { SHIPMENT_STATUS } from "./ndkWorkflow";
import { STATISTICS_DASHBOARD_TARGETS } from "./statisticsDashboardData";

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

function topSumBy(rows, field, valueField, limit = 10) {
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

function buildRecordIndex(records) {
  const index = new Map();
  records.forEach((record) => {
    const key = String(record.id ?? record.mesManagementNo ?? "").trim();
    if (key) index.set(key, record);
  });
  return index;
}

function buildEmptySnapshot() {
  return {
    referenceMonth: `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`,
    kpiCards: [],
    shipmentTrend: [],
    companyTop10: [],
    productTop10: [],
    itemShare: [],
    onTimeGauge: { value: 0, onTime: 0, total: 0 },
    lotStatus: [],
    companyShare: [],
    monthlyShipment: [],
    alarmTimeline: [],
  };
}

/**
 * 영업통계 단일 스냅샷 — 모든 섹션 자동 집계.
 * @param {{ referenceDate?: Date }} [options]
 */
export function buildSalesStatisticsSnapshot(options = {}) {
  try {
    const refDate = options.referenceDate instanceof Date ? options.referenceDate : new Date();
    const shipments = getShipmentEvents();
    const records = getSessionProductionRecords();
    const recordIndex = buildRecordIndex(records);
    const monthKeys = buildRecentMonthKeys(refDate);

    const monthShipments = shipments.filter((event) => isSameMonth(event.shippedAt, refDate));
    const monthQty = monthShipments.reduce((sum, e) => sum + toNumber(e.shipQty), 0);
    const monthLotCount = new Set(
      monthShipments.map((e) => recordIndex.get(String(e.managementId ?? ""))?.lotNo).filter(Boolean)
    ).size;
    const companyCount = new Set(monthShipments.map((e) => e.company).filter(Boolean)).size;

    // 출고 대기 — 입고완료 + 재고 보유 + 미출고
    const waitingCount = records.filter(
      (r) => isIncomingRegistered(r) && getStockQty(r) > 0 && r.shipmentStatus !== SHIPMENT_STATUS.DONE
    ).length;

    // 납기 준수 — 출고일 <= 납기일
    let onTime = 0;
    let dueTotal = 0;
    let lateCount = 0;
    const lateEvents = [];
    monthShipments.forEach((event) => {
      const record = recordIndex.get(String(event.managementId ?? ""));
      const dueDate = parseDate(record?.dueDate);
      const shipDate = parseDate(event.shippedAt);
      if (dueDate && shipDate) {
        dueTotal += 1;
        if (shipDate <= dueDate) onTime += 1;
        else {
          lateCount += 1;
          lateEvents.push({ event, record });
        }
      }
    });
    const onTimeRate = dueTotal ? round1((onTime / dueTotal) * 100) : STATISTICS_DASHBOARD_TARGETS.onTimeDelivery;

    const target = STATISTICS_DASHBOARD_TARGETS.monthlyShipment;
    const goalPct = ratio(monthQty, target);

    // ── KPI Cards (6) ────────────────────────────────────────
    const qtyByMonth = (key) =>
      shipments.filter((e) => monthKeyOf(e.shippedAt) === key).reduce((s, e) => s + toNumber(e.shipQty), 0);
    const lotByMonth = (key) =>
      new Set(
        shipments
          .filter((e) => monthKeyOf(e.shippedAt) === key)
          .map((e) => recordIndex.get(String(e.managementId ?? ""))?.lotNo)
          .filter(Boolean)
      ).size;

    const kpiCards = [
      { id: "monthQty", label: "월 출고량", value: monthQty, unit: "EA", icon: "truck", spark: monthKeys.map(({ key }) => qtyByMonth(key)) },
      { id: "monthLot", label: "출고 완료 LOT", value: monthLotCount, unit: "건", icon: "layers", spark: monthKeys.map(({ key }) => lotByMonth(key)) },
      { id: "onTime", label: "납기 준수율", value: onTimeRate, unit: "%", icon: "clock", tone: onTimeRate < STATISTICS_DASHBOARD_TARGETS.onTimeDelivery ? "danger" : undefined, spark: [] },
      { id: "waiting", label: "출고 대기", value: waitingCount, unit: "건", icon: "hourglass", spark: [] },
      { id: "company", label: "거래처 수", value: companyCount, unit: "곳", icon: "building", spark: [] },
      { id: "goal", label: "출고 목표 달성률", value: goalPct, unit: "%", icon: "target", spark: [] },
    ];

    // ── 월별 출고 Trend / 실적 ────────────────────────────────
    const shipmentTrend = monthKeys.map(({ key, label }) => ({ label, value: qtyByMonth(key) }));
    const monthlyShipment = monthKeys.map(({ key, label }) => ({
      label,
      qty: qtyByMonth(key),
      lot: lotByMonth(key),
    }));

    // ── 거래처 / 제품 / 품목 ──────────────────────────────────
    const shipRows = monthShipments.map((event) => ({
      company: event.company || "—",
      partName: event.partName || "—",
      partNo: event.partNo || "—",
      shipQty: toNumber(event.shipQty),
    }));
    const companyTop10 = topSumBy(shipRows, "company", "shipQty", 10);
    const productTop10 = topSumBy(shipRows, "partName", "shipQty", 10);
    const itemShare = topSumBy(shipRows, "partNo", "shipQty", 8);
    const companyShare = companyTop10.slice(0, 8);

    // ── 출고 LOT 현황 ────────────────────────────────────────
    const shippedLot = monthLotCount;
    const urgentCount = records.filter(
      (r) => r.urgent && isIncomingRegistered(r) && r.shipmentStatus !== SHIPMENT_STATUS.DONE
    ).length;
    const holdCount = records.filter(
      (r) => isIncomingRegistered(r) && getStockQty(r) > 0 && (r.shipmentStatus === "보류" || r.onHold)
    ).length;

    const lotStatus = [
      { id: "done", label: "출고완료", value: shippedLot, tone: "green" },
      { id: "waiting", label: "출고대기", value: waitingCount, tone: "purple" },
      { id: "urgent", label: "긴급출고", value: urgentCount, tone: "red" },
      { id: "hold", label: "보류", value: holdCount, tone: "orange" },
    ];

    // ── 영업 Alarm Timeline ───────────────────────────────────
    const alarmTimeline = [];
    lateEvents.slice(0, 4).forEach(({ event }, index) => {
      alarmTimeline.push({
        id: `late-${event.id ?? index}`,
        time: String(event.shippedAt || "—").slice(0, 10),
        label: `${event.company || "미지정"} · ${event.partName || "품목"} 납기 지연`,
        level: "danger",
      });
    });
    records
      .filter((r) => r.urgent && isIncomingRegistered(r) && r.shipmentStatus !== SHIPMENT_STATUS.DONE)
      .slice(0, 3)
      .forEach((r, index) => {
        alarmTimeline.push({
          id: `urgent-${r.id ?? index}`,
          time: String(r.dueDate || "—").slice(0, 10),
          label: `${r.company || "미지정"} · ${r.partName || r.partNo || "품목"} 긴급 출고 요청`,
          level: "warning",
        });
      });
    records
      .filter((r) => isIncomingRegistered(r) && getStockQty(r) > 0 && r.shipmentStatus !== SHIPMENT_STATUS.DONE)
      .slice(0, 3)
      .forEach((r, index) => {
        alarmTimeline.push({
          id: `wait-${r.id ?? index}`,
          time: String(r.dueDate || "—").slice(0, 10),
          label: `${r.company || "미지정"} · ${r.lotNo || r.partNo || "LOT"} 미출고 잔량`,
          level: "info",
        });
      });
    if (!alarmTimeline.length) {
      alarmTimeline.push({ id: "none", time: "—", label: "금월 영업 Alarm 없음", level: "info" });
    }

    return {
      referenceMonth: `${refDate.getFullYear()}-${pad2(refDate.getMonth() + 1)}`,
      kpiCards,
      shipmentTrend,
      companyTop10,
      productTop10,
      itemShare,
      onTimeGauge: { value: onTimeRate, onTime, total: dueTotal, late: lateCount },
      lotStatus,
      companyShare,
      monthlyShipment,
      alarmTimeline,
      goalAchievement: { value: goalPct, actual: monthQty, target },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildSalesStatisticsSnapshot]", error);
    return buildEmptySnapshot();
  }
}
