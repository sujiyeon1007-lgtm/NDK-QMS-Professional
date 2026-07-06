/**
 * Project TITAN — 기준 문서 통합 Registry (문서관리 전용)
 * productDrawingSession · qualityNoticeSession 집계
 */

import { resolveQualityDocumentType } from "../config/qualityDocumentManagement";
import { getProductDrawingRecords } from "./productDrawingSession";
import { getQualityNotices } from "./qualityNoticeSession";
import { findProductByPartNo, getMasterDataByCategory } from "./masterData";

function resolveProductLabel(productId, partNo) {
  const product =
    getMasterDataByCategory("products").find((row) => row.id === productId) ??
    findProductByPartNo(partNo);
  return {
    partNo: partNo || product?.partNo || "—",
    partName: product?.name || product?.partName || "—",
    company: product?.company || "—",
  };
}

function buildDrawingRows(record) {
  const meta = resolveProductLabel(record.productId, record.partNo);
  return (record.revisions ?? []).map((revision) => ({
    id: `DRW-${record.productId}-${revision.id}`,
    source: "drawing-revision",
    documentType: "drawing",
    documentTypeLabel: "도면",
    documentNo: revision.drawingNo || meta.partNo || "—",
    partNo: meta.partNo,
    partName: meta.partName,
    company: meta.company,
    productId: record.productId,
    revisionId: revision.id,
    title: revision.drawingNo || meta.partNo,
    revision: revision.revision || "—",
    revisionDate: revision.revisionDate || "—",
    registeredDate: revision.revisionDate || revision.createdAt?.slice(0, 10) || "—",
    approver: revision.registeredBy || revision.updatedBy || "—",
    approvalStatus: revision.isCurrent ? "현행" : "이력",
    pdfFileName: revision.fileName || "",
    hasPdf: Boolean(revision.dataUrl || revision.fileName),
    dataUrl: revision.dataUrl || "",
    mimeType: revision.mimeType || "",
    historyCount: (record.history ?? []).length,
    registeredBy: revision.registeredBy || "—",
    updatedAt: revision.createdAt || "",
  }));
}

function buildRelatedDocumentRows(record) {
  const meta = resolveProductLabel(record.productId, record.partNo);
  return (record.documents ?? []).map((document) => ({
    id: `REL-${record.productId}-${document.id}`,
    source: "related-document",
    documentType: document.type,
    documentTypeLabel: document.typeLabel || resolveQualityDocumentType(document.type).label,
    documentNo: document.documentNo?.trim() || document.title?.trim() || document.fileName || document.id,
    partNo: meta.partNo,
    partName: meta.partName,
    company: meta.company,
    productId: record.productId,
    documentId: document.id,
    title: document.title || document.fileName || document.typeLabel,
    revision: document.revision?.trim() || "—",
    revisionDate: document.updatedAt ? String(document.updatedAt).slice(0, 10) : "—",
    registeredDate: document.updatedAt ? String(document.updatedAt).slice(0, 10) : "—",
    approver: document.registeredBy || document.updatedBy || "—",
    approvalStatus: "등록",
    pdfFileName: document.fileName || "",
    hasPdf: Boolean(document.dataUrl || document.fileName),
    dataUrl: document.dataUrl || "",
    mimeType: document.mimeType || "",
    historyCount: (record.history ?? []).length,
    registeredBy: document.registeredBy || "—",
    updatedAt: document.updatedAt || "",
  }));
}

function buildNoticeRows(notice) {
  const product = notice.relatedPartNo ? findProductByPartNo(notice.relatedPartNo) : null;
  return {
    id: notice.id,
    source: "quality-notice",
    noticeId: notice.id,
    documentType: notice.documentType,
    documentTypeLabel: notice.documentTypeLabel,
    documentNo: notice.id,
    partNo: notice.relatedPartNo || "—",
    partName: product?.name || product?.partName || "—",
    company: product?.company || "—",
    title: notice.title,
    revision: "—",
    revisionDate: notice.effectiveDate || notice.createdDate,
    registeredDate: notice.createdDate || notice.effectiveDate || "—",
    approver: notice.author || "—",
    approvalStatus: notice.statusLabel,
    pdfFileName: notice.attachments?.[0]?.name || "",
    hasPdf: Boolean(notice.attachments?.length),
    dataUrl: notice.attachments?.[0]?.dataUrl || "",
    mimeType: notice.attachments?.[0]?.mimeType || "",
    historyCount: 0,
    registeredBy: notice.author || "—",
    updatedAt: notice.updatedAt || "",
    body: notice.body,
  };
}

export function getQualityDocumentRegistryRows() {
  const drawingRows = getProductDrawingRecords().flatMap((record) => [
    ...buildDrawingRows(record),
    ...buildRelatedDocumentRows(record),
  ]);
  const noticeRows = getQualityNotices().map(buildNoticeRows);
  return [...drawingRows, ...noticeRows].sort((a, b) =>
    String(b.revisionDate || b.updatedAt).localeCompare(String(a.revisionDate || a.updatedAt))
  );
}

export function getQualityDocumentTypeCounts(rows = getQualityDocumentRegistryRows()) {
  const counts = {};
  rows.forEach((row) => {
    const key = row.documentTypeLabel || row.documentType;
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return counts;
}

import { matchesBasicSearch } from "../config/listSearchStandard";

export function matchesQualityDocumentSearch(row, search) {
  if (!matchesBasicSearch(search, row)) return false;

  const includes = (value, query) => {
    const q = String(query ?? "").trim().toLowerCase();
    if (!q) return true;
    return String(value ?? "").toLowerCase().includes(q);
  };

  if (!includes(row.title, search.title)) return false;
  if (!includes(row.documentNo, search.documentNo)) return false;
  if (!includes(row.documentTypeLabel, search.documentType)) return false;
  if (!includes(row.revision, search.revision)) return false;
  if (!includes(row.approver, search.approver)) return false;
  if (search.approvalStatus && row.approvalStatus !== search.approvalStatus) return false;
  return true;
}
