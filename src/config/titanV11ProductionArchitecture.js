/**
 * Project TITAN V1.1 - Official Production Architecture (PM 2026-07-11)
 * @see docs/blueprints/V1.1/PRODUCTION_ARCHITECTURE_OFFICIAL.md
 */

import { OPERATION_ROUTES } from "./operationsRouteRegistry";
import { PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS } from "./productionManagementLauncher";
import {
  V11_MASTER_SSOT_REGISTRY,
  V11_MASTER_SSOT_SUMMARY,
  getV11MasterCompletionTable,
} from "./titanV11MasterSsotRegistry";

export const V11_PRODUCTION_ARCHITECTURE_VERSION = "V1.1-PRODUCTION-1.0";
export const V11_PRODUCTION_ARCHITECTURE_DATE = "2026-07-11";
export const V11_PRODUCTION_ARCHITECTURE_STATUS = "official-blueprint";

export const V11_PRODUCTION_PRINCIPLES = Object.freeze({
  MASTER_FIRST: {
    id: "masterFirst",
    order: 1,
    label: "Master First",
    summary:
      "Master\uB97C \uBA3C\uC800 \uC815\uC758\uD558\uACE0 \uBAA8\uB4E0 \uC5C5\uBB34 \uD654\uBA74\uC774 Master\uB97C \uCC38\uC870\uD55C\uB2E4.",
  },
  AUTOMATION_FIRST: {
    id: "automationFirst",
    order: 2,
    label: "Automation First",
    summary:
      "Master \uC120\uD0DD \uC2DC Workflow \u00B7 \uAC80\uC0AC \u00B7 \uC131\uC801\uC11C \uC815\uCC45\uC744 \uC790\uB3D9 \uC5F0\uACB0\uD55C\uB2E4.",
  },
  EXCEPTION_ALLOWED: {
    id: "exceptionAllowed",
    order: 3,
    label: "Exception Allowed",
    summary:
      "\uD604\uC7A5 \uC608\uC678(\uACF5\uC815 Skip \u00B7 \uC785\uACE0 Override \u00B7 LOT \uC218\uC815)\uB97C \uD56D\uC0C1 \uD5C8\uC6A9\uD55C\uB2E4.",
  },
});

export const V11_PRODUCTION_PRINCIPLE_CHAIN = Object.freeze([
  V11_PRODUCTION_PRINCIPLES.MASTER_FIRST.label,
  V11_PRODUCTION_PRINCIPLES.AUTOMATION_FIRST.label,
  V11_PRODUCTION_PRINCIPLES.EXCEPTION_ALLOWED.label,
]);

export const V11_PRODUCTION_MASTER_REGISTRY = V11_MASTER_SSOT_REGISTRY;

export { V11_MASTER_SSOT_SUMMARY, getV11MasterCompletionTable };

export const V11_PRODUCT_MASTER_HUB_LINKS = Object.freeze([
  "processWorkflowTemplateId",
  "processWorkflow",
  "inspectionTemplateId",
  "certificatePolicyId",
  "documentLinks",
]);

export const V11_PRODUCTION_MENU_LEGACY_REMOVED = Object.freeze([
  "LOT \uC0DD\uC131",
  "\uC7A5\uC785\uAD00\uB9AC",
  "\uC791\uC5C5\uC9C0\uC2DC\uC11C",
]);

export const V11_PRODUCTION_MENU_STRUCTURE = Object.freeze({
  productionPending: {
    id: "production-plan",
    label: "\uC0DD\uC0B0 \uB300\uAE30",
    route: OPERATION_ROUTES.productionPending,
    role: "read-only",
  },
  equipmentStatus: {
    id: "equipment-status",
    label: "\uC124\uBE44 \uAC00\uB3D9 \uD604\uD669",
    route: OPERATION_ROUTES.equipmentStatus,
    role: "work",
  },
  dailyWork: {
    id: "daily-report",
    label: "LOT \u00B7 \uC791\uC5C5\uC77C\uBCF4",
    route: OPERATION_ROUTES.dailyWork,
    role: "record",
  },
  productionHistory: {
    id: "production-history",
    label: "\uC0DD\uC0B0 \uC774\uB825",
    route: "/production/results",
    role: "archive",
  },
  shotStatus: {
    id: "shot-work",
    label: "\uC1FC\uD2B8 \uC791\uC5C5\uD604\uD669",
    route: OPERATION_ROUTES.shotStatus,
    role: "work",
  },
});

