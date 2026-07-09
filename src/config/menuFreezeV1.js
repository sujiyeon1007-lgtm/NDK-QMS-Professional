/**
 * Project TITAN — Menu Freeze V1.5 (공식 Sidebar 정책)
 * 2026-07-07 PM Final · QMS + MES 통합 · 업무 흐름 기준
 *
 * Sidebar 8 menus · 6 groups (HOME · 운영관리 · 품질관리 · MES · 경영 · 시스템)
 * Launcher Hub: 입출고관리 · 생산관리 · 품질관리 · 기준정보관리
 * Sprint 3E — 제품현황 독립 메뉴 제거 · Control Room(설비 현황) Product View로 흡수
 * @see .cursor/rules/project-titan-v1.5-launcher-architecture-final.mdc
 * @see src/config/titanLauncherArchitectureV15.js
 */

export const MENU_FREEZE_VERSION = "V1.5";
export const MENU_FREEZE_LOCKED = true;
export const MENU_FREEZE_DATE = "2026-07-07";

/** Sidebar 1Depth — V1.0 Access Lock (12 menus · 2026-07-08 PM) */
export const MENU_FREEZE_SIDEBAR_ORDER = [
  "home",
  "qrEngine",
  "inoutManagement",
  "productionManagement",
  "qualityManagement",
  "statisticsInquiry",
  "accountingClerk",
  "accounting",
  "masterData",
  "environment",
  "companyInfo",
];

/** Sidebar 시각 그룹 — 구분선 + 그룹 제목 */
export const MENU_FREEZE_SIDEBAR_GROUPS = [
  { id: "home", label: null, emoji: null, menuIds: ["home"] },
  {
    id: "mes",
    label: "MES",
    emoji: "🏭",
    menuIds: ["qrEngine"],
  },
  {
    id: "operations",
    label: "운영관리",
    emoji: "📦",
    menuIds: ["inoutManagement", "productionManagement"],
  },
  {
    id: "quality",
    label: "품질관리",
    emoji: "🧪",
    menuIds: ["qualityManagement"],
  },
  {
    id: "executive",
    label: "경영",
    emoji: "📊",
    menuIds: ["statisticsInquiry", "accountingClerk", "accounting"],
  },
  {
    id: "system",
    label: "시스템",
    emoji: "⚙",
    menuIds: ["masterData", "environment", "companyInfo"],
  },
];

/** Sidebar 1Depth — V1.0 Access Lock (12 menus · Launcher Hub) */
export const MENU_FREEZE_SIDEBAR = [
  { order: 1, id: "home", label: "HOME", emoji: "🏠" },
  { order: 2, id: "qrEngine", label: "QR 정보관리", emoji: "▣" },
  { order: 3, id: "inoutManagement", label: "운영관리", emoji: "📦" },
  { order: 4, id: "productionManagement", label: "생산관리", emoji: "🏭" },
  { order: 5, id: "qualityManagement", label: "품질관리", emoji: "🧪" },
  { order: 6, id: "statisticsInquiry", label: "통계관리", emoji: "📊" },
  { order: 7, id: "accountingClerk", label: "경리관리", emoji: "💼" },
  { order: 8, id: "accounting", label: "회계관리", emoji: "🧾" },
  { order: 9, id: "masterData", label: "기준정보관리", emoji: "⚙" },
  { order: 10, id: "environment", label: "환경설정", emoji: "🔧" },
  { order: 11, id: "companyInfo", label: "회사정보", emoji: "🏢" },
];

export const PRESENTATION_MENU_DEV_ORDER = [...MENU_FREEZE_SIDEBAR_ORDER];

export const DEVELOPMENT_FLOW_AFTER_MENU_FREEZE = [
  "Workflow",
  "UI",
  "기능",
  "구현",
  "테스트",
  "검토",
  "승인",
];

export const PQMS_SYSTEM_DEFINITION =
  "Production & Quality Management System — 생산 + 품질 + 현장 실무 통합 (MES 대체 ❌)";

export const PQMS_DEVELOPMENT_PHILOSOPHY =
  "Menu Simple, Function Deep — 메뉴는 최소화하고 각 메뉴 내부에서 기능을 확장한다.";

export const VERSION_POLICY = {
  v1: "MES 완전 연동 (장기 목표)",
  v2: "MES + PQMS 협업",
  v3: "NDK PQMS Presentation Build — 사장님 시연 및 실사용 검토 (현재)",
};

export const PRESENTATION_PQMS_GOAL =
  "실제 NDK 1공장에서 사용할 수 있는 수준의 생산품질관리시스템(PQMS) 구축";

export const MENU_FREEZE_BUILD_TARGET = PRESENTATION_PQMS_GOAL;

