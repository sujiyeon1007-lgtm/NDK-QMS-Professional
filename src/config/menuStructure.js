/**
 * Project TITAN Professional V1.0 — PM 최종 승인 메뉴 구조
 * 변경 시 PM 승인 필요
 *
 * Sidebar: 1Depth only (8 menus)
 * Sub-functions: 상단 Tab (각 섹션 페이지)
 */

import {
  Home,
  ArrowLeftRight,
  Factory,
  ShieldCheck,
  Briefcase,
  BarChart3,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

/** @typedef {{ id: string, label: string, path: string }} MenuTab */
/** @typedef {{ id: string, label: string, icon: import("react").ComponentType, path: string, end?: boolean }} SidebarItem */
/** @typedef {{ id: string, label: string, pathPrefix: string, defaultTab: string, tabs: MenuTab[] }} MenuSection */

/** @type {SidebarItem[]} — 사이드바 1Depth (하위 메뉴 없음) */
export const SIDEBAR_MENU = [
  { id: "home", label: "HOME", icon: Home, path: "/", end: true },
  { id: "inout", label: "입출고관리", icon: ArrowLeftRight, path: "/inout" },
  { id: "production", label: "생산관리", icon: Factory, path: "/production" },
  { id: "quality", label: "품질관리", icon: ShieldCheck, path: "/quality/inspection" },
  { id: "departmentWork", label: "부서별 업무", icon: Briefcase, path: "/department-work" },
  { id: "statistics", label: "통계자료", icon: BarChart3, path: "/statistics" },
  { id: "master", label: "기준정보관리", icon: Settings, path: "/settings" },
  { id: "environment", label: "환경설정", icon: SlidersHorizontal, path: "/environment" },
];

/** @type {Record<string, MenuSection>} */
export const MENU_SECTIONS = {
  inout: {
    id: "inout",
    label: "입출고관리",
    pathPrefix: "/inout",
    defaultTab: "incoming",
    tabs: [
      { id: "incoming", label: "입고관리", path: "/inout/incoming" },
      { id: "shipment", label: "출고관리", path: "/inout/shipment" },
    ],
  },
  production: {
    id: "production",
    label: "생산관리",
    pathPrefix: "/production",
    defaultTab: "daily-report",
    tabs: [
      { id: "daily-report", label: "생산일보", path: "/production/daily-report" },
      { id: "results", label: "생산실적관리", path: "/production/results" },
      { id: "defect-history", label: "불량이력관리", path: "/production/defect-history" },
    ],
  },
  quality: {
    id: "quality",
    label: "품질관리",
    pathPrefix: "/quality",
    defaultTab: "inspection",
    tabs: [
      { id: "inspection", label: "검사일지", path: "/quality/inspection" },
      { id: "certificate", label: "성적서관리", path: "/quality/certificate" },
    ],
  },
  departmentWork: {
    id: "departmentWork",
    label: "부서별 업무",
    pathPrefix: "/department-work",
    defaultTab: "all",
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
    defaultTab: "inquiry",
    tabs: [
      { id: "inquiry", label: "통계조회", path: "/statistics/inquiry" },
      { id: "production", label: "생산통계", path: "/statistics/production" },
      { id: "quality", label: "품질통계", path: "/statistics/quality" },
      { id: "shipment", label: "출고통계", path: "/statistics/shipment" },
      { id: "sales", label: "영업실적", path: "/statistics/sales" },
    ],
  },
  master: {
    id: "master",
    label: "기준정보관리",
    pathPrefix: "/settings",
    defaultTab: "companies",
    tabs: [
      { id: "companies", label: "업체관리", path: "/settings/companies" },
      { id: "products", label: "제품 Master", path: "/settings/products" },
      { id: "materials", label: "재질관리", path: "/settings/materials" },
      { id: "processes", label: "공정관리", path: "/settings/processes" },
      { id: "equipment", label: "설비관리", path: "/settings/equipment" },
      { id: "workers", label: "작업자 Master", path: "/settings/workers" },
      { id: "employees", label: "직원 정보관리", path: "/settings/employees" },
      { id: "inspection", label: "검사기준관리", path: "/settings/inspection" },
      { id: "customCodes", label: "사용자정의코드", path: "/settings/customCodes" },
    ],
  },
  environment: {
    id: "environment",
    label: "환경설정",
    pathPrefix: "/environment",
    defaultTab: "company",
    tabs: [
      { id: "company", label: "회사정보", path: "/environment/company" },
      { id: "users", label: "사용자관리", path: "/environment/users" },
      { id: "permissions", label: "권한관리", path: "/environment/permissions" },
      { id: "notifications", label: "알림설정", path: "/environment/notifications" },
      { id: "backup", label: "백업 / 복원", path: "/environment/backup" },
      { id: "logs", label: "로그관리", path: "/environment/logs" },
      { id: "program", label: "프로그램 설정", path: "/environment/program" },
      { id: "data", label: "데이터 관리", path: "/environment/data" },
      { id: "status", label: "시스템 상태", path: "/environment/status" },
      { id: "about", label: "정보 (About)", path: "/environment/about" },
    ],
  },
};

/** 입출고관리 — 탭별 기능 (화면 설계 참조) */
export const INOUT_TAB_FEATURES = {
  incoming: ["입고 등록", "입고 제품 관리", "작업지시서 출력", "생산부 전달"],
  shipment: ["출고 등록", "출고 관리", "거래명세서 출력", "출고 처리"],
};

/** PM 확정 업무 Workflow (참조용) */
export const WORKFLOW_STEPS = [
  "입고 등록",
  "작업지시서 출력",
  "생산부 전달",
  "생산정보 등록",
  "검사일지",
  "성적서 발행",
  "출고",
  "이력조회",
];

export function getSectionById(sectionId) {
  return MENU_SECTIONS[sectionId] ?? null;
}

export function getSectionByPathname(pathname) {
  for (const section of Object.values(MENU_SECTIONS)) {
    if (pathname === section.pathPrefix || pathname.startsWith(`${section.pathPrefix}/`)) {
      return section;
    }
  }
  return null;
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

/** 구 라우트 → PM V1.0 라우트 (호환 리다이렉트) */
export const LEGACY_ROUTE_REDIRECTS = {
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
  "/inspection-log": "/quality/inspection",
  "/certificate": "/quality/certificate",
  "/work-schedule": "/department-work/all",
  "/work-journal": "/department-work/all",
  "/personal": "/department-work/all",
  "/personal/pending": "/department-work/all",
  "/personal/progress": "/department-work/all",
  "/personal/journal": "/department-work/all",
  "/history": "/statistics/inquiry",
  "/lot-lookup": "/statistics/inquiry",
  "/statistics/history": "/statistics/inquiry",
  "/settings/items": "/settings/products",
  "/settings/codes": "/settings/customCodes",
  "/environment/path": "/environment/program",
  "/environment/user": "/environment/users",
  "/environment/system": "/environment/status",
};
