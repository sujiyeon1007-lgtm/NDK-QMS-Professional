/**
 * Project TITAN V1.5 — Workflow 데이터 갱신 알림 (UI refresh · Store 구독 없음)
 */

export const TITAN_WORKFLOW_REFRESH_EVENT = "titan-workflow-data-refreshed";

/** @param {Record<string, unknown>} [detail] */
export function notifyWorkflowDataRefresh(detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TITAN_WORKFLOW_REFRESH_EVENT, { detail }));
}

/** @param {(event: CustomEvent) => void} handler */
export function subscribeWorkflowDataRefresh(handler) {
  if (typeof window === "undefined") return () => {};
  const listener = /** @type {EventListener} */ (handler);
  window.addEventListener(TITAN_WORKFLOW_REFRESH_EVENT, listener);
  return () => window.removeEventListener(TITAN_WORKFLOW_REFRESH_EVENT, listener);
}
