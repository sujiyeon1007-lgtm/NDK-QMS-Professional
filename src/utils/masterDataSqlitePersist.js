import { isTitanDbBridgeAvailable, titanDbMasterReplaceAll } from "../services/titanDbBridge.js";
import { resolveV11MasterLegacyKey } from "../config/titanV11Sprint1MasterRepository.js";

const SQLITE_PERSIST_CATEGORIES = new Set([
  "companies",
  "products",
  "materials",
  "equipment",
  "workers",
  "heatTreatment",
]);

export function isSqliteMasterPersistActive() {
  return isTitanDbBridgeAvailable();
}

export async function persistMasterCategoryToSqlite(categoryKey, rows) {
  if (!isSqliteMasterPersistActive()) return { ok: false, skipped: true };
  const legacyKey = resolveV11MasterLegacyKey(categoryKey);
  if (!SQLITE_PERSIST_CATEGORIES.has(legacyKey)) return { ok: false, skipped: true };
  return titanDbMasterReplaceAll(legacyKey, Array.isArray(rows) ? rows : []);
}

export async function persistMasterBundleToSqlite(bundle) {
  if (!isSqliteMasterPersistActive() || !bundle) return { ok: false, skipped: true };
  const results = {};
  for (const key of SQLITE_PERSIST_CATEGORIES) {
    const rows = bundle[key];
    if (!Array.isArray(rows)) continue;
    results[key] = await persistMasterCategoryToSqlite(key, rows);
  }
  return { ok: true, results };
}
