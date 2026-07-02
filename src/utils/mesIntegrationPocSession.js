/**
 * MES 연동 PoC — 검증 결과 SessionStorage (관리자 기록용)
 * REV.5 — Real Oracle via Electron Main · 비밀번호는 절대 저장하지 않음
 */

import {
  MES_ORACLE_ENVIRONMENT,
  MES_POC_CHECKLIST,
  MES_POC_READ_ONLY_DATA_TESTS,
  MES_SAMPLE_PREVIEW,
  buildMesPocReport,
  calculateIntegrationReadiness,
  mapLegacyStatusToDataTest,
  resolveMesIntegrationRecommendation,
  syncChecklistFromState,
} from "../config/mesIntegrationPoc";
import {
  MES_ORACLE_QUERY_TO_DATA_TEST,
  MES_ORACLE_REAL_POC_VERSION,
  MES_ORACLE_REAL_QUERIES,
} from "../config/mesOracleRealPoc";
import { REPOSITORY_BACKEND } from "../config/repositoryArchitecture";
import { MES_REPOSITORY_ADAPTER, TITAN_EDITION } from "../config/titanEditionArchitecture";
import { setTitanEdition } from "./titanEditionSession";
import {
  getPocLogs as fetchBridgePocLogs,
  isMesOracleBridgeAvailable,
  runReadOnlyQuery,
  testConnection as bridgeTestConnection,
} from "../services/mesOracleBridge";
import {
  getRepositoryBackendLabel,
  resetRepositoriesForDemo,
  setRepositoryBackend,
} from "../repositories/index";

const STORAGE_KEY = "project-titan-mes-poc-rev5";
const LEGACY_STORAGE_KEY = "project-titan-mes-poc-rev4";

function defaultConnection() {
  return {
    host: MES_ORACLE_ENVIRONMENT.host,
    port: MES_ORACLE_ENVIRONMENT.port,
    service: MES_ORACLE_ENVIRONMENT.service,
    user: MES_ORACLE_ENVIRONMENT.user,
  };
}

function defaultDataTests() {
  return Object.fromEntries(
    MES_POC_READ_ONLY_DATA_TESTS.map((test) => [
      test.id,
      { status: "blocked", note: "", verifiedAt: "" },
    ])
  );
}

function defaultChecklist() {
  return Object.fromEntries(
    MES_POC_CHECKLIST.map((item) => [
      item.id,
      { status: item.autoFromAnalysis ? "complete" : "waiting", note: "", syncedAt: "" },
    ])
  );
}

function defaultQueryResults() {
  return Object.fromEntries(
    Object.keys(MES_ORACLE_REAL_QUERIES).map((id) => [
      id,
      {
        rows: [],
        columns: [],
        rowCount: 0,
        status: "blocked",
        message: "",
        queryTimeMs: 0,
        testedAt: "",
      },
    ])
  );
}

function defaultResults() {
  const now = new Date().toISOString();
  return {
    version: MES_ORACLE_REAL_POC_VERSION,
    updatedAt: now,
    updatedBy: "",
    connection: defaultConnection(),
    connectionTestResult: {
      status: "idle",
      message: "",
      testedAt: "",
      connectionTimeMs: 0,
      driver: null,
    },
    dataTests: defaultDataTests(),
    checklist: defaultChecklist(),
    queryResults: defaultQueryResults(),
    pocLogs: [],
    repositoryBackendActive: "session",
    qualityIntakeDemo: { lastManagementNo: "", result: null, simulatedAt: "", sourceRow: null },
    repositorySimulation: { lastRunAt: "", note: "" },
  };
}

function migrateLegacyItems(parsed) {
  if (parsed.items && !parsed.dataTests) {
    const dataTests = defaultDataTests();
    for (const [id, item] of Object.entries(parsed.items)) {
      if (dataTests[id]) {
        dataTests[id] = {
          status: mapLegacyStatusToDataTest(item.status ?? "pending"),
          note: item.note ?? "",
          verifiedAt: item.verifiedAt ?? "",
        };
      }
    }
    parsed = { ...parsed, dataTests, items: undefined };
  }
  if (!parsed.queryResults) {
    parsed.queryResults = defaultQueryResults();
  }
  if (!parsed.pocLogs) {
    parsed.pocLogs = [];
  }
  if (!parsed.repositoryBackendActive) {
    parsed.repositoryBackendActive = "session";
  }
  return parsed;
}

