/**
 * Project TITAN — Breadcrumb Navigation Policy (PM 공식 UX)
 * Launcher Hub · 상세 화면 공통 Navigation
 */

import { OPERATION_ROUTES } from "./operationsRouteRegistry";

export const TITAN_BREADCRUMB_POLICY = {
  placement: "header-below",
  separator: ">",
  clickableParents: true,
  currentPageNotLinked: true,
  style: "compact",
  futureScope: ["inoutManagement", "productionManagement", "qualityManagement", "masterData"],
};

/** @typedef {{ label: string, to?: string }} TitanBreadcrumbItem */

/** 생산관리 → 설비 가동 현황 공통 prefix */
export const PRODUCTION_CHARGING_BREADCRUMB_BASE = [
  { label: "생산관리", to: "/production" },
  { label: "설비 가동 현황", to: OPERATION_ROUTES.equipmentStatus },
];

/** Hub 현재 위치 — 생산관리 > 설비 가동 현황 */
export const PRODUCTION_CHARGING_HUB_BREADCRUMB = [
  { label: "생산관리", to: "/production" },
  { label: "설비 가동 현황" },
];

export const INOUT_MANAGEMENT_HUB_BREADCRUMB = [{ label: "운영관리" }];

export const PRODUCTION_MANAGEMENT_HUB_BREADCRUMB = [{ label: "생산관리" }];

export const QUALITY_MANAGEMENT_HUB_BREADCRUMB = [{ label: "품질관리" }];

export const MASTER_DATA_HUB_BREADCRUMB = [{ label: "기준정보관리" }];

/**
 * @param  {...TitanBreadcrumbItem} trail 현재 화면까지 (마지막 항목 to 없음)
 * @returns {TitanBreadcrumbItem[]}
 */
export function buildProductionChargingBreadcrumb(...trail) {
  return [...PRODUCTION_CHARGING_BREADCRUMB_BASE, ...trail];
}

/** @param {string} label */
export function breadcrumbTrailEnd(label) {
  return { label };
}

/**
 * Workspace drill-down breadcrumb (Hub → 현재 Workspace).
 * @param {{ hubLabel: string, hubPath: string, items?: Array<{ to: string, label: string }>, pathname?: string }} config
 * @returns {TitanBreadcrumbItem[]}
 */
export function buildWorkspaceDrilldownBreadcrumb({
  hubLabel,
  hubPath,
  items = [],
  pathname = "",
}) {
  const path = String(pathname).split("?")[0];
  const trail = [{ label: hubLabel, to: hubPath }];

  const sorted = [...items]
    .filter((item) => item.to && item.to !== hubPath)
    .sort((a, b) => b.to.length - a.to.length);

  const match = sorted.find((item) => path === item.to || path.startsWith(`${item.to}/`));
  if (match) {
    trail.push({ label: match.label });
  }

  return trail;
}
