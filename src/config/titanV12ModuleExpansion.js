/**
 * Project TITAN V1.2 — Module Expansion (Architecture Lock)
 *
 * 선택형 모듈(Module) — 환경설정 ON/OFF · 기능 삭제 ❌ · 데이터 유지
 * QMS → 회사 전체 운영 플랫폼 확장 · MES/ERP 대체 ❌
 *
 * UI 변경 ❌ — Config · Rule · 문서 · 향후 Session/DB 연동 SSoT
 *
 * @see docs/TITAN_V12_MODULE_EXPANSION.md
 * @see src/config/titanV12MenuArchitecture.js — 메뉴 ↔ 모듈 매핑
 * @see src/utils/environmentSettingsSession.js — Runtime settings (향후 moduleFlags 연동)
 */

import { OPERATION_ROUTES } from "./operationsRouteRegistry";

export const V12_MODULE_EXPANSION_LOCK_DATE = "2026-07-04";

/** 개발 원칙 — 사용할 수도 있고 사용하지 않을 수도 있는 선택형 모듈 */
export const MODULE_EXPANSION_PHILOSOPHY = {
  summaryKo: "기능을 제거하지 않고 환경설정 ON/OFF만 변경",
  optional: true,
  dataRetention: "OFF 시 DB·Session 데이터 유지 · 재ON 시 그대로 사용",
  mesErpPolicy: "MES/ERP 대체 ❌ — TITAN 모듈은 MES 구축 후에도 독립 사용 가능",
  factoryScope: "NDK 1공장 — MES 구축 전 실무 사용 수준까지 개발",
};

/** 모듈 관리 UI 경로 (planned) */
export const MODULE_MANAGEMENT = {
  menuPath: "/admin",
  settingsPath: "/environment/modules",
  settingsLabel: "모듈 관리",
  adminPath: "관리자 → 환경설정 → 모듈 관리",
  implementationStatus: "active",
  storageKey: "project-titan-module-flags-v1",
};

/**
 * 모듈 ON/OFF 시 동작 규칙
 * @see MODULE_OFF_BEHAVIOR
 */
export const MODULE_TOGGLE_BEHAVIOR = {
  whenOff: {
    sidebar: "해당 모듈 Sidebar 메뉴 숨김",
    homeWidgets: "HOME 관련 위젯·빠른 메뉴 숨김",
    permissions: "권한 화면에서 해당 모듈 항목 숨김",
    routes: "직접 URL 접근 시 안내 또는 redirect (향후 ModuleGuard)",
    database: "데이터 유지 · 삭제 ❌",
    smartAccess: "QR/NFC 해당 target 비활성 안내 (향후)",
  },
  whenOnAgain: {
    sidebar: "즉시 메뉴 복원",
    data: "기존 Session/SQLite 데이터 그대로 사용",
    permissions: "저장된 권한 프로필 복원",
  },
};

