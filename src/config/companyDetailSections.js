/** 업체 상세 Popup — 섹션 필드 정의 (향후 DB·폼 확장) */

export const COMPANY_PROFILE_FIELDS = [
  { key: "name", label: "업체명" },
  { key: "bizNo", label: "사업자번호" },
  { key: "ceo", label: "대표자", future: true },
  { key: "address", label: "주소" },
  { key: "phone", label: "전화번호" },
  { key: "manager", label: "담당자" },
  { key: "managerPhone", label: "담당자 연락처", future: true },
  { key: "email", label: "메일" },
  { key: "activeLabel", label: "거래상태", render: "active" },
  { key: "note", label: "비고" },
];

export const COMPANY_ROLE_CONTACT_FIELDS = [
  { key: "qualityContact", label: "품질 담당", future: true },
  { key: "purchaseContact", label: "구매 담당", future: true },
  { key: "productionContact", label: "생산 담당", future: true },
  { key: "shippingContact", label: "출하 담당", future: true },
  { key: "otherContact", label: "기타 담당자", future: true },
];

/** 메인 거래처관리 리스트 컬럼 (업체명 · 코드 · 담당자 · 상태) */
export const COMPANY_LIST_COLUMNS = [
  { key: "name", label: "업체명", widthPercent: 34 },
  { key: "code", label: "코드", widthPercent: 14 },
  { key: "manager", label: "담당자", widthPercent: 22 },
  { key: "activeLabel", label: "상태", widthPercent: 12, render: "active" },
];
