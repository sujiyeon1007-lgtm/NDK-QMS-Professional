/**
 * Project TITAN V1.3 — 문서관리 CRUD · Revision (Registry + Session 연동)
 */

import { resolveQualityDocumentType } from "../config/qualityDocumentManagement";
import { appendDocumentChangeLog } from "./documentChangeLogSession";
import { saveDocumentMetadata } from "./documentMetadataSession";
import { getMasterDataByCategory } from "./masterData";
import {
  addDrawingRevision,
  addRelatedDocument,
  deleteDrawingRevision,
  deleteRelatedDocument,
  replaceRelatedDocument,
} from "./productDrawingSession";
import { deleteQualityNotice } from "./qualityNoticeSession";

function resolveCompanyProducts(companyName) {
  const trimmed = String(companyName ?? "").trim();
  return getMasterDataByCategory("products").filter(
    (product) => String(product.company ?? "").trim() === trimmed
  );
}

function nextRevisionLabel(current = "") {
  const match = String(current).match(/(\d+)/);
  if (!match) return "Rev.01";
  const next = Number(match[1]) + 1;
  return `Rev.${String(next).padStart(2, "0")}`;
}

export function getCompanyProductsForDocumentRegister(companyName) {
  return resolveCompanyProducts(companyName).map((product) => ({
    id: product.id,
    partNo: product.partNo,
    partName: product.name || product.partName || product.partNo,
    label: `${product.partNo} · ${product.name || product.partName || ""}`.trim(),
  }));
}

export function registerCompanyDocument(companyName, payload = {}) {
  const products = resolveCompanyProducts(companyName);
  const product =
    products.find((row) => row.id === payload.productId) ?? products[0] ?? null;
  if (!product) {
    return { ok: false, message: "등록 가능한 제품이 없습니다." };
  }

  const typeMeta = resolveQualityDocumentType(payload.documentType || payload.type);
  const documentPayload = {
    type: typeMeta.value,
    title: payload.title,
    documentNo: payload.documentNo,
    revision: payload.revision || "Rev.01",
    note: payload.description || payload.note,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    dataUrl: payload.dataUrl,
  };

  const result = addRelatedDocument(product.id, documentPayload);
  if (!result.ok) return result;

  const registryId = `REL-${product.id}-${result.document.id}`;
  saveDocumentMetadata(registryId, {
    folder: payload.folder,
    tags: payload.tags,
    description: payload.description,
    validUntil: payload.validUntil,
  });
  appendDocumentChangeLog(registryId, "문서 등록", `${payload.title || result.document.title}`);

  return { ok: true, documentId: registryId, productId: product.id };
}

export function updateCompanyDocument(row, payload = {}) {
  if (!row?.productId || !row?.documentId) {
    return { ok: false, message: "수정할 문서를 찾을 수 없습니다." };
  }

  const typeMeta = resolveQualityDocumentType(payload.documentType || row.documentType);
  const result = replaceRelatedDocument(row.productId, row.documentId, {
    type: typeMeta.value,
    title: payload.title ?? row.title,
    documentNo: payload.documentNo ?? row.documentNo,
    revision: payload.revision ?? row.revision,
    note: payload.description ?? row.description,
    fileName: payload.fileName ?? row.pdfFileName,
    mimeType: payload.mimeType ?? row.mimeType,
    dataUrl: payload.dataUrl ?? row.dataUrl,
  });
  if (!result.ok) return result;

  saveDocumentMetadata(row.id, {
    folder: payload.folder,
    tags: payload.tags,
    description: payload.description,
    validUntil: payload.validUntil,
  });
  appendDocumentChangeLog(row.id, "문서 수정", payload.title || row.title);

  return { ok: true };
}

export function deleteCompanyDocument(row) {
  if (row.source === "related-document" && row.productId && row.documentId) {
    const result = deleteRelatedDocument(row.productId, row.documentId);
    if (!result.ok) return result;
    appendDocumentChangeLog(row.id, "문서 삭제", row.title);
    return { ok: true };
  }
  if (row.source === "drawing-revision" && row.productId && row.revisionId) {
    const result = deleteDrawingRevision(row.productId, row.revisionId);
    if (!result.ok) return result;
    appendDocumentChangeLog(row.id, "Revision 삭제", row.title);
    return { ok: true };
  }
  if (row.source === "quality-notice" && (row.noticeId || row.id)) {
    deleteQualityNotice(row.noticeId || row.id);
    appendDocumentChangeLog(row.id, "문서 삭제", row.title);
    return { ok: true };
  }
  return { ok: false, message: "삭제할 수 없는 문서입니다." };
}

export function registerDocumentRevision(row, payload = {}) {
  if (row.source === "drawing-revision" && row.productId) {
    const result = addDrawingRevision(row.productId, {
      drawingNo: payload.documentNo || row.documentNo,
      revision: payload.revision,
      revisionDate: payload.revisionDate,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      dataUrl: payload.dataUrl,
      note: payload.description,
    });
    if (!result.ok) return result;
    const revision = result.revision;
    const registryId = `DRW-${row.productId}-${revision.id}`;
    saveDocumentMetadata(registryId, {
      folder: row.folder,
      tags: row.tags,
      description: payload.description || row.description,
      validUntil: payload.validUntil || row.validUntil,
    });
    appendDocumentChangeLog(registryId, `${payload.revision || revision.revision} 등록`, row.documentNo);
    return { ok: true, documentId: registryId };
  }

  if (row.source === "related-document" && row.productId) {
    const nextRevision = payload.revision || nextRevisionLabel(row.revision);
    const result = addRelatedDocument(row.productId, {
      type: row.documentType,
      title: payload.title || row.title,
      documentNo: row.documentNo,
      revision: nextRevision,
      note: payload.description || row.description,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      dataUrl: payload.dataUrl,
    });
    if (!result.ok) return result;
    const registryId = `REL-${row.productId}-${result.document.id}`;
    saveDocumentMetadata(registryId, {
      folder: row.folder,
      tags: row.tags,
      description: payload.description || row.description,
      validUntil: payload.validUntil || row.validUntil,
    });
    appendDocumentChangeLog(registryId, `${nextRevision} 등록`, row.documentNo);
    return { ok: true, documentId: registryId };
  }

  return { ok: false, message: "Revision을 등록할 수 없는 문서입니다." };
}