/** ON/OFF 가능 모듈 레지스트리 */
export const TITAN_MODULE_REGISTRY = {
  quality: {
    id: "quality",
    label: "검사관리",
    category: "core",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["quality"],
    homeWidgetIds: ["quickInspection"],
    permissionKeys: ["quality", "inspection"],
  },
  production: {
    id: "production",
    label: "생산관리",
    category: "core",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["workDaily"],
    homeWidgetIds: ["quickProduction"],
    permissionKeys: ["production"],
  },
  certificate: {
    id: "certificate",
    label: "성적서관리",
    category: "core",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["certificateStatus"],
    homeWidgetIds: ["quickCertificate"],
    permissionKeys: ["certificate", "quality"],
  },
  outbound: {
    id: "outbound",
    label: "출고관리",
    category: "core",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["outboundStatus"],
    homeWidgetIds: ["quickOutbound"],
    permissionKeys: ["shipment", "outbound"],
  },
  qrSystem: {
    id: "qrSystem",
    label: "QR 관리",
    category: "smartAccess",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["qrManagement", "equipmentStatus", "productStatus"],
    homeWidgetIds: [],
    permissionKeys: ["qrManagement", "equipmentStatus", "productStatus", "qrCharging", "qrCreate"],
    smartAccessTargets: ["incoming", "equipment", "inspection", "certificate", "outgoing", "production"],
  },
  nfcSystem: {
    id: "nfcSystem",
    label: "NFC 시스템",
    category: "smartAccess",
    defaultEnabled: false,
    toggleable: true,
    menuIds: [],
    homeWidgetIds: [],
    permissionKeys: ["nfc"],
    note: "V2.0 — QR와 동일 Smart Access ID",
  },
  accountingClerk: {
    id: "accountingClerk",
    label: "경리관리",
    category: "business",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["accountingClerk"],
    homeWidgetIds: ["accountingClerkSummary"],
    permissionKeys: ["accountingClerk"],
    implementationStatus: "active-scope",
    survivesMes: true,
  },
  accounting: {
    id: "accounting",
    label: "회계관리",
    category: "business",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["accounting"],
    homeWidgetIds: ["accountingSummary"],
    permissionKeys: ["accounting"],
    implementationStatus: "active-scope",
    survivesMes: true,
    note: "ERP 대체 ❌ — 회계 업무 지원 수준",
  },
  documents: {
    id: "documents",
    label: "문서관리",
    category: "optional",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["documents"],
    homeWidgetIds: ["documentsPending"],
    permissionKeys: ["documents"],
    survivesMes: true,
  },
  equipmentMaster: {
    id: "equipmentMaster",
    label: "설비관리",
    category: "optional",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["masterData"],
    subFunctionIds: ["equipment"],
    homeWidgetIds: ["equipmentStatus"],
    permissionKeys: ["equipment", "masterData"],
    note: "기준정보관리 내 설비관리 — OFF 시 설비 Tab/기능만 숨김",
  },
  statistics: {
    id: "statistics",
    label: "통계관리",
    category: "optional",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["statistics"],
    homeWidgetIds: ["quickStatistics", "smartAccessDashboard"],
    permissionKeys: ["statistics"],
  },
  inbound: {
    id: "inbound",
    label: "입고관리",
    category: "core",
    defaultEnabled: true,
    toggleable: false,
    menuIds: ["inbound"],
    homeWidgetIds: ["quickInbound"],
    permissionKeys: ["incoming", "inbound"],
  },
  masterData: {
    id: "masterData",
    label: "기준정보관리",
    category: "core",
    defaultEnabled: true,
    toggleable: false,
    menuIds: ["masterData"],
    permissionKeys: ["masterData", "settings"],
  },
  history: {
    id: "history",
    label: "이력조회",
    category: "core",
    defaultEnabled: true,
    toggleable: false,
    menuIds: ["history"],
    permissionKeys: ["history"],
  },
  inventoryManagement: {
    id: "inventoryManagement",
    label: "재고관리",
    category: "core",
    defaultEnabled: true,
    toggleable: true,
    menuIds: ["inventoryStatus"],
    homeWidgetIds: ["currentStock"],
    permissionKeys: ["inventory"],
  },
  equipmentMaintenance: {
    id: "equipmentMaintenance",
    label: "설비보전",
    category: "future",
    defaultEnabled: false,
    toggleable: true,
    menuIds: [],
    permissionKeys: ["equipmentMaintenance"],
  },
  purchasing: {
    id: "purchasing",
    label: "구매관리",
    category: "future",
    defaultEnabled: false,
    toggleable: true,
    menuIds: [],
    permissionKeys: ["purchasing"],
  },
};

/** 경리관리 — 실무 사용 수준 개발 범위 */
export const ACCOUNTING_CLERK_MODULE = {
  moduleId: "accountingClerk",
  label: "경리관리",
  plannedBasePath: "/accounting-clerk",
  functions: [
    { id: "invoiceMgmt", label: "거래명세서 관리", status: "planned" },
    { id: "invoiceReprint", label: "거래명세서 재출력", status: "planned", link: "outbound" },
    { id: "invoiceHistory", label: "거래명세서 발행이력", status: "planned" },
    { id: "outboundClosing", label: "출고 마감", status: "planned" },
    { id: "monthlyClose", label: "월 마감", status: "planned" },
    { id: "receivables", label: "미수금 관리", status: "planned" },
    { id: "salesByCompany", label: "거래처별 매출", status: "planned" },
    {
      id: "taxInvoiceStatus",
      label: "세금계산서 발행 여부 관리",
      status: "active",
      path: "/accounting-clerk/tax-invoices",
      note: "홈택스 발행 후 TITAN에 발행여부·발행일·담당자 등록",
    },
    { id: "salesStatistics", label: "매출 통계", status: "planned" },
  ],
};

