/**
 * Project TITAN (PQMS) — 문서관리 화면 설정
 * Workflow V1.0 — 제품 중심 단일 화면 (tab-per-type ❌)
 *
 * @see src/config/documentManagementWorkflow.js
 */

/** @deprecated tab-per-type — use PRODUCT_DOCUMENT_STATUS_TYPES in documentManagementWorkflow.js */
export const DOCUMENT_MANAGEMENT_TABS = [];

export function resolveDocumentManagementTab() {
  return "management";
}

export function getDocumentManagementTab() {
  return { id: "management", label: "문서관리", path: "/documents" };
}

export function getDocumentTypeForTab() {
  return null;
}

export function isDedicatedDocumentPage() {
  return false;
}
