/**

 * 열처리일보 — PM V1.3 상태 (열처리대기 제거 · 진행중/완료)

 */



import {

  HT_DONE_STATUS_ALIASES,

  HT_PROGRESS_STATUS_ALIASES,

  HT_TERM,

} from "../config/titanHeatTreatmentTerminology";

import { getStockQty } from "./inventory";

import { hasInspectionLogForManagementId } from "./inspectionLogSession";

import { CERTIFICATE_STATUS } from "./ndkWorkflow";

import { isHeatTreatmentMenuEligible } from "./menuWorkflowGate";
import { isIncomingRegistered } from "./productionRecords";

import { getWorkflowStatus, WORKFLOW_STATUS } from "./titanWorkflowStatus";
import { resolveChargeQty } from "./equipmentChargingQty";



/** @typedef {'incoming' | 'production' | 'complete' | 'ship-wait'} ProductionDailyReportVariant */



/** 리스트 · 검색 현재상태 (열처리관리) */

export const PRODUCTION_OPERATION_STATUS = {

  IN_PROGRESS: "진행중",

  DONE: "완료",

};



export const PRODUCTION_DAILY_REPORT_STATUS = {

  IN_PROGRESS: HT_TERM.PROGRESS,

  COMPLETE: HT_TERM.DONE,

  SHIP_WAIT: "출고 대기",

};



export const PRODUCTION_DAILY_REPORT_STATUS_OPTIONS = [

  PRODUCTION_OPERATION_STATUS.IN_PROGRESS,

  PRODUCTION_OPERATION_STATUS.DONE,

];



export const APPROVAL_STATUS_OPTIONS = ["승인", "대기", "반려"];



export { getProcessFlowSteps as getProductionDailyReportFlowSteps } from "./processFlow";



function isProductionListCandidate(record) {
  return isHeatTreatmentMenuEligible(record);
}



function isProductionDoneBucket(record) {

  const workflowStatus = getWorkflowStatus(record);



  if (workflowStatus === WORKFLOW_STATUS.CERT_DONE && getStockQty(record) > 0) {

    return true;

  }



  if (workflowStatus === WORKFLOW_STATUS.PROD_DONE) {

    return true;

  }



  if (record.certificateStatus === CERTIFICATE_STATUS.ISSUED && getStockQty(record) > 0) {

    return true;

  }



  if (

    record.completionStatus === WORKFLOW_STATUS.PROD_DONE ||

    record.completionStatus === "생산완료"

  ) {

    return true;

  }



  return false;

}



/**

 * @returns {{ label: string, variant: ProductionDailyReportVariant } | null}

 */

export function getProductionDailyReportStatus(record) {

  if (!isProductionListCandidate(record)) return null;



  if (isProductionDoneBucket(record)) {

    return { label: PRODUCTION_OPERATION_STATUS.DONE, variant: "complete" };

  }



  return { label: PRODUCTION_OPERATION_STATUS.IN_PROGRESS, variant: "production" };

}



export function filterProductionDailyReportRecords(records = []) {

  return records.filter((record) => getProductionDailyReportStatus(record) !== null);

}



/** KPI Chip bucket — 열처리중 · 열처리완료 (열처리대기 없음) */

export const PRODUCTION_CHIP_STATUS_BUCKETS = {

  prodProgress: [

    PRODUCTION_OPERATION_STATUS.IN_PROGRESS,

    HT_TERM.PROGRESS,

    PRODUCTION_DAILY_REPORT_STATUS.IN_PROGRESS,

    ...HT_PROGRESS_STATUS_ALIASES,

  ],

  prodDone: [

    PRODUCTION_OPERATION_STATUS.DONE,

    HT_TERM.DONE,

    ...HT_DONE_STATUS_ALIASES,

    "출고 대기",

    "검사대기",

  ],

};



export function getProductionDailyReportStatusLabel(record) {

  return getProductionDailyReportStatus(record)?.label ?? null;

}



export function matchesProductionChipBucket(record, bucketKey) {

  const label = getProductionDailyReportStatusLabel(record);

  if (!label) return false;

  return (PRODUCTION_CHIP_STATUS_BUCKETS[bucketKey] ?? []).includes(label);

}



export function countProductionChipBucket(records, bucketKey) {

  return records.filter((record) => matchesProductionChipBucket(record, bucketKey)).length;

}



/** @param {Record<string, string>} search */

export function matchesProductionChipSearch(record, search = {}) {

  if (search.__chipProdProgress && !matchesProductionChipBucket(record, "prodProgress")) {

    return false;

  }

  if (search.__chipProdDone && !matchesProductionChipBucket(record, "prodDone")) {

    return false;

  }

  return true;

}



export function getProductionDailyReportApprovalStatus(record) {

  if (record.approvalStatus) return record.approvalStatus;

  if (record.registered && record.lotNo?.trim()) return "승인";

  return "대기";

}



export function formatProductionDailyReportDateTime(record) {

  const raw = record.incomingRegisteredAt ?? record.lotCreatedAt ?? record.incomingDate ?? "";

  if (!raw) return "—";

  const text = String(raw).trim();

  if (text.includes("T") || / \d{2}:\d{2}/.test(text)) {

    const iso = text.includes("T") ? text : `${text.slice(0, 10)}T${text.slice(11).trim()}`;

    const parsed = new Date(iso);

    if (!Number.isNaN(parsed.getTime())) {

      const y = parsed.getFullYear();

      const m = String(parsed.getMonth() + 1).padStart(2, "0");

      const d = String(parsed.getDate()).padStart(2, "0");

      const hh = String(parsed.getHours()).padStart(2, "0");

      const mm = String(parsed.getMinutes()).padStart(2, "0");

      return `${y}-${m}-${d} ${hh}:${mm}`;

    }

  }

  return `${text.slice(0, 10) || text} 09:00`;

}



export function getProductionDailyReportWorkQty(record) {
  const qty =
    resolveChargeQty(record, { lotNo: record?.lotNo }) ||
    Number(record.workQty ?? record.chargeQty) ||
    0;
  return `${qty} ${record.unit || "EA"}`;
}



export function getProductionDailyReportWorkDate(record) {

  return record.workDate || record.dueDate || "—";

}



export function getProductionDailyReportRegisteredDate(record) {

  return record.incomingDate || "—";

}


