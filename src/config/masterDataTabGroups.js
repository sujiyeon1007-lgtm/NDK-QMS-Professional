/**
 * Project TITAN — 기준정보관리 상위 탭 (Menu Freeze V1.0)
 * 상위 2탭만 · 서브탭 없음 · 좌측 Navigation + 우측 Detail
 * @see src/config/menuFreezeV1.js — MASTER_DATA_TAB_GROUPS
 */

import { MASTER_DATA_TAB_GROUPS } from "./menuFreezeV1";

export const MASTER_DATA_GROUP_PATHS = {
  company: "/settings/company",
  baseline: "/settings/baseline",
};

/** @type {Record<string, string>} */
export const MASTER_DATA_BASELINE_TAB_PATHS = {
  materials: "/settings/baseline/materials",
  processes: "/settings/baseline/processes",
  equipment: "/settings/baseline/equipment",
  workers: "/settings/baseline/workers",
};

/** @type {Record<string, string>} */
const LEGACY_TAB_TO_GROUP = {
  companies: "company",
  products: "company",
  materials: "baseline",
  processes: "baseline",
  equipment: "baseline",
  workers: "baseline",
};

/**
 * @returns {Array<{ id: string, label: string, path: string }>}
 */
export function getMasterDataTopTabs() {
  return MASTER_DATA_TAB_GROUPS.map((group) => ({
    id: group.id,
    label: group.label.replace(/^[①②③④]\s*/, ""),
    path:
      group.id === "company"
        ? MASTER_DATA_GROUP_PATHS.company
        : MASTER_DATA_BASELINE_TAB_PATHS.materials,
  }));
}

/**
 * @returns {Array<{ id: string, label: string, path: string }>}
 */
export function getMasterDataBaselineNavItems() {
  const baselineGroup = MASTER_DATA_TAB_GROUPS.find((group) => group.id === "baseline");
  if (!baselineGroup) return [];
  return baselineGroup.tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    path: MASTER_DATA_BASELINE_TAB_PATHS[tab.id] ?? `/settings/baseline/${tab.id}`,
  }));
}

/**
 * @param {string} pathname
 * @returns {string}
 */
export function resolveMasterDataGroup(pathname) {
  if (pathname.startsWith(MASTER_DATA_GROUP_PATHS.baseline)) return "baseline";
  if (pathname.startsWith(MASTER_DATA_GROUP_PATHS.company)) return "company";

  const segment = pathname.split("/").pop() ?? "";
  if (LEGACY_TAB_TO_GROUP[segment]) return LEGACY_TAB_TO_GROUP[segment];

  return "company";
}

/** @deprecated use getMasterDataTopTabs */
export function getMasterDataTabGroups() {
  return getMasterDataTopTabs().map((tab) => ({
    id: tab.id,
    label: tab.label,
    tabs: tab.id === "baseline" ? getMasterDataBaselineNavItems() : [],
    path: tab.path,
  }));
}

export function getActiveMasterDataGroup(pathname) {
  const groupId = resolveMasterDataGroup(pathname);
  return getMasterDataTabGroups().find((group) => group.id === groupId) ?? null;
}

export function resolveBaselineTabFromPath(pathname) {
  const segment = pathname.split("/").pop() ?? "";
  if (MASTER_DATA_BASELINE_TAB_PATHS[segment]) return segment;
  return "materials";
}
