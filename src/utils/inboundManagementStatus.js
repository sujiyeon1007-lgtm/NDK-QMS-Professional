/**
 * 입고관리 — PM V1.0 상태 · 리스트 표시 기준
 * 입고 등록 ~ 출고대기만 관리 · 출고완료는 이력조회/영업실적
 */

import { HT_TERM } from "../config/titanHeatTreatmentTerminology";
import {
  CERTIFICATE_STATUS,
  SHIPMENT_STATUS,
} from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { isIncomingRegistered } from "./productionRecords";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { getProcessFlowStepsByStatus } from "./processFlow";
import { getWorkflowStatus, WORKFLOW_STATUS } from "./titanWorkflowStatus";
import {
  isShotWorkComplete,
  isShotWorkType,
  normalizeShotWorkStatus,
  SHOT_WORK_STATUS,
} from "../config/workTypeWorkflow";

/** @typedef {'incoming' | 'prod-wait' | 'production' | 'inspect' | 'certificate' | 'ship-wait'} InboundStatusVariant */

export const INBOUND_STATUS_LABELS = {
  INCOMING_DONE: "입고 등록",
  PRODUCT_SHIP_WAIT: "제품 출고대기",
  PROD_WAIT: "열처리대기",
  SHOT_WAIT: "쇼트 작업 대기",
  PROD_PROGRESS: "열처리진행",
  INSPECT_PROGRESS: "검사진행",
  CERT_WAIT: "성적서대기",
  SHIP_WAIT: "출고대기",
};

/** @type {Set<string>} */
export const INBOUND_VISIBLE_STATUS_SET = new Set(Object.values(INBOUND_STATUS_LABELS));

export function isInboundShipOutComplete(record) {
  if (!isIncomingRegistered(record)) return false;
  return (
    record.shipmentStatus === SHIPMENT_STATUS.DONE ||
    (getStockQty(record) <= 0 && (record.shippedQty ?? 0) > 0)
  );
}

/**
 * @returns {{ label: string, variant: InboundStatusVariant } | null}
 * null = 입고관리 리스트 제외 (출고완료 등)
 */
export function getInboundManagementStatus(record) {
  if (!isIncomingRegistered(record)) return null;
  if (isInboundShipOutComplete(record)) return null;

  if (isShotWorkType(record)) {
    if (isShotWorkComplete(record)) return null;
    if (normalizeShotWorkStatus(record.shotStatus) === SHOT_WORK_STATUS.WAITING) {
      return { label: INBOUND_STATUS_LABELS.SHOT_WAIT, variant: "prod-wait" };
    }
    return null;
  }

  const workflowStatus = getWorkflowStatus(record);

  if (workflowStatus === WORKFLOW_STATUS.CERT_DONE && getStockQty(record) > 0) {
    return null;
  }

  if (workflowStatus === WORKFLOW_STATUS.INSPECT_DONE) {
    return null;
  }

  if (workflowStatus === WORKFLOW_STATUS.PROD_DONE) {
    return null;
  }

  if (workflowStatus === WORKFLOW_STATUS.PROD_PROGRESS) {
    return null;
  }

  if (workflowStatus === WORKFLOW_STATUS.WORK_WAIT) {
    const printedWithoutLot =
      (record.htlNo || record.workSheetGenerated) && !Boolean(record.registered && record.lotNo?.trim());
    if (printedWithoutLot) {
      return { label: "생산 대기", variant: "prod-wait" };
    }
    return { label: "생산 대기", variant: "prod-wait" };
  }

  const hasLot = Boolean(record.registered && record.lotNo?.trim());
  const hasInspect = hasInspectionLogForManagementId(record.id);

  if (record.certificateStatus === CERTIFICATE_STATUS.ISSUED && getStockQty(record) > 0) {
    return null;
  }

  if (hasLot && hasInspect && record.certificateStatus === CERTIFICATE_STATUS.PENDING) {
    return null;
  }

  if (hasLot && hasInspect) {
    return null;
  }

  if (hasLot) {
    return null;
  }

  if (record.htlNo || record.workSheetGenerated) {
    return { label: "생산 대기", variant: "prod-wait" };
  }

  return { label: INBOUND_STATUS_LABELS.INCOMING_DONE, variant: "incoming" };
}

export function filterInboundManagementRecords(records = []) {
  return records.filter((record) => getInboundManagementStatus(record) !== null);
}

/** @deprecated getProcessFlowSteps(record, statusLabel) 사용 */
export function getInboundNextTasks(statusLabel) {
  return getProcessFlowStepsByStatus(statusLabel);
}

export { getProcessFlowSteps, getProcessFlowStepsByStatus } from "./processFlow";
