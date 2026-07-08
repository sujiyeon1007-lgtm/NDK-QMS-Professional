/** 제품 상세 Popup — 필드 정의 */

/** 2열 균형 배치 — 좌: 업체·품번·규격·상태 / 우: 품명·재질·단가·단위 */
export const PRODUCT_PROFILE_FIELDS = [
  { key: "company", label: "업체명" },
  { key: "name", label: "품명" },
  { key: "partNo", label: "품번" },
  { key: "material", label: "재질" },
  { key: "spec", label: "규격" },
  { key: "unitPriceLabel", label: "기본단가" },
  { key: "activeLabel", label: "상태", render: "active" },
  { key: "unit", label: "기본단위" },
];

export const PRODUCT_DETAIL_FIELDS = [
  { key: "code", label: "관리번호" },
  { key: "drawingNo", label: "도번" },
  { key: "process", label: "기본 공정" },
  { key: "description", label: "제품 설명" },
  { key: "note", label: "비고" },
];

/**
 * 메인 제품관리 리스트 — 실무 조회 순서 (업체 → 품명 → 품번 → 재질 → 규격 → 상태)
 */
export const PRODUCT_LIST_COLUMNS = [
  { key: "company", label: "업체명", widthPercent: 22 },
  { key: "name", label: "품명", widthPercent: 24 },
  { key: "partNo", label: "품번", widthPercent: 14 },
  { key: "material", label: "재질", widthPercent: 12 },
  { key: "spec", label: "규격", widthPercent: 14 },
  { key: "activeLabel", label: "상태", widthPercent: 8, render: "active" },
];

/**
 * Sprint 8 · Product Master 리스트 — ERP/MES 조회 컬럼
 * 품번 · 품명 · 거래처 · 재질 · 대표공정 · 상태 · 최근 생산 · 최근 수정
 */
export const PRODUCT_MASTER_LIST_COLUMNS = [
  { key: "partNo", label: "품번", widthPercent: 14 },
  { key: "name", label: "품명", widthPercent: 18 },
  { key: "company", label: "거래처", widthPercent: 16 },
  { key: "material", label: "재질", widthPercent: 10 },
  { key: "process", label: "대표공정", widthPercent: 10 },
  { key: "activeLabel", label: "상태", widthPercent: 8, render: "active" },
  { key: "recentProduction", label: "최근 생산", widthPercent: 12, render: "meta" },
  { key: "recentUpdate", label: "최근 수정", widthPercent: 12, render: "meta" },
];

/**
 * Sprint 8 · Product Master 상세 Popup 탭 (9탭 · Blueprint V1.0)
 * 기본정보 · 재질 · 공정 · 생산 · 품질 · 성적서(TDE) · LOT · 출고 · 최근 수정
 */
export const PRODUCT_DETAIL_TABS = [
  { id: "profile", label: "기본정보" },
  { id: "material", label: "재질" },
  { id: "process", label: "공정" },
  { id: "spec", label: "품질 Specification" },
  { id: "production", label: "생산" },
  { id: "quality", label: "품질" },
  { id: "certificate", label: "성적서" },
  { id: "lots", label: "LOT" },
  { id: "shipments", label: "출고" },
  { id: "updates", label: "최근 수정" },
];

/** ① 기본정보 필드 */
export const PRODUCT_MASTER_PROFILE_FIELDS = [
  { key: "name", label: "품명" },
  { key: "partNo", label: "품번" },
  { key: "company", label: "거래처" },
  { key: "material", label: "재질" },
  { key: "spec", label: "규격" },
  { key: "drawingNo", label: "도면번호" },
  { key: "activeLabel", label: "상태", render: "active" },
  { key: "code", label: "관리번호" },
];

/** ② 재질 필드 (productMasterDetail.material) */
export const PRODUCT_MATERIAL_FIELDS = [
  { key: "primary", label: "대표 재질" },
  { key: "secondary", label: "대체 재질" },
  { key: "heatCondition", label: "열처리 조건", span: 2 },
  { key: "note", label: "비고", span: 2 },
];

/** ③ 공정 필드 (productMasterDetail.process) */
export const PRODUCT_PROCESS_FIELDS = [
  { key: "flow", label: "공정 Flow", span: 2 },
  { key: "name", label: "공정명" },
  { key: "equipment", label: "설비" },
  { key: "standardTime", label: "표준시간" },
  { key: "department", label: "담당부서" },
];

/** ④ 생산 요약 필드 */
export const PRODUCT_PRODUCTION_SUMMARY_FIELDS = [
  { key: "lotCount", label: "생산 LOT", render: "count" },
  { key: "recent", label: "최근 생산" },
  { key: "running", label: "진행중", render: "count" },
  { key: "done", label: "완료", render: "count" },
];

/** ④ 생산 LOT 테이블 */
export const PRODUCT_PRODUCTION_COLUMNS = [
  { key: "managementId", label: "관리번호" },
  { key: "lotNo", label: "LOT.NO" },
  { key: "process", label: "현재공정" },
  { key: "workDate", label: "작업일" },
  { key: "qty", label: "수량" },
];

/** ⑤ 품질 요약 필드 */
export const PRODUCT_QUALITY_SUMMARY_FIELDS = [
  { key: "count", label: "검사건수", render: "count" },
  { key: "pass", label: "합격", render: "count" },
  { key: "fail", label: "불합격", render: "count" },
  { key: "recent", label: "최근 검사" },
];

/** ⑤ 품질(검사) 테이블 */
export const PRODUCT_QUALITY_COLUMNS = [
  { key: "inspectionDate", label: "검사일" },
  { key: "lotNo", label: "LOT.NO" },
  { key: "managementId", label: "관리번호" },
  { key: "judgment", label: "판정", render: "judgment" },
];

/** ⑥ 성적서(TDE) 요약 필드 — 조회 전용 */
export const PRODUCT_CERTIFICATE_SUMMARY_FIELDS = [
  { key: "recent", label: "최근 발행" },
  { key: "count", label: "발행 횟수", render: "count" },
  { key: "template", label: "Template" },
  { key: "pdf", label: "PDF" },
];

/** ⑥ 성적서 테이블 — 조회 전용 (발행 버튼 없음) */
export const PRODUCT_CERTIFICATE_COLUMNS = [
  { key: "registeredDate", label: "발행일" },
  { key: "managementId", label: "관리번호" },
  { key: "lotNo", label: "LOT.NO" },
  { key: "fileName", label: "파일" },
];

/** ⑦ LOT 테이블 */
export const PRODUCT_LOT_COLUMNS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "managementId", label: "관리번호" },
  { key: "process", label: "현재공정" },
  { key: "progress", label: "진행률" },
  { key: "status", label: "상태" },
];

/** ⑧ 출고 테이블 */
export const PRODUCT_SHIPMENT_COLUMNS = [
  { key: "shippedAt", label: "출고일" },
  { key: "shipQty", label: "수량" },
  { key: "shippedBy", label: "담당자" },
  { key: "company", label: "거래처" },
];
