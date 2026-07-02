/**
 * Project TITAN V1.0 — 거래명세서 · 출고 · 불량 이력 (세션)
 */

const CURRENT_USER = "품질관리부 / 정반이 사원";

let transactionStatements = [
  {
    id: "TS-20260629-001",
    printedAt: "2026-06-29",
    printedBy: CURRENT_USER,
    managementId: "SE_20260703_0005",
    company: "서암기계공업",
    partName: "#2 PINION GEAR",
    partNo: "CWFYH11251",
    drawingNo: "",
    material: "SACM645",
    shipQty: 8,
    unit: "EA",
    unitPrice: 64141,
    supplyAmount: 513128,
    vat: 51313,
    totalAmount: 564441,
  },
];

let shipmentEvents = [
  {
    id: "SH-20260629-001",
    shippedAt: "2026-06-29",
    shippedBy: CURRENT_USER,
    managementId: "SE_20260703_0005",
    company: "서암기계공업",
    partName: "#2 PINION GEAR",
    partNo: "CWFYH11251",
    shipQty: 8,
    unit: "EA",
    unitPrice: 64141,
    stockAfter: 0,
  },
];

let defectRecords = [];

export function getCurrentTitanUser() {
  return CURRENT_USER;
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
    printedAt: payload.printedAt ?? new Date().toISOString().slice(0, 10),
    printedBy: payload.printedBy ?? CURRENT_USER,
    managementId: payload.managementId,
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
  };
  transactionStatements = [row, ...transactionStatements];
  return row;
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
    shippedBy: payload.shippedBy ?? CURRENT_USER,
    managementId: payload.managementId,
    company: payload.company,
    partName: payload.partName,
    partNo: payload.partNo,
    shipQty: Number(payload.shipQty) || 0,
    unit: payload.unit ?? "EA",
    unitPrice: Number(payload.unitPrice) || 0,
    stockAfter: Number(payload.stockAfter) || 0,
  };
  shipmentEvents = [row, ...shipmentEvents];
  return row;
}

export function getDefectRecords(managementId) {
  const rows = managementId
    ? defectRecords.filter((row) => row.managementId === managementId)
    : defectRecords;
  return [...rows].sort((a, b) => b.defectDate.localeCompare(a.defectDate));
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
  return row;
}
