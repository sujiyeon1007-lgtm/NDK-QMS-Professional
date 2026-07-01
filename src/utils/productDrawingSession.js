/**
 * Project TITAN V1.0 — 제품별 도면 · 개정 이력 · 관련 문서 SessionStorage
 */

import { findProductByPartNo, getMasterDataByCategory } from "./masterData";
import { getCurrentTitanUser } from "./titanHistorySession";

const STORAGE_KEY = "project-titan-product-drawings-v1";
const LEGACY_INSPECTION_KEY = "project-titan-product-inspection-v1";

export const DRAWING_ACCEPT = ["application/pdf", "image/jpeg", "image/png"];

export const RELATED_DOCUMENT_TYPES = [
  { value: "drawing", label: "도면" },
  { value: "sop", label: "SOP" },
  { value: "inspection_standard", label: "검사기준서" },
  { value: "customer_spec", label: "고객사양서" },
  { value: "photo", label: "제품사진" },
  { value: "other", label: "기타" },
];

function createRevisionId() {
  return `DR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createDocumentId() {
  return `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeRevision(revision = {}, isCurrent = false) {
  return {
    id: revision.id || createRevisionId(),
    drawingNo: revision.drawingNo?.trim() ?? "",
    revision: revision.revision?.trim() ?? "",
    revisionDate: revision.revisionDate?.trim() ?? "",
    fileName: revision.fileName?.trim() ?? "",
    mimeType: revision.mimeType?.trim() ?? "",
    dataUrl: revision.dataUrl ?? "",
    note: revision.note?.trim() ?? "",
    registeredBy: revision.registeredBy?.trim() || getCurrentTitanUser(),
    updatedBy: revision.updatedBy?.trim() || revision.registeredBy?.trim() || getCurrentTitanUser(),
    createdAt: revision.createdAt || new Date().toISOString(),
    isCurrent: Boolean(isCurrent),
  };
}

function normalizePhoto(photo = {}) {
  if (!photo?.dataUrl && !photo?.fileName) return null;
  return {
    fileName: photo.fileName?.trim() ?? "",
    mimeType: photo.mimeType?.trim() ?? "",
    dataUrl: photo.dataUrl ?? "",
    updatedBy: photo.updatedBy?.trim() || getCurrentTitanUser(),
    updatedAt: photo.updatedAt || new Date().toISOString(),
  };
}

function normalizeHistoryEntry(entry = {}) {
  const now = new Date();
  const registeredDate =
    entry.registeredDate?.trim() ||
    entry.date?.trim() ||
    (entry.createdAt ? String(entry.createdAt).slice(0, 10) : now.toISOString().slice(0, 10));
  const updatedDate =
    entry.updatedDate?.trim() ||
    entry.date?.trim() ||
    (entry.updatedAt ? String(entry.updatedAt).slice(0, 10) : registeredDate);

  return {
    id: entry.id || `HIS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: entry.category?.trim() || "product",
    action: entry.action?.trim() || "",
    summary: entry.summary?.trim() || "",
    registeredBy: entry.registeredBy?.trim() || getCurrentTitanUser(),
    updatedBy: entry.updatedBy?.trim() || entry.registeredBy?.trim() || getCurrentTitanUser(),
    registeredDate,
    updatedDate,
    date: updatedDate,
    createdAt: entry.createdAt || now.toISOString(),
    updatedAt: entry.updatedAt || entry.createdAt || now.toISOString(),
  };
}

function normalizeDocument(document = {}) {
  const typeMeta = RELATED_DOCUMENT_TYPES.find((item) => item.value === document.type);
  return {
    id: document.id || createDocumentId(),
    type: document.type?.trim() || "other",
    typeLabel: typeMeta?.label ?? "기타",
    title: document.title?.trim() ?? "",
    fileName: document.fileName?.trim() ?? "",
    mimeType: document.mimeType?.trim() ?? "",
    dataUrl: document.dataUrl ?? "",
    note: document.note?.trim() ?? "",
    registeredBy: document.registeredBy?.trim() || getCurrentTitanUser(),
    updatedBy: document.updatedBy?.trim() || document.registeredBy?.trim() || getCurrentTitanUser(),
    createdAt: document.createdAt || new Date().toISOString(),
    updatedAt: document.updatedAt || document.createdAt || new Date().toISOString(),
  };
}

function normalizeRecord(record = {}) {
  const revisions = (record.revisions ?? []).map((row) => normalizeRevision(row));
  let currentRevisionId = record.currentRevisionId || "";
  if (!currentRevisionId && revisions.length > 0) {
    const marked = revisions.find((row) => row.isCurrent);
    currentRevisionId = marked?.id ?? revisions[revisions.length - 1].id;
  }
  const normalizedRevisions = revisions
    .map((row) => ({ ...row, isCurrent: row.id === currentRevisionId }))
    .sort((a, b) => String(b.revisionDate || b.createdAt).localeCompare(String(a.revisionDate || a.createdAt)));

  return {
    productId: record.productId || "",
    partNo: record.partNo?.trim() || "",
    currentRevisionId,
    revisions: normalizedRevisions,
    documents: (record.documents ?? []).map(normalizeDocument),
    productPhoto: normalizePhoto(record.productPhoto),
    history: (record.history ?? []).map(normalizeHistoryEntry),
  };
}

function appendHistory(productId, entry) {
  const record = findRecord(productId);
  const historyEntry = normalizeHistoryEntry(entry);
  if (record) {
    const next = { ...record, history: [historyEntry, ...record.history] };
    sessionRecords = sessionRecords.map((row) => (row.productId === productId ? next : row));
  } else {
    sessionRecords = [
      ...sessionRecords,
      normalizeRecord({
        productId,
        partNo: getMasterDataByCategory("products").find((row) => row.id === productId)?.partNo ?? "",
        revisions: [],
        documents: [],
        history: [historyEntry],
      }),
    ];
  }
  persistRecords();
  return historyEntry;
}

function getSeedRecords() {
  const products = getMasterDataByCategory("products");
  const sample = products.find((row) => row.partNo === "WS-2210-F") ?? products[0];
  if (!sample) return [];

  const revA = normalizeRevision(
    {
      id: "DR-SEED-A",
      drawingNo: sample.drawingNo || "204B1144P0001",
      revision: "A",
      revisionDate: "2026-01-10",
      fileName: "",
      mimeType: "",
      dataUrl: "",
      note: "초기 등록",
      registeredBy: "관리자",
    },
    false
  );
  const revB = normalizeRevision(
    {
      id: "DR-SEED-B",
      drawingNo: sample.drawingNo || "204B1144P0001",
      revision: "B",
      revisionDate: "2026-03-15",
      fileName: "",
      mimeType: "",
      dataUrl: "",
      note: "치수 변경",
      registeredBy: "관리자",
    },
    false
  );
  const revC = normalizeRevision(
    {
      id: "DR-SEED-C",
      drawingNo: sample.drawingNo || "204B1144P0001",
      revision: "C",
      revisionDate: "2026-06-20",
      fileName: "",
      mimeType: "",
      dataUrl: "",
      note: "금일 반영",
      registeredBy: "관리자",
    },
    true
  );

  return [
    normalizeRecord({
      productId: sample.id,
      partNo: sample.partNo,
      currentRevisionId: revC.id,
      revisions: [revA, revB, revC],
      documents: [],
    }),
  ];
}

function migrateLegacyInspectionDrawings(records) {
  try {
    const raw = sessionStorage.getItem(LEGACY_INSPECTION_KEY);
    if (!raw) return records;
    const inspections = JSON.parse(raw);
    if (!Array.isArray(inspections)) return records;

    const merged = [...records];
    inspections.forEach((inspection) => {
      const drawing = inspection?.drawing;
      if (!drawing || (!drawing.dataUrl && !drawing.drawingNo && !drawing.revision)) return;

      const productId = inspection.productId;
      if (!productId) return;

      const existingIndex = merged.findIndex((row) => row.productId === productId);
      const revision = normalizeRevision(
        {
          drawingNo: drawing.drawingNo,
          revision: drawing.revision || "A",
          revisionDate: drawing.revisionDate,
          fileName: drawing.fileName,
          mimeType: drawing.mimeType,
          dataUrl: drawing.dataUrl,
        },
        true
      );

      if (existingIndex >= 0) {
        const current = merged[existingIndex];
        const hasSameRev = current.revisions.some(
          (row) =>
            row.revision === revision.revision &&
            row.drawingNo === revision.drawingNo &&
            row.revisionDate === revision.revisionDate
        );
        if (hasSameRev) return;
        merged[existingIndex] = normalizeRecord({
          ...current,
          revisions: [...current.revisions.map((row) => ({ ...row, isCurrent: false })), revision],
          currentRevisionId: revision.id,
        });
        return;
      }

      merged.push(
        normalizeRecord({
          productId,
          partNo: inspection.partNo,
          currentRevisionId: revision.id,
          revisions: [revision],
          documents: [],
        })
      );
    });
    return merged;
  } catch {
    return records;
  }
}

function loadRecords() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return migrateLegacyInspectionDrawings(getSeedRecords());
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return migrateLegacyInspectionDrawings(getSeedRecords());
    }
    return migrateLegacyInspectionDrawings(parsed.map(normalizeRecord));
  } catch {
    return migrateLegacyInspectionDrawings(getSeedRecords());
  }
}

let sessionRecords = loadRecords();

function persistRecords() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionRecords));
  } catch {
    /* session quota */
  }
}

function findRecord(productId) {
  if (!productId) return null;
  return sessionRecords.find((row) => row.productId === productId) ?? null;
}

export function getProductDrawingRecords() {
  return sessionRecords.map(normalizeRecord);
}

export function getProductDrawingRecord(productId) {
  return findRecord(productId);
}

export function getProductDrawingByPartNo(partNo) {
  const product = findProductByPartNo(partNo);
  if (!product) return null;
  return findRecord(product.id);
}

export function getDrawingRevisionHistory(productId) {
  const record = findRecord(productId);
  return record?.revisions ?? [];
}

export function getCurrentDrawingRevision(productId) {
  const record = findRecord(productId);
  if (!record) return null;
  return record.revisions.find((row) => row.id === record.currentRevisionId) ?? record.revisions[0] ?? null;
}

export function getRelatedDocuments(productId) {
  return findRecord(productId)?.documents ?? [];
}

export function getProductPhoto(productId) {
  return findRecord(productId)?.productPhoto ?? null;
}

export function getProductHistory(productId) {
  return findRecord(productId)?.history ?? [];
}

export function logProductChange(productId, entry) {
  return appendHistory(productId, entry);
}

export function setProductPhoto(productId, photoPayload) {
  const product = getMasterDataByCategory("products").find((row) => row.id === productId);
  if (!product) return { ok: false, message: "제품을 찾을 수 없습니다." };

  const photo = normalizePhoto({
    ...photoPayload,
    updatedBy: getCurrentTitanUser(),
    updatedAt: new Date().toISOString(),
  });

  const existing = findRecord(productId);
  if (existing) {
    sessionRecords = sessionRecords.map((row) =>
      row.productId === productId ? { ...row, productPhoto: photo } : row
    );
  } else {
    sessionRecords = [
      ...sessionRecords,
      normalizeRecord({ productId, partNo: product.partNo, revisions: [], documents: [], productPhoto: photo }),
    ];
  }

  appendHistory(productId, {
    category: "product",
    action: "제품 사진 등록",
    summary: photo?.fileName || "제품 사진",
  });
  return { ok: true, photo };
}

export function readDrawingFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    if (!DRAWING_ACCEPT.includes(file.type)) {
      reject(new Error("PDF, JPG, PNG 파일만 등록할 수 있습니다."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        fileName: file.name,
        mimeType: file.type,
        dataUrl: typeof reader.result === "string" ? reader.result : "",
      });
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

export function addDrawingRevision(productId, payload) {
  const product = getMasterDataByCategory("products").find((row) => row.id === productId);
  if (!product) {
    return { ok: false, message: "제품을 찾을 수 없습니다." };
  }
  if (!payload.revision?.trim()) {
    return { ok: false, message: "Revision을 입력하세요." };
  }

  const revision = normalizeRevision(
    {
      drawingNo: payload.drawingNo?.trim() || product.drawingNo || "",
      revision: payload.revision,
      revisionDate: payload.revisionDate,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      dataUrl: payload.dataUrl,
      note: payload.note,
    },
    true
  );

  const existing = findRecord(productId);
  if (existing) {
    const nextRecord = normalizeRecord({
      ...existing,
      currentRevisionId: revision.id,
      revisions: [...existing.revisions.map((row) => ({ ...row, isCurrent: false })), revision],
    });
    sessionRecords = sessionRecords.map((row) => (row.productId === productId ? nextRecord : row));
  } else {
    sessionRecords = [
      ...sessionRecords,
      normalizeRecord({
        productId,
        partNo: product.partNo,
        currentRevisionId: revision.id,
        revisions: [revision],
        documents: [],
      }),
    ];
  }

  appendHistory(productId, {
    category: "revision",
    action: "Revision 등록",
    summary: `Rev ${revision.revision}${revision.fileName ? ` · ${revision.fileName}` : ""}`,
  });
  return { ok: true, revision: getCurrentDrawingRevision(productId) };
}

export function restoreDrawingRevision(productId, revisionId) {
  const record = findRecord(productId);
  if (!record) {
    return { ok: false, message: "도면 이력을 찾을 수 없습니다." };
  }
  const target = record.revisions.find((row) => row.id === revisionId);
  if (!target) {
    return { ok: false, message: "선택한 Revision을 찾을 수 없습니다." };
  }

  const nextRecord = normalizeRecord({
    ...record,
    currentRevisionId: revisionId,
    revisions: record.revisions.map((row) => ({ ...row, isCurrent: row.id === revisionId })),
  });
  sessionRecords = sessionRecords.map((row) => (row.productId === productId ? nextRecord : row));
  appendHistory(productId, {
    category: "revision",
    action: "Revision 복원",
    summary: `Rev ${target.revision}`,
  });
  return { ok: true, revision: getCurrentDrawingRevision(productId) };
}

export function addRelatedDocument(productId, payload) {
  const product = getMasterDataByCategory("products").find((row) => row.id === productId);
  if (!product) {
    return { ok: false, message: "제품을 찾을 수 없습니다." };
  }
  if (!payload.title?.trim()) {
    return { ok: false, message: "문서명을 입력하세요." };
  }

  const document = normalizeDocument(payload);
  const existing = findRecord(productId);
  if (existing) {
    const nextRecord = {
      ...existing,
      documents: [...existing.documents, document],
    };
    sessionRecords = sessionRecords.map((row) => (row.productId === productId ? nextRecord : row));
  } else {
    sessionRecords = [
      ...sessionRecords,
      normalizeRecord({
        productId,
        partNo: product.partNo,
        revisions: [],
        documents: [document],
      }),
    ];
  }

  appendHistory(productId, {
    category: "document",
    action: "관련 문서 등록",
    summary: `${document.typeLabel} · ${document.title}`,
  });
  return { ok: true, document };
}

export function replaceRelatedDocument(productId, documentId, payload) {
  const record = findRecord(productId);
  if (!record) {
    return { ok: false, message: "관련 문서를 찾을 수 없습니다." };
  }
  const target = record.documents.find((doc) => doc.id === documentId);
  if (!target) {
    return { ok: false, message: "교체 대상 문서를 찾을 수 없습니다." };
  }
  if (!payload.title?.trim()) {
    return { ok: false, message: "문서명을 입력하세요." };
  }

  const updated = normalizeDocument({
    ...target,
    ...payload,
    id: documentId,
  });
  sessionRecords = sessionRecords.map((row) =>
    row.productId === productId
      ? {
          ...row,
          documents: row.documents.map((doc) => (doc.id === documentId ? updated : doc)),
        }
      : row
  );
  appendHistory(productId, {
    category: "document",
    action: "관련 문서 교체",
    summary: `${updated.typeLabel} · ${updated.title}`,
  });
  return { ok: true, document: updated };
}

export function deleteRelatedDocument(productId, documentId) {
  const record = findRecord(productId);
  if (!record) {
    return { ok: false, message: "관련 문서를 찾을 수 없습니다." };
  }
  sessionRecords = sessionRecords.map((row) =>
    row.productId === productId
      ? { ...row, documents: row.documents.filter((doc) => doc.id !== documentId) }
      : row
  );
  persistRecords();
  return { ok: true };
}

export function deleteProductDrawingRecord(productId) {
  sessionRecords = sessionRecords.filter((row) => row.productId !== productId);
  persistRecords();
}

export function downloadRevisionFile(revision, fallbackName = "drawing") {
  if (!revision?.dataUrl) return;
  const link = document.createElement("a");
  link.href = revision.dataUrl;
  link.download = revision.fileName || fallbackName;
  link.click();
}

export function downloadDocumentFile(document, fallbackName = "document") {
  if (!document?.dataUrl) return;
  const link = document.createElement("a");
  link.href = document.dataUrl;
  link.download = document.fileName || fallbackName;
  link.click();
}
