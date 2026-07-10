/**
 * Project TITAN V1.5 — SessionStorage Adapter (Data Engine only)
 * Page / UI에서 SessionStorage 직접 접근 금지 — Store → Adapter 경유
 */

function getStorage() {
  if (typeof globalThis.sessionStorage === "undefined") return null;
  return globalThis.sessionStorage;
}

export function readJson(key, fallback = null) {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (raw == null || raw === "") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** @type {Record<string, string | null>} */
const lastWriteErrors = {};

export function getLastWriteError(key) {
  return lastWriteErrors[key] ?? null;
}

export function writeJson(key, value) {
  const result = writeJsonDetailed(key, value);
  return result.ok;
}

/** @returns {{ ok: boolean, byteLength?: number, error?: string, readBackCount?: number }} */
export function writeJsonDetailed(key, value) {
  const storage = getStorage();
  if (!storage) {
    lastWriteErrors[key] = "sessionStorage unavailable";
    return { ok: false, error: lastWriteErrors[key] };
  }
  try {
    const payload = JSON.stringify(value);
    storage.setItem(key, payload);
    lastWriteErrors[key] = null;
    let readBackCount;
    try {
      const readBack = JSON.parse(storage.getItem(key) ?? "null");
      readBackCount = Array.isArray(readBack) ? readBack.length : undefined;
    } catch {
      readBackCount = undefined;
    }
    return { ok: true, byteLength: payload.length, readBackCount };
  } catch (error) {
    lastWriteErrors[key] = error?.message ?? String(error);
    return { ok: false, error: lastWriteErrors[key] };
  }
}

export function removeKey(key) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function hasKey(key) {
  const storage = getStorage();
  if (!storage) return false;
  return storage.getItem(key) != null;
}
