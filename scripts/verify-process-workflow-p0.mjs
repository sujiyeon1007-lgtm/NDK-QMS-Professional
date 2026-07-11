/**
 * PM OFFICIAL Process Workflow verify (node)
 * Run: npx vite-node scripts/verify-process-workflow-p0.mjs
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

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

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`);
}

const MANAGEMENT_ID = "PW-MULTI-001";
const ION_EQUIPMENT = "ION-01";
const AUX_EQUIPMENT = "AUX-01";
const OPERATOR = "\uC0DD\uC0B0\uBD80";

const CLEANING = "\uC138\uCC99";
const ION = "\uC774\uC628\uC9C8\uD654";
const SHOT = "\uC1FC\uD2B8";

const MULTI_WORKFLOW = [
  { order: 1, processCategory: "cleaning", processDetail: CLEANING },
  { order: 2, processCategory: "heatTreatment", processDetail: ION },
  { order: 3, processCategory: "shot", processDetail: SHOT },
];

try {
  const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(
    pathToFileURL(path.join(root, "src/foundation/data/index.js")).href
  );
  const {
    replaceSessionProductionRecords,
    getSessionProductionRecords,
    addSessionProductionRecord,
  } = await import(pathToFileURL(path.join(root, "src/utils/productionRecords.js")).href);
  const {
    WORKFLOW_STATUS,
    applyMoveToProductionWaiting,
    isProductionWaitingStageRecord,
    getWorkflowStatus,
  } = await import(pathToFileURL(path.join(root, "src/utils/titanWorkflowStatus.js")).href);
  const { getChargeableLots, ensureLotBeforeCharging, getEquipmentById } = await import(
    pathToFileURL(path.join(root, "src/utils/equipmentWorkflowService.js")).href
  );
  const { executeStartCharging, executeFinishCharging } = await import(
    pathToFileURL(path.join(root, "src/utils/titanWorkflowIntegration.js")).href
  );
  const { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } = await import(
    pathToFileURL(path.join(root, "src/utils/workflowProcessStatus.js")).href
  );
  const { EQUIPMENT_RAW_LIST } = await import(
    pathToFileURL(path.join(root, "src/config/equipmentConfig.js")).href
  );
  const { syncMasterCategoryToStore } = await import(
    pathToFileURL(path.join(root, "src/foundation/data/master/masterDataSync.js")).href
  );
  const {
    buildInboundProcessWorkflowPatch,
    resolveRecordCurrentProcessDetail,
  } = await import(pathToFileURL(path.join(root, "src/utils/productProcessWorkflow.js")).href);

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

  const product = {
    processCategory: "cleaning",
    processDetail: CLEANING,
    process: CLEANING,
    processWorkflow: MULTI_WORKFLOW,
  };
  const inboundPatch = buildInboundProcessWorkflowPatch(product);

  addSessionProductionRecord({
    id: MANAGEMENT_ID,
    mesManagementNo: MANAGEMENT_ID,
    company: "\uD14C\uC2A4\uD2B8",
    partName: "\uBA40\uD2F0\uC2A4\uD15D",
    partNo: "PW-MULTI-P0",
    material: "SCM440",
    qty: 1,
    incomingRegistered: true,
    registered: false,
    workflowStatus: "",
    lotNo: "",
    ...inboundPatch,
  });

  const afterInbound = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
  step(
    "1 inbound first step = cleaning",
    afterInbound?.currentProcessStepIndex === 0 &&
      resolveRecordCurrentProcessDetail(afterInbound) === CLEANING,
    `detail=${resolveRecordCurrentProcessDetail(afterInbound)} idx=${afterInbound?.currentProcessStepIndex}`
  );

  applyMoveToProductionWaiting([MANAGEMENT_ID]);
  const waiting = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);

  async function runStep(equipmentId, expectedDetail, expectAdvance) {
    getTitanDataEngine().equipment.update(equipmentId, {
      chargeableLots: [],
      status: "idle",
      runningSession: null,
    });

    const chargeable = getChargeableLots(equipmentId);
    const waitingRow = chargeable.find(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
    );
    step(
      `chargeable on ${equipmentId} for ${expectedDetail}`,
      Boolean(waitingRow),
      `rows=${chargeable.length} detail=${resolveRecordCurrentProcessDetail(waiting)}`
    );

    const ensured = ensureLotBeforeCharging(equipmentId, waitingRow);
    const lotNo = String(
      getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID)?.lotNo ??
        ensured?.lotNo ??
        ""
    ).trim();

    executeStartCharging({
      equipmentId,
      lotNo,
      chargeableRow: ensured.chargeableRow ?? waitingRow,
      operator: OPERATOR,
    });
    executeFinishCharging({
      equipmentId,
      lotNo,
      chargeableRow: ensured.chargeableRow ?? waitingRow,
      operator: OPERATOR,
    });

    const after = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
    if (expectAdvance) {
      step(
        `advance after ${expectedDetail}`,
        resolveRecordCurrentProcessDetail(after) !== expectedDetail &&
          getWorkflowStatus(after) === WORKFLOW_STATUS.WORK_WAIT,
        `next=${resolveRecordCurrentProcessDetail(after)} status=${getWorkflowStatus(after)}`
      );
    } else {
      step(
        "final step -> INSPECTION_WAIT",
        getWorkflowStatus(after) === WORKFLOW_STATUS.PROD_DONE &&
          resolveRecordCurrentProcess(after).key === CURRENT_PROCESS_KEYS.INSPECTION_WAIT,
        resolveRecordCurrentProcess(after).key
      );
    }
  }

  step(
    "2 production waiting (cleaning)",
    isProductionWaitingStageRecord(waiting) &&
      resolveRecordCurrentProcessDetail(waiting) === CLEANING,
    resolveRecordCurrentProcessDetail(waiting)
  );

  const ionBeforeClean = getChargeableLots(ION_EQUIPMENT).some(
    (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
  );
  step("3 cleaning not on ION-01", !ionBeforeClean, `ionRows=${getChargeableLots(ION_EQUIPMENT).length}`);

  await runStep(AUX_EQUIPMENT, CLEANING, true);

  const mid = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
  step(
    "4 after cleaning -> ion step",
    resolveRecordCurrentProcessDetail(mid) === ION && mid?.currentProcessStepIndex === 1,
    `detail=${resolveRecordCurrentProcessDetail(mid)} idx=${mid?.currentProcessStepIndex}`
  );

  applyMoveToProductionWaiting([MANAGEMENT_ID]);
  await runStep(ION_EQUIPMENT, ION, true);

  const afterIon = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
  step(
    "5 after ion -> shot step",
    resolveRecordCurrentProcessDetail(afterIon) === SHOT && afterIon?.currentProcessStepIndex === 2,
    `detail=${resolveRecordCurrentProcessDetail(afterIon)}`
  );

  applyMoveToProductionWaiting([MANAGEMENT_ID]);
  await runStep(AUX_EQUIPMENT, SHOT, false);

  const failed = checks.filter((item) => !item.ok);
  console.log(`\n${failed.length ? "FAILED" : "ALL PASS"} (${checks.length} checks)`);
  process.exit(failed.length ? 1 : 0);
} catch (error) {
  console.error("FATAL", error);
  process.exit(1);
}
