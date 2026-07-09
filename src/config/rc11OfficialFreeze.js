/**
 * Project TITAN - RC1.1 Official Freeze (PM Baseline 2026-07-09)
 * Browser QA Gate PASS. RC1.2+ Additive only.
 */

export const RC11_OFFICIAL_FREEZE = true;
export const RC11_FREEZE_DATE = "2026-07-09";
export const RC11_FREEZE_LABEL = "RC1.1 Official Freeze";

export const RC11_FROZEN_FOUNDATION = Object.freeze([
  "TitanMenuToolbar",
  "TitanWorkspaceShell",
  "SectionPageLayout",
  "SectionPageActions",
  "operationsRouteRegistry",
  "titanBreadcrumbPolicy",
]);

export const RC11_OFFICIAL_WORKFLOW_STEPS = Object.freeze([
  { key: "inboundPending", label: "\uC785\uACE0 \uB300\uAE30", routeKey: "inboundPending" },
  { key: "inboundRegister", label: "\uC785\uACE0 \uB4F1\uB85D", routeKey: "inboundPending" },
  { key: "productionPending", label: "\uC0DD\uC0B0 \uB300\uAE30", routeKey: "productionPending" },
  { key: "dailyWork", label: "\uC791\uC5C5\uC77C\uBCF4", routeKey: "dailyWork" },
  { key: "shotStatus", label: "\uC1FC\uD2B8 \uC791\uC5C5", routeKey: "shotStatus" },
  { key: "shipmentRegister", label: "\uCD9C\uACE0 \uB4F1\uB85D", routeKey: "shipmentRegister" },
  { key: "statement", label: "\uAC70\uB798\uBA85\uC138\uC11C", routeKey: "shipmentRegister" },
  { key: "shipmentHistory", label: "\uCD9C\uACE0 \uC774\uB825", routeKey: "shipmentHistory" },
]);

export const RC11_COMPANY_MASTER_REFERENCES = Object.freeze([
  "certificate",
  "transactionStatement",
  "qrPrint",
  "documentFooter",
  "branding",
  "printHeader",
]);

export const RC1_BROWSER_QA_GATE = Object.freeze([
  "buildPass",
  "browserQaPass",
  "whiteScreenZero",
  "consoleErrorZero",
  "f5Pass",
  "directUrlPass",
  "noRegression",
]);

export const RC11_BROWSER_QA_SCRIPT = "scripts/verify-rc11-browser-qa.mjs";

export const RC12_DEVELOPMENT_POLICY = Object.freeze({
  additiveOnly: true,
  foundationChangeProhibited: true,
  routeRegistryLocked: true,
  workflowChangeProhibited: true,
  browserQaRequired: true,
});

export const RC12_SPRINT_PRIORITIES = Object.freeze([
  { order: 1, id: "qrEngine", label: "QR Engine", focus: "Registry UX, Equipment/LOT QR, Scan, Print" },
  { order: 2, id: "companyMaster", label: "Company Master", focus: "Employees, Seal, Signature, Branding" },
  { order: 3, id: "accountingClerkLite", label: "Accounting Clerk Lite", focus: "Statement, PDF, Print, Monthly" },
  { order: 4, id: "accountingLite", label: "Accounting Lite", focus: "Monthly sales, Company stats, Dashboard" },
]);

export function isRc11BaselineLocked() {
  return RC11_OFFICIAL_FREEZE;
}