/**
 * 생산일보 — PM V1.0 상태 · 공정 흐름도
 */

import { CERTIFICATE_STATUS } from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { isIncomingRegistered } from "./productionRecords";
import { getWorkflowStatus, WORKFLOW_STATUS } from "./titanWorkflowStatus";

/** @typedef {'incoming' | 'production' | 'complete' | 'ship-wait'} ProductionDailyReportVariant */

export const PRODUCTION_DAILY_REPORT_STATUS = {
  INCOMING: "입고 등록",
  IN_PROGRESS: "생산 진행",
  COMPLETE: "생산 완료",
  SHIP_WAIT: "출고 대기",
};

export const PRODUCTION_DAILY_REPORT_STATUS_OPTIONS = Object.values(PRODUCTION_DAILY_REPORT_STATUS);

export const APPROVAL_STATUS_OPTIONS = ["승인", "대기", "반려"];

export { getProcessFlowSteps as getProductionDailyReportFlowSteps } from "./processFlow";

/**
 * @returns {{ label: string, variant: ProductionDailyReportVariant } | null}
 */
export function getProductionDailyReportStatus(record) {
  if (!isIncomingRegistered(record)) return null;

  const workflowStatus = getWorkflowStatus(record);

  if (workflowStatus === WORKFLOW_STATUS.CERT_DONE && getStockQty(record) > 0) {
    return { label: PRODUCTION_DAILY_REPORT_STATUS.SHIP_WAIT, variant: "ship-wait" };
  }

  if (workflowStatus === WORKFLOW_STATUS.PROD_DONE) {
    if (!hasInspectionLogForManagementId(record.id)) {
      return { label: "검사대기", variant: "complete" };
    }
    return { label: "생산완료", variant: "complete" };
  }

  if (workflowStatus === WORKFLOW_STATUS.PROD_PROGRESS) {
    return { label: "생산중", variant: "production" };
  }

  if (workflowStatus === WORKFLOW_STATUS.WORK_WAIT) {
    return { label: "작업대기", variant: "incoming" };
  }

  if (record.certificateStatus === CERTIFICATE_STATUS.ISSUED && getStockQty(record) > 0) {
    return { label: PRODUCTION_DAILY_REPORT_STATUS.SHIP_WAIT, variant: "ship-wait" };
  }

  if (record.completionStatus === "생산완료") {
    if (!hasInspectionLogForManagementId(record.id)) {
      return { label: "검사대기", variant: "complete" };
    }
    return { label: PRODUCTION_DAILY_REPORT_STATUS.COMPLETE, variant: "complete" };
  }

  if (record.registered && record.lotNo?.trim()) {
    return { label: "생산중", variant: "production" };
  }

  if (record.htlNo || record.workSheetGenerated || record.lotNo?.trim()) {
    return { label: PRODUCTION_DAILY_REPORT_STATUS.IN_PROGRESS, variant: "production" };
  }

  return { label: PRODUCTION_DAILY_REPORT_STATUS.INCOMING, variant: "incoming" };
}

export function filterProductionDailyReportRecords(records = []) {
  return records.filter((record) => getProductionDailyReportStatus(record) !== null);
}

export function getProductionDailyReportApprovalStatus(record) {
  if (record.approvalStatus) return record.approvalStatus;
  if (record.registered && record.lotNo?.trim()) return "승인";
  return "대기";
}

export function formatProductionDailyReportDateTime(record) {
  const raw = record.lotCreatedAt ?? record.incomingDate ?? "";
  if (!raw) return "—";
  if (String(raw).includes("T")) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      const hh = String(parsed.getHours()).padStart(2, "0");
      const mm = String(parsed.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${d} ${hh}:${mm}`;
    }
  }
  return `${raw} 09:00`;
}

export function getProductionDailyReportWorkQty(record) {
  return `${record.qty ?? 0} ${record.unit || "EA"}`;
}

export function getProductionDailyReportWorkDate(record) {
  return record.workDate || record.dueDate || "—";
}

export function getProductionDailyReportRegisteredDate(record) {
  return record.incomingDate || "—";
}