/** 회계관리 — ERP 대체 ❌ · 지원 수준 */
export const ACCOUNTING_MODULE = {
  moduleId: "accounting",
  label: "회계관리",
  plannedBasePath: "/accounting",
  erpReplacement: false,
  functions: [
    {
      id: "journalLookup",
      label: "회계자료 조회",
      status: "active",
      description: "거래명세서 · 출고자료 · 발행 문서 조회",
      badge: "자료",
      tone: "blue",
    },
    {
      id: "monthlyStatus",
      label: "월별 현황",
      status: "active",
      description: "월별 출고금액 · 문서 발행 건수",
      badge: "월별",
      tone: "green",
    },
    {
      id: "companyStatus",
      label: "거래처별 현황",
      status: "active",
      description: "거래처별 출고 · 공급가액 · 부가세",
      badge: "거래처",
      tone: "purple",
    },
    {
      id: "chartOfAccounts",
      label: "계정과목 조회",
      status: "active",
      description: "V1.0 Lite 기본 계정과목 조회",
      badge: "계정",
      tone: "orange",
    },
    {
      id: "vatStatus",
      label: "부가세 현황",
      status: "active",
      description: "공급가액 · 부가세 · 합계 조회",
      badge: "VAT",
      tone: "cyan",
    },
    { id: "journalEntry", label: "회계전표", status: "planned", description: "전표 생성 · 승인 Workflow는 Coming Soon" },
    { id: "costStatus", label: "원가 현황", status: "planned", description: "원가 계산 Engine은 Coming Soon" },
    { id: "journalApproval", label: "결산 · 승인", status: "planned", description: "결산 · 승인 · 금융 연동은 Coming Soon" },
  ],
};

/** MES 구축 후에도 TITAN에서 계속 사용하는 모듈 */
export const MODULES_SURVIVING_MES = Object.values(TITAN_MODULE_REGISTRY)
  .filter((m) => m.survivesMes)
  .map((m) => m.id);

/** DB 설계 방향 (SessionStorage → SQLite) */
export const MODULE_DB_DESIGN = {
  moduleFlags: {
    table: "titan_module_flags",
    columns: ["module_id", "enabled", "updated_at", "updated_by"],
    note: "ON/OFF만 저장 · 업무 데이터는 모듈별 테이블 분리",
  },
  dataRetention: {
    policy: "module_off_no_delete",
    softHide: true,
    reEnable: "full_restore",
  },
  moduleDataNamespaces: [
    { moduleId: "accountingClerk", prefix: "accounting_clerk_", tables: ["invoices", "closings", "receivables", "tax_invoice_status"] },
    { moduleId: "accounting", prefix: "accounting_", tables: ["journal_entries", "accounts", "vat_summary"] },
    { moduleId: "documents", prefix: "documents_", tables: ["document_registry", "revisions"] },
    { moduleId: "quality", prefix: "quality_", tables: ["inspection_logs", "certificates"] },
  ],
  sessionStorageBridge: "src/utils/titanModuleFlagsSession.js",
};

/** ERP/MES 연동 — Repository Layer */
export const MODULE_ERP_MES_INTEGRATION = {
  principle: "UI·Module 구조 불변 — Data Source Adapter만 교체",
  mes: {
    replacesTitanModules: false,
    titanRetained: MODULES_SURVIVING_MES.concat(["quality", "certificate", "documents", "accountingClerk", "accounting"]),
    mesProvides: ["입고등록", "출고등록", "생산실적", "재고"],
    titanProvides: ["품질", "성적서", "문서", "경리", "회계", "통계"],
  },
  erp: {
    replacesTitanAccounting: false,
    titanAccountingRole: "전표·현황·부가세 조회 지원 — ERP 병행",
    exportFormats: ["CSV", "API", "SQLite sync"],
  },
  adapterHook: "getRepositories() — module-aware data source per moduleId",
};

