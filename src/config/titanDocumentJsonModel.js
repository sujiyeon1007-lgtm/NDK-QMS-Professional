/**
 * Sprint 9 Phase 5 — TITAN Document JSON Model (TDE Interface)
 *
 * Blueprint §6.2.1 — TITAN이 생성 · TDE가 수신·Rendering하는 Document JSON 구조.
 *
 * 핵심 원칙 (PM V1.7):
 *  - TITAN: Document JSON **생성** (업무 데이터 · Snapshot · Source)
 *  - TDE: JSON **수신** → Header/Body/Table/Graph/Photo/Approval/Footer Rendering **만**
 *  - TDE Engine **본 Phase 구현 ❌** — Schema · Interface 정의만
 *
 * Code SSoT: `src/config/titanDocumentJsonModel.js` · `src/utils/titanDocumentJsonBuilder.js`
 */

/** Document JSON Schema Version */
export const TITAN_DOCUMENT_JSON_SCHEMA_VERSION = "1.0";

/** TDE Rendering Slot IDs (순서 고정) */
export const TDE_RENDER_SLOTS = [
  "header",
  "body",
  "table",
  "graph",
  "photo",
  "approval",
  "footer",
];

/** Document 종류 (Phase 5: technology-summary만 생성) */
export const TITAN_DOCUMENT_TYPES = {
  TECHNOLOGY_SUMMARY: "technology-summary",
  COA: "coa",
  INSPECTION_REPORT: "inspection-report",
};

export const TITAN_DOCUMENT_TYPE_LABELS = {
  [TITAN_DOCUMENT_TYPES.TECHNOLOGY_SUMMARY]: "Technology Summary",
  [TITAN_DOCUMENT_TYPES.COA]: "성적서 (COA)",
  [TITAN_DOCUMENT_TYPES.INSPECTION_REPORT]: "검사 리포트",
};

/** Knowledge Source 필드 (§5.6.3 필수) */
export const TITAN_DOCUMENT_SOURCE_KEYS = [
  "lotNo",
  "mesManagementNo",
  "actualWorkRecordId",
  "knowledgeRecordId",
  "recipeVersionNo",
  "templateId",
  "templateVersionNo",
];

/** LOT Lifecycle Technology Summary 표시 항목 (§6.1.1) */
export const LOT_LIFECYCLE_DISPLAY_FIELDS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "mesManagementNo", label: "관리번호" },
  { key: "recipeName", label: "표준 Recipe" },
  { key: "recipeVersionNo", label: "Recipe Version" },
  { key: "templateLabel", label: "Recipe Template" },
  { key: "processName", label: "공정" },
  { key: "representativeTemp", label: "대표 처리온도" },
  { key: "representativeTime", label: "대표 처리시간" },
  { key: "deviationJudgment", label: "편차 판정" },
  { key: "inspectionResult", label: "검사 판정" },
];

/** Document JSON Table 컬럼 (표준 vs 실제 vs 편차) */
export const TITAN_DOCUMENT_TABLE_COLUMNS = [
  { key: "label", label: "항목" },
  { key: "standard", label: "표준 (Recipe)" },
  { key: "actual", label: "실제 (작업)" },
  { key: "deviation", label: "편차" },
];

/** 편차 판정 (Blueprint §6.1.1 · 규칙 기반 · AI ❌) */
export const DEVIATION_JUDGMENT_LABELS = {
  normal: "정상",
  check: "확인 필요",
  review: "관리 필요",
};

/** Document JSON Payload 블록 (PM Phase 5 · TDE 전달 데이터) */
export const TITAN_DOCUMENT_PAYLOAD_KEYS = [
  "customer",
  "product",
  "material",
  "productSpecificationSnapshot",
  "recipeSnapshot",
  "actualWorkSnapshot",
  "inspectionResult",
  "knowledgeSummary",
  "lotInfo",
];

/** LOT Lifecycle Knowledge Summary Block 표시 (PM Phase 5) */
export const LOT_KNOWLEDGE_SUMMARY_BLOCK_FIELDS = [
  { key: "recipeName", label: "사용 Recipe" },
  { key: "recipeVersionNo", label: "Recipe Version" },
  { key: "actualWorkSummary", label: "실제 작업 조건 요약" },
  { key: "inspectionSummary", label: "검사 결과 요약" },
  { key: "knowledgeRecordId", label: "Knowledge Record" },
];

export const TITAN_DOCUMENT_JSON_STORAGE_KEY = "project-titan-document-json-v1";
