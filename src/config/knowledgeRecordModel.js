/**
 * Sprint 9 Phase 4 — Knowledge Record Model
 *
 * Blueprint §5.6 — Production(Actual Work Record) + Inspection 결과를
 * 하나의 기술 데이터로 LOT에 귀속.
 *
 * 핵심 원칙 (PM V1.5):
 *  - Store만 구현합니다 — 저장·조회만. Knowledge Engine · 추천 · 자동판정 ❌.
 *  - Recipe Snapshot(`recipeParameterSnapshot`) · Actual Snapshot(`actualParameters`)
 *    · Template Engine(§5.3.0) 구조를 그대로 재사용합니다.
 *
 * Code SSoT: `src/config/knowledgeRecordModel.js` · `src/utils/knowledgeRecordStore.js`
 */

/** 검사 판정 (Blueprint §5.5 · §5.6 passFail) */
export const KR_RESULT_OPTIONS = [
  { value: "PASS", label: "합격 (PASS)" },
  { value: "FAIL", label: "불합격 (FAIL)" },
  { value: "HOLD", label: "보류 (HOLD)" },
  { value: "REWORK", label: "재처리 (REWORK)" },
];

export const KR_RESULT_VALUES = KR_RESULT_OPTIONS.map((opt) => opt.value);

export const KR_RESULT_LABELS = Object.fromEntries(
  KR_RESULT_OPTIONS.map((opt) => [opt.value, opt.label])
);

/**
 * Inspection Result 입력 항목 (Blueprint §5.5)
 * 경도 · 유효경화깊이 · 경화깊이 · 외관 — Knowledge Record가 저장하는 검사 결과.
 * (heatTreatmentCalculations Engine 연계는 향후 Phase — 여기서는 값 저장만)
 */
export const KR_INSPECTION_FIELDS = [
  { key: "surfaceHardness", label: "표면경도", unit: "HV" },
  { key: "coreHardness", label: "심부경도", unit: "HV" },
  { key: "effectiveDepth", label: "유효경화깊이", unit: "mm" },
  { key: "caseDepth", label: "경화깊이", unit: "mm" },
  { key: "compoundLayer", label: "화합물층", unit: "µm" },
  { key: "appearance", label: "외관", unit: "" },
];

/** 좌측 Knowledge Record List 컬럼 */
export const KR_LIST_COLUMNS = [
  { key: "lotNo", label: "LOT.NO", widthPercent: 18 },
  { key: "partName", label: "품명", widthPercent: 20 },
  { key: "recipeName", label: "표준 Recipe", widthPercent: 22 },
  { key: "processName", label: "공정", widthPercent: 14 },
  { key: "inspectorName", label: "검사자", widthPercent: 12 },
  { key: "resultLabel", label: "판정", widthPercent: 14, render: "result" },
];

/** 우측 Detail Workspace 탭 (Blueprint §5.6) */
export const KR_DETAIL_TABS = [
  { id: "summary", label: "기술 요약" },
  { id: "conditions", label: "실제 작업 조건" },
  { id: "inspection", label: "검사 결과" },
  { id: "snapshot", label: "Snapshot" },
];

/** 기술 요약 필드 */
export const KR_SUMMARY_FIELDS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "mesManagementNo", label: "관리번호" },
  { key: "company", label: "업체" },
  { key: "partName", label: "품명" },
  { key: "partNo", label: "품번" },
  { key: "quantity", label: "수량" },
  { key: "recipeName", label: "표준 Recipe" },
  { key: "recipeVersionNo", label: "Recipe Version" },
  { key: "templateLabel", label: "Recipe Template" },
  { key: "processName", label: "공정" },
  { key: "materialName", label: "재질" },
  { key: "equipmentName", label: "설비" },
  { key: "workerName", label: "작업자" },
  { key: "inspectorName", label: "검사자" },
  { key: "inspectedAt", label: "검사일시" },
];

export const KR_SELECTION_KEY = "titan-knowledge-record-selected-id";
export const KR_STORAGE_KEY = "project-titan-knowledge-record-v1";
