/**
 * Project TITAN V2.0 — Control Room (설비현황) Engine 연동 검증
 * Sprint 3A — ControlRoomWorkspaceData · KPI 7 Runtime · View Tab
 * Usage: npm run verify:control-room
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
const controlRoomPath = pathToFileURL(
  path.join(root, "src/utils/controlRoomWorkspaceData.js")
).href;
const equipmentServicePath = pathToFileURL(
  path.join(root, "src/utils/equipmentWorkflowService.js")
).href;

const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(dataIndex);
const {
  CONTROL_ROOM_VIEWS,
  CONTROL_ROOM_KPI_CARDS,
  CONTROL_ROOM_LOT_COLUMNS,
  CONTROL_ROOM_PRODUCT_COLUMNS,
  getControlRoomRecords,
  getControlRoomLots,
  buildControlRoomKpis,
  buildControlRoomKpiCards,
  buildControlRoomLotMonitorRows,
  buildControlRoomProductMonitorRows,
  getControlRoomLotDetail,
  getControlRoomLotTimelineSummary,
  getControlRoomProductDetail,
  getControlRoomEquipmentGroups,
  getControlRoomSnapshot,
} = await import(controlRoomPath);
const { getEquipmentListGroupedByProcess } = await import(equipmentServicePath);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

resetTitanDataEngineInstance();
getTitanDataEngine();

assert(CONTROL_ROOM_VIEWS.length === 3, "Control Room must expose 3 Views (설비/LOT/제품)");
assert(CONTROL_ROOM_KPI_CARDS.length === 7, "Control Room must expose KPI 7");

const records = getControlRoomRecords();
assert(Array.isArray(records), "getControlRoomRecords must return array");
assert(records.length > 0, "Control Room records must come from productionStore seed");

const lots = getControlRoomLots();
assert(Array.isArray(lots), "getControlRoomLots must return array");

const kpi = buildControlRoomKpis(records);
const kpiKeys = [
  "runningEquipment",
  "utilizationRate",
  "productionLots",
  "waitingLots",
  "alarms",
  "productionDone",
  "inspectionWait",
];
kpiKeys.forEach((key) => {
  assert(typeof kpi[key] === "number", `KPI ${key} must be a runtime number`);
});
assert(kpi.utilizationRate >= 0 && kpi.utilizationRate <= 100, "가동률 must be 0~100%");

const cards = buildControlRoomKpiCards(records);
assert(cards.length === 7, "KPI cards must be 7");
assert(cards.every((card) => typeof card.value === "number"), "every KPI card must have runtime value");

const snapshot = getControlRoomSnapshot();
assert(snapshot.source === "engine", "Control Room snapshot source must be engine");
assert(typeof snapshot.equipment?.total === "number", "snapshot equipment.total required");

// Sprint 3B — Equipment View 카드 필드 (Blueprint ②: 작업자·현재제품·알람·가동률)
const groups = getEquipmentListGroupedByProcess();
assert(Array.isArray(groups) && groups.length > 0, "Equipment groups must exist");
const allCards = groups.flatMap((group) => group.items);
assert(allCards.length > 0, "Equipment cards must exist");
allCards.forEach((card) => {
  assert("operator" in card, `card ${card.equipmentId} must expose operator`);
  assert("currentProductName" in card, `card ${card.equipmentId} must expose currentProductName`);
  assert("alarm" in card, `card ${card.equipmentId} must expose alarm`);
  assert(typeof card.utilization === "number", `card ${card.equipmentId} utilization must be number`);
});
const runningCards = allCards.filter((card) => card.status === "running");
assert(runningCards.length > 0, "there must be running equipment in demo");
assert(runningCards.every((card) => card.operator), "running equipment must have operator (Engine)");
assert(
  runningCards.every((card) => card.utilization > 0),
  "running equipment utilization must be > 0"
);
const alarmCards = allCards.filter((card) => card.alarm);
assert(alarmCards.every((card) => card.alarm.label && card.alarm.level), "alarm must have label+level");

// Sprint 3C — LOT View 11 Column · Timeline · Popup detail
assert(CONTROL_ROOM_LOT_COLUMNS.length === 11, "LOT View must expose Blueprint 11 columns");
const lotRows = buildControlRoomLotMonitorRows();
assert(Array.isArray(lotRows) && lotRows.length > 0, "LOT Monitor rows must exist");
CONTROL_ROOM_LOT_COLUMNS.forEach((col) => {
  assert(col.id in lotRows[0] || col.id === "progress" && "progressLabel" in lotRows[0], `LOT row missing ${col.id}`);
});
const runningLot = lotRows.find((row) => Number(row.progress) > 0);
assert(runningLot, "there must be running LOT in demo");
assert(runningLot.operator && runningLot.operator !== "—", "running LOT must have operator from Engine");
const lotDetail = getControlRoomLotDetail(runningLot.lotNo);
assert(lotDetail?.lotNo === runningLot.lotNo, "LOT detail must resolve by lotNo");
assert(Array.isArray(lotDetail.timelineSummary), "LOT detail must include timelineSummary");
const timeline = getControlRoomLotTimelineSummary("LOT240630", 5);
assert(Array.isArray(timeline), "LOT timeline summary must be array");

// Sprint 3D — Product View 제품 중심 Monitor · Product Popup
assert(CONTROL_ROOM_PRODUCT_COLUMNS.length >= 8, "Product View must expose product-centric columns");
const productColumnIds = CONTROL_ROOM_PRODUCT_COLUMNS.map((col) => col.id);
["productName", "partNo", "company", "currentLotNo", "equipmentName", "status", "operator", "progress"].forEach(
  (id) => assert(productColumnIds.includes(id), `Product View must expose ${id} column`)
);
const productRows = buildControlRoomProductMonitorRows();
assert(Array.isArray(productRows) && productRows.length > 0, "Product Monitor rows must exist");
// 제품 중심 집계 — 제품 수 ≤ LOT 수 (LOT View 복사 ❌)
assert(productRows.length <= lotRows.length, "Product rows must aggregate LOTs (product-centric, not LOT copy)");
productRows.forEach((row) => {
  assert(row.productKey, "product row must have productKey");
  assert("partNo" in row && "currentLotNo" in row && "lotCount" in row, "product row must be product-centric");
  assert(row.lotCount >= 0, "product lotCount must be a count");
});
const productWithLots = productRows.find((row) => row.lotCount > 0);
assert(productWithLots, "at least one product must own a LOT (active production)");
const productDetail = getControlRoomProductDetail(productWithLots.productKey);
assert(productDetail?.productKey === productWithLots.productKey, "Product detail must resolve by productKey");
assert(Array.isArray(productDetail.lotSummary), "Product detail must include lotSummary (LOT list · Summary only)");
assert(productDetail.lotSummary.length === productWithLots.lotCount, "Product lotSummary must match lotCount");

// Architecture — Equipment data via WorkspaceData wrapper
const workspaceGroups = getControlRoomEquipmentGroups();
const directGroups = getEquipmentListGroupedByProcess();
assert(workspaceGroups.length === directGroups.length, "WorkspaceData equipment groups must match Engine SSOT");

console.log("✅ verify:control-room — Control Room Engine binding OK");
console.log(
  `   records=${records.length} · lots=${lots.length} · 가동설비=${kpi.runningEquipment} · 가동률=${kpi.utilizationRate}% · 알람=${kpi.alarms}`
);
console.log(
  `   equipment cards=${allCards.length} · running=${runningCards.length} · alarm=${alarmCards.length} · operator(sample)=${runningCards[0]?.operator ?? "—"}`
);
console.log(
  `   lot monitor=${lotRows.length} · columns=${CONTROL_ROOM_LOT_COLUMNS.length} · timeline(LOT240630)=${timeline.length}`
);
console.log(
  `   product monitor=${productRows.length} · columns=${CONTROL_ROOM_PRODUCT_COLUMNS.length} · sample lots=${productWithLots.lotCount}`
);
