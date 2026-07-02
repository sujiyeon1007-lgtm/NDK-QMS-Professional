/**
 * MES Oracle Real PoC — REV.5
 * Electron Main Process → node-oracledb → read-only SELECT
 */

export const MES_ORACLE_REAL_POC_VERSION = "REV.5";

/** @typedef {"success" | "fail" | "timeout" | "noPermission"} MesOracleConnectionStatus */

export const MES_ORACLE_CONNECTION_STATUS_LABELS = {
  success: "성공",
  fail: "실패",
  timeout: "시간초과",
  noPermission: "권한없음",
};

/** Real PoC query ids (Electron main process) */
export const MES_ORACLE_REAL_QUERY_IDS = ["product-master", "customer-master", "inbound"];

export const MES_ORACLE_REAL_ROW_LIMIT = 20;

/** Maps real query id → mesIntegrationPoc data test id */
export const MES_ORACLE_QUERY_TO_DATA_TEST = {
  "product-master": "product-master",
  "customer-master": "customer",
  inbound: "inbound",
};

/** @type {Record<string, { id: string, label: string, dataTestId: string }>} */
export const MES_ORACLE_REAL_QUERIES = {
  "product-master": {
    id: "product-master",
    label: "제품 Master 조회",
    dataTestId: "product-master",
  },
  "customer-master": {
    id: "customer-master",
    label: "거래처 Master 조회",
    dataTestId: "customer",
  },
  inbound: {
    id: "inbound",
    label: "입고 데이터 조회",
    dataTestId: "inbound",
  },
};

export const MES_ORACLE_BRIDGE_UNAVAILABLE_MESSAGE =
  "Electron Main Process required — npm run electron:dev 로 실행하세요. 브라우저(Vite) 단독 실행에서는 Oracle Real PoC를 사용할 수 없습니다.";

export const MES_ORACLE_INSTANT_CLIENT_GUIDE =
  "Oracle Instant Client 미설치 또는 PATH 미설정 — Oracle 공식 사이트에서 Instant Client Basic을 설치하고 시스템 PATH에 추가하세요.";

export const MES_ORACLE_DRIVER_GUIDE =
  "node-oracledb 미설치 — 프로젝트 루트에서 npm install oracledb 실행 후 Electron을 재시작하세요.";
