/**
 * Project TITAN V1.5 — Workflow Integration 검증
 * Usage: npm run verify:workflow-integration
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

globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
  clear() {},
  get length() {
    return 0;
  },
  key() {
    return null;
  },
};

const dataIndex = pathToFileURL(path.join(root, "src/foundation/data/index.js")).href;
const workflowIndex = pathToFileURL(path.join(root, "src/foundation/workflow/index.js")).href;
const integrationIndex = pathToFileURL(path.join(root, "src/utils/titanWorkflowIntegration.js")).href;
const equipmentServiceIndex = pathToFileURL(
  path.join(root, "src/utils/equipmentWorkflowService.js")
).href;
const masterDataIndex = pathToFileURL(path.join(root, "src/utils/masterData.js")).href;

const { resetTitanDataEngineInstance } = await import(dataIndex);
const { resetTitanWorkflowEngineInstance } = await import(workflowIndex);
const {
  executeStartCharging,
  executeFinishCharging,
  initTitanWorkflowIntegration,
  resetTitanWorkflowIntegrationForTests,
} = await import(integrationIndex);
const { getEquipmentList, getEquipmentSummary } = await import(equipmentServiceIndex);
await import(masterDataIndex);
const { getTitanDataEngine } = await import(dataIndex);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

resetTitanDataEngineInstance();
resetTitanWorkflowEngineInstance();
resetTitanWorkflowIntegrationForTests();

initTitanWorkflowIntegration();

const equipment = getEquipmentList().find((row) => row.status === "ready" && row.chargeableLots.length > 0);
assert(equipment, "ready equipment with chargeable lots required");

const lotRow = equipment.chargeableLots[0];

const dataEngine = getTitanDataEngine();
const timelineBefore = dataEngine.timeline.list().length;

const startResult = executeStartCharging({
  equipmentId: equipment.id,
  lotNo: lotRow.lotNo,
  chargeableRow: lotRow,
  operator: "QA",
});

assert(startResult.productionId, "startCharging must return productionId");

const runningEquipment = getEquipmentList().find((row) => row.id === equipment.id);
assert(runningEquipment?.status === "running", "equipment must be running after startCharging");

const timelineAfterStart = dataEngine.timeline.list().length;
assert(timelineAfterStart > timelineBefore, "timeline must grow after startCharging");

const summaryAfterStart = getEquipmentSummary();
assert(summaryAfterStart.running >= 1, "equipment summary must reflect running count");

const finishResult = executeFinishCharging({
  equipmentId: equipment.id,
  lotNo: lotRow.lotNo,
  productionId: startResult.productionId,
});

assert(finishResult.productionId, "finishCharging must return productionId");

const timelineAfterFinish = dataEngine.timeline.list().length;
assert(timelineAfterFinish > timelineAfterStart, "timeline must grow after finishCharging");

console.log("[verify-workflow-integration] OK");
console.log(
  JSON.stringify(
    {
      start: startResult,
      finish: finishResult,
      timelineCount: timelineAfterFinish,
      equipmentSummary: getEquipmentSummary(),
    },
    null,
    2
  )
);
