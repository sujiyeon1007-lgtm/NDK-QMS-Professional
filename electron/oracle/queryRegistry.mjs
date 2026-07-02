/** @typedef {"product-master" | "customer-master" | "inbound"} MesOracleQueryId */

export const MES_ORACLE_ROW_LIMIT = 20;

/** @type {Record<MesOracleQueryId, { id: MesOracleQueryId, label: string, envKey: string, description: string }>} */
export const MES_ORACLE_QUERY_REGISTRY = {
  "product-master": {
    id: "product-master",
    label: "제품 Master",
    envKey: "MES_ORACLE_SQL_PRODUCT",
    description: "품번·품명·재질 등 제품 Master SELECT (max 20 rows)",
  },
  "customer-master": {
    id: "customer-master",
    label: "거래처 Master",
    envKey: "MES_ORACLE_SQL_CUSTOMER",
    description: "거래처 코드·명칭 SELECT (max 20 rows)",
  },
  inbound: {
    id: "inbound",
    label: "입고 데이터",
    envKey: "MES_ORACLE_SQL_INBOUND",
    description: "입고일·수량·LOT·관리번호 SELECT (max 20 rows)",
  },
};

const FORBIDDEN_SQL_PATTERN =
  /\b(INSERT|UPDATE|DELETE|MERGE|TRUNCATE|DROP|ALTER|CREATE|GRANT|REVOKE|EXEC|EXECUTE|CALL|PLSQL)\b/i;

/**
 * @param {string} sql
 */
export function assertReadOnlySelect(sql) {
  const trimmed = String(sql ?? "").trim();
  if (!trimmed) {
    throw new Error("SQL이 설정되지 않았습니다. .env에 MES_ORACLE_SQL_* 값을 설정하세요.");
  }
  if (!/^SELECT\b/i.test(trimmed)) {
    throw new Error("SELECT 문만 허용됩니다 (읽기 전용 PoC).");
  }
  if (FORBIDDEN_SQL_PATTERN.test(trimmed)) {
    throw new Error("허용되지 않는 SQL 키워드가 포함되어 있습니다.");
  }
  if (/;\s*\S/.test(trimmed)) {
    throw new Error("다중 SQL 문은 허용되지 않습니다.");
  }
  return trimmed;
}

/**
 * @param {MesOracleQueryId} queryId
 */
export function resolveQuerySql(queryId) {
  const entry = MES_ORACLE_QUERY_REGISTRY[queryId];
  if (!entry) {
    throw new Error(`알 수 없는 queryId: ${queryId}`);
  }
  const sql = process.env[entry.envKey];
  return assertReadOnlySelect(sql);
}

export function listRegisteredQueryIds() {
  return Object.keys(MES_ORACLE_QUERY_REGISTRY);
}
