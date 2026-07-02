/**
 * Project TITAN — 관리자·Role 접근 (단일 API)
 *
 * 권한 체크: isTitanAdminUser() 만 사용
 * DEMO_ADMIN_MODE 참조: 이 파일에서만 (UI 배지용 isDemoAdminModeActive 포함)
 *
 * 원칙: Demo Admin은 UI만 제어 · Business Logic과 독립
 */

import { DEMO_ADMIN_MODE, TITAN_USER_ROLES } from "../config/demoAdminPolicy";
import { getEnvironmentSettings } from "./environmentSettingsSession";
import { getCurrentTitanUser } from "./titanHistorySession";

export { TITAN_USER_ROLES };

function resolveUserRoleFromSettings() {
  const current = getCurrentTitanUser();
  const users = getEnvironmentSettings().users ?? [];
  const matched = users.find((user) => current.includes(user.name) || current.includes(user.loginId));
  if (matched?.role) return matched.role;
  if (current.includes("관리자")) return TITAN_USER_ROLES.ADMIN;
  return TITAN_USER_ROLES.VIEWER;
}

/** V1.1 Role — Demo에서는 ADMIN 고정 */
export function getTitanUserRole() {
  if (DEMO_ADMIN_MODE) return TITAN_USER_ROLES.ADMIN;
  return resolveUserRoleFromSettings();
}

/** V1.1 Role 다중 허용 체크 */
export function hasTitanRole(...roles) {
  const role = getTitanUserRole();
  return roles.includes(role);
}

/** 관리자 여부 — 모든 관리자 전용 UI 게이트 */
export function isTitanAdminUser() {
  if (DEMO_ADMIN_MODE) return true;
  return getTitanUserRole() === TITAN_USER_ROLES.ADMIN;
}

/** Header [ DEMO ADMIN ] 배지 표시 여부 */
export function isDemoAdminModeActive() {
  return DEMO_ADMIN_MODE;
}

/** @alias isTitanAdminUser */
export function isAdmin() {
  return isTitanAdminUser();
}
