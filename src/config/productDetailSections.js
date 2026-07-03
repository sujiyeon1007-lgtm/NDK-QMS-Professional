/** 제품 상세 Popup — 필드 정의 */

export const PRODUCT_PROFILE_FIELDS = [
  { key: "partNo", label: "품번" },
  { key: "name", label: "품명" },
  { key: "company", label: "거래처" },
  { key: "material", label: "재질" },
  { key: "spec", label: "규격" },
  { key: "unitPriceLabel", label: "기본단가" },
  { key: "activeLabel", label: "상태", render: "active" },
];

export const PRODUCT_DETAIL_FIELDS = [
  { key: "code", label: "관리번호" },
  { key: "drawingNo", label: "도번" },
  { key: "process", label: "기본 공정" },
  { key: "unit", label: "기본 단위" },
  { key: "description", label: "제품 설명" },
  { key: "note", label: "비고" },
];

/** 메인 제품관리 리스트 컬럼 */
export const PRODUCT_LIST_COLUMNS = [
  { key: "partNo", label: "품번", widthPercent: 16 },
  { key: "name", label: "품명", widthPercent: 20 },
  { key: "company", label: "업체명", widthPercent: 16 },
  { key: "material", label: "재질", widthPercent: 12 },
  { key: "spec", label: "규격", widthPercent: 14 },
  { key: "activeLabel", label: "상태", widthPercent: 10, render: "active" },
];
