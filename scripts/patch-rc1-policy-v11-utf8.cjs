const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

const rc1 = `/**
 * Project TITAN RC1 Official Operational Policy (PM Official)
 * Lock: 2026-07-10
 * Rule: .cursor/rules/project-titan-rc1-operational-policy.mdc
 */

export const RC1_OPERATIONAL_POLICY_VERSION = "RC1-OPERATIONAL-1.1";
export const RC1_OPERATIONAL_POLICY_DATE = "2026-07-10";

export const RC1_GOAL = "\uC2E4\uC81C \uD68C\uC0AC\uC5D0\uC11C \uC0AC\uC6A9\uD558\uB294 \uAC83 \u2014 \uC0C8\uB85C\uC6B4 \uAE30\uB2A5 \uAC1C\uBC1C\uC774 \uC544\uB984";

export const RC1_OPERATIONAL_SCOPE = Object.freeze([
  "\uAE30\uC900\uC815\uBCF4\uAD00\uB9AC",
  "\uC785\uACE0\uB4F1\uB85D",
  "\uC0DD\uC0B0\uAD00\uB9AC",
  "\uCD9C\uACE0\uB4F1\uB85D",
  "\uAC70\uB798\uBA85\uC138\uC11C \uBC1C\uD589",
  "\uC7AC\uACE0\uAD00\uB9AC",
  "QR Engine",
]);

export const RC1_OPERATIONAL_EXCLUDED = Object.freeze([
  "\uC131\uC801\uC11C (\uAE30\uC874 Excel \uC720\uC9C0)",
  "\uBB38\uC11C\uAD00\uB9AC",
  "\uD1B5\uACC4",
  "\uD68C\uACC4",
  "\uACBD\uB9AC (\uAC70\uB798\uCC98 Master \uC81C\uACF5\uB9CC \u2014 TITAN \uB4F1\uB85D\uC740 Excel Import)",
]);

export const RC1_COMPANY_MASTER_POLICY = Object.freeze({
  source: "\uACBD\uB9AC\uD300 \uC81C\uACF5 Excel",
  importPath: "\uAE30\uC900\uC815\uBCF4\uAD00\uB9AC \u00B7 \uAC70\uB798\uCC98 \u00B7 Excel Import",
  titanCrud: "\uBCF4\uC870 (Import \uC6B0\uC120)",
});

export const RC1_DEVELOPMENT_PRIORITY = Object.freeze([
  "\uC2E4\uC81C \uC6B4\uC601",
  "\uBC84\uADF8 \uC218\uC815",
  "\uC6B4\uC601 \uD53C\uB4DC\uBC31 \uC218\uC9D1",
  "\uC6B4\uC601\uC77C\uC9C0 \uB204\uC801",
  "Architecture \uACB0\uC815",
  "DB \uAD6C\uD604",
  "\uC2E0\uADDC \uAE30\uB2A5",
]);

export const RC1_OUTBOUND_WORKFLOW = Object.freeze([
  "\uC0DD\uC0B0\uC644\uB8CC",
  "\uCD9C\uACE0\uB4F1\uB85D",
  "\uAC70\uB798\uBA85\uC138\uC11C (\uC120\uD0DD)",
  "\uCD9C\uACE0\uC644\uB8CC",
]);

export const RC1_STORAGE_POLICY = Object.freeze({
  active: "sessionStorage",
  delivery: "host-web",
  deferred: Object.freeze(["sqlite", "postgresql", "apiRepository", "mobile"]),
  architectureReview: "V1.1 Architecture Review",
  note: "\uC6B4\uC601 \uB370\uC774\uD130 \uD655\uBCF4 \uC804 \uC800\uC7A5\uC18C(DB) \uAD6C\uD604 \uCC29\uC218 \uAE08\uC9C0",
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

export const RC1_SWAPPABLE_LAYER = Object.freeze(["Repository", "Data Source"]);

export const RC1_OPERATIONAL_DATA_COLLECTION = Object.freeze([
  "\uC0DD\uC0B0\uC0AC\uBB34\uC2E4 \uC0AC\uC6A9 \uD328\uD134",
  "\uD488\uC9C8\uC0AC\uBB34\uC2E4 \uC0AC\uC6A9 \uD328\uD134",
  "\uC0AC\uC7A5\uB2D8 \uC694\uAD6C\uC0AC\uD56D",
  "\uC0DD\uC0B0\uD300 \uC694\uAD6C\uC0AC\uD56D",
  "QR \uC0AC\uC6A9 \uBE48\uB3C4",
  "LTE \uC0AC\uC6A9 \uC5EC\uBD80",
  "\uB3D9\uC2DC \uC811\uC18D \uC778\uC6D0",
  "\uBC31\uC5C5 \uC8FC\uAE30",
  "\uC6B4\uC601 \uC911 \uBC1C\uC0DD\uD55C \uC624\uB958",
]);

export const RC1_OPERATION_LOG_FIELDS = Object.freeze([
  "\uB0A0\uC9DC",
  "\uC0AC\uC6A9\uC790",
  "\uAE30\uB2A5",
  "\uACB0\uACFC",
  "\uBB38\uC81C\uC810",
  "\uAC1C\uC120 \uC544\uC774\uB514\uC5B4",
  "\uCC98\uB9AC \uC5EC\uBD80",
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
  "RC1 \uBC84\uADF8 \uC218\uC815",
  "\uC6B4\uC601 \uC548\uC815\uD654",
  "\uC6B4\uC601 UX \uAC1C\uC120",
  "QR \uAC80\uC99D",
  "Build",
  "Browser QA",
  "Host \uBC30\uD3EC",
  "\uC6B4\uC601 \uBB38\uC11C \uC791\uC131",
  "Architecture \uAC80\uD1A0 \uBC0F \uBB38\uC11C\uD654",
]);

export const RC1_DEFERRED_WORK = Object.freeze([
  "SQLite \uAD6C\uD604",
  "PostgreSQL \uAD6C\uD604",
  "API Repository \uAD6C\uD604",
  "Mobile \uAD6C\uD604",
  "Repository \uAD50\uCCB4",
  "\uB300\uADDC\uBAA8 \uB9AC\uD329\uD1A0\uB9C1",
  "\uC2E0\uADDC \uAE30\uB2A5 \uCD94\uAC00",
  "UI \uBCC0\uACBD",
  "Workflow \uBCC0\uACBD",
  "\uC800\uC7A5\uC18C \uBCC0\uACBD",
]);

export const RC1_EXIT_CRITERIA = Object.freeze([
  "Build PASS",
  "Browser QA PASS",
  "Host \uBC30\uD3EC \uAC00\uB2A5",
  "\uC2E4\uC81C \uC5C5\uBB34 \uC6B4\uC601 \uAC00\uB2A5",
  "QR \uC0DD\uC131 \uBC0F \uCD9C\uB825 \uAC80\uC99D \uC644\uB8CC",
  "QR \uD604\uC7A5 \uD14C\uC2A4\uD2B8 \uC644\uB8CC",
  "\uC6B4\uC601\uC77C\uC9C0 \uC791\uC131 \uC2DC\uC791",
]);

export const RC1_POST_PHASES = Object.freeze({
  v101: "\uC6B4\uC601 \uD53C\uB4DC\uBC31 \uBC18\uC601",
  v11: "Architecture \uBC0F DB \uBC29\uD5A5 \uCD5C\uC885 \uD655\uC815",
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
    branding: RC1_COMPANY_BRANDING_FREEZE,
    p0: RC1_P0_EXIT_CHECKLIST,
    p1QrField: RC1_P1_QR_FIELD_TEST,
    finalStabilization: RC1_FINAL_STABILIZATION,
    finalApprovalGate: RC1_FINAL_APPROVAL_GATE,
    goldenScenario: RC1_GOLDEN_SCENARIO,
    lotWorkflowSync: RC1_LOT_WORKFLOW_SYNC_QA,
    knownLimitations: RC1_KNOWN_LIMITATIONS,
    v11Repository: V11_REPOSITORY_LAYER_PRIORITY,
    swappable: RC1_SWAPPABLE_LAYER,
    allowed: RC1_ALLOWED_WORK,
    deferred: RC1_DEFERRED_WORK,
    exitCriteria: RC1_EXIT_CRITERIA,
  };
}
`;

