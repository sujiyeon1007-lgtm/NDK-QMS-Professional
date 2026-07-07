import { hasKey, readJson, removeKey, writeJson } from "./sessionStorageAdapter";

/**
 * SessionStorage JSON Array Store Factory
 * @template T
 * @param {{ storageKey: string, getSeed?: () => T[], idField?: string }} config
 */
export function createJsonArrayStore({ storageKey, getSeed, idField = "id" }) {
  /** @returns {T[]} */
  function readAll() {
    const stored = readJson(storageKey, null);
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map((row) => ({ ...row }));
    }
    const seed = getSeed?.() ?? [];
    if (seed.length > 0) {
      writeJson(storageKey, seed);
      return seed.map((row) => ({ ...row }));
    }
    return [];
  }

  /** @param {T[]} items */
  function writeAll(items) {
    writeJson(storageKey, items);
    return items.map((row) => ({ ...row }));
  }

  /** @param {string} id */
  function getById(id) {
    const key = String(id ?? "").trim();
    if (!key) return null;
    return readAll().find((row) => String(row[idField] ?? "") === key) ?? null;
  }

  /** @param {T} item */
  function create(item) {
    const items = readAll();
    const next = { ...item };
    items.unshift(next);
    writeAll(items);
    return { ...next };
  }

  /**
   * @param {string} id
   * @param {Partial<T>} patch
   */
  function update(id, patch) {
    const key = String(id ?? "").trim();
    if (!key) return null;
    let updated = null;
    const items = readAll().map((row) => {
      if (String(row[idField] ?? "") !== key) return row;
      updated = { ...row, ...patch };
      return updated;
    });
    if (!updated) return null;
    writeAll(items);
    return { ...updated };
  }

  /** @param {string} id */
  function remove(id) {
    const key = String(id ?? "").trim();
    if (!key) return false;
    const before = readAll();
    const next = before.filter((row) => String(row[idField] ?? "") !== key);
    if (next.length === before.length) return false;
    writeAll(next);
    return true;
  }

  function seedIfEmpty() {
    if (hasKey(storageKey)) return readAll();
    return readAll();
  }

  function clear() {
    removeKey(storageKey);
  }

  return {
    storageKey,
    readAll,
    writeAll,
    getById,
    create,
    update,
    remove,
    seedIfEmpty,
    clear,
  };
}

/**
 * SessionStorage JSON Object Store Factory
 * @template T
 * @param {{ storageKey: string, getSeed?: () => T }} config
 */
export function createJsonObjectStore({ storageKey, getSeed }) {
  /** @returns {T} */
  function read() {
    const stored = readJson(storageKey, null);
    if (stored && typeof stored === "object") {
      return { ...stored };
    }
    const seed = getSeed?.() ?? /** @type {T} */ ({});
    writeJson(storageKey, seed);
    return { ...seed };
  }

  /** @param {Partial<T>} patch */
  function update(patch) {
    const current = read();
    const next = { ...current, ...patch };
    writeJson(storageKey, next);
    return { ...next };
  }

  /** @param {T} value */
  function replace(value) {
    writeJson(storageKey, value);
    return { ...value };
  }

  function seedIfEmpty() {
    if (hasKey(storageKey)) return read();
    return read();
  }

  function clear() {
    removeKey(storageKey);
  }

  return {
    storageKey,
    read,
    update,
    replace,
    seedIfEmpty,
    clear,
  };
}
