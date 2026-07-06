/**
 * Project TITAN — PQMS Menu Structure
 * Menu Freeze V1.0 (2026-07-04) — 15 Sidebar menus · Menu Simple, Function Deep
 *
 * Source of truth: src/config/menuConfig.js · src/config/menuFreezeV1.js
 */

import {
  buildMenuSectionsFromConfig,
  buildSidebarMenuFromConfig,
  getBreadcrumbByPathname,
  getMenuCatalogItem,
  getPageMetaByMenuId,
  TITAN_MENU_CATALOG,
  TITAN_MENU_ORDER,
} from "./menuConfig";
import { MENU_FREEZE_SIDEBAR_ORDER } from "./menuFreezeV1";
import { MODULE_SIDEBAR_EXTRAS } from "./titanV12ModuleExpansion";

/** @typedef {{ id: string, label: string, path: string }} MenuTab */
/** @typedef {{ id: string, label: string, icon: import("react").ComponentType, path: string, end?: boolean }} SidebarItem */
/** @typedef {{ id: string, label: string, pathPrefix: string, defaultTab: string, tabs: MenuTab[], deprecated?: boolean }} MenuSection */

/** @type {SidebarItem[]} — menuConfig · Menu Freeze V1.3 */
export const SIDEBAR_MENU = buildSidebarMenuFromConfig(TITAN_MENU_ORDER);

export {
  TITAN_MENU_CATALOG,
  TITAN_MENU_ORDER,
  getBreadcrumbByPathname,
  getMenuCatalogItem,
  getPageMetaByMenuId,
  buildSidebarMenuFromConfig,
  buildMenuSectionsFromConfig,
  getApprovedSidebarMenuDefs,
} from "./menuConfig";

/** @deprecated use getMenuCatalogItem — legacy alias */
export const SIDEBAR_MENU_BY_ID = Object.fromEntries(
  Object.entries(TITAN_MENU_CATALOG).map(([id, item]) => [
    id,
    { id: item.id, label: item.label, icon: item.icon, path: item.path, end: item.end },
  ])
);

/** @type {Record<string, MenuSection>} */
export const MENU_SECTIONS = {
  ...buildMenuSectionsFromConfig(TITAN_MENU_ORDER),
  /** Module-gated Sidebar extras (QR 관리 · 경리 · 회계) */
  ...buildMenuSectionsFromConfig(MODULE_SIDEBAR_EXTRAS),
  /** @deprecated Presentation 이전 — 라우트 유지 */
  inout: {
    id: "inout",
    label: "입출고관리",
    pathPrefix: "/inout",
    defaultTab: "incoming",
    deprecated: true,
    tabs: [
      { id: "incoming", label: "입고현황", path: "/inout/incoming" },
      { id: "shipment", label: "출고현황", path: "/inout/shipment" },
    ],
  },
  production: {
    id: "production",
    label: "열처리관리",
    pathPrefix: "/production",
    defaultTab: "daily-report",
    deprecated: true,
    tabs: [
      { id: "daily-report", label: "열처리일보", path: "/production/daily-report" },
      { id: "results", label: "생산실적관리", path: "/production/results" },
      { id: "defect-history", label: "불량이력관리", path: "/production/defect-history" },
    ],
  },
  qualityLegacy: {
    id: "qualityLegacy",
    label: "품질관리",
    pathPrefix: "/quality",
    defaultTab: "inspection",
    deprecated: true,
    tabs: [
      { id: "inspection", label: "검사관리", path: "/quality/inspection" },
      { id: "certificate", label: "성적서관리", path: "/quality/certificate" },
    ],
  },
  departmentWork: {
    id: "departmentWork",
    label: "부서별 업무",
    pathPrefix: "/department-work",
    defaultTab: "all",
    deprecated: true,
    tabs: [
      { id: "all", label: "전체", path: "/department-work/all" },
      { id: "production", label: "생산부", path: "/department-work/production" },
      { id: "quality", label: "품질부", path: "/department-work/quality" },
      { id: "sales", label: "영업부", path: "/department-work/sales" },
    ],
  },
  statistics: {
    id: "statistics",
    label: "통계자료",
    pathPrefix: "/statistics",
    defaultTab: "production",
    deprecated: true,
    tabs: [
      { id: "production", label: "전체 생산통계", path: "/statistics/production" },
      { id: "quality", label: "품질통계", path: "/statistics/quality" },
      { id: "sales", label: "영업통계", path: "/statistics/sales" },
    ],
  },
  qualityManagement: {
    id: "qualityManagement",
    label: "품질관리",
    pathPrefix: "/quality/inspection",
    defaultTab: "inspection",
    deprecated: true,
    tabs: [{ id: "inspection", label: "품질관리", path: "/quality/inspection" }],
  },
  /** @deprecated 검사관리 → 품질관리 · qualityManagement 사용 */
  inspectionManagement: {
    id: "inspectionManagement",
    label: "검사관리",
    pathPrefix: "/quality/inspection-legacy",
    defaultTab: "inspection",
    deprecated: true,
    tabs: [],
  },
  certificateManagement: {
    id: "certificateManagement",
    label: "성적서관리",
    pathPrefix: "/quality/certificate",
    defaultTab: "certificate",
    deprecated: true,
    tabs: [{ id: "certificate", label: "성적서관리", path: "/quality/certificate" }],
  },
};

