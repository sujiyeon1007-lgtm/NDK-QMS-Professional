/**
 * Project TITAN RC1 Official Operational Policy (PM Official)
 * Lock: 2026-07-10
 * Rule: .cursor/rules/project-titan-rc1-operational-policy.mdc
 */

export const RC1_OPERATIONAL_POLICY_VERSION = "RC1-OPERATIONAL-1.1";
export const RC1_OPERATIONAL_POLICY_DATE = "2026-07-10";

export const RC1_GOAL = "실제 회사에서 사용하는 것 — 새로운 기능 개발이 아름";

export const RC1_OPERATIONAL_SCOPE = Object.freeze([
  "기준정보관리",
  "입고등록",
  "생산관리",
  "출고등록",
  "거래명세서 발행",
  "재고관리",
  "QR Engine",
]);

export const RC1_OPERATIONAL_EXCLUDED = Object.freeze([
  "성적서 (기존 Excel 유지)",
  "문서관리",
  "통계",
  "회계",
  "경리 (거래처 Master 제공만 — TITAN 등록은 Excel Import)",
]);

export const RC1_COMPANY_MASTER_POLICY = Object.freeze({
  source: "경리팀 제공 Excel",
  importPath: "기준정보관리 · 거래처 · Excel Import",
  titanCrud: "보조 (Import 우선)",
});

export const RC1_DEVELOPMENT_PRIORITY = Object.freeze([
  "실제 운영",
  "버그 수정",
  "운영 피드백 수집",
  "운영일지 누적",
  "Architecture 결정",
  "DB 구현",
  "신규 기능",
]);

export const RC1_OUTBOUND_WORKFLOW = Object.freeze([
  "생산완료",
  "출고등록",
  "거래명세서 (선택)",
  "출고완료",
]);

export const RC1_STORAGE_POLICY = Object.freeze({
  active: "sessionStorage",
  delivery: "host-web",
  deferred: Object.freeze(["sqlite", "postgresql", "apiRepository", "mobile"]),
  architectureReview: "V1.1 Architecture Review",
  note: "운영 데이터 확보 전 저장소(DB) 구현 착수 금지",
});

export const RC1_FROZEN_ARCHITECTURE = Object.freeze([
  "UI",
  "Workflow",
  "QR Engine",
  "Print Engine",
  "Document Engine",
  "Company Branding SSOT",
]);

/** RC1 Official Freeze — Company Branding (PM 2026-07-10) */
export const RC1_COMPANY_BRANDING_FREEZE = Object.freeze({
  status: "official-freeze",
  ssot: "Company Workspace / companyStore.branding + documentFooter",
  resolver: "getCompanyBrandingForDocuments()",
  targets: Object.freeze([
    "transactionStatement",
    "certificateTde",
    "outboundDocuments",
    "qrPrint",
    "purchaseOrder",
    "releaseSlip",
  ]),
  rule: "Branding structure must not change after RC1",
});

/** RC1 — shared 직인 asset path (PM replaces PNG at this path) */
export const COMPANY_BRANDING_ASSETS = Object.freeze({
  stamp: "/assets/stamp/company_stamp.png",
});

export const DEFAULT_COMPANY_STAMP_URL = COMPANY_BRANDING_ASSETS.stamp;

/** RC1 P0 — operational stabilization (must complete before RC1 exit) */
export const RC1_P0_EXIT_CHECKLIST = Object.freeze([
  "White Screen 0 (including F5 reload)",
  "Browser QA PASS",
  "Console Error 0",
  "Runtime Error 0",
  "Route validation — Sidebar all menus",
  "Breadcrumb / Back link complete",
  "Transaction statement print verified",
  "QR print verified",
  "LOT status sync verified",
  "Company Branding verified",
  "Print Engine verified",
]);