function readResults() {
  try {
    let raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      raw = globalThis.sessionStorage?.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) return defaultResults();
    const parsed = migrateLegacyItems(JSON.parse(raw));
    const base = defaultResults();
    return {
      ...base,
      ...parsed,
      version: MES_ORACLE_REAL_POC_VERSION,
      connection: { ...base.connection, ...(parsed.connection ?? {}) },
      connectionTestResult: { ...base.connectionTestResult, ...(parsed.connectionTestResult ?? {}) },
      dataTests: { ...base.dataTests, ...(parsed.dataTests ?? {}) },
      checklist: { ...base.checklist, ...(parsed.checklist ?? {}) },
      queryResults: { ...base.queryResults, ...(parsed.queryResults ?? {}) },
      pocLogs: parsed.pocLogs ?? [],
      qualityIntakeDemo: { ...base.qualityIntakeDemo, ...(parsed.qualityIntakeDemo ?? {}) },
      repositorySimulation: { ...base.repositorySimulation, ...(parsed.repositorySimulation ?? {}) },
    };
  } catch {
    return defaultResults();
  }
}

function writeResults(data) {
  const { password, ...safe } = data;
  void password;
  globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(safe));
}

function buildStateFromResults(results) {
  const dataTestStatusById = Object.fromEntries(
    Object.entries(results.dataTests).map(([id, item]) => [id, item.status ?? "blocked"])
  );
  const checklistStatusById = Object.fromEntries(
    Object.entries(results.checklist).map(([id, item]) => [id, item.status ?? "waiting"])
  );

  return {
    connection: results.connection,
    connectionTestResult: results.connectionTestResult,
    dataTestStatusById,
    checklistStatusById,
    qualityIntakeDemo: results.qualityIntakeDemo,
    repositorySimulation: results.repositorySimulation,
    queryResults: results.queryResults,
    pocLogs: results.pocLogs,
  };
}

function applyAutoSync(results) {
  const state = buildStateFromResults(results);
  const syncedChecklist = syncChecklistFromState(state);

  const nextChecklist = { ...results.checklist };
  for (const [id, status] of Object.entries(syncedChecklist)) {
    nextChecklist[id] = {
      ...(nextChecklist[id] ?? { note: "", syncedAt: "" }),
      status,
      syncedAt: new Date().toISOString(),
    };
  }

  return { ...results, checklist: nextChecklist };
}

function persistResults(results, meta = {}) {
  const synced = applyAutoSync({
    ...results,
    updatedAt: new Date().toISOString(),
    updatedBy: meta.updatedBy?.trim() || results.updatedBy || "",
  });
  writeResults(synced);
  return synced;
}

function mapBridgeStatus(status) {
  if (status === "success" || status === "fail" || status === "timeout" || status === "noPermission") {
    return status;
  }
  return "fail";
}

function rowsToGridColumns(rows) {
  if (!rows?.length) return [];
  return Object.keys(rows[0]).map((key) => ({ key, label: key, widthPercent: 12 }));
}

function normalizeInboundRow(row) {
  if (!row || typeof row !== "object") return null;
  return {
    mesManagementNo:
      row.SADVLO ?? row.mesManagementNo ?? row.MANAGEMENT_NO ?? row.managementNo ?? "",
    company: row.VNDKNM ?? row.company ?? row.COMPANY ?? "",
    partName: row.MASVNM ?? row.partName ?? row.PART_NAME ?? "",
    partNo: row.MASVNO ?? row.partNo ?? row.PART_NO ?? "",
    material: row.MASCOLM ?? row.material ?? "",
    qty: row.SADQTY ?? row.qty ?? "",
    lotNo: row.SADLOT ?? row.lotNo ?? row.LOT ?? "",
    inboundDate: row.SADDAT ?? row.inboundDate ?? "",
    _raw: row,
  };
}

export function getMesIntegrationPocResults() {
  return applyAutoSync(readResults());
}

/**
 * @param {string} testId
 * @param {{ status?: string, note?: string, verifiedAt?: string }} patch
 * @param {{ updatedBy?: string }} [meta]
 */
export function updateMesPocDataTest(testId, patch, meta = {}) {
  const current = readResults();
  const existing = current.dataTests[testId] ?? { status: "blocked", note: "", verifiedAt: "" };
  const nextItem = {
    ...existing,
    ...patch,
    verifiedAt:
      patch.status && patch.status !== "blocked"
        ? patch.verifiedAt || new Date().toISOString()
        : patch.verifiedAt ?? existing.verifiedAt ?? "",
  };

  return persistResults(
    {
      ...current,
      dataTests: { ...current.dataTests, [testId]: nextItem },
    },
    meta
  );
}

