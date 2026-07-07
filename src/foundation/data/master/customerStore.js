/**
 * Project TITAN V1.6 — CustomerStore (companies SSOT)
 */

import { TITAN_DATA_STORAGE_KEYS } from "../titanDataStorageKeys";
import { createJsonArrayStore } from "../storeFactory";

const arrayStore = createJsonArrayStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.customer,
  idField: "id",
  getSeed: () => [],
});

export const customerStore = {
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

export default customerStore;
