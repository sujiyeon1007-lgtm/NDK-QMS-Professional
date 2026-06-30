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
  UserRound,
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
  { id: "personal", label: "개인업무", icon: UserRound, path: "/personal" },
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
  personal: {
    id: "personal",
    label: "개인업무",
    pathPrefix: "/personal",
    defaultTab: "pending",
    tabs: [
      { id: "pending", label: "업무대기", path: "/personal/pending" },
      { id: "progress", label: "진행현황", path: "/personal/progress" },
      { id: "journal", label: "업무일지", path: "/personal/journal" },
    ],
  },
  statistics: {
    id: "statistics",
    label: "통계자료",
    pathPrefix: "/statistics",
    defaultTab: "history",
    tabs: [
      { id: "history", label: "이력조회", path: "/statistics/history" },
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
      { id: "products", label: "품목관리", path: "/settings/products" },
      { id: "workers", label: "작업자관리", path: "/settings/workers" },
      { id: "equipment", label: "설비관리", path: "/settings/equipment" },
      { id: "codes", label: "코드관리", path: "/settings/codes" },
    ],
  },
  environment: {
    id: "environment",
    label: "환경설정",
    pathPrefix: "/environment",
    defaultTab: "program",
    tabs: [
      { id: "program", label: "프로그램", path: "/environment/program" },
      { id: "path", label: "저장경로", path: "/environment/path" },
      { id: "user", label: "사용자", path: "/environment/user" },
      { id: "backup", label: "백업 / 복원", path: "/environment/backup" },
      { id: "system", label: "시스템정보", path: "/environment/system" },
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
  "/work-schedule": "/personal/pending",
  "/work-journal": "/personal/journal",
  "/history": "/statistics/history",
  "/lot-lookup": "/statistics/history",
};
