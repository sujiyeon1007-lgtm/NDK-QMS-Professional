const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("titanMesOracle", {
  isAvailable: () => true,
  testConnection: (config) => ipcRenderer.invoke("mes-oracle:test-connection", config ?? {}),
  runReadOnlyQuery: (queryId) => ipcRenderer.invoke("mes-oracle:run-query", queryId),
  getOracleEnvironment: () => ipcRenderer.invoke("mes-oracle:get-environment"),
  getPocLogs: () => ipcRenderer.invoke("mes-oracle:get-poc-logs"),
});
