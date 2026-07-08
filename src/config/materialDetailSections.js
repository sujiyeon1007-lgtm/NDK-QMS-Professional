/**
 * Project TITAN Sprint 8 — 재질관리 (Material Master) 화면 config
 * Domain Master Workspace(2-Panel) 공통 UI의 기준 정의.
 * ⑤ Process · ⑥ Equipment · ⑦ Worker Master 에서 동일 패턴 재사용.
 */

/** 좌측 Material List 컬럼 — 재질명 · 규격 · 연결 제품 수 · 상태 */
export const MATERIAL_LIST_COLUMNS = [
  { key: "name", label: "재질명", widthPercent: 34 },
  { key: "spec", label: "규격", widthPercent: 30 },
  { key: "productCount", label: "연결 제품", widthPercent: 18, render: "meta" },
  { key: "activeLabel", label: "상태", widthPercent: 14, render: "active" },
];

/** 우측 Detail Workspace 탭 (7탭) */
export const MATERIAL_DETAIL_TABS = [
  { id: "profile", label: "기본정보" },
  { id: "heat", label: "열처리 조건" },
  { id: "products", label: "적용 제품" },
  { id: "processes", label: "관련 공정" },
  { id: "lots", label: "관련 LOT" },
  { id: "certificate", label: "성적서 기준" },
  { id: "updates", label: "최근 수정" },
];

/** ① 기본정보 필드 (material row) */
export const MATERIAL_PROFILE_FIELDS = [
  { key: "name", label: "재질명" },
  { key: "code", label: "재질코드" },
  { key: "spec", label: "규격" },
  { key: "activeLabel", label: "상태", render: "active" },
  { key: "note", label: "설명", span: 2 },
];

/** ② 열처리 조건 필드 (materialMasterDetail.heatTreatment) */
export const MATERIAL_HEAT_FIELDS = [
  { key: "hardness", label: "경도" },
  { key: "effectiveDepth", label: "유효경화깊이" },
  { key: "representativeProcess", label: "대표 공정" },
  { key: "temperature", label: "온도 · 열처리 조건" },
  { key: "note", label: "비고", span: 2 },
];

/** ③ 적용 제품 테이블 */
export const MATERIAL_PRODUCT_COLUMNS = [
  { key: "partNo", label: "품번" },
  { key: "name", label: "품명" },
  { key: "company", label: "거래처" },
  { key: "spec", label: "규격" },
  { key: "status", label: "상태" },
];

/** ④ 관련 공정 테이블 */
export const MATERIAL_PROCESS_COLUMNS = [
  { key: "name", label: "공정명" },
  { key: "code", label: "공정코드" },
  { key: "productCount", label: "적용 제품" },
];

/** ⑤ 관련 LOT 테이블 */
export const MATERIAL_LOT_COLUMNS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "partNo", label: "품번" },
  { key: "process", label: "현재공정" },
  { key: "status", label: "상태" },
];

/** ⑥ 성적서 기준 필드 — 조회 전용 (TDE 연결 준비) */
export const MATERIAL_CERTIFICATE_FIELDS = [
  { key: "template", label: "Template" },
  { key: "testStandard", label: "시험 기준" },
  { key: "judgmentStandard", label: "판정 기준" },
  { key: "count", label: "발행 성적서", render: "count" },
];
