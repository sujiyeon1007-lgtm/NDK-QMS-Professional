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

export function writeJson(key, value) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
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
