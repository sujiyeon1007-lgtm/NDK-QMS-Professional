import {
  getTitanDatabaseStatus,
  initTitanDatabase,
  listMasterRows,
  replaceAllMasterRows,
} from "./titanDbService.mjs";

export function registerTitanDbHandlers(ipcMain) {
  ipcMain.handle("titan-db:init", async () => initTitanDatabase());
  ipcMain.handle("titan-db:get-status", async () => getTitanDatabaseStatus());
  ipcMain.handle("titan-db:master-list", async (_event, category) => listMasterRows(category));
  ipcMain.handle("titan-db:master-replace-all", async (_event, payload) => {
    const category = payload?.category;
    const rows = payload?.rows ?? [];
    return replaceAllMasterRows(category, rows);
  });
}