fs.writeFileSync(path.join(root, "src/config/rc1OperationalPolicy.js"), rc1, "utf8");
console.log("rc1OperationalPolicy.js written");

const v11 = `/**
 * Project TITAN V1.1 Architecture Direction (RC1 companion)
 * Lock: 2026-07-10 · PM conditional approval
 */

export const V11_ARCHITECTURE_DIRECTION_VERSION = "V1.1-ARCHITECTURE-1.1";
export const V11_ARCHITECTURE_DIRECTION_DATE = "2026-07-10";

export const V11_OFFICIAL_PRINCIPLE = Object.freeze([
  "Real company operations",
  "Workflow",
  "UI",
  "Repository",
  "Data Source",
]);

export const RC1_CONFIRMED_OPERATING_ENVIRONMENT = Object.freeze({
  storage: "sessionStorage",
  delivery: "host-web",
  note: "RC1 operational data collection before DB implementation",
});

export const V11_SUCCESS_CRITERIA = Object.freeze([
  "Equipment QR scan",
  "Chargeable LOT auto-query",
  "LOT select",
  "Work start",
  "Same LOT data visible on quality PC, production PC, and phone",
]);

export const V11_PRIMARY_GOAL =
  "Complete production equipment-QR workflow with central LOT data — Repository is supporting layer only.";

export const V11_LONG_TERM_PLATFORM_DIRECTION = Object.freeze([
  "Repository -> Adapter -> Oracle capable (Oracle is not the immediate goal)",
  "Data Source chain: sessionStorage -> SQLite -> Oracle -> REST API -> ERP -> MES",
  "Repository interface must not know Data Source type",
  "UI · Workflow · Business Logic · QR Engine · Print Engine unchanged on backend swap",
]);

export const V11_ARCHITECTURE_CONSIDERATIONS = Object.freeze([
  "LOT-centric central data",
  "EquipmentWorkflowRepository",
  "LotRepository",
  "Adapter pattern",
  "REST API",
  "Oracle readiness (not Oracle-first)",
]);

export const V11_ARCHITECTURE_REVIEW_GATE = Object.freeze([
  "RC1 Browser QA PASS",
  "RC1 P0 complete",
  "V1.1 Sprint 1 workflow demo: equipment QR -> chargeable LOT",
  "PM approval before adapter implementation beyond Sprint 1",
]);

export function getV11ArchitectureDirectionSummary() {
  return {
    version: V11_ARCHITECTURE_DIRECTION_VERSION,
    date: V11_ARCHITECTURE_DIRECTION_DATE,
    principle: V11_OFFICIAL_PRINCIPLE,
    environment: RC1_CONFIRMED_OPERATING_ENVIRONMENT,
    successCriteria: V11_SUCCESS_CRITERIA,
    goal: V11_PRIMARY_GOAL,
    direction: V11_LONG_TERM_PLATFORM_DIRECTION,
    considerations: V11_ARCHITECTURE_CONSIDERATIONS,
    reviewGate: V11_ARCHITECTURE_REVIEW_GATE,
  };
}
`;

