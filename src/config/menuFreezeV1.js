/**
 * Project TITAN (NDK PQMS) — Menu Freeze V1.3 (최종 확정)
 * 2026-07-03 PM Final · Presentation Build V1.3
 *
 * ⚠️ 메뉴 구조 변경 원칙적 금지 — 사장님 승인 시에만 변경
 * Workflow → UI → 기능 → 구현 → 테스트 → 검토 → 승인
 * @see docs/MENU_FREEZE_V1.3.md
 */

export const MENU_FREEZE_VERSION = "V1.3";
export const MENU_FREEZE_LOCKED = true;
export const MENU_FREEZE_DATE = "2026-07-03";

/** Sidebar 1Depth — 순서 고정 (id) · 기준정보관리 = 2번 */
export const MENU_FREEZE_SIDEBAR_ORDER = [
  "home",
  "masterData",
  "inboundStatus",
  "inventoryStatus",
  "workDaily",
  "workJournal",
  "quality",
  "documents",
  "outboundStatus",
  "history",
  "statisticsInquiry",
  "environment",
];

/** Sidebar 시각 그룹 (구분선) */
export const MENU_FREEZE_SIDEBAR_GROUPS = [
  { id: "home", label: null, menuIds: ["home"] },
  { id: "master", label: null, menuIds: ["masterData"] },
  {
    id: "operations",
    label: null,
    menuIds: [
      "inboundStatus",
      "inventoryStatus",
      "workDaily",
      "workJournal",
      "quality",
      "documents",
      "outboundStatus",
    ],
  },
  { id: "analysis", label: null, menuIds: ["history", "statisticsInquiry"] },
  { id: "system", label: null, menuIds: ["environment"] },
];

/** @type {Array<{ order: number, id: string, label: string, emoji: string }>} */
export const MENU_FREEZE_SIDEBAR = [
  { order: 1, id: "home", label: "HOME", emoji: "🏠" },
  { order: 2, id: "masterData", label: "기준정보관리", emoji: "⚙" },
  { order: 3, id: "inboundStatus", label: "입고현황", emoji: "📥" },
  { order: 4, id: "inventoryStatus", label: "재고현황", emoji: "📦" },
  { order: 5, id: "workDaily", label: "작업일보", emoji: "📝" },
  { order: 6, id: "workJournal", label: "업무일지", emoji: "📒" },
  { order: 7, id: "quality", label: "품질관리", emoji: "✔" },
  { order: 8, id: "documents", label: "문서관리", emoji: "📄" },
  { order: 9, id: "outboundStatus", label: "출고현황", emoji: "🚚" },
  { order: 10, id: "history", label: "이력조회", emoji: "🕒" },
  { order: 11, id: "statisticsInquiry", label: "통계조회", emoji: "📊" },
  { order: 12, id: "environment", label: "환경설정", emoji: "🔧" },
];

/** Presentation Build V1.0 — 메뉴 개발 순서 */
export const PRESENTATION_MENU_DEV_ORDER = [
  "home",
  "masterData",
  "inboundStatus",
  "inventoryStatus",
  "workDaily",
  "workJournal",
  "quality",
  "documents",
  "outboundStatus",
  "history",
  "statisticsInquiry",
  "environment",
];

/** Menu Freeze V1.3 이후 개발 순서 (PM 최종) */
export const DEVELOPMENT_FLOW_AFTER_MENU_FREEZE = [
  "Workflow",
  "UI",
  "기능",
  "구현",
  "테스트",
  "검토",
  "승인",
];

/** PQMS 정의 — QMS ❌ · MES 대체 ❌ */
export const PQMS_SYSTEM_DEFINITION =
  "Production & Quality Management System — 생산 + 품질 + 현장 실무 통합 (MES 대체 ❌)";

export const PQMS_DEVELOPMENT_PHILOSOPHY =
  "기준정보를 기반으로 입고부터 출고까지 모든 제품 이력을 관리하고, 품질 업무와 담당자의 업무를 함께 지원하는 현장 중심의 PQMS를 구축한다.";

/** Version 정책 */
export const VERSION_POLICY = {
  v1: "MES 완전 연동 (장기 목표)",
  v2: "MES + PQMS 협업",
  v3: "NDK PQMS Presentation Build — 사장님 시연 및 실사용 검토 (현재)",
};

export const PRESENTATION_PQMS_GOAL =
  "실제 NDK 1공장에서 사용할 수 있는 수준의 생산품질관리시스템(PQMS) 구축";

export const MENU_FREEZE_BUILD_TARGET = PRESENTATION_PQMS_GOAL;

