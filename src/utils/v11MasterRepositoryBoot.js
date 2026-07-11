import { initTitanDb, isTitanDbBridgeAvailable, titanDbMasterList } from "../services/titanDbBridge.js";
import { resolveV11MasterLegacyKey } from "../config/titanV11Sprint1MasterRepository.js";

const BOOT_CATEGORIES = ["companies", "products", "materials", "equipment", "workers", "heatTreatment"];

export async function bootV11MasterRepository() {
  if (!isTitanDbBridgeAvailable()) {
    return { ok: false, backend: "session", hydrated: false, message: "Browser sessionStorage fallback" };
  }

  const initResult = await initTitanDb();
  if (!initResult.ok) {
    return { ok: false, backend: "session", hydrated: false, message: initResult.message };
  }

  const hydrated = {};
  for (const category of BOOT_CATEGORIES) {
    const legacyKey = resolveV11MasterLegacyKey(category);
    const result = await titanDbMasterList(legacyKey);
    if (result.ok && Array.isArray(result.rows) && result.rows.length > 0) {
      hydrated[legacyKey] = result.rows;
    }
  }

  return {
    ok: true,
    backend: "sqlite",
    hydrated: Object.keys(hydrated).length > 0,
    categories: hydrated,
    init: initResult,
  };
}

export function applyHydratedMasterToSession(hydratedCategories) {
  if (!hydratedCategories || typeof hydratedCategories !== "object") return false;
  if (typeof globalThis.sessionStorage === "undefined") return false;

  const STORAGE_KEY = "project-titan-master-data-v3";
  let bundle = {};
  try {
    const raw = globalThis.sessionStorage.getItem(STORAGE_KEY);
    bundle = raw ? JSON.parse(raw) : {};
  } catch {
    bundle = {};
  }

  let changed = false;
  for (const [key, rows] of Object.entries(hydratedCategories)) {
    if (Array.isArray(rows) && rows.length > 0) {
      bundle[key] = rows;
      changed = true;
    }
  }

  if (changed) {
    globalThis.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
  }
  return changed;
}