/** RC1 Final Stabilization — PM Official (2026-07-10) */
export const RC1_FINAL_STABILIZATION = Object.freeze({
  phase: "operational-stabilization",
  notNewFeatures: true,
  priorityChain: Object.freeze([
    "Operational stabilization",
    "Browser QA",
    "Field QR test (P1)",
    "RC1 Official Freeze",
    "Operational Review document",
    "V1.1 Architecture Review",
    "V1.1 Sprint 1",
  ]),
  v11StartForbiddenUntilRc1Exit: true,
  frozenArchitecture: Object.freeze([
    "Company Branding Official Freeze",
    "QR Engine Official Freeze",
    "Repository Layer conditional-approved (design only)",
  ]),
  exitConditions: Object.freeze([
    "Browser QA PASS",
    "White Screen 0",
    "Runtime Error 0",
    "Console Error 0",
    "Transaction statement print PASS",
    "QR print PASS",
    "Field QR test PASS (P1)",
  ]),
  postExitRequired: Object.freeze([
    "RC1 Operational Review document",
    "Production department improvement requests",
    "Quality department improvement requests",
    "CEO feedback",
    "Customer feedback",
    "QR usage review",
    "LOT operations improvements",
    "Document output improvements",
  ]),
  postExitSequence: Object.freeze([
    "RC1 Official Freeze",
    "RC1 Operational Review",
    "PM Architecture Review",
    "Workflow Mapping",
    "Repository Interface",
    "Data Source Adapter",
    "V1.1 Sprint 1",
  ]),
  browserQaScope: Object.freeze([
    "White Screen",
    "Console Error",
    "Runtime Error",
    "Route connection",
    "F5 Refresh",
    "CRUD basic operations",
    "Print Preview",
    "QR Preview",
  ]),
});

/** RC1 Final Approval Gate — PM Official (2026-07-10) */
export const RC1_FINAL_APPROVAL_GATE = Object.freeze({
  status: "pre-freeze",
  notNewFeatures: true,
  repositoryImplementationForbidden: true,
  v11ImplementationForbiddenUntilPass: true,
  gates: Object.freeze([
    { id: "browser-qa", label: "Browser QA", script: "scripts/verify-rc1-final-browser-qa.mjs" },
    { id: "golden-scenario", label: "RC1 Golden Scenario", script: "scripts/verify-rc1-golden-scenario.mjs" },
    { id: "lot-workflow-sync", label: "LOT Workflow Sync", script: "scripts/verify-rc1-lot-workflow-sync.mjs" },
    { id: "field-qr-p1", label: "Field QR Test (P1)", manual: true, script: "docs/reports/RC1_P1_FIELD_QR_CHECKLIST.md" },
  ]),
  allPassRequiredForFreeze: true,
  freezeReport: "docs/reports/RC1_OFFICIAL_FREEZE_REPORT.md",
  postFreezeSequence: Object.freeze([
    "RC1 Official Freeze",
    "Windows EXE Build",
    "CEO Demo",
    "Pilot Operations",
    "RC1 Operational Review",
    "PM Architecture Review",
    "V1.1 Sprint 1",
  ]),
});

/** RC1 Golden Scenario — single operational workflow (PM Official) */
export const RC1_GOLDEN_SCENARIO = Object.freeze({
  id: "RC1-GOLDEN-SCENARIO",
  label: "RC1 Golden Scenario",
  script: "scripts/verify-rc1-golden-scenario.mjs",
  workflowChain: Object.freeze([
    "Company register",
    "Inbound register",
    "LOT create",
    "Production work",
    "Inspection complete",
    "Certificate issue",
    "Outbound register",
    "Transaction statement output",
    "QR output",
    "History inquiry",
  ]),
  rule: "Any workflow break = FAIL",
});

/** RC1 LOT Workflow Sync QA */
export const RC1_LOT_WORKFLOW_SYNC_QA = Object.freeze({
  id: "RC1-LOT-WORKFLOW-SYNC",
  script: "scripts/verify-rc1-lot-workflow-sync.mjs",
  stageChain: Object.freeze([
    "Inbound",
    "Inbound complete",
    "Production wait",
    "Production progress",
    "Inspection complete",
    "Outbound wait",
    "Outbound complete",
    "History",
  ]),
  checks: Object.freeze([
    "No duplicate list rows",
    "No stale rows in prior workspace",
    "No missing workflow status",
    "Shipped record removed from inbound pending",
    "Shipment history shows completed row",
  ]),
});

/** RC1 Demo Mode — CEO 시연용 (기능 변경 없음 · 데이터만) */
export const RC1_DEMO_MODE = Object.freeze({
  id: "RC1-DEMO-MODE",
  version: "RC1-DEMO-1.0",
  seedVersion: "RC1-DEMO-1.0",
  loader: "loadQaDemoSeed()",
  companies: Object.freeze([
    "한화에어로스페이스",
    "현대로템",
    "두산에너빌리티",
    "서암기계공업",
    "세아창원특수강",
  ]),
  products: Object.freeze(["SHAFT", "GEAR", "VALVE STEM", "RING", "BUSH"]),
  brandingTargets: Object.freeze([
    "transactionStatement",
    "certificateTde",
    "qrPrint",
    "printEngineHeader",
    "documentFooter",
  ]),
  rule: "Demo data only — no feature or workflow changes",
});

