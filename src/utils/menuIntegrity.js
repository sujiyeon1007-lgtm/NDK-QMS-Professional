/**
 * Project TITAN — Menu Freeze integrity checks (재발 방지)
 * Menu Freeze V1.0 — 15 menus · masterData #2
 * @see src/config/menuFreezeV1.js
 */

import {
  MENU_FREEZE_LOCKED,
  MENU_FREEZE_SIDEBAR_ORDER,
  MENU_FREEZE_SIDEBAR_GROUPS,
  PRESENTATION_MENU_DEV_ORDER,
  DEVELOPMENT_FLOW_AFTER_MENU_FREEZE,
  PRODUCT_WORKFLOW_CHAIN,
  buildSidebarGroups,
} from "../config/menuFreezeV1";
import { SIDEBAR_MENU, MENU_SECTIONS } from "../config/menuStructure";
import {
  TITAN_MENU_CATALOG,
  TITAN_MENU_ORDER,
  getApprovedSidebarMenuDefs,
} from "../config/menuConfig";
import { QMS_APPROVED_SIDEBAR_MENUS } from "../config/qmsMenuWorkflow";

/** Menu Freeze V1.0 — Sidebar id → 대표 Route */
export const REQUIRED_SIDEBAR_MENU_ROUTES = {
  home: "/home",
  masterData: "/settings",
  inboundStatus: "/inout/incoming",
  workDaily: "/production/daily-report",
  workJournal: "/work-journal",
  quality: "/quality/inspection/mass",
  certificateStatus: "/quality/certificate",
  outboundStatus: "/inout/shipment",
  inventoryStatus: "/inventory",
  history: "/history",
  documents: "/documents",
  statisticsInquiry: "/statistics/inquiry",
  accountingClerk: "/accounting-clerk",
  accounting: "/accounting",
  qrManagement: "/qr-management",
  environment: "/environment",
};

const MENU_FREEZE_ITEM_COUNT = 16;

const CRITICAL_MENU_IDS = ["documents", "history", "inventoryStatus"];

const EXPECTED_SIDEBAR_GROUP_IDS = [
  "home",
  "master",
  "operations",
  "analysis",
  "business",
  "smart",
  "system",
];

