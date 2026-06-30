/**
 * 생산 결과 Mock 데이터 (UI · managementId 기준)
 * Project TITAN V1.0 — 입고·재고·단위 통합 세션
 * 향후 SQLite daily_work / work_sheet 테이블과 managementId·lotNo로 연동
 */

import { getStockQty, syncShipmentStatus } from "./inventory";

export const PRODUCTION_RECORDS = [
  {
    id: "DH_20260627_001",
    htlNo: "HTL-20260701-001",
    company: "대한정밀",
    partName: "축용 냉간단조품",
    partNo: "DK-1042-A",
    drawingNo: "DW-1042-01",
    material: "SCM440",
    qty: 120,
    unit: "EA",
    incomingDate: "2026-06-27",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 120,
    dueDate: "2026-07-05",
    heatTreatment: "가스질화",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: true,
  },
  {
    id: "SE_20260627_002",
    htlNo: "HTL-20260701-001",
    company: "삼성부품",
    partName: "브라켓 ASSY",
    partNo: "SP-8821-C",
    drawingNo: "DW-8821-03",
    material: "S45C",
    qty: 80,
    unit: "EA",
    incomingDate: "2026-06-27",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 80,
    dueDate: "2026-07-08",
    heatTreatment: "침탄",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "생산부 LOT 확인 대기",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
  },
  {
    id: "WS_20260625_006",
    htlNo: "HTL-20260701-001",
    company: "우성기계",
    partName: "Pinion Gear",
    partNo: "WS-2210-F",
    drawingNo: "",
    material: "SCM440",
    qty: 150,
    unit: "SET",
    incomingDate: "2026-06-25",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 150,
    dueDate: "2026-07-12",
    heatTreatment: "가스질화",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
  },
  {
    id: "SW_20260621_013",
    htlNo: "HTL-20260628-012",
    company: "성우정밀",
    partName: "Drive Shaft",
    partNo: "SW-8844-P",
    drawingNo: "DW-8844-02",
    material: "SCM440",
    qty: 35,
    unit: "EA",
    incomingDate: "2026-06-21",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 35,
    dueDate: "2026-06-28",
    heatTreatment: "가스질화",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "긴급",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: true,
  },
  {
    id: "HA_20260626_003",
    htlNo: "HTL-20260628-012",
    company: "한국금속",
    partName: "기어 블랭크",
    partNo: "HK-3305-B",
    drawingNo: "DW-3305-02",
    material: "SNCM220",
    qty: 200,
    unit: "EA",
    incomingDate: "2026-06-26",
    incomingRegistered: true,
    shippedQty: 50,
    stockQty: 150,
    dueDate: "2026-07-10",
    heatTreatment: "침탄",
    lotNo: "LOT260628-01",
    lotCreatedAt: "2026-06-28T08:30:00.000Z",
    equipment: "GAS-01",
    workDate: "2026-06-28",
    completionStatus: "생산완료",
    note: "",
    registered: true,
    qrGenerated: true,
    workSheetGenerated: true,
    certificateStatus: "발행완료",
    shipmentStatus: "출고대기",
    hasTransactionStatement: true,
    urgent: false,
  },
  {
    id: "SH_20260624_008",
    htlNo: "HTL-20260628-012",
    company: "신화산업",
    partName: "베어링 레이스",
    partNo: "SH-4412-J",
    drawingNo: "DW-4412-05",
    material: "SUJ2",
    qty: 90,
    unit: "EA",
    incomingDate: "2026-06-24",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 90,
    dueDate: "2026-07-06",
    heatTreatment: "침탄",
    lotNo: "LOT260628-01",
    lotCreatedAt: "2026-06-28T08:30:00.000Z",
    equipment: "GAS-01",
    workDate: "2026-06-28",
    completionStatus: "부분완료",
    note: "동일 LOT 배치 · 잔량 20EA",
    registered: true,
    qrGenerated: true,
    workSheetGenerated: true,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
  },
  {
    id: "HS_20260622_011",
    htlNo: "",
    company: "한신공업",
    partName: "스프링 시트",
    partNo: "HS-3399-M",
    drawingNo: "DW-3399-01",
    material: "SK5",
    qty: 500,
    unit: "EA",
    incomingDate: "2026-06-22",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 500,
    dueDate: "2026-07-18",
    heatTreatment: "고주파",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
  },
  {
    id: "GI_20260624_007",
    htlNo: "",
    company: "경일정밀",
    partName: "커넥터 하우징",
    partNo: "GI-9033-H",
    drawingNo: "DW-9033-01",
    material: "AL6061",
    qty: 300,
    unit: "EA",
    incomingDate: "2026-06-24",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 300,
    dueDate: "2026-06-29",
    heatTreatment: "이온질화",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: true,
  },
  {
    id: "MR_20260622_012",
    htlNo: "",
    company: "미래테크",
    partName: "Housing Cover",
    partNo: "MR-7722-N",
    drawingNo: "DW-7722-04",
    material: "SUS304",
    qty: 40,
    unit: "EA",
    incomingDate: "2026-06-22",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 40,
    dueDate: "2026-06-30",
    heatTreatment: "염욕질화",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: true,
  },
  {
    id: "SJ_20260625_005",
    htlNo: "",
    company: "세진테크",
    partName: "샤프트",
    partNo: "SJ-5520-A",
    drawingNo: "",
    material: "SCM415",
    qty: 60,
    unit: "EA",
    incomingDate: "2026-06-25",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 60,
    dueDate: "2026-07-01",
    heatTreatment: "침탄",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "작업대기",
    note: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
  },
  {
    id: "HJ_260625_010",
    htlNo: "HTL-20260620-008",
    company: "한진정밀",
    partName: "플랜지",
    partNo: "HJ-1102-K",
    drawingNo: "DW-1102-01",
    material: "S45C",
    qty: 100,
    unit: "EA",
    incomingDate: "2026-06-20",
    incomingRegistered: true,
    shippedQty: 100,
    stockQty: 0,
    dueDate: "2026-06-25",
    heatTreatment: "침탄",
    lotNo: "LOT260620-02",
    equipment: "GAS-02",
    workDate: "2026-06-22",
    completionStatus: "생산완료",
    registered: true,
    qrGenerated: true,
    workSheetGenerated: true,
    certificateStatus: "발행완료",
    shipmentStatus: "출고완료",
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