/** RC1 Known Limitations (must appear in freeze report) */
export const RC1_KNOWN_LIMITATIONS = Object.freeze([
  {
    id: "session-storage",
    limitation: "sessionStorage-based — no real-time data sharing across PCs",
    v11Plan: "Repository -> Oracle/API -> central data structure",
  },
  {
    id: "field-qr-data-share",
    limitation: "P1 field QR validates scan/navigation only — not cross-device session sync",
    v11Plan: "V1.1 multi-device same LOT data via Repository layer",
  },
]);

/** RC1 P1 — field QR operational test prep */
export const RC1_P1_QR_FIELD_TEST = Object.freeze({
  scope: "QR behavior only (not cross-device data sharing in sessionStorage)",
  checklist: Object.freeze([
    "QR scan recognition",
    "Mobile screen entry",
    "Equipment page display",
    "Response speed",
    "Mobile UI usability",
  ]),
});

/** V1.1 prep — Repository layer (PM conditional approved 2026-07-10) */
export const V11_REPOSITORY_LAYER_PRIORITY = Object.freeze({
  status: "conditional-approved",
  principle: "Workflow first — Repository supports Workflow; never change Workflow for Repository",
  officialStack: Object.freeze([
    "Real company operations",
    "Workflow",
    "UI",
    "Repository",
    "Data Source",
  ]),
  successCriteria:
    "Equipment QR -> chargeable LOT auto-query -> LOT select -> work start -> same data on quality PC, production PC, phone",
  sprint1: Object.freeze(["LotRepository", "EquipmentWorkflowRepository"]),
  sprint2: Object.freeze(["IncomingRepository", "OutboundRepository", "InventoryRepository"]),
  sprint3: Object.freeze(["CertificateRepository", "TransactionRepository", "CompanyRepository"]),
  sprint4: Object.freeze(["QrRepository", "StatisticsRepository", "DashboardRepository"]),
  designDoc: "docs/blueprints/V2.0/repository-layer-v11-draft.md",
  config: "src/config/titanRepositoryLayerV11.js",
  startAfter: "RC1 exit — LOT-centric central data, workflow-driven (not repository-first)",
});

export const RC1_QR_BASE_URL_REPRINT_NOTICE =
  "Base URL 변경 후에는 기존 QR 라벨을 재출력하십시오.";

/** RC1 QR Engine — output system Official Freeze (PM 2026-07-10) */
export const RC1_QR_ENGINE_POLICY = Object.freeze({
  status: "official-freeze",
  rc1Scope: "operational-qa-only",
  featureAddition: false,
  urlLogicFrozen: true,
  baseUrlArchitecture: Object.freeze([
    "QR Engine",
    "getQrBrowserBaseUrl()",
    "환경설정 QR 설정",
    "운영 URL",
  ]),
  baseUrlReprintNotice: RC1_QR_BASE_URL_REPRINT_NOTICE,
  frozenCapabilities: Object.freeze([
    "설비 선택",
    "QR 생성",
    "QR Registry",
    "PNG 저장",
    "PDF 출력",
    "A4 출력",
    "라벨 출력",
  ]),
  operationalQaChecklist: Object.freeze([
    "A4 출력 정상",
    "라벨 출력 정상",
    "Android/iPhone QR 인식 정상",
    "QR 주소 정상",
    "설비 페이지 정상 이동",
    "Console Error 없음",
    "White Screen 없음",
  ]),
  deferredToV11: "공통 DB 기반 QR 현장 작업 Workflow",
  note: "RC1 sessionStorage only - no shared LOT without common DB",
});

/**
 * RC1 Statistics — Coming Soon UI gate (PM 2026-07-10)
 * V1.1 re-enable: set RC1_STATISTICS_COMING_SOON = false
 * Engine preserved: statisticsExecutiveAnalytics.js · StatisticsExecutiveDashboard · routes unchanged
 */
export const RC1_STATISTICS_COMING_SOON = true;

