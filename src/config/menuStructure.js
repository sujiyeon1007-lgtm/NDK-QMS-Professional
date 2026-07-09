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
import { OPERATION_ROUTES, OPERATION_ROUTE_GROUP } from "./operationsRouteRegistry";

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

/** RC1 Route Registry — 운영관리 Hub 상단 Tab (Toolbar) — 입고/출고 canonical */
const OPERATIONS_HUB_TABS = [
  { id: "hub", label: "운영관리", path: "/inout" },
  { id: "inbound-pending", label: "입고 대기", path: OPERATION_ROUTES.inboundPending },
  { id: "inbound-history", label: "입고 이력", path: OPERATION_ROUTES.inboundHistory },
  { id: "shipment-register", label: "출고 등록", path: OPERATION_ROUTES.shipmentRegister },
  { id: "shipment-history", label: "출고 이력", path: OPERATION_ROUTES.shipmentHistory },
  { id: "print", label: "출력관리", path: "/inout/print" },
];

/** RC1 Route Registry — 생산관리 Hub 상단 Tab (Toolbar) — canonical */
const PRODUCTION_HUB_TABS = [
  { id: "hub", label: "생산관리", path: "/production" },
  { id: "production-pending", label: "생산 대기", path: OPERATION_ROUTES.productionPending },
  { id: "equipment-status", label: "설비 가동 현황", path: OPERATION_ROUTES.equipmentStatus },
  { id: "daily-work", label: "작업일보", path: OPERATION_ROUTES.dailyWork },
  { id: "shot-status", label: "쇼트 작업현황", path: OPERATION_ROUTES.shotStatus },
  { id: "results", label: "생산실적관리", path: "/production/results" },
  { id: "print", label: "출력관리", path: "/production/print" },
];

/** RC1 Route Registry — canonical /operations/* 경로별 MenuSection (getSectionByPathname SSoT) */
const OPERATIONS_CANONICAL_MENU_SECTIONS = Object.fromEntries(
  Object.entries(OPERATION_ROUTES).map(([key, path]) => {
    const isInout = OPERATION_ROUTE_GROUP[key] === "inoutManagement";
    return [
      `operationsRoute_${key}`,
      {
        id: `operationsRoute_${key}`,
        label: isInout ? "운영관리" : "생산관리",
        pathPrefix: path,
        defaultTab: key,
        tabs: isInout ? OPERATIONS_HUB_TABS : PRODUCTION_HUB_TABS,
      },
    ];
  })
);

