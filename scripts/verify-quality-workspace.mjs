/**
 * Project TITAN V2.0 — Quality Workspace 검증 (Sprint 6)
 * Usage: npm run verify:quality-workspace
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
const qualityWorkspacePath = pathToFileURL(
  path.join(root, "src/utils/qualityWorkspaceData.js")
).href;
const launcherMetricsPath = pathToFileURL(
  path.join(root, "src/utils/operationsLauncherMetrics.js")
).href;

const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(dataIndex);
const {
  getQualityRecords,
  getQualityWorkspaceSnapshot,
  getInspectionMassScreenData,
  getInspectionDevScreenData,
  getInspectionOtherScreenData,
  getCertificateWorkspaceScreenData,
  getQualityHistoryScreenData,
  getNcrWorkspaceScreenData,
  getQualityWorkJournalScreenData,
} = await import(qualityWorkspacePath);
const { buildQualityLauncherMetrics } = await import(launcherMetricsPath);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertScreenData(label, data) {
  assert(data && typeof data === "object", `${label} must return object`);
  assert(Array.isArray(data.baseRecords), `${label}.baseRecords must be array`);
  assert(data.counts && typeof data.counts === "object", `${label}.counts must be object`);
}

resetTitanDataEngineInstance();
getTitanDataEngine();

const records = getQualityRecords();
assert(Array.isArray(records), "getQualityRecords must return array");
assert(records.length > 0, "quality records must be seeded");

assertScreenData("getInspectionMassScreenData", getInspectionMassScreenData(records));
assertScreenData("getInspectionDevScreenData", getInspectionDevScreenData());
assertScreenData("getInspectionOtherScreenData", getInspectionOtherScreenData());
assertScreenData("getCertificateWorkspaceScreenData", getCertificateWorkspaceScreenData(records));
assertScreenData("getQualityHistoryScreenData", getQualityHistoryScreenData(records));
assertScreenData("getNcrWorkspaceScreenData", getNcrWorkspaceScreenData(records));
assertScreenData("getQualityWorkJournalScreenData", getQualityWorkJournalScreenData());

const snapshot = getQualityWorkspaceSnapshot(records);
assert(snapshot.inspection?.counts, "snapshot.inspection.counts required");
assert(snapshot.certificate?.counts, "snapshot.certificate.counts required");
assert(snapshot.ncr?.counts, "snapshot.ncr.counts required");
assert(typeof snapshot.counts.inspectionWait === "number", "snapshot.counts.inspectionWait required");
assert(typeof snapshot.counts.certNotIssued === "number", "snapshot.counts.certNotIssued required");

const mass = getInspectionMassScreenData(records);
assert(
  mass.counts.inspectionWait + mass.counts.inspectionInProgress <= mass.baseRecords.length,
  "inspection KPI counts must not exceed baseRecords"
);

const ncr = getNcrWorkspaceScreenData(records);
assert(typeof ncr.counts.todayDefect === "number", "NCR todayDefect required for KPI");
assert(typeof ncr.counts.defectRate === "number", "NCR defectRate required for KPI");

const metrics = buildQualityLauncherMetrics(records);
assert(typeof metrics.inspectionWait === "string", "launcher inspectionWait metric required");
assert(typeof metrics.certificateWait === "string", "launcher certificateWait metric required");
assert(typeof metrics.qualityJournalToday === "string", "launcher qualityJournalToday metric required");

console.log("✅ verify:quality-workspace — Quality Workspace OK");
console.log(
  `   records=${records.length} · inspectionWait=${snapshot.counts.inspectionWait} · certNotIssued=${snapshot.counts.certNotIssued}`
);
