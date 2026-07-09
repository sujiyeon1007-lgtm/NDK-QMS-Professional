/**
 * Project TITAN V2.0 — Quality Workspace Data (Sprint 6)
 *
 * Blueprint ⑤ 품질관리 — Quality Shell + Task/History Workspaces
 *
 * 데이터 흐름:
 *   TitanDataEngine(품질 SSOT · productionRecords + quality sessions)
 *     → TitanWorkflowEngine Stage 판정 (workflowProcessStatus)
 *       → Quality Workspace (Stage · Type · Result 필터)
 *         → UI
 *
 * Task Workspace 원칙:
 *   - KPI = 리스트 동일 records (예외 없음)
 *   - Type · Status · Result 분리 (Blueprint)
 *   - 검사 완료 → 성적서관리 · FAIL/REWORK → NCR (Engine)
 */


import { getCertificateMenuListRows } from "./certificateStatus";
import {
  getDevelopmentInspections,
  mapDevelopmentInspectionToListRow,
} from "./developmentInspectionSession";
import { getInspectionLogs } from "./inspectionLogSession";
import {
  isCertificateMenuEligible,
  isHeatTreatmentComplete,
  isInspectionComplete,
  isInspectionMenuEligible,
  MENU_TASK_STATUS,
} from "./menuWorkflowGate";
import { getMassProductionInspectionRows } from "./massProductionInspection";
import {
  getOtherInspections,
  mapOtherInspectionToListRow,
} from "./otherInspectionSession";
import { getSessionProductionRecords } from "./productionRecords";
import {
  buildQualityTraceabilityTimeline,
  searchHistoryInquiryRecords,
} from "./qualityHistoryInquiry";
import {
  computeDefectMetrics,
  getSessionDefectRecords,
} from "./defectHistorySession";
import { getWorkJournalEntries } from "./workJournalSession";
import { getJournalReferenceDate } from "./workJournalData";
import {
  CERTIFICATE_MANAGEMENT_STATUS,
  CURRENT_PROCESS_KEYS,
  getCertificateManagementStatus,
  getInspectionResultLabel,
  resolveRecordCurrentProcess,
} from "./workflowProcessStatus";

/** 검사관리 Task Workspace — HT_COMPLETE · 검사 대기 */
export const QUALITY_INSPECTION_WAIT_STAGE = CURRENT_PROCESS_KEYS.INSPECTION_WAIT;

/** 검사관리 Task Workspace — 검사 진행 (파생) */
export const QUALITY_INSPECTION_IN_PROGRESS_STAGE = "INSPECTION_IN_PROGRESS";

/** 성적서관리 Task Workspace — 검사 완료 · 성적서 미발행 */
export const QUALITY_CERTIFICATE_TASK_STAGES = Object.freeze([
  CURRENT_PROCESS_KEYS.INSPECTION_DONE,
  CURRENT_PROCESS_KEYS.CERT_WAIT,
]);

/** Blueprint — 검사 종류 (Type) */
export const QUALITY_INSPECTION_TYPES = Object.freeze({
  MASS: "양산검사",
  DEV: "개발검사",
  OTHER: "기타검사",
});

/** Blueprint — 검사 판정 (Result) */
export const QUALITY_INSPECTION_RESULTS = Object.freeze({
  PASS: "PASS",
  FAIL: "FAIL",
  HOLD: "HOLD",
  REWORK: "REWORK",
});

/**
 * Quality Workspace records (SSOT)
 * @returns {object[]}
 */
export function getQualityRecords() {
  return getSessionProductionRecords();
}

/** @param {object[]} records @param {(object) => boolean} predicate */
function dedupeQualityRecords(records, predicate) {
  const seen = new Set();
  const result = [];

  for (const record of records) {
    if (!predicate(record)) continue;
    const key = String(record?.id ?? "").trim();
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    result.push(record);
  }

  return result;
}

function getLatestInspectionLog(managementId) {
  const id = String(managementId ?? "").trim();
  if (!id) return null;

  return getInspectionLogs()
    .filter((log) => log.managementId?.trim() === id)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] ?? null;
}

/**
 * 검사 판정 (Result) — Blueprint PASS/FAIL/HOLD/REWORK
 * @param {object | null | undefined} log
 * @returns {string | null}
 */
