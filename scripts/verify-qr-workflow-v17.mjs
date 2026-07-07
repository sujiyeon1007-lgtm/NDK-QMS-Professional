/**
 * Project TITAN V1.7 — QR Workflow & LOT Traceability 검증
 * Usage: npm run verify:qr-workflow-v17
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
const equipmentQrWorkflowIndex = pathToFileURL(
  path.join(root, "src/utils/equipmentQrWorkflow.js")
).href;
const lotTraceabilityIndex = pathToFileURL(
  path.join(root, "src/utils/lotTraceabilityModel.js")
).href;
const timelineQueryIndex = pathToFileURL(path.join(root, "src/utils/timelineQuery.js")).href;
const smartAccessIndex = pathToFileURL(
  path.join(root, "src/config/smartAccessArchitecture.js")
).href;
const masterDataIndex = pathToFileURL(path.join(root, "src/utils/masterData.js")).href;

const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(dataIndex);
const { resetTitanWorkflowEngineInstance } = await import(workflowIndex);
const {
  executeStartCharging,
  executeFinishCharging,
  initTitanWorkflowIntegration,
  resetTitanWorkflowIntegrationForTests,
  getTimelineByLotNo,
} = await import(integrationIndex);
const { getEquipmentList } = await import(equipmentServiceIndex);
const { processEquipmentQrScan, resolveEquipmentQrNavigationPath } = await import(
  equipmentQrWorkflowIndex
);
const { buildLotTraceabilityView } = await import(lotTraceabilityIndex);
const { getTimelineEntries } = await import(timelineQueryIndex);
const { buildSmartAccessPath } = await import(smartAccessIndex);
await import(masterDataIndex);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

resetTitanDataEngineInstance();
resetTitanWorkflowEngineInstance();
resetTitanWorkflowIntegrationForTests();
initTitanWorkflowIntegration();

const equipment = getEquipmentList().find(
  (row) => row.status === "ready" && row.chargeableLots.length > 0
);
assert(equipment, "ready equipment with chargeable lots required");

const lotRow = equipment.chargeableLots[0];
const equipmentCode = equipment.id;

const qrPath = resolveEquipmentQrNavigationPath(`NDK://EQ/${equipmentCode}`);
assert(
  qrPath === `/production/charging/equipment/${encodeURIComponent(equipmentCode)}`,
  "equipment QR must route to charging equipment page"
);

const smartPath = buildSmartAccessPath("equipment", { code: equipmentCode });
assert(
  smartPath.startsWith(`/production/charging/equipment/${equipmentCode}`),
  "Smart Access equipment path must use charging route"
);

const scanResult = processEquipmentQrScan(`NDK://EQ/${equipmentCode}`);
assert(scanResult.ok, "processEquipmentQrScan must succeed for valid equipment QR");
assert(scanResult.availableLots.length >= 1, "scan must expose chargeable lots");

const dataEngine = getTitanDataEngine();
const timelineBefore = dataEngine.timeline.list().length;

const startResult = executeStartCharging({
  equipmentId: equipmentCode,
  lotNo: lotRow.lotNo,
  chargeableRow: lotRow,
  operator: "V17-QA",
  managementId: lotRow.managementId ?? "",
});

assert(startResult.productionId, "startCharging must return productionId");

const chargeTimeline = dataEngine.timeline
  .list()
  .find((row) => row.type === "charge_start" && row.lotNo === lotRow.lotNo);
assert(chargeTimeline, "timeline must include charge_start row for lot after startCharging");
assert(chargeTimeline?.equipmentId, "timeline row must include equipmentId after startCharging");

const lotTimeline = getTimelineByLotNo(lotRow.lotNo);
assert(lotTimeline.length >= 1, "getTimelineByLotNo must return charge start event");

const lotView = buildLotTraceabilityView(lotRow.lotNo);
assert(lotView, "buildLotTraceabilityView must return view");
assert(lotView.lotNo, "lot traceability must include lotNo");
assert(lotView.dailyReport, "lot traceability must include dailyReport section");
assert(lotView.certificate.linkPrep, "certificate link prep must be present");

executeFinishCharging({
  equipmentId: equipmentCode,
  lotNo: lotRow.lotNo,
  productionId: startResult.productionId,
});

const timelineAfterFinish = dataEngine.timeline.list().length;
assert(timelineAfterFinish > timelineBefore, "timeline must grow after workflow");

const filtered = getTimelineEntries({ lotNo: lotRow.lotNo, equipmentId: equipmentCode });
assert(filtered.length >= 2, "LOT+equipment timeline filter must return workflow events");

console.log("[verify-qr-workflow-v17] OK");
console.log(
  JSON.stringify(
    {
      equipmentCode,
      lotNo: lotRow.lotNo,
      qrPath,
      smartPath,
      timelineCount: timelineAfterFinish,
      lotTraceability: {
        lotNo: lotView.lotNo,
        dailyReport: lotView.dailyReport.status,
        certificate: lotView.certificate.status,
        linkPrep: lotView.certificate.linkPrep.pdfStatus,
      },
    },
    null,
    2
  )
);
