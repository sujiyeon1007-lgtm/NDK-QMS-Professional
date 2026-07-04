/** HOME 좌측 패널 접기/펼치기 — SessionStorage persist */

export const HOME_LEFT_PANEL_STORAGE_KEY = "project-titan-home-left-panel-collapsed-v1";

export function readHomeLeftPanelCollapsed() {
  try {
    return sessionStorage.getItem(HOME_LEFT_PANEL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeHomeLeftPanelCollapsed(collapsed) {
  try {
    sessionStorage.setItem(HOME_LEFT_PANEL_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    /* ignore */
  }
}
