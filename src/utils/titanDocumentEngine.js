/**
 * Project TITAN V2.0 — Titan Document Engine (TDE) Interface
 *
 * 출력관리(Print Workspace) 전용 문서 엔진 인터페이스.
 *
 * 목적:
 *   - 출력관리 Workspace가 소비하는 "문서 목록/카운트"의 단일 진입점.
 *   - 현재(V2.0)는 Operations Workspace(SessionStorage) 데이터를 집계.
 *   - 향후 실제 Document Engine(TDE)이 동일 인터페이스(getDocumentCategories ·
 *     getCategoryDocuments · resolvePrintTarget)를 그대로 구현하도록 교체 → UI 불변.
 *
 * 데이터 흐름:
 *   TitanDataEngine / Operations Workspace
 *     → TitanDocumentEngine (문서 정규화 · 카테고리 집계)
 *       → 출력관리 Workspace (Print Workspace)
 *         → 공통 Print Preview (InOutList · Statement · Certificate ...)
 */

import {
  buildIncomingTaskWorkspaceRecords,
  buildOutgoingCompletedWorkspaceRecords,
  buildOutgoingTaskWorkspaceRecords,
} from "./operationsWorkspaceData";
import { getCertificateMenuListRows } from "./certificateStatus";
import { getQualityDocumentRegistryRows } from "./qualityDocumentRegistry";
import { getStockQty, getIncomingQty, getShippedQty } from "./inventory";

/** TDE 문서 카테고리 ID (문서 종류 SSOT) */
export const DOCUMENT_ENGINE_CATEGORY_IDS = {
  INBOUND_LIST: "inboundList",
  OUTBOUND_LIST: "outboundList",
  CERTIFICATE: "certificate",
  TRANSACTION_STATEMENT: "transactionStatement",
  OTHER_DOCUMENT: "otherDocument",
};

/** 미리보기 dispatch 종류 — Print Workspace가 해석 */
export const DOCUMENT_PREVIEW_KIND = {
  IN_OUT_LIST: "inOutList",
  STATEMENT: "statement",
  NAVIGATE: "navigate",
};

/**
 * 문서 카테고리 정의 (TDE Interface 계약)
 * @typedef {object} DocumentCategoryDef
 * @property {string} id
 * @property {string} label
 * @property {string} docCode
 * @property {string} description
 * @property {string} previewKind
 * @property {string} [navigateTo]
 */

/** @type {DocumentCategoryDef[]} */
export const DOCUMENT_ENGINE_CATEGORIES = [
  {
    id: DOCUMENT_ENGINE_CATEGORY_IDS.INBOUND_LIST,
    label: "입고리스트",
    docCode: "DOC-01",
    description: "입고 현황 리스트 (입고 완료 기준)",
    previewKind: DOCUMENT_PREVIEW_KIND.IN_OUT_LIST,
  },
  {
    id: DOCUMENT_ENGINE_CATEGORY_IDS.OUTBOUND_LIST,
    label: "출고리스트",
    docCode: "DOC-05",
    description: "출고 대기 제품 리스트",
    previewKind: DOCUMENT_PREVIEW_KIND.IN_OUT_LIST,
  },
  {
    id: DOCUMENT_ENGINE_CATEGORY_IDS.CERTIFICATE,
    label: "검사성적서",
    docCode: "DOC-03",
    description: "검사 성적서 (성적서관리 발행)",
    previewKind: DOCUMENT_PREVIEW_KIND.NAVIGATE,
    navigateTo: "/quality/certificate",
  },
  {
    id: DOCUMENT_ENGINE_CATEGORY_IDS.TRANSACTION_STATEMENT,
    label: "거래명세서",
    docCode: "DOC-04",
    description: "출고 완료 제품 거래명세서",
    previewKind: DOCUMENT_PREVIEW_KIND.STATEMENT,
  },
  {
    id: DOCUMENT_ENGINE_CATEGORY_IDS.OTHER_DOCUMENT,
    label: "기타 문서",
    docCode: "DOC-ETC",
    description: "도면 · 검사기준서 · 품질공지 등 품질문서",
    previewKind: DOCUMENT_PREVIEW_KIND.NAVIGATE,
    navigateTo: "/documents",
  },
];

export function getDocumentEngineCategories() {
  return DOCUMENT_ENGINE_CATEGORIES;
}

export function getDocumentEngineCategory(categoryId) {
  return DOCUMENT_ENGINE_CATEGORIES.find((category) => category.id === categoryId) ?? null;
}

function toDocumentRow(categoryId, fields) {
  return {
    categoryId,
    id: fields.id,
    docNo: fields.docNo || "발행 대기",
    title: fields.title || "—",
    managementId: fields.managementId || "—",
    company: fields.company || "—",
    partName: fields.partName || "—",
    partNo: fields.partNo || "—",
    lotNo: fields.lotNo || "—",
    qtyLabel: fields.qtyLabel || "—",
    date: fields.date || "—",
    statusLabel: fields.statusLabel || "—",
    record: fields.record ?? null,
  };
}

