/**
 * Project TITAN P0 — 거래명세서 · 출고 · 불량 이력 (sessionStorage 영속)
 */

import { readJson, writeJson } from "../foundation/data/sessionStorageAdapter";
import { getAuthUserLabelForAudit } from "./titanAuthSession";
export const SHIPMENT_EVENTS_STORAGE_KEY = "titan-operations-shipment-events-v1";
export const TRANSACTION_STATEMENTS_STORAGE_KEY = "titan-operations-transaction-statements-v1";
export const DEFECT_RECORDS_STORAGE_KEY = "titan-operations-defect-records-v1";

const FALLBACK_USER = "품질관리부 / 정반이 사원";

function loadPersistedArray(storageKey) {
  const stored = readJson(storageKey, null);
  if (Array.isArray(stored)) {
    return stored.map((row) => ({ ...row }));
  }
  const empty = [];
  writeJson(storageKey, empty);
  return empty;
}

function persistArray(storageKey, rows) {
  writeJson(storageKey, rows);
}

let transactionStatements = loadPersistedArray(TRANSACTION_STATEMENTS_STORAGE_KEY);

let shipmentEvents = loadPersistedArray(SHIPMENT_EVENTS_STORAGE_KEY);

let defectRecords = loadPersistedArray(DEFECT_RECORDS_STORAGE_KEY);

export function getCurrentTitanUser() {
  const label = getAuthUserLabelForAudit();
  return label === "—" ? FALLBACK_USER : label;
}

export function getTransactionStatements(managementId) {
  const rows = managementId
    ? transactionStatements.filter((row) => row.managementId === managementId)
    : transactionStatements;
  return [...rows].sort((a, b) => b.printedAt.localeCompare(a.printedAt));
}

export function saveTransactionStatement(payload) {
  const row = {
    id: `TS-${Date.now()}`,
    issuedAt: payload.issuedAt ?? new Date().toISOString(),
    printedAt: payload.printedAt ?? new Date().toISOString().slice(0, 10),
    printedBy: payload.printedBy ?? getCurrentTitanUser(),
    managementId: payload.managementId,
    lotNo: payload.lotNo ?? "",
    company: payload.company,
    partName: payload.partName,
    partNo: payload.partNo,
    drawingNo: payload.drawingNo ?? "",
    material: payload.material ?? "",
    shipQty: Number(payload.shipQty) || 0,
    unit: payload.unit ?? "EA",
    unitPrice: Number(payload.unitPrice) || 0,
    supplyAmount: Number(payload.supplyAmount) || 0,
    vat: Number(payload.vat) || 0,
    totalAmount: Number(payload.totalAmount) || 0,
    pdfSaved: Boolean(payload.pdfSaved),
    outputType: payload.outputType ?? "print",
    outputStatus: payload.outputStatus ?? "출력 완료",
    reprint: Boolean(payload.reprint),
  };
  transactionStatements = [row, ...transactionStatements];
  persistArray(TRANSACTION_STATEMENTS_STORAGE_KEY, transactionStatements);
  return row;
}

export function updateTransactionStatement(statementId, patch = {}) {
  let updated = null;
  transactionStatements = transactionStatements.map((row) => {
    if (row.id !== statementId) return row;
    updated = { ...row, ...patch };
    return updated;
  });
  if (updated) {
    persistArray(TRANSACTION_STATEMENTS_STORAGE_KEY, transactionStatements);
  }
  return updated;
}

export function getShipmentEvents(managementId) {
  const rows = managementId
    ? shipmentEvents.filter((row) => row.managementId === managementId)
    : shipmentEvents;
  return [...rows].sort((a, b) => b.shippedAt.localeCompare(a.shippedAt));
}

export function saveShipmentEvent(payload) {
  const row = {
    id: `SH-${Date.now()}`,
    shippedAt: payload.shippedAt ?? new Date().toISOString().slice(0, 10),
    shippedBy: payload.shippedBy ?? getCurrentTitanUser(),
    managementId: payload.managementId,
    lotNo: payload.lotNo ?? "",
    company: payload.company,
    partName: payload.partName,
    partNo: payload.partNo,
    shipQty: Number(payload.shipQty) || 0,
    unit: payload.unit ?? "EA",
    unitPrice: Number(payload.unitPrice) || 0,
    stockAfter: Number(payload.stockAfter) || 0,
  };
  shipmentEvents = [row, ...shipmentEvents];
  persistArray(SHIPMENT_EVENTS_STORAGE_KEY, shipmentEvents);
  return row;
}

export function removeShipmentEventById(eventId) {
  const before = shipmentEvents.length;
  shipmentEvents = shipmentEvents.filter((row) => row.id !== eventId);
  const removed = before !== shipmentEvents.length;
  if (removed) {
    persistArray(SHIPMENT_EVENTS_STORAGE_KEY, shipmentEvents);
  }
  return removed;
}

export function getDefectRecords(managementId) {
  const rows = managementId
    ? defectRecords.filter((row) => row.managementId === managementId)
    : defectRecords;
  return [...rows].sort((a, b) => b.defectDate.localeCompare(a.defectDate));
}

export function resetOperationsHistory() {
  transactionStatements = [];
  shipmentEvents = [];
  defectRecords = [];
  persistArray(TRANSACTION_STATEMENTS_STORAGE_KEY, transactionStatements);
  persistArray(SHIPMENT_EVENTS_STORAGE_KEY, shipmentEvents);
  persistArray(DEFECT_RECORDS_STORAGE_KEY, defectRecords);
}

export function replaceOperationsHistory({
  transactionStatements: nextStatements = [],
  shipmentEvents: nextShipmentEvents = [],
  defectRecords: nextDefectRecords = [],
} = {}) {
  transactionStatements = (Array.isArray(nextStatements) ? nextStatements : []).map((row) => ({
    ...row,
  }));
  shipmentEvents = (Array.isArray(nextShipmentEvents) ? nextShipmentEvents : []).map((row) => ({
    ...row,
  }));
  defectRecords = (Array.isArray(nextDefectRecords) ? nextDefectRecords : []).map((row) => ({
    ...row,
  }));
  persistArray(TRANSACTION_STATEMENTS_STORAGE_KEY, transactionStatements);
  persistArray(SHIPMENT_EVENTS_STORAGE_KEY, shipmentEvents);
  persistArray(DEFECT_RECORDS_STORAGE_KEY, defectRecords);
}

export function saveDefectRecord(payload) {
  const row = {
    id: `DF-${Date.now()}`,
    defectDate: payload.defectDate ?? new Date().toISOString().slice(0, 10),
    company: payload.company,
    managementId: payload.managementId,
    lotNo: payload.lotNo ?? "",
    partName: payload.partName,
    partNo: payload.partNo,
    defectType: payload.defectType ?? "",
    defectQty: Number(payload.defectQty) || 0,
    unit: payload.unit ?? "EA",
    cause: payload.cause ?? "",
    disposition: payload.disposition ?? "",
    action: payload.action ?? "",
    assignee: payload.assignee ?? "",
    note: payload.note ?? "",
    attachments: payload.attachments ?? [],
  };
  defectRecords = [row, ...defectRecords];
  persistArray(DEFECT_RECORDS_STORAGE_KEY, defectRecords);
  return row;
}
