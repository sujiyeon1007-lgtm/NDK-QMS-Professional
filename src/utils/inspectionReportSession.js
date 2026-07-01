/**
 * Project TITAN V1.0 — 검사 리포트 세션 (SessionStorage)
 */

import { getInspectionLogById } from "./inspectionLogSession";
import {
  buildInspectionReportFromLog,
  normalizeInspectionReport,
} from "./inspectionReportModel";

const STORAGE_KEY = "project-titan-inspection-report-v1";

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safeWrite(store) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // SQLite 전환 전 임시 저장소
  }
}

export function getInspectionReportByLogId(logId) {
  const trimmed = logId?.trim();
  if (!trimmed) return null;

  const store = safeRead();
  if (store[trimmed]) {
    return normalizeInspectionReport(store[trimmed]);
  }

  const log = getInspectionLogById(trimmed);
  if (!log) return null;

  const generated = buildInspectionReportFromLog(log);
  if (generated) {
    store[trimmed] = generated;
    safeWrite(store);
  }
  return generated;
}

export function saveInspectionReport(logId, patch) {
  const trimmed = logId?.trim();
  if (!trimmed) return null;

  const existing = getInspectionReportByLogId(trimmed);
  if (!existing) return null;

  const updated = normalizeInspectionReport({
    ...existing,
    ...patch,
    logId: trimmed,
    updatedAt: new Date().toISOString(),
  });

  const store = safeRead();
  store[trimmed] = updated;
  safeWrite(store);
  return updated;
}

export function ensureInspectionReportForLog(logId) {
  return getInspectionReportByLogId(logId);
}
