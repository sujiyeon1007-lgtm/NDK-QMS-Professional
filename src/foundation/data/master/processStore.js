/**
 * Project TITAN V1.6 — ProcessStore (heatTreatment SSOT)
 */

import { TITAN_DATA_STORAGE_KEYS } from "../titanDataStorageKeys";
import { createJsonArrayStore } from "../storeFactory";

const arrayStore = createJsonArrayStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.process,
  idField: "id",
  getSeed: () => [],
});

export const processStore = {
  storageKey: arrayStore.storageKey,
  list: () => arrayStore.readAll(),
  getById: (id) => arrayStore.getById(id),
  create: (record) => arrayStore.create(record),
  update: (id, patch) => arrayStore.update(id, patch),
  remove: (id) => arrayStore.remove(id),
  replaceAll: (records) => arrayStore.writeAll(records),
  seedIfEmpty: () => arrayStore.seedIfEmpty(),
  clear: () => arrayStore.clear(),
};

export default processStore;
