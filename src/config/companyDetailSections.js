/** 업체 상세 Popup · 리스트 컬럼 정의 (Project TITAN 기준정보 V1.0) */

/** 거래처 Popup — 기본정보 */
export const COMPANY_PROFILE_FIELDS = [
  { key: "name", label: "업체명" },
  { key: "code", label: "거래처 코드", render: "code" },
  { key: "ceoName", label: "대표자" },
  { key: "bizNo", label: "사업자등록번호" },
  { key: "address", label: "주소", span: 2 },
  { key: "phone", label: "대표전화" },
  { key: "fax", label: "팩스" },
  { key: "email", label: "이메일" },
  { key: "homepage", label: "홈페이지" },
  { key: "tradeStartDate", label: "거래 시작일" },
  { key: "note", label: "비고", span: 2 },
];

/** 거래처 Popup — 거래처 담당자 테이블 */
export const COMPANY_CONTACT_TABLE_COLUMNS = [
  { key: "name", label: "성명" },
  { key: "department", label: "부서" },
  { key: "position", label: "직책" },
  { key: "mobile", label: "휴대폰" },
  { key: "email", label: "이메일" },
];

/** @deprecated alias */
export const COMPANY_CONTACT_COLUMNS = COMPANY_CONTACT_TABLE_COLUMNS;

/** @deprecated legacy role fields */
export const COMPANY_ROLE_CONTACT_FIELDS = COMPANY_CONTACT_TABLE_COLUMNS;

/** 거래처 Popup 탭 */
export const COMPANY_DETAIL_TABS = [
  { id: "profile", label: "기본정보" },
  { id: "contacts", label: "거래처 담당자" },
  { id: "ndkAssignees", label: "우리회사 담당자" },
  { id: "trade", label: "거래이력" },
  { id: "products", label: "품목정보", future: true },
];

/** 거래처 Popup — 거래이력 필드 */
export const COMPANY_TRADE_SUMMARY_FIELDS = [
  { key: "firstTradeDate", label: "최초 거래일" },
  { key: "lastTradeDate", label: "최근 거래일" },
  { key: "tradeProductsLabel", label: "거래 품목", span: 2 },
  { key: "inboundCount", label: "입고 건수", render: "count" },
  { key: "outboundCount", label: "출고 건수", render: "count" },
  { key: "latestCertificate", label: "최근 성적서" },
];

/**
 * 거래처관리 리스트 — 빠른 조회 (Compact · 왼쪽 정렬)
 * 업체명 | 코드 | 대표자 | 우리회사 담당자 | 대표번호 | 이메일 | 상태
 */
export const COMPANY_LIST_COLUMNS = [
  { key: "name", label: "업체명" },
  { key: "code", label: "코드", identifier: true },
  { key: "ceoName", label: "대표자" },
  { key: "ndkAssigneeLabel", label: "우리회사 담당자" },
  { key: "phoneLabel", label: "대표번호" },
  { key: "emailLabel", label: "이메일" },
  { key: "activeLabel", label: "상태", render: "active" },
];
