/**
 * Sprint 9 Phase 3 — Actual Work Record (실제 작업 조건) Model
 *
 * Blueprint §5.4 — 표준 Recipe(읽기 전용) vs 실제 작업 조건(작업자 입력) 분리.
 *
 * 입력 Parameter는 하드코딩하지 않습니다 — 선택한 Recipe의 Template(§5.3.0)에서 자동 생성됩니다.
 *
 * Code SSoT: `src/config/actualWorkRecordModel.js` · `src/utils/actualWorkRecordStore.js`
 */

/** Actual Work Status (PM V1.4): 작성중 → 작업중 → 완료 → 검사완료 */
export const AWR_STATUS_OPTIONS = [
  { value: "draft", label: "작성중" },
  { value: "in-progress", label: "작업중" },
  { value: "completed", label: "완료" },
  { value: "inspected", label: "검사완료" },
];

export const AWR_STATUS_VALUES = AWR_STATUS_OPTIONS.map((opt) => opt.value);

export const AWR_STATUS_LABELS = Object.fromEntries(
  AWR_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
);

/** 좌측 Actual Work Record List 컬럼 */
export const AWR_LIST_COLUMNS = [
  { key: "lotNo", label: "LOT.NO", widthPercent: 20 },
  { key: "recipeName", label: "표준 Recipe", widthPercent: 26 },
  { key: "processName", label: "공정", widthPercent: 14 },
  { key: "equipmentName", label: "설비", widthPercent: 12 },
  { key: "workerName", label: "작업자", widthPercent: 12 },
  { key: "statusLabel", label: "상태", widthPercent: 10, render: "status" },
];

/** 우측 Detail Workspace 탭 (Blueprint §5.4) */
export const AWR_DETAIL_TABS = [
  { id: "conditions", label: "실제 작업 조건" },
  { id: "reference", label: "표준 Recipe 참조" },
  { id: "work", label: "작업 정보" },
];

/** 작업 정보 (Master 참조 · 작업자 입력) */
export const AWR_WORK_FIELDS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "mesManagementNo", label: "관리번호" },
  { key: "equipmentName", label: "설비" },
  { key: "workerName", label: "작업자" },
  { key: "chargeStartAt", label: "장입 시작" },
  { key: "chargeEndAt", label: "장입 종료" },
  { key: "workMemo", label: "작업 메모", span: 2 },
];

/** 표준 Recipe 참조 (읽기 전용 · Snapshot) */
export const AWR_REFERENCE_FIELDS = [
  { key: "recipeName", label: "표준 Recipe" },
  { key: "recipeCode", label: "Recipe코드" },
  { key: "recipeVersionNo", label: "Recipe Version" },
  { key: "templateLabel", label: "Recipe Template" },
  { key: "processName", label: "공정" },
  { key: "materialName", label: "재질" },
];

export const AWR_SELECTION_KEY = "titan-awr-selected-id";
export const AWR_STORAGE_KEY = "project-titan-actual-work-record-v1";
