/**
 * Project TITAN — Development / feature branch access policy
 * Release 직전 권한 테스트 · localhost/feature/* 개발 중 Admin·Developer 우회
 */

/**
 * Presentation / feature branch — Admin·Developer 전체 메뉴 접근
 * Release 직전 권한 테스트 시 false 로 전환
 */
export const TITAN_PRESENTATION_ADMIN_FULL_ACCESS = true;

/** localhost npm run dev */
export const TITAN_DEVELOPMENT_MENU_ACCESS_ENABLED =
  import.meta.env.DEV || TITAN_PRESENTATION_ADMIN_FULL_ACCESS;

/** Developer role id (Session auth seed) */
export const TITAN_DEVELOPER_ROLE_ID = "ROLE_DEVELOPER";

export function isDevelopmentBuild() {
  return TITAN_DEVELOPMENT_MENU_ACCESS_ENABLED;
}
