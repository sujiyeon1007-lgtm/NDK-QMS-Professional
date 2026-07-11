/**
 * Project TITAN V2 - Global Nav + Section Sidebar (PM Blueprint - Layout only)
 * Maps blueprint labels to existing routes only.
 */

import {
  Home,
  ClipboardList,
  Truck,
  FileText,
  LayoutGrid,
  Droplets,
  Factory,
  Layers,
  Wrench,
  Monitor,
  NotebookPen,
  Printer,
  ShieldCheck,
  AlertTriangle,
  History,
  Archive,
  BarChart3,
  Wallet,
  Calculator,
  Building2,
  Package,
  Cog,
  HardHat,
  Hash,
  Users,
  Shield,
  ToggleLeft,
  QrCode,
  Bell,
  Settings,
  Database,
  MapPin,
  Network,
  UserCircle,
  BadgeCheck,
  Palette,
  ClipboardCheck,
  FolderOpen,
} from "lucide-react";

import { isModuleEnabled } from "./titanV12ModuleExpansion";
import { OPERATION_ROUTES } from "./operationsRouteRegistry";
import { COMPANY_WORKSPACE_ROUTES } from "./companyWorkspaceArchitecture";
import { ENVIRONMENT_WORKSPACE_ROUTES } from "./environmentWorkspaceArchitecture";
import { MASTER_SSOT_HOLD_SIDEBAR_IDS } from "./masterDataLauncher";

export const TITAN_V2_SIDEBAR_OMITTED_NO_ROUTE = [
  { section: "home", label: "\uC990\uACA8\uCC3E\uAE30", reason: "future - no route" },
  { section: "operations", label: "\uAC80\uC0AC\uC758\uB8B0 \uAD00\uB9AC", reason: "no dedicated route" },
  { section: "operations", label: "\uBC18\uC785 \uC608\uC815 \uAD00\uB9AC", reason: "no dedicated route" },
  { section: "statistics", label: "LOT \uD1B5\uACC4", reason: "no /statistics/lot route" },
  { section: "accountingClerk", label: "\uC218\uC8FC\uAD00\uB9AC", reason: "no route" },
  { section: "accountingClerk", label: "\uB9E4\uC785\uAD00\uB9AC", reason: "no route" },
  { section: "accounting", label: "\uC190\uC775\uD604\uD669", reason: "no route" },
];

/** @typedef {{ id: string, label: string, path: string, activePrefixes: string[], moduleId?: string }} GlobalNavV2Item */

/** @type {GlobalNavV2Item[]} */
export const TITAN_GLOBAL_NAV_V2_ITEMS_ALL = [
  { id: "home", label: "HOME", path: "/home", activePrefixes: ["/home"] },
  {
    id: "operations",
    label: "\uC6B4\uC601\uAD00\uB9AC",
    path: "/inout",
    activePrefixes: [
      "/inout",
      "/inventory",
      "/operations/inbound",
      "/operations/shipment",
      OPERATION_ROUTES.inboundPending,
      OPERATION_ROUTES.inboundHistory,
      OPERATION_ROUTES.shipmentRegister,
      OPERATION_ROUTES.shipmentHistory,
      "/inout/print",
    ],
  },
  {
    id: "production",
    label: "\uC0DD\uC0B0\uAD00\uB9AC",
    path: "/production",
    activePrefixes: [
      "/production",
      "/product-status",
      OPERATION_ROUTES.productionPending,
      OPERATION_ROUTES.equipmentStatus,
      OPERATION_ROUTES.cleaningProcess,
      OPERATION_ROUTES.dailyWork,
      OPERATION_ROUTES.shotStatus,
      "/production/results",
    ],
  },
  {
    id: "quality",
    label: "\uD488\uC9C8\uAD00\uB9AC",
    path: "/quality",
    activePrefixes: ["/quality", "/history"],
  },
  {
    id: "documents",
    label: "\uBB38\uC11C\uAD00\uB9AC",
    path: "/documents",
    activePrefixes: ["/documents"],
  },
  {
    id: "statistics",
    label: "\uD1B5\uACC4\uAD00\uB9AC",
    path: "/statistics/dashboard",
    activePrefixes: ["/statistics"],
  },
  {
    id: "accountingClerk",
    label: "\uACBD\uB9AC\uAD00\uB9AC",
    path: "/accounting-clerk",
    activePrefixes: ["/accounting-clerk"],
    moduleId: "accountingClerk",
  },
  {
    id: "accounting",
    label: "\uD68C\uACC4\uAD00\uB9AC",
    path: "/accounting",
    activePrefixes: ["/accounting"],
    moduleId: "accounting",
  },
  {
    id: "masterData",
    label: "\uAE30\uC900\uC815\uBCF4\uAD00\uB9AC",
    path: "/settings/hub",
    activePrefixes: ["/settings"],
  },
  {
    id: "company",
    label: "\uD68C\uC0AC\uAD00\uB9AC",
    path: "/company/dashboard",
    activePrefixes: ["/company"],
  },
  {
    id: "environment",
    label: "\uD658\uACBD\uC124\uC815",
    path: "/environment",
    activePrefixes: ["/environment"],
  },
];