/** 기본 모듈 플래그 (신규 설치 · Demo) */
export function createDefaultModuleFlags() {
  /** @type {Record<string, boolean>} */
  const flags = {};
  Object.values(TITAN_MODULE_REGISTRY).forEach((mod) => {
    flags[mod.id] = mod.defaultEnabled;
  });
  return flags;
}

/**
 * 모듈 활성 여부 (향후 runtime — flags from Session/SQLite)
 * @param {string} moduleId
 * @param {Record<string, boolean>} [flags]
 */
export function isModuleEnabled(moduleId, flags = createDefaultModuleFlags()) {
  const mod = TITAN_MODULE_REGISTRY[moduleId];
  if (!mod) return false;
  return flags[moduleId] ?? mod.defaultEnabled;
}

/**
 * Sidebar에 표시할 menuId 목록 (모듈 필터)
 * @param {Record<string, boolean>} [flags]
 */
export function getEnabledMenuIds(flags = createDefaultModuleFlags()) {
  const enabled = new Set(["home", "admin"]);
  Object.values(TITAN_MODULE_REGISTRY).forEach((mod) => {
    if (!isModuleEnabled(mod.id, flags)) return;
    (mod.menuIds ?? []).forEach((id) => enabled.add(id));
  });
  return [...enabled];
}

/**
 * 권한 화면에 표시할 module/permission keys
 * @param {Record<string, boolean>} [flags]
 */
export function getVisiblePermissionKeys(flags = createDefaultModuleFlags()) {
  const keys = new Set(["all", "environment"]);
  Object.values(TITAN_MODULE_REGISTRY).forEach((mod) => {
    if (!isModuleEnabled(mod.id, flags)) return;
    (mod.permissionKeys ?? []).forEach((k) => keys.add(k));
  });
  return [...keys];
}

/** Sidebar extras — Menu Freeze V1.0: 전 메뉴가 고정 순서에 포함됨 */
export const MODULE_SIDEBAR_EXTRAS = [];

/** Sidebar insert — Menu Freeze V1.0: certificateStatus는 고정 순서 #6 */
export const MODULE_SIDEBAR_AFTER_INSERTS = [];

/** menuConfig catalog id → module id(s) */
export const MENU_CATALOG_MODULE_MAP = {
  home: null,
  masterData: "masterData",
  inoutManagement: ["inbound", "outbound", "inventoryManagement"],
  productionManagement: "production",
  qualityManagement: ["quality", "certificate", "documents"],
  inboundStatus: "inbound",
  inventoryStatus: "inventoryManagement",
  workDaily: "production",
  workJournal: null,
  quality: "quality",
  certificateStatus: "certificate",
  documents: "documents",
  outboundStatus: "outbound",
  history: "history",
  statisticsInquiry: "statistics",
  environment: null,
  accountingClerk: "accountingClerk",
  accounting: "accounting",
  qrEngine: "qrSystem",
  qrManagement: "qrSystem",
  equipmentStatus: "qrSystem",
  productStatus: "qrSystem",
  qrCharging: "qrSystem",
};

