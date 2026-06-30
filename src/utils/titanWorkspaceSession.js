/**
 * Project TITAN — Workspace layout persistence (SessionStorage)
 * Remembers collapse state, active tabs, etc. per screen.
 */

const STORAGE_KEY = "project-titan-workspace-v1";
export const TITAN_WORKSPACE_EVENT = "titan-workspace-change";

function readAll() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Non-blocking — UI works without persistence
  }
}

function notifyChange(screenId, panelId) {
  globalThis.dispatchEvent?.(
    new CustomEvent(TITAN_WORKSPACE_EVENT, { detail: { screenId, panelId } })
  );
}

function ensureScreen(all, screenId) {
  if (!all[screenId]) {
    all[screenId] = { panels: {} };
  } else if (!all[screenId].panels) {
    all[screenId].panels = {};
  }
  return all[screenId];
}

export function getPanelExpanded(screenId, panelId, defaultExpanded = true) {
  const screen = readAll()[screenId];
  const stored = screen?.panels?.[panelId]?.expanded;
  if (stored === undefined) return defaultExpanded;
  return Boolean(stored);
}

export function setPanelExpanded(screenId, panelId, expanded) {
  const all = readAll();
  const screen = ensureScreen(all, screenId);
  screen.panels[panelId] = { ...screen.panels[panelId], expanded: Boolean(expanded) };
  writeAll(all);
  notifyChange(screenId, panelId);
}

export function getWorkspaceTab(screenId, defaultTab) {
  const tab = readAll()[screenId]?.activeTab;
  return tab ?? defaultTab;
}

export function setWorkspaceTab(screenId, tab) {
  const all = readAll();
  const screen = ensureScreen(all, screenId);
  screen.activeTab = tab;
  writeAll(all);
  notifyChange(screenId, "activeTab");
}
