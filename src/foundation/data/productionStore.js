/**
 * Project TITAN V1.5 — productionStore (SSOT)
 * 생산계획 · 장입 · 생산일보 · 생산실적
 */

import { TITAN_DEMO_PRODUCTION_RECORDS } from "../../data/titanDemoSampleData";
import { TITAN_DATA_STORAGE_KEYS } from "./titanDataStorageKeys";
import { createJsonArrayStore } from "./storeFactory";

function mapDemoToProductionRecord(record) {
  return {
    productionId: record.id ?? record.mesManagementNo ?? `PRD-${Date.now()}`,
    lotNo: record.lotNo ?? "",
    equipmentId: record.equipment ?? null,
    startTime: record.workDate ?? record.productionStartTime ?? null,
    endTime: record.completionDate ?? record.productionEndTime ?? null,
    operator: record.operator ?? record.assignee ?? null,
    memo: record.memo ?? record.remark ?? "",
    payload: { ...record },
  };
}

function buildSeedProductionRecords() {
  return TITAN_DEMO_PRODUCTION_RECORDS.map(mapDemoToProductionRecord);
}

const arrayStore = createJsonArrayStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.production,
  idField: "productionId",
  getSeed: buildSeedProductionRecords,
});

export const productionStore = {
  storageKey: arrayStore.storageKey,

  list() {
    return arrayStore.readAll();
  },

  getById(productionId) {
    return arrayStore.getById(productionId);
  },

  /** @param {import("./titanDataModels").ProductionRecord} record */
  create(record) {
    return arrayStore.create(record);
  },

  /** @param {string} productionId @param {Partial<import("./titanDataModels").ProductionRecord>} patch */
  update(productionId, patch) {
    return arrayStore.update(productionId, patch);
  },

  remove(productionId) {
    return arrayStore.remove(productionId);
  },

  replaceAll(records) {
    return arrayStore.writeAll(records);
  },

  seedIfEmpty() {
    return arrayStore.seedIfEmpty();
  },

  clear() {
    arrayStore.clear();
  },

  listByLotNo(lotNo) {
    const key = String(lotNo ?? "").trim().toUpperCase();
    if (!key) return [];
    return arrayStore
      .readAll()
      .filter((row) => String(row.lotNo ?? "").trim().toUpperCase() === key);
  },

  listByEquipment(equipmentId) {
    const key = String(equipmentId ?? "").trim();
    return arrayStore.readAll().filter((row) => row.equipmentId === key);
  },
};

export default productionStore;
