/**
 * Project TITAN V1.0 — 거래명세서 · 출고 · 불량 이력 (세션)
 */

const CURRENT_USER = "품질관리부 / 정반이 사원";

let transactionStatements = [
  {
    id: "TS-20260620-001",
    printedAt: "2026-06-20",
    printedBy: CURRENT_USER,
    managementId: "HA_20260626_003",
    company: "한국금속",
    partName: "기어 블랭크",
    partNo: "HK-3305-B",
    drawingNo: "DW-3305-02",
    material: "SNCM220",
    shipQty: 50,
    unit: "EA",
    unitPrice: 850,
    supplyAmount: 42500,
    vat: 4250,
    totalAmount: 46750,
  },
];

let shipmentEvents = [
  {
    id: "SH-20260620-001",
    shippedAt: "2026-06-20",
    shippedBy: CURRENT_USER,
    managementId: "HA_20260626_003",
    company: "한국금속",
    partName: "기어 블랭크",
    partNo: "HK-3305-B",
    shipQty: 50,
    unit: "EA",
    unitPrice: 850,
    stockAfter: 150,
  },
];

let defectRecords = [
  {
    id: "DF-20260625-001",
    defectDate: "2026-06-25",
    company: "신화산업",
    managementId: "SH_20260624_008",
    lotNo: "LOT260628-01",
    partName: "베어링 레이스",
    partNo: "SH-4412-J",
    defectType: "경도 불량",
    defectQty: 5,
    unit: "EA",
    cause: "열처리 온도 편차",
    disposition: "재처리",
    action: "재열처리 후 재검사",
    assignee: "김품질",
    note: "",
    attachments: [],
  },
  {
    id: "DF-20260618-002",
    defectDate: "2026-06-18",
    company: "성우정밀",
    managementId: "SW_20260621_013",
    lotNo: "",
    partName: "Drive Shaft",
    partNo: "SW-8844-P",
    defectType: "외관 스크래치",
    defectQty: 2,
    unit: "EA",
    cause: "운반 중 손상",
    disposition: "특채",
    action: "고객 협의 후 출하",
    assignee: "이품질",
    note: "사진 첨부 예정",
    attachments: [],
  },
];

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
