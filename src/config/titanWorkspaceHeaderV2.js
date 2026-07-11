/**
 * Project TITAN V2 - Workspace Header KPI definitions (read-only display)
 * Used by TitanWorkspaceHeader + titanWorkspaceHeaderMetrics.js
 */

/** @typedef {{ id: string, label: string, valueKey: string, suffix?: string, format?: 'number' | 'text' | 'percent' }} WorkspaceHeaderKpiDef */

/** @type {Record<string, WorkspaceHeaderKpiDef[]>} */
export const WORKSPACE_HEADER_KPI_DEFS = {
  home: [
    { id: "workflowActive", label: "\uC9C4\uD589 LOT", valueKey: "workflowActive", suffix: "\uAC74" },
    { id: "inspectionWait", label: "\uAC80\uC0AC\uB300\uAE30", valueKey: "inspectionWait", suffix: "\uAC74" },
    { id: "shipWait", label: "\uCD9C\uACE0\uB300\uAE30", valueKey: "shipWait", suffix: "\uAC74" },
  ],
  operations: [
    { id: "todayInbound", label: "\uAE08\uC77C\uC785\uACE0", valueKey: "todayInbound", suffix: "\uAC74" },
    { id: "shipScheduled", label: "\uCD9C\uACE0\uC608\uC815", valueKey: "shipScheduled", suffix: "\uAC74" },
    { id: "inspectionRequest", label: "\uAC80\uC0AC\uC758\uB8B0", valueKey: "inspectionRequest", suffix: "\uAC74" },
  ],
  production: [
    { id: "inProduction", label: "\uC0DD\uC0B0\uC911", valueKey: "inProduction", suffix: "\uAC74" },
    { id: "chargeWait", label: "\uC7A5\uC785\uB300\uAE30", valueKey: "chargeWait", suffix: "\uAC74" },
    { id: "equipmentRunning", label: "\uC124\uBE44\uAC00\uB3D9", valueKey: "equipmentRunning", suffix: "\uB300" },
  ],
  quality: [
    { id: "inspectionWait", label: "\uAC80\uC0AC\uB300\uAE30", valueKey: "inspectionWait", suffix: "\uAC74" },
    { id: "certWait", label: "\uC131\uC801\uC11C\uB300\uAE30", valueKey: "certWait", suffix: "\uAC74" },
    { id: "ncrCount", label: "NCR", valueKey: "ncrCount", suffix: "\uAC74" },
  ],
  documents: [
    { id: "unconfirmedDocs", label: "\uBBF8\uD655\uC778\uBB38\uC11C", valueKey: "unconfirmedDocs", suffix: "\uAC74" },
    { id: "newPurchaseOrders", label: "\uC2E0\uADDC\uBC1C\uC8FC", valueKey: "newPurchaseOrders", suffix: "\uAC74" },
  ],
  statistics: [
    { id: "monthProduction", label: "\uAE08\uC6D4\uC0DD\uC0B0", valueKey: "monthProduction", suffix: "\uAC74" },
    { id: "qualityPassRate", label: "\uD569\uACA9\uB960", valueKey: "qualityPassRate", format: "percent" },
  ],
  accountingClerk: [
    { id: "issuedStatements", label: "\uBC1C\uD589\uBA85\uC138\uC11C", valueKey: "issuedStatements", suffix: "\uAC74" },
    { id: "pendingStatements", label: "\uBBF8\uBC1C\uD589", valueKey: "pendingStatements", suffix: "\uAC74" },
    { id: "companyCount", label: "\uAC70\uB798\uCC98", valueKey: "companyCount", suffix: "\uACF3" },
  ],
  accounting: [
    { id: "monthSales", label: "\uAE08\uC6D4\uB9E4\uCD9C", valueKey: "monthSales", suffix: "\uAC74" },
    { id: "taxInvoiceCount", label: "\uC138\uAE08\uACC4\uC0B0\uC11C", valueKey: "taxInvoiceCount", suffix: "\uAC74" },
    { id: "closingStatus", label: "\uB9C8\uAC10\uC0C1\uD0DC", valueKey: "closingStatus", format: "text" },
  ],
  masterData: [
    { id: "companies", label: "\uAC70\uB798\uCC98", valueKey: "companies", suffix: "\uACF3" },
    { id: "products", label: "\uC81C\uD488", valueKey: "products", suffix: "\uAC74" },
    { id: "equipment", label: "\uC124\uBE44", valueKey: "equipment", suffix: "\uB300" },
  ],
  company: [
    { id: "employees", label: "\uC9C1\uC6D0", valueKey: "employees", suffix: "\uBA85" },
    { id: "companies", label: "\uAC70\uB798\uCC98", valueKey: "companies", suffix: "\uACF3" },
    { id: "equipment", label: "\uC124\uBE44", valueKey: "equipment", suffix: "\uB300" },
  ],
  environment: [
    { id: "userCount", label: "\uC0AC\uC6A9\uC790", valueKey: "userCount", suffix: "\uBA85" },
    { id: "backupStatus", label: "\uBC31\uC5C5\uC0C1\uD0DC", valueKey: "backupStatus", format: "text" },
  ],
};

/** @type {Record<string, Record<string, string | number>>} */
export const WORKSPACE_HEADER_KPI_PLACEHOLDERS = {
  home: { workflowActive: 0, inspectionWait: 0, shipWait: 0 },
  operations: { todayInbound: 0, shipScheduled: 0, inspectionRequest: 0 },
  production: { inProduction: 0, chargeWait: 0, equipmentRunning: 0 },
  quality: { inspectionWait: 0, certWait: 0, ncrCount: 0 },
  documents: { unconfirmedDocs: 0, newPurchaseOrders: 0 },
  statistics: { monthProduction: 0, qualityPassRate: 0 },
  accountingClerk: { issuedStatements: 0, pendingStatements: 0, companyCount: 0 },
  accounting: { monthSales: 0, taxInvoiceCount: 0, closingStatus: "\uC9C4\uD589\uC911" },
  masterData: { companies: 0, products: 0, equipment: 0 },
  company: { employees: 0, companies: 0, equipment: 0 },
  environment: { userCount: 0, backupStatus: "\uC815\uC0C1" },
};

/** @param {string} sectionId */
export function getWorkspaceHeaderKpiDefs(sectionId) {
  return WORKSPACE_HEADER_KPI_DEFS[sectionId] ?? WORKSPACE_HEADER_KPI_DEFS.home;
}

/** @param {string} sectionId */
export function getWorkspaceHeaderKpiPlaceholders(sectionId) {
  return WORKSPACE_HEADER_KPI_PLACEHOLDERS[sectionId] ?? WORKSPACE_HEADER_KPI_PLACEHOLDERS.home;
}

/**
 * @param {string | number | undefined | null} value
 * @param {WorkspaceHeaderKpiDef} def
 */
export function formatWorkspaceHeaderKpiValue(value, def) {
  if (value == null || value === "") return "\u2014";
  if (def.format === "text") return String(value);
  if (def.format === "percent") {
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return `${num}%`;
    return String(value);
  }
  const suffix = def.suffix ?? "";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(num)) return `${num}${suffix}`;
  return `${String(value)}${suffix}`;
}
