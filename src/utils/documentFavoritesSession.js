/**
 * Project TITAN V1.3 — 문서관리 즐겨찾기 (SessionStorage · 사용자별)
 */

import { getAuthSession } from "./titanAuthSession";

const KEY_PREFIX = "project-titan-document-favorites-v1";

function resolveUserKey(userId = getAuthSession()?.userId) {
  return `${KEY_PREFIX}-${userId || "guest"}`;
}

function safeRead(userId) {
  try {
    const raw = globalThis.sessionStorage?.getItem(resolveUserKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeWrite(userId, value) {
  try {
    globalThis.sessionStorage?.setItem(resolveUserKey(userId), JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getDocumentFavorites(userId) {
  return safeRead(userId).filter(Boolean);
}

export function isDocumentFavorite(documentId, userId) {
  if (!documentId) return false;
  return getDocumentFavorites(userId).includes(documentId);
}

export function toggleDocumentFavorite(documentId, userId) {
  if (!documentId) return false;
  const current = getDocumentFavorites(userId);
  const exists = current.includes(documentId);
  const next = exists
    ? current.filter((id) => id !== documentId)
    : [documentId, ...current];
  safeWrite(userId, next);
  return !exists;
}