/** @deprecated — 하위 호환 */
export function updateMesIntegrationPocCheck(checkId, patch, meta = {}) {
  const statusMap = {
    pass: "success",
    fail: "fail",
    blocked: "blocked",
    pending: "blocked",
  };
  if (patch.status) {
    return updateMesPocDataTest(
      checkId,
      { status: statusMap[patch.status] ?? patch.status, note: patch.note },
      meta
    );
  }
  return updateMesPocDataTest(checkId, patch, meta);
}

/**
 * @param {{ host?: string, port?: number | string, service?: string, user?: string }} patch
 * @param {{ updatedBy?: string }} [meta]
 */
export function saveMesPocConnection(patch, meta = {}) {
  const current = readResults();
  return persistResults(
    {
      ...current,
      connection: {
        ...current.connection,
        host: String(patch.host ?? current.connection.host).trim(),
        port: Number(patch.port ?? current.connection.port) || 1521,
        service: String(patch.service ?? current.connection.service).trim(),
        user: String(patch.user ?? current.connection.user).trim(),
      },
    },
    meta
  );
}

/**
 * REV.5 — Real Oracle connection via Electron Main
 * @param {{ host: string, port: number | string, service: string, user: string, password?: string }} params
 */
export async function testOracleConnectionAsync(params = {}) {
  const host = String(params.host ?? "").trim();
  const port = Number(params.port) || 0;
  const service = String(params.service ?? "").trim();
  const user = String(params.user ?? "").trim();

  if (!host || !port || !service || !user) {
    return {
      ok: false,
      status: "fail",
      message: "Host · Port · Service · User를 모두 입력하세요.",
    };
  }

  if (!isMesOracleBridgeAvailable()) {
    const result = {
      status: "fail",
      message:
        "Electron Main Process required — npm run electron:dev 로 실행하세요. " +
        "브라우저(Vite) 단독 실행에서는 Oracle Real PoC를 사용할 수 없습니다.",
      testedAt: new Date().toISOString(),
      bridgeRequired: true,
    };
    const current = readResults();
    persistResults({
      ...current,
      connection: { host, port, service, user },
      connectionTestResult: result,
    });
    return { ok: false, ...result };
  }

  const bridgeResult = await bridgeTestConnection({
    host,
    port,
    service,
    user,
    password: params.password,
  });

  const bridgeLogs = await fetchBridgePocLogs();
  const status = mapBridgeStatus(bridgeResult.status);
  const result = {
    status,
    message: bridgeResult.message ?? "",
    testedAt: new Date().toISOString(),
    connectionTimeMs: bridgeResult.connectionTimeMs ?? 0,
    driver: bridgeResult.driver ?? null,
    detail: bridgeResult.detail ?? "",
  };

  const current = readResults();
  let next = persistResults({
    ...current,
    connection: { host, port, service, user },
    connectionTestResult: result,
    pocLogs: [
      {
        at: new Date().toISOString(),
        level: bridgeResult.ok ? "info" : "error",
        message: result.message,
        meta: {
          connectionTimeMs: result.connectionTimeMs,
          status,
        },
      },
      ...bridgeLogs.slice(0, 20).map((log) => ({
        at: log.at,
        level: log.level,
        message: log.message,
        meta: log.meta,
      })),
    ].slice(0, 50),
  });

  if (bridgeResult.ok && status === "success") {
    next = enableOracleRepositoryAfterConnect();
  }

  return { ok: Boolean(bridgeResult.ok), ...result };
}

/**
 * V1.0 Demo fallback — sync validate only (browser)
 * @param {{ host: string, port: number | string, service: string, user: string, password?: string }} params
 */
export function testOracleConnection(params = {}) {
  const host = String(params.host ?? "").trim();
  const port = Number(params.port) || 0;
  const service = String(params.service ?? "").trim();
  const user = String(params.user ?? "").trim();

  if (!host || !port || !service || !user) {
    return {
      ok: false,
      status: "validation-failed",
      message: "Host · Port · Service · User를 모두 입력하세요.",
    };
  }

  const current = readResults();
  const result = {
    status: "fail",
    message:
      "브라우저 단독 실행 — Real Oracle PoC는 Electron Main Process가 필요합니다. " +
      "npm run electron:dev 로 실행 후 Connect를 다시 시도하세요.",
    testedAt: new Date().toISOString(),
    bridgeRequired: true,
  };

  persistResults({
    ...current,
    connection: { host, port, service, user },
    connectionTestResult: result,
  });

  return { ok: false, ...result };
}