function mapIncomingListDocuments() {
  return buildIncomingTaskWorkspaceRecords().map((record) =>
    toDocumentRow(DOCUMENT_ENGINE_CATEGORY_IDS.INBOUND_LIST, {
      id: record.id,
      docNo: record.htlNo || record.inboundListLastPrintedAt ? record.htlNo || "재출력 가능" : "미출력",
      title: "입고 리스트",
      managementId: record.mesManagementNo || record.id,
      company: record.company,
      partName: record.partName,
      partNo: record.partNo,
      lotNo: record.lotNo?.trim() || "—",
      qtyLabel: `${getIncomingQty(record).toLocaleString("ko-KR")} ${record.unit || "EA"}`,
      date: record.incomingDate,
      statusLabel: record.workSheetGenerated ? "출력완료" : "미출력",
      record,
    })
  );
}

function mapOutboundListDocuments() {
  return buildOutgoingTaskWorkspaceRecords().map((record) =>
    toDocumentRow(DOCUMENT_ENGINE_CATEGORY_IDS.OUTBOUND_LIST, {
      id: record.id,
      docNo: "출고 대기",
      title: "출고 리스트",
      managementId: record.mesManagementNo || record.id,
      company: record.company,
      partName: record.partName,
      partNo: record.partNo,
      lotNo: record.lotNo?.trim() || "—",
      qtyLabel: `${getStockQty(record).toLocaleString("ko-KR")} ${record.unit || "EA"}`,
      date: record.incomingDate,
      statusLabel: "출고대기",
      record,
    })
  );
}

function mapTransactionStatementDocuments() {
  return buildOutgoingCompletedWorkspaceRecords().map((record) =>
    toDocumentRow(DOCUMENT_ENGINE_CATEGORY_IDS.TRANSACTION_STATEMENT, {
      id: record.id,
      docNo: record.transactionStatementNo || record.statementNo || "발행 대기",
      title: "거래명세서",
      managementId: record.mesManagementNo || record.id,
      company: record.company,
      partName: record.partName,
      partNo: record.partNo,
      lotNo: record.lotNo?.trim() || "—",
      qtyLabel: `${getShippedQty(record).toLocaleString("ko-KR")} ${record.unit || "EA"}`,
      date: record.shipmentDate || record.incomingDate,
      statusLabel: record.transactionStatementPrinted ? "발행완료" : "발행 대기",
      record,
    })
  );
}

function mapCertificateDocuments() {
  return getCertificateMenuListRows().map((row) =>
    toDocumentRow(DOCUMENT_ENGINE_CATEGORY_IDS.CERTIFICATE, {
      id: row.id,
      docNo: row.certificateNo || row.docNo || "발행 대기",
      title: "검사성적서",
      managementId: row.managementId || row.id,
      company: row.company,
      partName: row.partName,
      partNo: row.partNo,
      lotNo: row.lotNo,
      qtyLabel: row.qtyLabel || row.workQtyLabel || "—",
      date: row.incomingDate || row.registeredDate,
      statusLabel: row.statusLabel,
      record: row.entry ?? row,
    })
  );
}

function mapOtherDocuments() {
  return getQualityDocumentRegistryRows().map((row, index) =>
    toDocumentRow(DOCUMENT_ENGINE_CATEGORY_IDS.OTHER_DOCUMENT, {
      id: row.id || `doc-${index}`,
      docNo: row.documentNo || row.revision || "—",
      title: row.documentName || row.title || row.documentTypeLabel || "품질문서",
      managementId: row.documentTypeLabel || "—",
      company: row.company,
      partName: row.partName,
      partNo: row.partNo,
      lotNo: "—",
      qtyLabel: "—",
      date: row.revisionDate || row.updatedAt,
      statusLabel: row.statusLabel || row.documentTypeLabel || "등록",
      record: row,
    })
  );
}

/**
 * TDE Interface — 카테고리별 문서 목록
 * @param {string} categoryId
 * @returns {object[]}
 */
export function getCategoryDocuments(categoryId) {
  switch (categoryId) {
    case DOCUMENT_ENGINE_CATEGORY_IDS.INBOUND_LIST:
      return mapIncomingListDocuments();
    case DOCUMENT_ENGINE_CATEGORY_IDS.OUTBOUND_LIST:
      return mapOutboundListDocuments();
    case DOCUMENT_ENGINE_CATEGORY_IDS.CERTIFICATE:
      return mapCertificateDocuments();
    case DOCUMENT_ENGINE_CATEGORY_IDS.TRANSACTION_STATEMENT:
      return mapTransactionStatementDocuments();
    case DOCUMENT_ENGINE_CATEGORY_IDS.OTHER_DOCUMENT:
      return mapOtherDocuments();
    default:
      return [];
  }
}

/**
 * TDE Interface — 전체 카테고리 요약 (count + 문서 목록)
 * @returns {(DocumentCategoryDef & { count: number, documents: object[] })[]}
 */
export function getDocumentCategorySummaries() {
  return DOCUMENT_ENGINE_CATEGORIES.map((category) => {
    const documents = getCategoryDocuments(category.id);
    return { ...category, count: documents.length, documents };
  });
}