export function validateMenuIntegrity() {
  const errors = [];

  if (MENU_FREEZE_SIDEBAR_ORDER.length !== MENU_FREEZE_ITEM_COUNT) {
    errors.push(
      `MENU_FREEZE_SIDEBAR_ORDER must have ${MENU_FREEZE_ITEM_COUNT} items (got ${MENU_FREEZE_SIDEBAR_ORDER.length})`
    );
  }

  if (MENU_FREEZE_SIDEBAR_ORDER[1] !== "masterData") {
    errors.push(
      `Menu Freeze V1.0: masterData must be #2 (got ${MENU_FREEZE_SIDEBAR_ORDER[1] ?? "missing"})`
    );
  }

  const inventoryIndex = MENU_FREEZE_SIDEBAR_ORDER.indexOf("inventoryStatus");
  const outboundIndex = MENU_FREEZE_SIDEBAR_ORDER.indexOf("outboundStatus");
  const historyIndex = MENU_FREEZE_SIDEBAR_ORDER.indexOf("history");
  if (inventoryIndex <= outboundIndex || inventoryIndex >= historyIndex) {
    errors.push("재고관리 must be after 출고관리 and before 이력조회");
  }

  if (JSON.stringify(TITAN_MENU_ORDER) !== JSON.stringify(MENU_FREEZE_SIDEBAR_ORDER)) {
    errors.push("TITAN_MENU_ORDER must match MENU_FREEZE_SIDEBAR_ORDER");
  }

  if (JSON.stringify(PRESENTATION_MENU_DEV_ORDER) !== JSON.stringify(MENU_FREEZE_SIDEBAR_ORDER)) {
    errors.push("PRESENTATION_MENU_DEV_ORDER must match MENU_FREEZE_SIDEBAR_ORDER");
  }

  const expectedDevFlow = ["Workflow", "UI", "기능", "구현", "테스트", "검토", "승인"];
  if (JSON.stringify(DEVELOPMENT_FLOW_AFTER_MENU_FREEZE) !== JSON.stringify(expectedDevFlow)) {
    errors.push("DEVELOPMENT_FLOW_AFTER_MENU_FREEZE must include 검토 before 승인");
  }

  if (PRODUCT_WORKFLOW_CHAIN.length !== 8) {
    errors.push(`PRODUCT_WORKFLOW_CHAIN must have 8 items (got ${PRODUCT_WORKFLOW_CHAIN.length})`);
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
    const expectedRoute = REQUIRED_SIDEBAR_MENU_ROUTES[id];
    if (expectedRoute && item.path !== expectedRoute) {
      errors.push(`Sidebar route mismatch for ${id}: expected ${expectedRoute}, got ${item.path}`);
    }
  }

  const groupMenuIds = MENU_FREEZE_SIDEBAR_GROUPS.flatMap((group) => group.menuIds);
  if (groupMenuIds.length !== MENU_FREEZE_ITEM_COUNT) {
    errors.push(
      `MENU_FREEZE_SIDEBAR_GROUPS must cover ${MENU_FREEZE_ITEM_COUNT} menus (got ${groupMenuIds.length})`
    );
  }
  const uniqueGroupIds = new Set(groupMenuIds);
  if (uniqueGroupIds.size !== MENU_FREEZE_ITEM_COUNT) {
    errors.push("MENU_FREEZE_SIDEBAR_GROUPS contains duplicate or missing menu ids");
  }
  for (const id of MENU_FREEZE_SIDEBAR_ORDER) {
    if (!uniqueGroupIds.has(id)) {
      errors.push(`MENU_FREEZE_SIDEBAR_GROUPS missing menu id: ${id}`);
    }
  }
  const groupIds = MENU_FREEZE_SIDEBAR_GROUPS.map((group) => group.id);
  if (JSON.stringify(groupIds) !== JSON.stringify(EXPECTED_SIDEBAR_GROUP_IDS)) {
    errors.push(
      `MENU_FREEZE_SIDEBAR_GROUPS ids must be ${EXPECTED_SIDEBAR_GROUP_IDS.join(", ")} (got ${groupIds.join(", ")})`
    );
  }

  const builtGroups = buildSidebarGroups();
  if (builtGroups.length !== MENU_FREEZE_SIDEBAR_GROUPS.length) {
    errors.push("buildSidebarGroups() group count mismatch");
  }
  for (const group of builtGroups) {
    if (!group.items?.length) {
      errors.push(`buildSidebarGroups() empty group: ${group.id}`);
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
    if (hasCertificateTab) {
      errors.push("quality section must not include certificate tab (성적서관리 is separate sidebar item)");
    }
  }

  if (!MENU_SECTIONS.certificateStatus) {
    errors.push("MENU_SECTIONS missing: certificateStatus");
  }

  if (QMS_APPROVED_SIDEBAR_MENUS.length !== MENU_FREEZE_ITEM_COUNT) {
    errors.push(
      `QMS_APPROVED_SIDEBAR_MENUS must have ${MENU_FREEZE_ITEM_COUNT} items (got ${QMS_APPROVED_SIDEBAR_MENUS.length})`
    );
  }

  for (const id of MENU_FREEZE_SIDEBAR_ORDER) {
    if (!TITAN_MENU_CATALOG[id]) {
      errors.push(`menuConfig missing catalog item: ${id}`);
    }
  }

  const qualitySection = TITAN_MENU_CATALOG.quality?.section;
  if (qualitySection?.pathPrefix !== "/quality/inspection") {
    errors.push(
      `quality section pathPrefix must be /quality/inspection (got ${qualitySection?.pathPrefix})`
    );
  }

  const approvedFromConfig = getApprovedSidebarMenuDefs();
  if (approvedFromConfig.length !== MENU_FREEZE_ITEM_COUNT) {
    errors.push(`menuConfig approved sidebar count ${approvedFromConfig.length} !== ${MENU_FREEZE_ITEM_COUNT}`);
  }
  for (const { id, label } of getApprovedSidebarMenuDefs()) {
    const sidebarItem = SIDEBAR_MENU.find((row) => row.id === id);
    if (!sidebarItem) {
      errors.push(`menuConfig approved menu not in SIDEBAR_MENU: ${label} (${id})`);
    }
  }

  return { ok: errors.length === 0, errors };
}

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
