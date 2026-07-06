/**
 * Project TITAN V1.4 — Workflow 공정별 색상 (전 화면 통일 · Pastel)
 */

import { CURRENT_PROCESS_CHAIN, CURRENT_PROCESS_KEYS } from "../utils/workflowProcessStatus";
import { isHeatTreatmentProcessLabel } from "./heatTreatmentProcessColors";

/** @typedef {'incoming' | 'production' | 'inspection' | 'certificate' | 'shipment' | 'inventory' | 'rework' | 'complete'} WorkflowProcessKey */

export const WORKFLOW_STAGE_LABELS = Object.freeze([...CURRENT_PROCESS_CHAIN]);

export function isWorkflowStageLabel(label = "") {
  return WORKFLOW_STAGE_LABELS.includes(String(label ?? "").trim());
}

/** @type {Record<string, WorkflowProcessKey>} */
export const WORKFLOW_PROCESS_ALIASES = {
  RECEIVED: "incoming",
  HT_WAIT: "production",
  HT_RUNNING: "production",
  INSPECTION_WAIT: "inspection",
  INSPECTION_DONE: "inspection",
  CERT_WAIT: "certificate",
  CERT_DONE: "certificate",
  SHIP_WAIT: "shipment",
  SHIPPED: "shipment",
  inspect: "inspection",
  incoming: "incoming",
  inbound: "incoming",
  production: "production",
  heatTreatment: "production",
  inspection: "inspection",
  certificate: "certificate",
  cert: "certificate",
  shipment: "shipment",
  ship: "shipment",
  outbound: "shipment",
  inventory: "inventory",
  stock: "inventory",
  rework: "rework",
  complete: "complete",
};

export const WORKFLOW_PROCESS_COLORS = {
  incoming: {
    label: "입고",
    dot: "#3b82f6",
    text: "#1d4ed8",
    bar: "#bfdbfe",
    barActive: "#3b82f6",
    chipHover: "#eff6ff",
  },
  production: {
    label: "열처리",
    dot: "#ea580c",
    text: "#c2410c",
    bar: "#fdba74",
    barActive: "#ea580c",
    chipHover: "#ffedd5",
  },
  inspection: {
    label: "검사",
    dot: "#16a34a",
    text: "#15803d",
    bar: "#86efac",
    barActive: "#16a34a",
    chipHover: "#dcfce7",
  },
  certificate: {
    label: "성적서",
    dot: "#a855f7",
    text: "#7e22ce",
    bar: "#e9d5ff",
    barActive: "#a855f7",
    chipHover: "#faf5ff",
  },
  shipment: {
    label: "출고",
    dot: "#0d9488",
    text: "#0f766e",
    bar: "#99f6e4",
    barActive: "#0d9488",
    chipHover: "#ccfbf1",
  },
  inventory: {
    label: "재고",
    dot: "#64748b",
    text: "#475569",
    bar: "#cbd5e1",
    barActive: "#64748b",
    chipHover: "#f8fafc",
  },
  rework: {
    label: "재처리",
    dot: "#ef4444",
    text: "#b91c1c",
    bar: "#fecaca",
    barActive: "#ef4444",
    chipHover: "#fef2f2",
  },
  complete: {
    label: "완료",
    dot: "#10b981",
    text: "#047857",
    bar: "#a7f3d0",
    barActive: "#10b981",
    chipHover: "#ecfdf5",
  },
};

/** KPI chip id → color phase */
export const TODAY_SUMMARY_PHASE_KEYS = {
  RECEIVED: "incoming",
  HT_WAIT: "production",
  HT_RUNNING: "production",
  INSPECTION_WAIT: "inspection",
  CERT_WAIT: "certificate",
  SHIP_WAIT: "shipment",
};

export function getStatusLabelProcessKey(statusLabel = "") {
  return normalizeWorkflowProcessKey(statusLabel);
}

export function normalizeWorkflowProcessKey(input = "") {
  const raw = String(input ?? "").trim();
  if (!raw) return "incoming";

  if (WORKFLOW_PROCESS_ALIASES[raw]) {
    return WORKFLOW_PROCESS_ALIASES[raw];
  }

  const lower = raw.toLowerCase();
  for (const [alias, key] of Object.entries(WORKFLOW_PROCESS_ALIASES)) {
    if (alias.toLowerCase() === lower) {
      return key;
    }
  }

  if (Object.values(CURRENT_PROCESS_KEYS).includes(raw)) {
    return WORKFLOW_PROCESS_ALIASES[raw] ?? "incoming";
  }

  if (raw.includes("재처리")) return "rework";
  if (raw.includes("재고")) return "inventory";
  if (raw === "입고등록" || raw.includes("입고")) return "incoming";
  if (raw.includes("열처리")) return "production";
  if (raw.includes("검사")) return "inspection";
  if (raw.includes("성적")) return "certificate";
  if (raw.includes("출고")) return "shipment";
  if (raw.includes("완료")) return "complete";
  if (isHeatTreatmentProcessLabel(raw)) return "production";
  return "incoming";
}

export function getWorkflowProcessColor(key) {
  return WORKFLOW_PROCESS_COLORS[key] ?? WORKFLOW_PROCESS_COLORS.incoming;
}
