/**
 * Project TITAN V1.0 — Unified workflow status · HTL numbering
 *
 * One managementId + htlNo tracks: work request → daily report → inspection → certificate → outbound.
 * Status is auto-set by workflow events — users do not edit it manually.
 */

import { getStockQty } from "./inventory";
import { getPrintOutputDate, toCompactPrintDate } from "./titanPrintDates";
import { getSessionProductionRecords, updateSessionProductionRecord } from "./productionRecords";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { CERTIFICATE_STATUS, SHIPMENT_STATUS } from "./ndkWorkflow";

/** @typedef {'작업대기' | '생산중' | '생산완료' | '검사완료' | '성적서완료' | '출고완료'} WorkflowStatusLabel */

export const WORKFLOW_STATUS = {
  WORK_WAIT: "작업대기",
  PROD_PROGRESS: "생산중",
  PROD_DONE: "생산완료",
  INSPECT_DONE: "검사완료",
  CERT_DONE: "성적서완료",
  SHIP_DONE: "출고완료",
};

const STATUS_RANK = {
  [WORKFLOW_STATUS.WORK_WAIT]: 1,
  [WORKFLOW_STATUS.PROD_PROGRESS]: 2,
  [WORKFLOW_STATUS.PROD_DONE]: 3,
  [WORKFLOW_STATUS.INSPECT_DONE]: 4,
  [WORKFLOW_STATUS.CERT_DONE]: 5,
  [WORKFLOW_STATUS.SHIP_DONE]: 6,
};

function resolveDocDateCompact(outputDate = getPrintOutputDate()) {
  return toCompactPrintDate(outputDate) || toCompactPrintDate(getPrintOutputDate());
}

function nextSequentialDocNo(prefix, records, docField, outputDate = getPrintOutputDate()) {
  const date = resolveDocDateCompact(outputDate);
  const fullPrefix = `${prefix}-${date}-`;
  const sequences = records
    .map((record) => record[docField])
    .filter((docNo) => docNo?.startsWith(fullPrefix))
    .map((docNo) => Number.parseInt(docNo.slice(fullPrefix.length), 10))
    .filter((seq) => Number.isFinite(seq));

  const next = sequences.length ? Math.max(...sequences) + 1 : 1;
  return `${fullPrefix}${String(next).padStart(3, "0")}`;
}

/**
 * Sequential HTL number: HTL-YYYYMMDD-NNN (same number for work request + daily report chain)
 * @param {object[]} [records]
 * @param {string} [outputDate] — 출력/생성일 (문서번호 날짜)
 */
export function generateHtlNo(records = getSessionProductionRecords(), outputDate = getPrintOutputDate()) {
  return nextSequentialDocNo("HTL", records, "htlNo", outputDate);
}

/**
 * Sequential OUT list number: OUT-YYYYMMDD-NNN
 * @param {object[]} [records]
 * @param {string} [outputDate]
 */
export function generateOutboundListNo(
  records = getSessionProductionRecords(),
  outputDate = getPrintOutputDate()
) {
  return nextSequentialDocNo("OUT", records, "outboundListNo", outputDate);
}

/**
 * Resolve HTL for print batch — reuse shared htlNo when all rows already have the same one.
 * @param {object[]} rows
 * @param {object[]} [records]
 */
export function resolveHtlNoForPrintRows(
  rows = [],
  records = getSessionProductionRecords(),
  outputDate = getPrintOutputDate()
) {
  const htlNos = [
    ...new Set(
      rows
        .map((row) => {
          const record = row.record ?? row;
          const fromRow = record.htlNo?.trim();
          if (fromRow) return fromRow;
          return records.find((item) => item.id === record.id)?.htlNo?.trim() || "";
        })
        .filter(Boolean)
    ),
  ];

  if (htlNos.length === 1) return htlNos[0];
  return generateHtlNo(records, outputDate);
}

/**
 * @param {object | null | undefined} record
 * @returns {WorkflowStatusLabel | null}
 */
export function inferWorkflowStatus(record) {
  if (!record?.incomingRegistered) return null;

  if (
    record.workflowStatus === WORKFLOW_STATUS.SHIP_DONE ||
    record.shipmentStatus === SHIPMENT_STATUS.DONE ||
    (getStockQty(record) <= 0 && (record.shippedQty ?? 0) > 0)
  ) {
    return WORKFLOW_STATUS.SHIP_DONE;
  }

  if (
    record.workflowStatus === WORKFLOW_STATUS.CERT_DONE ||
    record.certificateStatus === CERTIFICATE_STATUS.ISSUED
  ) {
    return WORKFLOW_STATUS.CERT_DONE;
  }

  if (record.workflowStatus === WORKFLOW_STATUS.INSPECT_DONE || hasInspectionLogForManagementId(record.id)) {
    return WORKFLOW_STATUS.INSPECT_DONE;
  }

  if (
    record.workflowStatus === WORKFLOW_STATUS.PROD_DONE ||
    (record.registered && record.lotNo?.trim())
  ) {
    return WORKFLOW_STATUS.PROD_DONE;
  }

  if (
    record.workflowStatus === WORKFLOW_STATUS.PROD_PROGRESS ||
    record.dailyReportDraftStarted
  ) {
    return WORKFLOW_STATUS.PROD_PROGRESS;
  }

  if (record.workflowStatus === WORKFLOW_STATUS.WORK_WAIT || record.htlNo || record.workSheetGenerated) {
    return WORKFLOW_STATUS.WORK_WAIT;
  }

  return null;
}

