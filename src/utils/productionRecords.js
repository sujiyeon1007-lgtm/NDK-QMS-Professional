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
  getTitanDemoInspectionLogSeeds,
  getTitanDemoCertificateSeeds,
} from "../data/titanDemoSampleData";
import companyStore from "../foundation/data/master/companyStore";
import lotStore, { buildSeedLotRecords } from "../foundation/data/lotStore";
import productionStore, { mapDemoToProductionRecord } from "../foundation/data/productionStore";
import qualityStore, { buildSeedQualityBundle } from "../foundation/data/qualityStore";
import timelineStore, { buildSeedTimelineRecords } from "../foundation/data/timelineStore";
import { syncAllMasterStoresFromSession } from "../foundation/data/master/masterDataSync";
import { notifyWorkflowDataRefresh, registerWorkflowScreenCacheInvalidator } from "./titanWorkflowRefresh";
import {
  OPERATIONS_DATA_MODE_STORAGE_KEY,
  OPERATIONS_DATA_MODES,
  TITAN_QA_DEMO_SEED_VERSION,
} from "../config/presentationBuildPolicy";
import { replaceSessionMasterData, TITAN_EMPTY_MASTER_SEED, TITAN_OPERATIONAL_MASTER_SEED } from "./masterData";
import { replaceOperationsHistory, resetOperationsHistory } from "./titanHistorySession";
import { WORKFLOW_STATUS } from "./titanWorkflowStatus";

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

/** P0-OP-006 Phase 1 — normalized snapshot cache (same array ref until dirty) */
let sessionRecordsSnapshot = null;
let sessionRecordsSnapshotDirty = true;

export function invalidateSessionProductionRecordsCache() {
  sessionRecordsSnapshotDirty = true;
  sessionRecordsSnapshot = null;
}

function markSessionRecordsMutated() {
  invalidateSessionProductionRecordsCache();
}

function persistSessionRecords() {
  writeJson(OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY, sessionRecords);
  syncProductionHistoryStore(sessionRecords);
  notifyWorkflowDataRefresh({ source: "production-records" });
}

function isProductionHistoryRow(record) {
  if (!record?.registered || !String(record?.lotNo ?? "").trim()) return false;
  return (
    record.workflowStatus === WORKFLOW_STATUS.PROD_DONE ||
    record.completionStatus === WORKFLOW_STATUS.PROD_DONE
  );
}

/** 생산완료 row → productionStore (생산 이력 · 관제 SSOT) */
function syncProductionHistoryStore(records = sessionRecords) {
  const historyRows = records.filter(isProductionHistoryRow);
  if (!historyRows.length) return;

  const mapped = historyRows.map((row) =>
    mapDemoToProductionRecord({
      ...row,
      id: row.productionWorkflowId || row.id,
      completionDate: row.productionCompletedAt || row.workDate || "",
      productionEndTime: row.productionEndAt || row.chargeEndAt || "",
    })
  );
  const historyIds = new Set(mapped.map((row) => row.productionId));
  const preserved = productionStore.list().filter((row) => !historyIds.has(row.productionId));
  productionStore.replaceAll([...preserved, ...mapped]);
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
  markSessionRecordsMutated();
  persistSessionRecords();
  return sessionRecords;
}

/** 운영 SSOT — 모든 입고·출고·재고·생산 CRUD는 이 모듈만 경유 */
let sessionRecords = loadSessionRecords();

export function getSessionProductionRecords() {
  if (!sessionRecordsSnapshotDirty && sessionRecordsSnapshot) {
    return sessionRecordsSnapshot;
  }
  sessionRecordsSnapshot = sessionRecords.map((record) => normalizeInboundDataFields(record));
  sessionRecordsSnapshotDirty = false;
  return sessionRecordsSnapshot;
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
  markSessionRecordsMutated();
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
  markSessionRecordsMutated();
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
    inboundQty: Number(normalized.inboundQty ?? normalized.qty) || 0,
  };
  sessionRecords = [newRecord, ...sessionRecords];
  markSessionRecordsMutated();
  persistSessionRecords();
  return newRecord;
}

