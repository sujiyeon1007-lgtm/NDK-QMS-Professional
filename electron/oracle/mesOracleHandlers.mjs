import {
  checkOracleDriver,
  getOracleEnvironmentSummary,
  getPocLogs,
  runReadOnlyQuery,
  testOracleConnection,
} from "./oracleService.mjs";

/**
 * @param {import("electron").IpcMain} ipcMain
 */
export function registerMesOracleHandlers(ipcMain) {
  ipcMain.handle("mes-oracle:test-connection", async (_event, config) => {
    return testOracleConnection(config ?? {});
  });

  ipcMain.handle("mes-oracle:run-query", async (_event, queryId) => {
    return runReadOnlyQuery(queryId);
  });

  ipcMain.handle("mes-oracle:get-environment", async () => {
    const driver = await checkOracleDriver();
    return {
      ...getOracleEnvironmentSummary(),
      driver,
    };
  });

  ipcMain.handle("mes-oracle:get-poc-logs", async () => {
    return getPocLogs();
  });
}
