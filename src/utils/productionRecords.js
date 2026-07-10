/**
 * 생산 결과 Session 데이터 (UI · managementId 기준)
 * Project TITAN P0 — 입고·출고·재고·생산 운영 SSOT (단일 Write Path)
 * 향후 SQLite daily_work / work_sheet 테이블과 managementId·lotNo로 연동
 */

import { readJson, writeJson } from "../foundation/data/sessionStorageAdapter";
import { getStockQty, syncShipmentStatus } from "./inventory";
import { normalizeInboundDataFields } from "./inboundDataFields";
import {
  TITAN_DEMO_PRODUCTION_RECORDS,
  TITAN_QA_DEMO_PRODUCTION_RECORDS,
  TITAN_QA_DEMO_SHIPMENT_EVENTS,
  RC1_DEMO_BRANDING_PATCH,
  buildQaDemoMasterSeed,
} from "../data/titanDemoSampleData";
import companyStore from "../foundation/data/master/companyStore";
import { notifyWorkflowDataRefresh } from "./titanWorkflowRefresh";
import {
  OPERATIONS_DATA_MODE_STORAGE_KEY,
  OPERATIONS_DATA_MODES,
  TITAN_QA_DEMO_SEED_VERSION,
} from "../config/presentationBuildPolicy";
import { replaceSessionMasterData, TITAN_OPERATIONAL_MASTER_SEED } from "./masterData";
import { replaceOperationsHistory, resetOperationsHistory } from "./titanHistorySession";

/** 운영 CRUD 단일 영속 저장소 (sessionStorage) */
export const OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY =
  "titan-operations-production-records-v1";

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

function normalizeSessionRecord(record) {
  const normalized = normalizeInboundDataFields({ ...record });
  const synced = syncShipmentStatus(normalized);
  return { ...normalized, ...synced, stockQty: getStockQty(normalized) };
}

function buildSeedSessionRecords() {
  return PRODUCTION_RECORDS.map((record) => normalizeSessionRecord(record));
}

function persistSessionRecords() {
  writeJson(OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY, sessionRecords);
  notifyWorkflowDataRefresh({ source: "production-records" });
}

function loadSessionRecords() {
  const stored = readJson(OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY, null);
  if (Array.isArray(stored)) {
    return stored.map((record) => normalizeSessionRecord(record));
  }
  const empty = [];
  writeJson(OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY, empty);
  return empty;
}

export function replaceSessionProductionRecords(nextRecords = []) {
  sessionRecords = (Array.isArray(nextRecords) ? nextRecords : []).map((record) =>
    normalizeSessionRecord(record)
  );
  persistSessionRecords();
  return sessionRecords;
}

/** 운영 SSOT — 모든 입고·출고·재고·생산 CRUD는 이 모듈만 경유 */
let sessionRecords = loadSessionRecords();

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
  persistSessionRecords();
  return sessionRecords;
}

export function updateSessionProductionRecordsByLot(lotKey, patch) {
  sessionRecords = sessionRecords.map((record) => {
    if (normalizeLotNo(record.lotNo) !== lotKey) return record;
    const merged = { ...record, ...patch };
    const synced = syncShipmentStatus(merged);
    return { ...merged, ...synced, stockQty: getStockQty(merged) };
  });
  persistSessionRecords();
  return sessionRecords;
}

export function addSessionProductionRecord(record) {
  const id = String(record?.id ?? "").trim();
  if (id && sessionRecords.some((item) => item.id === id)) {
    return { ok: false, message: `이미 등록된 관리번호입니다: ${id}` };
  }

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
  persistSessionRecords();
  return newRecord;
}

export function deleteSessionProductionRecord(id) {
  const before = sessionRecords.length;
  sessionRecords = sessionRecords.filter((record) => record.id !== id);
  const ok = sessionRecords.length < before;
  if (ok) {
    persistSessionRecords();
  }
  return { ok, message: ok ? "" : "관리번호를 찾을 수 없습니다." };
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

export function getOperationsDataMode() {
  return readJson(OPERATIONS_DATA_MODE_STORAGE_KEY, OPERATIONS_DATA_MODES.OPERATIONAL);
}

function setOperationsDataMode(mode) {
  writeJson(OPERATIONS_DATA_MODE_STORAGE_KEY, mode);
}

export function getOperationsRecordCount() {
  return getSessionProductionRecords().length;
}

export function resetOperationsToEmpty() {
  replaceSessionProductionRecords([]);
  resetOperationsHistory();
  replaceSessionMasterData(TITAN_OPERATIONAL_MASTER_SEED);
  setOperationsDataMode(OPERATIONS_DATA_MODES.OPERATIONAL);
  notifyWorkflowDataRefresh({ source: "operations-bootstrap", mode: OPERATIONS_DATA_MODES.OPERATIONAL });
  return { mode: OPERATIONS_DATA_MODES.OPERATIONAL, recordCount: 0 };
}

export function loadQaDemoSeed() {
  const profile = companyStore.get();
  companyStore.replace({
    ...profile,
    companyMaster: { ...profile.companyMaster, ...RC1_DEMO_BRANDING_PATCH.companyMaster, updatedAt: new Date().toISOString() },
    branding: { ...profile.branding, ...RC1_DEMO_BRANDING_PATCH.branding },
    documentFooter: {
      ...profile.documentFooter,
      ...RC1_DEMO_BRANDING_PATCH.documentFooter,
      updatedAt: new Date().toISOString(),
    },
  });
  replaceSessionMasterData(buildQaDemoMasterSeed(TITAN_OPERATIONAL_MASTER_SEED));
  replaceSessionProductionRecords(
    TITAN_QA_DEMO_PRODUCTION_RECORDS.map((row) => ({ ...row }))
  );
  replaceOperationsHistory({
    shipmentEvents: TITAN_QA_DEMO_SHIPMENT_EVENTS.map((row) => ({ ...row })),
    transactionStatements: [],
    defectRecords: [],
  });
  setOperationsDataMode(OPERATIONS_DATA_MODES.QA_DEMO);
  notifyWorkflowDataRefresh({
    source: "qa-demo-seed",
    mode: OPERATIONS_DATA_MODES.QA_DEMO,
    version: TITAN_QA_DEMO_SEED_VERSION,
  });
  return {
    mode: OPERATIONS_DATA_MODES.QA_DEMO,
    recordCount: TITAN_QA_DEMO_PRODUCTION_RECORDS.length,
    version: TITAN_QA_DEMO_SEED_VERSION,
  };
}

export function restoreOperationalFromQaDemo() {
  return resetOperationsToEmpty();
}
