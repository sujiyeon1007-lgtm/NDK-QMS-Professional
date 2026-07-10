/**
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
