/** Project TITAN — 좌측 Widget 패널 접기/펼치기 (페이지별 SessionStorage) */

const KEY_PREFIX = "project-titan-left-widget-collapsed:";

export function readTitanLeftWidgetCollapsed(storageKey) {
  if (!storageKey) return false;
  try {
    return sessionStorage.getItem(`${KEY_PREFIX}${storageKey}`) === "1";
  } catch {
    return false;
  }
}

export function writeTitanLeftWidgetCollapsed(storageKey, collapsed) {
  if (!storageKey) return;
  try {
    sessionStorage.setItem(`${KEY_PREFIX}${storageKey}`, collapsed ? "1" : "0");
  } catch {
    /* ignore */
  }
}
