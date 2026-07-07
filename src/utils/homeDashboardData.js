/**
 * HOME Dashboard — PM V1.0 승인 (현황 카드 · 최근 작업 리스트)
 */

import { HT_TERM } from "../config/titanHeatTreatmentTerminology";
import {
  CERTIFICATE_STATUS,
  SHIPMENT_STATUS,
  getRecordWorkflowState,
} from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { HOME_WORKFLOW_PHASES, HOME_STATUS_GROUPS } from "../config/homeDashboard";
import { matchesExtendedSearch } from "../config/listSearchStandard";
import {
  CURRENT_PROCESS_KEYS,
  resolveRecordCurrentProcess,
  matchesCurrentProcessKpiBucket,
  CURRENT_PROCESS_KPI_BUCKETS,
} from "./workflowProcessStatus";
import {
  TODAY_SUMMARY_PHASE_KEYS,
  getStatusLabelProcessKey,
} from "../config/workflowProcessColors";
import { mapStandardProductListRow } from "./processFlow";
import { getExpiringDocuments } from "./companyDocumentManagement";
import { WORKFLOW_STATUS } from "./titanWorkflowStatus";

const REGISTRAR_FALLBACK = "관리자";

const DISPLAY_TIMES = [
  "11:42",
  "11:18",
  "10:55",
  "10:31",
  "09:47",
  "09:20",
  "08:50",
  "08:15",
  "08:02",
  "07:45",
];

export function countHomeStatusCards(records = []) {
  return {
    incomingDone: records.filter((r) => isIncomingRegistered(r)).length,
    shipWaiting: records.filter(
      (r) =>
        isIncomingRegistered(r) &&
        getStockQty(r) > 0 &&
        r.shipmentStatus !== SHIPMENT_STATUS.DONE
    ).length,
    shipDone: records.filter((r) => getRecordWorkflowState(r) === "출고완료").length,
    prodProgress: records.filter((r) => {
      if (!isIncomingRegistered(r)) return false;
      const hasHeatTreatmentEntry =
        r.htlNo?.trim() ||
        r.workSheetGenerated ||
        (r.registered && r.lotNo?.trim());
      if (!hasHeatTreatmentEntry) return false;
      if (r.completionStatus === "생산완료" || r.completionStatus === WORKFLOW_STATUS.PROD_DONE) {
        return false;
      }
      if (hasInspectionLogForManagementId(r.id)) return false;
      return true;
    }).length,
    prodDone: records.filter(
      (r) => r.completionStatus === "생산완료" || r.completionStatus === WORKFLOW_STATUS.PROD_DONE
    ).length,
    inspectWaiting: records.filter(
      (r) =>
        r.completionStatus === "생산완료" &&
        r.lotNo?.trim() &&
        !hasInspectionLogForManagementId(r.id)
    ).length,
    inspectDone: records.filter(
      (r) =>
        r.registered &&
        r.lotNo?.trim() &&
        hasInspectionLogForManagementId(r.id) &&
        r.certificateStatus === CERTIFICATE_STATUS.PENDING
    ).length,
    certDone: records.filter(
      (r) => r.certificateStatus === CERTIFICATE_STATUS.ISSUED
    ).length,
  };
}

export function buildHomeStatusGroups(records = getSessionProductionRecords()) {
  const counts = countHomeStatusCards(records);

  return HOME_STATUS_GROUPS.map((group) => ({
    ...group,
    cards: group.cards.map((card) => ({
      ...card,
      count: counts[card.id] ?? 0,
    })),
  }));
}

export function getHomeDisplayStatus(record) {
  const current = resolveRecordCurrentProcess(record);
  const variantMap = {
    RECEIVED: "incoming",
    HT_WAIT: "production",
    HT_RUNNING: "production",
    INSPECTION_WAIT: "inspect-wait",
    INSPECTION_DONE: "inspect-done",
    CERT_WAIT: "cert-wait",
    CERT_DONE: "cert-done",
    SHIP_WAIT: "ship-ready",
    SHIPPED: "ship-done",
  };

  return {
    label: current.label,
    variant: variantMap[current.key] ?? "wait",
  };
}