export const RC1_STATISTICS_POLICY = Object.freeze({
  status: "coming-soon",
  rc1Scope: "operational-excluded",
  comingSoonEnabled: RC1_STATISTICS_COMING_SOON,
  enginePreserved: true,
  gateComponent: "StatisticsLayout",
  reEnableIn: "V1.1",
  reEnableSteps: Object.freeze([
    "Set RC1_STATISTICS_COMING_SOON = false in rc1OperationalPolicy.js",
    "Verify buildExecutiveStatisticsDashboard() with operational data",
    "Browser QA — /statistics and all sub-routes",
  ]),
  note: "RC1 exposes accurate operational data only — statistics dashboard hidden until V1.1",
});

/**
 * RC1 Documents — Coming Soon UI gate (selected sub-routes only)
 * V1.1 re-enable: set RC1_DOCUMENTS_COMING_SOON = false
 * Hub · 발주서 · 반출증 · 기타 수신문서 · 검사기준서 routes remain active
 */
export const RC1_DOCUMENTS_COMING_SOON = true;

export const RC1_DOCUMENTS_COMING_SOON_ROUTES = Object.freeze([
  "/documents/quality/certificates",
  "/documents/quality/by-company",
  "/documents/incoming-archive",
  "/documents/internal",
]);

const RC1_DOCUMENTS_COMING_SOON_SUBTITLE =
  "RC1 운영 안정화 기간 중 해당 문서 Workspace는 준비 중입니다. V1.1에서 활성화될 예정입니다.";

