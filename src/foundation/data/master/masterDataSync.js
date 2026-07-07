/**
 * Project TITAN V1.6 — Master Data Sync (Session Master → TitanDataEngine Stores)
 *
 * 기준정보관리 CRUD → Master Store → MES · 생산 · QR · HOME
 */

import equipmentStore from "../equipmentStore";
import customerStore from "./customerStore";
import productStore from "./productStore";
import materialStore from "./materialStore";
import processStore from "./processStore";
import workerStore from "./workerStore";
import {
  MASTER_DATA_SESSION_KEY,
  MASTER_STORE_CATEGORIES,
  MASTER_STORE_CATEGORY_ALIASES,
} from "./masterConstants";
import {
  cloneMasterRows,
  equipmentStoreToMasterRow,
} from "./masterDataMappers";
import { buildEquipmentRecordsFromMasterRows } from "./masterEquipmentBuilder";
import { readJson } from "../sessionStorageAdapter";

/** @type {Record<string, import("./customerStore").default>} */
const STORE_BY_CATEGORY = {
  companies: customerStore,
  products: productStore,
  materials: materialStore,
  workers: workerStore,
  heatTreatment: processStore,
};

let syncInitialized = false;

export function resolveMasterStoreCategory(categoryKey) {
  const key = String(categoryKey ?? "").trim();
  return MASTER_STORE_CATEGORY_ALIASES[key] ?? key;
}

function readMasterSessionSnapshot() {
  const stored = readJson(MASTER_DATA_SESSION_KEY, null);
  if (stored && typeof stored === "object") {
    return stored;
  }
  return null;
}

/**
 * @param {Record<string, unknown>[]} masterRows
 * @param {Record<string, unknown>[]} [existingRecords]
 */
export { buildEquipmentRecordsFromMasterRows } from "./masterEquipmentBuilder";

/**
 * @param {string} categoryKey
 * @param {Record<string, unknown>[]} rows
 */
export function syncMasterCategoryToStore(categoryKey, rows = []) {
  const resolved = resolveMasterStoreCategory(categoryKey);

  if (resolved === "equipment") {
    const existing = equipmentStore.list();
    const next = buildEquipmentRecordsFromMasterRows(rows, existing);
    equipmentStore.replaceAll(next);
    return next;
  }

  const store = STORE_BY_CATEGORY[resolved];
  if (!store) return rows;

  store.replaceAll(cloneMasterRows(rows));
  return store.list();
}

/**
 * @param {Record<string, typeof MASTER_DATA>} sessionData
 */
export function syncAllMasterStoresFromSession(sessionData) {
  if (!sessionData || typeof sessionData !== "object") {
    return { ok: false, message: "Invalid master session data" };
  }

  MASTER_STORE_CATEGORIES.forEach((categoryKey) => {
    const rows = Array.isArray(sessionData[categoryKey]) ? sessionData[categoryKey] : [];
    syncMasterCategoryToStore(categoryKey, rows);
  });

  syncInitialized = true;
  return { ok: true };
}

/**
 * @param {Record<string, typeof MASTER_DATA>} sessionData
 */
export function initMasterDataStoresFromSession(sessionData) {
  return syncAllMasterStoresFromSession(sessionData);
}

export function isMasterDataStoreInitialized() {
  return syncInitialized;
}

/**
 * @param {string} categoryKey
 */
export function readMasterCategoryFromStore(categoryKey) {
  const resolved = resolveMasterStoreCategory(categoryKey);

  if (resolved === "equipment") {
    return equipmentStore.list().map((row) => equipmentStoreToMasterRow(row));
  }

  const store = STORE_BY_CATEGORY[resolved];
  if (!store) return [];
  return store.list();
}

/** SessionStorage only — Engine boot before masterData module */
export function initMasterDataStoresFromSessionStorage() {
  const snapshot = readMasterSessionSnapshot();
  if (!snapshot) return { ok: false, message: "No master session snapshot" };
  return syncAllMasterStoresFromSession(snapshot);
}

export function getMasterStoreSummary() {
  return {
    companies: customerStore.list().length,
    products: productStore.list().length,
    materials: materialStore.list().length,
    workers: workerStore.list().length,
    heatTreatment: processStore.list().length,
    equipment: equipmentStore.list().length,
    initialized: syncInitialized,
  };
}

export default {
  syncMasterCategoryToStore,
  syncAllMasterStoresFromSession,
  initMasterDataStoresFromSession,
  initMasterDataStoresFromSessionStorage,
  readMasterCategoryFromStore,
  buildEquipmentRecordsFromMasterRows,
  getMasterStoreSummary,
};
