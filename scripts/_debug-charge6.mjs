import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const memory = new Map();
globalThis.sessionStorage = { getItem:(k)=>memory.get(k)??null, setItem:(k,v)=>memory.set(k,String(v)), removeItem:(k)=>memory.delete(k), clear:()=>memory.clear(), get length(){return memory.size}, key:(i)=>[...memory.keys()][i]??null };
globalThis.localStorage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{}, clear:()=>{}, get length(){return 0}, key:()=>null };
globalThis.window = { dispatchEvent:()=>{}, addEventListener:()=>{}, removeEventListener:()=>{} };
const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(pathToFileURL(path.join(root,"src/foundation/data/index.js")).href);
const { replaceSessionProductionRecords, addSessionProductionRecord, getSessionProductionRecords } = await import(pathToFileURL(path.join(root,"src/utils/productionRecords.js")).href);
const { WORKFLOW_STATUS, applyMoveToProductionWaiting, isProductionWaitingStageRecord, getWorkflowStatus } = await import(pathToFileURL(path.join(root,"src/utils/titanWorkflowStatus.js")).href);
const { getChargeableLots, getEquipmentById, recordMatchesEquipmentProcess, getProductionWaitingRecordsForEquipment } = await import(pathToFileURL(path.join(root,"src/utils/equipmentWorkflowService.js")).href);
const { stageMasterAdd } = await import(pathToFileURL(path.join(root,"src/utils/masterData.js")).href);
const { EQUIPMENT_RAW_LIST } = await import(pathToFileURL(path.join(root,"src/config/equipmentConfig.js")).href);
const { syncMasterCategoryToStore } = await import(pathToFileURL(path.join(root,"src/foundation/data/master/masterDataSync.js")).href);
const { resolveRemainingChargeQty, resolveTotalChargedQty } = await import(pathToFileURL(path.join(root,"src/utils/equipmentChargingQty.js")).href);
const ION = "\uC774\uC628\uC9C8\uD654";
const COMPANY = "GP0\uAC70\uB798\uCC98";
function setup(withMaster) {
  memory.clear();
  resetTitanDataEngineInstance(); getTitanDataEngine();
  syncMasterCategoryToStore("equipment", EQUIPMENT_RAW_LIST.filter((r)=>!r.maintenance).map((r)=>({id:r.id,code:r.code,name:r.name,process:r.process,active:true})));
  replaceSessionProductionRecords([]);
  if (withMaster) {
    stageMasterAdd("companies", { name: COMPANY, code: "GP0TC" });
    stageMasterAdd("products", { company: COMPANY, partNo: "GP0-N-001", name: "GP0\uB0B4\uC6A9\uD488", material: "SCM440", processCategory: "heatTreatment", processDetail: ION, process: ION });
  }
  addSessionProductionRecord({ id:"GP0-NEVER-001", mesManagementNo:"GP0-NEVER-001", company: COMPANY, partName:"GP0\uB0B4\uC6A9\uD488", partNo:"GP0-N-001", material:"SCM440", qty:3, heatTreatment:ION, processDetail:ION, incomingRegistered:true, registered:false, workflowStatus:WORKFLOW_STATUS.WORK_WAIT, lotNo:"" });
  applyMoveToProductionWaiting(["GP0-NEVER-001"]);
  const record = getSessionProductionRecords().find((r)=>r.id==="GP0-NEVER-001");
  const eq = getEquipmentById("ION-01");
  const waiting = getProductionWaitingRecordsForEquipment(ION);
  console.log("--- withMaster="+withMaster+" ---");
  console.log("workflowStatus", getWorkflowStatus(record), "WORK_WAIT const", WORKFLOW_STATUS.WORK_WAIT);
  console.log("FULL", JSON.stringify(record)); console.log("incomingRegistered", record?.incomingRegistered, "qty", record?.qty, "inboundQty", record?.inboundQty, "remainingChargeQty", record?.remainingChargeQty, "totalCharged", record?.totalChargedQty);
  console.log("record-json", JSON.stringify(record));
  console.log("totalChargedResolved", resolveTotalChargedQty(record), "chargeHistory", JSON.stringify(record?.chargeHistory ?? null));
  console.log("chargeHistory", JSON.stringify(record?.chargeHistory ?? null));
  console.log("totalChargedResolved", resolveTotalChargedQty(record));
  console.log("resolveRemaining", resolveRemainingChargeQty(record));
  console.log("shipmentStatus", record?.shipmentStatus, "stockQty", record?.stockQty, "shippedQty", record?.shippedQty);
  console.log("isProductionWaiting", isProductionWaitingStageRecord(record));
  console.log("recordMatches", recordMatchesEquipmentProcess(record, ION));
  console.log("waitingRecords", waiting.length);
  console.log("eq.process", eq?.process, "eq.status", eq?.status);
  console.log("chargeableLots", getChargeableLots("ION-01").length);
}
setup(false);
setup(true);

