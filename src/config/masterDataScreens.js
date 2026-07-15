import {
  Building2,
  Package,
  Layers,
  Cog,
  Wrench,
  Users,
  HardHat,
  ClipboardCheck,
  Tags,
  FlaskConical,
} from "lucide-react";
import { MASTER_DATA_TAB_GROUPS } from "./menuFreezeV1";

export { MASTER_DATA_TAB_GROUPS };

/** @typedef {"text" | "textarea" | "select" | "toggle" | "readonly" | "abbreviation"} MasterFieldType */

/**
 * Project TITAN V1.0 — 기준정보관리 6탭 화면 설정 (Master 데이터 전용)
 * @type {Record<string, {
 *   tabId: string,
 *   categoryKey: string,
 *   title: string,
 *   registerLabel: string,
 *   kpiTitle: string,
 *   icon: import("react").ComponentType,
 *   columns: Array<{ key: string, label: string, widthPercent?: number, render?: string }>,
 *   detailFields: Array<{ key: string, label: string, render?: string }>,
 *   formFields: Array<{ key: string, label: string, type?: MasterFieldType, required?: boolean, placeholder?: string, span?: number, optionsKey?: string, selectOptions?: Array<{ value: string, label: string }> }>,
 * }>}
 */
export const MASTER_DATA_SCREENS = {
  companies: {
    tabId: "companies",
    categoryKey: "companies",
    title: "거래처 Master",
    registerLabel: "거래처\n등록",
    kpiTitle: "거래처 현황",
    icon: Building2,
    columns: [
      { key: "name", label: "업체명" },
      { key: "ceoName", label: "대표자" },
      { key: "ndkAssigneeLabel", label: "우리회사 담당자" },
      { key: "phoneLabel", label: "대표번호" },
      { key: "emailLabel", label: "이메일" },
      { key: "activeLabel", label: "상태", render: "active" },
    ],
    detailFields: [
      { key: "name", label: "업체명" },
      { key: "code", label: "거래처코드" },
      { key: "abbreviation", label: "거래처 약칭" },
      { key: "abbreviationLockedLabel", label: "약칭 고정" },
      { key: "manager", label: "담당자" },
      { key: "phone", label: "연락처" },
      { key: "email", label: "이메일" },
      { key: "address", label: "주소" },
      { key: "bizNo", label: "사업자등록번호" },
      { key: "defaultRequirements", label: "기본 요구사항" },
      { key: "inspectionStandard", label: "검사 기준" },
      { key: "certificateForm", label: "성적서 양식" },
      { key: "statementForm", label: "거래명세서 양식" },
      { key: "note", label: "비고" },
      { key: "activeLabel", label: "사용 여부", render: "active" },
    ],
    formFields: [
      { key: "name", label: "업체명", required: true, placeholder: "예: 서암열처리" },
      {
        key: "abbreviation",
        label: "거래처 약칭",
        type: "abbreviation",
        placeholder: "업체명 기준 자동 생성",
      },
      { key: "code", label: "거래처코드", type: "readonly", placeholder: "약칭과 동일 자동 적용" },
      { key: "ceoName", label: "대표자", placeholder: "대표자명" },
      { key: "phone", label: "전화번호", placeholder: "031-000-0000" },
      { key: "fax", label: "팩스", placeholder: "031-000-0001" },
      { key: "email", label: "이메일", placeholder: "company@example.com" },
      { key: "homepage", label: "홈페이지", placeholder: "https://www.example.com" },
      { key: "tradeStartDate", label: "거래 시작일", placeholder: "YYYY-MM-DD" },
      { key: "address", label: "주소", span: 2, placeholder: "주소" },
      { key: "bizNo", label: "사업자등록번호", placeholder: "000-00-00000" },
      { key: "defaultRequirements", label: "기본 요구사항", type: "textarea", span: 2, placeholder: "향후 연동" },
      { key: "inspectionStandard", label: "검사 기준", placeholder: "향후 연동" },
      { key: "certificateForm", label: "성적서 양식", placeholder: "향후 연동" },
      { key: "statementForm", label: "거래명세서 양식", placeholder: "향후 연동" },
      { key: "note", label: "비고", type: "textarea", span: 2 },
      { key: "active", label: "사용 여부", type: "toggle" },
    ],
  },
  products: {
    tabId: "products",
    categoryKey: "products",
    title: "제품 Master",
    registerLabel: "제품\n등록",
    kpiTitle: "제품 현황",
    icon: Package,
    columns: [
      { key: "company", label: "업체명", widthPercent: 22 },
      { key: "name", label: "품명", widthPercent: 24 },
      { key: "partNo", label: "품번", widthPercent: 14 },
      { key: "material", label: "재질", widthPercent: 12 },
      { key: "spec", label: "규격", widthPercent: 14 },
      { key: "activeLabel", label: "상태", widthPercent: 8, render: "active" },
    ],
    detailFields: [
      { key: "code", label: "관리번호" },
      { key: "company", label: "업체명" },
      { key: "partNo", label: "품번" },
      { key: "name", label: "품명" },
      { key: "spec", label: "제품 규격" },
      { key: "material", label: "재질" },
      { key: "inspectionTypeLabel", label: "검사 유형" },
      { key: "unitPriceLabel", label: "기본단가" },
      { key: "drawingNo", label: "도번" },
      { key: "process", label: "기본 공정" },
      { key: "unit", label: "기본 단위" },
      { key: "description", label: "제품 설명" },
      { key: "note", label: "비고" },
      { key: "activeLabel", label: "사용 여부", render: "active" },
    ],
    expandFields: [
      { key: "code", label: "관리번호" },
      { key: "partNo", label: "품번" },
      { key: "material", label: "재질" },
      { key: "spec", label: "제품 규격" },
      { key: "unitPriceLabel", label: "기본단가" },
      { key: "activeLabel", label: "상태", render: "active" },
      { key: "note", label: "비고" },
    ],
    formFields: [
      { key: "company", label: "업체명", required: true, type: "companyAutocomplete", placeholder: "거래처 검색 · 선택" },
      { key: "code", label: "관리번호", type: "autoCode", placeholder: "업체 선택 시 자동 생성 (예: DS-P-0001)" },
      { key: "partNo", label: "품번", required: true, placeholder: "예: WS-2210-F" },
      { key: "name", label: "품명", required: true, placeholder: "예: Pinion Gear" },
      { key: "spec", label: "제품 규격", placeholder: "예: Ø25×350, 40×120, M20×150" },
      { key: "material", label: "재질", optionsKey: "materials", placeholder: "재질 선택" },
      {
        key: "inspectionType",
        label: "검사 유형",
        type: "select",
        selectOptions: [
          { value: "mass", label: "양산" },
          { value: "development", label: "개발" },
        ],
      },
      { key: "unitPrice", label: "기본단가", placeholder: "예: 1500" },
      { key: "drawingNo", label: "도번", placeholder: "예: 204B1144P0001" },
      { key: "processCategory", label: "공정", type: "processCategory", required: true, placeholder: "공정 분류 선택" },
      { key: "processDetail", label: "세부공정", type: "processDetail", placeholder: "세부공정 선택" },
      { key: "unit", label: "기본 단위", type: "productUnit", placeholder: "단위 선택" },
      { key: "active", label: "사용 여부", type: "toggle" },
    ],
  },
  materials: {
    tabId: "materials",
    categoryKey: "materials",
    title: "재질관리",
    registerLabel: "재질\n등록",
    kpiTitle: "재질 현황",
    icon: Layers,
    columns: [
      { key: "name", label: "재질명", widthPercent: 40 },
      { key: "code", label: "재질코드", widthPercent: 32 },
      { key: "activeLabel", label: "사용여부", widthPercent: 12, render: "active" },
    ],
    detailFields: [
      { key: "name", label: "재질명" },
      { key: "code", label: "재질코드" },
      { key: "activeLabel", label: "사용여부", render: "active" },
    ],
    formFields: [
      { key: "name", label: "재질명", required: true, placeholder: "예: SCM440" },
      { key: "code", label: "재질코드", required: true, placeholder: "예: SCM440" },
      { key: "active", label: "사용여부", type: "toggle" },
    ],
  },
  processes: {
    tabId: "processes",
    categoryKey: "heatTreatment",
    title: "공정관리",
    registerLabel: "공정\n등록",
    kpiTitle: "공정 현황",
    icon: Cog,
    columns: [
      { key: "name", label: "공정명", widthPercent: 38 },
      { key: "code", label: "공정코드", widthPercent: 16 },
      { key: "description", label: "설명", widthPercent: 32 },
      { key: "activeLabel", label: "상태", widthPercent: 8, render: "active" },
    ],
    detailFields: [
      { key: "code", label: "공정코드" },
      { key: "name", label: "공정명" },
      { key: "description", label: "설명" },
      { key: "activeLabel", label: "사용 여부", render: "active" },
    ],
    formFields: [
      { key: "code", label: "공정코드", required: true, placeholder: "예: HT-IN" },
      { key: "name", label: "공정명", required: true, placeholder: "예: 이온질화" },
      { key: "description", label: "설명", type: "textarea", span: 2 },
      { key: "active", label: "사용 여부", type: "toggle" },
    ],
  },
  equipment: {
    tabId: "equipment",
    categoryKey: "equipment",
    title: "설비관리",
    registerLabel: "설비\n등록",
    kpiTitle: "설비 현황",
    icon: Wrench,
    columns: [
      { key: "name", label: "설비명", widthPercent: 40 },
      { key: "processCode", label: "열처리 공정", widthPercent: 32 },
      { key: "activeLabel", label: "사용여부", widthPercent: 12, render: "active" },
    ],
    detailFields: [
      { key: "name", label: "설비명" },
      { key: "processCode", label: "열처리 공정" },
      { key: "activeLabel", label: "사용여부", render: "active" },
    ],
    formFields: [
      { key: "name", label: "설비명", required: true, placeholder: "예: 3S-3 · 61" },
      {
        key: "processCode",
        label: "열처리 공정",
        type: "select",
        required: true,
        selectOptions: [
          { value: "ION", label: "이온질화 (ION)" },
          { value: "SOFT", label: "연질화 (SOFT)" },
          { value: "GAS", label: "가스질화 (GAS)" },
        ],
      },
      { key: "active", label: "사용여부", type: "toggle" },
    ],
  },
  workers: {
    tabId: "workers",
    categoryKey: "workers",
    title: "작업자 Master",
    registerLabel: "작업자\n등록",
    kpiTitle: "작업자 현황",
    icon: HardHat,
    columns: [
      { key: "name", label: "이름", widthPercent: 22 },
      { key: "department", label: "부서", widthPercent: 18 },
      { key: "position", label: "직급", widthPercent: 14 },
      { key: "role", label: "권한", widthPercent: 18 },
      { key: "activeLabel", label: "상태", widthPercent: 8, render: "active" },
    ],
    detailFields: [
      { key: "code", label: "작업자 코드" },
      { key: "name", label: "이름" },
      { key: "department", label: "부서" },
      { key: "position", label: "직급" },
      { key: "role", label: "권한" },
      { key: "note", label: "비고" },
      { key: "activeLabel", label: "사용 여부", render: "active" },
    ],
    formFields: [
      { key: "code", label: "작업자 코드", required: true, placeholder: "예: W001" },
      { key: "name", label: "이름", required: true, placeholder: "예: 김작업" },
      { key: "department", label: "부서", placeholder: "예: 생산부" },
      { key: "position", label: "직급", placeholder: "예: 주임" },
      {
        key: "role",
        label: "권한",
        type: "select",
        selectOptions: [
          { value: "관리자", label: "관리자" },
          { value: "품질", label: "품질" },
          { value: "생산", label: "열처리" },
          { value: "영업", label: "영업" },
          { value: "조회 전용", label: "조회 전용" },
        ],
      },
      { key: "note", label: "비고", type: "textarea", span: 2 },
      { key: "active", label: "사용 여부", type: "toggle" },
    ],
  },
  employees: {
    tabId: "employees",
    categoryKey: "employees",
    title: "직원정보",
    registerLabel: "직원\n등록",
    kpiTitle: "NDK 내부 직원 현황",
    icon: Users,
    columns: [
      { key: "code", label: "사번", widthPercent: 9 },
      { key: "name", label: "이름", widthPercent: 10 },
      { key: "department", label: "부서", widthPercent: 10 },
      { key: "position", label: "직급", widthPercent: 8 },
      { key: "role", label: "권한", widthPercent: 10 },
      { key: "phone", label: "연락처", widthPercent: 12 },
      { key: "email", label: "이메일", widthPercent: 18 },
      { key: "employmentStatus", label: "재직상태", widthPercent: 8 },
    ],
    detailFields: [
      { key: "code", label: "사번" },
      { key: "name", label: "성명" },
      { key: "department", label: "부서" },
      { key: "position", label: "직급" },
      { key: "phone", label: "연락처" },
      { key: "email", label: "이메일" },
      { key: "hireDate", label: "입사일" },
      { key: "employmentStatus", label: "재직상태" },
      { key: "role", label: "권한" },
      { key: "note", label: "비고" },
    ],
    formFields: [
      { key: "code", label: "사번", required: true, placeholder: "예: E001" },
      { key: "name", label: "성명", required: true, placeholder: "예: 홍길동" },
      { key: "department", label: "부서", placeholder: "예: 생산부" },
      { key: "position", label: "직급", placeholder: "예: 주임" },
      { key: "phone", label: "연락처", placeholder: "010-0000-0000" },
      { key: "email", label: "이메일", placeholder: "name@company.co.kr" },
      { key: "hireDate", label: "입사일", placeholder: "YYYY-MM-DD" },
      {
        key: "employmentStatus",
        label: "재직상태",
        type: "select",
        required: true,
        selectOptions: [
          { value: "재직", label: "재직" },
          { value: "휴직", label: "휴직" },
          { value: "퇴사", label: "퇴사" },
        ],
      },
      {
        key: "role",
        label: "권한",
        type: "select",
        selectOptions: [
          { value: "관리자", label: "관리자" },
          { value: "품질", label: "품질" },
          { value: "생산", label: "열처리" },
          { value: "영업", label: "영업" },
          { value: "조회 전용", label: "조회 전용" },
        ],
      },
      { key: "note", label: "비고", type: "textarea", span: 2 },
    ],
  },
  inspection: {
    tabId: "inspection",
    customScreen: true,
    title: "검사기준관리",
  },
  customCodes: {
    tabId: "customCodes",
    categoryKey: "customCodes",
    title: "사용자정의코드",
    registerLabel: "코드\n등록",
    kpiTitle: "코드 현황",
    icon: Tags,
    columns: [
      { key: "code", label: "코드", widthPercent: 14 },
      { key: "name", label: "코드명", widthPercent: 18 },
      { key: "group", label: "분류", widthPercent: 12 },
      { key: "note", label: "비고", widthPercent: 24 },
      { key: "activeLabel", label: "사용", widthPercent: 8, render: "active" },
    ],
    detailFields: [
      { key: "code", label: "코드" },
      { key: "name", label: "코드명" },
      { key: "group", label: "분류" },
      { key: "note", label: "비고" },
      { key: "activeLabel", label: "사용 여부", render: "active" },
    ],
    formFields: [
      { key: "code", label: "코드", required: true, placeholder: "예: URG-Y" },
      { key: "name", label: "코드명", required: true, placeholder: "표시 명칭" },
      {
        key: "group",
        label: "분류",
        type: "select",
        required: true,
        selectOptions: [
          { value: "상태", label: "상태 코드" },
          { value: "긴급", label: "긴급 여부" },
          { value: "우선순위", label: "우선순위" },
          { value: "단위", label: "단위" },
          { value: "부서", label: "부서" },
        ],
      },
      { key: "note", label: "비고", type: "textarea", span: 2 },
      { key: "active", label: "사용 여부", type: "toggle" },
    ],
  },
  recipes: {
    tabId: "recipes",
    categoryKey: "recipes",
    title: "열처리 Recipe 관리",
    registerLabel: "Recipe\n등록",
    kpiTitle: "Recipe 현황",
    icon: FlaskConical,
    columns: [
      { key: "name", label: "Recipe명", widthPercent: 26 },
      { key: "code", label: "Recipe코드", widthPercent: 22 },
      { key: "processName", label: "공정", widthPercent: 14 },
      { key: "materialName", label: "재질", widthPercent: 12 },
      { key: "versionNo", label: "Version", widthPercent: 10 },
      { key: "statusLabel", label: "Status", widthPercent: 10 },
    ],
    detailFields: [
      { key: "code", label: "Recipe코드" },
      { key: "name", label: "Recipe명" },
      { key: "statusLabel", label: "Status" },
      { key: "versionNo", label: "Version" },
      { key: "processName", label: "공정" },
      { key: "materialName", label: "재질" },
      { key: "treatmentTemp", label: "처리 온도 (℃)" },
      { key: "holdTimeMin", label: "유지시간 (min)" },
    ],
    formFields: [
      { key: "code", label: "Recipe코드", required: true, placeholder: "예: RCP-ION-SCM415-001" },
      { key: "name", label: "Recipe명", required: true, placeholder: "예: SCM415 이온질화 표준" },
      {
        key: "status",
        label: "Status",
        type: "select",
        selectOptions: [
          { value: "Draft", label: "초안" },
          { value: "Review", label: "검토중" },
          { value: "Approved", label: "승인" },
          { value: "Obsolete", label: "폐기" },
        ],
      },
      { key: "versionNo", label: "Version", placeholder: "예: V1" },
      { key: "processName", label: "공정", placeholder: "예: 이온질화" },
      { key: "materialName", label: "재질", placeholder: "예: SCM415" },
      { key: "treatmentTemp", label: "처리 온도 (℃)", placeholder: "예: 520" },
      { key: "holdTimeMin", label: "유지시간 (min)", placeholder: "예: 1200" },
      { key: "atmosphere", label: "분위기", placeholder: "예: NH₃" },
      { key: "coolingMethod", label: "냉각", placeholder: "예: Oil" },
      { key: "workMemo", label: "작업 메모", type: "textarea", span: 2 },
      { key: "cautionNote", label: "주의사항", type: "textarea", span: 2 },
      { key: "active", label: "사용 여부", type: "toggle" },
    ],
  },
};

