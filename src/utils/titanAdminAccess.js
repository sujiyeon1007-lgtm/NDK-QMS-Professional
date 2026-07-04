/**
 * Project TITAN — 관리자·Role 접근 (단일 API)
 *
 * 권한 체크: isTitanAdminUser() · hasMenuPermission()
 * 로그인 연동: titanAuthDataSession · titanAuthSession
 */

import { DEMO_ADMIN_MODE, TITAN_USER_ROLES } from "../config/demoAdminPolicy";
import {
  getAuthSession,
  isAuthenticated,
} from "./titanAuthSession";
import {
  getUserById,
  hasMenuPermission,
  isProgramAdministrator,
} from "./titanAuthDataSession";

export { TITAN_USER_ROLES };

function resolveAuthUser() {
  const session = getAuthSession();
  if (!session?.userId) return null;
  return getUserById(session.userId);
}

/** V1.1 Role — 로그인 사용자 기준 */
export function getTitanUserRole() {
  if (DEMO_ADMIN_MODE) return TITAN_USER_ROLES.ADMIN;
  const user = resolveAuthUser();
  if (!user) return TITAN_USER_ROLES.VIEWER;
  if (isProgramAdministrator(user.id)) return TITAN_USER_ROLES.ADMIN;
  return TITAN_USER_ROLES.VIEWER;
}

export function hasTitanRole(...roles) {
  const role = getTitanUserRole();
  return roles.includes(role);
}

/** 관리자(Program Administrator) — 환경설정 ④ 관리자 Tab 등 */
export function isTitanAdminUser() {
  if (DEMO_ADMIN_MODE) return true;
  const session = getAuthSession();
  if (!session?.userId) return false;
  return isProgramAdministrator(session.userId) || hasMenuPermission(session.userId, "admin");
}

export function isDemoAdminModeActive() {
  return DEMO_ADMIN_MODE;
}

export function isAdmin() {
  return isTitanAdminUser();
}

export function requireAuthenticatedUser() {
  return isAuthenticated();
}
