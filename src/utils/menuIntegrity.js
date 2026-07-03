/**
 * Project TITAN — Menu Freeze integrity checks (재발 방지)
 * @see src/config/menuFreezeV1.js
 * @see src/config/menuStructure.js
 * @see src/config/qmsMenuWorkflow.js
 */

import { MENU_FREEZE_LOCKED, MENU_FREEZE_SIDEBAR_ORDER } from "../config/menuFreezeV1";
import { SIDEBAR_MENU, MENU_SECTIONS } from "../config/menuStructure";
import {
  TITAN_MENU_CATALOG,
  TITAN_MENU_ORDER,
  getApprovedSidebarMenuDefs,
} from "../config/menuConfig";
import { QMS_APPROVED_SIDEBAR_MENUS } from "../config/qmsMenuWorkflow";

/** Menu Freeze V1.0 — 필수 Sidebar id → 대표 Route */
export const REQUIRED_SIDEBAR_MENU_ROUTES = {
  home: "/home",
  inboundStatus: "/inout/incoming",
  workDaily: "/production/daily-report",
  quality: "/quality/inspection",
  documents: "/documents",
  masterData: "/settings",
  outboundStatus: "/inout/shipment",
  history: "/history",
  environment: "/environment",
};

const CRITICAL_MENU_IDS = ["documents", "history"];

export function validateMenuIntegrity() {
  const errors = [];

  if (MENU_FREEZE_SIDEBAR_ORDER.length !== 9) {
    errors.push(`MENU_FREEZE_SIDEBAR_ORDER must have 9 items (got ${MENU_FREEZE_SIDEBAR_ORDER.length})`);
  }

  if (SIDEBAR_MENU.length !== MENU_FREEZE_SIDEBAR_ORDER.length) {
    errors.push(
      `SIDEBAR_MENU length mismatch: ${SIDEBAR_MENU.length} rendered vs ${MENU_FREEZE_SIDEBAR_ORDER.length} frozen`
    );
  }

  for (const id of MENU_FREEZE_SIDEBAR_ORDER) {
    const item = SIDEBAR_MENU.find((row) => row.id === id);
    if (!item) {
      errors.push(`Sidebar menu missing: ${id}`);
      continue;
    }
    if (!item.path) {
      errors.push(`Sidebar menu path missing: ${id}`);
    }
    if (!item.label) {
      errors.push(`Sidebar menu label missing: ${id}`);
    }
  }

  for (const id of CRITICAL_MENU_IDS) {
    if (!MENU_SECTIONS[id]) {
      errors.push(`MENU_SECTIONS missing: ${id}`);
    }
    if (MENU_SECTIONS[id]?.deprecated) {
      errors.push(`MENU_SECTIONS deprecated (must be active): ${id}`);
    }
  }

  const menuQualitySection = MENU_SECTIONS.quality;
  if (!menuQualitySection) {
    errors.push("MENU_SECTIONS missing: quality");
  } else {
    const hasCertificateTab = menuQualitySection.tabs?.some((tab) => tab.id === "certificate");
    if (!hasCertificateTab) {
      errors.push("quality section must include certificate tab");
    }
  }

  if (QMS_APPROVED_SIDEBAR_MENUS.length !== 9) {
    errors.push(`QMS_APPROVED_SIDEBAR_MENUS must have 9 items (got ${QMS_APPROVED_SIDEBAR_MENUS.length})`);
  }

  if (Object.keys(TITAN_MENU_CATALOG).length < 9) {
    errors.push(`TITAN_MENU_CATALOG must define all 9 Menu Freeze items`);
  }

  for (const id of MENU_FREEZE_SIDEBAR_ORDER) {
    if (!TITAN_MENU_CATALOG[id]) {
      errors.push(`menuConfig missing catalog item: ${id}`);
    }
  }

  const qualitySection = TITAN_MENU_CATALOG.quality?.section;
  if (qualitySection?.pathPrefix !== "/quality") {
    errors.push(`quality section pathPrefix must be /quality (got ${qualitySection?.pathPrefix})`);
  }
  const qualityTabIds = (qualitySection?.tabs ?? []).map((tab) => tab.id);
  if (!qualityTabIds.includes("inspection") || !qualityTabIds.includes("certificate")) {
    errors.push("quality section must include inspection and certificate tabs");
  }

  const approvedFromConfig = getApprovedSidebarMenuDefs();
  if (approvedFromConfig.length !== 9) {
    errors.push(`menuConfig approved sidebar count ${approvedFromConfig.length} !== 9`);
  }
  for (const { id, label } of getApprovedSidebarMenuDefs()) {
    const sidebarItem = SIDEBAR_MENU.find((row) => row.id === id);
    if (!sidebarItem) {
      errors.push(`menuConfig approved menu not in SIDEBAR_MENU: ${label} (${id})`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/** DEV — 앱 부팅 시 Menu Freeze 무결성 검사 */
export function assertMenuIntegrityInDev() {
  if (!import.meta.env.DEV) return validateMenuIntegrity();

  const result = validateMenuIntegrity();
  if (!result.ok) {
    console.error("[Project TITAN Menu Integrity]", result.errors.join("\n"));
  }
  return result;
}

export function getMenuFreezeSidebarMenu() {
  if (!MENU_FREEZE_LOCKED) return SIDEBAR_MENU;
  return TITAN_MENU_ORDER.map((id) => SIDEBAR_MENU.find((row) => row.id === id)).filter(Boolean);
}
