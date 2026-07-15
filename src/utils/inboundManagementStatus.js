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
import {
  getInProgressChargeSessions,
  resolveInboundQtyForChargeRow,
  resolveRemainingChargeQty,
  resolveTotalChargedQty,
} from "./equipmentChargingQty";
import { getEquipmentList } from "./equipmentWorkflowService";
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

/** 입고취소(삭제) 차단 메시지 — 장입 후 */
export const INBOUND_DELETE_BLOCKED_MESSAGE = "장입 후 삭제 불가";

function resolveInboundRecordId(record) {
  return String(record?.id ?? record?.mesManagementNo ?? "").trim();
}

function isRecordInEquipmentRunningSession(record) {
  const recordId = resolveInboundRecordId(record);
  if (!recordId) return false;

  const lotKey = String(record?.lotNo ?? "").trim().toUpperCase();

  return getEquipmentList().some((equipment) => {
    const session = equipment?.runningSession;
    if (!session) return false;

    const sourceId = String(session.sourceRecordId ?? "").trim();
    if (sourceId && sourceId === recordId) return true;

    const sessionLot = String(session.lotNo ?? "").trim().toUpperCase();
    if (lotKey && sessionLot && sessionLot === lotKey) return true;

    const lotItems = session.lotItems ?? session.chargeTargets ?? [];
    if (
      Array.isArray(lotItems) &&
      lotItems.some((item) => String(item?.sourceRecordId ?? item?.id ?? "").trim() === recordId)
    ) {
      return true;
    }

    return false;
  });
}

function isFullInboundRemaining(record) {
  const inboundQty = resolveInboundQtyForChargeRow(record);
  const totalCharged = resolveTotalChargedQty(record);
  if (totalCharged > 0) return false;
  if (inboundQty <= 0) return true;
  const remaining = resolveRemainingChargeQty(record);
  return remaining >= inboundQty;
}

/** 장입(설비 세션·chargeHistory·생산등록) 시작 여부 */
export function hasInboundChargeStarted(record) {
  if (!record) return false;
  if (getInProgressChargeSessions(record).length > 0) return true;
  if (resolveTotalChargedQty(record) > 0) return true;

  const history = Array.isArray(record.chargeHistory) ? record.chargeHistory : [];
  if (history.length > 0) return true;

  if (record.registered) return true;
  if (isRecordInEquipmentRunningSession(record)) return true;

  return false;
}

/** 입고취소(삭제) 가능 여부 — 장입 전 · 잔여=입고수량 */
export function canCancelInbound(record) {
  if (!record) return { ok: false, message: "입고 건을 찾을 수 없습니다." };
  if (!isIncomingRegistered(record)) {
    return { ok: false, message: "입고 등록된 건이 아닙니다." };
  }

  if (hasInboundChargeStarted(record)) {
    return { ok: false, message: INBOUND_DELETE_BLOCKED_MESSAGE };
  }

  if (!isFullInboundRemaining(record)) {
    return { ok: false, message: INBOUND_DELETE_BLOCKED_MESSAGE };
  }

  return { ok: true, message: "" };
}

export function canEditInboundRecord(record) {
  if (!record || !isIncomingRegistered(record)) return false;
  return !hasInboundChargeStarted(record);
}

export function canDeleteInboundRecord(record) {
  return canCancelInbound(record).ok;
}
