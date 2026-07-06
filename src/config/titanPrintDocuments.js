/**
 * Project TITAN V1.0 — 출력 문서 유형 · Preview 시스템 구분
 *
 * 입고/출고 리스트만 공통 입출고 Preview를 공유한다.
 * 거래명세서·생산일보·성적서는 각각 전용 양식·전용 Preview를 사용한다.
 */

export const TITAN_PRINT_PREVIEW_SYSTEM = {
  IN_OUT_LIST: "in-out-list",
  DEDICATED: "dedicated",
};

export const TITAN_PRINT_DOCUMENT_TYPES = {
  INBOUND_LIST: "inbound-list",
  OUTBOUND_LIST: "outbound-list",
  TRANSACTION_STATEMENT: "transaction-statement",
  PRODUCTION_DAILY_REPORT: "production-daily-report",
  CERTIFICATE: "certificate",
  INSPECTION_REPORT: "inspection-report",
};

/** @type {Record<string, { previewSystem: string, label: string }>} */
export const TITAN_PRINT_DOCUMENT_META = {
  [TITAN_PRINT_DOCUMENT_TYPES.INBOUND_LIST]: {
    previewSystem: TITAN_PRINT_PREVIEW_SYSTEM.IN_OUT_LIST,
    label: "입고 리스트 (열처리 작업 요청 리스트)",
  },
  [TITAN_PRINT_DOCUMENT_TYPES.OUTBOUND_LIST]: {
    previewSystem: TITAN_PRINT_PREVIEW_SYSTEM.IN_OUT_LIST,
    label: "출고 리스트",
  },
  [TITAN_PRINT_DOCUMENT_TYPES.TRANSACTION_STATEMENT]: {
    previewSystem: TITAN_PRINT_PREVIEW_SYSTEM.DEDICATED,
    label: "거래명세서",
  },
  [TITAN_PRINT_DOCUMENT_TYPES.PRODUCTION_DAILY_REPORT]: {
    previewSystem: TITAN_PRINT_PREVIEW_SYSTEM.DEDICATED,
    label: "열처리일보",
  },
  [TITAN_PRINT_DOCUMENT_TYPES.CERTIFICATE]: {
    previewSystem: TITAN_PRINT_PREVIEW_SYSTEM.DEDICATED,
    label: "성적서",
  },
  [TITAN_PRINT_DOCUMENT_TYPES.INSPECTION_REPORT]: {
    previewSystem: TITAN_PRINT_PREVIEW_SYSTEM.DEDICATED,
    label: "검사 리포트",
  },
};

export function getPrintDocumentMeta(documentType) {
  return TITAN_PRINT_DOCUMENT_META[documentType] ?? null;
}

export function usesInOutListPreview(documentType) {
  return getPrintDocumentMeta(documentType)?.previewSystem === TITAN_PRINT_PREVIEW_SYSTEM.IN_OUT_LIST;
}
