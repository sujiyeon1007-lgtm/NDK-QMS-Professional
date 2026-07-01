/**
 * Project TITAN V1.0 — Master Excel Import Log + Undo
 * SessionStorage — SQLite ImportLog 테이블 연동 준비
 */

import { revertMasterImport } from "./masterData";

const STORAGE_KEY = "project-titan-master-excel-import-log-v1";

function loadLogs() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function persistLogs(logs) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    /* ignore quota */
  }
}

function resolveCurrentUser() {
  try {
    return sessionStorage.getItem("titan-current-user") || "시스템";
  } catch {
    return "시스템";
  }
}

/**
 * @param {object} entry
 * @param {string} entry.masterType
 * @param {string} entry.categoryKey
 * @param {string} entry.fileName
 * @param {string} [entry.companyName]
 * @param {object} entry.counts
 * @param {object} entry.undoSnapshot
 */
export function saveMasterImportLog(entry) {
  const logs = loadLogs();
  const record = {
    id: `log-${Date.now()}`,
    datetime: new Date().toISOString(),
    user: resolveCurrentUser(),
    ...entry,
  };
  logs[entry.masterType] = record;
  persistLogs(logs);
  return record;
}

export function getLastMasterImportLog(masterType) {
  const logs = loadLogs();
  return logs[masterType] ?? null;
}

export function canUndoMasterImport(masterType) {
  const log = getLastMasterImportLog(masterType);
  return Boolean(log?.undoSnapshot);
}

export function undoLastMasterImport(masterType, categoryKey) {
  const log = getLastMasterImportLog(masterType);
  if (!log?.undoSnapshot) {
    return { ok: false, message: "Undo 가능한 Import 이력이 없습니다." };
  }
  const result = revertMasterImport(categoryKey, log.undoSnapshot);
  if (!result.ok) return result;

  const logs = loadLogs();
  delete logs[masterType];
  persistLogs(logs);
  return { ok: true, log };
}

export function getAllMasterImportLogs() {
  return loadLogs();
}
