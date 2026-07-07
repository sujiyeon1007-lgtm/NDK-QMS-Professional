/**
 * Project TITAN V1.5 — timelineStore (SSOT)
 * 장입 시작 · 생산 완료 · 검사 완료 · 성적서 발행 · 출고 완료 Timeline
 */

import { TIMELINE_EVENT_TYPES, createTimelineId } from "./titanDataModels";
import { TITAN_DATA_STORAGE_KEYS } from "./titanDataStorageKeys";
import { createJsonArrayStore } from "./storeFactory";

function buildSeedTimelineRecords() {
  return [
    {
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.CHARGE_START,
      title: "장입 시작",
      target: "3S-1 · LOT240630",
      time: "08:32",
      user: "홍길동",
      detail: "3S-1 장입",
      lotNo: "LOT240630",
      equipmentId: "3S-1",
    },
    {
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.PRODUCTION_COMPLETE,
      title: "생산 완료",
      target: "LOT240620",
      time: "14:00",
      user: "박민수",
      detail: "61 연질화 작업 완료",
      lotNo: "LOT240620",
      equipmentId: "61",
    },
    {
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.INSPECTION_COMPLETE,
      title: "검사 완료",
      target: "DL260702-016",
      time: "10:15",
      user: "품질부",
      detail: "양산 검사 합격",
    },
    {
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.CERTIFICATE_ISSUED,
      title: "성적서 발행",
      target: "COA-20260707-001",
      time: "11:20",
      user: "품질부",
      detail: "성적서 발행 완료",
    },
    {
      id: createTimelineId(),
      type: TIMELINE_EVENT_TYPES.SHIPMENT_COMPLETE,
      title: "출고 완료",
      target: "INV-20260707-001",
      time: "16:45",
      user: "영업부",
      detail: "출고 등록 완료",
    },
  ];
}

const arrayStore = createJsonArrayStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.timeline,
  idField: "id",
  getSeed: buildSeedTimelineRecords,
});

export const timelineStore = {
  storageKey: arrayStore.storageKey,

  list() {
    return arrayStore.readAll();
  },

  getById(id) {
    return arrayStore.getById(id);
  },

  /** @param {import("./titanDataModels").TimelineRecord} record */
  append(record) {
    const next = {
      id: record.id ?? createTimelineId(),
      type: record.type ?? TIMELINE_EVENT_TYPES.CUSTOM,
      title: record.title ?? "",
      target: record.target ?? "",
      time: record.time ?? "",
      user: record.user ?? "",
      detail: record.detail ?? "",
      lotNo: record.lotNo ?? "",
      equipmentId: record.equipmentId ?? "",
      managementId: record.managementId ?? "",
    };
    return arrayStore.create(next);
  },

  /** @param {string} id @param {Partial<import("./titanDataModels").TimelineRecord>} patch */
  update(id, patch) {
    return arrayStore.update(id, patch);
  },

  remove(id) {
    return arrayStore.remove(id);
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

  listByType(type) {
    const key = String(type ?? "").trim();
    return arrayStore.readAll().filter((row) => row.type === key);
  },

  listByTarget(target) {
    const key = String(target ?? "").trim();
    return arrayStore.readAll().filter((row) => String(row.target ?? "").includes(key));
  },

  listByLotNo(lotNo) {
    const key = String(lotNo ?? "").trim().toUpperCase();
    if (!key) return [];
    return arrayStore.readAll().filter((row) => {
      const rowLot = String(row.lotNo ?? "").trim().toUpperCase();
      const target = String(row.target ?? "").trim().toUpperCase();
      return rowLot === key || target.includes(key);
    });
  },

  listByEquipmentId(equipmentId) {
    const key = String(equipmentId ?? "").trim();
    if (!key) return [];
    return arrayStore.readAll().filter((row) => {
      const rowEquipment = String(row.equipmentId ?? "").trim();
      const target = String(row.target ?? "").trim();
      return rowEquipment === key || target.includes(key);
    });
  },
};

export default timelineStore;
