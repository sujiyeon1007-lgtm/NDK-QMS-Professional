/**
 * Project TITAN — 기준정보관리 Launcher 경로
 * @see src/config/masterDataLauncher.js
 */

import { MASTER_DATA_LAUNCHER_ITEMS } from "./masterDataLauncher";

export const MASTER_DATA_GROUP_PATHS = {
  hub: "/settings",
  companies: "/settings/companies",
  products: "/settings/products",
  materials: "/settings/materials",
  processes: "/settings/processes",
  equipment: "/settings/equipment",
  workers: "/settings/workers",
};

/** @deprecated use MASTER_DATA_GROUP_PATHS */
export const MASTER_DATA_BASELINE_TAB_PATHS = {
  materials: MASTER_DATA_GROUP_PATHS.materials,
  processes: MASTER_DATA_GROUP_PATHS.processes,
  equipment: MASTER_DATA_GROUP_PATHS.equipment,
  workers: MASTER_DATA_GROUP_PATHS.workers,
};

/** @deprecated Launcher 허브 — 탭 그룹 없음 */
export function getMasterDataTopTabs() {
  return MASTER_DATA_LAUNCHER_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    path: item.path,
  }));
}

/** @deprecated */
export function getMasterDataBaselineNavItems() {
  return MASTER_DATA_LAUNCHER_ITEMS.filter((item) =>
    ["materials", "processes", "equipment", "workers"].includes(item.id)
  ).map((item) => ({
    id: item.id,
    label: item.label,
    path: item.path,
  }));
}

export function resolveMasterDataGroup(pathname) {
  const matched = MASTER_DATA_LAUNCHER_ITEMS.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
  return matched?.id ?? "hub";
}

/** @deprecated */
export function getMasterDataTabGroups() {
  return getMasterDataTopTabs();
}

export function getActiveMasterDataGroup(pathname) {
  const groupId = resolveMasterDataGroup(pathname);
  return getMasterDataTopTabs().find((tab) => tab.id === groupId) ?? null;
}

export function resolveBaselineTabFromPath(pathname) {
  const segment = pathname.split("/").pop() ?? "";
  if (MASTER_DATA_BASELINE_TAB_PATHS[segment]) return segment;
  return "materials";
}