fs.writeFileSync(path.join(root, "src/config/titanV11ArchitectureDirection.js"), v11, "utf8");
console.log("titanV11ArchitectureDirection.js written");

const repoConfig = `/**
 * Project TITAN V1.1 Repository Layer (PM Conditional Approved)
 * docs/blueprints/V2.0/repository-layer-v11-draft.md
 */

export const TITAN_REPOSITORY_LAYER_VERSION = "V1.1-REPOSITORY-APPROVED-1.1";
export const TITAN_REPOSITORY_LAYER_DATE = "2026-07-10";
export const TITAN_REPOSITORY_LAYER_STATUS = "conditional-approved";

/** V1.1 Official Principle — Workflow first; Repository never drives Workflow changes */
export const V11_OFFICIAL_PRINCIPLE_STACK = Object.freeze([
  "Real company operations",
  "Workflow",
  "UI",
  "Repository",
  "Data Source",
]);

export const REPOSITORY_LAYER_FROZEN_SURFACES = Object.freeze([
  "Workflow",
  "UI",
  "Business Logic",
  "Print Engine",
  "Document Engine (TDE)",
  "QR Engine",
  "Company Branding SSOT",
  "LOT Workflow stages",
]);

/** Repository interface must not know which Data Source is active */
export const REPOSITORY_INTERFACE_RULE = Object.freeze({
  dataSourceAgnostic: true,
  workflowFirst: true,
  note: "Repository supports Workflow — Workflow is never changed for Repository convenience",
});

export const REPOSITORY_CANONICAL_KEY = "mesManagementNo";

/** Extensible Data Source chain (PM V1.1 Architecture Rule) */
export const DATA_SOURCE_CHAIN = Object.freeze([
  "sessionStorage",
  "sqlite",
  "oracle",
  "restApi",
  "erp",
  "mes",
]);

export const DATA_SOURCE_BACKEND = Object.freeze({
  SESSION: "sessionStorage",
  SQLITE: "sqlite",
  ORACLE: "oracle",
  REST_API: "restApi",
  ERP: "erp",
  MES: "mes",
});

/** V1.1 success criteria — not Repository implementation completion */
export const V11_SUCCESS_CRITERIA = Object.freeze([
  "Equipment QR scan",
  "Chargeable LOT auto-query",
  "LOT select",
  "Work start",
  "Same data on quality PC, production PC, phone",
]);

/** Sprint priority — operations workflow driven (PM approved) */
export const V11_REPOSITORY_SPRINT_PRIORITY = Object.freeze({
  sprint1: Object.freeze({
    label: "LOT + Equipment (highest)",
    repositories: Object.freeze(["LotRepository", "EquipmentWorkflowRepository"]),
  }),
  sprint2: Object.freeze({
    label: "Inbound / Outbound / Inventory",
    repositories: Object.freeze(["IncomingRepository", "OutboundRepository", "InventoryRepository"]),
  }),
  sprint3: Object.freeze({
    label: "Quality + Accounting + Company",
    repositories: Object.freeze([
      "CertificateRepository",
      "TransactionRepository",
      "CompanyRepository",
    ]),
  }),
  sprint4: Object.freeze({
    label: "QR + Statistics + Dashboard",
    repositories: Object.freeze(["QrRepository", "StatisticsRepository", "DashboardRepository"]),
  }),
});

export const REPOSITORY_INTERFACE_REGISTRY = Object.freeze({
  LotRepository: {
    sprint: 1,
    domain: "operations",
    primaryKey: "lotNo",
    methods: ["findByLotNo", "listChargeableByEquipment", "create", "updateStatus"],
  },
  EquipmentWorkflowRepository: {
    sprint: 1,
    domain: "mes",
    methods: ["listChargeableLots", "startCharge", "completeHeatTreatment"],
  },
  IncomingRepository: {
    sprint: 2,
    domain: "operations",
    primaryKey: "mesManagementNo",
    methods: ["listInbound", "findByMesManagementNo", "register"],
  },
  OutboundRepository: { sprint: 2, domain: "operations", methods: ["listOutbound", "register", "complete"] },
  InventoryRepository: {
    sprint: 2,
    domain: "operations",
    methods: ["listStock", "findByMesManagementNo"],
  },
  CertificateRepository: {
    sprint: 3,
    domain: "quality",
    methods: ["listByMesManagementNo", "save"],
  },
  TransactionRepository: { sprint: 3, domain: "accounting", methods: ["issue", "listHistory"] },
  CompanyRepository: {
    sprint: 3,
    domain: "company",
    frozen: true,
    methods: ["getBrandingForDocuments", "getProfile"],
  },
  QrRepository: { sprint: 4, domain: "qr", qrEngineFrozen: true, methods: ["list", "findByTarget"] },
  StatisticsRepository: { sprint: 4, domain: "analytics", methods: ["buildDashboard"] },
  DashboardRepository: { sprint: 4, domain: "dashboard", methods: ["getSummary"] },
  CustomerRepository: { sprint: 0, domain: "master", deferred: true, methods: ["listActive", "findByCode"] },
  ProductRepository: { sprint: 0, domain: "master", deferred: true, methods: ["listActive", "findByPartNo"] },
});

export const REPOSITORY_MIGRATION_PHASES = Object.freeze([
  { id: "phase-0", label: "PM-approved design + workflow mapping", rc1: true },
  { id: "phase-1", label: "Sprint 1 workflow: equipment QR -> chargeable LOT", v11: true },
  { id: "phase-2", label: "Sprint 2 operations repositories", v11: true },
  { id: "phase-3", label: "Sprint 3 quality/accounting/company", v11: true },
  { id: "phase-4", label: "Sprint 4 + Data Source adapter swap (sqlite/oracle/api)", v11: true },
]);

/** Oracle policy — goal is capability, not Oracle as target */
export const ORACLE_ADAPTER_POLICY = Object.freeze({
  goal: "Repository -> Adapter -> Oracle capable",
  notGoal: "Oracle implementation first",
  frozenOnSwap: Object.freeze([
    "UI",
    "Workflow",
    "Business Logic",
    "QR Engine",
    "Print Engine",
  ]),
  swapLayerOnly: "Repository implementation + Data Source Adapter",
  pocBridge: "mesOracleBridge (existing)",
});

export function getTitanRepositoryLayerSummary() {
  return {
    version: TITAN_REPOSITORY_LAYER_VERSION,
    date: TITAN_REPOSITORY_LAYER_DATE,
    status: TITAN_REPOSITORY_LAYER_STATUS,
    principle: V11_OFFICIAL_PRINCIPLE_STACK,
    successCriteria: V11_SUCCESS_CRITERIA,
    frozen: REPOSITORY_LAYER_FROZEN_SURFACES,
    dataSourceChain: DATA_SOURCE_CHAIN,
    sprintPriority: V11_REPOSITORY_SPRINT_PRIORITY,
    repositoryCount: Object.keys(REPOSITORY_INTERFACE_REGISTRY).length,
    migrationPhases: REPOSITORY_MIGRATION_PHASES.map((p) => p.id),
    oracle: ORACLE_ADAPTER_POLICY,
  };
}
`;

