/**
 * Project TITAN V1.3 — 문서관리 최근 본 문서 (SessionStorage · 사용자별)
 */

import { formatDocumentRelativeTime } from "../config/documentManagementV13";
import { getAuthSession } from "./titanAuthSession";

const KEY_PREFIX = "project-titan-document-recent-v1";
export const MAX_RECENT_DOCUMENTS = 12;

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

export function getRecentDocuments(userId) {
  return safeRead(userId)
    .filter((item) => item?.documentId)
    .slice(0, MAX_RECENT_DOCUMENTS)
    .map((item) => ({
      ...item,
      relativeTime: formatDocumentRelativeTime(item.viewedAt),
    }));
}

export function addRecentDocument(entry, userId) {
  const documentId = String(entry?.documentId ?? "").trim();
  if (!documentId) return;

  const nextEntry = {
    documentId,
    title: String(entry.title ?? "").trim(),
    company: String(entry.company ?? "").trim(),
    documentNo: String(entry.documentNo ?? "").trim(),
    viewedAt: new Date().toISOString(),
  };

  const next = [
    nextEntry,
    ...getRecentDocuments(userId).filter((item) => item.documentId !== documentId),
  ].slice(0, MAX_RECENT_DOCUMENTS);

  safeWrite(userId, next);
}

export function clearRecentDocuments(userId) {
  safeWrite(userId, []);
}