export const V11_PRODUCTION_LAUNCHER_ITEMS = PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS;

export const V11_CERTIFICATE_POLICY_RESOLUTION = Object.freeze({
  priority: ["inbound_override", "product_policy", "default"],
  inboundOverrideField: "certificateIssuePolicy",
  inboundOverrideSource: "inbound_override",
  productReferenceField: "certificatePolicyId",
});

export const V11_PRODUCTION_VISION =
  "CRUD \uD504\uB85C\uADF8\uB7A8\uC774 \uC544\uB2CC Master \uAE30\uBC18 ERP/MES/QMS";

export const V11_PRODUCTION_IMPLEMENTATION_GAP = Object.freeze([
  { section: 1, topic: "\uC124\uACC4 \uC6D0\uCE59", status: "implemented", note: "Config SSoT + Blueprint" },
  { section: 2, topic: "Master \uAD6C\uC870", status: "partial", note: "\uACF5\uC815\uC720\uD615\u00B7\uAC80\uC0AC\u00B7\uC131\uC801\uC11C Master" },
  { section: 3, topic: "\uC81C\uD488 Master Hub", status: "partial", note: "\uCC38\uC870 \uD544\uB4DC \uC5F0\uB3D9" },
  { section: 4, topic: "\uACF5\uC815\uC720\uD615 Master", status: "partial", note: "CRUD + applyTemplateToProduct" },
  { section: 5, topic: "Workflow \uC790\uB3D9 \uC0DD\uC131", status: "partial", note: "applyTemplateToProduct on product select" },
  { section: 6, topic: "\uC785\uACE0 \uC790\uB3D9 \uC5F0\uACB0", status: "implemented", note: "buildInboundProcessWorkflowPatch" },
  { section: 7, topic: "\uC0DD\uC0B0\uAD00\uB9AC \uAD6C\uC870", status: "implemented", note: "Launcher + routes" },
  { section: 8, topic: "\uC0DD\uC0B0\uB300\uAE30 \uC870\uD68C", status: "implemented", note: "read-only list" },
  { section: 9, topic: "\uC124\uBE44\uAC00\uB3D9\uD604\uD669", status: "implemented", note: "equipmentWorkflowService" },
  { section: 10, topic: "LOT \uC790\uB3D9 \uC0DD\uC131", status: "implemented", note: "charge start" },
  { section: 11, topic: "\uC791\uC5C5\uC77C\uBCF4 \uC790\uB3D9", status: "implemented", note: "charge draft" },
  { section: 12, topic: "\uACF5\uC815 \uC644\uB8CC", status: "implemented", note: "step advance" },
  { section: 13, topic: "Workflow \uC608\uC678", status: "implemented", note: "skip + log" },
  { section: 14, topic: "\uAC80\uC0AC Template Master", status: "partial", note: "CRUD + product ref" },
  { section: 15, topic: "\uC131\uC801\uC11C \uC815\uCC45 Master", status: "partial", note: "CRUD + product ref" },
]);

export function getV11ProductionArchitectureSummary() {
  return {
    version: V11_PRODUCTION_ARCHITECTURE_VERSION,
    date: V11_PRODUCTION_ARCHITECTURE_DATE,
    principles: V11_PRODUCTION_PRINCIPLE_CHAIN,
    vision: V11_PRODUCTION_VISION,
    masters: V11_PRODUCTION_MASTER_REGISTRY.map((m) => m.label),
    gaps: V11_PRODUCTION_IMPLEMENTATION_GAP,
  };
}
