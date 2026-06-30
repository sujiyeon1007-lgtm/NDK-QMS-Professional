/**
 * 출고관리 — PM V1.0 상태 · 리스트 표시 기준
 * 재고 있음 · 출고완료 전 제품만 표시
 */

import { SHIPMENT_STATUS } from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { isIncomingRegistered } from "./productionRecords";

/** @typedef {'ship-wait' | 'partial' | 'ship-register'} OutboundStatusVariant */

export const OUTBOUND_STATUS_LABELS = {
  SHIP_WAIT: "출고대기",
  PARTIAL: "부분출고",
  SHIP_REGISTER: "출고등록",
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
  if (isOutboundShipComplete(record)) return null;

  const stock = getStockQty(record);
  const shipped = record.shippedQty ?? 0;

  if (shipped > 0 && stock > 0) {
    return { label: OUTBOUND_STATUS_LABELS.PARTIAL, variant: "partial" };
  }

  if (record.outboundRegistered) {
    return { label: OUTBOUND_STATUS_LABELS.SHIP_REGISTER, variant: "ship-register" };
  }

  return { label: OUTBOUND_STATUS_LABELS.SHIP_WAIT, variant: "ship-wait" };
}

export function filterOutboundManagementRecords(records = []) {
  return records.filter((record) => getOutboundManagementStatus(record) !== null);
}

export function getOutboundShipQty(record) {
  const stock = getStockQty(record);
  return `${stock} ${record.unit || "EA"}`;
}

export function getOutboundShipDate(record) {
  return record.outboundDate ?? record.incomingDate ?? "—";
}

export function getOutboundManager(record) {
  return record.outboundManager ?? record.registrar ?? "관리자";
}