export const MASTER_DATA_TAB_ORDER = [
  "companies",
  "products",
  "materials",
  "processes",
  "equipment",
  "workers",
];

export function getMasterDataScreen(tabId) {
  return MASTER_DATA_SCREENS[tabId] ?? null;
}

export function resolveMasterDataTab(tabParam) {
  if (tabParam === "items") return "products";
  if (tabParam === "prices") return "products";
  if (tabParam === "company") return "companies";
  if (tabParam === "employees" || tabParam === "customCodes" || tabParam === "inspection") {
    return "companies";
  }
  if (tabParam && MASTER_DATA_SCREENS[tabParam]) return tabParam;
  return "companies";
}

/** Document numbering config — pattern: {companyAbbr}-{prefix}-{seq4} */
export const TITAN_NUMBERING_STORAGE_KEY = "project-titan-document-numbering-v1";

export const TITAN_DOCUMENT_NUMBER_TYPES = {
  customer: {
    id: "customer",
    label: "\uAC70\uB798\uCC98",
    prefix: "C",
    example: "DS-C-0001",
    description: "\uAC70\uB798\uCC98 Master \uCF54\uB4DC",
  },
  product: {
    id: "product",
    label: "\uC81C\uD488",
    prefix: "P",
    example: "DS-P-0001",
    description: "\uC81C\uD488 Master \uCF54\uB4DC",
  },
  inbound: {
    id: "inbound",
    label: "\uC785\uACE0",
    prefix: "I",
    example: "DS-I-0001",
    description: "\uC785\uACE0\uB4F1\uB85D \uAD00\uB9AC\uBC88\uD638",
  },
  lot: {
    id: "lot",
    label: "LOT",
    prefix: "L",
    example: "DS-L-000001",
    description: "LOT \uBC88\uD638 ({companyAbbr}-L-{seq6})",
  },
  production: {
    id: "production",
    label: "\uC0DD\uC0B0",
    prefix: "W",
    example: "DS-W-0001",
    description: "\uC0DD\uC0B0\uC77C\uBCF4 \uC791\uC5C5\uBC88\uD638",
  },
  inspection: {
    id: "inspection",
    label: "\uAC80\uC0AC",
    prefix: "Q",
    example: "DS-Q-0001",
    description: "\uAC80\uC0AC\uB4F1\uB85D \uBC88\uD638",
  },
  certificate: {
    id: "certificate",
    label: "\uC131\uC801\uC11C",
    prefix: "CT",
    example: "DS-CT-0001",
    description: "\uC131\uC801\uC11C \uBC1C\uD589\uBC88\uD638",
  },
  shipment: {
    id: "shipment",
    label: "\uCD9C\uACE0",
    prefix: "S",
    example: "DS-S-0001",
    description: "\uCD9C\uACE0\uB4F1\uB85D \uBC88\uD638",
  },
  document: {
    id: "document",
    label: "\uBB38\uC11C",
    prefix: "D",
    example: "DS-D-0001",
    description: "\uBB38\uC11C\uAD00\uB9AC \uBC88\uD638",
  },
};

export const TITAN_NUMBERING_PATTERN = "{companyAbbr}-{prefix}-{seq4}";
export const TITAN_NUMBERING_SEQ_PAD = 4;

export function getDefaultNumberingPrefixes() {
  return Object.fromEntries(
    Object.values(TITAN_DOCUMENT_NUMBER_TYPES).map((item) => [item.id, item.prefix])
  );
}

export function buildNumberingPreview(companyAbbr, prefix, seq = 1) {
  const abbr = String(companyAbbr ?? "XX").trim().toUpperCase() || "XX";
  const safePrefix = String(prefix ?? "X").trim().toUpperCase() || "X";
  return `${abbr}-${safePrefix}-${String(seq).padStart(TITAN_NUMBERING_SEQ_PAD, "0")}`;
}
