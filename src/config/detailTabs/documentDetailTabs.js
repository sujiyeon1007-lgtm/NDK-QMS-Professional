export const DOCUMENT_DETAIL_TAB_IDS = Object.freeze({
  basicInfo: "basicInfo",
  attachments: "attachments",
  revisionHistory: "revisionHistory",
  relatedDocuments: "relatedDocuments",
  qr: "qr",
  memo: "memo",
});

export const QUALITY_DOCUMENT_DETAIL_TABS = Object.freeze([
  { id: DOCUMENT_DETAIL_TAB_IDS.basicInfo, label: "기본정보" },
  { id: DOCUMENT_DETAIL_TAB_IDS.attachments, label: "첨부파일" },
  { id: DOCUMENT_DETAIL_TAB_IDS.revisionHistory, label: "Rev 이력" },
  { id: DOCUMENT_DETAIL_TAB_IDS.relatedDocuments, label: "관련문서" },
  { id: DOCUMENT_DETAIL_TAB_IDS.qr, label: "QR" },
  { id: DOCUMENT_DETAIL_TAB_IDS.memo, label: "메모" },
]);

export const INTERNAL_DOCUMENT_DETAIL_TABS = Object.freeze([
  { id: DOCUMENT_DETAIL_TAB_IDS.basicInfo, label: "기본정보" },
  { id: DOCUMENT_DETAIL_TAB_IDS.attachments, label: "첨부파일" },
  { id: DOCUMENT_DETAIL_TAB_IDS.relatedDocuments, label: "관련문서" },
  { id: DOCUMENT_DETAIL_TAB_IDS.qr, label: "QR" },
  { id: DOCUMENT_DETAIL_TAB_IDS.memo, label: "메모" },
]);

const INTERNAL_DOCUMENT_TYPES = new Set([
  "purchase_order",
  "customer_drawing",
  "release_slip",
  "mtc",
  "customer_request",
  "supplier_transaction_statement",
  "tax_invoice",
  "transaction_statement",
  "outbound_slip",
  "contract",
  "quotation",
  "meeting_material",
  "photo",
  "internal_other",
]);

export function getDocumentDetailTabs(row) {
  return INTERNAL_DOCUMENT_TYPES.has(row?.documentType)
    ? INTERNAL_DOCUMENT_DETAIL_TABS
    : QUALITY_DOCUMENT_DETAIL_TABS;
}
