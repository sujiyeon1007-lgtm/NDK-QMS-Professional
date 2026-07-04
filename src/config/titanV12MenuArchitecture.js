/**
 * Project TITAN V1.2 — Menu Architecture (Architecture Lock)
 *
 * Philosophy: Menu Simple, Function Deep (메뉴는 적게 · 기능은 깊게)
 * Main menu: 10~12개 · 기능은 메뉴 내부에서 확장
 *
 * ⚠️ Runtime Sidebar는 Menu Freeze V1.3 유지 — 본 파일은 목표 아키텍처 SSoT
 * UI 변경 없이 Config · Rule · 문서 · 향후 Sidebar 전환 가이드
 *
 * @see docs/TITAN_V12_MENU_ARCHITECTURE.md
 * @see src/config/menuFreezeV1.js — 현재 Sidebar (V1.3)
 * @see src/config/titanV12SmartAccessPlatform.js — QR ↔ Menu mapping
 */

export const V12_MENU_ARCHITECTURE_LOCK_DATE = "2026-07-04";

/** 핵심 철학 */
export const MENU_ARCHITECTURE_PHILOSOPHY = {
  summaryKo: "메뉴는 적게 · 기능은 깊게",
  summaryEn: "Menu Simple, Function Deep",
  mesLesson: "MES처럼 기능은 많지만 메뉴는 단순 — 원하는 기능을 찾기 쉽게",
  mainMenuMax: 12,
  expandInsideMenu: true,
  homeFirst: "HOME에서 대부분의 업무 바로 시작 — 메뉴 탐색 최소화",
  qrSamePhilosophy: "QR/NFC = 메뉴 탐색 없이 해당 업무 화면 직행",
};

/** V1.2 목표 메인 메뉴 (11 active + 2 future) */
export const V12_MAIN_MENU = [
  { order: 1, id: "home", label: "HOME", status: "active" },
  { order: 2, id: "masterData", label: "기준정보관리", status: "active" },
  { order: 3, id: "inbound", label: "입고관리", status: "active" },
  { order: 4, id: "production", label: "생산관리", status: "active" },
  { order: 5, id: "inspection", label: "검사관리", status: "active" },
  { order: 6, id: "certificate", label: "성적서관리", status: "active" },
  { order: 7, id: "outbound", label: "출고관리", status: "active" },
  { order: 8, id: "history", label: "이력조회", status: "active" },
  { order: 9, id: "documents", label: "문서관리", status: "active" },
  { order: 10, id: "statistics", label: "통계관리", status: "active" },
  { order: 11, id: "admin", label: "관리자", status: "active" },
  { order: 12, id: "accountingClerk", label: "경리관리", status: "module-gated" },
  { order: 13, id: "accounting", label: "회계관리", status: "module-gated" },
];

/**
 * V1.2 메뉴별 내부 기능 — route는 기존 화면 재사용
 * implementationStatus: active | partial | planned
 */