/** @type {Record<string, MenuSection>} */
export const MENU_SECTIONS = {
  ...buildMenuSectionsFromConfig(Object.keys(TITAN_MENU_CATALOG)),
  /** Module-gated Sidebar extras (QR 관리 · 경리 · 회계) */
  ...buildMenuSectionsFromConfig(MODULE_SIDEBAR_EXTRAS),
  /** RC1 Route Registry Freeze (2026-07-09) — 운영관리 8개 canonical 화면 */
  ...OPERATIONS_CANONICAL_MENU_SECTIONS,
  /** @deprecated Presentation 이전 — 라우트 유지 */
  inout: {
    id: "inout",
    label: "운영관리",
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
    ],
  },
  qualityDefectHistory: {
    id: "qualityDefectHistory",
    label: "불량이력관리",
    pathPrefix: "/quality/defect-history",
    defaultTab: "defect-history",
    tabs: [{ id: "defect-history", label: "불량이력관리", path: "/quality/defect-history" }],
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
  workJournalOperations: {
    id: "workJournalOperations",
    label: "영업업무일지",
    pathPrefix: "/inout/work-journal",
    defaultTab: "journal",
    tabs: [{ id: "journal", label: "영업업무일지", path: "/inout/work-journal" }],
  },
  workJournalProduction: {
    id: "workJournalProduction",
    label: "생산 업무일지",
    pathPrefix: "/production/work-journal",
    defaultTab: "journal",
    tabs: [{ id: "journal", label: "생산 업무일지", path: "/production/work-journal" }],
  },
  workJournalQuality: {
    id: "workJournalQuality",
    label: "품질 업무일지",
    pathPrefix: "/quality/work-journal",
    defaultTab: "journal",
    tabs: [{ id: "journal", label: "품질 업무일지", path: "/quality/work-journal" }],
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
  /** @deprecated 검사관리 → Sidebar quality · 품질관리 그룹 */
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
  "/inout": "/inout",
  // RC1 Route Registry — 운영관리 canonical 경로 직결 (2-hop redirect 방지)
  "/incoming": OPERATION_ROUTES.inboundPending,
  "/incoming/register": OPERATION_ROUTES.inboundPending,
  "/incoming/products": OPERATION_ROUTES.inboundPending,
  "/incoming/work-order": OPERATION_ROUTES.inboundPending,
  "/shipment": OPERATION_ROUTES.shipmentRegister,
  "/shipment/register": OPERATION_ROUTES.shipmentRegister,
  "/shipment/manage": OPERATION_ROUTES.shipmentRegister,
  "/production-plan": OPERATION_ROUTES.dailyWork,
  "/daily-work": OPERATION_ROUTES.dailyWork,
  "/work-sheet": OPERATION_ROUTES.dailyWork,
  "/production/register": OPERATION_ROUTES.dailyWork,
  "/production-results": "/production/results",
  "/inspection-log": "/quality/inspection/mass",
  "/production/defect-history": "/quality/defect-history",
  "/work-schedule": "/production/work-journal",
  "/work-journal": "/production/work-journal",
  "/department-work": "/production/work-journal",
  "/department-work/all": "/production/work-journal",
  "/department-work/production": "/production/work-journal",
  "/department-work/quality": "/quality/work-journal",
  "/department-work/sales": "/production/work-journal",
  "/personal": "/production/work-journal",
  "/personal/pending": "/production/work-journal",
  "/personal/progress": "/production/work-journal",
  "/personal/journal": "/production/work-journal",
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
  "/qr-workflow": "/production/equipment-status",
  "/qr-workflow/charging": "/production/equipment-status",
};

export const WORKSPACE_NAVIGATION = {
  operations: {
    ariaLabel: "운영관리 Workspace Navigation",
    homePath: "/inout",
    items: [
      { to: "/inout", label: "홈" },
      { to: OPERATION_ROUTES.inboundPending, label: "입고 대기" },
      { to: OPERATION_ROUTES.inboundHistory, label: "입고 이력" },
      { to: OPERATION_ROUTES.shipmentRegister, label: "출고 등록" },
      { to: OPERATION_ROUTES.shipmentHistory, label: "출고 이력" },
    ],
  },
  production: {
    ariaLabel: "생산관리 Workspace Navigation",
    homePath: "/production",
    items: [
      { to: "/production", label: "홈" },
      { to: OPERATION_ROUTES.productionPending, label: "생산 대기" },
      { to: OPERATION_ROUTES.equipmentStatus, label: "설비 가동 현황" },
      { to: OPERATION_ROUTES.dailyWork, label: "작업일보" },
      { to: OPERATION_ROUTES.shotStatus, label: "쇼트 작업현황" },
    ],
  },
  quality: {
    ariaLabel: "품질관리 Workspace Navigation",
    homePath: "/quality",
    items: [
      { to: "/quality", label: "홈" },
      { to: "/quality/inspection/mass", label: "검사관리" },
      { to: "/quality/certificate", label: "성적서" },
      { to: "/quality/defect-history", label: "부적합" },
      { to: "/quality/knowledge", label: "Knowledge Record" },
      { to: "/quality/lot-lifecycle", label: "LOT Lifecycle" },
      { to: "/documents", label: "문서관리" },
      { to: "/quality/work-journal", label: "품질 업무일지" },
    ],
  },
  master: {
    ariaLabel: "기준정보관리 Workspace Navigation",
    homePath: "/settings/hub",
    items: [
      { to: "/settings/hub", label: "홈" },
      { to: "/settings/companies", label: "거래처" },
      { to: "/settings/products", label: "제품" },
      { to: "/settings/materials", label: "재질" },
      { to: "/settings/equipment", label: "설비" },
      { to: "/settings/workers", label: "작업자" },
    ],
  },
  managementSupport: {
    ariaLabel: "경영지원 Workspace Navigation",
    homePath: "/accounting-clerk",
    items: [
      { to: "/accounting-clerk", label: "홈" },
      { to: "/accounting-clerk/companyLookup", label: "거래처 조회" },
      { to: "/accounting-clerk/shipmentStatistics", label: "출고 통계" },
      { to: "/accounting-clerk/internalItems", label: "사내 물품 관리" },
      { to: "/accounting-clerk/closingManagement", label: "마감관리" },
    ],
  },
};

export function getWorkspaceNavigation(workspaceId) {
  return WORKSPACE_NAVIGATION[workspaceId] ?? { items: [], homePath: "", ariaLabel: "Workspace Navigation" };
}
