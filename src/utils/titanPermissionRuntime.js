/**
 * Project TITAN — Permission runtime (Module → Permission → Menu)
 */

import {
  TITAN_DEFAULT_ADMIN,
  TITAN_MENU_PERMISSIONS,
  TITAN_ROUTE_PERMISSION_GUARDS,
} from "../config/titanLoginSystem";
import {
  isDevelopmentBuild,
  TITAN_DEVELOPER_ROLE_ID,
} from "../config/titanDevelopmentAccess";
import { getAuthSession } from "./titanAuthSession";
import {
  getUserById,
  getUserRoleIds,
  hasMenuPermission,
  isProgramAdministrator,
} from "./titanAuthDataSession";
import { isMenuCatalogItemVisible } from "./titanModuleRuntime";

const CATALOG_PERMISSION_MAP = Object.fromEntries(
  TITAN_MENU_PERMISSIONS.map((item) => [item.catalogId, item.key])
);

export function isDeveloperUser(userId) {
  if (!userId) return false;
  return getUserRoleIds(userId).includes(TITAN_DEVELOPER_ROLE_ID);
}

/** localhost · feature/* — Admin / Developer 전체 메뉴 접근 (Release 전 권한 테스트 제외) */
export function isDevelopmentPrivilegedUser(userId = getAuthSession()?.userId) {
  if (!isDevelopmentBuild() || !userId) return false;
  if (isProgramAdministrator(userId) || isDeveloperUser(userId)) return true;
  const user = getUserById(userId);
  return (
    String(user?.loginId ?? "")
      .trim()
      .toLowerCase() === TITAN_DEFAULT_ADMIN.loginId
  );
}

export function resolveCatalogPermissionKey(catalogMenuId) {
  return CATALOG_PERMISSION_MAP[catalogMenuId] ?? null;
}

/** V1.5 Sidebar — 통합 메뉴 권한 (기존 세부 권한 OR) */
const CONSOLIDATED_MENU_PERMISSION_ALIASES = {
  inoutManagement: ["inbound", "outbound", "inventory"],
  productionManagement: ["production"],
  qualityManagement: ["inspection", "certificate", "documents"],
};

export function resolveCatalogPermissionKeys(catalogMenuId) {
  const aliases = CONSOLIDATED_MENU_PERMISSION_ALIASES[catalogMenuId];
  if (aliases) return aliases;
  return TITAN_MENU_PERMISSIONS.filter((item) => item.catalogId === catalogMenuId).map(
    (item) => item.key
  );
}

export function isMenuAllowedForUser(catalogMenuId, flags, userId = getAuthSession()?.userId) {
  if (isDevelopmentPrivilegedUser(userId)) return isMenuCatalogItemVisible(catalogMenuId, flags);
  if (!isMenuCatalogItemVisible(catalogMenuId, flags)) return false;
  if (!userId) return false;
  const keys = resolveCatalogPermissionKeys(catalogMenuId);
  if (CONSOLIDATED_MENU_PERMISSION_ALIASES[catalogMenuId]?.length) {
    return keys.some((key) => hasMenuPermission(userId, key));
  }
  if (keys.length > 1) {
    return keys.some((key) => hasMenuPermission(userId, key));
  }
  const permissionKey = resolveCatalogPermissionKey(catalogMenuId);
  if (!permissionKey) return true;
  return hasMenuPermission(userId, permissionKey);
}

export function getPermissionFilteredSidebarMenu(baseMenuItems, flags, userId = getAuthSession()?.userId) {
  return baseMenuItems.filter((item) => isMenuAllowedForUser(item.id, flags, userId));
}

export function getPermissionKeyForPath(pathname = "") {
  const path = String(pathname).split("?")[0];
  for (const guard of TITAN_ROUTE_PERMISSION_GUARDS) {
    if (guard.pathPrefix === "/accounting" && path.startsWith("/accounting-clerk")) continue;
    if (path === guard.pathPrefix || path.startsWith(`${guard.pathPrefix}/`)) {
      return guard.permissionKey;
    }
  }
  return null;
}

export function isRouteAllowedByPermissions(pathname, userId = getAuthSession()?.userId) {
  if (!userId) return false;
  if (isProgramAdministrator(userId) || isDevelopmentPrivilegedUser(userId)) return true;
  const permissionKey = getPermissionKeyForPath(pathname);
  if (!permissionKey) return true;
  return hasMenuPermission(userId, permissionKey);
}
