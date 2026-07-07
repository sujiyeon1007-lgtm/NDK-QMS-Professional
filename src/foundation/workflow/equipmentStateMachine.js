/**
 * Project TITAN V1.5 — Equipment Workflow State Machine
 * 대기 → 장입중 → 열처리중 → 검사대기 → 완료 → 대기
 */

/** @typedef {"대기"|"장입중"|"열처리중"|"검사대기"|"완료"} EquipmentWorkflowState */

export const EQUIPMENT_WORKFLOW_STATE = {
  IDLE: "대기",
  CHARGING: "장입중",
  HEAT_TREATING: "열처리중",
  INSPECTION_WAIT: "검사대기",
  COMPLETE: "완료",
};

/** @type {Record<EquipmentWorkflowState, EquipmentWorkflowState[]>} */
export const EQUIPMENT_WORKFLOW_TRANSITIONS = {
  [EQUIPMENT_WORKFLOW_STATE.IDLE]: [EQUIPMENT_WORKFLOW_STATE.CHARGING],
  [EQUIPMENT_WORKFLOW_STATE.CHARGING]: [EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING],
  [EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING]: [EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT],
  [EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT]: [EQUIPMENT_WORKFLOW_STATE.COMPLETE],
  [EQUIPMENT_WORKFLOW_STATE.COMPLETE]: [EQUIPMENT_WORKFLOW_STATE.IDLE],
};

export class WorkflowTransitionError extends Error {
  /** @param {EquipmentWorkflowState} from @param {EquipmentWorkflowState} to @param {string} [detail] */
  constructor(from, to, detail = "") {
    super(
      detail ||
        `허용되지 않는 설비 Workflow 전환: ${from} → ${to}`
    );
    this.name = "WorkflowTransitionError";
    this.from = from;
    this.to = to;
  }
}

/**
 * @param {EquipmentWorkflowState} from
 * @param {EquipmentWorkflowState} to
 */
export function canTransitionEquipmentWorkflow(from, to) {
  const allowed = EQUIPMENT_WORKFLOW_TRANSITIONS[from] ?? [];
  return allowed.includes(to);
}

/**
 * @param {EquipmentWorkflowState} from
 * @param {EquipmentWorkflowState} to
 */
export function assertEquipmentWorkflowTransition(from, to) {
  if (!canTransitionEquipmentWorkflow(from, to)) {
    throw new WorkflowTransitionError(from, to);
  }
  return to;
}

/**
 * @param {import("../data/equipmentStore").default extends never ? Record<string, unknown> : Record<string, unknown>} equipment
 * @returns {EquipmentWorkflowState}
 */
export function resolveEquipmentWorkflowState(equipment) {
  if (!equipment) return EQUIPMENT_WORKFLOW_STATE.IDLE;
  if (equipment.workflowState) return /** @type {EquipmentWorkflowState} */ (equipment.workflowState);

  if (equipment.maintenance) return EQUIPMENT_WORKFLOW_STATE.IDLE;
  if (equipment.status === "running") return EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING;
  if (equipment.status === "ready") return EQUIPMENT_WORKFLOW_STATE.IDLE;
  return EQUIPMENT_WORKFLOW_STATE.IDLE;
}

/** @param {EquipmentWorkflowState} workflowState */
export function mapWorkflowStateToEquipmentStatus(workflowState) {
  switch (workflowState) {
    case EQUIPMENT_WORKFLOW_STATE.CHARGING:
      return "ready";
    case EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING:
      return "running";
    case EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT:
    case EQUIPMENT_WORKFLOW_STATE.COMPLETE:
      return "idle";
    default:
      return "idle";
  }
}
