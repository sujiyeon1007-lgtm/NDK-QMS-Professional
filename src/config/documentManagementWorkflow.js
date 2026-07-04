/**
 * Project TITAN (PQMS) — 문서관리 Workflow (최종 확정)
 * Master First · One Source of Truth · 제품 중심
 *
 * @see src/config/masterFirstArchitecture.js
 * @see src/utils/productDocumentStatus.js
 */

export const DOCUMENT_MANAGEMENT_WORKFLOW_REVISION = "1-final";
export const DOCUMENT_MANAGEMENT_WORKFLOW_DATE = "2026-07-03";

/** 검색 → 제품 리스트 → Row 선택 → 하단 Master-Detail · Popup 문서현황 */
export const DOCUMENT_MANAGEMENT_WORKFLOW = [
  "검색",
  "제품 리스트 조회",
  "Row 선택",
  "하단 상세정보",
  "문서관리 Popup",
];

export const DOCUMENT_MANAGEMENT_DESIGN_PRINCIPLE =
  "메인 List 조회 · Popup 문서현황 관리 · Master First · One Source of Truth";

/** 문서현황 관리 필드 (Workflow V1.0) */
export const PRODUCT_DOCUMENT_STATUS_FIELDS = [
  "문서명",
  "등록 여부",
  "상태(Status)",
  "Revision",
  "승인자",
  "등록일",
  "최종 수정일",
  "보기",
  "등록",
  "다운로드",
  "비고",
];

/** 제품 Master → 문서관리 연결 (향후 입고·품질·출고 자동 연동) */
export const PRODUCT_DOCUMENT_HUB_FLOW = [
  "제품 Master",
  "문서관리",
  "도면",
  "검사기준서",
  "작업표준서",
  "관리계획서",
  "FMEA",
  "기타 문서",
];

export const PRODUCT_DOCUMENT_FUTURE_AUTO_LINK = [
  "입고현황 → 품번 선택",
  "제품 Master",
  "문서 자동 연결",
  "품질관리",
  "성적서",
  "출고현황",
];

/** 제품 선택 시 우측 문서현황 행 (고정 9종) */
export const PRODUCT_DOCUMENT_STATUS_TYPES = [
  { documentType: "drawing", label: "도면", registerRoute: "drawing" },
  { documentType: "inspection_standard", label: "검사기준서", registerRoute: "inspection" },
  { documentType: "work_standard", label: "작업표준서", registerRoute: "related" },
  { documentType: "control_plan", label: "관리계획서", registerRoute: "related" },
  { documentType: "fmea", label: "FMEA", registerRoute: "related" },
  { documentType: "customer_requirement", label: "고객 요구사항", registerRoute: "related" },
  { documentType: "concession", label: "특채 승인서", registerRoute: "related" },
  { documentType: "ncr", label: "NCR 문서", registerRoute: "related" },
  { documentType: "quality_other", label: "기타 문서", registerRoute: "related" },
];

/** @deprecated tab-per-type UI — use PRODUCT_DOCUMENT_STATUS_TYPES */
export const DOCUMENT_MANAGEMENT_LEGACY_TAB_MODE = false;
