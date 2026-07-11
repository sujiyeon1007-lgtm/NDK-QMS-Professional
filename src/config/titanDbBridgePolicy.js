export const TITAN_DB_BRIDGE_VERSION = "V1.1-SPRINT1-DB-BRIDGE-1.0";
export const TITAN_DB_BRIDGE_UNAVAILABLE_MESSAGE =
  "Titan DB bridge unavailable. Electron EXE uses SQLite; browser dev uses sessionStorage.";
export const TITAN_DB_IPC_CHANNELS = Object.freeze({
  INIT: "titan-db:init",
  GET_STATUS: "titan-db:get-status",
  MASTER_LIST: "titan-db:master-list",
  MASTER_REPLACE_ALL: "titan-db:master-replace-all",
});
