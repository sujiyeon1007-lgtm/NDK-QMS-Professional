/**
 * Sprint 9 Phase 2 — 열처리 Recipe Master (Domain Master Workspace)
 * Blueprint §3.3 · §5.3 · §8
 */

export const RECIPE_STATUS_OPTIONS = [
  { value: "Draft", label: "초안" },
  { value: "Review", label: "검토중" },
  { value: "Approved", label: "승인" },
  { value: "Obsolete", label: "폐기" },
];

export const RECIPE_STATUS_LABELS = Object.fromEntries(
  RECIPE_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
);

/** 좌측 Recipe List 컬럼 */
export const RECIPE_LIST_COLUMNS = [
  { key: "name", label: "Recipe명", widthPercent: 26 },
  { key: "code", label: "Recipe코드", widthPercent: 22 },
  { key: "processName", label: "공정", widthPercent: 14 },
  { key: "materialName", label: "재질", widthPercent: 12 },
  { key: "versionNo", label: "Version", widthPercent: 10 },
  { key: "statusLabel", label: "Status", widthPercent: 10, render: "status" },
];

/** 우측 Detail Workspace 탭 (Blueprint §3.3) */
export const RECIPE_DETAIL_TABS = [
  { id: "profile", label: "기본정보" },
  { id: "conditions", label: "공정 조건" },
  { id: "masters", label: "연결 Master" },
  { id: "history", label: "적용 이력" },
  { id: "memo", label: "작업 메모" },
  { id: "version", label: "Version · Approval" },
  { id: "updates", label: "최근 수정" },
];

/** ① 기본정보 */
export const RECIPE_PROFILE_FIELDS = [
  { key: "name", label: "Recipe명" },
  { key: "code", label: "Recipe코드" },
  { key: "statusLabel", label: "Status" },
  { key: "versionNo", label: "Version" },
  { key: "processName", label: "공정" },
  { key: "templateLabel", label: "Recipe Template" },
  { key: "materialName", label: "재질" },
  { key: "description", label: "비고", span: 2 },
];

/** @deprecated Phase 2 Revision — Template Engine 사용. UI에서 직접 참조 ❌ */
export const RECIPE_TEMPERATURE_FIELDS = [];

/** @deprecated Phase 2 Revision — Template Engine 사용. UI에서 직접 참조 ❌ */
export const RECIPE_CYCLE_FIELDS = [];

/** ③ 연결 설비 */
export const RECIPE_EQUIPMENT_COLUMNS = [
  { key: "code", label: "설비코드" },
  { key: "name", label: "설비명" },
  { key: "equipType", label: "공정유형" },
  { key: "location", label: "위치" },
];

/** ③ 적용 제품 */
export const RECIPE_PRODUCT_COLUMNS = [
  { key: "partNo", label: "품번" },
  { key: "name", label: "품명" },
  { key: "company", label: "거래처" },
  { key: "material", label: "재질" },
  { key: "status", label: "상태" },
];

/** ④ 적용 이력 (LOT) */
export const RECIPE_LOT_COLUMNS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "partNo", label: "품번" },
  { key: "treatmentTemp", label: "실제 온도" },
  { key: "holdTimeMin", label: "실제 시간" },
  { key: "deviation", label: "편차" },
  { key: "status", label: "상태" },
];

/** ⑤ 작업 메모 */
export const RECIPE_MEMO_FIELDS = [
  { key: "workMemo", label: "작업 메모", span: 2 },
  { key: "cautionNote", label: "주의사항", span: 2 },
];

/** ⑥ Version · Approval Metadata (Blueprint §5.3.3) */
export const RECIPE_APPROVAL_FIELDS = [
  { key: "versionNo", label: "Version" },
  { key: "statusLabel", label: "Status" },
  { key: "approvedByName", label: "Approved By" },
  { key: "approvedDate", label: "Approved Date" },
  { key: "reviewComment", label: "Review Comment", span: 2 },
];
