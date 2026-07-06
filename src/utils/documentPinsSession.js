/**
 * Project TITAN V1.3 — 문서관리 Pin (관리자 · SessionStorage)
 */

const STORAGE_KEY = "project-titan-document-pins-v1";

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeWrite(value) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getPinnedDocumentIds() {
  return safeRead().filter(Boolean);
}

export function isDocumentPinned(documentId) {
  if (!documentId) return false;
  return getPinnedDocumentIds().includes(documentId);
}

export function toggleDocumentPin(documentId) {
  if (!documentId) return false;
  const current = getPinnedDocumentIds();
  const exists = current.includes(documentId);
  const next = exists
    ? current.filter((id) => id !== documentId)
    : [documentId, ...current];
  safeWrite(next);
  return !exists;
}
