/**
 * Project TITAN V1.3 — 문서관리 확장 메타데이터 (folder · tags · description · validUntil)
 */

import {
  computeDocumentExpiryStatus,
  resolveDefaultFolder,
} from "../config/documentManagementV13";

const STORAGE_KEY = "project-titan-document-metadata-v1";

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
    /* SQLite 전환 전 임시 저장소 */
  }
}

function normalizeMetadata(entry = {}) {
  return {
    folder: String(entry.folder ?? "").trim(),
    tags: Array.isArray(entry.tags)
      ? entry.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    description: String(entry.description ?? "").trim(),
    validUntil: String(entry.validUntil ?? "").trim(),
  };
}

const DEMO_METADATA = {
  "doc-seoam-1-ws": {
    folder: "작업표준서",
    tags: ["#서암", "#열처리"],
    description: "이온질화 작업표준서",
    validUntil: "2026-08-15",
  },
  "doc-seoam-1-is": {
    folder: "검사기준서",
    tags: ["#서암", "#감사"],
    description: "경도 · 유효경화깊이 검사기준",
    validUntil: "2026-07-10",
  },
  "doc-seoam-4-ncr": {
    folder: "기타",
    tags: ["#긴급", "#NCR"],
    description: "경도 미달 NCR",
    validUntil: "2026-07-06",
  },
  "DRW-seoam-1-rev-seoam-1-b": {
    folder: "도면",
    tags: ["#서암", "#방산"],
    description: "고객 도면 Rev.01",
    validUntil: "2026-09-30",
  },
};

function ensureDemoMetadata(store) {
  let changed = false;
  Object.entries(DEMO_METADATA).forEach(([id, meta]) => {
    if (!store[id]) {
      store[id] = normalizeMetadata(meta);
      changed = true;
    }
  });
  return changed;
}

export function getAllDocumentMetadata() {
  const store = safeRead();
  if (ensureDemoMetadata(store)) {
    safeWrite(store);
  }
  return store;
}

export function getDocumentMetadata(documentId) {
  if (!documentId) return normalizeMetadata({});
  const store = getAllDocumentMetadata();
  return normalizeMetadata(store[documentId] ?? {});
}

export function saveDocumentMetadata(documentId, patch = {}) {
  if (!documentId) return normalizeMetadata({});
  const store = getAllDocumentMetadata();
  const next = normalizeMetadata({ ...store[documentId], ...patch });
  store[documentId] = next;
  safeWrite(store);
  return next;
}

export function enrichRegistryRow(row, { isPinned = false } = {}) {
  const meta = getDocumentMetadata(row.id);
  const folder = meta.folder || resolveDefaultFolder(row.documentType);
  const expiryStatus = computeDocumentExpiryStatus(meta.validUntil);
  return {
    ...row,
    folder,
    tags: meta.tags,
    description: meta.description || row.note || row.body || "",
    validUntil: meta.validUntil,
    isPinned: Boolean(isPinned),
    expiryStatus,
    expiryLabel: expiryStatus.label,
  };
}