export const V12_MENU_FUNCTIONS = {
  home: {
    menuId: "home",
    label: "HOME",
    role: "Dashboard · 빠른 업무 시작 — 메뉴 탐색 대체",
    functions: [
      { id: "dashboard", label: "운영 현황", path: "/home", status: "active" },
      { id: "quickInbound", label: "입고 빠른 메뉴", path: "/inout/incoming", status: "active" },
      { id: "quickProduction", label: "생산 빠른 메뉴", path: "/production/daily-report", status: "active" },
      { id: "quickInspection", label: "검사 빠른 메뉴", path: "/quality/inspection", status: "active" },
      { id: "quickCertificate", label: "성적서 빠른 메뉴", path: "/quality/certificate", status: "active" },
      { id: "quickOutbound", label: "출고 빠른 메뉴", path: "/inout/shipment", status: "active" },
      { id: "quickStatistics", label: "통계 빠른 메뉴", path: "/statistics/inquiry", status: "active" },
      { id: "recentWork", label: "최근 작업", path: "/home", status: "partial" },
      { id: "qrEntry", label: "QR 진입", smartAccessId: "NDK://", status: "partial" },
    ],
  },
  masterData: {
    menuId: "masterData",
    label: "기준정보관리",
    hubPath: "/settings",
    functions: [
      { id: "companies", label: "거래처관리", path: "/settings/companies", status: "active" },
      { id: "products", label: "제품관리", path: "/settings/products", status: "active" },
      { id: "materials", label: "재질관리", path: "/settings/materials", status: "active" },
      { id: "processes", label: "공정관리", path: "/settings/processes", status: "active" },
      { id: "equipment", label: "설비관리", path: "/settings/equipment", status: "active" },
      { id: "workers", label: "작업자관리", path: "/settings/workers", status: "active" },
    ],
  },
  inbound: {
    menuId: "inbound",
    label: "입고관리",
    primaryPath: "/inout/incoming",
    functions: [
      { id: "register", label: "입고등록", path: "/inout/incoming", status: "active" },
      { id: "status", label: "입고현황", path: "/inout/incoming", status: "active" },
      { id: "inboundList", label: "입고리스트", path: "/inout/incoming", status: "active" },
      { id: "htlPrint", label: "HTL 출력", path: "/inout/incoming", doc: "DOC-01", status: "active" },
      { id: "qrInbound", label: "QR 입고", smartAccessId: "NDK://INCOMING", status: "planned" },
    ],
  },
  production: {
    menuId: "production",
    label: "생산관리",
    primaryPath: "/production/daily-report",
    functions: [
      { id: "workOrder", label: "작업지시", path: "/inout/incoming", note: "HTL 출력 연계", status: "partial" },
      { id: "dailyReport", label: "생산일보", path: "/production/daily-report", status: "active" },
      { id: "productionStatus", label: "생산현황", path: "/production/results", status: "active" },
      { id: "lotManagement", label: "LOT 관리", path: "/production/daily-report", status: "active" },
      { id: "qrProduction", label: "QR 생산", smartAccessId: "NDK://EQ/{code}", status: "active" },
      { id: "equipmentMonitor", label: "설비모니터링", path: "/production/daily-report", status: "planned" },
    ],
  },
  inspection: {
    menuId: "inspection",
    label: "검사관리",
    primaryPath: "/quality/inspection",
    functions: [
      { id: "incomingInspection", label: "수입검사", path: "/quality/inspection", status: "partial" },
      { id: "processInspection", label: "공정검사", path: "/quality/inspection", status: "active" },
      { id: "finalInspection", label: "최종검사", path: "/quality/inspection", status: "partial" },
      { id: "inspectionCriteria", label: "검사기준", path: "/settings/products", status: "partial" },
      { id: "defectManagement", label: "불량관리", path: "/production/defect-history", status: "partial" },
      { id: "xrManagement", label: "X-R 관리", path: null, status: "planned" },
      { id: "inspectionHistory", label: "검사이력", path: "/history", status: "partial" },
      { id: "qrInspection", label: "QR 검사", smartAccessId: "NDK://INSPECTION", status: "planned" },
    ],
  },
  certificate: {
    menuId: "certificate",
    label: "성적서관리",
    primaryPath: "/quality/certificate",
    functions: [
      { id: "register", label: "성적서 등록", path: "/quality/certificate", status: "active" },
      { id: "pdfOutput", label: "PDF 출력", path: "/quality/certificate", status: "active" },
      { id: "reissue", label: "재발행", path: "/quality/certificate", status: "partial" },
      { id: "issueHistory", label: "발행이력", path: "/quality/certificate", status: "partial" },
      { id: "versionControl", label: "버전관리", path: "/quality/certificate", status: "planned" },
      { id: "qrCertificate", label: "QR 성적서", smartAccessId: "NDK://CERTIFICATE", status: "planned" },
    ],
  },
  outbound: {
    menuId: "outbound",
    label: "출고관리",
    primaryPath: "/inout/shipment",
    functions: [
      { id: "register", label: "출고등록", path: "/inout/shipment", status: "active" },
      { id: "status", label: "출고현황", path: "/inout/shipment", status: "active" },
      { id: "invoice", label: "거래명세서", path: "/inout/shipment", doc: "DOC-04", status: "active" },
      { id: "closing", label: "출고마감", path: "/inout/shipment", status: "planned" },
      { id: "deliverySchedule", label: "납기관리", path: "/inout/shipment", status: "planned" },
      { id: "qrOutbound", label: "QR 출고", smartAccessId: "NDK://OUTGOING", status: "planned" },
    ],
  },
  history: {
    menuId: "history",
    label: "이력조회",
    primaryPath: "/history",
    functions: [
      { id: "lotLookup", label: "LOT 조회", path: "/history", status: "active" },
      { id: "managementIdLookup", label: "관리번호 조회", path: "/history", status: "active" },
      { id: "productLookup", label: "제품조회", path: "/history", status: "partial" },
      { id: "companyLookup", label: "업체조회", path: "/history", status: "partial" },
      { id: "fullTrace", label: "전체이력", path: "/history", status: "active" },
    ],
  },
  documents: {
    menuId: "documents",
    label: "문서관리",
    primaryPath: "/documents",
    functions: [
      { id: "drawings", label: "도면관리", path: "/documents", status: "active" },
      { id: "workStandard", label: "작업표준서", path: "/documents", status: "active" },
      { id: "qualityDocs", label: "품질문서", path: "/documents", status: "active" },
      { id: "attachments", label: "첨부파일", path: "/documents", status: "partial" },
      { id: "revision", label: "Revision 관리", path: "/documents", status: "active" },
    ],
  },
  statistics: {
    menuId: "statistics",
    label: "통계관리",
    note: "메뉴 1개 · 내부 Tab으로 확장",
    primaryPath: "/statistics/inquiry",
    internalTabs: [
      { id: "production", label: "생산통계", path: "/statistics/production", status: "active" },
      { id: "inspection", label: "검사통계", path: "/statistics/quality", status: "active" },
      { id: "outbound", label: "출고통계", path: "/statistics/shipment", status: "active" },
      { id: "byCompany", label: "업체별 통계", path: "/statistics/inquiry", status: "partial" },
      { id: "byProduct", label: "제품별 통계", path: "/statistics/inquiry", status: "partial" },
      { id: "byEquipment", label: "설비별 통계", path: "/statistics/production", status: "partial" },
      { id: "byWorker", label: "작업자별 통계", path: "/statistics/production", status: "planned" },
    ],
  },
  admin: {
    menuId: "admin",
    label: "관리자",
    primaryPath: "/environment",
    functions: [
      { id: "users", label: "사용자관리", path: "/environment/users", status: "active" },
      { id: "permissions", label: "권한관리", path: "/environment/permissions", status: "active" },
      { id: "qrPrintCenter", label: "QR 출력센터", path: "/environment/qr", status: "planned" },
      { id: "smartAccessAdmin", label: "Smart Access 관리", path: "/environment/smart-access", status: "planned" },
      { id: "logs", label: "로그조회", path: "/environment/logs", status: "active" },
      { id: "backup", label: "백업/복원", path: "/environment/backup", status: "active" },
      { id: "modules", label: "모듈관리", path: "/environment/modules", status: "planned" },
    ],
  },
  accountingClerk: {
    menuId: "accountingClerk",
    label: "경리관리",
    moduleId: "accountingClerk",
    status: "module-gated",
    primaryPath: "/accounting-clerk",
    note: "모듈 ON 시 Sidebar 표시 · 실무 사용 수준 개발",
    functions: [
      { id: "invoiceMgmt", label: "거래명세서 관리", status: "planned" },
      { id: "invoiceReprint", label: "거래명세서 재출력", status: "planned" },
      { id: "invoiceHistory", label: "거래명세서 발행이력", status: "planned" },
      { id: "outboundClosing", label: "출고 마감", status: "planned" },
      { id: "monthlyClose", label: "월 마감", status: "planned" },
      { id: "receivables", label: "미수금 관리", status: "planned" },
      { id: "salesByCompany", label: "거래처별 매출", status: "planned" },
      {
        id: "taxInvoiceStatus",
        label: "세금계산서 발행현황",
        status: "planned",
        note: "홈택스 발행 · TITAN은 발행여부·일·상태 관리",
      },
      { id: "salesStatistics", label: "매출 통계", status: "planned" },
    ],
  },
  accounting: {
    menuId: "accounting",
    label: "회계관리",
    moduleId: "accounting",
    status: "module-gated",
    primaryPath: "/accounting",
    note: "ERP 대체 ❌ · 모듈 OFF 가능",
    functions: [
      { id: "journalEntry", label: "회계전표 작성", status: "planned" },
      { id: "journalLookup", label: "회계전표 조회", status: "planned" },
      { id: "journalApproval", label: "전표 승인", status: "planned" },
      { id: "chartOfAccounts", label: "계정과목 관리", status: "planned" },
      { id: "monthlyStatus", label: "월별 현황", status: "planned" },
      { id: "costStatus", label: "원가 현황", status: "planned" },
      { id: "vatStatus", label: "부가세 관리(현황)", status: "planned" },
    ],
  },
};

