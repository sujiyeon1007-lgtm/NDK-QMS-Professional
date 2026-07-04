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
