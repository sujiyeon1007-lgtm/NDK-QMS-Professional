/**
 * Project TITAN Sprint 7 — 품질통계 (Quality Statistics · Analytics · Read Only)
 *
 * 검사일지 · 불량이력 · LOT Lifecycle 데이터를 집계하여 품질 성과를 분석한다.
 * 모든 지표는 입력 금지 — 자동 계산. (더미 SessionStorage 기반)
 *
 * 단일 진입: buildQualityStatisticsSnapshot()
 */

import { getInspectionLogs } from "./inspectionLogSession";
import { getSessionDefectRecords } from "./defectHistorySession";
import { getSessionProductionRecords } from "./productionRecords";
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

function buildRecentMonthKeys(refDate, count = 6) {
  const keys = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    keys.push({ key: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`, label: `${d.getMonth() + 1}월` });
  }
  return keys;
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

function resolveDefectTypeFromLog(log) {
  const direct = String(log.defectType ?? "").trim();
  if (direct) return direct;
  const item = String(log.inspectionItem ?? "").trim();
  if (item.includes("경도")) return "경도불량";
  if (item.includes("치수")) return "치수불량";
  if (item.includes("조직") || item.includes("현미경")) return "조직불량";
  if (item.includes("외관")) return "외관불량";
  return "기타";
}

function buildEquipmentIndex(records) {
  const index = new Map();
  records.forEach((record) => {
    const key = String(record.id ?? record.mesManagementNo ?? "").trim();
    if (key) index.set(key, String(record.equipment ?? "").trim() || "미지정");
  });
  return index;
}

function enrichLogWithEquipment(log, equipmentIndex) {
  const equipment =
    String(log.equipment ?? log.inspectionEquipment ?? "").trim() ||
    equipmentIndex.get(String(log.managementId ?? "").trim()) ||
    "미지정";
  return { ...log, resolvedEquipment: equipment };
}

function buildEmptySnapshot() {
  return {
    referenceMonth: `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`,
    kpiCards: [],
    monthlyTrend: [],
    pareto: [],
    defectTop10: [],
    processDefects: [],
    equipmentDefects: [],
    inspectorRanking: [],
    lotQuality: [],
    customerDefects: [],
    alarmTimeline: [],
  };
}

/**
 * 품질통계 단일 스냅샷 — 모든 섹션 자동 집계.
 * @param {{ referenceDate?: Date }} [options]
 */
export function buildQualityStatisticsSnapshot(options = {}) {
  try {
    const refDate = options.referenceDate instanceof Date ? options.referenceDate : new Date();
    const inspections = getInspectionLogs().filter((log) => !log.deleted);
    const defects = getSessionDefectRecords();
    const productionRecords = getSessionProductionRecords();
    const equipmentIndex = buildEquipmentIndex(productionRecords);
    const monthKeys = buildRecentMonthKeys(refDate);

    const monthInspections = inspections.filter((log) => isSameMonth(log.inspectionDate, refDate));
    const monthDefects = defects.filter((d) => isSameMonth(d.registeredDate || d.date, refDate));

    const passCount = monthInspections.filter((log) => log.judgment === "합격").length;
    const failCount = monthInspections.filter((log) => log.judgment === "불합격").length;
    const holdCount = monthInspections.filter((log) => log.judgment === "보류").length;
    const reinspectCount = monthInspections.filter((log) => log.category === "재검사").length;
    const inspectTotal = monthInspections.length;
    const passRate = inspectTotal ? round1((passCount / inspectTotal) * 100) : 0;
    const defectRate = inspectTotal ? round1((failCount / inspectTotal) * 100) : 0;
    const openNcr = defects.filter((d) => d.handlingStatus !== "완료").length;
    const qualityTarget = STATISTICS_DASHBOARD_TARGETS.qualityPassRate;

    // ── KPI Cards (6) ────────────────────────────────────────
    const countByMonth = (key) => inspections.filter((log) => monthKeyOf(log.inspectionDate) === key).length;
    const passRateByMonth = (key) => {
      const rows = inspections.filter((log) => monthKeyOf(log.inspectionDate) === key);
      const total = rows.length;
      const pass = rows.filter((log) => log.judgment === "합격").length;
      return total ? round1((pass / total) * 100) : 0;
    };

    const kpiCards = [
      { id: "inspection", label: "월 검사량", value: inspectTotal, unit: "건", icon: "clipboard", spark: monthKeys.map(({ key }) => countByMonth(key)) },
      { id: "passRate", label: "합격률", value: passRate, unit: "%", icon: "check", spark: monthKeys.map(({ key }) => passRateByMonth(key)) },
      { id: "defectRate", label: "불량률", value: defectRate, unit: "%", icon: "alert", tone: defectRate > STATISTICS_DASHBOARD_TARGETS.defectRate ? "danger" : undefined, spark: [] },
      { id: "fail", label: "불합격", value: failCount, unit: "건", icon: "x", spark: [] },
      { id: "ncr", label: "NCR 미처리", value: openNcr, unit: "건", icon: "shield", tone: openNcr > 0 ? "danger" : undefined, spark: [] },
      { id: "reinspect", label: "재검사", value: reinspectCount, unit: "건", icon: "refresh", spark: [] },
    ];

    // ── 월별 품질 Trend ──────────────────────────────────────
    const monthlyTrend = monthKeys.map(({ key, label }) => {
      const rows = inspections.filter((log) => monthKeyOf(log.inspectionDate) === key);
      const total = rows.length;
      const pass = rows.filter((log) => log.judgment === "합격").length;
      const fail = rows.filter((log) => log.judgment === "불합격").length;
      return {
        label,
        inspectionCount: total,
        passRate: total ? round1((pass / total) * 100) : 0,
        defectRate: total ? round1((fail / total) * 100) : 0,
      };
    });

    // ── Pareto / 불량유형 TOP10 ──────────────────────────────
    const failLogs = monthInspections.filter((log) => log.judgment === "불합격");
    const defectRows = [
      ...monthDefects.map((d) => ({ defectType: d.defectType || "기타" })),
      ...failLogs.map((log) => ({ defectType: resolveDefectTypeFromLog(log) })),
    ];
    const paretoBase = topCount(defectRows, "defectType", 8);
    const paretoTotal = paretoBase.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;
    const pareto = paretoBase.map((item) => {
      cumulative += item.value;
      return { ...item, cumulativePct: paretoTotal ? round1((cumulative / paretoTotal) * 100) : 0 };
    });
    const defectTop10 = topCount(defectRows, "defectType", 10);

    // ── 공정별 / 설비별 불량 ─────────────────────────────────
    const failEnriched = failLogs.map((log) => enrichLogWithEquipment(log, equipmentIndex));
    const processDefects = topCount(
      failEnriched.map((log) => ({ process: log.process || "미지정" })),
      "process",
      8
    ).map((row) => ({
      ...row,
      rate: failEnriched.length ? round1((row.value / failEnriched.length) * 100) : 0,
    }));

    const equipmentDefects = topCount(
      failEnriched.map((log) => ({ equipment: log.resolvedEquipment })),
      "equipment",
      8
    ).map((row) => ({
      label: row.label,
      value: row.value,
      rate: failEnriched.length ? round1((row.value / failEnriched.length) * 100) : 0,
    }));

    // ── 검사원 Ranking ───────────────────────────────────────
    const inspectorRanking = topCount(
      monthInspections.map((log) => ({
        assignee: String(log.assignee ?? "미지정").split("/").pop()?.trim() || "미지정",
      })),
      "assignee",
      10
    );

    // ── LOT 품질현황 ─────────────────────────────────────────
    const lotQuality = [
      { id: "pass", label: "합격", value: passCount, tone: "green" },
      { id: "fail", label: "불합격", value: failCount, tone: "red" },
      { id: "hold", label: "보류", value: holdCount, tone: "orange" },
      { id: "reinspect", label: "재검사", value: reinspectCount, tone: "purple" },
      { id: "target", label: "품질목표", value: qualityTarget, tone: "blue", unit: "%" },
    ];

    // ── 고객별 불량현황 ────────────────────────────────────────
    const customerDefects = topCount(
      [
        ...monthDefects.map((d) => ({ company: d.company || "미지정" })),
        ...failLogs.map((log) => ({ company: log.company || "미지정" })),
      ],
      "company",
      10
    );

    // ── 품질 Alarm Timeline ────────────────────────────────────
    const alarmTimeline = [];
    defects
      .filter((d) => d.handlingStatus !== "완료")
      .slice(0, 4)
      .forEach((d, index) => {
        alarmTimeline.push({
          id: `ncr-${d.id ?? index}`,
          time: String(d.registeredDate || d.date || "—").slice(0, 10),
          label: `${d.company || "미지정"} · ${d.defectType || "불량"} NCR 미처리`,
          level: "danger",
        });
      });
    failLogs.slice(0, 3).forEach((log, index) => {
      alarmTimeline.push({
        id: `fail-${log.id ?? index}`,
        time: log.inspectionDate || "—",
        label: `${log.company || "미지정"} · ${log.partName || log.partNo || "품목"} 불합격`,
        level: "danger",
      });
    });
    monthInspections
      .filter((log) => log.judgment === "보류")
      .slice(0, 3)
      .forEach((log, index) => {
        alarmTimeline.push({
          id: `hold-${log.id ?? index}`,
          time: log.inspectionDate || "—",
          label: `${log.company || "미지정"} · ${log.lotNo || log.managementId || "LOT"} 검사 보류`,
          level: "warning",
        });
      });
    if (!alarmTimeline.length) {
      alarmTimeline.push({
        id: "none",
        time: "—",
        label: "금월 품질 Alarm 없음",
        level: "info",
      });
    }

    return {
      referenceMonth: `${refDate.getFullYear()}-${pad2(refDate.getMonth() + 1)}`,
      kpiCards,
      monthlyTrend,
      pareto,
      defectTop10,
      processDefects,
      equipmentDefects,
      inspectorRanking,
      lotQuality,
      customerDefects,
      alarmTimeline,
      qualityGauge: { value: passRate, actual: passRate, target: qualityTarget },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildQualityStatisticsSnapshot]", error);
    return buildEmptySnapshot();
  }
}
