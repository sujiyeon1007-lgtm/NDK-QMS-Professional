/**
 * Project TITAN V2.0 — MaterialStore SSOT
 *
 * Blueprint ⑦ 기준정보관리 — Master Store 원칙 (7 Store 중 Material Store)
 * 재질(Material) 정보의 단일 진실 공급원. 다른 Workspace는 읽기 전용 참조.
 */

import { TITAN_DATA_STORAGE_KEYS } from "../titanDataStorageKeys";
import { createJsonArrayStore } from "../storeFactory";

const arrayStore = createJsonArrayStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.material,
  idField: "id",
  getSeed: () => [],
});

export const materialStore = {
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

export default materialStore;