/** Route prefix → module (ModuleGuard) */
export const MODULE_ROUTE_GUARDS = [
  { pathPrefix: "/accounting-clerk", moduleId: "accountingClerk" },
  { pathPrefix: "/accounting", moduleId: "accounting" },
  { pathPrefix: "/qr", moduleId: "qrSystem" },
  { pathPrefix: "/qr-workflow", moduleId: "qrSystem" },
  { pathPrefix: "/qr-management", moduleId: "qrSystem" },
  { pathPrefix: "/production/equipment-status", moduleId: "qrSystem" },
  { pathPrefix: "/equipment-status", moduleId: "qrSystem" },
  { pathPrefix: "/product-status", moduleId: "qrSystem" },
  { pathPrefix: "/documents", moduleId: "documents" },
  { pathPrefix: "/statistics", moduleId: "statistics" },
  { pathPrefix: "/inventory", moduleId: "inventoryManagement" },
  { pathPrefix: "/inout/incoming", moduleId: "inbound" },
  // RC1 Route Registry — canonical /operations/* module guard coverage
  { pathPrefix: OPERATION_ROUTES.inboundPending, moduleId: "inbound" },
  { pathPrefix: OPERATION_ROUTES.inboundHistory, moduleId: "inbound" },
  { pathPrefix: OPERATION_ROUTES.shipmentRegister, moduleId: "outbound" },
  { pathPrefix: OPERATION_ROUTES.shipmentHistory, moduleId: "outbound" },
  { pathPrefix: OPERATION_ROUTES.equipmentStatus, moduleId: "qrSystem" },
  { pathPrefix: OPERATION_ROUTES.productionPending, moduleId: "production" },
  { pathPrefix: OPERATION_ROUTES.dailyWork, moduleId: "production" },
  { pathPrefix: OPERATION_ROUTES.shotStatus, moduleId: "production" },
  { pathPrefix: "/production", moduleId: "production" },
  { pathPrefix: "/quality/inspection", moduleId: "quality" },
  { pathPrefix: "/quality/certificate", moduleId: "certificate" },
  { pathPrefix: "/quality", moduleId: "quality" },
  { pathPrefix: "/inout/shipment", moduleId: "outbound" },
];

/** HOME widget / KPI id → module */
export const HOME_WIDGET_MODULE_MAP = {
  todayWork: "inbound",
  todayTasks: "inbound",
  todayIncoming: "inbound",
  currentStock: "inventoryManagement",
  workProgress: "production",
  inspectWait: "quality",
  todayShipment: "outbound",
  inout: "inbound",
  production: "production",
  quality: "quality",
  certificate: "certificate",
  incoming: "inbound",
  daily: "production",
  inspection: "quality",
  shipment: "outbound",
  documentsNotices: "documents",
  accountingClerkSummary: "accountingClerk",
  accountingSummary: "accounting",
  quickStatistics: "statistics",
  qrEntry: "qrSystem",
  qrIncoming: "inbound",
  qrProduction: "production",
  qrInspection: "quality",
  qrCertificate: "certificate",
  qrOutbound: "outbound",
  qrCenter: "qrSystem",
  inspect: "quality",
  cert: "certificate",
  ship: "outbound",
};

/** 모듈관리 UI 섹션 */
export const MODULE_UI_SECTIONS = [
  {
    id: "core",
    label: "핵심 모듈",
    moduleIds: [
      "quality",
      "production",
      "certificate",
      "outbound",
      "inventoryManagement",
      "documents",
      "statistics",
      "qrSystem",
      "nfcSystem",
    ],
  },
  {
    id: "business",
    label: "경리 · 회계",
    dividerBefore: true,
    moduleIds: ["accountingClerk", "accounting"],
  },
  {
    id: "future",
    label: "확장 모듈",
    dividerBefore: true,
    moduleIds: ["equipmentMaintenance", "purchasing"],
  },
];

export function getV12ModuleExpansionSummary() {
  const toggleable = Object.values(TITAN_MODULE_REGISTRY).filter((m) => m.toggleable);
  return {
    lockDate: V12_MODULE_EXPANSION_LOCK_DATE,
    philosophy: MODULE_EXPANSION_PHILOSOPHY.summaryKo,
    moduleManagement: MODULE_MANAGEMENT.settingsPath,
    toggleableModules: toggleable.map((m) => m.label).join(" · "),
    newModules: ["경리관리", "회계관리"],
    accountingClerkFunctions: ACCOUNTING_CLERK_MODULE.functions.length,
    accountingFunctions: ACCOUNTING_MODULE.functions.length,
    survivesMes: MODULES_SURVIVING_MES,
    doc: "docs/TITAN_V12_MODULE_EXPANSION.md",
  };
}
