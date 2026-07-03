/**
 * Project TITAN (NDK PQMS) — menuConfig (Single Source of Truth)
 * Sidebar · Router Section · Breadcrumb · Page Meta — 한 곳만 수정
 *
 * @see src/config/menuFreezeV1.js — Menu Freeze V1.3 잠금
 * @see src/config/menuStructure.js — re-export · legacy sections
 */

import {
  Home,
  ClipboardList,
  Package,
  NotebookPen,
  BookOpen,
  ShieldCheck,
  Layers,
  FileText,
  Truck,
  History,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";

import {
  MENU_FREEZE_SIDEBAR_ORDER,
  MENU_FREEZE_SIDEBAR_GROUPS,
  buildSidebarGroups,
} from "./menuFreezeV1";

/** @typedef {{ id: string, label: string, path: string }} MenuTab */
/** @typedef {{ id: string, label: string, icon: import("react").ComponentType, path: string, end?: boolean }} SidebarItem */
/** @typedef {{ kicker?: string, title: string, description?: string }} MenuPageMeta */
/** @typedef {{ id: string, label: string, pathPrefix: string, defaultTab: string, tabs: MenuTab[], deprecated?: boolean }} MenuSection */

/**
 * @type {Record<string, {
 *   id: string,
 *   label: string,
 *   path: string,
 *   icon: import("react").ComponentType,
 *   end?: boolean,
 *   section: Omit<MenuSection, 'id' | 'label'>,
 *   pageMeta: MenuPageMeta,
 *   breadcrumb: string[],
 * }>}
 */
export const TITAN_MENU_CATALOG = {
  home: {
    id: "home",
    label: "HOME",
    path: "/home",
    icon: Home,
    end: true,
    section: {
      pathPrefix: "/home",
      defaultTab: "dashboard",
      tabs: [{ id: "dashboard", label: "HOME", path: "/home" }],
    },
    pageMeta: {
      kicker: "Main Dashboard",
      title: "HOME",
      description: "금일 운영 현황과 실시간 제품 진행 상태를 확인합니다.",
    },
    breadcrumb: ["HOME"],
  },
  inboundStatus: {
    id: "inboundStatus",
    label: "입고현황",
    path: "/inout/incoming",
    icon: ClipboardList,
    section: {
      pathPrefix: "/inout/incoming",
      defaultTab: "status",
      tabs: [{ id: "status", label: "입고현황", path: "/inout/incoming" }],
    },
    pageMeta: {
      kicker: "PQMS Workflow",
      title: "입고현황",
      description:
        "STEP 1 — PQMS 첫 업무 · MES 입고 원칙 · Presentation 수동 등록 · 관리번호 Traceability 시작",
    },
    breadcrumb: ["입고현황"],
  },
  inventoryStatus: {
    id: "inventoryStatus",
    label: "재고현황",
    path: "/inventory",
    icon: Package,
    end: true,
    section: {
      pathPrefix: "/inventory",
      defaultTab: "status",
      tabs: [{ id: "status", label: "재고현황", path: "/inventory" }],
    },
    pageMeta: {
      kicker: "PQMS Inventory",
      title: "재고현황",
      description:
        "입고현황 · 작업일보 · 출고현황 데이터 기반 자동 계산 — 직접 입력 없음 · One Source of Truth",
    },
    breadcrumb: ["재고현황"],
  },
  workDaily: {
    id: "workDaily",
    label: "작업일보",
    path: "/production/daily-report",
    icon: NotebookPen,
    section: {
      pathPrefix: "/production/daily-report",
      defaultTab: "daily-report",
      tabs: [{ id: "daily-report", label: "작업일보", path: "/production/daily-report" }],
    },
    pageMeta: {
      kicker: "품질 Workflow",
      title: "작업일보",
      description: "LOT 생성 · Traceability 기준 — 작업일·작업자·설비·처리조건·작업수량·작업 완료",
    },
    breadcrumb: ["작업일보"],
  },
  workJournal: {
    id: "workJournal",
    label: "업무일지",
    path: "/work-journal",
    icon: BookOpen,
    end: true,
    section: {
      pathPrefix: "/work-journal",
      defaultTab: "journal",
      tabs: [{ id: "journal", label: "업무일지", path: "/work-journal" }],
    },
    pageMeta: {
      kicker: "업무 기록",
      title: "업무일지",
      description:
        "담당자 업무 기록 · 특이사항 — 사람 중심 (Workflow 미포함) · 입고검사 · 성적서 · NCR · 회의 · 설비점검",
    },
    breadcrumb: ["업무일지"],
  },
  quality: {
    id: "quality",
    label: "품질관리",
    path: "/quality/inspection",
    icon: ShieldCheck,
    section: {
      pathPrefix: "/quality",
      defaultTab: "inspection",
      tabs: [
        { id: "inspection", label: "검사일지", path: "/quality/inspection" },
        { id: "certificate", label: "성적서", path: "/quality/certificate" },
      ],
    },
    pageMeta: {
      kicker: "품질관리",
      title: "품질관리",
      description: "검사 결과를 등록하고 성적서 작성 전 데이터를 관리합니다.",
    },
    breadcrumb: ["품질관리"],
  },
  documents: {
    id: "documents",
    label: "문서관리",
    path: "/documents",
    icon: FileText,
    section: {
      pathPrefix: "/documents",
      defaultTab: "management",
      tabs: [{ id: "management", label: "문서관리", path: "/documents" }],
    },
    pageMeta: {
      kicker: "품질문서",
      title: "문서관리",
      description:
        "도면 · 검사기준서 · 작업표준서 · FMEA · 품질공지 등 기준 문서 — Revision · 승인 · PDF · 문서이력",
    },
    breadcrumb: ["문서관리"],
  },
  masterData: {
    id: "masterData",
    label: "기준정보관리",
    path: "/settings",
    icon: Layers,
    section: {
      pathPrefix: "/settings",
      defaultTab: "hub",
      tabs: [{ id: "hub", label: "기준정보관리", path: "/settings" }],
    },
    pageMeta: {
      kicker: "기준정보",
      title: "기준정보관리",
      description:
        "거래처·제품·재질·공정·설비·작업자·직원·검사기준·코드 등 Master Data — 문서관리와 독립",
    },
    breadcrumb: ["기준정보관리"],
  },
  outboundStatus: {
    id: "outboundStatus",
    label: "출고현황",
    path: "/inout/shipment",
    icon: Truck,
    section: {
      pathPrefix: "/inout/shipment",
      defaultTab: "shipment",
      tabs: [{ id: "shipment", label: "출고현황", path: "/inout/shipment" }],
    },
    pageMeta: {
      kicker: "품질관리",
      title: "출고현황",
      description: "MES 출고 연계 — 출고 준비 · 거래명세서 · 부분출고 · 잔량 · 출고이력 (출고 등록 = MES)",
    },
    breadcrumb: ["출고현황"],
  },
  history: {
    id: "history",
    label: "이력조회",
    path: "/history",
    icon: History,
    section: {
      pathPrefix: "/history",
      defaultTab: "inquiry",
      tabs: [{ id: "inquiry", label: "이력조회", path: "/history" }],
    },
    pageMeta: {
      kicker: "이력관리",
      title: "이력조회",
      description:
        "관리번호 · LOT · 발주번호 기준 품질 Traceability — 입고현황 → 작업일보 → 품질관리 → 출고현황",
    },
    breadcrumb: ["이력조회"],
  },
  statisticsInquiry: {
    id: "statisticsInquiry",
    label: "통계조회",
    path: "/statistics/inquiry",
    icon: BarChart3,
    section: {
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
    pageMeta: {
      kicker: "PQMS Analytics",
      title: "통계조회",
      description:
        "Dashboard · 입고 · 출고 · 재고 · 품질 · LOT · 작업량 · 성적서 — 업무 데이터 자동 집계 (조회 전용)",
    },
    breadcrumb: ["통계조회"],
  },
  environment: {
    id: "environment",
    label: "환경설정",
    path: "/environment",
    icon: SlidersHorizontal,
    section: {
      pathPrefix: "/environment",
      defaultTab: "program",
      tabs: [
        { id: "program", label: "프로그램 설정", path: "/environment/program" },
        { id: "status", label: "시스템 설정", path: "/environment/status" },
        { id: "backup", label: "백업 / 복원", path: "/environment/backup" },
        { id: "logs", label: "로그관리", path: "/environment/logs" },
        { id: "users", label: "사용자관리", path: "/environment/users" },
        { id: "permissions", label: "권한관리", path: "/environment/permissions" },
        { id: "employees", label: "직원정보관리", path: "/environment/employees" },
        { id: "customCodes", label: "사용자정의코드", path: "/environment/customCodes" },
      ],
    },
    pageMeta: {
      kicker: "시스템",
      title: "환경설정",
      description: "회사정보 · 사용자 · 권한 · 백업 · 로그 등 시스템 전반 설정을 관리합니다.",
    },
    breadcrumb: ["환경설정"],
  },
};

/** Menu Freeze V1.3 — Sidebar 순서 (id) */
export const TITAN_MENU_ORDER = MENU_FREEZE_SIDEBAR_ORDER;

/** @type {SidebarItem[]} */
export function buildSidebarMenuFromConfig(order = TITAN_MENU_ORDER) {
  return order
    .map((id) => {
      const item = TITAN_MENU_CATALOG[id];
      if (!item) return null;
      return {
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
        end: item.end,
      };
    })
    .filter(Boolean);
}

/** @type {Record<string, MenuSection>} */
export function buildMenuSectionsFromConfig(order = TITAN_MENU_ORDER) {
  /** @type {Record<string, MenuSection>} */
  const sections = {};
  order.forEach((id) => {
    const item = TITAN_MENU_CATALOG[id];
    if (!item) return;
    sections[id] = {
      id: item.id,
      label: item.label,
      ...item.section,
    };
  });
  return sections;
}

/** @type {Record<string, MenuPageMeta>} */
export function buildPageMetaFromConfig(order = TITAN_MENU_ORDER) {
  /** @type {Record<string, MenuPageMeta>} */
  const meta = {};
  order.forEach((id) => {
    const item = TITAN_MENU_CATALOG[id];
    if (!item?.pageMeta) return;
    meta[id] = item.pageMeta;
  });
  return meta;
}

export function getMenuCatalogItem(menuId) {
  return TITAN_MENU_CATALOG[menuId] ?? null;
}

export function getMenuCatalogItemByPath(pathname = "") {
  const path = String(pathname).split("?")[0];
  const ordered = TITAN_MENU_ORDER.map((id) => TITAN_MENU_CATALOG[id]).filter(Boolean);
  const sorted = [...ordered].sort((a, b) => b.path.length - a.path.length);
  return sorted.find((item) => path === item.path || path.startsWith(`${item.path}/`)) ?? null;
}

export function getMenuSectionFromConfig(menuId) {
  const item = TITAN_MENU_CATALOG[menuId];
  if (!item) return null;
  return { id: item.id, label: item.label, ...item.section };
}

export function resolveMenuSectionByPathname(pathname, extraSections = {}) {
  const sections = Object.values({ ...buildMenuSectionsFromConfig(), ...extraSections }).sort(
    (a, b) => b.pathPrefix.length - a.pathPrefix.length
  );
  for (const section of sections) {
    if (pathname === section.pathPrefix || pathname.startsWith(`${section.pathPrefix}/`)) {
      return section;
    }
  }
  return null;
}

/** Breadcrumb labels for pathname (HOME 제외 1Depth) */
export function getBreadcrumbByPathname(pathname, extraSections = {}) {
  const section = resolveMenuSectionByPathname(pathname, extraSections);
  if (!section) return [];
  const catalogItem = TITAN_MENU_CATALOG[section.id];
  if (catalogItem?.breadcrumb?.length) return catalogItem.breadcrumb;
  return [section.label];
}

export function getPageMetaByMenuId(menuId) {
  return TITAN_MENU_CATALOG[menuId]?.pageMeta ?? null;
}

export function getApprovedSidebarMenuDefs(order = TITAN_MENU_ORDER) {
  return order
    .map((id) => TITAN_MENU_CATALOG[id])
    .filter(Boolean)
    .map((item) => ({ id: item.id, label: item.label, path: item.path }));
}

export { MENU_FREEZE_SIDEBAR_GROUPS, buildSidebarGroups };
