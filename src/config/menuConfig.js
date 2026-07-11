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
  Wallet,
  Calculator,
  QrCode,
  Factory,
  Monitor,
  LayoutGrid,
  Building2,
  ArrowLeftRight,
  Shield,
  Users,
  Archive,
  Wrench,
  Database,
  Settings,
  Printer,
  CalendarDays,
  ClipboardCheck,
  AlertTriangle,
  BookMarked,
  FlaskConical,
  ToggleLeft,
  Hash,
  Bell,
  Cog,
  HardHat,
  HardDrive,
  ScrollText,
  Palette,
  MapPin,
  Network,
  UserCircle,
  BadgeCheck,
} from "lucide-react";

import {
  MENU_FREEZE_SIDEBAR_ORDER,
  MENU_FREEZE_SIDEBAR_GROUPS,
  buildSidebarGroups,
} from "./menuFreezeV1";
import { OPERATION_ROUTES } from "./operationsRouteRegistry";
import { ENVIRONMENT_WORKSPACE_ROUTES } from "./environmentWorkspaceArchitecture";
import { COMPANY_WORKSPACE_ROUTES } from "./companyWorkspaceArchitecture";
import {
  TITAN_GLOBAL_NAV_V2_ITEMS_ALL,
  GLOBAL_NAV_SIDEBAR_ITEMS_V2,
  GLOBAL_NAV_SECTION_OVERRIDES,
  getVisibleGlobalNavV2Items,
  getGlobalNavSidebarItemsV2,
  getGlobalNavSectionLabelV2,
  TITAN_V2_SIDEBAR_OMITTED_NO_ROUTE,
} from "./titanGlobalNavSidebarV2.js";

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
  inoutManagement: {
    id: "inoutManagement",
    label: "운영관리",
    path: "/inout",
    icon: ArrowLeftRight,
    end: true,
    section: {
      pathPrefix: "/inout",
      defaultTab: "hub",
      tabs: [
        { id: "hub", label: "운영관리", path: "/inout" },
        { id: "inbound-pending", label: "입고 대기", path: OPERATION_ROUTES.inboundPending },
        { id: "inbound-history", label: "입고 이력", path: OPERATION_ROUTES.inboundHistory },
        { id: "shipment-register", label: "출고 등록", path: OPERATION_ROUTES.shipmentRegister },
        { id: "shipment-history", label: "출고 이력", path: OPERATION_ROUTES.shipmentHistory },
        { id: "print", label: "출력관리", path: "/inout/print" },
      ],
    },
    pageMeta: {
      kicker: "Operations Workspace",
      title: "운영관리",
      description: "입고 · 출고 · 재고 · 출력 — Launcher Hub",
    },
    breadcrumb: ["운영관리"],
  },
  productionManagement: {
    id: "productionManagement",
    label: "생산관리",
    path: "/production",
    icon: Factory,
    end: true,
    section: {
      pathPrefix: "/production",
      defaultTab: "hub",
      tabs: [
        { id: "hub", label: "생산관리", path: "/production" },
        { id: "production-pending", label: "생산 대기", path: OPERATION_ROUTES.productionPending },
        { id: "equipment-status", label: "설비 가동 현황", path: OPERATION_ROUTES.equipmentStatus },
        { id: "daily-work", label: "LOT · 작업일보", path: OPERATION_ROUTES.dailyWork },
        { id: "production-history", label: "생산 이력", path: "/production/results" },
        { id: "shot-status", label: "쇼트 작업현황", path: OPERATION_ROUTES.shotStatus },
        { id: "results", label: "생산실적관리", path: "/production/results" },
        { id: "print", label: "출력관리", path: "/production/print" },
      ],
    },
    pageMeta: {
      kicker: "Production",
      title: "생산관리",
      description: "입고 완료된 작업을 생산 대기 → 설비 가동 → 작업일보 순으로 관리합니다.",
    },
    breadcrumb: ["생산관리"],
  },
  qualityManagement: {
    id: "qualityManagement",
    label: "품질관리",
    path: "/quality",
    icon: ShieldCheck,
    end: true,
    section: {
      pathPrefix: "/quality",
      defaultTab: "hub",
      tabs: [
        { id: "hub", label: "품질관리", path: "/quality" },
        { id: "mass", label: "검사관리", path: "/quality/inspection/mass" },
        { id: "certificate", label: "성적서관리", path: "/quality/certificate" },
        { id: "documents", label: "문서관리", path: "/documents" },
      ],
    },
    pageMeta: {
      kicker: "Quality",
      title: "품질관리",
      description: "검사 · 성적서 · 품질 문서 — Launcher Hub",
    },
    breadcrumb: ["품질관리"],
  },
  inboundStatus: {
    id: "inboundStatus",
    label: "입고관리",
    path: OPERATION_ROUTES.inboundPending,
    icon: ClipboardList,
    section: {
      pathPrefix: OPERATION_ROUTES.inboundPending,
      defaultTab: "status",
      tabs: [{ id: "status", label: "입고관리", path: OPERATION_ROUTES.inboundPending }],
    },
    pageMeta: {
      kicker: "PQMS Workflow",
      title: "입고관리",
      description:
        "STEP 1 — PQMS 첫 업무 · MES 입고 원칙 · Presentation 수동 등록 · 관리번호 Traceability 시작",
    },
    breadcrumb: ["입고관리"],
  },
  inventoryStatus: {
    id: "inventoryStatus",
    label: "재고관리",
    path: "/inventory",
    icon: Package,
    end: true,
    section: {
      pathPrefix: "/inventory",
      defaultTab: "status",
      tabs: [{ id: "status", label: "재고관리", path: "/inventory" }],
    },
    pageMeta: {
      kicker: "Inventory Inquiry",
      title: "재고관리",
      description:
        "고객 제품 보관 상태 — 입고~출고 전 구간 Workflow별 조회 · 품목/LOT/거래처별 · 재고 PDF (V1.0 조회 중심)",
    },
    breadcrumb: ["재고관리"],
  },
  workDaily: {
    id: "workDaily",
    label: "LOT · 작업일보",
    path: OPERATION_ROUTES.dailyWork,
    icon: NotebookPen,
    section: {
      pathPrefix: OPERATION_ROUTES.dailyWork,
      defaultTab: "daily-report",
      tabs: [{ id: "daily-report", label: "LOT · 작업일보", path: OPERATION_ROUTES.dailyWork }],
    },
    pageMeta: {
      kicker: "Production Work Log",
      title: "LOT · 작업일보",
      description:
        "LOT 기준 통합 작업 기록 — 설비 장입 시 자동 생성 · 설비 · 공정 · 작업자 · 시작/종료 시각",
    },
    breadcrumb: ["LOT · 작업일보"],
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
    label: "검사관리",
    path: "/quality/inspection/mass",
    icon: ShieldCheck,
    section: {
      pathPrefix: "/quality/inspection",
      defaultTab: "mass",
      tabs: [
        { id: "mass", label: "양산검사", path: "/quality/inspection/mass" },
        { id: "dev", label: "개발검사", path: "/quality/inspection/dev" },
        { id: "other", label: "기타검사", path: "/quality/inspection/other" },
      ],
    },
    pageMeta: {
      kicker: "품질관리",
      title: "검사관리",
      description: "검사 결과를 등록하고 성적서 작성 전 데이터를 관리합니다.",
    },
    breadcrumb: ["검사관리"],
  },
  certificateStatus: {
    id: "certificateStatus",
    label: "성적서관리",
    path: "/quality/certificate/register",
    icon: ShieldCheck,
    section: {
      pathPrefix: "/quality/certificate",
      defaultTab: "register",
      tabs: [
        { id: "register", label: "성적서등록", path: "/quality/certificate/register" },
        { id: "status", label: "성적서현황", path: "/quality/certificate/status" },
      ],
    },
    pageMeta: {
      kicker: "품질관리",
      title: "성적서관리",
      description: "성적서 등록 · 발행 · 이력 조회",
    },
    breadcrumb: ["성적서관리"],
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
    label: "출고관리",
    path: OPERATION_ROUTES.shipmentRegister,
    icon: Truck,
    section: {
      pathPrefix: OPERATION_ROUTES.shipmentRegister,
      defaultTab: "shipment",
      tabs: [{ id: "shipment", label: "출고관리", path: OPERATION_ROUTES.shipmentRegister }],
    },
    pageMeta: {
      kicker: "Shipment",
      title: "출고관리",
      description: "출고등록 · 출고조회 · 거래명세서 · 출고현황 · 출고 PDF",
    },
    breadcrumb: ["출고관리"],
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
    label: "통계관리",
    path: "/statistics/dashboard",
    icon: BarChart3,
    section: {
      pathPrefix: "/statistics",
      defaultTab: "dashboard",
      tabs: [
        { id: "dashboard", label: "Dashboard", path: "/statistics/dashboard" },
        { id: "production", label: "생산통계", path: "/statistics/production" },
        { id: "shot", label: "쇼트현황", path: "/statistics/shot" },
        { id: "quality", label: "품질통계", path: "/statistics/quality" },
        { id: "sales", label: "영업통계", path: "/statistics/sales" },
      ],
    },
    pageMeta: {
      kicker: "PQMS Analytics",
      title: "통계관리",
      description:
        "Executive Dashboard · 전체 생산 · 품질 · 영업 통계 — 업무 데이터 자동 집계 (조회 전용)",
    },
    breadcrumb: ["통계관리"],
  },
  environment: {
    id: "environment",
    label: "환경설정",
    path: "/environment",
    icon: SlidersHorizontal,
    section: {
      pathPrefix: "/environment",
      defaultTab: "users",
      tabs: [
        { id: "users", label: "사용자관리", path: "/environment/users" },
        { id: "permissions", label: "권한관리", path: "/environment/permissions" },
        { id: "modules", label: "모듈관리", path: "/environment/modules" },
        { id: "storage", label: "Storage 관리", path: "/environment/storage" },
        { id: "backup", label: "백업 / 복원", path: "/environment/backup" },
        { id: "logs", label: "시스템 로그", path: "/environment/logs" },
        { id: "program", label: "프로그램 설정", path: "/environment/program" },
        { id: "status", label: "시스템 설정", path: "/environment/status" },
        { id: "employees", label: "직원정보관리", path: "/environment/employees" },
        { id: "customCodes", label: "사용자정의코드", path: "/environment/customCodes" },
      ],
    },
    pageMeta: {
      kicker: "System",
      title: "환경설정",
      description: "사용자 · 권한 · 모듈 · Storage · 백업 · 로그 등 시스템 전반 설정",
    },
    breadcrumb: ["환경설정"],
  },
  accountingClerk: {
    id: "accountingClerk",
    label: "경리관리",
    path: "/accounting-clerk",
    icon: Wallet,
    end: true,
    section: {
      pathPrefix: "/accounting-clerk",
      defaultTab: "hub",
      tabs: [{ id: "hub", label: "경리관리", path: "/accounting-clerk" }],
    },
    pageMeta: {
      kicker: "경리관리",
      title: "경리관리",
      description: "거래명세서 · 마감 · 미수금 · 매출 · 세금계산서 발행현황(홈택스 연계)",
    },
    breadcrumb: ["경리관리"],
  },
  accounting: {
    id: "accounting",
    label: "회계관리",
    path: "/accounting",
    icon: Calculator,
    end: true,
    section: {
      pathPrefix: "/accounting",
      defaultTab: "hub",
      tabs: [{ id: "hub", label: "회계관리", path: "/accounting" }],
    },
    pageMeta: {
      kicker: "회계관리",
      title: "회계관리",
      description: "ERP 대체 ❌ — 회계전표 · 계정과목 · 월별/원가/부가세 현황 지원",
    },
    breadcrumb: ["회계관리"],
  },
  qrEngine: {
    id: "qrEngine",
    label: "QR 정보관리",
    path: "/qr",
    icon: QrCode,
    end: true,
    section: {
      pathPrefix: "/qr",
      defaultTab: "dashboard",
      tabs: [
        { id: "dashboard", label: "대시보드", path: "/qr/dashboard" },
        { id: "generator", label: "QR 생성", path: "/qr/generator" },
        { id: "registry", label: "QR 목록", path: "/qr/registry" },
        { id: "scan", label: "QR 스캔", path: "/qr/scan" },
      ],
    },
    pageMeta: {
      kicker: "QR 정보관리",
      title: "QR 정보관리",
      description: "설비, LOT, 제품 등의 QR를 생성하고 조회 및 스캔하여 업무와 연결합니다.",
    },
    breadcrumb: ["QR 정보관리"],
  },
  qrManagement: {
    id: "qrManagement",
    label: "QR관리",
    path: "/qr-management",
    icon: QrCode,
    end: false,
    section: {
      pathPrefix: "/qr-management",
      defaultTab: "inout",
      tabs: [
        { id: "inout", label: "입출고 QR", path: "/qr-management/inout" },
        { id: "equipment", label: "설비 QR", path: "/qr-management/equipment" },
      ],
    },
    pageMeta: {
      kicker: "Smart Access",
      title: "QR관리",
      description: "입출고·설비 QR 생성 · 출력 · 재출력 · 삭제 (V1.3 Phase 1)",
    },
    breadcrumb: ["QR관리"],
  },
  qrCharging: {
    id: "qrCharging",
    label: "설비 가동 현황",
    path: OPERATION_ROUTES.equipmentStatus,
    icon: Factory,
    end: true,
    section: {
      pathPrefix: OPERATION_ROUTES.equipmentStatus,
      defaultTab: "hub",
      tabs: [
        { id: "hub", label: "설비 가동 현황", path: OPERATION_ROUTES.equipmentStatus },
      ],
    },
    pageMeta: {
      kicker: "Production",
      title: "설비 가동 현황",
      description: "장입 준비 · 작업 시작 · 작업 종료 · LOT 확인 통합 화면",
    },
    breadcrumb: ["생산관리", "설비 가동 현황"],
  },
  equipmentStatus: {
    id: "equipmentStatus",
    label: "설비 가동 현황",
    path: OPERATION_ROUTES.equipmentStatus,
    icon: Monitor,
    end: true,
    section: {
      pathPrefix: OPERATION_ROUTES.equipmentStatus,
      defaultTab: "main",
      tabs: [{ id: "main", label: "설비 가동 현황", path: OPERATION_ROUTES.equipmentStatus }],
    },
    pageMeta: {
      kicker: "Control Room",
      title: "설비 가동 현황",
      description: "LOT 중심 Control Room — 설비 · LOT · 제품 View 관제",
    },
    breadcrumb: ["생산관리", "설비 가동 현황"],
  },
  /**
   * Sprint 3E — 제품현황 Sidebar 독립 메뉴 제거 · Control Room Product View로 흡수.
   * Sidebar order(MENU_FREEZE_SIDEBAR_ORDER)에서 제외되어 Sidebar에는 표시되지 않으나,
   * 권한(catalogId) · /product-status 리다이렉트 경로 정합성을 위해 catalog 항목은 유지한다.
   * @deprecated 진입은 /production/equipment-status?view=product (Control Room)
   */
  productStatus: {
    id: "productStatus",
    label: "제품 현황",
    path: "/product-status",
    icon: LayoutGrid,
    end: true,
    section: {
      pathPrefix: "/product-status",
      defaultTab: "main",
      tabs: [{ id: "main", label: "제품 현황", path: "/product-status" }],
    },
    pageMeta: {
      kicker: "Product Traceability",
      title: "제품 현황",
      description: "Control Room Product View로 통합되었습니다.",
    },
    breadcrumb: ["생산관리", "설비 가동 현황", "제품 View"],
  },
  companyInfo: {
    id: "companyInfo",
    label: "회사정보",
    path: "/company",
    icon: Building2,
    end: true,
    section: {
      pathPrefix: "/company",
      defaultTab: "dashboard",
      tabs: [
        { id: "dashboard", label: "Dashboard", path: "/company/dashboard" },
        { id: "information", label: "회사 기본정보", path: "/company/information" },
        { id: "sites", label: "사업장", path: "/company/sites" },
        { id: "departments", label: "부서", path: "/company/departments" },
        { id: "employees", label: "직원", path: "/company/employees" },
      ],
    },
    pageMeta: {
      kicker: "Company Master",
      title: "Company Workspace",
      description: "TITAN 전체 Company Master — 성적서 · 거래명세서 · QR · TDE 공통 Source of Truth",
    },
    breadcrumb: ["회사정보"],
  },
};

