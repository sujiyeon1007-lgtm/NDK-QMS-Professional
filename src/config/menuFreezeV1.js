/**
 * Project TITAN (NDK PQMS) — Menu Freeze V1.0 (최종 확정)
 * 2026-07-03 PM Final
 *
 * ⚠️ 메뉴 구조 변경 금지 — 이후 개발: Workflow → 기능 → UI → 구현 → 테스트
 * @see src/config/menuStructure.js
 * @see .cursor/rules/project-titan-menu-freeze-v1.mdc
 */

export const MENU_FREEZE_VERSION = "V1.0";
export const MENU_FREEZE_LOCKED = true;
export const MENU_FREEZE_DATE = "2026-07-03";

/** Sidebar 1Depth — 순서 고정 (id) */
export const MENU_FREEZE_SIDEBAR_ORDER = [
  "home",
  "inboundStatus",
  "workDaily",
  "quality",
  "documents",
  "masterData",
  "outboundStatus",
  "history",
  "environment",
];

/** @type {Array<{ order: number, id: string, label: string, emoji: string }>} */
export const MENU_FREEZE_SIDEBAR = [
  { order: 1, id: "home", label: "HOME", emoji: "🏠" },
  { order: 2, id: "inboundStatus", label: "입고현황", emoji: "📦" },
  { order: 3, id: "workDaily", label: "작업일보", emoji: "📝" },
  { order: 4, id: "quality", label: "품질관리", emoji: "🛡" },
  { order: 5, id: "documents", label: "문서관리", emoji: "📚" },
  { order: 6, id: "masterData", label: "기준정보관리", emoji: "🗂" },
  { order: 7, id: "outboundStatus", label: "출고현황", emoji: "🚚" },
  { order: 8, id: "history", label: "이력조회", emoji: "🔍" },
  { order: 9, id: "environment", label: "환경설정", emoji: "⚙" },
];

/** Menu Freeze 이후 개발 순서 */
export const DEVELOPMENT_FLOW_AFTER_MENU_FREEZE = [
  "Workflow",
  "기능",
  "UI",
  "구현",
  "테스트",
];

/** Version 3 목표 */
export const MENU_FREEZE_BUILD_TARGET =
  "Version 3 — NDK Production & Quality Management System (Presentation Version)";

/** @type {Record<string, { label: string, features: string[], note?: string }>} */
export const MENU_FREEZE_ROLES = {
  home: {
    label: "HOME",
    features: ["Dashboard", "진행현황", "공지사항", "해야 할 일", "최근 작업"],
  },
  inboundStatus: {
    label: "입고현황",
    features: [
      "입고 등록 (Presentation)",
      "관리번호 생성",
      "발주번호",
      "업체 LOT",
      "입고현황",
      "작업일보 이동",
    ],
  },
  workDaily: {
    label: "작업일보",
    features: ["LOT 생성", "작업일보 등록", "작업조건", "작업수량", "작업자", "설비"],
  },
  quality: {
    label: "품질관리",
    features: [
      "검사등록",
      "검사현황",
      "외관검사",
      "경도검사",
      "유효경화깊이",
      "조직사진",
      "성적서",
      "PDF",
      "발행이력",
      "불량이력",
      "NCR",
    ],
  },
  documents: {
    label: "문서관리",
    features: [
      "거래처 선택 → 제품 리스트 → 문서현황",
      "제품 중심 — 도면·검사기준서·작업표준서·FMEA 등 9종",
      "등록/미등록 · Revision · 최종 수정일",
    ],
    note: "Master First · One Source of Truth · Product Hub",
  },
  masterData: {
    label: "기준정보관리",
    features: [],
    note: "Master 데이터만 · 문서관리와 독립",
  },
  outboundStatus: {
    label: "출고현황",
    features: [
      "출고현황",
      "부분출고",
      "잔량관리",
      "성적서 확인",
      "거래명세서 출력",
      "출고이력",
    ],
    note: "출고 등록 = MES 원칙 · TITAN은 조회·품질 확인 · V1/V2 MES 연동",
  },
  history: {
    label: "이력조회",
    features: [
      "조회: 관리번호 · LOT · 발주번호 · 업체 LOT · 품번",
      "결과: 입고현황 → 작업일보 → 품질관리 → 문서관리 → 출고현황",
    ],
    note: "Traceability 전용 · 등록 ❌",
  },
  environment: {
    label: "환경설정",
    features: [],
    note: "시스템 관리 전용",
  },
};

/** 기준정보관리 탭 그룹 (Menu Freeze V1.0) */
export const MASTER_DATA_TAB_GROUPS = [
  {
    id: "company",
    label: "① 업체관리",
    tabs: [
      { id: "companies", label: "거래처 정보", note: "거래처 Master" },
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

/** 문서관리 탭 (Menu Freeze V1.0) */
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

/** 환경설정 탭 그룹 (Menu Freeze V1.0) */
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
