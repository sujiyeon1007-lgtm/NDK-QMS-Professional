/**
 * Project TITAN V1.2 — Official Architecture (Consolidated SSoT)
 *
 * Menu · Module · Smart Access · Storage · Asset · HOME · Final Goal
 * Architecture Lock — UI 변경 ❌
 *
 * @see docs/TITAN_V12_OFFICIAL_ARCHITECTURE.md — Primary V1.2 document (14 sections)
 * @see src/config/titanOfficialArchitecture.js — Parent (Smart Access ID · Workflow · Principles)
 */

import {
  MENU_ARCHITECTURE_PHILOSOPHY,
  V12_MAIN_MENU,
  getV12MenuArchitectureSummary,
} from "./titanV12MenuArchitecture";

import {
  MODULE_EXPANSION_PHILOSOPHY,
  TITAN_MODULE_REGISTRY,
  ACCOUNTING_CLERK_MODULE,
  ACCOUNTING_MODULE,
  MODULE_TOGGLE_BEHAVIOR,
  MODULE_MANAGEMENT,
  createDefaultModuleFlags,
  isModuleEnabled,
  getV12ModuleExpansionSummary,
} from "./titanV12ModuleExpansion";

import {
  V12_PLATFORM_IDENTITY,
  SMART_ACCESS_DASHBOARD,
  QR_LABEL_SPEC,
  QR_PRINT_CENTER,
  TITAN_VERSION_ROADMAP,
  getV12SmartAccessPlatformSummary,
} from "./titanV12SmartAccessPlatform";

import {
  NFC_READY_POLICY,
  PROJECT_PHILOSOPHY,
  QR_PRINT_CENTER_OFFICIAL,
  SMART_ACCESS_ID_REGISTRY,
  SMART_ACCESS_ID_SCHEME,
} from "./titanOfficialArchitecture";

export const V12_OFFICIAL_ARCHITECTURE_LOCK_DATE = "2026-07-04";
export const V12_OFFICIAL_ARCHITECTURE_VERSION = "V1.2";

/** §1 Menu Architecture */
export const V12_MENU_ARCHITECTURE = {
  philosophy: MENU_ARCHITECTURE_PHILOSOPHY,
  mainMenu: V12_MAIN_MENU.filter((m) => m.status === "active" || m.status === "module-gated"),
  mainMenuCount: "10~13 (11 core + 경리·회계 module-gated)",
  configRef: "src/config/titanV12MenuArchitecture.js",
};

/** §2 Module System */
export const V12_MODULE_SYSTEM = {
  philosophy: MODULE_EXPANSION_PHILOSOPHY,
  managementPath: MODULE_MANAGEMENT.settingsPath,
  registry: TITAN_MODULE_REGISTRY,
  toggleBehavior: MODULE_TOGGLE_BEHAVIOR,
  defaultFlags: createDefaultModuleFlags,
  helpers: { isModuleEnabled },
  configRef: "src/config/titanV12ModuleExpansion.js",
};

/** §3 QR/NFC Smart Access */
export const V12_SMART_ACCESS = {
  channels: ["QR (active)", "NFC (future)", "Mobile", "Barcode (future)"],
  idScheme: SMART_ACCESS_ID_SCHEME,
  registry: SMART_ACCESS_ID_REGISTRY,
  flow: "QR/NFC → Smart Access ID → 업무 화면 (메뉴 탐색 ❌)",
  examples: [
    "NDK://INCOMING",
    "NDK://OUTGOING",
    "NDK://INSPECTION",
    "NDK://CERTIFICATE",
    "NDK://EQ/ION-01",
    "NDK://EQ/GAS-01",
  ],
  configRef: "src/config/smartAccessArchitecture.js",
};

/** §4 QR 출력센터 · §5 NFC Ready */
export const V12_QR_PRINT_CENTER = {
  ...QR_PRINT_CENTER,
  parentMenu: "관리자",
  categories: QR_PRINT_CENTER_OFFICIAL.categories,
  features: ["PDF 출력", "재출력", "미리보기", "인쇄"],
  multiCopy: "동일 QR 다매 출력 · 현장 여러 위치 부착",
  labelSpec: QR_LABEL_SPEC,
};