/**
 * V1.3 Sidebar (현재) → V1.2 목표 메뉴 매핑
 * Sidebar UI 전환 전 참조용
 */
export const V13_TO_V12_MENU_MIGRATION = [
  { v13Id: "home", v13Label: "HOME", v12Id: "home", v12Label: "HOME", action: "keep" },
  { v13Id: "masterData", v13Label: "기준정보관리", v12Id: "masterData", v12Label: "기준정보관리", action: "keep" },
  { v13Id: "inboundStatus", v13Label: "입고현황", v12Id: "inbound", v12Label: "입고관리", action: "rename-group" },
  { v13Id: "inventoryStatus", v13Label: "재고현황", v12Id: "inbound", v12Label: "입고관리", action: "deep-function", note: "내부 기능 또는 HOME KPI" },
  { v13Id: "workDaily", v13Label: "작업일보", v12Id: "production", v12Label: "생산관리", action: "merge-group" },
  { v13Id: "workJournal", v13Label: "업무일지", v12Id: "home", v12Label: "HOME", action: "deep-function", note: "HOME 최근 작업 · 향후 통합" },
  { v13Id: "quality", v13Label: "품질관리", v12Id: "inspection", v12Label: "검사관리 + 성적서관리", action: "split" },
  { v13Id: "documents", v13Label: "문서관리", v12Id: "documents", v12Label: "문서관리", action: "keep" },
  { v13Id: "outboundStatus", v13Label: "출고현황", v12Id: "outbound", v12Label: "출고관리", action: "rename-group" },
  { v13Id: "history", v13Label: "이력조회", v12Id: "history", v12Label: "이력조회", action: "keep" },
  { v13Id: "statisticsInquiry", v13Label: "통계조회", v12Id: "statistics", v12Label: "통계관리", action: "rename-unify-tabs" },
  { v13Id: "environment", v13Label: "환경설정", v12Id: "admin", v12Label: "관리자", action: "rename-expand" },
];