export function resolveQualityInspectionResult(log) {
  if (!log) return null;

  const label = getInspectionResultLabel(log);
  if (label === "합격") return QUALITY_INSPECTION_RESULTS.PASS;
  if (label === "불합격") return QUALITY_INSPECTION_RESULTS.FAIL;
  if (label === "재검사") return QUALITY_INSPECTION_RESULTS.REWORK;
  if (label === "검사중" || log.judgment === "보류") return QUALITY_INSPECTION_RESULTS.HOLD;

  return null;
}

/**
 * 검사 대기 Stage — HT_COMPLETE · 검사 미등록
 * @param {object} record
 * @returns {boolean}
 */
export function isQualityInspectionWaitRecord(record) {
  return resolveRecordCurrentProcess(record).key === QUALITY_INSPECTION_WAIT_STAGE;
}

/**
 * 검사 진행 Stage — HT_COMPLETE · 검사일지 등록 중 (Workflow 미완료)
 * @param {object} record
 * @returns {boolean}
 */
export function isQualityInspectionInProgressRecord(record) {
  if (!isHeatTreatmentComplete(record)) return false;
  if (isInspectionComplete(record)) return false;

  const log = getLatestInspectionLog(record.id);
  if (!log) return false;

  const result = resolveQualityInspectionResult(log);
  return result === QUALITY_INSPECTION_RESULTS.HOLD || log.status === "검사중";
}

/**
 * 검사관리 Task Workspace — 검사 대기 · 검사 진행 LOT
 * @param {object} record
 * @returns {boolean}
 */
export function isQualityInspectionTaskRecord(record) {
  if (!isInspectionMenuEligible(record)) return false;

  const key = resolveRecordCurrentProcess(record).key;
  if (key === CURRENT_PROCESS_KEYS.HT_RUNNING || key === CURRENT_PROCESS_KEYS.HT_WAIT) {
    return false;
  }
  if (
    key === CURRENT_PROCESS_KEYS.SHIP_WAIT ||
    key === CURRENT_PROCESS_KEYS.SHIPPED ||
    key === CURRENT_PROCESS_KEYS.CERT_DONE
  ) {
    return false;
  }

  return isQualityInspectionWaitRecord(record) || isQualityInspectionInProgressRecord(record);
}

/**
 * 성적서관리 Task Workspace — 검사 완료 · 성적서 미발행
 * @param {object} record
 * @returns {boolean}
 */
export function isQualityCertificateTaskRecord(record) {
  if (!isCertificateMenuEligible(record)) return false;
  const key = resolveRecordCurrentProcess(record).key;
  return QUALITY_CERTIFICATE_TASK_STAGES.includes(key);
}

/**
 * NCR / 판정 Workspace — FAIL · REWORK 분기
 * @param {object} record
 * @returns {boolean}
 */
export function isQualityNcrBranchRecord(record) {
  const log = getLatestInspectionLog(record?.id);
  const result = resolveQualityInspectionResult(log);
  if (result === QUALITY_INSPECTION_RESULTS.FAIL || result === QUALITY_INSPECTION_RESULTS.REWORK) {
    return true;
  }
  return Boolean(record?.defectStatus || record?.inspectionResult === "불합격");
}

/**
 * Quality History Workspace — 품질 Traceability 이력 대상
 * @param {object} record
 * @returns {boolean}
 */
export function isQualityHistoryWorkspaceRecord(record) {
  if (!isHeatTreatmentComplete(record)) return false;
  const timeline = buildQualityTraceabilityTimeline(record);
  return timeline.some((step) => step.id !== "inbound" && step.status === "done");
}

// ─── 검사관리 (양산 · 개발 · 기타) ───────────────────────────────────────────

export function buildInspectionMassWorkspaceRows(records = getQualityRecords()) {
  const eligibleIds = new Set(
    dedupeQualityRecords(records, isQualityInspectionTaskRecord).map((record) => record.id)
  );

  return getMassProductionInspectionRows().filter(
    (row) => eligibleIds.has(row.managementId) || Boolean(row.logId)
  );
}