export const V12_NFC_READY = {
  ...NFC_READY_POLICY,
  sameSmartAccessIdAsQr: true,
  programChangeOnNfcAdd: false,
};

/** §6 Storage Architecture — SQLite 메타 · Storage 파일 */
export const STORAGE_ARCHITECTURE = {
  principle: "SQLite에 파일 저장 ❌ — Storage 폴더 + SQLite 메타데이터만",
  userPolicy: "Windows 폴더 직접 사용 ❌ — 모든 작업 TITAN 프로그램 내부",
  tree: {
    root: "Project TITAN",
    database: { engine: "SQLite", role: "메타데이터 · 업무 데이터" },
    storage: {
      role: "실제 파일 저장",
      folders: [
        { id: "certificate", label: "Certificate", assetTypes: ["성적서 PDF"] },
        { id: "shipment", label: "Shipment", assetTypes: ["거래명세서"] },
        { id: "inspection", label: "Inspection", assetTypes: ["검사사진", "검사 PDF"] },
        { id: "drawing", label: "Drawing", assetTypes: ["도면"] },
        { id: "image", label: "Image", assetTypes: ["검사사진", "현장 사진"] },
        { id: "document", label: "Document", assetTypes: ["품질문서", "작업표준서"] },
        { id: "backup", label: "Backup", assetTypes: ["백업파일"] },
      ],
    },
    config: { role: "프로그램 설정 · moduleFlags · storagePath" },
  },
  sqliteMetadataFields: [
    "file_path",
    "file_name",
    "registered_at",
    "registered_by",
    "revision",
    "asset_type",
    "linked_record_id",
  ],
  fileInSqlite: false,
};

/** §7 Storage Manager */
export const STORAGE_MANAGER = {
  settingsPath: "/environment/storage",
  settingsLabel: "Storage 관리",
  metrics: [
    { id: "storageUsage", label: "Storage 사용량" },
    { id: "databaseSize", label: "Database 크기" },
    { id: "pdfUsage", label: "PDF 사용량" },
    { id: "imageUsage", label: "Image 사용량" },
    { id: "documentUsage", label: "Document 사용량" },
    { id: "backupUsage", label: "Backup 사용량" },
    { id: "totalUsage", label: "총 사용량" },
  ],
  functions: [
    { id: "optimize", label: "Storage 최적화" },
    { id: "cacheCleanup", label: "Cache 정리" },
    { id: "backup", label: "백업" },
    { id: "restore", label: "복원" },
    { id: "inspect", label: "Storage 검사" },
  ],
  implementationStatus: "planned",
};

/** §8 Storage Location */
export const STORAGE_LOCATION = {
  configurable: true,
  settingsPath: "/environment/program",
  policy: "Storage 경로만 변경 · 프로그램 수정 ❌",
  evolution: [
    { id: "local", example: "D:\\ProjectTITAN\\Storage", status: "default" },
    { id: "server", example: "\\\\SERVER\\ProjectTITAN\\Storage", status: "planned" },
    { id: "nas", example: "NAS mount path", status: "planned" },
    { id: "cloud", example: "Cloud sync path", status: "planned" },
  ],
  storageKey: "project-titan-storage-root-v1",
};

/** §9 경리관리 · §10 회계관리 */
export { ACCOUNTING_CLERK_MODULE, ACCOUNTING_MODULE };

/** §11 Company Asset Management */
export const COMPANY_ASSET_MANAGEMENT = {
  principle: "회사 파일 모두 프로그램 내부에서 관리 — Windows 폴더 직접 사용 ❌",
  managedAssets: [
    "성적서",
    "거래명세서",
    "도면",
    "검사사진",
    "작업표준서",
    "품질문서",
    "첨부파일",
    "백업파일",
  ],
  operations: ["검색", "조회", "출력", "다운로드"],
  storageMapping: STORAGE_ARCHITECTURE.tree.storage.folders,
  taxInvoicePolicy: "세금계산서 발행 ❌ — 홈택스 · TITAN은 발행여부·일·상태만",
};