export const MENU_FREEZE_CHANGE_POLICY =
  "Menu Freeze V1.5 FINAL — Sidebar 10메뉴·Launcher Hub · 업무 흐름 기준 · 그룹 역할 혼합 금지";

/** 제품 Workflow (업무 흐름) */
export const PRODUCT_WORKFLOW_CHAIN = [
  "입고관리",
  "열처리관리",
  "업무일지",
  "검사관리",
  "문서관리",
  "출고관리",
  "재고관리",
  "이력조회",
];

export const TRACEABILITY_INQUIRY_CHAIN = PRODUCT_WORKFLOW_CHAIN;

export const UNIFIED_STATUS_PIPELINE = [
  "입고완료",
  "열처리중",
  "검사대기",
  "검사완료",
  "성적서대기",
  "성적서완료",
  "출고예정",
  "출고완료",
];

export const DOCUMENT_STATUS_FREEZE = [
  { id: "latest", label: "최신", emoji: "🟢" },
  { id: "revisionNeeded", label: "개정 필요", emoji: "🟡" },
  { id: "approvalPending", label: "승인 대기", emoji: "🔵" },
  { id: "notRegistered", label: "미등록", emoji: "⚫" },
  { id: "obsolete", label: "폐기", emoji: "🔴" },
];

/** @type {Record<string, { label: string, role?: string, features: string[], note?: string }>} */
export const MENU_FREEZE_ROLES = {
  home: {
    label: "HOME",
    role: "Project TITAN 메인 Dashboard",
    features: ["공지사항", "금일 업무현황", "통합검색", "진행현황", "오늘 해야 할 일", "최근 작업"],
  },
  masterData: {
    label: "기준정보관리",
    role: "거래처 · 제품 · 재질 · 공정 · 설비 · 작업자 Master",
    features: ["거래처관리", "제품관리", "재질관리", "공정관리", "설비관리", "작업자관리"],
  },
  inboundStatus: {
    label: "입고관리",
    role: "입고 등록 · 조회 · 현황",
    features: ["입고등록", "입고조회", "입고현황", "작업지시 출력", "입고 PDF 출력"],
  },
  workDaily: {
    label: "열처리관리",
    role: "열처리 업무 통합",
    features: ["열처리일보", "열처리현황", "작업지시", "열처리이력", "설비현황", "열처리 통계"],
    note: "향후 QR/NFC 열처리등록",
  },
  workJournal: {
    label: "업무일지",
    role: "담당자 업무 기록 · 특이사항",
    features: ["입고 검사", "성적서 발행", "NCR", "회의", "설비 점검", "특이사항"],
    note: "사람 중심 · Workflow 미포함",
  },
  quality: {
    label: "검사관리",
    role: "검사 업무 통합",
    features: ["검사등록", "검사일보", "검사현황", "부적합관리", "재검관리", "검사 PDF 출력"],
  },
  certificateStatus: {
    label: "성적서관리",
    role: "성적서 업무",
    features: ["성적서 작성", "성적서 발행", "성적서 재발행", "성적서 PDF", "성적서 이력"],
  },
  outboundStatus: {
    label: "출고관리",
    role: "출고 업무",
    features: ["출고등록", "출고조회", "거래명세서 출력", "출고현황", "출고 PDF"],
  },
  inventoryStatus: {
    label: "재고관리",
    role: "조회 중심 — ERP 창고관리 ❌",
    features: ["현재 재고", "품목별/LOT별/거래처별 재고", "재고 검색", "재고 PDF"],
    note: "입고·출고 데이터 자동 계산 · V2.0 조정/실사 구조만 준비",
  },
  history: {
    label: "이력조회",
    role: "통합 이력 · Traceability",
    features: ["관리번호", "LOT", "제품", "거래처", "전체 Workflow 조회"],
  },
  documents: {
    label: "문서관리",
    role: "품질 문서 — 공지사항은 HOME",
    features: ["품질문서", "작업표준서", "절차서", "도면", "첨부파일"],
  },
  statisticsInquiry: {
    label: "통계관리",
    role: "Dashboard · 조회 전용",
    features: ["생산 통계", "검사 통계", "출고 통계", "거래처 통계", "월별 통계"],
  },
  accountingClerk: {
    label: "경리관리",
    role: "경리 업무 지원",
    features: ["거래명세서", "발행이력", "미수금", "월 마감", "매출현황", "세금계산서 발행 여부"],
    note: "홈택스 직접 발행 ❌ — TITAN은 발행 여부만 관리",
  },
  accounting: {
    label: "회계관리",
    role: "ERP 대체 ❌",
    features: ["전표", "전표조회", "계정과목", "원가현황", "부가세 현황"],
  },
  qrManagement: {
    label: "QR 관리",
    role: "독립 메뉴 — QR 생성(권한) · 출력(전체)",
    features: ["QR 생성", "QR 출력", "QR 재출력", "QR 미리보기", "QR 관리", "QR 사용안내"],
  },
  equipmentStatus: {
    label: "설비 가동 현황",
    role: "Control Room — 생산부장 · 공장장 · 관리자 (Equipment · LOT · Product View)",
    features: ["Equipment View", "LOT View", "Product View", "KPI 7 · Detail Popup"],
    note: "Sprint 3E — Control Room 통합 · 제품현황 Product View 흡수 · equipmentWorkflowService SSOT",
  },
  qrCharging: {
    label: "설비 가동 현황",
    role: "생산관리 Navigation 내부 — 설비 관제와 장입 작업 통합",
    features: ["장입 준비", "작업 시작", "작업 종료", "LOT 확인"],
    note: "Sprint 16-12 — 설비장입 메뉴를 제거하고 설비 가동 현황으로 통합",
  },
  environment: {
    label: "환경설정",
    role: "시스템 관리 — QR 제외",
    features: ["사용자관리", "권한관리", "모듈관리", "Storage 관리", "백업", "복원", "시스템 로그"],
  },
  inoutManagement: {
    label: "운영관리",
    role: "입고 · 출고 · 재고 일상 업무",
    features: ["입고등록", "출고등록", "재고관리", "입출고 출력"],
    note: "V2.0 Blueprint — Operations Workspace",
  },
  productionManagement: {
    label: "생산관리",
    role: "생산 운영 Launcher Hub",
    features: ["생산계획", "설비 가동 현황", "생산일보", "생산실적관리", "출력관리"],
    note: "PM UX · LOT 생성은 생산계획 내부 Action, 설비 장입 기능은 설비 가동 현황으로 통합",
  },
  qualityManagement: {
    label: "품질관리",
    role: "품질 업무 Launcher Hub",
    features: ["검사관리", "성적서관리", "문서관리"],
    note: "V1.5 Launcher Hub · 향후 NCR · CAPA · 고객불만 확장",
  },
};

