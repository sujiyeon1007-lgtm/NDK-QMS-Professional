/**
 * Project TITAN V1.4 — Menu = Workflow gate + per-menu task status (PM Final)
 *
 * Current Process (9 stages): 입고등록 → … → 출고 완료 (재고는 Workflow 외)
 * Each menu shows only records where the previous stage is complete.
 */

import { CERTIFICATE_STATUS, SHIPMENT_STATUS } from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { hasCertificateFilesForManagementId } from "./certificateSession";
import { isIncomingRegistered } from "./productionRecords";
import { isProductionComplete } from "./productionComplete";
import { isHeatTreatmentWorkType, isShotWorkComplete } from "../config/workTypeWorkflow";

/** Per-menu task status labels (업무상태) */
export const MENU_TASK_STATUS = {
  HT_IN_PROGRESS: "진행중",
  HT_DONE: "완료",
  INSPECT_NOT_DONE: "미검사",
  INSPECT_DONE: "검사완료",
  CERT_NOT_ISSUED: "미발행",
  CERT_ISSUED: "발행완료",
  SHIP_NOT_DONE: "미출고",
  SHIP_DONE: "출고완료",
};

export function isHeatTreatmentMenuEligible(record) {
  if (!isIncomingRegistered(record)) return false;
  if (!isHeatTreatmentWorkType(record)) return false;
  return Boolean(
    record?.htlNo?.trim() ||
      record?.workSheetGenerated ||
      record?.registered ||
      record?.lotNo?.trim()
  );
}

export function isHeatTreatmentComplete(record) {
  if (!isHeatTreatmentWorkType(record)) return false;
  return isProductionComplete(record);
}

export function isInspectionComplete(record) {
  if (!record?.id) return false;
  return hasInspectionLogForManagementId(record.id);
}

export function isInspectionMenuEligible(record) {
  if (isShotWorkComplete(record) && record?.shotInspectionRequired) return true;
  return isHeatTreatmentComplete(record);
}

export function isCertificateIssued(record) {
  if (!record) return false;
  if (record.certificateStatus === CERTIFICATE_STATUS.ISSUED) return true;
  return hasCertificateFilesForManagementId(record.id);
}

export function isCertificateMenuEligible(record) {
  return isInspectionComplete(record);
}

export function isOutboundMenuEligible(record) {
  if (!isIncomingRegistered(record)) return false;
  if (getStockQty(record) <= 0) return false;
  if (isShotWorkComplete(record) && !record?.shotInspectionRequired) return true;
  return isCertificateIssued(record);
}

export function isOutboundComplete(record) {
  if (!isIncomingRegistered(record)) return false;
  return record.shipmentStatus === SHIPMENT_STATUS.DONE && getStockQty(record) <= 0;
}

export function isInventoryMenuEligible(record) {
  return isOutboundComplete(record);
}
