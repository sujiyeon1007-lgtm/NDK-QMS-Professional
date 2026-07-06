/**
 * 생산 결과 Session 데이터 (UI · managementId 기준)
 * Project TITAN V1.0 — 입고·재고·단위 통합 세션
 * 향후 SQLite daily_work / work_sheet 테이블과 managementId·lotNo로 연동
 */

import { getStockQty, syncShipmentStatus } from "./inventory";
import { normalizeInboundDataFields } from "./inboundDataFields";
import { TITAN_DEMO_PRODUCTION_RECORDS } from "../data/titanDemoSampleData";

export const PRODUCTION_RECORDS = TITAN_DEMO_PRODUCTION_RECORDS;

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
let sessionRecords = PRODUCTION_RECORDS.map((record) => {
  const normalized = normalizeInboundDataFields({ ...record });
  const synced = syncShipmentStatus(normalized);
  return { ...normalized, ...synced, stockQty: getStockQty(normalized) };
});

export function getSessionProductionRecords() {
  return sessionRecords.map((record) => normalizeInboundDataFields(record));
}

export function getSessionLotGroups() {
  return groupRecordsByLot(getSessionProductionRecords());
}

export function updateSessionProductionRecord(id, patch) {
  sessionRecords = sessionRecords.map((record) => {
    if (record.id !== id) return record;
    const merged = normalizeInboundDataFields({ ...record, ...patch });
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
  const normalized = normalizeInboundDataFields(record);
  const synced = syncShipmentStatus(normalized);
  const newRecord = {
    ...normalized,
    ...synced,
    stockQty: getStockQty(normalized),
    shippedQty: normalized.shippedQty ?? 0,
    incomingRegistered: true,
  };
  sessionRecords = [newRecord, ...sessionRecords];
  return newRecord;
}

export function deleteSessionProductionRecord(id) {
  const before = sessionRecords.length;
  sessionRecords = sessionRecords.filter((record) => record.id !== id);
  return { ok: sessionRecords.length < before, message: sessionRecords.length < before ? "" : "관리번호를 찾을 수 없습니다." };
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