export function countInspectionMassWorkspace(rows = buildInspectionMassWorkspaceRows()) {
  return {
    inspectNotDone: rows.filter((row) => row.statusLabel === MENU_TASK_STATUS.INSPECT_NOT_DONE)
      .length,
    inspectDone: rows.filter((row) => row.statusLabel === MENU_TASK_STATUS.INSPECT_DONE).length,
    inspectionWait: rows.filter((row) => {
      const record = row.record;
      return record && isQualityInspectionWaitRecord(record);
    }).length,
    inspectionInProgress: rows.filter((row) => {
      const record = row.record;
      return record && isQualityInspectionInProgressRecord(record);
    }).length,
  };
}

export function getInspectionMassScreenData(records = getQualityRecords()) {
  const baseRecords = buildInspectionMassWorkspaceRows(records);
  return {
    baseRecords,
    counts: countInspectionMassWorkspace(baseRecords),
  };
}

export function buildInspectionDevWorkspaceRows() {
  return getDevelopmentInspections()
    .filter((record) => !record.deleted)
    .map(mapDevelopmentInspectionToListRow);
}

export function countInspectionDevWorkspace(rows = buildInspectionDevWorkspaceRows()) {
  return {
    total: rows.length,
    waiting: rows.filter((row) => row.status === "대기").length,
    inProgress: rows.filter((row) => row.status === "진행중").length,
    done: rows.filter((row) => row.status === "완료").length,
    hold: rows.filter((row) => row.status === "보류").length,
  };
}

export function getInspectionDevScreenData() {
  const baseRecords = buildInspectionDevWorkspaceRows();
  return {
    baseRecords,
    counts: countInspectionDevWorkspace(baseRecords),
  };
}

export function buildInspectionOtherWorkspaceRows() {
  return getOtherInspections().map(mapOtherInspectionToListRow);
}

export function countInspectionOtherWorkspace(rows = buildInspectionOtherWorkspaceRows()) {
  return {
    total: rows.length,
    waiting: rows.filter((row) => row.status === "대기").length,
    inProgress: rows.filter((row) => row.status === "진행중").length,
    done: rows.filter((row) => row.status === "완료").length,
  };
}

export function getInspectionOtherScreenData() {
  const baseRecords = buildInspectionOtherWorkspaceRows();
  return {
    baseRecords,
    counts: countInspectionOtherWorkspace(baseRecords),
  };
}

/** 검사 Shell — 양산 기준 KPI (Type Tab별 UI는 각 ScreenData 사용) */
export function getInspectionScreenData(records = getQualityRecords()) {
  return getInspectionMassScreenData(records);
}

// ─── 성적서관리 ─────────────────────────────────────────────────────────────

export function buildCertificateWorkspaceRows(records = getQualityRecords()) {
  const eligibleIds = new Set(
    dedupeQualityRecords(records, isQualityCertificateTaskRecord).map((record) => record.id)
  );

  return getCertificateMenuListRows().filter((row) => eligibleIds.has(row.entry?.managementId));
}

export function countCertificateWorkspace(rows = buildCertificateWorkspaceRows()) {
  const statusOf = (row) =>
    row.statusLabel ?? getCertificateManagementStatus(row.entry)?.label;

  return {
    certNotIssued: rows.filter((row) => statusOf(row) === CERTIFICATE_MANAGEMENT_STATUS.WAIT)
      .length,
    certIssued: rows.filter((row) => statusOf(row) === CERTIFICATE_MANAGEMENT_STATUS.DONE).length,
  };
}

export function getCertificateWorkspaceScreenData(records = getQualityRecords()) {
  const baseRecords = buildCertificateWorkspaceRows(records);
  return {
    baseRecords,
    counts: countCertificateWorkspace(baseRecords),
  };
}

/** @deprecated alias — titanScreenDataSource 호환 */
export function getCertificateScreenData(rows) {
  if (rows?.length) {
    return {
      baseRecords: rows,
      counts: countCertificateWorkspace(rows),
    };
  }
  return getCertificateWorkspaceScreenData();
}

// ─── Quality History ───────────────────────────────────────────────────────

export function buildQualityHistoryWorkspaceRecords(records = getQualityRecords()) {
  return dedupeQualityRecords(records, isQualityHistoryWorkspaceRecord);
}

