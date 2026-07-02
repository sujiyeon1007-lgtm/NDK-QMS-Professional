import { MES_ORACLE_ROW_LIMIT, resolveQuerySql } from "./queryRegistry.mjs";

/** @type {import("oracledb") | null} */
let oracledbModule = null;

/** @type {import("oracledb").Connection | null} */
let activeConnection = null;

/** @type {Array<{ at: string, level: string, message: string, meta?: object }>} */
const pocLogs = [];

const CONNECT_TIMEOUT_MS = 15000;
const QUERY_TIMEOUT_MS = 20000;

function appendLog(level, message, meta = {}) {
  pocLogs.unshift({
    at: new Date().toISOString(),
    level,
    message,
    meta,
  });
  if (pocLogs.length > 100) {
    pocLogs.length = 100;
  }
}

export function getPocLogs() {
  return [...pocLogs];
}

export function clearPocLogs() {
  pocLogs.length = 0;
}

async function loadOracledb() {
  if (oracledbModule) return oracledbModule;
  try {
    oracledbModule = await import("oracledb");
    return oracledbModule;
  } catch (error) {
    appendLog("error", "node-oracledb 모듈을 로드할 수 없습니다.", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * @returns {Promise<{ available: boolean, driverVersion?: string, instantClient?: string, message?: string }>}
 */
export async function checkOracleDriver() {
  const oracledb = await loadOracledb();
  if (!oracledb) {
    return {
      available: false,
      message:
        "node-oracledb가 설치되지 않았습니다. npm install oracledb 후 Oracle Instant Client를 설치하세요.",
    };
  }

  let instantClient = "unknown";
  try {
    if (typeof oracledb.oracleClientVersionString === "string") {
      instantClient = oracledb.oracleClientVersionString;
    }
  } catch {
    instantClient = "not detected — Oracle Instant Client 설치·PATH 확인 필요";
  }

  return {
    available: true,
    driverVersion: oracledb.versionString ?? "unknown",
    instantClient,
  };
}

/**
 * @param {{ host?: string, port?: number | string, service?: string, user?: string, password?: string }} overrides
 */
export function resolveConnectionConfig(overrides = {}) {
  const host = String(overrides.host ?? process.env.MES_ORACLE_HOST ?? "").trim();
  const port = Number(overrides.port ?? process.env.MES_ORACLE_PORT ?? 1521) || 1521;
  const service = String(overrides.service ?? process.env.MES_ORACLE_SERVICE ?? "").trim();
  const user = String(overrides.user ?? process.env.MES_ORACLE_USER ?? "").trim();
  const password = String(overrides.password ?? process.env.MES_ORACLE_PASSWORD ?? "");

  const connectString =
    host && service ? `${host}:${port}/${service}` : String(process.env.MES_ORACLE_CONNECT_STRING ?? "").trim();

  return { host, port, service, user, password, connectString };
}

/**
 * @param {Error & { errorNum?: number; code?: string }} error
 */
function mapOracleError(error) {
  const message = error?.message ?? String(error);
  const errorNum = error?.errorNum;

  if (error?.code === "NJS-045" || /Instant Client/i.test(message)) {
    return {
      status: "fail",
      message:
        "Oracle Instant Client가 필요합니다. Oracle 공식 사이트에서 Instant Client를 설치하고 PATH에 추가하세요.",
      detail: message,
    };
  }

  if (/timeout|timed out|ETIMEDOUT/i.test(message)) {
    return { status: "timeout", message: "Oracle 접속 시간 초과 — VPN·방화벽·Host/Port를 확인하세요.", detail: message };
  }

  if (errorNum === 1017 || /ORA-01017|invalid username\/password/i.test(message)) {
    return { status: "fail", message: "사용자명 또는 비밀번호가 올바르지 않습니다.", detail: message };
  }

  if (errorNum === 28000 || /ORA-28000|account is locked/i.test(message)) {
    return { status: "fail", message: "계정이 잠겨 있습니다. DBA에게 문의하세요.", detail: message };
  }

  if (
    errorNum === 1031 ||
    errorNum === 942 ||
    /ORA-01031|ORA-00942|insufficient privileges|table or view does not exist/i.test(message)
  ) {
    return { status: "noPermission", message: "권한이 없거나 객체에 접근할 수 없습니다.", detail: message };
  }

  return { status: "fail", message: "Oracle 접속에 실패했습니다.", detail: message };
}

async function withTimeout(promise, ms, label) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {{ host?: string, port?: number | string, service?: string, user?: string, password?: string }} overrides
 */
export async function testOracleConnection(overrides = {}) {
  const started = Date.now();
  const driver = await checkOracleDriver();
  if (!driver.available) {
    return {
      ok: false,
      status: "fail",
      message: driver.message,
      driver,
      connectionTimeMs: 0,
    };
  }

  const config = resolveConnectionConfig(overrides);
  if (!config.connectString || !config.user || !config.password) {
    return {
      ok: false,
      status: "fail",
      message: "Host · Service · User · Password를 모두 입력하세요 (.env 또는 폼).",
      driver,
      connectionTimeMs: 0,
    };
  }

  const oracledb = oracledbModule;
  let connection;

  try {
    connection = await withTimeout(
      oracledb.getConnection({
        user: config.user,
        password: config.password,
        connectString: config.connectString,
      }),
      CONNECT_TIMEOUT_MS,
      "connect"
    );

    const result = await withTimeout(
      connection.execute("SELECT 1 AS CONNECT_OK FROM DUAL", [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }),
      QUERY_TIMEOUT_MS,
      "probe"
    );

    if (activeConnection) {
      try {
        await activeConnection.close();
      } catch {
        /* ignore */
      }
    }
    activeConnection = connection;

    const connectionTimeMs = Date.now() - started;
    appendLog("info", "Oracle DUAL probe success", {
      connectionTimeMs,
      user: config.user,
      connectString: config.connectString,
    });

    return {
      ok: true,
      status: "success",
      message: `Oracle 접속 성공 (DUAL) — ${connectionTimeMs}ms`,
      driver,
      connectionTimeMs,
      probe: result.rows?.[0] ?? null,
      environment: {
        host: config.host,
        port: config.port,
        service: config.service,
        user: config.user,
        connectString: config.connectString,
      },
    };
  } catch (error) {
    if (connection) {
      try {
        await connection.close();
      } catch {
        /* ignore */
      }
    }
    const mapped = mapOracleError(error);
    appendLog("error", mapped.message, { detail: mapped.detail, status: mapped.status });
    return {
      ok: false,
      ...mapped,
      driver,
      connectionTimeMs: Date.now() - started,
    };
  }
}

/**
 * @param {import("./queryRegistry.mjs").MesOracleQueryId} queryId
 */
export async function runReadOnlyQuery(queryId) {
  const started = Date.now();
  const driver = await checkOracleDriver();
  if (!driver.available) {
    return {
      ok: false,
      status: "fail",
      message: driver.message,
      rows: [],
      columns: [],
      rowCount: 0,
      queryTimeMs: 0,
    };
  }

  let sql;
  try {
    sql = resolveQuerySql(queryId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendLog("error", message, { queryId });
    return {
      ok: false,
      status: "fail",
      message,
      rows: [],
      columns: [],
      rowCount: 0,
      queryTimeMs: Date.now() - started,
    };
  }

  const oracledb = oracledbModule;
  let connection = activeConnection;
  let ownsConnection = false;

  try {
    if (!connection) {
      const config = resolveConnectionConfig();
      if (!config.connectString || !config.user || !config.password) {
        return {
          ok: false,
          status: "fail",
          message: "먼저 Oracle 접속 테스트를 성공시키세요.",
          rows: [],
          columns: [],
          rowCount: 0,
          queryTimeMs: Date.now() - started,
        };
      }
      connection = await withTimeout(
        oracledb.getConnection({
          user: config.user,
          password: config.password,
          connectString: config.connectString,
        }),
        CONNECT_TIMEOUT_MS,
        "connect"
      );
      ownsConnection = true;
    }

    const result = await withTimeout(
      connection.execute(sql, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        maxRows: MES_ORACLE_ROW_LIMIT,
      }),
      QUERY_TIMEOUT_MS,
      "query"
    );

    const rows = (result.rows ?? []).slice(0, MES_ORACLE_ROW_LIMIT);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const queryTimeMs = Date.now() - started;

    appendLog("info", `Query ${queryId} success`, {
      queryId,
      rowCount: rows.length,
      queryTimeMs,
    });

    return {
      ok: true,
      status: "success",
      message: `${queryId} 조회 성공 — ${rows.length}건 (${queryTimeMs}ms)`,
      rows,
      columns,
      rowCount: rows.length,
      queryTimeMs,
      queryId,
    };
  } catch (error) {
    const mapped = mapOracleError(error);
    appendLog("error", mapped.message, { queryId, detail: mapped.detail, status: mapped.status });
    return {
      ok: false,
      ...mapped,
      rows: [],
      columns: [],
      rowCount: 0,
      queryTimeMs: Date.now() - started,
      queryId,
    };
  } finally {
    if (ownsConnection && connection) {
      try {
        await connection.close();
      } catch {
        /* ignore */
      }
    }
  }
}

export function getOracleEnvironmentSummary() {
  const config = resolveConnectionConfig();
  const driverReady = Boolean(oracledbModule);
  return {
    host: config.host,
    port: config.port,
    service: config.service,
    user: config.user,
    connectString: config.connectString,
    hasPasswordInEnv: Boolean(process.env.MES_ORACLE_PASSWORD),
    driverReady,
    sqlConfigured: {
      product: Boolean(process.env.MES_ORACLE_SQL_PRODUCT),
      customer: Boolean(process.env.MES_ORACLE_SQL_CUSTOMER),
      inbound: Boolean(process.env.MES_ORACLE_SQL_INBOUND),
    },
  };
}
