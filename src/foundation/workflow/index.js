/**
 * Project TITAN V1.5 — Foundation Workflow Layer
 */

export {
  TitanWorkflowEngine,
  getTitanWorkflowEngine,
  resetTitanWorkflowEngineInstance,
} from "./TitanWorkflowEngine";

export {
  TitanEventBus,
  getTitanEventBus,
  resetTitanEventBusInstance,
} from "./TitanEventBus";

export { WORKFLOW_EVENTS, WORKFLOW_ENGINE_VERSION } from "./workflowEvents";

export {
  EQUIPMENT_WORKFLOW_STATE,
  EQUIPMENT_WORKFLOW_TRANSITIONS,
  WorkflowTransitionError,
  canTransitionEquipmentWorkflow,
  assertEquipmentWorkflowTransition,
  resolveEquipmentWorkflowState,
  mapWorkflowStateToEquipmentStatus,
} from "./equipmentStateMachine";

export {
  registerWorkflowStoreHandlers,
  pipelineStartCharging,
  pipelineFinishCharging,
  pipelineStartInspection,
  pipelineFinishInspection,
  pipelineIssueCertificate,
  pipelineShipProduct,
} from "./workflowPipeline";
