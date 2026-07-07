/**
 * Project TITAN V1.5 — Launcher Architecture FINAL (PM 최종 승인 · 2026-07-07)
 * Sidebar · Launcher Hub · 카드 UX · 개발 원칙 SSoT
 * @see .cursor/rules/project-titan-v1.5-launcher-architecture-final.mdc
 */

export const LAUNCHER_ARCHITECTURE_VERSION = "V1.5";
export const LAUNCHER_ARCHITECTURE_LOCKED = true;
export const LAUNCHER_ARCHITECTURE_DATE = "2026-07-07";

/** PM 공식 개발 순서 — Build 성공만으로 완료 처리 ❌ */
export const LAUNCHER_ARCHITECTURE_DEV_PROCESS = [
  "기능 개발",
  "npm run build",
  "Architecture 점검",
  "브라우저 실제 QA",
  "Git Commit",
  "Git Push",
];

export const LAUNCHER_ARCHITECTURE_PRINCIPLE =
  "메뉴는 최소화하고, Launcher는 확장한다 — Sidebar 최상위 메뉴 무분별 추가 ❌";

/** Launcher(Hub) 사용 메뉴 */
export const LAUNCHER_HUB_MENU_IDS = [
  "inoutManagement",
  "productionManagement",
  "qualityManagement",
  "qrCharging",
  "masterData",
];

/** Launcher 공통 UX 슬롯 */
export const LAUNCHER_HUB_LAYOUT = {
  header: "페이지 설명 + 업무 Workflow 안내",
  body: "업무 카드 (전체 클릭)",
  footer: "최근 작업 / 최근 등록 내역 (향후 확장)",
};

/** 카드 UX — 기준정보관리 Launcher 기준 통일 */
export const LAUNCHER_CARD_UX_POLICY = {
  fullCardClick: true,
  separateShortcutButton: false,
  hover: true,
  pointerCursor: true,
  shadow: true,
  borderRadius: true,
  pastelTone: true,
  referenceCss: "src/foundation/styles/titan-hub-page.css",
};

export const INOUT_MANAGEMENT_WORKFLOW = [
  "입고등록",
  "출고등록",
  "입출고이력",
  "재고관리",
  "출력관리",
];

export const PRODUCTION_MANAGEMENT_WORKFLOW = [
  "생산계획",
  "설비 장입관리",
  "생산일보",
  "생산실적관리",
  "생산 업무일지",
];

export const QUALITY_MANAGEMENT_WORKFLOW = [
  "검사관리",
  "성적서관리",
  "불량이력관리",
  "문서관리",
  "품질 업무일지",
];

export const QR_CHARGING_HUB_WORKFLOW = ["설비 현황", "QR 장입", "진행현황", "작업이력"];

export const MASTER_DATA_WORKFLOW = [
  "거래처",
  "제품",
  "설비",
  "재질",
  "공정",
  "작업자",
];

export const ENVIRONMENT_WORKFLOW = ["회사정보", "권한관리", "모듈관리", "시스템 설정"];

/** HOME — 업무 수행 화면 ❌ · 10초 내 상황 파악 Hub */
export const HOME_DASHBOARD_SECTIONS = [
  "KPI",
  "공지사항",
  "업무일정",
  "업무 바로가기",
  "최근 작업(Timeline)",
];

export function formatLauncherWorkflowLine(steps) {
  return steps.join(" → ");
}