/**
 * @param {object | null | undefined} record
 * @returns {WorkflowStatusLabel | null}
 */
export function getWorkflowStatus(record) {
  const stored = record?.workflowStatus?.trim();
  if (stored && Object.values(WORKFLOW_STATUS).includes(stored)) {
    return stored;
  }
  return inferWorkflowStatus(record);
}

function canAdvance(fromStatus, toStatus) {
  if (!toStatus) return false;
  if (!fromStatus) return true;
  return (STATUS_RANK[toStatus] ?? 0) >= (STATUS_RANK[fromStatus] ?? 0);
}

function patchWorkflowStatus(record, nextStatus, extra = {}) {
  const current = getWorkflowStatus(record);
  if (!canAdvance(current, nextStatus)) {
    return { ...extra };
  }

  const patch = {
    workflowStatus: nextStatus,
    ...extra,
  };

  if (nextStatus === WORKFLOW_STATUS.WORK_WAIT) {
    patch.completionStatus = WORKFLOW_STATUS.WORK_WAIT;
  }
  if (nextStatus === WORKFLOW_STATUS.PROD_PROGRESS) {
    patch.completionStatus = "작업중";
    patch.dailyReportDraftStarted = true;
  }
  if (nextStatus === WORKFLOW_STATUS.PROD_DONE) {
    patch.completionStatus = WORKFLOW_STATUS.PROD_DONE;
    patch.dailyReportDraftStarted = false;
  }

  return patch;
}

/**
 * Work request list printed → 작업대기 + assign HTL
 * @param {string[]} managementIds
 * @param {string} htlNo
 * @param {{ isReprint?: boolean }} [options]
 */
export function applyHtlWorkListPrinted(managementIds = [], htlNo = "", options = {}) {
  const trimmedHtl = htlNo?.trim();
  if (!trimmedHtl || !managementIds.length) return;

  const now = new Date().toISOString();
  const isReprint = Boolean(options.isReprint);
  const historyEntry = { at: now, docNo: trimmedHtl, reprint: isReprint };

  managementIds.forEach((id) => {
    const record = getSessionProductionRecords().find((item) => item.id === id);
    if (!record) return;

    const history = Array.isArray(record.htlPrintHistory) ? [...record.htlPrintHistory] : [];
    history.push(historyEntry);

    updateSessionProductionRecord(id, {
      ...patchWorkflowStatus(record, WORKFLOW_STATUS.WORK_WAIT, {
        htlNo: trimmedHtl,
        workSheetGenerated: true,
        htlPrintedAt: now,
        htlPrintStatus: "출력완료",
        htlPrintHistory: history,
      }),
    });
  });
}

/** @param {object[]} [records] */
export function getPendingDailyReportWorkRequests(records = getSessionProductionRecords()) {
  return records.filter((record) => {
    if (!record?.incomingRegistered || !record.htlNo?.trim()) return false;
    if (record.registered && record.lotNo?.trim()) return false;
    const status = getWorkflowStatus(record);
    return (
      status === WORKFLOW_STATUS.WORK_WAIT ||
      status === WORKFLOW_STATUS.PROD_PROGRESS ||
      status === null
    );
  });
}

/** Production daily report writing started → 생산중 */
export function onDailyReportStarted(managementId) {
  const id = managementId?.trim();
  if (!id) return;

  const record = getSessionProductionRecords().find((item) => item.id === id);
  if (!record?.htlNo) return;

  updateSessionProductionRecord(id, patchWorkflowStatus(record, WORKFLOW_STATUS.PROD_PROGRESS));
}

/** Production daily report saved → 생산완료 */
export function onDailyReportSaved(managementId, extraPatch = {}) {
  const id = managementId?.trim();
  if (!id) return;

  const record = getSessionProductionRecords().find((item) => item.id === id);
  if (!record) return;

  updateSessionProductionRecord(id, {
    ...patchWorkflowStatus(record, WORKFLOW_STATUS.PROD_DONE, extraPatch),
    htlNo: record.htlNo || extraPatch.htlNo || "",
  });
}

/** Inspection complete → 검사완료 */
export function onInspectionComplete(managementId) {
  const id = managementId?.trim();
  if (!id) return;

  const record = getSessionProductionRecords().find((item) => item.id === id);
  if (!record) return;

  updateSessionProductionRecord(id, patchWorkflowStatus(record, WORKFLOW_STATUS.INSPECT_DONE));
}

/** Certificate issued (excel + pdf) → 성적서완료 */
export function onCertificateIssued(managementId) {
  const id = managementId?.trim();
  if (!id) return;

  const record = getSessionProductionRecords().find((item) => item.id === id);
  if (!record) return;

  updateSessionProductionRecord(
    id,
    patchWorkflowStatus(record, WORKFLOW_STATUS.CERT_DONE, {
      certificateStatus: CERTIFICATE_STATUS.ISSUED,
    })
  );
}

/** Outbound complete → 출고완료 */
export function onOutboundComplete(managementId) {
  const id = managementId?.trim();
  if (!id) return;

  const record = getSessionProductionRecords().find((item) => item.id === id);
  if (!record) return;

  updateSessionProductionRecord(
    id,
    patchWorkflowStatus(record, WORKFLOW_STATUS.SHIP_DONE, {
      shipmentStatus: SHIPMENT_STATUS.DONE,
    })
  );
}
