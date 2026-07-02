/**
 * Project TITAN V1.0 — Demo 관리자 권한 정책 (REV.1)
 * 실제 Role 기반 권한은 V1.1 · 권한 API는 titanAdminAccess.js 단일 관리
 *
 * Rule: .cursor/rules/project-titan-demo-admin-policy.mdc
 */

/** V1.0 Demo: 관리자 UI 항상 활성 (업무 로직과 분리 · UI만 제어) */
export const DEMO_ADMIN_MODE = true;

/** V1.1 Role 인터페이스 (구조만 준비 · Demo 미사용) */
export const TITAN_USER_ROLES = {
  ADMIN: "admin",
  QUALITY: "quality",
  PRODUCTION: "production",
  SALES: "sales",
  VIEWER: "viewer",
};

/** @deprecated use TITAN_USER_ROLES */
export const V1_1_PLANNED_ROLES = [
  { id: TITAN_USER_ROLES.ADMIN, label: "Admin" },
  { id: TITAN_USER_ROLES.QUALITY, label: "Quality" },
  { id: TITAN_USER_ROLES.PRODUCTION, label: "Production" },
  { id: TITAN_USER_ROLES.SALES, label: "Sales" },
  { id: TITAN_USER_ROLES.VIEWER, label: "Viewer" },
];

/** Demo 관리자 모드 적용 대상 (UI) */
export const DEMO_ADMIN_MENU_SCOPE = [
  "MES PoC",
  "Architecture",
  "Repository Status",
  "Debug",
  "About",
  "출고 관리자 액션",
  "향후 관리자 전용 메뉴",
];

export const DEMO_ADMIN_POLICY_VERSION = "REV.1";
