/**
 * 출고관리 — PM V1.3 (성적서 발행 완료 · 미출고/출고완료)
 */

import { SHIPMENT_STATUS } from "./ndkWorkflow";
import { getStockQty, getShippedQty } from "./inventory";
import { isIncomingRegistered } from "./productionRecords";
import { getStatementPrintStatus } from "./outboundStatementStatus";
import { getShipmentEvents } from "./titanHistorySession";
import { formatQtyWithUnit } from "./productUnits";
import { formatTraceabilityDateTime } from "./productTraceabilityModel";
import { isCertificateIssued, isOutboundComplete, MENU_TASK_STATUS } from "./menuWorkflowGate";

/** @typedef {'ship-wait' | 'partial' | 'complete'} OutboundStatusVariant */

export const OUTBOUND_STATUS_LABELS = {
  NOT_DONE: MENU_TASK_STATUS.SHIP_NOT_DONE,
  DONE: MENU_TASK_STATUS.SHIP_DONE,
  /** @deprecated partial → 미출고 */
  PARTIAL: MENU_TASK_STATUS.SHIP_NOT_DONE,
  /** @deprecated */
  SHIP_WAIT: MENU_TASK_STATUS.SHIP_NOT_DONE,
  SHIP_DONE: MENU_TASK_STATUS.SHIP_DONE,
};

export function isOutboundShipComplete(record) {
  return isOutboundComplete(record);
}

/**
 * @returns {{ label: string, variant: OutboundStatusVariant } | null}
 */
export function getOutboundManagementStatus(record) {
  if (!isIncomingRegistered(record)) return null;

  if (isOutboundShipComplete(record)) {
    return { label: OUTBOUND_STATUS_LABELS.DONE, variant: "complete" };
  }

  const stock = getStockQty(record);
  if (stock <= 0) return null;

  if (!isCertificateIssued(record)) return null;

  return { label: OUTBOUND_STATUS_LABELS.NOT_DONE, variant: "ship-wait" };
}

export function filterOutboundManagementRecords(records = []) {
  return records.filter((record) => getOutboundManagementStatus(record) !== null);
}

export function filterOutboundCompletedRecords(records = []) {
  return records.filter((record) => isOutboundShipComplete(record));
}

export function getOutboundShipQty(record) {
  const stock = getStockQty(record);
  return `${stock} EA`;
}

export { getStatementPrintStatus };

function resolveOutboundDateRaw(record) {
  const direct = String(record?.outboundDate ?? "").trim();
  if (direct) return direct;

  const history = Array.isArray(record?.partialShipHistory) ? record.partialShipHistory : [];
  if (history.length > 0) {
    const last = history[history.length - 1];
    const shipDate = String(last?.shipDate ?? "").trim();
    if (shipDate) return shipDate;
  }

  const events = getShipmentEvents(record?.id);
  if (events.length > 0) {
    const shippedAt = String(events[0]?.shippedAt ?? "").trim();
    if (shippedAt) return shippedAt.slice(0, 10);
  }

  return "";
}

export function hasOutboundShipment(record) {
  return Boolean(resolveOutboundDateRaw(record)) || (record?.shippedQty ?? 0) > 0;
}

/** @returns {string} YYYY-MM-DD or "—" */
export function getOutboundShipDate(record) {
  const date = resolveOutboundDateRaw(record);
  return date || "—";
}

/** List column — pending shows "—" */
export function formatOutboundDateLabel(record) {
  return getOutboundShipDate(record);
}

/** Detail popup — pending shows "출고대기" */
export function formatOutboundDateDetailLabel(record) {
  const date = getOutboundShipDate(record);
  return date !== "—" ? date : "출고대기";
}

export function formatOutboundTimeLabel(record) {
  const outboundTime = String(record?.outboundTime ?? "").trim();
  if (outboundTime) return formatTraceabilityDateTime(outboundTime);

  const history = Array.isArray(record?.partialShipHistory) ? record.partialShipHistory : [];
  if (history.length > 0) {
    const last = history[history.length - 1];
    if (last?.at) return formatTraceabilityDateTime(last.at);
  }

  const events = getShipmentEvents(record?.id);
  if (events.length > 0 && events[0]?.shippedAt) {
    return formatTraceabilityDateTime(events[0].shippedAt);
  }

  return "—";
}

export function getOutboundManager(record) {
  if (!hasOutboundShipment(record)) return "—";
  return record.outboundManager?.trim() || record.registrar?.trim() || "관리자";
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