/** Menu Freeze V1.5 — Sidebar 순서 (id) */
export const TITAN_MENU_ORDER = MENU_FREEZE_SIDEBAR_ORDER;

/** V1.5 Sidebar — 통합 메뉴 활성 경로 (NavLink) */
export const SIDEBAR_ACTIVE_PATH_PREFIXES = {
  inoutManagement: ["/inout", "/inventory", "/history"],
  productionManagement: ["/production"],
  qualityManagement: ["/quality", "/documents"],
  statisticsInquiry: ["/statistics"],
  accountingClerk: ["/accounting-clerk"],
  accounting: ["/accounting"],
  qrEngine: ["/qr"],
  companyInfo: ["/company"],
};

export function isSidebarMenuActive(menuId, pathname = "") {
  const path = String(pathname).split("?")[0];
  const prefixes = SIDEBAR_ACTIVE_PATH_PREFIXES[menuId];
  if (prefixes) {
    return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }
  const item = TITAN_MENU_CATALOG[menuId];
  if (!item) return false;
  if (item.end) return path === item.path;
  return path === item.path || path.startsWith(`${item.path}/`);
}

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
export function buildMenuSectionsFromConfig(order = Object.keys(TITAN_MENU_CATALOG)) {
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
  const sidebarIds = new Set(TITAN_MENU_ORDER);
  const allItems = Object.values(TITAN_MENU_CATALOG);
  const matches = allItems.filter(
    (item) => path === item.path || path.startsWith(`${item.path}/`)
  );
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const sidebarBoost = (sidebarIds.has(a.id) ? 1 : 0) - (sidebarIds.has(b.id) ? 1 : 0);
    if (sidebarBoost !== 0) return -sidebarBoost;
    return b.path.length - a.path.length;
  });
  return matches[0];
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

