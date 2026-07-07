/**
 * Project TITAN V1.5 — TitanWorkflowEngine 검증
 * Usage: npm run verify:workflow-engine
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** @type {Map<string, string>} */
const memory = new Map();

globalThis.sessionStorage = {
  getItem(key) {
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
  },
  clear() {
    memory.clear();
  },
  get length() {
    return memory.size;
  },
  key(index) {
    return [...memory.keys()][index] ?? null;
  },
};

const dataIndex = pathToFileURL(path.join(root, "src/foundation/data/index.js")).href;
const workflowIndex = pathToFileURL(path.join(root, "src/foundation/workflow/index.js")).href;

const { resetTitanDataEngineInstance } = await import(dataIndex);
const {
  getTitanWorkflowEngine,
  resetTitanWorkflowEngineInstance,
  EQUIPMENT_WORKFLOW_STATE,
  WorkflowTransitionError,
  assertEquipmentWorkflowTransition,
} = await import(workflowIndex);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

resetTitanDataEngineInstance();
resetTitanWorkflowEngineInstance();

const workflow = getTitanWorkflowEngine();
const status = workflow.getStatus();

assert(status.version === "V1.5", "workflow version must be V1.5");
assert(status.initialized === true, "workflow engine must initialize handlers");

const equipment = workflow.dataEngine.equipment.list().find((row) => !row.maintenance);
assert(equipment, "idle equipment required for charging test");

workflow.dataEngine.equipment.update(equipment.equipmentId, {
  workflowState: EQUIPMENT_WORKFLOW_STATE.IDLE,
  status: "idle",
  currentLot: null,
  progress: 0,
  startTime: null,
  expectedEndTime: null,
  runningSession: null,
});

const lot = workflow.dataEngine.lot.list()[0];
assert(lot?.lotNo, "lot seed required");

// State machine — invalid transition blocked
let blocked = false;
try {
  assertEquipmentWorkflowTransition(EQUIPMENT_WORKFLOW_STATE.IDLE, EQUIPMENT_WORKFLOW_STATE.COMPLETE);
} catch (error) {
  blocked = error instanceof WorkflowTransitionError;
}
assert(blocked, "대기 → 완료 transition must be blocked");

blocked = false;
try {
  assertEquipmentWorkflowTransition(EQUIPMENT_WORKFLOW_STATE.CHARGING, EQUIPMENT_WORKFLOW_STATE.COMPLETE);
} catch (error) {
  blocked = error instanceof WorkflowTransitionError;
}
assert(blocked, "장입중 → 완료 transition must be blocked");

// Allowed transition
assert(
  assertEquipmentWorkflowTransition(
    EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING,
    EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT
  ) === EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT,
  "열처리중 → 검사대기 must be allowed"
);

const timelineBefore = workflow.dataEngine.timeline.list().length;

const chargeResult = workflow.startCharging({
  equipmentId: equipment.equipmentId,
  lotNo: lot.lotNo,
  operator: "QA",
  managementId: lot.managementId ?? "",
});

assert(chargeResult.productionId, "startCharging must return productionId");
assert(
  chargeResult.workflowState === EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING,
  "equipment must be 열처리중 after startCharging"
);

const updatedEquipment = workflow.dataEngine.equipment.getById(equipment.equipmentId);
assert(
  updatedEquipment?.workflowState === EQUIPMENT_WORKFLOW_STATE.HEAT_TREATING,
  "equipment store must reflect 열처리중"
);

const finishResult = workflow.finishCharging({
  equipmentId: equipment.equipmentId,
  lotNo: lot.lotNo,
  productionId: chargeResult.productionId,
});

assert(
  finishResult.workflowState === EQUIPMENT_WORKFLOW_STATE.INSPECTION_WAIT,
  "equipment must be 검사대기 after finishCharging"
);

const inspectionStart = workflow.startInspection({
  lotNo: lot.lotNo,
  managementId: lot.managementId ?? "",
  inspector: "QA",
});
assert(inspectionStart.inspection, "startInspection must create inspection row");

const inspectionId = String(
  inspectionStart.inspection.id ?? inspectionStart.inspection.logId ?? ""
);
assert(inspectionId, "inspection id required");

const inspectionFinish = workflow.finishInspection({
  inspectionId,
  lotNo: lot.lotNo,
  judgment: "합격",
});
assert(inspectionFinish.inspection, "finishInspection must update inspection");

const certificate = workflow.issueCertificate({
  lotNo: lot.lotNo,
  managementId: lot.managementId ?? "",
  equipmentId: equipment.equipmentId,
  issuer: "QA",
});
assert(certificate.certificate, "issueCertificate must create certificate");

const ship = workflow.shipProduct({
  lotNo: lot.lotNo,
  productionId: chargeResult.productionId,
  equipmentId: equipment.equipmentId,
});
assert(ship.lotNo === lot.lotNo, "shipProduct must complete shipment");

const resetEquipment = workflow.dataEngine.equipment.getById(equipment.equipmentId);
assert(
  resetEquipment?.workflowState === EQUIPMENT_WORKFLOW_STATE.IDLE,
  "equipment must return to 대기 after shipProduct"
);

const timelineAfter = workflow.dataEngine.timeline.list().length;
assert(timelineAfter > timelineBefore, "timeline events must be appended during pipeline");

const kpi = workflow.dataEngine.dashboard.getKpi();
assert(typeof kpi.equipmentTotal === "number", "dashboard KPI must refresh");

console.log("[verify-titan-workflow-engine] OK");
console.log(JSON.stringify(workflow.getStatus(), null, 2));
