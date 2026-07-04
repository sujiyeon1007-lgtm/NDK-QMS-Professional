/**
 * Project TITAN — Permission runtime (Module → Permission → Menu)
 */

import { TITAN_MENU_PERMISSIONS, TITAN_ROUTE_PERMISSION_GUARDS } from "../config/titanLoginSystem";
import { getAuthSession } from "./titanAuthSession";
import { hasMenuPermission } from "./titanAuthDataSession";
import { isMenuCatalogItemVisible } from "./titanModuleRuntime";

const CATALOG_PERMISSION_MAP = Object.fromEntries(
  TITAN_MENU_PERMISSIONS.map((item) => [item.catalogId, item.key])
);

export function resolveCatalogPermissionKey(catalogMenuId) {
  return CATALOG_PERMISSION_MAP[catalogMenuId] ?? null;
}

export function resolveCatalogPermissionKeys(catalogMenuId) {
  return TITAN_MENU_PERMISSIONS.filter((item) => item.catalogId === catalogMenuId).map(
    (item) => item.key
  );
}

export function isMenuAllowedForUser(catalogMenuId, flags, userId = getAuthSession()?.userId) {
  if (!isMenuCatalogItemVisible(catalogMenuId, flags)) return false;
  if (!userId) return false;
  const keys = resolveCatalogPermissionKeys(catalogMenuId);
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
  const permissionKey = getPermissionKeyForPath(pathname);
  if (!permissionKey) return true;
  return hasMenuPermission(userId, permissionKey);
}
