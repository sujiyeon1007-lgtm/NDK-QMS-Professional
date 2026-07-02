/**
 * 생산 결과 Session 데이터 (UI · managementId 기준)
 * Project TITAN V1.0 — 입고·재고·단위 통합 세션
 * 향후 SQLite daily_work / work_sheet 테이블과 managementId·lotNo로 연동
 */

import { getStockQty, syncShipmentStatus } from "./inventory";

export const PRODUCTION_RECORDS = [
  {
      id: "SE_20260703_0001",
    company: "서암기계공업",
    partName: "BULL GEAR",
    partNo: "H2E19655",
    drawingNo: "",
    material: "SNCM439",
    qty: 12,
    unit: "EA",
    incomingDate: "2026-07-01",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 12,
    dueDate: "2026-07-10",
    heatTreatment: "이온질화",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "",
    workflowStatus: "",
    note: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    htlPrintStatus: "미출력",
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
  },
  {
    id: "SE_20260703_0002",
    htlNo: "HTL-20260701-001",
    company: "서암기계공업",
    partName: "BULL GEAR",
    partNo: "CQ91BUL504",
    drawingNo: "",
    material: "SNCM439",
    qty: 24,
    unit: "EA",
    incomingDate: "2026-07-01",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 24,
    dueDate: "2026-07-12",
    heatTreatment: "이온질화",
    lotNo: "260701-3S1A",
    lotCreatedAt: "2026-07-01T08:30:00.000Z",
    equipment: "3S-1",
    workDate: "2026-07-01",
    completionStatus: "생산완료",
    workflowStatus: "성적서완료",
    note: "",
    registered: true,
    qrGenerated: true,
    workSheetGenerated: true,
    htlPrintStatus: "출력완료",
    htlPrintHistory: [{ at: "2026-07-01T09:00:00.000Z", docNo: "HTL-20260701-001", reprint: false }],
    certificateStatus: "발행완료",
    shipmentStatus: "출고대기",
    urgent: false,
  },
  {
    id: "SE_20260703_0005",
    htlNo: "HTL-20260701-001",
    company: "서암기계공업",
    partName: "#2 PINION GEAR",
    partNo: "CWFYH11251",
    drawingNo: "",
    material: "SACM645",
    qty: 8,
    unit: "EA",
    incomingDate: "2026-06-28",
    incomingRegistered: true,
    shippedQty: 8,
    stockQty: 0,
    dueDate: "2026-07-05",
    heatTreatment: "이온질화",
    lotNo: "260629-3S2A",
    lotCreatedAt: "2026-06-28T09:00:00.000Z",
    equipment: "3S-2",
    workDate: "2026-06-29",
    completionStatus: "생산완료",
    workflowStatus: "출고완료",
    registered: true,
    qrGenerated: true,
    workSheetGenerated: true,
    certificateStatus: "발행완료",
    shipmentStatus: "출고완료",
    hasTransactionStatement: true,
    urgent: false,
  },
];

export function normalizeLotNo(lotNo) {
  return lotNo?.trim().toUpperCase() ?? "";
}

export function isIncomingRegistered(record) {
  return Boolean(record?.incomingRegistered);
}

export function getWorkSheetReadyRecords(records) {
  return records.filter((record) => record.registered && record.lotNo?.trim());
}

export function getCertificateReadyRecords(records) {
  return getWorkSheetReadyRecords(records);
}

/** 입고등록 완료 제품 — 출고·거래명세서 대상 (성적서 무관) */
export function getShipmentReadyRecords(records) {
  return records.filter((record) => isIncomingRegistered(record));
}

export function getTransactionStatementReadyRecords(records) {
  return getShipmentReadyRecords(records);
}

export function groupRecordsByLot(records) {
  const map = new Map();

  for (const record of records) {
    const lot = record.lotNo?.trim();
    if (!lot) continue;

    const lotKey = normalizeLotNo(lot);
    if (!map.has(lotKey)) {
      map.set(lotKey, {
        lotNo: lot,
        lotKey,
        records: [],
        workSheetGenerated: false,
        qrGenerated: false,
        equipment: record.equipment,
        workDate: record.workDate,
        heatTreatment: record.heatTreatment,
      });
    }

    const group = map.get(lotKey);
    group.records.push(record);
    if (record.workSheetGenerated) group.workSheetGenerated = true;
    if (record.qrGenerated) group.qrGenerated = true;
    if (record.workDate && (!group.workDate || record.workDate > group.workDate)) {
      group.workDate = record.workDate;
    }
  }

  return [...map.values()].sort((a, b) => a.lotNo.localeCompare(b.lotNo, "ko"));
}

/** UI 세션 공유 (향후 SQLite 단일 소스로 대체) */
let sessionRecords = PRODUCTION_RECORDS.map((record) => ({ ...record }));

export function getSessionProductionRecords() {
  return sessionRecords;
}

export function getSessionLotGroups() {
  return groupRecordsByLot(getSessionProductionRecords());
}

export function updateSessionProductionRecord(id, patch) {
  sessionRecords = sessionRecords.map((record) => {
    if (record.id !== id) return record;
    const merged = { ...record, ...patch };
    const synced = syncShipmentStatus(merged);
    return { ...merged, ...synced, stockQty: getStockQty(merged) };
  });
  return sessionRecords;
}

export function updateSessionProductionRecordsByLot(lotKey, patch) {
  sessionRecords = sessionRecords.map((record) => {
    if (normalizeLotNo(record.lotNo) !== lotKey) return record;
    const merged = { ...record, ...patch };
    const synced = syncShipmentStatus(merged);
    return { ...merged, ...synced, stockQty: getStockQty(merged) };
  });
  return sessionRecords;
}

export function addSessionProductionRecord(record) {
  const synced = syncShipmentStatus(record);
  const newRecord = {
    ...record,
    ...synced,
    stockQty: getStockQty(record),
    shippedQty: record.shippedQty ?? 0,
    incomingRegistered: true,
  };
  sessionRecords = [newRecord, ...sessionRecords];
  return newRecord;
}

export function processShipment(id, shipQty, meta = {}) {
  const record = sessionRecords.find((item) => item.id === id);
  if (!record) return { ok: false, message: "관리번호를 찾을 수 없습니다." };

  const qty = Number(shipQty);
  if (!Number.isFinite(qty) || qty <= 0) {
    return { ok: false, message: "출고 수량을 입력하세요." };
  }

  const stock = getStockQty(record);
  if (qty > stock) {
    return { ok: false, message: `출고 수량이 재고(${stock})를 초과합니다.` };
  }

  const newShippedQty = getShippedQty(record) + qty;
  const patch = {
    shippedQty: newShippedQty,
    ...meta,
  };

  updateSessionProductionRecord(id, patch);
  const updated = sessionRecords.find((item) => item.id === id);

  return {
    ok: true,
    record: updated,
    shipQty: qty,
    stockAfter: getStockQty(updated),
  };
}

function getShippedQty(record) {
  return Number(record?.shippedQty) || 0;
}

export function getRecordsByLot(records, lotNo, excludeId) {
  const lotKey = normalizeLotNo(lotNo);
  if (!lotKey) return [];
  return records.filter(
    (record) => normalizeLotNo(record.lotNo) === lotKey && record.id !== excludeId
  );
}

export function getAllRecordsInLot(records, lotNo) {
  const lotKey = normalizeLotNo(lotNo);
  if (!lotKey) return [];
  return records.filter((record) => normalizeLotNo(record.lotNo) === lotKey);
}

export { getStockQty };
