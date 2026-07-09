import {
  normalizeFoundationAttachment,
  normalizeFoundationAttachments,
  readFoundationAttachmentSession,
  writeFoundationAttachmentSession,
} from "./foundationAttachmentEngine";

const DOCUMENT_ATTACHMENT_BUCKET_KEY = "titan-document-foundation-attachments-v1";
const BASE_ATTACHMENT_PREFIX = "DOC-BASE";

function getDocumentAttachmentOwnerKey(row) {
  return String(row?.id ?? "").trim();
}

function buildBaseDocumentAttachment(row) {
  const name = String(row?.pdfFileName || row?.fileName || "").trim();
  if (!row || !name) return null;

  return normalizeFoundationAttachment({
    id: `${BASE_ATTACHMENT_PREFIX}-${row.id}`,
    name,
    attachmentType: row.documentType || "document",
    mimeType: row.mimeType,
    dataUrl: row.dataUrl,
    uploadedAt: row.updatedAt || row.registeredDate,
    uploadedBy: row.registeredBy,
    memo: "문서 등록 원본 파일",
    isBaseDocumentAttachment: true,
  });
}

export function isBaseDocumentAttachment(attachment) {
  return Boolean(attachment?.isBaseDocumentAttachment || String(attachment?.id ?? "").startsWith(BASE_ATTACHMENT_PREFIX));
}

export function getDocumentManagedAttachments(row) {
  const ownerKey = getDocumentAttachmentOwnerKey(row);
  if (!ownerKey) return [];
  return readFoundationAttachmentSession(DOCUMENT_ATTACHMENT_BUCKET_KEY, ownerKey);
}

export function getDocumentFoundationAttachments(row) {
  const baseAttachment = buildBaseDocumentAttachment(row);
  return [baseAttachment, ...getDocumentManagedAttachments(row)].filter(Boolean);
}

export function getDocumentFoundationAttachmentCount(row) {
  return getDocumentFoundationAttachments(row).length;
}

export function appendDocumentFoundationAttachments(row, files = []) {
  const ownerKey = getDocumentAttachmentOwnerKey(row);
  if (!ownerKey) return [];
  const nextAttachments = [
    ...getDocumentManagedAttachments(row),
    ...normalizeFoundationAttachments(files),
  ];
  writeFoundationAttachmentSession(DOCUMENT_ATTACHMENT_BUCKET_KEY, ownerKey, nextAttachments);
  return getDocumentFoundationAttachments(row);
}

export function deleteDocumentFoundationAttachment(row, attachmentId) {
  const ownerKey = getDocumentAttachmentOwnerKey(row);
  if (!ownerKey || String(attachmentId ?? "").startsWith(BASE_ATTACHMENT_PREFIX)) {
    return getDocumentFoundationAttachments(row);
  }
  const nextAttachments = getDocumentManagedAttachments(row).filter(
    (attachment) => attachment.id !== attachmentId
  );
  writeFoundationAttachmentSession(DOCUMENT_ATTACHMENT_BUCKET_KEY, ownerKey, nextAttachments);
  return getDocumentFoundationAttachments(row);
}