/** @typedef {{ id: string, label: string, path: string, activePrefixes: string[] }} GlobalNavItem */

/** V2 Global Navigation — PM Blueprint (11 sections · module-gated 경리/회계) */
export { TITAN_GLOBAL_NAV_V2_ITEMS_ALL, TITAN_V2_SIDEBAR_OMITTED_NO_ROUTE };
export { getVisibleGlobalNavV2Items };

/** @type {GlobalNavItem[]} — default flags (all toggleable modules ON) */
export const TITAN_GLOBAL_NAV_V2_ITEMS = TITAN_GLOBAL_NAV_V2_ITEMS_ALL;

/** @type {GlobalNavItem[]} */
export const TITAN_GLOBAL_NAV_V2_UTILITIES = [
  {
    id: "notifications",
    label: "알림",
    path: "/environment/notifications",
    activePrefixes: ["/environment/notifications"],
  },
  {
    id: "admin",
    label: "관리자",
    path: "/environment/users",
    activePrefixes: [
      "/environment/users",
      "/environment/permissions",
      "/environment/modules",
      "/environment/storage",
      "/environment/backup",
      "/environment/logs",
    ],
  },
];

/**
 * @param {GlobalNavItem} item
 * @param {string} pathname
 */
export function isGlobalNavItemActive(item, pathname = "") {
  const path = String(pathname).split("?")[0];
  return item.activePrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

/** @typedef {{ id: string, label: string, path: string, icon: import("react").ComponentType, end?: boolean, catalogId?: string, adminOnly?: boolean, activePrefixes?: string[] }} GlobalNavSidebarItem */

/** @type {Record<string, GlobalNavSidebarItem[]>} */
export const GLOBAL_NAV_SIDEBAR_ITEMS = GLOBAL_NAV_SIDEBAR_ITEMS_V2;

/**
 * @param {string} pathname
 * @returns {string}
 */
export function resolveGlobalNavSectionId(pathname = "") {
  const path = String(pathname).split("?")[0];

  const override = GLOBAL_NAV_SECTION_OVERRIDES.find(
    (item) => path === item.prefix || path.startsWith(`${item.prefix}/`)
  );
  if (override) return override.sectionId;

  const sortedNav = [...TITAN_GLOBAL_NAV_V2_ITEMS_ALL].sort((a, b) => {
    const maxA = Math.max(...a.activePrefixes.map((p) => p.length));
    const maxB = Math.max(...b.activePrefixes.map((p) => p.length));
    return maxB - maxA;
  });

  for (const item of sortedNav) {
    if (item.id === "home" && path === "/home") return "home";
    if (item.id !== "home" && isGlobalNavItemActive(item, path)) {
      return item.id;
    }
  }

  return "home";
}

/**
 * @param {GlobalNavSidebarItem} item
 * @param {string} pathname
 */
export function isGlobalNavSidebarItemActive(item, pathname = "") {
  const path = String(pathname).split("?")[0];
  const prefixes = item.activePrefixes?.length ? item.activePrefixes : [item.path];
  if (item.end) {
    return prefixes.some((prefix) => path === prefix);
  }
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * @param {string} sectionId
 * @param {{ isAdmin?: boolean }} [options]
 * @returns {GlobalNavSidebarItem[]}
 */
export function getGlobalNavSidebarItems(sectionId, options = {}) {
  return getGlobalNavSidebarItemsV2(sectionId, options);
}

export function getGlobalNavSectionLabel(sectionId) {
  return getGlobalNavSectionLabelV2(sectionId);
}

const WORKSPACE_HEADER_EMOJI = {
  home: "\uD83C\uDFE0",
  operations: "\uD83D\uDCE6",
  production: "\uD83C\uDFED",
  quality: "\uD83E\uDDEA",
  documents: "\uD83D\uDCC4",
  statistics: "\uD83D\uDCCA",
  accountingClerk: "\uD83D\uDCB0",
  accounting: "\uD83D\uDCC8",
  masterData: "\uD83D\uDCDA",
  company: "\uD83C\uDFE2",
  environment: "\u2699",
};

const TITAN_WORKSPACE_HEADER_V2 = {
  home: {
    id: "home",
    label: "HOME",
    description: "Project TITAN Dashboard \u2014 \uAE08\uC77C \uC5C5\uBB34\uC640 \uC804\uCCB4 \uD604\uD669",
    icon: "home",
  },
  operations: {
    id: "operations",
    label: "\uC6B4\uC601\uAD00\uB9AC",
    description: "\uC785\uACE0 \u00B7 \uCD9C\uACE0 \u00B7 \uAC70\uB798\uBA85\uC138\uC11C \u00B7 \uC6B4\uC601 \uC5C5\uBB34",
    icon: "operations",
  },
  production: {
    id: "production",
    label: "\uC0DD\uC0B0\uAD00\uB9AC",
    description: "LOT \u00B7 \uC7A5\uC785 \u00B7 \uC124\uBE44 \u00B7 \uC791\uC5C5\uC77C\uBCF4",
    icon: "production",
  },
  quality: {
    id: "quality",
    label: "\uD488\uC9C8\uAD00\uB9AC",
    description: "\uAC80\uC0AC \u00B7 \uC131\uC801\uC11C \u00B7 NCR \u00B7 \uD488\uC9C8\uC774\uB825",
    icon: "quality",
  },
  documents: {
    id: "documents",
    label: "\uBB38\uC11C\uAD00\uB9AC",
    description: "\uBC1C\uC8FC\uC11C \u00B7 \uB3C4\uBA74 \u00B7 \uBC18\uCD9C\uC99D \u00B7 \uC77C\uBC18 \uBB38\uC11C",
    icon: "documents",
  },
  statistics: {
    id: "statistics",
    label: "\uD1B5\uACC4\uAD00\uB9AC",
    description: "\uC0DD\uC0B0 \u00B7 \uD488\uC9C8 \u00B7 \uCD9C\uACE0 KPI",
    icon: "statistics",
  },
  accountingClerk: {
    id: "accountingClerk",
    label: "\uACBD\uB9AC\uAD00\uB9AC",
    description: "\uB9E4\uCD9C \u00B7 \uAC70\uB798\uBA85\uC138\uC11C \u00B7 \uBBF8\uC218/\uBBF8\uC9C0\uAE09 \u00B7 \uB9C8\uAC10",
    icon: "accountingClerk",
  },
  accounting: {
    id: "accounting",
    label: "\uD68C\uACC4\uAD00\uB9AC",
    description: "\uC6D4\uBCC4 \uB9E4\uCD9C \u00B7 \uC138\uAE08\uACC4\uC0B0\uC11C \u00B7 \uD68C\uACC4\uC790\uB8CC \u00B7 \uACB0\uC0B0",
    icon: "accounting",
  },
  masterData: {
    id: "masterData",
    label: "\uAE30\uC900\uC815\uBCF4\uAD00\uB9AC",
    description: "\uAC70\uB798\uCC98 \u00B7 \uC81C\uD488 \u00B7 \uC7AC\uC9C8 \u00B7 \uC124\uBE44 \u00B7 Master \uB370\uC774\uD130",
    icon: "master",
  },
  company: {
    id: "company",
    label: "\uD68C\uC0AC\uAD00\uB9AC",
    description: "\uD68C\uC0AC\uC815\uBCF4 \u00B7 \uC0AC\uC5C5\uC7A5 \u00B7 \uC870\uC9C1 \u00B7 \uC9C1\uC6D0",
    icon: "company",
  },
  environment: {
    id: "environment",
    label: "\uD658\uACBD\uC124\uC815",
    description: "\uC0AC\uC6A9\uC790 \u00B7 \uAD8C\uD55C \u00B7 QR \u00B7 \uC2DC\uC2A4\uD15C",
    icon: "environment",
  },
};

/** @param {string} sectionId */
export function getWorkspaceHeaderMetaV2(sectionId) {
  const base = TITAN_WORKSPACE_HEADER_V2[sectionId] ?? TITAN_WORKSPACE_HEADER_V2.home;
  const emoji = WORKSPACE_HEADER_EMOJI[base.id] ?? "";
  return {
    id: base.id,
    title: emoji ? `${emoji} ${base.label}` : base.label,
    description: base.description,
    icon: base.icon,
  };
}