/**
 * REV.5 — Run real read-only query via Electron
 * @param {string} queryId
 * @param {{ updatedBy?: string }} [meta]
 */
export async function runMesPocQueryTest(queryId, meta = {}) {
  const queryMeta = MES_ORACLE_REAL_QUERIES[queryId];
  if (!queryMeta) {
    return { ok: false, message: `Unknown queryId: ${queryId}` };
  }

  if (!isMesOracleBridgeAvailable()) {
    return {
      ok: false,
      status: "fail",
      message: "Electron Main Process required",
    };
  }

  const started = Date.now();
  const bridgeResult = await runReadOnlyQuery(queryId);
  const bridgeLogs = await fetchBridgePocLogs();
  const status = bridgeResult.ok ? "success" : mapBridgeStatus(bridgeResult.status);
  const dataTestId = MES_ORACLE_QUERY_TO_DATA_TEST[queryId] ?? queryMeta.dataTestId;

  const current = readResults();
  const queryResultEntry = {
    rows: bridgeResult.rows ?? [],
    columns: bridgeResult.columns?.length
      ? bridgeResult.columns.map((key) => ({ key, label: key }))
      : rowsToGridColumns(bridgeResult.rows),
    rowCount: bridgeResult.rowCount ?? 0,
    status,
    message: bridgeResult.message ?? "",
    queryTimeMs: bridgeResult.queryTimeMs ?? Date.now() - started,
    testedAt: new Date().toISOString(),
  };

  const logEntry = {
    at: new Date().toISOString(),
    level: bridgeResult.ok ? "info" : "error",
    message: `[${queryId}] ${bridgeResult.message ?? ""}`,
    meta: {
      queryId,
      connectionTime: current.connectionTestResult?.connectionTimeMs ?? 0,
      queryTime: queryResultEntry.queryTimeMs,
      rowCount: queryResultEntry.rowCount,
      error: bridgeResult.ok ? "" : bridgeResult.detail ?? bridgeResult.message,
    },
  };

  let next = {
    ...current,
    queryResults: {
      ...current.queryResults,
      [queryId]: queryResultEntry,
    },
    dataTests: {
      ...current.dataTests,
      [dataTestId]: {
        ...(current.dataTests[dataTestId] ?? { note: "" }),
        status,
        note: bridgeResult.ok
          ? `Real query ${queryResultEntry.rowCount}건 · ${queryResultEntry.queryTimeMs}ms`
          : bridgeResult.message ?? "",
        verifiedAt: new Date().toISOString(),
      },
    },
    pocLogs: [logEntry, ...bridgeLogs.slice(0, 15).map((l) => ({
      at: l.at,
      level: l.level,
      message: l.message,
      meta: l.meta,
    }))].slice(0, 50),
  };

  next = persistResults(next, meta);

  if (bridgeResult.ok && queryId === "inbound" && bridgeResult.rows?.length) {
    const firstRow = normalizeInboundRow(bridgeResult.rows[0]);
    if (firstRow?.mesManagementNo) {
      persistResults({
        ...next,
        qualityIntakeDemo: {
          ...next.qualityIntakeDemo,
          lastManagementNo: firstRow.mesManagementNo,
          sourceRow: firstRow,
        },
      });
    }
  }

  return {
    ok: Boolean(bridgeResult.ok),
    status,
    queryId,
    ...queryResultEntry,
  };
}

export function enableOracleRepositoryAfterConnect() {
  setTitanEdition(TITAN_EDITION.MES_CONNECTED, { mesAdapter: MES_REPOSITORY_ADAPTER.ORACLE });
  resetRepositoriesForDemo();
  const current = readResults();
  return persistResults({
    ...current,
    repositoryBackendActive: "oracle",
    repositorySimulation: {
      lastRunAt: new Date().toISOString(),
      note: `REV.5 PoC: UI → getRepositories() → ${REPOSITORY_BACKEND.MES_ORACLE} (read-only)`,
    },
  });
}

/**
 * Demo / real — 품질접수 시뮬레이션
 * @param {string} managementNo
 * @param {object} [sourceRow]
 */
