/**
 * HOME Dashboard — PM V1.0 승인 (현황 카드 · 최근 작업 리스트)
 */

import {
  CERTIFICATE_STATUS,
  SHIPMENT_STATUS,
  getRecordWorkflowState,
} from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { HOME_STATUS_GROUPS } from "../config/homeDashboard";
import { matchesExtendedSearch } from "../config/listSearchStandard";
import {
  TODAY_SUMMARY_PHASE_KEYS,
  getStatusLabelProcessKey,
} from "../config/workflowProcessColors";
import { mapStandardProductListRow } from "./processFlow";

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

function countHomeStatusCards(records = []) {
  return {
    incomingDone: records.filter((r) => isIncomingRegistered(r)).length,
    shipWaiting: records.filter(
      (r) =>
        isIncomingRegistered(r) &&
        getStockQty(r) > 0 &&
        r.shipmentStatus !== SHIPMENT_STATUS.DONE
    ).length,
    shipDone: records.filter((r) => getRecordWorkflowState(r) === "출고완료").length,
    prodWaiting: records.filter(
      (r) => isIncomingRegistered(r) && !r.registered && !r.lotNo?.trim()
    ).length,
    prodProgress: records.filter(
      (r) =>
        isIncomingRegistered(r) &&
        r.htlNo &&
        (!r.registered || !r.lotNo?.trim())
    ).length,
    prodDone: records.filter((r) => r.registered && r.lotNo?.trim()).length,
    inspectWaiting: records.filter(
      (r) =>
        r.registered &&
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
  const state = getRecordWorkflowState(record);

  if (state === "출고완료") return { label: "출고완료", variant: "complete" };
  if (state === "부분출고" || state === "성적서 발행완료") {
    return { label: "출고대기", variant: "wait" };
  }
  if (record?.certificateStatus === CERTIFICATE_STATUS.PENDING && record?.registered) {
    return { label: "성적서등록대기", variant: "certificate" };
  }
  if (record?.certificateStatus === CERTIFICATE_STATUS.ISSUED) {
    return { label: "성적서완료", variant: "complete" };
  }
  if (
    record?.registered &&
    record?.lotNo?.trim() &&
    hasInspectionLogForManagementId(record.id)
  ) {
    return { label: "검사중", variant: "progress" };
  }
  if (record?.registered && record?.lotNo?.trim()) {
    return { label: "생산중", variant: "production" };
  }
  if (record?.registered && !record?.lotNo?.trim()) {
    return { label: "생산대기", variant: "production" };
  }
  if (state === "생산계획" || record?.htlNo) {
    return { label: "생산중", variant: "production" };
  }
  if (isIncomingRegistered(record)) {
    return { label: "입고완료", variant: "incoming" };
  }
  return { label: "입고대기", variant: "wait" };
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

export function buildTodayWorkSummary(records = getSessionProductionRecords()) {
  const todayRecords = filterRecordsByPeriod(records, "today");
  const base = todayRecords.length > 0 ? todayRecords : records;
  const incoming = base.filter((r) => isIncomingRegistered(r)).length;
  const production = base.filter((r) => r.registered || r.htlNo).length;
  const inspectWait = base.filter(
    (r) => r.registered && r.lotNo?.trim() && !hasInspectionLogForManagementId(r.id)
  ).length;
  const shipWait = base.filter(
    (r) =>
      isIncomingRegistered(r) &&
      getStockQty(r) > 0 &&
      r.shipmentStatus !== SHIPMENT_STATUS.DONE
  ).length;
  const certWait = base.filter((r) => r.certificateStatus === CERTIFICATE_STATUS.PENDING).length;

  return [
    {
      id: "incoming",
      label: "입고완료",
      value: incoming,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.incoming,
    },
    {
      id: "production",
      label: "생산중",
      value: production,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.production,
    },
    {
      id: "inspect",
      label: "검사대기",
      value: inspectWait,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.inspect,
    },
    {
      id: "cert",
      label: "성적서대기",
      value: certWait,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.cert,
    },
    {
      id: "ship",
      label: "출고예정",
      value: shipWait,
      phaseKey: TODAY_SUMMARY_PHASE_KEYS.ship,
    },
  ];
}

export function buildHomeTopKpiCounts(records = getSessionProductionRecords()) {
  const todayRecords = filterRecordsByPeriod(records, "today");
  const base = todayRecords.length > 0 ? todayRecords : records;
  const counts = countHomeStatusCards(records);

  return {
    todayIncoming: base.filter((r) => isIncomingRegistered(r)).length,
    prodProgress: counts.prodProgress,
    inspectWait: counts.inspectWaiting,
    shipScheduled: counts.shipWaiting,
    certWait: records.filter(
      (r) => r.certificateStatus === CERTIFICATE_STATUS.PENDING && r.registered
    ).length,
  };
}

export function buildProductionPeriodStats(records = getSessionProductionRecords(), period = "today") {
  const scoped = filterRecordsByPeriod(records, period);
  const counts = countHomeStatusCards(scoped);
  return [
    { label: "생산 예정", value: counts.prodWaiting },
    { label: "생산 진행", value: counts.prodProgress },
    { label: "생산 완료", value: counts.prodDone },
  ];
}

export function buildHomeStatusSummaryStats(records = getSessionProductionRecords(), tabId = "production") {
  const counts = countHomeStatusCards(records);

  if (tabId === "production") {
    return [
      { label: "생산 예정", value: counts.prodWaiting },
      { label: "생산 진행", value: counts.prodProgress },
      { label: "생산 완료", value: counts.prodDone },
    ];
  }

  if (tabId === "inspection") {
    const inspectProgress = records.filter((record) => {
      if (!hasInspectionLogForManagementId(record.id)) return false;
      return getHomeDisplayStatus(record).label === "검사중";
    }).length;
    const inspectDone = records.filter((record) => {
      if (!hasInspectionLogForManagementId(record.id)) return false;
      const label = getHomeDisplayStatus(record).label;
      return label !== "검사중" && label !== "검사대기";
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
  return Object.values(search).some((value) => String(value ?? "").trim());
}

function isActiveWorkflowRecord(record) {
  const state = getRecordWorkflowState(record);
  if (state === "출고완료" && getStockQty(record) <= 0) return false;
  return isIncomingRegistered(record);
}

export function getProductWorkflowSignal(record, status = getHomeDisplayStatus(record)) {
  return getStatusLabelProcessKey(status.label);
}

export function buildHomeWorkflowPhases(record) {
  const incomingDone = isIncomingRegistered(record);
  const prodDone = Boolean(record?.registered && record?.lotNo?.trim());
  const inspectDone = hasInspectionLogForManagementId(record?.id);
  const certDone = record?.certificateStatus === CERTIFICATE_STATUS.ISSUED;
  const shipDone = record?.shipmentStatus === SHIPMENT_STATUS.DONE;

  const phaseDefs = [
    { key: "incoming", label: "입고", done: incomingDone },
    { key: "production", label: "생산중", done: prodDone },
    { key: "inspection", label: "검사", done: inspectDone },
    { key: "certificate", label: "성적서", done: certDone },
    { key: "shipment", label: "출고완료", done: shipDone },
  ];

  const activeIndex = phaseDefs.findIndex((phase) => !phase.done);

  if (activeIndex === -1) {
    return phaseDefs.map(({ key, label }) => ({ key, label, state: "done" }));
  }

  return phaseDefs.map(({ key, label }, index) => ({
    key,
    label,
    state: index < activeIndex ? "done" : index === activeIndex ? "active" : "pending",
  }));
}

/** @param {'done' | 'active' | 'pending'} state */
export function getPhaseStateLabel(state) {
  if (state === "done") return "완료";
  if (state === "active") return "진행중";
  return "대기";
}

const WORKFLOW_DONE_PROGRESS = {
  incoming: 20,
  production: 40,
  inspection: 60,
  certificate: 80,
  shipment: 100,
};

const WORKFLOW_ACTIVE_PROGRESS = {
  incoming: 20,
  production: 40,
  inspection: 75,
  certificate: 80,
  shipment: 90,
};

/** 입고(20%) → 생산(40%) → 검사(60%) → 성적서(80%) → 출고(100%) */
export function getProductWorkflowProgressPercent(record) {
  const phases = buildHomeWorkflowPhases(record);
  if (phases.every((phase) => phase.state === "done")) return 100;

  let progress = 0;
  for (const phase of phases) {
    if (phase.state === "done") {
      progress = WORKFLOW_DONE_PROGRESS[phase.key] ?? progress;
    } else if (phase.state === "active") {
      return WORKFLOW_ACTIVE_PROGRESS[phase.key] ?? progress;
    }
  }
  return progress;
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

  const rows = records
    .filter(isActiveWorkflowRecord)
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((record) => {
      const status = getHomeDisplayStatus(record);
      const row = mapStandardProductListRow(record, status);
      const due = getDueDateDisplay(record);
      return {
        ...row,
        managementId: record.id,
        currentProcess: status.label,
        processKey: getStatusLabelProcessKey(status.label),
        signal: getProductWorkflowSignal(record, status),
        phases: buildHomeWorkflowPhases(record),
        progressPercent: getProductWorkflowProgressPercent(record),
        dueDateLabel: due.label,
        dueDateTone: due.tone,
        dueDate: record.dueDate ?? "",
        managerLabel: record.registrar ?? record.manager ?? "—",
        noteLabel: record.note?.trim() || "—",
      };
    });

  const filtered = search && hasActiveHomeSearch(search)
    ? rows.filter((row) => matchesExtendedSearch(search, row))
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
  } else if (tab === "certificate") {
    scoped = scoped.filter(
      (r) =>
        r.certificateStatus === CERTIFICATE_STATUS.PENDING ||
        r.certificateStatus === CERTIFICATE_STATUS.ISSUED
    );
  } else if (tab === "shipment") {
    scoped = scoped.filter((r) => isIncomingRegistered(r));
  }

  return buildRecentWorkList(scoped, { requireIncoming: tab === "incoming" });
}
