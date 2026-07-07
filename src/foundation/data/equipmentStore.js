/**

 * Project TITAN V1.6 — equipmentStore (SSOT)

 * 기준정보 설비관리 → EquipmentStore → MES · 생산 · QR · HOME

 */



import { TITAN_DATA_STORAGE_KEYS } from "./titanDataStorageKeys";

import { createJsonArrayStore } from "./storeFactory";

import { readJson } from "./sessionStorageAdapter";

import { MASTER_DATA_SESSION_KEY } from "./master/masterConstants";

import { buildEquipmentRecordsFromMasterRows } from "./master/masterEquipmentBuilder";



function readMasterEquipmentRowsFromSession() {

  const snapshot = readJson(MASTER_DATA_SESSION_KEY, null);

  if (snapshot && Array.isArray(snapshot.equipment) && snapshot.equipment.length > 0) {

    return snapshot.equipment;

  }

  return [];

}



function buildSeedEquipmentRecords() {

  const masterRows = readMasterEquipmentRowsFromSession();

  if (masterRows.length > 0) {

    return buildEquipmentRecordsFromMasterRows(masterRows, []);

  }

  return [];

}



const arrayStore = createJsonArrayStore({

  storageKey: TITAN_DATA_STORAGE_KEYS.equipment,

  idField: "equipmentId",

  getSeed: buildSeedEquipmentRecords,

});



export const equipmentStore = {

  storageKey: arrayStore.storageKey,



  list() {

    return arrayStore.readAll();

  },



  getById(equipmentId) {

    return arrayStore.getById(equipmentId);

  },



  /** @param {Partial<import("./titanDataModels").EquipmentRecord>} record */

  create(record) {

    return arrayStore.create(record);

  },



  /** @param {string} equipmentId @param {Partial<import("./titanDataModels").EquipmentRecord>} patch */

  update(equipmentId, patch) {

    return arrayStore.update(equipmentId, patch);

  },



  remove(equipmentId) {

    return arrayStore.remove(equipmentId);

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



  getSummary() {

    const list = arrayStore.readAll();

    return list.reduce(

      (acc, item) => {

        acc.total += 1;

        if (acc[item.status] != null) acc[item.status] += 1;

        return acc;

      },

      { total: 0, idle: 0, ready: 0, running: 0, maintenance: 0 }

    );

  },



  listByProcess(processName) {

    const process = String(processName ?? "").trim();

    return arrayStore.readAll().filter((row) => row.process === process);

  },

};



export default equipmentStore;