export function simulateQualityIntake(managementNo, sourceRow = null) {
  const trimmed = String(managementNo ?? "").trim();
  if (!trimmed) {
    return { ok: false, message: "관리번호를 입력하세요." };
  }

  const current = readResults();
  const inboundQuery = current.queryResults?.inbound;
  const realRow =
    sourceRow ??
    current.qualityIntakeDemo?.sourceRow ??
    (inboundQuery?.rows ?? [])
      .map(normalizeInboundRow)
      .find((row) => row.mesManagementNo === trimmed);

  const previewRow =
    realRow ??
    MES_SAMPLE_PREVIEW.rows.find((row) => row.mesManagementNo === trimmed) ??
    MES_SAMPLE_PREVIEW.rows[0];

  const fromReal = Boolean(realRow);

  const result = {
    managementNo: trimmed,
    action: fromReal
      ? "품질접수 시뮬레이션 (Real Oracle inbound row — 저장 없음)"
      : "품질접수 시뮬레이션 (Demo — 저장 없음)",
    mesSource: fromReal ? "MES Oracle Real PoC" : "MES Oracle (PoC Demo)",
    linkedData: {
      company: previewRow.company,
      partName: previewRow.partName,
      partNo: previewRow.partNo,
      material: previewRow.material,
      lotNo: previewRow.lotNo,
      inboundDate: previewRow.inboundDate,
    },
    titanFlow: [
      "MES 관리번호 조회",
      "품질접수 화면 Preview",
      "검사일지·성적서 연결 (V1.1)",
    ],
    note: fromReal
      ? "REV.5 Real Query inbound row 사용 — 실제 저장 없음"
      : "V1.0 Demo — 실제 저장·Oracle 조회 없음",
  };

  persistResults({
    ...current,
    qualityIntakeDemo: {
      lastManagementNo: trimmed,
      result,
      simulatedAt: new Date().toISOString(),
      sourceRow: realRow ?? null,
    },
  });

  return { ok: true, result };
}

export function runRepositorySimulation(meta = {}) {
  const current = readResults();
  const label = getRepositoryBackendLabel();
  return persistResults(
    {
      ...current,
      repositorySimulation: {
        lastRunAt: new Date().toISOString(),
        note: `UI → getRepositories() → ${label}`,
      },
    },
    meta
  );
}

export function resetMesIntegrationPocResults() {
  setRepositoryBackend("session");
  resetRepositoriesForDemo();
  const next = defaultResults();
  writeResults(next);
  return applyAutoSync(next);
}

export function getMesIntegrationPocSummary() {
  const results = applyAutoSync(readResults());
  const state = buildStateFromResults(results);
  const readiness = calculateIntegrationReadiness(state);
  const dataTestStatusById = state.dataTestStatusById;
  const recommendation = resolveMesIntegrationRecommendation(dataTestStatusById);

  const inboundReal = results.queryResults?.inbound;
  const hasRealInbound = inboundReal?.status === "success" && inboundReal.rows?.length > 0;

  const previewRows = hasRealInbound
    ? inboundReal.rows.map(normalizeInboundRow).filter(Boolean).slice(0, 10)
    : dataTestStatusById["inbound"] === "success" || dataTestStatusById["product-master"] === "success"
      ? MES_SAMPLE_PREVIEW.rows.slice(0, 10)
      : [];

  const previewColumns = hasRealInbound && inboundReal.columns?.length
    ? inboundReal.columns
    : MES_SAMPLE_PREVIEW.columns;

  const report = buildMesPocReport({
    ...state,
    realPoc: {
      bridgeAvailable: isMesOracleBridgeAvailable(),
      queryResults: results.queryResults,
      repositoryBackend: results.repositoryBackendActive,
    },
  });

  const dataTestsCompleted = MES_POC_READ_ONLY_DATA_TESTS.filter(
    (test) => (results.dataTests[test.id]?.status ?? "blocked") !== "blocked"
  ).length;

  return {
    ...results,
    bridgeAvailable: isMesOracleBridgeAvailable(),
    dataTestStatusById,
    checklistStatusById: readiness.checklistStatusById,
    recommendation,
    readiness,
    report,
    preview: {
      columns: previewColumns,
      rows: previewRows,
      visible: previewRows.length > 0,
      source: hasRealInbound ? "real-oracle" : "demo-sample",
    },
    realQueries: MES_ORACLE_REAL_QUERIES,
    progressLabel: `${readiness.checklistComplete}/${readiness.checklistTotal}`,
    dataProgressLabel: `${dataTestsCompleted}/${MES_POC_READ_ONLY_DATA_TESTS.length}`,
    repositoryBackend: getRepositoryBackendLabel(),
    repositoryBackendActive: results.repositoryBackendActive ?? "session",
  };
}
