/**
 * Project TITAN V1.0 — 오류 로그 SessionStorage (SQLite 연동 준비)
 */

import { getCurrentTitanUser } from "./titanHistorySession";
import { getTitanErrorContext } from "./titanErrorContext";

const STORAGE_KEY = "project-titan-error-logs-v1";
const MAX_LOGS = 200;

function formatLogTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function normalizeLogEntry(entry = {}) {
  const context = getTitanErrorContext();
  const occurredAt = entry.occurredAt || formatLogTimestamp();
  return {
    id: entry.id || `ERR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    occurredAt,
    screen: entry.screen?.trim() || context.screen || "—",
    component: entry.component?.trim() || context.component || "—",
    message: entry.message?.trim() || "Unknown error",
    stack: entry.stack?.trim() || "",
    user: entry.user?.trim() || getCurrentTitanUser(),
    productPartNo: entry.productPartNo?.trim() || context.productPartNo || "",
    productName: entry.productName?.trim() || context.productName || "",
    path: entry.path?.trim() || context.path || "",
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function loadLogs() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeLogEntry) : [];
  } catch {
    return [];
  }
}

function persistLogs(logs) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch {
    /* session quota */
  }
}

export function getTitanErrorLogs() {
  return loadLogs();
}

export function logTitanError(error, meta = {}) {
  const entry = normalizeLogEntry({
    message: error?.message || String(error ?? "Unknown error"),
    stack: error?.stack || "",
    ...meta,
  });
  const logs = [entry, ...loadLogs()].slice(0, MAX_LOGS);
  persistLogs(logs);
  return entry;
}

export function clearTitanErrorLogs() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