export function deleteSessionProductionRecord(id) {
  const before = sessionRecords.length;
  sessionRecords = sessionRecords.filter((record) => record.id !== id);
  const ok = sessionRecords.length < before;
  if (ok) {
    markSessionRecordsMutated();
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
  replaceSessionMasterData(TITAN_EMPTY_MASTER_SEED);
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

const INSPECTION_LOG_STORAGE_KEY = "project-titan-inspection-log-v3";
const CERTIFICATE_FILES_STORAGE_KEY = "project-titan-certificate-files-v2";

function seedDemoSessionAndFoundationStores(records) {
  const inspectionLogs = getTitanDemoInspectionLogSeeds(records);
  const certificates = getTitanDemoCertificateSeeds(records);
  writeJson(INSPECTION_LOG_STORAGE_KEY, inspectionLogs);
  writeJson(CERTIFICATE_FILES_STORAGE_KEY, certificates);
  productionStore.replaceAll(records.map((row) => mapDemoToProductionRecord(row)));
  lotStore.replaceAll(buildSeedLotRecords(records));
  writeJson(qualityStore.storageKey, buildSeedQualityBundle(records));
  timelineStore.replaceAll(buildSeedTimelineRecords());
  return { inspectionCount: inspectionLogs.length, certificateCount: certificates.length };
}

/** Demo Master + Demo 업무 + 시연용 데이터 — 관리자 버튼 전용 (자동 Seed 없음) */
export function loadTitanDemoData() {
  const profile = companyStore.get();
  companyStore.replace({
    ...profile,
    companyMaster: {
      ...profile.companyMaster,
      ...RC1_DEMO_BRANDING_PATCH.companyMaster,
      updatedAt: new Date().toISOString(),
    },
    branding: { ...profile.branding, ...RC1_DEMO_BRANDING_PATCH.branding },
    documentFooter: {
      ...profile.documentFooter,
      ...RC1_DEMO_BRANDING_PATCH.documentFooter,
      updatedAt: new Date().toISOString(),
    },
  });

  const demoMaster = {
    ...buildQaDemoMasterSeed(TITAN_OPERATIONAL_MASTER_SEED),
    equipment: [...TITAN_OPERATIONAL_MASTER_SEED.equipment],
    workers: [...TITAN_OPERATIONAL_MASTER_SEED.workers],
    heatTreatment: [...TITAN_OPERATIONAL_MASTER_SEED.heatTreatment],
    customCodes: [...TITAN_OPERATIONAL_MASTER_SEED.customCodes],
  };
  const masterData = replaceSessionMasterData(demoMaster);
  syncAllMasterStoresFromSession(masterData);

  const demoRecords = TITAN_DEMO_PRODUCTION_RECORDS.map((row) => ({ ...row }));
  replaceSessionProductionRecords(demoRecords);
  replaceOperationsHistory({
    shipmentEvents: TITAN_QA_DEMO_SHIPMENT_EVENTS.map((row) => ({ ...row })),
    transactionStatements: [],
    defectRecords: [],
  });

  const sessionSeed = seedDemoSessionAndFoundationStores(demoRecords);
  setOperationsDataMode(OPERATIONS_DATA_MODES.QA_DEMO);
  notifyWorkflowDataRefresh({
    source: "demo-load-explicit",
    mode: OPERATIONS_DATA_MODES.QA_DEMO,
    version: TITAN_QA_DEMO_SEED_VERSION,
  });

  return {
    ok: true,
    mode: OPERATIONS_DATA_MODES.QA_DEMO,
    recordCount: demoRecords.length,
    inspectionCount: sessionSeed.inspectionCount,
    certificateCount: sessionSeed.certificateCount,
    version: TITAN_QA_DEMO_SEED_VERSION,
    message: `Demo 데이터 로드 완료 · ${demoRecords.length}건`,
  };
}

registerWorkflowScreenCacheInvalidator(invalidateSessionProductionRecordsCache);
