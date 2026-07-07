/**
 * Project TITAN V2.0 — HOME Workspace Engine 연동 검증
 * Usage: npm run verify:home-workspace
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const homeWorkspacePath = pathToFileURL(
  path.join(root, "src/utils/homeWorkspaceData.js")
).href;
const homeDashboardPath = pathToFileURL(
  path.join(root, "src/utils/homeDashboardData.js")
).href;
const homeLauncherPath = pathToFileURL(
  path.join(root, "src/utils/homeWorkLauncherData.js")
).href;

const { resetTitanDataEngineInstance } = await import(dataIndex);
const { getTitanDataEngine } = await import(dataIndex);
const {
  getHomeWorkspaceRecords,
  getHomeWorkspaceSnapshot,
  refreshHomeWorkspaceCache,
} = await import(homeWorkspacePath);
const { buildTodayWorkSummary, buildHomeRecentWorkItems } = await import(homeDashboardPath);
const { buildHomeWorkLauncherMetrics } = await import(homeLauncherPath);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

resetTitanDataEngineInstance();
getTitanDataEngine();

const records = getHomeWorkspaceRecords();
assert(Array.isArray(records), "getHomeWorkspaceRecords must return array");
assert(records.length > 0, "HOME records must come from productionStore seed");
assert(records.every((row) => row.id), "every HOME record must have id");

refreshHomeWorkspaceCache();
const snapshot = getHomeWorkspaceSnapshot();
assert(snapshot.source === "engine", "HOME snapshot source must be engine");
assert(typeof snapshot.kpi?.equipmentTotal === "number", "HOME KPI must include equipmentTotal");
assert(snapshot.recordCount === records.length, "snapshot recordCount must match records");

const summary = buildTodayWorkSummary(records);
assert(summary.length === 6, "HOME today summary must have 6 workflow stages");
assert(summary.every((item) => typeof item.value === "number"), "summary values must be numbers");

const recent = buildHomeRecentWorkItems(records, 7);
assert(Array.isArray(recent), "recent work items must be array");
assert(recent.length > 0, "recent work must use TimelineStore or records");

const launcherMetrics = buildHomeWorkLauncherMetrics(records);
assert(typeof launcherMetrics.inbound?.todayIncoming === "number", "launcher inbound metrics required");
assert(typeof launcherMetrics.equipmentStatus?.running === "number", "launcher equipment metrics required");
assert(typeof launcherMetrics.productStatus?.inProgress === "number", "launcher product metrics required");

console.log("✅ verify:home-workspace — HOME Engine binding OK");
console.log(`   records=${records.length} · timeline=${recent.length} · kpi.equipmentTotal=${snapshot.kpi.equipmentTotal}`);
