/**
 * Project TITAN V1.0 — 검색 최근 검색어 · 즐겨찾기 (SessionStorage, SQLite 전환 대비)
 */

const RECENT_KEY = "project-titan-search-recent-v1";
const FAVORITES_KEY = "project-titan-search-favorites-v1";
export const MAX_RECENT_SEARCHES = 10;

function safeRead(key) {
  try {
    const raw = globalThis.sessionStorage?.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeWrite(key, value) {
  try {
    globalThis.sessionStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // SQLite 전환 전 임시 저장소
  }
}

function createEntry(field, value) {
  const trimmed = String(value ?? "").trim();
  return {
    id: `${field}:${trimmed}`,
    field,
    value: trimmed,
    timestamp: new Date().toISOString(),
  };
}

export function getRecentSearches() {
  return safeRead(RECENT_KEY)
    .filter((item) => item?.value)
    .slice(0, MAX_RECENT_SEARCHES);
}

export function addRecentSearch(field, value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || !field) return;

  const entry = createEntry(field, trimmed);
  const next = [entry, ...getRecentSearches().filter((item) => item.id !== entry.id)].slice(
    0,
    MAX_RECENT_SEARCHES
  );
  safeWrite(RECENT_KEY, next);
}

export function removeRecentSearch(id) {
  safeWrite(
    RECENT_KEY,
    getRecentSearches().filter((item) => item.id !== id)
  );
}

export function clearRecentSearches() {
  safeWrite(RECENT_KEY, []);
}

export function getSearchFavorites() {
  return safeRead(FAVORITES_KEY).filter((item) => item?.value);
}

export function isSearchFavorite(field, value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return false;
  return getSearchFavorites().some((item) => item.field === field && item.value === trimmed);
}

export function toggleSearchFavorite(field, value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || !field) return false;

  const entry = createEntry(field, trimmed);
  const favorites = getSearchFavorites();
  const exists = favorites.some((item) => item.id === entry.id);
  const next = exists
    ? favorites.filter((item) => item.id !== entry.id)
    : [entry, ...favorites];
  safeWrite(FAVORITES_KEY, next);
  return !exists;
}

export function removeSearchFavorite(id) {
  safeWrite(
    FAVORITES_KEY,
    getSearchFavorites().filter((item) => item.id !== id)
  );
}

export function getRecentSearchesForField(field) {
  return getRecentSearches().filter((item) => item.field === field);
}

export function getFavoritesForField(field) {
  return getSearchFavorites().filter((item) => item.field === field);
}