export const MENU_FREEZE_CHANGE_POLICY =
  "메뉴 구조 변경 금지 (Menu Freeze V1.3 유지) · 사장님 승인 없이 메뉴 추가·삭제 금지";

/** 제품 Workflow (업무일지 제외) */
export const PRODUCT_WORKFLOW_CHAIN = [
  "입고현황",
  "재고현황",
  "작업일보",
  "품질관리",
  "문서관리",
  "출고현황",
  "이력조회",
];

export const TRACEABILITY_INQUIRY_CHAIN = PRODUCT_WORKFLOW_CHAIN;

export const UNIFIED_STATUS_PIPELINE = [
  "입고완료",
  "생산중",
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
    role: "전체 현황 Dashboard",
    features: ["Dashboard", "진행현황", "공지사항", "해야 할 일", "최근 작업"],
  },
  masterData: {
    label: "기준정보관리",
    role: "업체, 제품, 재질, 공정, 설비, 작업자 Master 관리",
    features: [
      "① 업체관리 — 거래처 · 제품 Master",
      "② 기준정보 — 재질 · 공정 · 설비 · 작업자",
    ],
    note: "Popup(Modal) · Master First",
  },
  inboundStatus: {
    label: "입고현황",
    role: "입고 등록 및 관리번호 생성",
    features: ["입고 등록", "관리번호 자동 생성", "발주번호", "업체 LOT", "입고 진행현황"],
  },
  inventoryStatus: {
    label: "재고현황",
    role: "입고/출고 기반 재고 자동 관리",
    features: [
      "품명 · 품번 · 재질 · 규격 · 현재 재고",
      "입고 · 작업 투입 · 출고 · 최종 입고일 · 상태",
    ],
    note: "직접 입력 ❌",
  },
  workDaily: {
    label: "작업일보",
    role: "LOT 생성 및 생산 작업 이력 관리",
    features: [
      "관리번호 · LOT 생성 · 설비 · 작업자 · 공정",
      "작업 시작 · 작업 완료 · 생산 진행 상태",
    ],
    note: "제품(LOT) 중심",
  },
  workJournal: {
    label: "업무일지",
    role: "담당자 업무 기록 및 특이사항 관리",
    features: [
      "입고 검사 · 성적서 발행 · 고객 대응 · NCR",
      "회의 · 설비 점검 · 개선사항 · 특이사항",
    ],
    note: "사람 중심 · Workflow 미포함 · 향후 PDF·사진·통계·인수인계",
  },
  quality: {
    label: "품질관리",
    role: "검사 등록, 판정, 성적서 관리",
    features: ["검사등록", "검사현황", "외관·경도·유효경화깊이", "성적서 · PDF · NCR"],
  },
  documents: {
    label: "문서관리",
    role: "제품 중심 문서 관리",
    features: [
      "검색 → 제품 선택 → Popup → 9종 문서",
      "Status · Revision · 승인자 · 등록/수정/다운로드",
    ],
  },
  outboundStatus: {
    label: "출고현황",
    role: "출고 등록 및 거래명세서 출력",
    features: ["출고현황", "부분출고", "잔량", "성적서 확인", "거래명세서", "출고이력"],
    note: "출고 등록 = MES",
  },
  history: {
    label: "이력조회",
    role: "관리번호 기반 Traceability",
    features: ["관리번호 · LOT · 발주번호 · 업체 LOT · 품번", "전체 Workflow 이력"],
  },
  statisticsInquiry: {
    label: "통계조회",
    role: "생산 및 품질 통계 Dashboard",
    features: ["입고·출고·재고·품질·LOT·작업량·성적서·월별·연도별"],
  },
  environment: {
    label: "환경설정",
    role: "시스템 환경설정",
    features: ["① 시스템 ② 사용자 ③ 정보 ④ 관리자"],
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
    id: "system",
    label: "① 시스템",
    tabs: ["program", "status", "backup", "logs"],
    features: ["프로그램 설정", "시스템 설정", "백업 / 복원", "로그관리", "업데이트"],
  },
  {
    id: "users",
    label: "② 사용자",
    tabs: ["users", "permissions"],
    features: ["사용자관리", "권한관리"],
  },
  {
    id: "info",
    label: "③ 정보관리",
    tabs: ["employees", "customCodes"],
    features: ["직원정보관리", "사용자정의코드"],
  },
  {
    id: "admin",
    label: "④ 관리자",
    tabs: ["about", "architecture", "mes-poc", "repository-status", "debug"],
    features: ["About", "Architecture", "MES PoC", "Repository Status", "Debug"],
    adminOnly: true,
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
