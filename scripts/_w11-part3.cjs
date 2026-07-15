const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("wrote", rel);
}

w("src/services/titanDbBridge.js", `/**
 * Titan DB Bridge — Renderer to Electron Main (window.titanDb)
 */
import { TITAN_DB_BRIDGE_UNAVAILABLE_MESSAGE } from "../config/titanDbBridgePolicy.js";

function getBridge() {
  if (typeof window !== "undefined" && window.titanDb) return window.titanDb;
  return null;
}

export function isTitanDbBridgeAvailable() {
  return Boolean(getBridge()?.isAvailable?.());
}

export function requireTitanDbBridge() {
  const bridge = getBridge();
  if (!bridge) return { available: false, message: TITAN_DB_BRIDGE_UNAVAILABLE_MESSAGE };
  return { available: true, bridge };
}

export async function initTitanDb() {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { ok: false, message: gate.message, bridgeRequired: true };
  return gate.bridge.init();
}

export async function titanDbMasterList(category) {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { ok: false, rows: [], message: gate.message, bridgeRequired: true };
  return gate.bridge.masterList(category);
}

export async function titanDbMasterReplaceAll(category, rows) {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { ok: false, count: 0, message: gate.message, bridgeRequired: true };
  return gate.bridge.masterReplaceAll(category, rows);
}

export async function titanDbGetStatus() {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { available: false, message: gate.message };
  return gate.bridge.getStatus();
}
`);

w("src/repositories/sqlite/createSqliteMasterRepositories.js", `import {
  titanDbMasterList,
  titanDbMasterReplaceAll,
} from "../../services/titanDbBridge.js";
import { resolveV11MasterLegacyKey } from "../../config/titanV11Sprint1MasterRepository.js";

function createSqliteMasterCategoryRepository(categoryKey) {
  const legacyKey = resolveV11MasterLegacyKey(categoryKey);
  return {
    listAll() {
      throw new Error("MasterCategoryRepository.listAll is async-only in SQLite backend");
    },
    listActive() {
      throw new Error("MasterCategoryRepository.listActive is async-only in SQLite backend");
    },
    async listAllAsync() {
      const result = await titanDbMasterList(legacyKey);
      return result.ok ? result.rows : [];
    },
    async listActiveAsync() {
      const rows = await this.listAllAsync();
      return rows.filter((row) => row.active !== false);
    },
    async replaceAll(rows) {
      const result = await titanDbMasterReplaceAll(legacyKey, rows);
      return { ok: Boolean(result.ok), count: result.count ?? 0 };
    },
    findById(id) {
      void id;
      throw new Error("MasterCategoryRepository.findById is async-only in SQLite backend");
    },
  };
}

export function createSqliteMasterRepositories() {
  return {
    companies: createSqliteMasterCategoryRepository("companies"),
    products: createSqliteMasterCategoryRepository("products"),
    materials: createSqliteMasterCategoryRepository("materials"),
    equipment: createSqliteMasterCategoryRepository("equipment"),
    workers: createSqliteMasterCategoryRepository("workers"),
    processes: createSqliteMasterCategoryRepository("heatTreatment"),
    internalItems: createSqliteMasterCategoryRepository("internalItems"),
  };
}
`);

w("src/repositories/sqlite/createSqliteRepositories.js", `import { createSessionRepositories } from "../session/createSessionRepositories.js";
import { createSqliteMasterRepositories } from "./createSqliteMasterRepositories.js";

/** @returns {import("../repositoryTypes.js").TitanRepositories} */
export function createSqliteRepositories() {
  const session = createSessionRepositories();
  return {
    ...session,
    master: createSqliteMasterRepositories(),
  };
}
`);

w("src/utils/masterDataSqlitePersist.js", `import { isTitanDbBridgeAvailable, titanDbMasterReplaceAll } from "../services/titanDbBridge.js";
import { getActiveRepositoryBackend } from "../repositories/index.js";
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
  return getActiveRepositoryBackend() === "sqlite" && isTitanDbBridgeAvailable();
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
`);

w("src/utils/v11MasterRepositoryBoot.js", `import { initTitanDb, isTitanDbBridgeAvailable, titanDbMasterList } from "../services/titanDbBridge.js";
import { setRepositoryBackend } from "../repositories/index.js";
import { resolveV11MasterLegacyKey } from "../config/titanV11Sprint1MasterRepository.js";

const BOOT_CATEGORIES = ["companies", "products", "materials", "equipment", "workers", "heatTreatment"];

export async function bootV11MasterRepository() {
  if (!isTitanDbBridgeAvailable()) {
    return { ok: false, backend: "session", hydrated: false, message: "Browser sessionStorage fallback" };
  }

  setRepositoryBackend("sqlite");
  const initResult = await initTitanDb();
  if (!initResult.ok) {
    setRepositoryBackend("session");
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
`);

console.log("part3 files written");