fs.writeFileSync(path.join(root, "src/config/titanRepositoryLayerV11.js"), repoConfig, "utf8");
console.log("titanRepositoryLayerV11.js written");

const repoDoc = `# Repository Layer V1.1 (PM Conditional Approved)

Status: conditional-approved | 2026-07-10
Code SSoT: src/config/titanRepositoryLayerV11.js
RC1: No implementation until RC1 exit

## V1.1 Official Principle

Real company operations -> Workflow -> UI -> Repository -> Data Source

Repository supports Workflow. Never change Workflow for Repository.

## V1.1 Success Criteria (not Repository completion)

Equipment QR scan
-> chargeable LOT auto-query
-> LOT select
-> work start
-> same data on quality PC, production PC, phone

## Sprint Priority (PM approved)

Sprint 1: LotRepository, EquipmentWorkflowRepository (highest)
Sprint 2: IncomingRepository, OutboundRepository, InventoryRepository
Sprint 3: CertificateRepository, TransactionRepository, CompanyRepository
Sprint 4: QrRepository, StatisticsRepository, DashboardRepository

## Data Source Chain

sessionStorage -> SQLite -> Oracle -> REST API -> ERP -> MES

Repository interface must NOT know Data Source type.

## Oracle Policy

Goal: Repository -> Adapter -> Oracle capable
Not goal: Oracle implementation first

Frozen on swap: UI, Workflow, Business Logic, QR Engine, Print Engine

## RC1

Complete P0 stabilization first. V1.1 starts after RC1 exit with LOT-centric central data.

## Next (after RC1)

1. Map Sprint 1 workflow to existing equipmentWorkflowService + production records
2. Define LotRepository + EquipmentWorkflowRepository interfaces in repositoryTypes.js
3. Session adapter delegates — workflow demo before Oracle/SQLite adapter
`;