export function isRc1DocumentsComingSoonPath(pathname = "") {
  const path = String(pathname).split("?")[0];
  return RC1_DOCUMENTS_COMING_SOON_ROUTES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export const RC1_DOCUMENTS_POLICY = Object.freeze({
  status: "coming-soon-partial",
  comingSoonEnabled: RC1_DOCUMENTS_COMING_SOON,
  gatedRoutes: RC1_DOCUMENTS_COMING_SOON_ROUTES,
  gateComponent: "DocumentsLayout",
  subtitle: RC1_DOCUMENTS_COMING_SOON_SUBTITLE,
  reEnableIn: "V1.1",
  reEnableSteps: Object.freeze([
    "Set RC1_DOCUMENTS_COMING_SOON = false in rc1OperationalPolicy.js",
    "Browser QA — /documents and gated sub-routes",
  ]),
});

/**
 * RC1 Accounting Clerk — Coming Soon UI gate (entire menu)
 * V1.1 re-enable: set RC1_ACCOUNTING_CLERK_COMING_SOON = false
 */
export const RC1_ACCOUNTING_CLERK_COMING_SOON = true;

export const RC1_ACCOUNTING_CLERK_POLICY = Object.freeze({
  status: "coming-soon",
  comingSoonEnabled: RC1_ACCOUNTING_CLERK_COMING_SOON,
  gateComponent: "AppRouter",
  subtitle:
    "RC1 운영 안정화 기간 중 경리관리는 준비 중입니다. 거래명세서 발행은 출고·출력관리에서 이용해 주세요.",
  reEnableIn: "V1.1",
});

/**
 * RC1 Accounting — Coming Soon UI gate (entire menu)
 * V1.1 re-enable: set RC1_ACCOUNTING_COMING_SOON = false
 */
export const RC1_ACCOUNTING_COMING_SOON = true;

export const RC1_ACCOUNTING_POLICY = Object.freeze({
  status: "coming-soon",
  comingSoonEnabled: RC1_ACCOUNTING_COMING_SOON,
  gateComponent: "AppRouter",
  subtitle: "RC1 운영 안정화 기간 중 회계관리는 준비 중입니다. V1.1에서 활성화될 예정입니다.",
  reEnableIn: "V1.1",
});

/**
 * RC1 Shot Process — Coming Soon UI gate (생산관리 · 쇼트 작업현황)
 * V1.1 re-enable: set RC1_SHOT_PROCESS_COMING_SOON = false
 */
export const RC1_SHOT_PROCESS_COMING_SOON = true;

export const RC1_SHOT_PROCESS_POLICY = Object.freeze({
  status: "coming-soon",
  comingSoonEnabled: RC1_SHOT_PROCESS_COMING_SOON,
  gateComponent: "AppRouter",
  subtitle: "RC1 운영 안정화 기간 중 쇼트 공정 Workspace는 준비 중입니다. V1.1에서 활성화될 예정입니다.",
  reEnableIn: "V1.1",
});

export const RC1_SWAPPABLE_LAYER = Object.freeze(["Repository", "Data Source"]);

export const RC1_OPERATIONAL_DATA_COLLECTION = Object.freeze([
  "생산사무실 사용 패턴",
  "품질사무실 사용 패턴",
  "사장님 요구사항",
  "생산팀 요구사항",
  "QR 사용 빈도",
  "LTE 사용 여부",
  "동시 접속 인원",
  "백업 주기",
  "운영 중 발생한 오류",
]);

export const RC1_OPERATION_LOG_FIELDS = Object.freeze([
  "날짜",
  "사용자",
  "기능",
  "결과",
  "문제점",
  "개선 아이디어",
  "처리 여부",
]);

export const V11_ARCHITECTURE_REVIEW_DECISIONS = Object.freeze([
  "PostgreSQL",
  "API",
  "Auth",
  "Mobile",
  "Repository",
]);

export {
  V11_ARCHITECTURE_DIRECTION_VERSION,
  V11_ARCHITECTURE_DIRECTION_DATE,
  RC1_CONFIRMED_OPERATING_ENVIRONMENT,
  V11_LONG_TERM_PLATFORM_DIRECTION,
  V11_PRIMARY_GOAL,
  V11_ARCHITECTURE_CONSIDERATIONS,
  V11_ARCHITECTURE_REVIEW_GATE,
  getV11ArchitectureDirectionSummary,
} from "./titanV11ArchitectureDirection.js";

export const RC1_ALLOWED_WORK = Object.freeze([
  "RC1 버그 수정",
  "운영 안정화",
  "운영 UX 개선",
  "QR 검증",
  "Build",
  "Browser QA",
  "Host 배포",
  "운영 문서 작성",
  "Architecture 검토 및 문서화",
]);

export const RC1_DEFERRED_WORK = Object.freeze([
  "SQLite 구현",
  "PostgreSQL 구현",
  "API Repository 구현",
  "Mobile 구현",
  "Repository 교체",
  "대규모 리팩토링",
  "신규 기능 추가",
  "UI 변경",
  "Workflow 변경",
  "저장소 변경",
]);

export const RC1_EXIT_CRITERIA = Object.freeze([
  "Build PASS",
  "Browser QA PASS",
  "Host 배포 가능",
  "실제 업무 운영 가능",
  "QR 생성 및 출력 검증 완료",
  "QR 현장 테스트 완료",
  "운영일지 작성 시작",
]);

export const RC1_POST_PHASES = Object.freeze({
  v101: "운영 피드백 반영",
  v11: "Architecture 및 DB 방향 최종 확정",
});

export function getRc1OperationalPolicySummary() {
  return {
    version: RC1_OPERATIONAL_POLICY_VERSION,
    date: RC1_OPERATIONAL_POLICY_DATE,
    goal: RC1_GOAL,
    scope: RC1_OPERATIONAL_SCOPE,
    excluded: RC1_OPERATIONAL_EXCLUDED,
    priority: RC1_DEVELOPMENT_PRIORITY,
    storage: RC1_STORAGE_POLICY,
    frozen: RC1_FROZEN_ARCHITECTURE,
    qrEngine: RC1_QR_ENGINE_POLICY,
    statistics: RC1_STATISTICS_POLICY,
    branding: RC1_COMPANY_BRANDING_FREEZE,
    p0: RC1_P0_EXIT_CHECKLIST,
    p1QrField: RC1_P1_QR_FIELD_TEST,
    finalStabilization: RC1_FINAL_STABILIZATION,
    finalApprovalGate: RC1_FINAL_APPROVAL_GATE,
    goldenScenario: RC1_GOLDEN_SCENARIO,
    lotWorkflowSync: RC1_LOT_WORKFLOW_SYNC_QA,
    demoMode: RC1_DEMO_MODE,
    knownLimitations: RC1_KNOWN_LIMITATIONS,
    v11Repository: V11_REPOSITORY_LAYER_PRIORITY,
    swappable: RC1_SWAPPABLE_LAYER,
    allowed: RC1_ALLOWED_WORK,
    deferred: RC1_DEFERRED_WORK,
    exitCriteria: RC1_EXIT_CRITERIA,
  };
}
