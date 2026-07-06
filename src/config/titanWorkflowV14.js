/**
 * Project TITAN V1.4 — Workflow SSoT (PM Final · 9 stages)
 *
 * Current Process (9 stages) ≠ Heat Treatment Process ≠ Task Status ≠ Inspection Result
 * 재고는 Workflow가 아님 — 출고 완료 이후 별도 Inventory 모듈
 */

export {
  CURRENT_PROCESS_CHAIN,
  CURRENT_PROCESS_KPI_STAGES,
  CURRENT_PROCESS_KPI_BUCKETS,
  CURRENT_PROCESS_KEYS,
  CURRENT_PROCESS_LABELS,
  CURRENT_PROCESS_VARIANTS,
  SCREEN_WORKFLOW_PROCESS,
  isCurrentProcessKpiStage,
  matchesCurrentProcessKpiBucket,
  resolveRecordCurrentProcess,
} from "../utils/workflowProcessStatus";
export { MENU_TASK_STATUS } from "../utils/menuWorkflowGate";

/** Per-menu Task Status KPI labels (업무상태 — not Current Process) */
export const MENU_TASK_STATUS_KPI = Object.freeze({
  production: ["진행중", "완료"],
  inspection: ["미검사", "검사완료"],
  certificate: ["미발행", "발행완료"],
  outbound: ["미출고", "출고완료"],
});

export {
  isHeatTreatmentMenuEligible,
  isInspectionMenuEligible,
  isCertificateMenuEligible,
  isOutboundMenuEligible,
  isInventoryMenuEligible,
} from "../utils/menuWorkflowGate";
