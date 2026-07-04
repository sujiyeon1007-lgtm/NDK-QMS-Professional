import { SIDEBAR_MENU } from "../config/menuStructure";
import { MENU_FREEZE_LOCKED } from "../config/menuFreezeV1";
import { MODULE_SIDEBAR_EXTRAS } from "../config/titanV12ModuleExpansion";
import { getEditionSidebarMenuIds, isSidebarMenuVisibleForEdition } from "../config/titanEditionArchitecture";
import { getMenuFreezeSidebarMenu } from "./menuIntegrity";
import { getTitanEditionState } from "./titanEditionSession";
import { getModuleFilteredSidebarMenu } from "./titanModuleRuntime";
import { getPermissionFilteredSidebarMenu } from "./titanPermissionRuntime";
import { getAuthSession } from "./titanAuthSession";

export { isSidebarMenuVisibleForEdition };

/** 현재 Edition + Module + Permission 기준 Sidebar 메뉴 */
export function getVisibleSidebarMenu(editionId = getTitanEditionState().editionId) {
  let base;
  if (MENU_FREEZE_LOCKED) {
    base = getMenuFreezeSidebarMenu();
  } else {
    const allowed = new Set(getEditionSidebarMenuIds(editionId));
    base = SIDEBAR_MENU.filter((item) => allowed.has(item.id));
  }
  const userId = getAuthSession()?.userId;
  const moduleFiltered = getModuleFilteredSidebarMenu(base);
  return getPermissionFilteredSidebarMenu(moduleFiltered, undefined, userId);
}

export { MODULE_SIDEBAR_EXTRAS };