function formatRegisteredAt(record, index) {
  const date = record.lotCreatedAt ?? record.incomingDate ?? "";
  const time = DISPLAY_TIMES[index] ?? "—";
  if (!date) return "—";
  if (String(date).includes("T")) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      const hh = String(parsed.getHours()).padStart(2, "0");
      const mm = String(parsed.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${d} ${hh}:${mm}`;
    }
  }
  return `${date} ${time}`;
}

export function buildRecentWorkList(records = getSessionProductionRecords(), options = {}) {
  const { requireIncoming = true } = options;
  return [...records]
    .filter((r) => (requireIncoming ? isIncomingRegistered(r) : true))
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((record, index) => {
      const status = getHomeDisplayStatus(record);
      const row = mapStandardProductListRow(record, status);
      return {
        ...row,
        registeredAt: formatRegisteredAt(record, index),
        registrar: record.registrar ?? REGISTRAR_FALLBACK,
      };
    });
}

export function getHomeDashboardData(records = getSessionProductionRecords()) {
  return {
    statusGroups: buildHomeStatusGroups(records),
    recentWorkList: buildRecentWorkList(records),
  };
}

function getRecordDate(record) {
  return String(record.incomingDate || record.workDate || "").slice(0, 10);
}

function filterRecordsByPeriod(records, period) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const filtered = records.filter((record) => {
    const date = getRecordDate(record);
    if (!date) return false;
    if (period === "today") return date === today;
    if (period === "week") return date >= weekAgo && date <= today;
    if (period === "month") return date >= monthStart && date <= today;
    return true;
  });

  return filtered.length > 0 ? filtered : records;
}

/** KPI chip ids — PM V1.4 영문 Key */
const HOME_KPI_CHIP_IDS = [
  "RECEIVED",
  "HT_WAIT",
  "HT_RUNNING",
  "INSPECTION_WAIT",
  "CERT_WAIT",
  "SHIP_WAIT",
];

/**
 * HOME — KPI · List · Chip shared base records + process counts
 * @param {object[]} records
 * @returns {{ baseRecords: object[], counts: Record<string, number> }}
 */
export function getHomeScreenData(records = getSessionProductionRecords()) {
  const baseRecords = records.filter(isActiveWorkflowRecordForHome);

  const countKpiBucket = (kpiId) =>
    baseRecords.filter((record) => matchesCurrentProcessKpiBucket(record, kpiId)).length;

  return {
    baseRecords,
    counts: Object.fromEntries(HOME_KPI_CHIP_IDS.map((id) => [id, countKpiBucket(id)])),
  };
}

export function buildTodayWorkSummary(records = getSessionProductionRecords()) {
  const { counts } = getHomeScreenData(records);

  return [
    {
      id: "RECEIVED",
      label: "입고등록",
      value: counts.RECEIVED,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.RECEIVED,
    },
    {
      id: "HT_WAIT",
      label: "열처리 대기",
      value: counts.HT_WAIT,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.HT_WAIT,
    },
    {
      id: "HT_RUNNING",
      label: "열처리 중",
      value: counts.HT_RUNNING,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.HT_RUNNING,
    },
    {
      id: "INSPECTION_WAIT",
      label: "검사 대기",
      value: counts.INSPECTION_WAIT,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.INSPECTION_WAIT,
    },
    {
      id: "CERT_WAIT",
      label: "성적서 대기",
      value: counts.CERT_WAIT,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.CERT_WAIT,
    },
    {
      id: "SHIP_WAIT",
      label: "출고 대기",
      value: counts.SHIP_WAIT,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.SHIP_WAIT,
    },
  ];
}

const TODAY_ACTION_ROUTES = {
  RECEIVED: { to: "/inout/incoming", verb: "입고 확인", shortTitle: "입고등록" },
  HT_WAIT: { to: "/production/daily-report", verb: "LOT 등록", shortTitle: "열처리 대기" },
  HT_RUNNING: { to: "/production/daily-report", verb: "열처리 완료", shortTitle: "열처리 중" },
  INSPECTION_WAIT: { to: "/quality/inspection", verb: "검사 등록", shortTitle: "검사 대기" },
  CERT_WAIT: { to: "/quality/certificate", verb: "성적서 발행", shortTitle: "성적서 대기" },
  SHIP_WAIT: { to: "/inout/shipment", verb: "출고 처리", shortTitle: "출고 대기" },
};

/** HOME — Workflow 기반 오늘 해야 할 일 (시스템 추천 액션) */
export function buildTodayActionItems(records = getSessionProductionRecords()) {
  return buildTodayWorkSummary(records)
    .filter((item) => item.value > 0)
    .map((item) => {
      const route = TODAY_ACTION_ROUTES[item.id] ?? { to: "/home", verb: "확인", shortTitle: item.label };
      return {
        id: `today-action-${item.id}`,
        title: route.shortTitle ?? item.label,
        count: item.value,
        subtitle: route.verb,
        to: route.to,
        phaseKey: item.phaseKey,
        widgetKey: item.id,
      };
    });
}

export function buildHomeTopKpiCounts(records = getSessionProductionRecords()) {
  const today = new Date().toISOString().slice(0, 10);
  const { counts } = getHomeScreenData(records);

  const todayIncoming = records.filter((record) => {
    if (!isIncomingRegistered(record)) return false;
    return getRecordDate(record) === today;
  }).length;

  const currentStock = records
    .filter((record) => isIncomingRegistered(record))
    .reduce((sum, record) => sum + getStockQty(record), 0);

  const todayShipment = records.filter((record) => {
    if (record.shipmentStatus !== SHIPMENT_STATUS.DONE) return false;
    const shipDate = String(record.outboundDate ?? record.shipDate ?? "").slice(0, 10);
    return shipDate === today;
  }).length;

  return {
    todayIncoming,
    currentStock,
    workProgress: counts.HT_RUNNING,
    inspectWait: counts.INSPECTION_WAIT,
    todayShipment,
  };
}

export function buildProductionPeriodStats(records = getSessionProductionRecords(), period = "today") {
  const scoped = filterRecordsByPeriod(records, period);
  const counts = countHomeStatusCards(scoped);
  return [
    { label: "열처리 진행", value: counts.prodProgress },
    { label: HT_TERM.DONE, value: counts.prodDone },
  ];
}

export function buildHomeStatusSummaryStats(records = getSessionProductionRecords(), tabId = "production") {
  const counts = countHomeStatusCards(records);

  if (tabId === "production") {
    return [
      { label: "열처리 진행", value: counts.prodProgress },
      { label: "열처리완료", value: counts.prodDone },
    ];
  }

  if (tabId === "inspection") {
    const inspectProgress = records.filter((record) => {
      const label = getHomeDisplayStatus(record).label;
      return label === "성적서 대기";
    }).length;
    const inspectDone = records.filter((record) => {
      if (!hasInspectionLogForManagementId(record.id)) return false;
      const label = getHomeDisplayStatus(record).label;
      return label !== "검사대기" && label !== "성적서 대기";
    }).length;
    const reprocess = records.filter(
      (record) =>
        record.reprocess === "Y" || String(record.completionStatus ?? "").includes("재처리")
    ).length;

    return [
      { label: "검사 대기", value: counts.inspectWaiting },
      { label: "검사 진행", value: inspectProgress },
      { label: "검사 완료", value: inspectDone },
      { label: "재처리", value: reprocess },
    ];
  }

  if (tabId === "inout") {
    const incomingScheduled = records.filter((record) => !isIncomingRegistered(record)).length;
    return [
      { label: "입고 예정", value: incomingScheduled },
      { label: "입고 완료", value: counts.incomingDone },
      { label: "출고 대기", value: counts.shipWaiting },
      { label: "출고 완료", value: counts.shipDone },
    ];
  }

  if (tabId === "certificate") {
    const certPending = records.filter(
      (record) =>
        record.certificateStatus === CERTIFICATE_STATUS.PENDING &&
        Boolean(record.registered && record.lotNo?.trim())
    ).length;
    const certRevision = records.filter((record) => record.certificateRevisionRequested === true).length;

    return [
      { label: "등록 대기", value: certPending },
      { label: "등록 완료", value: counts.certDone },
      { label: "수정 요청", value: certRevision },
    ];
  }

  return [];
}

function hasActiveHomeSearch(search = {}) {
  return Object.entries(search).some(([, value]) => String(value ?? "").trim());
}

function resolveHomeRowProcessKey(row) {
  return row.currentProcessKey ?? row.processKey ?? "";
}

function matchesHomeChipSearch(row, search = {}) {
  const record = row?.record ?? null;
  const matchBucket = (kpiId) => {
    if (record) return matchesCurrentProcessKpiBucket(record, kpiId);
    const key = row?.currentProcessKey ?? "";
    const bucket = CURRENT_PROCESS_KPI_BUCKETS[kpiId] ?? [];
    return bucket.includes(key);
  };

  if (search.__chipRECEIVED && !matchBucket("RECEIVED")) return false;
  if (search.__chipHT_WAIT && !matchBucket("HT_WAIT")) return false;
  if (search.__chipHT_RUNNING && !matchBucket("HT_RUNNING")) return false;
  if (search.__chipINSPECTION_WAIT && !matchBucket("INSPECTION_WAIT")) return false;
  if (search.__chipCERT_WAIT && !matchBucket("CERT_WAIT")) return false;
  if (search.__chipSHIP_WAIT && !matchBucket("SHIP_WAIT")) return false;
  return true;
}

function isActiveWorkflowRecord(record) {
  const current = resolveRecordCurrentProcess(record);
  if (current.key === CURRENT_PROCESS_KEYS.SHIPPED) return false;
  return isIncomingRegistered(record);
}

/** HOME list · KPI shared base filter */
export const isActiveWorkflowRecordForHome = isActiveWorkflowRecord;

export function getProductWorkflowSignal(record, status = getHomeDisplayStatus(record)) {
  return getStatusLabelProcessKey(status.label);
}

function isHomeWorkflowPhaseDone(record, phaseKey) {
  const current = resolveRecordCurrentProcess(record);
  const phaseOrder = Object.values(CURRENT_PROCESS_KEYS);
  const currentIndex = phaseOrder.indexOf(current.key);
  const phaseIndex = phaseOrder.indexOf(phaseKey);
  if (currentIndex === -1 || phaseIndex === -1) return false;
  return currentIndex > phaseIndex;
}

export function buildHomeWorkflowPhases(record) {
  const phaseDefs = HOME_WORKFLOW_PHASES.map(({ key, label }) => ({
    key,
    label,
    done: isHomeWorkflowPhaseDone(record, key),
  }));

  if (phaseDefs.every((phase) => phase.done)) {
    return phaseDefs.map(({ key, label }) => ({ key, label, state: "done" }));
  }

  const current = resolveRecordCurrentProcess(record);
  const activeIndex = phaseDefs.findIndex((phase) => phase.key === current.key);

  return phaseDefs.map((phase, index) => {
    if (phase.done) {
      return { key: phase.key, label: phase.label, state: "done" };
    }
    if (activeIndex === -1) {
      return { key: phase.key, label: phase.label, state: "pending" };
    }
    if (index === activeIndex) {
      return { key: phase.key, label: phase.label, state: "active" };
    }
    if (index < activeIndex) {
      return { key: phase.key, label: phase.label, state: "done" };
    }
    return { key: phase.key, label: phase.label, state: "pending" };
  });
}

/** @param {'done' | 'active' | 'pending'} state */
export function getPhaseStateLabel(state) {
  if (state === "done") return "완료";
  if (state === "active") return "진행중";
  return "대기";
}

const WORKFLOW_PHASE_PROGRESS = {
  RECEIVED: 11,
  HT_WAIT: 22,
  HT_RUNNING: 33,
  INSPECTION_WAIT: 44,
  INSPECTION_DONE: 55,
  CERT_WAIT: 66,
  CERT_DONE: 77,
  SHIP_WAIT: 88,
  SHIPPED: 100,
};

/** @deprecated resolveRecordCurrentProcess — HOME progress bar 호환 */
export function resolveHomeWorkflowCurrentPhase(record) {
  return resolveRecordCurrentProcess(record);
}

/** 입고(20%) → 작업(40%) → 검사(60%) → 성적서(80%) → 출고(100%) */
export function getProductWorkflowProgressPercent(record) {
  const phases = buildHomeWorkflowPhases(record);
  if (phases.every((phase) => phase.state === "done")) return 100;

  const active = phases.find((phase) => phase.state === "active");
  if (active) return WORKFLOW_PHASE_PROGRESS[active.key] ?? 0;

  let lastDoneKey = null;
  for (const phase of phases) {
    if (phase.state === "done") {
      lastDoneKey = phase.key;
    } else {
      break;
    }
  }
  if (lastDoneKey) return WORKFLOW_PHASE_PROGRESS[lastDoneKey] ?? 0;

  return 0;
}

/** HOME Row — phases · currentProcess · progressPercent 단일 소스 */
export function buildHomeRowWorkflow(record) {
  const phases = buildHomeWorkflowPhases(record);
  const current = resolveRecordCurrentProcess(record);

  return {
    phases,
    currentProcessLabel: current.label,
    currentProcessKey: current.key,
    currentProcessVariant: current.variant,
    progressPercent: getProductWorkflowProgressPercent(record),
  };
}

export function getActiveWorkflowPhase(phases = []) {
  return phases.find((phase) => phase.state === "active") ?? null;
}

export function getNextWorkflowPhaseLabel(phases = []) {
  const activeIndex = phases.findIndex((phase) => phase.state === "active");
  if (activeIndex === -1) {
    if (phases.every((phase) => phase.state === "done")) return "완료";
    const firstPending = phases.find((phase) => phase.state === "pending");
    return firstPending?.label ?? "—";
  }
  const next = phases[activeIndex + 1];
  return next?.label ?? "완료";
}

export function getDueDateDisplay(record) {
  const raw = record?.dueDate ?? "";
  const text = String(raw).trim().slice(0, 10);
  if (!text) return { label: "—", tone: "normal" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(text);
  if (Number.isNaN(due.getTime())) return { label: text, tone: "normal" };
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return { label: text, tone: "delay" };
  if (diffDays <= 3) return { label: text, tone: "soon" };
  return { label: text, tone: "normal" };
}

export function buildProductWorkflowPreview(records = getSessionProductionRecords(), options = {}) {
  const { limit = 15, search = null } = options;
  const { baseRecords } = getHomeScreenData(records);

  const rows = baseRecords
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((record) => {
      const status = getHomeDisplayStatus(record);
      const row = mapStandardProductListRow(record, status);
      const due = getDueDateDisplay(record);
      const workflow = buildHomeRowWorkflow(record);
      const totalQty = Number(record.qty) || 0;
      const unit = record.unit || "EA";
      const completedQty = Math.round((totalQty * workflow.progressPercent) / 100);
      return {
        ...row,
        managementId: record.id,
        currentProcess: workflow.currentProcessLabel,
        currentProcessKey: workflow.currentProcessKey,
        currentProcessVariant: workflow.currentProcessVariant,
        processKey: workflow.currentProcessKey,
        statusLabel: workflow.currentProcessLabel,
        phases: workflow.phases,
        progressPercent: workflow.progressPercent,
        workQtyLabel: `${totalQty.toLocaleString("ko-KR")} ${unit}`,
        completedQtyLabel: `${completedQty.toLocaleString("ko-KR")} ${unit}`,
        dueDateLabel: due.label,
        dueDateTone: due.tone,
        dueDate: record.dueDate ?? "",
        managerLabel: record.registrar ?? record.manager ?? "—",
        noteLabel: record.note?.trim() || "—",
      };
    });

  const filtered =
    search && hasActiveHomeSearch(search)
      ? rows.filter((row) => matchesExtendedSearch(search, row) && matchesHomeChipSearch(row, search))
      : rows;

  return filtered.slice(0, limit);
}

export function buildRecentListByTab(records = getSessionProductionRecords(), tab = "incoming") {
  let scoped = [...records];

  if (tab === "incoming") {
    scoped = scoped.filter((r) => isIncomingRegistered(r));
  } else if (tab === "production") {
    scoped = scoped.filter((r) => r.registered || r.htlNo);
  } else if (tab === "inspection") {
    scoped = scoped.filter((r) => r.registered && r.lotNo?.trim());
  } else if (tab === "shipment") {
    scoped = scoped.filter(
      (r) => r.shipmentStatus === SHIPMENT_STATUS.DONE || getRecordWorkflowState(r) === "출고완료"
    );
  }

  return buildRecentWorkList(scoped, { requireIncoming: tab === "incoming" });
}

/** HOME — 문서 만료 예정 알림 (문서관리 DMS) */
export function buildDocumentExpiryAlerts(limit = 5) {
  const rows = getExpiringDocuments()
    .sort((a, b) => {
      const daysA = a.expiryStatus?.daysLeft ?? 9999;
      const daysB = b.expiryStatus?.daysLeft ?? 9999;
      return daysA - daysB;
    })
    .slice(0, limit);

  return rows.map((row) => ({
    id: `doc-expiry-${row.id}`,
    title: `${row.title} — ${row.expiryStatus?.label || "만료 예정"}`,
    count: 1,
    subtitle: row.company,
    to: "/documents",
    phaseKey: "documents",
    widgetKey: "documentExpiry",
  }));
}