/** QR 진입 ↔ V1.2 메뉴 (Smart Access와 동일 철학) */
export const V12_QR_MENU_ENTRY = [
  { location: "입고창고", smartAccessId: "NDK://INCOMING", menuId: "inbound", function: "입고등록" },
  { location: "생산설비", smartAccessId: "NDK://EQ/{code}", menuId: "production", function: "생산등록" },
  { location: "검사실", smartAccessId: "NDK://INSPECTION", menuId: "inspection", function: "검사등록" },
  { location: "품질실", smartAccessId: "NDK://CERTIFICATE", menuId: "certificate", function: "성적서관리" },
  { location: "출고장", smartAccessId: "NDK://OUTGOING", menuId: "outbound", function: "출고등록" },
  { location: "설비", smartAccessId: "NDK://EQ/{code}", menuId: "masterData", function: "설비정보/점검이력/생산현황" },
];

/** 사용자별 화면 (역할 기준 · 설계 참조) */
export const V12_USER_ROLE_MENUS = {
  quality: {
    label: "품질팀",
    menus: ["inbound", "inspection", "certificate", "outbound", "masterData"],
  },
  production: {
    label: "생산팀",
    menus: ["production"],
    focus: ["설비 QR", "생산 가능 목록", "LOT", "생산중/완료"],
  },
  admin: {
    label: "관리자",
    menus: ["home", "statistics", "admin"],
    focus: ["KPI", "현황", "통계", "설비현황"],
  },
};

export function getV12MenuArchitectureSummary() {
  const activeMain = V12_MAIN_MENU.filter((m) => m.status === "active");
  return {
    lockDate: V12_MENU_ARCHITECTURE_LOCK_DATE,
    philosophy: MENU_ARCHITECTURE_PHILOSOPHY.summaryKo,
    mainMenuCount: activeMain.length,
    mainMenus: activeMain.map((m) => m.label).join(" · "),
    futureMenus: V12_MAIN_MENU.filter((m) => m.status === "future").map((m) => m.label),
    currentRuntime: "Menu Freeze V1.3 Sidebar (변경 전 Architecture Lock)",
    doc: "docs/TITAN_V12_MENU_ARCHITECTURE.md",
  };
}
