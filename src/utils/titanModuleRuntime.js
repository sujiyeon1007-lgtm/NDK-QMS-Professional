/**
 * Project TITAN — Module runtime (Sidebar · Route · HOME filter)
 */

import { TITAN_MENU_CATALOG } from "../config/menuConfig";
import {
  MODULE_ROUTE_GUARDS,
  MODULE_SIDEBAR_EXTRAS,
  MODULE_SIDEBAR_AFTER_INSERTS,
  MENU_CATALOG_MODULE_MAP,
  HOME_WIDGET_MODULE_MAP,
  isModuleEnabled,
} from "../config/titanV12ModuleExpansion";
import { getModuleFlags } from "./titanModuleFlagsSession";

export function resolveMenuCatalogModuleIds(catalogMenuId) {
  const mapped = MENU_CATALOG_MODULE_MAP[catalogMenuId];
  if (mapped === null || mapped === undefined) return null;
  if (Array.isArray(mapped)) return mapped;
  return [mapped];
}

export function isMenuCatalogItemVisible(catalogMenuId, flags = getModuleFlags()) {
  const moduleIds = resolveMenuCatalogModuleIds(catalogMenuId);
  if (moduleIds === null) return true;
  return moduleIds.some((id) => isModuleEnabled(id, flags));
}

export function getModuleFilteredSidebarMenu(baseMenuItems, flags = getModuleFlags()) {
  const filteredBase = baseMenuItems.filter((item) => isMenuCatalogItemVisible(item.id, flags));
  const extraItems = MODULE_SIDEBAR_EXTRAS.map((id) => TITAN_MENU_CATALOG[id]).filter(Boolean);
  const filteredExtras = extraItems.filter((item) => isMenuCatalogItemVisible(item.id, flags));
  let merged = [...filteredBase];
  const seen = new Set(merged.map((item) => item.id));
  filteredExtras.forEach((item) => {
    if (!seen.has(item.id)) merged.push(item);
    seen.add(item.id);
  });
  MODULE_SIDEBAR_AFTER_INSERTS.forEach(({ afterId, menuId }) => {
    const insertItem = TITAN_MENU_CATALOG[menuId];
    if (!insertItem || !isMenuCatalogItemVisible(menuId, flags)) return;
    if (seen.has(menuId)) return;
    const index = merged.findIndex((item) => item.id === afterId);
    if (index >= 0) {
      merged.splice(index + 1, 0, insertItem);
    } else {
      merged.push(insertItem);
    }
    seen.add(menuId);
  });
  return merged;
}

export function getModuleIdForPath(pathname = "") {
  const path = String(pathname).split("?")[0];
  for (const guard of MODULE_ROUTE_GUARDS) {
    if (guard.pathPrefix === "/accounting" && path.startsWith("/accounting-clerk")) continue;
    if (path === guard.pathPrefix || path.startsWith(`${guard.pathPrefix}/`)) {
      return guard.moduleId;
    }
  }
  return null;
}

export function isRouteAllowedByModules(pathname, flags = getModuleFlags()) {
  const moduleId = getModuleIdForPath(pathname);
  if (!moduleId) return true;
  return isModuleEnabled(moduleId, flags);
}

export function getModuleRedirectPath(flags = getModuleFlags()) {
  return isModuleEnabled("inbound", flags) ? "/inout/incoming" : "/home";
}

export function isHomeWidgetVisible(widgetId, flags = getModuleFlags()) {
  const moduleId = HOME_WIDGET_MODULE_MAP[widgetId];
  if (!moduleId) return true;
  return isModuleEnabled(moduleId, flags);
}
