/**
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