export function countQualityHistoryWorkspace(records = buildQualityHistoryWorkspaceRecords()) {
  let traceComplete = 0;
  let qualityStarted = 0;

  for (const record of records) {
    const timeline = buildQualityTraceabilityTimeline(record);
    const qualityStep = timeline.find((step) => step.id === "quality");
    if (qualityStep?.status === "done") qualityStarted += 1;
    if (timeline.every((step) => step.status === "done")) traceComplete += 1;
  }

  return {
    total: records.length,
    qualityStarted,
    traceComplete,
  };
}

export function getQualityHistoryScreenData() {
  const baseRecords = searchQualityHistoryWorkspaceRecords({});
  return {
    baseRecords,
    counts: countQualityHistoryWorkspace(baseRecords),
  };
}

export function searchQualityHistoryWorkspaceRecords(search = {}) {
  return searchHistoryInquiryRecords(search).filter(isQualityHistoryWorkspaceRecord);
}

// ─── NCR / 판정 (불량이력) ─────────────────────────────────────────────────

export function buildNcrWorkspaceRecords(records = getQualityRecords()) {
  return dedupeQualityRecords(records, isQualityNcrBranchRecord);
}

export function buildNcrWorkspaceRows(records = getQualityRecords()) {
  const defectRows = getSessionDefectRecords();
  const branchRecords = buildNcrWorkspaceRecords(records);

  return {
    defectRecords: defectRows,
    branchRecords,
    combinedCount: defectRows.length + branchRecords.length,
  };
}

export function countNcrWorkspace(records = getQualityRecords()) {
  const defectRows = getSessionDefectRecords();
  const branchRecords = buildNcrWorkspaceRecords(records);
  const metrics = computeDefectMetrics(defectRows);

  return {
    ...metrics,
    defectTotal: defectRows.length,
    defectToday: metrics.todayDefect,
    failBranch: branchRecords.filter((record) => {
      const result = resolveQualityInspectionResult(getLatestInspectionLog(record.id));
      return result === QUALITY_INSPECTION_RESULTS.FAIL;
    }).length,
    reworkBranch: branchRecords.filter((record) => {
      const result = resolveQualityInspectionResult(getLatestInspectionLog(record.id));
      return result === QUALITY_INSPECTION_RESULTS.REWORK;
    }).length,
  };
}

export function getNcrWorkspaceScreenData(records = getQualityRecords()) {
  const { defectRecords } = buildNcrWorkspaceRows(records);
  return {
    baseRecords: defectRecords,
    counts: countNcrWorkspace(records),
  };
}

// ─── 품질 업무일지 ─────────────────────────────────────────────────────────

export function buildQualityWorkJournalWorkspaceEntries(options = {}) {
  return getWorkJournalEntries("quality", options);
}

export function getQualityWorkJournalScreenData(options = {}) {
  const referenceDate = options.referenceDate ?? getJournalReferenceDate();
  const baseRecords = buildQualityWorkJournalWorkspaceEntries(options);
  const todayEntries = baseRecords.filter((entry) => entry.date === referenceDate);

  return {
    baseRecords,
    counts: {
      total: baseRecords.length,
      today: todayEntries.length,
      manual: baseRecords.filter((entry) => entry.source !== "auto").length,
      auto: baseRecords.filter((entry) => entry.source === "auto").length,
    },
  };
}

// ─── Quality Shell (Launcher) ──────────────────────────────────────────────

export function getQualityWorkspaceSnapshot(records = getQualityRecords()) {
  const inspection = getInspectionMassScreenData(records);
  const certificate = getCertificateWorkspaceScreenData(records);
  const history = getQualityHistoryScreenData();
  const ncr = getNcrWorkspaceScreenData(records);
  const referenceDate = getJournalReferenceDate();
  const journal = getQualityWorkJournalScreenData({
    dateFrom: referenceDate,
    dateTo: referenceDate,
    adminViewAll: true,
    referenceDate,
  });

  return {
    inspection,
    certificate,
    history,
    ncr,
    journal,
    counts: {
      inspectionWait: inspection.counts.inspectionWait,
      inspectionInProgress: inspection.counts.inspectionInProgress,
      certNotIssued: certificate.counts.certNotIssued,
      certIssued: certificate.counts.certIssued,
      defectTotal: ncr.counts.defectTotal,
      qualityJournalToday: journal.counts.today,
    },
  };
}
