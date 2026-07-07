/**
 * Project TITAN V1.5 — TitanDataEngine SSOT 검증
 * Usage: npm run verify:data-engine
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** @type {Storage|null} */
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
const masterDataIndex = pathToFileURL(path.join(root, "src/utils/masterData.js")).href;

const { resetTitanDataEngineInstance } = await import(dataIndex);
await import(masterDataIndex);
const { getTitanDataEngine, TITAN_DATA_STORAGE_KEYS } = await import(dataIndex);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

resetTitanDataEngineInstance();
const engine = getTitanDataEngine();
const meta = engine.getMeta();

assert(meta.version === "V1.6", "meta.version must be V1.6");
assert(engine.equipment.list().length > 0, "equipment store must seed");
assert(engine.lot.list().length > 0, "lot store must seed");
assert(engine.production.list().length > 0, "production store must seed");
assert(engine.quality.listInspections().length > 0, "quality inspections must seed");
assert(engine.timeline.list().length > 0, "timeline store must seed");

const kpi = engine.dashboard.getKpi();
assert(typeof kpi.equipmentTotal === "number", "dashboard KPI must compute");

const created = engine.timeline.append({
  type: "custom",
  title: "QA Test Event",
  target: "VERIFY",
  time: "13:00",
  user: "system",
});
assert(created?.id, "timeline append must return id");

const updated = engine.equipment.update(engine.equipment.list()[0].equipmentId, {
  memo: "qa-patch",
});
assert(updated, "equipment update must succeed");

const pipeline = engine.getPipelineStatus();
assert(pipeline.workerCount > 0, "pipeline status must report master worker count");
assert(pipeline.customerCount > 0, "pipeline status must report master customer count");

assert(
  globalThis.sessionStorage.getItem(TITAN_DATA_STORAGE_KEYS.meta),
  "meta key must persist in sessionStorage"
);

console.log("[verify-titan-data-engine] OK");
console.log(JSON.stringify(pipeline, null, 2));
