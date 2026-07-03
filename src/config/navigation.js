/**
 * Project TITAN V1.0 — Navigation (re-export menuStructure)
 */

export {
  SIDEBAR_MENU,
  MENU_SECTIONS,
  WORKFLOW_STEPS,
  getSectionById,
  getSectionByPathname,
  matchSidebarActive,
  getActiveTab,
  LEGACY_ROUTE_REDIRECTS,
  getBreadcrumbByPathname,
  getMenuCatalogItem,
  getPageMetaByMenuId,
  TITAN_MENU_CATALOG,
} from "./menuStructure";

/** @deprecated Use matchSidebarActive from menuStructure */
export function matchNavTarget(to, location) {
  const [pathname] = to.split("?");
  if (pathname === "/") {
    return location.pathname === "/";
  }
  return location.pathname === pathname || location.pathname.startsWith(`${pathname}/`);
}
