/**
 * Project TITAN — Menu Freeze integrity checks (재발 방지)
 * Menu Freeze V2.0 Blueprint — 9 sidebar menus · Launcher Hub
 * Sprint 3E — 제품현황 제거 · Control Room(설비현황) Product View 흡수
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

/** Menu Freeze V2.0 Blueprint — Sidebar id → Hub Route */
export const REQUIRED_SIDEBAR_MENU_ROUTES = {
  home: "/home",
  equipmentStatus: "/equipment-status",
  inoutManagement: "/inout",
  productionManagement: "/production",
  qualityManagement: "/quality",
  statisticsInquiry: "/statistics/dashboard",
  masterData: "/settings",
  environment: "/environment",
  companyInfo: "/company",
};

const MENU_FREEZE_ITEM_COUNT = 9;

const CRITICAL_MENU_IDS = [
  "inoutManagement",
  "productionManagement",
  "qualityManagement",
  "documents",
];

const EXPECTED_SIDEBAR_GROUP_IDS = ["home", "mes", "operations", "quality", "executive", "system"];

export function validateMenuIntegrity() {
  const errors = [];

  if (MENU_FREEZE_SIDEBAR_ORDER.length !== MENU_FREEZE_ITEM_COUNT) {
    errors.push(
      `MENU_FREEZE_SIDEBAR_ORDER must have ${MENU_FREEZE_ITEM_COUNT} items (got ${MENU_FREEZE_SIDEBAR_ORDER.length})`
    );
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

  for (const group of MENU_FREEZE_SIDEBAR_GROUPS) {
    if (group.id !== "home" && !group.label) {
      errors.push(`MENU_FREEZE_SIDEBAR_GROUPS missing label: ${group.id}`);
    }
  }

  const operationsGroup = MENU_FREEZE_SIDEBAR_GROUPS.find((group) => group.id === "operations");
  if (JSON.stringify(operationsGroup?.menuIds) !== JSON.stringify(["inoutManagement", "productionManagement"])) {
    errors.push("운영관리 group must be inoutManagement + productionManagement only");
  }

  const qualityGroup = MENU_FREEZE_SIDEBAR_GROUPS.find((group) => group.id === "quality");
  if (JSON.stringify(qualityGroup?.menuIds) !== JSON.stringify(["qualityManagement"])) {
    errors.push("품질관리 group must contain qualityManagement Launcher only");
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
  }

  const qualitySection = TITAN_MENU_CATALOG.quality?.section;
  if (qualitySection?.pathPrefix !== "/quality/inspection") {
    errors.push(
      `quality section pathPrefix must be /quality/inspection (got ${qualitySection?.pathPrefix})`
    );
  }
  const hasCertificateTab = qualitySection?.tabs?.some((tab) => tab.id === "certificate");
  if (hasCertificateTab) {
    errors.push("quality section must not include certificate tab (성적서관리 is separate sidebar item)");
  }

  const qualityHub = TITAN_MENU_CATALOG.qualityManagement;
  if (qualityHub?.path !== "/quality") {
    errors.push(`qualityManagement hub path must be /quality (got ${qualityHub?.path})`);
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
