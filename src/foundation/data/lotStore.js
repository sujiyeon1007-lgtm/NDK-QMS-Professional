/**
 * Project TITAN V1.5 — lotStore (SSOT)
 * LOT 번호 · 제품 · 공정 · 현재 상태 · 진행률 · 설비 연결
 */

import { EQUIPMENT_CHARGEABLE_LOTS, EQUIPMENT_RUNNING_LOTS } from "../../config/equipmentConfig";
import { TITAN_DEMO_PRODUCTION_RECORDS } from "../../data/titanDemoSampleData";
import { TITAN_DATA_STORAGE_KEYS } from "./titanDataStorageKeys";
import { createJsonArrayStore } from "./storeFactory";

export function buildSeedLotRecords(records = TITAN_DEMO_PRODUCTION_RECORDS) {
  /** @type {Map<string, import("./titanDataModels").LotRecord>} */
  const lotMap = new Map();

  records.forEach((record) => {
    const lotNo = String(record.lotNo ?? "").trim();
    if (!lotNo) return;

    if (!lotMap.has(lotNo)) {
      lotMap.set(lotNo, {
        lotNo,
        productNo: record.partNo ?? record.productNo ?? "",
        productName: record.partName ?? record.productName ?? "",
        quantity: Number(record.quantity) || 0,
        process: record.heatTreatment ?? record.processName ?? record.process ?? "",
        progress: 0,
        equipmentId: record.equipment ?? null,
        status: record.workflowStatus ?? record.completionStatus ?? "대기",
        managementId: record.id ?? record.mesManagementNo ?? "",
      });
    }
  });

  Object.entries(EQUIPMENT_RUNNING_LOTS).forEach(([equipmentId, session]) => {
    const lotNo = session.lotNo;
    if (!lotNo) return;
    const existing = lotMap.get(lotNo) ?? { lotNo };
    lotMap.set(lotNo, {
      ...existing,
      lotNo,
      equipmentId,
      progress: session.progress ?? existing.progress ?? 0,
      status: session.statusLabel ?? "운전중",
    });
  });

  Object.entries(EQUIPMENT_CHARGEABLE_LOTS).forEach(([equipmentId, rows]) => {
    rows.forEach((row) => {
      const lotNo = row.lotNo;
      if (!lotNo) return;
      const existing = lotMap.get(lotNo) ?? { lotNo };
      lotMap.set(lotNo, {
        ...existing,
        lotNo,
        productName: row.partName ?? existing.productName ?? "",
        quantity: row.qty ?? existing.quantity ?? 0,
        equipmentId,
        status: row.statusLabel ?? "장입대기",
        progress: existing.progress ?? 0,
      });
    });
  });

  return [...lotMap.values()];
}

const arrayStore = createJsonArrayStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.lots,
  idField: "lotNo",
});

export const lotStore = {
  storageKey: arrayStore.storageKey,

  list() {
    return arrayStore.readAll();
  },

  getByLotNo(lotNo) {
    return arrayStore.getById(lotNo);
  },

  /** @param {import("./titanDataModels").LotRecord} record */
  create(record) {
    return arrayStore.create(record);
  },

  /** @param {string} lotNo @param {Partial<import("./titanDataModels").LotRecord>} patch */
  update(lotNo, patch) {
    return arrayStore.update(lotNo, patch);
  },

  remove(lotNo) {
    return arrayStore.remove(lotNo);
  },

  replaceAll(records) {
    return arrayStore.writeAll(records);
  },

  clear() {
    arrayStore.clear();
  },

  listByEquipment(equipmentId) {
    const key = String(equipmentId ?? "").trim();
    return arrayStore.readAll().filter((row) => row.equipmentId === key);
  },

  listByProcess(processName) {
    const process = String(processName ?? "").trim();
    return arrayStore.readAll().filter((row) => row.process === process);
  },
};

export default lotStore;