/** 입고현황 — STEP 1 Workflow (등록 · Master 연동 · Traceability 시작) */
export const INBOUND_STATUS_FEATURES = [
  "입고현황 등록 (Presentation · 수동)",
  "관리번호 자동 생성",
  "품번 → 제품 Master 자동입력",
  "발주번호(선택) · 업체 LOT",
  "작업일보 이동",
];

/** @deprecated use INBOUND_STATUS_FEATURES */
export const INOUT_TAB_FEATURES = {
  incoming: INBOUND_STATUS_FEATURES,
  shipment: ["출고 등록", "출고 관리", "거래명세서 출력", "출고 처리"],
};

/** QMS Traceability Workflow — Menu Freeze V1.0 */
export const WORKFLOW_STEPS = [
  "HOME",
  "기준정보관리",
  "입고관리",
  "열처리관리",
  "검사관리",
  "성적서관리",
  "출고관리",
  "재고관리",
  "이력조회",
  "문서관리",
  "통계관리",
  "관리자",
];

export function getSectionById(sectionId) {
  return MENU_SECTIONS[sectionId] ?? null;
}

export function getSectionByPathname(pathname) {
  const matches = Object.values(MENU_SECTIONS).filter(
    (section) =>
      pathname === section.pathPrefix || pathname.startsWith(`${section.pathPrefix}/`)
  );
  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    if (!a.deprecated && b.deprecated) return -1;
    if (a.deprecated && !b.deprecated) return 1;
    return b.pathPrefix.length - a.pathPrefix.length;
  });
  return matches[0];
}

export function matchSidebarActive(item, pathname) {
  if (item.end) {
    return pathname === item.path;
  }
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

export function getActiveTab(section, pathname) {
  const matched = section.tabs.find(
    (tab) => pathname === tab.path || pathname.startsWith(`${tab.path}/`)
  );
  return matched ?? section.tabs.find((tab) => tab.id === section.defaultTab) ?? section.tabs[0];
}

/** 구 라우트 → QMS 라우트 (호환 리다이렉트) */
export const LEGACY_ROUTE_REDIRECTS = {
  "/dashboard": "/home",
  "/inout": "/inout/incoming",
  "/incoming": "/inout/incoming",
  "/incoming/register": "/inout/incoming",
  "/incoming/products": "/inout/incoming",
  "/incoming/work-order": "/inout/incoming",
  "/shipment": "/inout/shipment",
  "/shipment/register": "/inout/shipment",
  "/shipment/manage": "/inout/shipment",
  "/production-plan": "/production/daily-report",
  "/daily-work": "/production/daily-report",
  "/work-sheet": "/production/daily-report",
  "/production/register": "/production/daily-report",
  "/production-results": "/production/results",
  "/inspection-log": "/quality/inspection/mass",
  "/certificate": "/quality/certificate",
  "/work-schedule": "/work-journal",
  "/work-journal": "/work-journal",
  "/department-work": "/work-journal",
  "/department-work/all": "/work-journal",
  "/department-work/production": "/work-journal",
  "/department-work/quality": "/work-journal",
  "/department-work/sales": "/work-journal",
  "/personal": "/work-journal",
  "/personal/pending": "/work-journal",
  "/personal/progress": "/work-journal",
  "/personal/journal": "/work-journal",
  "/lot-lookup": "/history",
  "/stock": "/inventory",
  "/inventory-status": "/inventory",
  "/statistics/history": "/history",
  "/statistics/inquiry": "/statistics/production",
  "/statistics/inquiry-legacy": "/statistics/production",
  "/statistics/shipment": "/statistics/sales",
  "/statistics": "/statistics/production",
  "/settings/items": "/settings",
  "/settings/codes": "/environment/customCodes",
  "/master-data": "/settings",
  "/settings/companies": "/settings/companies",
  "/settings/products": "/settings/products",
  "/settings/company": "/settings/companies",
  "/settings/materials": "/settings/materials",
  "/settings/processes": "/settings/processes",
  "/settings/equipment": "/settings/equipment",
  "/settings/workers": "/settings/workers",
  "/settings/baseline": "/settings/materials",
  "/settings/baseline/materials": "/settings/materials",
  "/settings/baseline/processes": "/settings/processes",
  "/settings/baseline/equipment": "/settings/equipment",
  "/settings/baseline/workers": "/settings/workers",
  "/settings/employees": "/environment/employees",
  "/settings/inspection": "/documents/inspection",
  "/settings/customCodes": "/environment/customCodes",
  "/documents": "/documents",
  "/document": "/documents",
  "/documents/drawings": "/documents",
  "/documents/inspection": "/documents/inspection",
  "/documents/work-standard": "/documents",
  "/documents/control-plan": "/documents",
  "/documents/fmea": "/documents",
  "/documents/customer-requirements": "/documents",
  "/documents/concession": "/documents",
  "/documents/ncr": "/documents",
  "/documents/quality-notice": "/documents",
  "/documents/other": "/documents",
  "/environment/path": "/environment/program",
  "/environment/user": "/environment/users",
  "/environment/system": "/environment/status",
  "/environment/documents": "/documents",
  "/notices": "/documents",
};
