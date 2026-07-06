/**
 * Project TITAN V1.3 — 문서관리 변경 이력 (SessionStorage · 문서 ID 기준)
 */

import { getCurrentTitanUser } from "./titanHistorySession";

const STORAGE_KEY = "project-titan-document-changelog-v1";

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safeWrite(data) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function createEntry(action, detail = "") {
  return {
    id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userName: getCurrentTitanUser(),
    at: new Date().toISOString(),
    action: String(action ?? "").trim(),
    detail: String(detail ?? "").trim(),
  };
}

export function getDocumentChangeLogs(documentId) {
  if (!documentId) return [];
  const store = safeRead();
  return (store[documentId] ?? []).slice().sort((a, b) => b.at.localeCompare(a.at));
}

export function appendDocumentChangeLog(documentId, action, detail = "") {
  if (!documentId || !action) return null;
  const store = safeRead();
  const entry = createEntry(action, detail);
  const bucket = store[documentId] ?? [];
  store[documentId] = [entry, ...bucket].slice(0, 50);
  safeWrite(store);
  return entry;
}
