/**
 * Project TITAN Sprint 8 — 공정관리 (Process Master) 화면 config
 * Domain Master Workspace(2-Panel) — Material Master 패턴 재사용.
 */

/** 좌측 Process List 컬럼 */
export const PROCESS_LIST_COLUMNS = [
  { key: "name", label: "공정명", widthPercent: 34 },
  { key: "code", label: "공정코드", widthPercent: 22 },
  { key: "productCount", label: "연결 제품", widthPercent: 18, render: "meta" },
  { key: "activeLabel", label: "상태", widthPercent: 14, render: "active" },
];

/** 우측 Detail Workspace 탭 (7탭) */
export const PROCESS_DETAIL_TABS = [
  { id: "profile", label: "기본정보" },
  { id: "equipment", label: "연결 설비" },
  { id: "products", label: "적용 제품" },
  { id: "materials", label: "관련 재질" },
  { id: "lots", label: "최근 LOT" },
  { id: "standard", label: "표준정보" },
  { id: "updates", label: "최근 수정" },
];

/** ① 기본정보 */
export const PROCESS_PROFILE_FIELDS = [
  { key: "name", label: "공정명" },
  { key: "code", label: "공정코드" },
  { key: "description", label: "설명", span: 2 },
  { key: "activeLabel", label: "상태", render: "active" },
];

/** ② 연결 설비 테이블 */
export const PROCESS_EQUIPMENT_COLUMNS = [
  { key: "code", label: "설비코드" },
  { key: "name", label: "설비명" },
  { key: "equipType", label: "공정유형" },
  { key: "location", label: "위치" },
];

/** ③ 적용 제품 테이블 */
export const PROCESS_PRODUCT_COLUMNS = [
  { key: "partNo", label: "품번" },
  { key: "name", label: "품명" },
  { key: "company", label: "거래처" },
  { key: "material", label: "재질" },
  { key: "status", label: "상태" },
];

/** ④ 관련 재질 테이블 */
export const PROCESS_MATERIAL_COLUMNS = [
  { key: "name", label: "재질명" },
  { key: "spec", label: "규격" },
  { key: "productCount", label: "적용 제품" },
];

/** ⑤ 최근 LOT 테이블 */
export const PROCESS_LOT_COLUMNS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "partNo", label: "품번" },
  { key: "process", label: "현재공정" },
  { key: "status", label: "상태" },
];

/** ⑥ 표준정보 — 조회 전용 (향후 Recipe 연결 준비) */
export const PROCESS_STANDARD_FIELDS = [
  { key: "standardTime", label: "대표 처리시간" },
  { key: "representativeCondition", label: "대표 조건" },
  { key: "department", label: "담당부서" },
];
