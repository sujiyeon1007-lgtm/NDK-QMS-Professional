/**
 * 출고관리 — PM V1.0 상태 · 리스트 표시 기준
 * 재고 있음 · 출고완료 전 제품만 표시
 */

import { SHIPMENT_STATUS } from "./ndkWorkflow";
import { getStockQty, getShippedQty } from "./inventory";
import { isIncomingRegistered } from "./productionRecords";
import { getStatementPrintStatus } from "./outboundStatementStatus";
import { getShipmentEvents } from "./titanHistorySession";
import { formatQtyWithUnit } from "./productUnits";

/** @typedef {'ship-wait' | 'partial' | 'ship-register'} OutboundStatusVariant */

export const OUTBOUND_STATUS_LABELS = {
  SHIP_WAIT: "출고대기",
  PARTIAL: "부분출고",
  SHIP_DONE: "출고완료",
};

export function isOutboundShipComplete(record) {
  if (!isIncomingRegistered(record)) return true;
  return record.shipmentStatus === SHIPMENT_STATUS.DONE && getStockQty(record) <= 0;
}

/**
 * @returns {{ label: string, variant: OutboundStatusVariant } | null}
 */
export function getOutboundManagementStatus(record) {
  if (!isIncomingRegistered(record)) return null;

  if (isOutboundShipComplete(record)) {
    return { label: OUTBOUND_STATUS_LABELS.SHIP_DONE, variant: "complete" };
  }

  const stock = getStockQty(record);
  if (stock <= 0) return null;

  const shipped = record.shippedQty ?? 0;
  if (shipped > 0 && stock > 0) {
    return { label: OUTBOUND_STATUS_LABELS.PARTIAL, variant: "partial" };
  }

  return { label: OUTBOUND_STATUS_LABELS.SHIP_WAIT, variant: "ship-wait" };
}

export function filterOutboundManagementRecords(records = []) {
  return records.filter((record) => {
    if (!isIncomingRegistered(record)) return false;
    if (isOutboundShipComplete(record)) return false;
    return getStockQty(record) > 0;
  });
}

export function filterOutboundCompletedRecords(records = []) {
  return records.filter((record) => isOutboundShipComplete(record));
}

export function getOutboundShipQty(record) {
  const stock = getStockQty(record);
  return `${stock} EA`;
}

export { getStatementPrintStatus };

export function getOutboundShipDate(record) {
  return record.outboundDate ?? record.incomingDate ?? "—";
}

export function getOutboundManager(record) {
  return record.outboundManager ?? record.registrar ?? "관리자";
}

export function getOutboundTotalShippedQty(record) {
  const shipped = getShippedQty(record);
  return formatQtyWithUnit(shipped, record?.unit || "EA");
}

export function getOutboundShipmentCount(record) {
  const history = Array.isArray(record?.partialShipHistory) ? record.partialShipHistory.length : 0;
  if (history > 0) return history;
  return getShipmentEvents(record?.id).length;
}
