import { SIDEBAR_MENU } from "../config/menuStructure";
import { MENU_FREEZE_LOCKED } from "../config/menuFreezeV1";
import { getEditionSidebarMenuIds, isSidebarMenuVisibleForEdition } from "../config/titanEditionArchitecture";
import { getMenuFreezeSidebarMenu } from "./menuIntegrity";
import { getTitanEditionState } from "./titanEditionSession";

export { isSidebarMenuVisibleForEdition };

/** 현재 Edition 기준 Sidebar 메뉴 — Menu Freeze 시 9개 고정 */
export function getVisibleSidebarMenu(editionId = getTitanEditionState().editionId) {
  if (MENU_FREEZE_LOCKED) {
    return getMenuFreezeSidebarMenu();
  }

  const allowed = new Set(getEditionSidebarMenuIds(editionId));
  return SIDEBAR_MENU.filter((item) => allowed.has(item.id));
}
