/**
 * Project TITAN V1.0 — Master Excel Import/Export 설정
 * SQLite prep: ProductMaster · CustomerMaster · PriceMaster · MaterialMaster · ProcessMaster
 */

/** @typedef {"products" | "companies" | "materials" | "processes"} MasterExcelType */

/**
 * @typedef {object} MasterExcelColumnDef
 * @property {string} key
 * @property {string[]} labels
 * @property {string} [exportLabel]
 * @property {number} [widthPercent]
 * @property {"text" | "number" | "date"} [format]
 */

/**
 * @type {Record<MasterExcelType, {
 *   masterType: MasterExcelType,
 *   categoryKey: string,
 *   sqliteTable: string,
 *   title: string,
 *   kicker: string,
 *   accept: string,
 *   columns: MasterExcelColumnDef[],
 *   requiredKeys: string[],
 *   duplicateKey: "code" | "bizNo" | "companyPartNo" | "none",
 *   conflictPolicy: boolean,
 *   autoGenerateCode?: boolean,
 * }>}
 */
export const MASTER_EXCEL_IMPORT_CONFIG = {
  products: {
    masterType: "products",
    categoryKey: "products",
    sqliteTable: "ProductMaster",
    title: "제품 Master",
    kicker: "기준정보관리 · 제품 Master",
    accept: ".xlsx,.xls",
    columns: [
      { key: "code", labels: ["관리번호", "제품코드", "관리 번호"], exportLabel: "관리번호", widthPercent: 12 },
      { key: "company", labels: ["업체명", "업체", "거래처"], exportLabel: "업체명", widthPercent: 12 },
      { key: "partNo", labels: ["품번", "부품번호"], exportLabel: "품번", widthPercent: 12 },
      { key: "name", labels: ["품명", "제품명"], exportLabel: "품명", widthPercent: 14 },
      { key: "spec", labels: ["규격"], exportLabel: "규격", widthPercent: 10 },
      { key: "material", labels: ["재질"], exportLabel: "재질", widthPercent: 10 },
      { key: "unitPrice", labels: ["기본단가", "단가", "기본 단가"], exportLabel: "기본단가", widthPercent: 10, format: "number" },
      { key: "note", labels: ["비고", "메모"], exportLabel: "비고", widthPercent: 12 },
    ],
    requiredKeys: ["company", "partNo", "name"],
    duplicateKey: "code",
    conflictPolicy: true,
    autoGenerateCode: true,
  },
  companies: {
    masterType: "companies",
    categoryKey: "companies",
    sqliteTable: "CustomerMaster",
    title: "거래처 Master",
    kicker: "기준정보관리 · 거래처 Master · RC1 경리 Excel",
    accept: ".xlsx,.xls",
    columns: [
      {
        key: "bizNo",
        labels: ["거래처등록번호", "사업자등록번호", "사업자번호", "사업자 등록번호"],
        exportLabel: "사업자등록번호",
        widthPercent: 12,
      },
      {
        key: "name",
        labels: ["거래처상호", "업체명", "업체", "거래처", "상호"],
        exportLabel: "업체명",
        widthPercent: 16,
      },
      { key: "ceoName", labels: ["대표자명", "대표자", "대표자 명"], exportLabel: "대표자", widthPercent: 10 },
      { key: "address", labels: ["사업자주소", "주소"], exportLabel: "주소", widthPercent: 16 },
      { key: "businessType", labels: ["업태"], exportLabel: "업태", widthPercent: 8 },
      { key: "businessItem", labels: ["종목"], exportLabel: "종목", widthPercent: 10 },
      { key: "manager", labels: ["성명", "담당자"], exportLabel: "담당자", widthPercent: 10 },
      { key: "phone", labels: ["전화번호", "연락처", "전화"], exportLabel: "전화번호", widthPercent: 12 },
      {
        key: "mobile",
        labels: ["휴대전화번호", "휴대전화", "휴대폰", "핸드폰"],
        exportLabel: "휴대전화",
        widthPercent: 12,
      },
      { key: "fax", labels: ["팩스번호", "팩스"], exportLabel: "팩스", widthPercent: 10 },
      { key: "email", labels: ["이메일주소", "이메일", "email"], exportLabel: "이메일", widthPercent: 14 },
      { key: "contactRole", labels: ["구분"], exportLabel: "구분", widthPercent: 8 },
      { key: "code", labels: ["업체코드", "코드"], exportLabel: "업체코드", widthPercent: 8 },
      { key: "note", labels: ["비고", "메모"], exportLabel: "비고", widthPercent: 10 },
    ],
    requiredKeys: ["name", "bizNo"],
    duplicateKey: "bizNo",
    conflictPolicy: true,
  },
  materials: {
    masterType: "materials",
    categoryKey: "materials",
    sqliteTable: "MaterialMaster",
    title: "재질 Master",
    kicker: "기준정보관리 · 재질 Master",
    accept: ".xlsx,.xls",
    columns: [
      { key: "code", labels: ["재질코드", "코드"], exportLabel: "재질코드", widthPercent: 16 },
      { key: "name", labels: ["재질명", "재질"], exportLabel: "재질명", widthPercent: 20 },
      { key: "description", labels: ["설명", "규격"], exportLabel: "설명", widthPercent: 24 },
      { key: "note", labels: ["비고", "메모"], exportLabel: "비고", widthPercent: 24 },
    ],
    requiredKeys: ["code", "name"],
    duplicateKey: "code",
    conflictPolicy: false,
  },
  processes: {
    masterType: "processes",
    categoryKey: "heatTreatment",
    sqliteTable: "ProcessMaster",
    title: "공정 Master",
    kicker: "기준정보관리 · 공정 Master",
    accept: ".xlsx,.xls",
    columns: [
      { key: "code", labels: ["공정코드", "코드"], exportLabel: "공정코드", widthPercent: 14 },
      { key: "name", labels: ["공정명", "공정"], exportLabel: "공정명", widthPercent: 18 },
      { key: "description", labels: ["설명"], exportLabel: "설명", widthPercent: 36 },
      { key: "note", labels: ["비고", "메모"], exportLabel: "비고", widthPercent: 12 },
    ],
    requiredKeys: ["code", "name"],
    duplicateKey: "code",
    conflictPolicy: false,
  },
};

/** Tab ID → master excel type (import/export enabled tabs) */
export const MASTER_EXCEL_TAB_MAP = {
  companies: "companies",
  products: "products",
  materials: "materials",
  processes: "processes",
};

export const MASTER_EXCEL_STEP_LABELS = [
  "Excel 선택",
  "미리보기",
  "데이터 검증",
  "중복 검사",
  "Import 실행",
  "결과",
];

export function getMasterExcelConfig(masterType) {
  return MASTER_EXCEL_IMPORT_CONFIG[masterType] ?? null;
}

export function resolveMasterExcelType(tabId) {
  return MASTER_EXCEL_TAB_MAP[tabId] ?? null;
}

export function isMasterExcelTab(tabId) {
  return Boolean(resolveMasterExcelType(tabId));
}
