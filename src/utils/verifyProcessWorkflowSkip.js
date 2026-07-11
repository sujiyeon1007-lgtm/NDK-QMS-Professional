/**
 * PM skip verify — run: npx vite-node src/utils/verifyProcessWorkflowSkip.js
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

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
globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
};

const MID = "PW-SKIP-001";
const AUX = "AUX-01";
const OP = "\uC0DD\uC0B0\uBD80";
const CLEAN = "\uC138\uCC99";
const ION = "\uC774\uC628\uC9C8\uD654";
const SHOT = "\uC1FC\uD2B8";
const WF = [
  { order: 1, processCategory: "cleaning", processDetail: CLEAN },
  { order: 2, processCategory: "heatTreatment", processDetail: ION },
  { order: 3, processCategory: "shot", processDetail: SHOT },
];

const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(
  pathToFileURL(path.join(root, "src/foundation/data/index.js")).href
);
const { replaceSessionProductionRecords, getSessionProductionRecords, addSessionProductionRecord } =
  await import(pathToFileURL(path.join(root, "src/utils/productionRecords.js")).href);
const { applyMoveToProductionWaiting, getWorkflowStatus } = await import(
  pathToFileURL(path.join(root, "src/utils/titanWorkflowStatus.js")).href
);
const { getChargeableLots, ensureLotBeforeCharging } = await import(
  pathToFileURL(path.join(root, "src/utils/equipmentWorkflowService.js")).href
);
const { executeStartCharging, executeFinishCharging } = await import(
  pathToFileURL(path.join(root, "src/utils/titanWorkflowIntegration.js")).href
);
const { resolveRecordCurrentProcessDetail, buildInboundProcessWorkflowPatch } = await import(
  pathToFileURL(path.join(root, "src/utils/productProcessWorkflow.js")).href
);
const { buildProductHistoryTimeline } = await import(
  pathToFileURL(path.join(root, "src/utils/ndkWorkflow.js")).href
);
const { EQUIPMENT_RAW_LIST } = await import(
  pathToFileURL(path.join(root, "src/config/equipmentConfig.js")).href
);
const { syncMasterCategoryToStore } = await import(
  pathToFileURL(path.join(root, "src/foundation/data/master/masterDataSync.js")).href
);

resetTitanDataEngineInstance();
getTitanDataEngine();
syncMasterCategoryToStore(
  "equipment",
  EQUIPMENT_RAW_LIST.filter((row) => !row.maintenance).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    process: row.process,
    active: true,
  }))
);
replaceSessionProductionRecords([]);
addSessionProductionRecord({
  id: MID,
  mesManagementNo: MID,
  company: "T",
  partName: "P",
  partNo: "X",
  material: "SCM440",
  qty: 1,
  incomingRegistered: true,
  registered: false,
  workflowStatus: "",
  lotNo: "",
  ...buildInboundProcessWorkflowPatch({
    processWorkflow: WF,
    processCategory: "cleaning",
    processDetail: CLEAN,
    process: CLEAN,
  }),
});
applyMoveToProductionWaiting([MID]);
getTitanDataEngine().equipment.update(AUX, {
  chargeableLots: [],
  status: "idle",
  runningSession: null,
});

const row = getChargeableLots(AUX).find(
  (item) => String(item.sourceRecordId ?? item.id ?? "").trim() === MID
);
const ensured = ensureLotBeforeCharging(AUX, row);
const lotNo = String(
  getSessionProductionRecords().find((item) => item.id === MID)?.lotNo ?? ensured?.lotNo ?? ""
).trim();

executeStartCharging({
  equipmentId: AUX,
  lotNo,
  chargeableRow: ensured.chargeableRow ?? row,
  operator: OP,
});
executeFinishCharging({
  equipmentId: AUX,
  lotNo,
  chargeableRow: ensured.chargeableRow ?? row,
  operator: OP,
  nextProcessStepIndex: 2,
  workflowChangeNote: "\uC1FC\uD2B8 \uACF5\uC815 \uC0DD\uB7B5 \u2192 \uC1FC\uD2B8\uB85C \uC774\uB3D9",
});

const after = getSessionProductionRecords().find((item) => item.id === MID);
const log = after?.workflowChangeLog?.[0];
const ok1 =
  after?.currentProcessStepIndex === 2 &&
  resolveRecordCurrentProcessDetail(after) === SHOT &&
  getWorkflowStatus(after) === "HT_WAIT";
const ok2 = log?.action === "WORKFLOW_SKIP" && log.fromStep === 0 && log.toStep === 2;
const ok3 = buildProductHistoryTimeline(after).some((item) => item.key === "workflow-change-0");

console.log(`PASS skip index: ${ok1}`);
console.log(`PASS workflowChangeLog: ${ok2}`);
console.log(`PASS history timeline: ${ok3}`);
process.exit(ok1 && ok2 && ok3 ? 0 : 1);
