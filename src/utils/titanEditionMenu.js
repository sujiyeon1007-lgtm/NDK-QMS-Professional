import { SIDEBAR_MENU } from "../config/menuStructure";
import { getEditionSidebarMenuIds, isSidebarMenuVisibleForEdition } from "../config/titanEditionArchitecture";
import { getTitanEditionState } from "./titanEditionSession";

export { isSidebarMenuVisibleForEdition };

/** 현재 Edition 기준 Sidebar 메뉴 */
export function getVisibleSidebarMenu(editionId = getTitanEditionState().editionId) {
  const allowed = new Set(getEditionSidebarMenuIds(editionId));
  return SIDEBAR_MENU.filter((item) => allowed.has(item.id));
}
