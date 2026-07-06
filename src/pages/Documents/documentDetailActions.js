import { appendDocumentChangeLog } from "../../utils/documentChangeLogSession";
import {
  downloadDocumentFile,
  downloadRevisionFile,
  getProductDrawingRecords,
} from "../../utils/productDrawingSession";

export function resolveRevisionRecord(row) {
  if (!row?.productId) return null;
  const bundle = getProductDrawingRecords().find((item) => item.productId === row.productId);
  if (!bundle) return null;
  if (row.revisionId) {
    return bundle.revisions?.find((item) => item.id === row.revisionId) ?? null;
  }
  if (row.documentId) {
    return bundle.documents?.find((item) => item.id === row.documentId) ?? null;
  }
  return null;
}

export function downloadDocumentRow(row) {
  if (!row) return false;
  const payload = resolveRevisionRecord(row);
  if (!row.hasPdf && !row.dataUrl) {
    window.alert("다운로드할 파일이 없습니다.");
    return false;
  }
  if (row.source === "drawing-revision" && payload) {
    downloadRevisionFile(payload, row.documentNo || row.title);
    appendDocumentChangeLog(row.id, "다운로드", row.title);
    return true;
  }
  if (row.source === "related-document" && payload) {
    downloadDocumentFile(payload, row.title);
    appendDocumentChangeLog(row.id, "다운로드", row.title);
    return true;
  }
  if (row.dataUrl) {
    const anchor = document.createElement("a");
    anchor.href = row.dataUrl;
    anchor.download = row.pdfFileName || row.title || "document";
    anchor.click();
    appendDocumentChangeLog(row.id, "다운로드", row.title);
    return true;
  }
  return false;
}

export function openDocumentRow(row) {
  if (!row?.dataUrl) {
    window.alert("열 수 있는 파일이 없습니다.");
    return false;
  }
  window.open(row.dataUrl, "_blank", "noopener,noreferrer");
  appendDocumentChangeLog(row.id, "파일 열기", row.title);
  return true;
}

/** 문서 Detail Popup — 기본정보/Header 공통 표시 필드 */
export function formatDocumentDetailFields(row, companyName = "") {
  if (!row) return null;

  const attachmentName = String(row.pdfFileName ?? "").trim();

  return {
    company: String(companyName || row.company || "").trim() || "—",
    title: String(row.title ?? "").trim() || "—",
    documentNo: String(row.documentNo ?? "").trim() || "—",
    revision: String(row.revision ?? "").trim() || "—",
    documentTypeLabel:
      String(row.documentTypeLabel ?? row.folder ?? "").trim() || "—",
    registeredDate:
      String(row.registeredDate ?? row.revisionDate ?? "").trim() || "—",
    registeredBy: String(row.registeredBy ?? row.approver ?? "").trim() || "—",
    approvalStatus: String(row.approvalStatus ?? "등록").trim() || "등록",
    description:
      String(row.description ?? row.note ?? row.body ?? "").trim() || "—",
    attachmentLabel: attachmentName || (row.hasPdf ? "등록됨" : "—"),
    attachmentName,
  };
}