export const MASTER_DATA_TAB_GROUPS = [
  {
    id: "company",
    label: "① 업체관리",
    tabs: [
      { id: "companies", label: "거래처", note: "거래처 Master" },
      { id: "products", label: "제품 Master", note: "Core Master · Hub" },
    ],
  },
  {
    id: "baseline",
    label: "② 기준정보",
    tabs: [
      { id: "materials", label: "재질관리" },
      { id: "processes", label: "공정관리" },
      { id: "equipment", label: "설비관리" },
      { id: "workers", label: "작업자 Master" },
    ],
  },
];

export const DOCUMENT_MANAGEMENT_FREEZE_TABS = [
  "drawings",
  "inspection",
  "work-standard",
  "control-plan",
  "fmea",
  "customer-requirements",
  "concession",
  "quality-notice",
  "ncr",
  "other",
];

export const ENVIRONMENT_TAB_GROUPS_FREEZE = [
  {
    id: "admin",
    label: "관리자",
    tabs: ["users", "permissions", "modules", "storage", "backup", "logs"],
    features: ["사용자관리", "권한관리", "모듈관리", "Storage 관리", "백업 / 복원", "시스템 로그"],
  },
  {
    id: "system",
    label: "시스템",
    tabs: ["program", "status"],
    features: ["프로그램 설정", "시스템 설정"],
  },
  {
    id: "info",
    label: "정보관리",
    tabs: ["employees", "customCodes"],
    features: ["직원정보관리", "사용자정의코드"],
  },
];

export function assertMenuFreezeLocked() {
  if (!MENU_FREEZE_LOCKED) {
    console.warn("[Menu Freeze] MENU_FREEZE_LOCKED is false — PM approval required to change menus.");
  }
  return MENU_FREEZE_LOCKED;
}

export function getMenuFreezeSidebarLabels() {
  return MENU_FREEZE_SIDEBAR.map((item) => item.label);
}

/** @param {string[]} order */
export function buildSidebarGroups(order = MENU_FREEZE_SIDEBAR_ORDER) {
  const byId = Object.fromEntries(order.map((id, index) => [id, index]));
  return MENU_FREEZE_SIDEBAR_GROUPS.map((group) => ({
    ...group,
    items: group.menuIds
      .filter((id) => byId[id] != null)
      .sort((a, b) => byId[a] - byId[b])
      .map((id) => ({ id })),
  })).filter((group) => group.items.length > 0);
}