fs.writeFileSync(path.join(root, "docs/blueprints/V2.0/repository-layer-v11-draft.md"), repoDoc, "utf8");
console.log("repository-layer-v11-draft.md written");

const reportsDir = path.join(root, "docs/reports");
fs.mkdirSync(reportsDir, { recursive: true });

const fieldQrChecklist = `# RC1 P1 Field QR Test Checklist (Manual)

**Status:** PENDING — Browser QA cannot substitute this gate.

**Scope:** Printed QR scan behavior only. sessionStorage cross-PC data sharing is **V1.1** (not RC1).

## Test device

- [ ] Physical QR label printed from RC1 QR Engine (A4 or label)
- [ ] Smartphone camera (default QR reader)

## Checklist

| Step | Check | PASS | FAIL | Notes |
|------|-------|------|------|-------|
| 1 | QR recognition | | | Scan opens URL without manual copy |
| 2 | Equipment page | | | Correct equipment / work page loads |
| 3 | Mobile screen | | | Layout readable on phone |
| 4 | Response speed | | | Acceptable for field use |
| 5 | Usability | | | Operator can proceed without PC |

## Sign-off

- Tester:
- Date:
- Result: PASS / FAIL
`;

const freezeReport = `# RC1 Official Freeze Report

**Date:** 2026-07-10
**Phase:** RC1 Final Approval Gate
**Policy:** \`src/config/rc1OperationalPolicy.js\` · \`RC1_FINAL_APPROVAL_GATE\`

---

## Gate Summary

| Gate | Result | Script / Evidence |
|------|--------|-------------------|
| ① Browser QA | CONDITIONAL PASS | \`scripts/verify-rc1-final-browser-qa.mjs\` — re-run after cold-load timing fix |
| ② Golden Scenario | **PASS** | \`scripts/verify-rc1-golden-scenario.mjs\` |
| ③ LOT Workflow Sync | **PASS** | \`scripts/verify-rc1-lot-workflow-sync.mjs\` |
| ④ Field QR (P1) | **PENDING** | \`docs/reports/RC1_P1_FIELD_QR_CHECKLIST.md\` (manual) |

**Official Freeze:** Blocked until Gate ① clean PASS and Gate ④ manual PASS.

---

## 1. Browser QA

- Expanded RC1 browser suite: Sidebar hubs, operations/quality/QR routes, F5, CRUD dialogs, print/QR preview, company branding.
- Prior run: mostly PASS; flaky cold-load on some routes and long-run resource limits.
- **Action:** One clean re-run required (PM conditional PASS).

## 2. Golden Scenario (RC1-GOLDEN-SCENARIO)

End-to-end chain verified in browser:

\`\`\`text
거래처 등록 → 입고 등록 → LOT 생성 → 생산 작업 → 검사 완료 → 성적서 발행
→ 출고 등록 → 거래명세서 출력 → QR 출력 → 이력 조회
\`\`\`

**Result:** PASS (no workflow break)

## 3. LOT Workflow Sync

Verified at each stage:

- No duplicate list rows
- No stale prior-workspace rows
- Inbound pending cleared after production start
- Outbound pending after certificate
- Shipped record in outbound-complete tab; removed from inbound pending
- History inquiry shows completed managementId

**Result:** PASS

## 4. Field QR Test (P1)

- **Not automated** — physical QR + phone camera required.
- sessionStorage PC-to-PC sync **out of scope** for RC1.

**Result:** PENDING manual sign-off

---

## 5. Known Limitations (RC1)

| ID | Limitation | V1.1 Plan |
|----|------------|-----------|
| session-storage | sessionStorage — no real-time data sharing across PCs | Repository → Oracle/API → central data |
| field-qr-data-share | P1 QR validates scan/navigation only | Multi-device same LOT via Repository |

---

## Stabilization fixes (RC1 gate)

- \`inspectionLogSession.js\` — assignee override avoids headless \`getCurrentTitanUser\` error in QA
- \`workflowProcessStatus.js\` — HT_RUNNING only when heat treatment not complete
- \`rc1OperationalPolicy.js\` — RC1 Final Approval Gate + Golden Scenario registered

---

## Post-Freeze Sequence (after all gates PASS)

\`\`\`text
RC1 Official Freeze → Windows EXE Build → CEO Demo → Pilot Operations
→ RC1 Operational Review → PM Architecture Review → V1.1 Sprint 1
\`\`\`

**No new features · No Repository implementation · No V1.1 until RC1 exit.**
`;

fs.writeFileSync(path.join(reportsDir, "RC1_P1_FIELD_QR_CHECKLIST.md"), fieldQrChecklist, "utf8");
fs.writeFileSync(path.join(reportsDir, "RC1_OFFICIAL_FREEZE_REPORT.md"), freezeReport, "utf8");
console.log("RC1 reports written");
