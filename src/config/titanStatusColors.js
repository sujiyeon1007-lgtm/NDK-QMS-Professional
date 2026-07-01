/**
 * Project TITAN V1.0 Lock — Status Color Policy
 *
 * 현재상태(Status) 전용 · 프로젝트 전체 동일
 * 공정(Process) 색상과 분리 — heatTreatmentProcessColors.js 참조
 */

/** @typedef {'incoming-reg' | 'prod-wait' | 'prod-progress' | 'inspect-wait' | 'inspect-progress' | 'cert-wait' | 'ship-wait' | 'ship-done'} TitanStatusToneKey */

/** @type {Record<TitanStatusToneKey, { label: string }>} */
export const TITAN_STATUS_TONES = {
  "incoming-reg": { label: "입고등록" },
  "prod-wait": { label: "생산대기" },
  "prod-progress": { label: "생산중" },
  "inspect-wait": { label: "검사대기" },
  "inspect-progress": { label: "검사중" },
  "cert-wait": { label: "성적서대기" },
  "ship-wait": { label: "출고대기" },
  "ship-done": { label: "출고완료" },
};

/** HOME · KPI Chip phase id → Status tone */
/** @type {Record<string, TitanStatusToneKey>} */
export const WORKFLOW_PHASE_STATUS_TONES = {
  incoming: "incoming-reg",
  production: "prod-progress",
  inspect: "inspect-wait",
  cert: "cert-wait",
  ship: "ship-wait",
};

/**
 * @param {string} statusLabel
 * @returns {TitanStatusToneKey}
 */
export function getStatusLabelTone(statusLabel = "") {
  const label = String(statusLabel).trim();
  if (!label) return "incoming-reg";
  if (label.includes("출고완료")) return "ship-done";
  if (label.includes("출고")) return "ship-wait";
  if (label.includes("성적서")) return "cert-wait";
  if (label === "검사진행" || label.includes("검사중")) return "inspect-progress";
  if (label.includes("검사")) return "inspect-wait";
  if (label.includes("생산진행") || label === "생산중") return "prod-progress";
  if (label.includes("생산대기")) return "prod-wait";
  if (label.includes("입고")) return "incoming-reg";
  return "incoming-reg";
}

/**
 * @param {string} phaseKey
 * @returns {TitanStatusToneKey}
 */
export function getWorkflowPhaseStatusTone(phaseKey = "") {
  return WORKFLOW_PHASE_STATUS_TONES[phaseKey] ?? "incoming-reg";
}
