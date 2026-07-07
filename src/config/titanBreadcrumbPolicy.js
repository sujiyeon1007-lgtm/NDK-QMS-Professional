/**
 * Project TITAN — Breadcrumb Navigation Policy (PM 공식 UX)
 * Launcher Hub · 상세 화면 공통 Navigation
 */

export const TITAN_BREADCRUMB_POLICY = {
  placement: "header-below",
  separator: ">",
  clickableParents: true,
  currentPageNotLinked: true,
  style: "compact",
  futureScope: ["inoutManagement", "productionManagement", "qualityManagement", "masterData"],
};

/** @typedef {{ label: string, to?: string }} TitanBreadcrumbItem */

/** 생산관리 → 설비장입 공통 prefix */
export const PRODUCTION_CHARGING_BREADCRUMB_BASE = [
  { label: "생산관리", to: "/production" },
  { label: "설비장입", to: "/production/charging" },
];

/** Hub 현재 위치 — 생산관리 > 설비장입 */
export const PRODUCTION_CHARGING_HUB_BREADCRUMB = [
  { label: "생산관리", to: "/production" },
  { label: "설비장입" },
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