/** §12 HOME 역할 강화 */
export const HOME_ARCHITECTURE = {
  role: "프로그램 시작점 — 메뉴 탐색 최소화",
  quickMenus: [
    { id: "inbound", label: "입고", path: "/inout/incoming" },
    { id: "production", label: "생산", path: "/production/daily-report" },
    { id: "inspection", label: "검사", path: "/quality/inspection" },
    { id: "certificate", label: "성적서", path: "/quality/certificate" },
    { id: "outbound", label: "출고", path: "/inout/shipment" },
  ],
  panels: [
    { id: "recentWork", label: "최근 작업", status: "partial" },
    { id: "qrEntry", label: "QR 진입", status: "partial" },
    { id: "statistics", label: "통계", path: "/statistics/inquiry", status: "active" },
    { id: "notices", label: "공지사항", status: "active" },
    { id: "tasks", label: "해야 할 일", status: "active" },
    { id: "todayWork", label: "금일 업무", status: "partial" },
    { id: "kpi", label: "KPI", status: "active" },
    { id: "progress", label: "진행현황", status: "active" },
    { id: "smartAccessStats", label: "Smart Access 통계", ref: SMART_ACCESS_DASHBOARD, status: "planned" },
  ],
  moduleAware: true,
  note: "moduleFlags OFF 시 관련 Widget 숨김",
};

/** §13 개발 철학 */
export const V12_DEVELOPMENT_PHILOSOPHY = {
  trinity: PROJECT_PHILOSOPHY,
  workflowChain: "입고 → 생산 → 검사 → 성적서 → 출고 → 통계",
  oneTimeInput: PROJECT_PHILOSOPHY.oneTimeInput,
  oneScan: PROJECT_PHILOSOPHY.oneScan,
  oneWorkflow: PROJECT_PHILOSOPHY.oneWorkflow,
};

/** §14 최종 목표 */
export const TITAN_FINAL_GOAL = {
  notMesReplacement: true,
  summaryKo:
    "MES 대체 ❌ — MES 전 실무 운영 · MES 후 QMS+DMS+Smart Access+경리+회계 통합 플랫폼",
  beforeMes: {
    label: "MES 구축 전",
    role: "NDK 1공장 실무 운영 프로그램 — Presentation → Production Ready",
    stack: "SessionStorage → SQLite + Storage",
  },
  afterMes: {
    label: "MES 구축 후",
    role: "MES 연동 통합 운영 플랫폼",
    titanRetains: [
      "품질관리 (QMS)",
      "문서관리 (DMS)",
      "Smart Access (QR/NFC)",
      "경리지원",
      "회계지원",
      "통계",
    ],
    mesProvides: ["입고", "출고", "생산실적", "재고"],
  },
  versionRoadmap: TITAN_VERSION_ROADMAP,
};

/** Re-exports */
export {
  V12_MAIN_MENU,
  TITAN_MODULE_REGISTRY,
  TITAN_VERSION_ROADMAP,
  SMART_ACCESS_ID_SCHEME,
  createDefaultModuleFlags,
  isModuleEnabled,
};

export function getV12OfficialArchitectureSummary() {
  return {
    version: V12_OFFICIAL_ARCHITECTURE_VERSION,
    lockDate: V12_OFFICIAL_ARCHITECTURE_LOCK_DATE,
    doc: "docs/TITAN_V12_OFFICIAL_ARCHITECTURE.md",
    menu: getV12MenuArchitectureSummary(),
    modules: getV12ModuleExpansionSummary(),
    smartAccess: getV12SmartAccessPlatformSummary(),
    storage: STORAGE_ARCHITECTURE.principle,
    storageManager: STORAGE_MANAGER.settingsPath,
    home: HOME_ARCHITECTURE.role,
    finalGoal: TITAN_FINAL_GOAL.summaryKo,
  };
}
