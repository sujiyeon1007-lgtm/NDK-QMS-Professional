/**
 * Project TITAN V1.0 — Workflow 공정별 색상 (전 화면 통일 · Pastel)
 *
 * 입고 Blue · 생산중 Orange · 검사 Amber · 성적서 Purple · 출고완료 Green · 재처리 Red · 완료 Emerald
 */

/** @typedef {'incoming' | 'production' | 'inspection' | 'certificate' | 'shipment' | 'rework' | 'complete'} WorkflowProcessKey */

/** @type {Record<WorkflowProcessKey, { label: string, dot: string, text: string, bar: string, barActive: string, chipHover: string }>} */
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
    label: "생산중",
    dot: "#ea580c",
    text: "#c2410c",
    bar: "#fdba74",
    barActive: "#ea580c",
    chipHover: "#ffedd5",
  },
  inspection: {
    label: "검사",
    dot: "#d97706",
    text: "#b45309",
    bar: "#fcd34d",
    barActive: "#d97706",
    chipHover: "#fef3c7",
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
    label: "출고완료",
    dot: "#16a34a",
    text: "#15803d",
    bar: "#86efac",
    barActive: "#16a34a",
    chipHover: "#dcfce7",
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

/** @type {Record<string, WorkflowProcessKey>} */
export const TODAY_SUMMARY_PHASE_KEYS = {
  incoming: "incoming",
  production: "production",
  inspect: "inspection",
  cert: "certificate",
  ship: "shipment",
};

/**
 * @param {string} statusLabel
 * @returns {WorkflowProcessKey}
 */
export function getStatusLabelProcessKey(statusLabel = "") {
  const label = String(statusLabel).trim();
  if (!label) return "incoming";
  if (label.includes("재처리")) return "rework";
  if (label.includes("입고")) return "incoming";
  if (label.includes("생산")) return "production";
  if (label.includes("검사")) return "inspection";
  if (label.includes("성적서")) return "certificate";
  if (label.includes("출고")) return "shipment";
  if (label.includes("완료")) return "complete";
  return "incoming";
}

/**
 * @param {WorkflowProcessKey} key
 */
export function getWorkflowProcessColor(key) {
  return WORKFLOW_PROCESS_COLORS[key] ?? WORKFLOW_PROCESS_COLORS.incoming;
}
