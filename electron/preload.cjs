const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("titanMesOracle", {
  isAvailable: () => true,
  testConnection: (config) => ipcRenderer.invoke("mes-oracle:test-connection", config ?? {}),
  runReadOnlyQuery: (queryId) => ipcRenderer.invoke("mes-oracle:run-query", queryId),
  getOracleEnvironment: () => ipcRenderer.invoke("mes-oracle:get-environment"),
  getPocLogs: () => ipcRenderer.invoke("mes-oracle:get-poc-logs"),
});

contextBridge.exposeInMainWorld("titanDb", {
  isAvailable: () => true,
  init: () => ipcRenderer.invoke("titan-db:init"),
  getStatus: () => ipcRenderer.invoke("titan-db:get-status"),
  masterList: (category) => ipcRenderer.invoke("titan-db:master-list", category),
  masterReplaceAll: (category, rows) =>
    ipcRenderer.invoke("titan-db:master-replace-all", { category, rows }),
});
