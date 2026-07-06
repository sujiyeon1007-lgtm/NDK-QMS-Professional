/**
 * Project TITAN V1.3 — Heat Treatment Terminology (PM approved)
 *
 * UI · print labels only. Session/internal values (e.g. completionStatus "생산완료") are unchanged.
 */

export const HT_TERM = {
  MANAGEMENT: "열처리관리",
  DAILY_REPORT: "열처리일보",
  WAIT: "열처리대기",
  PROGRESS: "열처리중",
  DONE: "열처리완료",
  PROCESS: "열처리",
  COMPLETE_DATE: "열처리완료일",
  COMPLETE_ACTION: "열처리 완료",
  STATUS_PANEL: "열처리 현황",
  DETAIL_TITLE: "열처리관리 상세정보",
};

/** @type {Record<string, string>} Legacy stored / internal label → user-facing label */
export const HT_STATUS_DISPLAY_MAP = {
  생산: HT_TERM.PROCESS,
  생산관리: HT_TERM.MANAGEMENT,
  생산일보: HT_TERM.DAILY_REPORT,
  생산대기: HT_TERM.WAIT,
  "생산 대기": "열처리 대기",
  생산중: HT_TERM.PROGRESS,
  "생산 진행": "열처리 진행",
  "생산중/완료": "열처리중/완료",
  생산완료: HT_TERM.DONE,
  "생산 완료": HT_TERM.COMPLETE_ACTION,
  생산완료일: HT_TERM.COMPLETE_DATE,
  생산현황: "열처리현황",
  "생산 현황": HT_TERM.STATUS_PANEL,
  "생산 예정 건": "열처리 예정 건",
  "생산 완료 건": "열처리 완료 건",
  생산계획: "열처리계획",
};

/**
 * @param {string | null | undefined} label
 * @returns {string}
 */
export function displayHeatTreatmentLabel(label) {
  if (label == null || label === "") return label ?? "";
  const trimmed = String(label).trim();
  if (HT_STATUS_DISPLAY_MAP[trimmed]) return HT_STATUS_DISPLAY_MAP[trimmed];
  return trimmed;
}

/**
 * Status resolver helper — map internal workflow label to display.
 * @param {string | null | undefined} internalLabel
 * @returns {string}
 */
export function displayWorkflowStatusLabel(internalLabel) {
  return displayHeatTreatmentLabel(internalLabel);
}

/** Chip / filter matching — accepts legacy session values and new display labels */
export const HT_PROGRESS_STATUS_ALIASES = ["열처리중", "생산중", "열처리 진행", "생산 진행"];
export const HT_WAIT_STATUS_ALIASES = ["열처리대기", "생산대기", "열처리 대기", "생산 대기", "작업대기"];
export const HT_DONE_STATUS_ALIASES = ["열처리완료", "생산완료", "열처리 완료", "생산 완료", "검사대기"];
