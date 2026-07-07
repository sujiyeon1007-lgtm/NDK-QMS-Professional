/**
 * Project TITAN V1.6 — Master Data Integration 검증
 * Usage: npm run verify:master-data-integration
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

globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
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
const masterDataIndex = pathToFileURL(path.join(root, "src/utils/masterData.js")).href;
const equipmentServiceIndex = pathToFileURL(
  path.join(root, "src/utils/equipmentWorkflowService.js")
).href;

const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(dataIndex);
const {
  getMasterDataByCategory,
  stageMasterAdd,
  stageMasterUpdate,
  stageMasterDelete,
} = await import(masterDataIndex);
const { getEquipmentList, getEquipmentById } = await import(equipmentServiceIndex);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

resetTitanDataEngineInstance();

const masterEquipment = getMasterDataByCategory("equipment");
assert(masterEquipment.length >= 21, "master equipment must seed from defaults");

const engine = getTitanDataEngine();
const storeEquipment = engine.equipment.list();
assert(storeEquipment.length === masterEquipment.length, "EquipmentStore must mirror master equipment count");

const masterCodes = new Set(masterEquipment.map((row) => row.code));
storeEquipment.forEach((row) => {
  assert(masterCodes.has(row.code), `EquipmentStore code ${row.code} must exist in master`);
});

const mesList = getEquipmentList();
assert(mesList.length === storeEquipment.length, "MES equipment list must use EquipmentStore");

const sampleCode = masterEquipment[0]?.code;
assert(sampleCode, "sample master equipment code required");
assert(getEquipmentById(sampleCode)?.id === sampleCode, "getEquipmentById must resolve store equipment");

const companiesBefore = engine.customer.list().length;
assert(companiesBefore > 0, "CustomerStore must sync companies");

const productsBefore = engine.product.list().length;
assert(productsBefore > 0, "ProductStore must sync products");

const workersBefore = engine.worker.list().length;
assert(workersBefore > 0, "WorkerStore must sync workers");

const processesBefore = engine.process.list().length;
assert(processesBefore > 0, "ProcessStore must sync heatTreatment");

const addResult = stageMasterAdd("equipment", {
  code: "QA-TEST-01",
  name: "QA Test Furnace",
  equipType: "이온질화",
  location: "1공장",
  active: true,
});
assert(addResult.ok, addResult.message ?? "equipment add failed");

const afterAddStore = engine.equipment.list();
assert(
  afterAddStore.some((row) => row.code === "QA-TEST-01"),
  "EquipmentStore must reflect equipment add from settings"
);
assert(
  getEquipmentById("QA-TEST-01")?.name === "QA Test Furnace",
  "MES must reflect equipment add immediately"
);

const updateResult = stageMasterUpdate("equipment", addResult.row.id, {
  ...addResult.row,
  name: "QA Test Furnace Updated",
  equipType: "연질화",
});
assert(updateResult.ok, updateResult.message ?? "equipment update failed");
assert(
  getEquipmentById("QA-TEST-01")?.process === "연질화",
  "MES must reflect equipment process update"
);

const deleteResult = stageMasterDelete("equipment", addResult.row.id);
assert(deleteResult.ok, deleteResult.message ?? "equipment delete failed");
assert(
  !engine.equipment.list().some((row) => row.code === "QA-TEST-01"),
  "EquipmentStore must remove deleted equipment"
);

const usedEquipment = masterEquipment.find((row) => row.code === "3S-1");
assert(usedEquipment, "3S-1 equipment required for usage guard test");
const blockedDelete = stageMasterDelete("equipment", usedEquipment.id);
assert(!blockedDelete.ok, "in-use equipment must not be hard-deleted");
assert(
  engine.equipment.list().some((row) => row.code === "3S-1"),
  "in-use equipment must remain in EquipmentStore after blocked delete"
);

console.log("[verify-master-data-integration] OK");
console.log(
  JSON.stringify(
    {
      masterEquipment: masterEquipment.length,
      storeEquipment: engine.equipment.list().length,
      mesEquipment: mesList.length,
      customerCount: engine.customer.list().length,
      productCount: engine.product.list().length,
      workerCount: engine.worker.list().length,
      processCount: engine.process.list().length,
    },
    null,
    2
  )
);