/** @param {Record<string, boolean>} [flags] */
export function getVisibleGlobalNavV2Items(flags) {
  return TITAN_GLOBAL_NAV_V2_ITEMS_ALL.filter((item) => {
    if (!item.moduleId) return true;
    return isModuleEnabled(item.moduleId, flags);
  });
}

export const GLOBAL_NAV_SECTION_OVERRIDES = [
  { prefix: "/production/lot", sectionId: "production" },
  { prefix: "/quality/lot-lifecycle", sectionId: "production" },
  { prefix: "/accounting-clerk", sectionId: "accountingClerk" },
  { prefix: "/accounting", sectionId: "accounting" },
  { prefix: "/settings", sectionId: "masterData" },
  { prefix: "/company", sectionId: "company" },
  { prefix: "/history", sectionId: "home" },
];

/** @typedef {{ id: string, label: string, path: string, icon: import("react").ComponentType, end?: boolean, catalogId?: string, adminOnly?: boolean, onHold?: boolean, activePrefixes?: string[] }} GlobalNavSidebarItem */

/** @type {Record<string, GlobalNavSidebarItem[]>} */
export const GLOBAL_NAV_SIDEBAR_ITEMS_V2 = {
  home: [
    { id: "home-dashboard", label: "Dashboard", path: "/home", icon: Home, end: true, catalogId: "home" },
    {
      id: "home-recent-work",
      label: "\uCD5C\uADFC \uC791\uC5C5",
      path: "/history",
      icon: History,
      end: true,
      catalogId: "history",
      activePrefixes: ["/history"],
    },
  ],
  operations: [
    {
      id: "inbound-management",
      label: "\uC785\uACE0\uAD00\uB9AC",
      path: OPERATION_ROUTES.inboundPending,
      icon: ClipboardList,
      catalogId: "inboundStatus",
      activePrefixes: [OPERATION_ROUTES.inboundPending, "/operations/inbound", "/inout/incoming"],
    },
    {
      id: "inbound-history",
      label: "\uC785\uACE0\uC774\uB825",
      path: OPERATION_ROUTES.inboundHistory,
      icon: History,
      catalogId: "inboundStatus",
      activePrefixes: [OPERATION_ROUTES.inboundHistory],
    },
    {
      id: "outbound-management",
      label: "\uCD9C\uACE0\uAD00\uB9AC",
      path: OPERATION_ROUTES.shipmentRegister,
      icon: Truck,
      catalogId: "outboundStatus",
      activePrefixes: [OPERATION_ROUTES.shipmentRegister, "/operations/shipment", "/inout/shipment"],
    },
    {
      id: "outbound-history",
      label: "\uCD9C\uACE0\uC774\uB825",
      path: OPERATION_ROUTES.shipmentHistory,
      icon: History,
      catalogId: "outboundStatus",
      activePrefixes: [OPERATION_ROUTES.shipmentHistory],
    },
    {
      id: "inventory-management",
      label: "\uC7AC\uACE0\uAD00\uB9AC",
      path: "/inventory",
      icon: Package,
      catalogId: "inventoryStatus",
      activePrefixes: ["/inventory"],
    },
    {
      id: "print-management",
      label: "\uCD9C\uB825\uAD00\uB9AC",
      path: "/inout/print",
      icon: Printer,
      end: true,
      catalogId: "inoutManagement",
      activePrefixes: ["/inout/print"],
    },
  ],
  production: [
    {
      id: "production-pending",
      label: "\uC0DD\uC0B0\uB300\uAE30",
      path: OPERATION_ROUTES.productionPending,
      icon: Layers,
      catalogId: "productionManagement",
      activePrefixes: [OPERATION_ROUTES.productionPending, "/production/plan"],
    },
    {
      id: "equipment-status",
      label: "\uC124\uBE44\uAC00\uB3D9\uD604\uD669",
      path: OPERATION_ROUTES.equipmentStatus,
      icon: Monitor,
      catalogId: "equipmentStatus",
      activePrefixes: [
        OPERATION_ROUTES.equipmentStatus,
        "/equipment-status",
        "/production/charging",
      ],
    },
    {
      id: "cleaning-process",
      label: "\uC138\uCC99\uACF5\uC815",
      path: OPERATION_ROUTES.cleaningProcess,
      icon: Droplets,
      catalogId: "productionManagement",
      activePrefixes: [OPERATION_ROUTES.cleaningProcess, "/production/cleaning-process"],
    },
    {
      id: "daily-work",
      label: "\uC791\uC5C5\uC77C\uBCF4",
      path: OPERATION_ROUTES.dailyWork,
      icon: NotebookPen,
      catalogId: "workDaily",
      activePrefixes: [OPERATION_ROUTES.dailyWork, "/production/daily-report"],
    },
    {
      id: "shot-status",
      label: "\uC1FC\uD2B8 \uC791\uC5C5\uD604\uD669",
      path: OPERATION_ROUTES.shotStatus,
      icon: ClipboardCheck,
      catalogId: "productionManagement",
      activePrefixes: [OPERATION_ROUTES.shotStatus, "/production/shot"],
    },
    {
      id: "production-history",
      label: "\uC0DD\uC0B0\uC774\uB825",
      path: "/production/results",
      icon: History,
      end: true,
      catalogId: "productionManagement",
      activePrefixes: ["/production/results"],
    },
  ],
  quality: [
    {
      id: "inspection-register",
      label: "\uAC80\uC0AC\uB4F1\uB85D",
      path: "/quality/inspection/register",
      icon: ClipboardCheck,
      catalogId: "quality",
      activePrefixes: ["/quality/inspection/register"],
    },
    {
      id: "inspection-status",
      label: "\uAC80\uC0AC\uD604\uD669",
      path: "/quality/inspection/status",
      icon: ShieldCheck,
      catalogId: "quality",
      activePrefixes: ["/quality/inspection/status", "/quality/inspection/mass"],
    },
    {
      id: "certificate-register",
      label: "\uC131\uC801\uC11C\uB4F1\uB85D",
      path: "/quality/certificate/register",
      icon: FileText,
      catalogId: "certificateStatus",
      activePrefixes: ["/quality/certificate/register"],
    },
    {
      id: "certificate-status",
      label: "\uC131\uC801\uC11C\uD604\uD669",
      path: "/quality/certificate/status",
      icon: FileText,
      catalogId: "certificateStatus",
      activePrefixes: ["/quality/certificate/status"],
    },
    {
      id: "ncr",
      label: "\uBD80\uC801\uD569\uAD00\uB9AC",
      path: "/quality/defect-history",
      icon: AlertTriangle,
      catalogId: "qualityManagement",
      activePrefixes: ["/quality/defect-history"],
    },
    {
      id: "quality-history",
      label: "\uD488\uC9C8\uC774\uB825\uC870\uD68C",
      path: "/history",
      icon: History,
      end: true,
      catalogId: "history",
      activePrefixes: ["/history"],
    },
  ],
  documents: [
    {
      id: "quality-certificates",
      label: "\uC778\uC99D\uC11C \uAD00\uB9AC",
      path: "/documents/quality/certificates",
      icon: FileText,
      catalogId: "documents",
      activePrefixes: ["/documents/quality/certificates"],
    },
    {
      id: "quality-by-company",
      label: "\uC5C5\uCCB4\uBCC4 \uBB38\uC11C\uAD00\uB9AC",
      path: "/documents/quality/by-company",
      icon: FileText,
      catalogId: "documents",
      activePrefixes: ["/documents/quality/by-company", "/documents/registry"],
    },
    {
      id: "incoming-purchase-orders",
      label: "\uBC1C\uC8FC\uC11C",
      path: "/documents/incoming/purchase-orders",
      icon: Archive,
      catalogId: "documents",
      activePrefixes: ["/documents/incoming/purchase-orders"],
    },
    {
      id: "incoming-return-slips",
      label: "\uBC18\uCD9C\uC99D",
      path: "/documents/incoming/return-slips",
      icon: Archive,
      catalogId: "documents",
      activePrefixes: ["/documents/incoming/return-slips"],
    },
    {
      id: "incoming-other",
      label: "\uAE30\uD0C0 \uC218\uC2E0\uBB38\uC11C",
      path: "/documents/incoming/other",
      icon: Archive,
      catalogId: "documents",
      activePrefixes: ["/documents/incoming/other"],
    },
    {
      id: "internal-documents",
      label: "\uC0AC\uB0B4\uBB38\uC11C",
      path: "/documents/internal",
      icon: FolderOpen,
      end: true,
      catalogId: "documents",
      activePrefixes: ["/documents/internal"],
    },
  ],
  statistics: [
    {
      id: "statistics-dashboard",
      label: "Dashboard",
      path: "/statistics/dashboard",
      icon: BarChart3,
      catalogId: "statisticsInquiry",
      activePrefixes: ["/statistics/dashboard", "/statistics"],
    },
    {
      id: "statistics-production",
      label: "\uC0DD\uC0B0 \uD1B5\uACC4",
      path: "/statistics/production",
      icon: Factory,
      catalogId: "statisticsInquiry",
      activePrefixes: ["/statistics/production"],
    },
    {
      id: "statistics-quality",
      label: "\uD488\uC9C8 \uD1B5\uACC4",
      path: "/statistics/quality",
      icon: ShieldCheck,
      catalogId: "statisticsInquiry",
      activePrefixes: ["/statistics/quality"],
    },
    {
      id: "statistics-shipment",
      label: "\uCD9C\uACE0 \uD1B5\uACC4",
      path: "/statistics/sales",
      icon: Wallet,
      catalogId: "statisticsInquiry",
      activePrefixes: ["/statistics/sales", "/statistics/shipment"],
    },
    {
      id: "statistics-kpi",
      label: "KPI",
      path: "/statistics/dashboard",
      icon: BarChart3,
      end: true,
      catalogId: "statisticsInquiry",
      activePrefixes: ["/statistics/dashboard"],
    },
  ],
  accountingClerk: [
    {
      id: "sales-management",
      label: "\uB9E4\uCD9C\uAD00\uB9AC",
      path: "/accounting-clerk/shipmentStatistics",
      icon: BarChart3,
      catalogId: "accountingClerk",
      activePrefixes: ["/accounting-clerk/shipmentStatistics"],
    },
    {
      id: "statement-issue-status",
      label: "\uAC70\uB798\uBA85\uC138\uC11C \uBC1C\uD589\uD604\uD669",
      path: "/accounting-clerk/shipmentStatistics",
      icon: FileText,
      catalogId: "accountingClerk",
      activePrefixes: ["/accounting-clerk/shipmentStatistics"],
    },
    {
      id: "receivables-payables",
      label: "\uBBF8\uC218/\uBBF8\uC9C0\uAE09 \uAD00\uB9AC",
      path: "/accounting-clerk/closingManagement",
      icon: Wallet,
      end: true,
      catalogId: "accountingClerk",
      activePrefixes: ["/accounting-clerk/closingManagement"],
    },
  ],
  accounting: [
    {
      id: "monthly-sales",
      label: "\uC6D4\uBCC4 \uB9E4\uCD9C",
      path: "/accounting/monthlyStatus",
      icon: BarChart3,
      catalogId: "accounting",
      activePrefixes: ["/accounting/monthlyStatus"],
    },
    {
      id: "tax-invoice",
      label: "\uC138\uAE08\uACC4\uC0B0\uC11C \uAD00\uB9AC",
      path: "/accounting/taxData",
      icon: FileText,
      catalogId: "accounting",
      activePrefixes: ["/accounting/taxData"],
    },
    {
      id: "accounting-data",
      label: "\uD68C\uACC4\uC790\uB8CC",
      path: "/accounting/journalLookup",
      icon: Calculator,
      catalogId: "accounting",
      activePrefixes: ["/accounting/journalLookup"],
    },
    {
      id: "closing-data",
      label: "\uACB0\uC0B0\uC790\uB8CC",
      path: "/accounting/closingStatus",
      icon: ClipboardCheck,
      end: true,
      catalogId: "accounting",
      activePrefixes: ["/accounting/closingStatus"],
    },
  ],
  masterData: [
    {
      id: "companies",
      label: "\uAC70\uB798\uCC98",
      path: "/settings/companies",
      icon: Building2,
      catalogId: "masterData",
      activePrefixes: ["/settings/companies"],
    },
    {
      id: "products",
      label: "\uC81C\uD488",
      path: "/settings/products",
      icon: Package,
      catalogId: "masterData",
      activePrefixes: ["/settings/products"],
    },
    {
      id: "materials",
      label: "\uC7AC\uC9C8",
      path: "/settings/materials",
      icon: Layers,
      catalogId: "masterData",
      activePrefixes: ["/settings/materials"],
    },
    {
      id: "equipment",
      label: "\uC124\uBE44",
      path: "/settings/equipment",
      icon: Wrench,
      catalogId: "masterData",
      activePrefixes: ["/settings/equipment"],
    },
    {
      id: "workers",
      label: "\uC791\uC5C5\uC790",
      path: "/settings/workers",
      icon: HardHat,
      catalogId: "masterData",
      activePrefixes: ["/settings/workers"],
    },
    {
      id: "processes",
      label: "\uACF5\uC815",
      path: "/settings/processes",
      icon: Cog,
      catalogId: "masterData",
      activePrefixes: ["/settings/processes"],
    },
    {
      id: "defect-codes",
      label: "\uBD88\uB7C9\uCF54\uB4DC",
      path: "/settings/hold/defect-codes",
      icon: AlertTriangle,
      catalogId: "masterData",
      activePrefixes: ["/settings/hold/defect-codes"],
    },
    {
      id: "custom-codes",
      label: "\uC0AC\uC6A9\uC790 \uC815\uC758\uCF54\uB4DC",
      path: "/settings/hold/custom-codes",
      icon: Hash,
      end: true,
      catalogId: "masterData",
      activePrefixes: ["/settings/hold/custom-codes"],
    },
  ],
  company: [
    {
      id: "company-dashboard",
      label: "\uD68C\uC0AC\uC815\uBCF4",
      path: COMPANY_WORKSPACE_ROUTES.dashboard,
      icon: Building2,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.dashboard],
    },
    {
      id: "company-sites",
      label: "\uC0AC\uC5C5\uC7A5",
      path: COMPANY_WORKSPACE_ROUTES.sites,
      icon: MapPin,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.sites],
    },
    {
      id: "company-organization",
      label: "\uC870\uC9C1\uB3C4",
      path: COMPANY_WORKSPACE_ROUTES.organization,
      icon: Network,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.organization],
    },
    {
      id: "company-departments",
      label: "\uBD80\uC11C",
      path: COMPANY_WORKSPACE_ROUTES.departments,
      icon: Users,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.departments],
    },
    {
      id: "company-employees",
      label: "\uC9C1\uC6D0",
      path: COMPANY_WORKSPACE_ROUTES.employees,
      icon: UserCircle,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.employees],
    },
    {
      id: "company-positions",
      label: "\uC9C1\uAE09",
      path: COMPANY_WORKSPACE_ROUTES.positions,
      icon: BadgeCheck,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.positions],
    },
    {
      id: "company-branding",
      label: "Branding",
      path: COMPANY_WORKSPACE_ROUTES.branding,
      icon: Palette,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.branding],
    },
    {
      id: "company-document-footer",
      label: "Footer",
      path: COMPANY_WORKSPACE_ROUTES.documentFooter,
      icon: FileText,
      end: true,
      catalogId: "companyInfo",
      activePrefixes: [COMPANY_WORKSPACE_ROUTES.documentFooter],
    },
  ],
  environment: [
    {
      id: "users",
      label: "\uC0AC\uC6A9\uC790 \uAD00\uB9AC",
      path: ENVIRONMENT_WORKSPACE_ROUTES.users,
      icon: Users,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.users],
    },
    {
      id: "permissions",
      label: "\uAD8C\uD55C \uAD00\uB9AC",
      path: ENVIRONMENT_WORKSPACE_ROUTES.permissions,
      icon: Shield,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.permissions],
    },
    {
      id: "menus",
      label: "\uBA54\uB274 \uAD00\uB9AC",
      path: ENVIRONMENT_WORKSPACE_ROUTES.menus,
      icon: LayoutGrid,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.menus],
    },
    {
      id: "menu-toggle",
      label: "\uBA54\uB274 ON/OFF",
      path: ENVIRONMENT_WORKSPACE_ROUTES.menuToggle,
      icon: ToggleLeft,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.menuToggle],
    },
    {
      id: "numbering",
      label: "\uBC88\uD638\uCCB4\uACC4",
      path: ENVIRONMENT_WORKSPACE_ROUTES.numbering,
      icon: Hash,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.numbering],
    },
    {
      id: "process-templates",
      label: "\uACF5\uC815\uC720\uD615",
      path: ENVIRONMENT_WORKSPACE_ROUTES.processTemplates,
      icon: Layers,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.processTemplates],
    },
    {
      id: "qr-settings",
      label: "QR \uC124\uC815",
      path: ENVIRONMENT_WORKSPACE_ROUTES.qrSettings,
      icon: QrCode,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.qrSettings],
    },
    {
      id: "backup",
      label: "\uBC31\uC5C5/\uBCF5\uC6D0",
      path: ENVIRONMENT_WORKSPACE_ROUTES.backup,
      icon: Archive,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.backup],
    },
    {
      id: "notifications",
      label: "\uC54C\uB9BC \uC124\uC815",
      path: ENVIRONMENT_WORKSPACE_ROUTES.notifications,
      icon: Bell,
      catalogId: "environment",
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.notifications],
    },
    {
      id: "system",
      label: "\uC2DC\uC2A4\uD15C \uC124\uC815",
      path: ENVIRONMENT_WORKSPACE_ROUTES.system,
      icon: Settings,
      catalogId: "environment",
      activePrefixes: [
        ENVIRONMENT_WORKSPACE_ROUTES.system,
        ENVIRONMENT_WORKSPACE_ROUTES.dashboard,
        "/environment/status",
        "/environment/program",
        "/environment/modules",
        "/environment/storage",
        "/environment/logs",
      ],
    },
    {
      id: "data",
      label: "\uB370\uC774\uD130 \uAD00\uB9AC",
      path: ENVIRONMENT_WORKSPACE_ROUTES.data,
      icon: Database,
      catalogId: "environment",
      adminOnly: true,
      activePrefixes: [ENVIRONMENT_WORKSPACE_ROUTES.data],
    },
  ],
};

/** @param {string} sectionId @param {{ isAdmin?: boolean, flags?: Record<string, boolean> }} [options] */
export function getGlobalNavSidebarItemsV2(sectionId, options = {}) {
  const { isAdmin = false, flags } = options;

  if (sectionId === "accountingClerk" && flags && !isModuleEnabled("accountingClerk", flags)) {
    return [];
  }
  if (sectionId === "accounting" && flags && !isModuleEnabled("accounting", flags)) {
    return [];
  }

  const items = GLOBAL_NAV_SIDEBAR_ITEMS_V2[sectionId] ?? GLOBAL_NAV_SIDEBAR_ITEMS_V2.home;
  return items.filter(
    (item) => !MASTER_SSOT_HOLD_SIDEBAR_IDS.has(item.id) && (!item.adminOnly || isAdmin)
  );
}

/** @param {string} sectionId */
export function getGlobalNavSectionLabelV2(sectionId) {
  return TITAN_GLOBAL_NAV_V2_ITEMS_ALL.find((item) => item.id === sectionId)?.label ?? "HOME";
}
