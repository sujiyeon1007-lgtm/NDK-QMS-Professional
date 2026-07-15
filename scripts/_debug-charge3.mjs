import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const memory = new Map();
globalThis.sessionStorage = { getItem:(k)=>memory.get(k)??null, setItem:(k,v)=>memory.set(k,String(v)), removeItem:(k)=>memory.delete(k), clear:()=>memory.clear(), get length(){return memory.size}, key:(i)=>[...memory.keys()][i]??null };
globalThis.localStorage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{}, clear:()=>{}, get length(){return 0}, key:()=>null };
globalThis.window = { dispatchEvent:()=>{}, addEventListener:()=>{}, removeEventListener:()=>{} };
const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(pathToFileURL(path.join(root,"src/foundation/data/index.js")).href);
const { replaceSessionProductionRecords, addSessionProductionRecord } = await import(pathToFileURL(path.join(root,"src/utils/productionRecords.js")).href);
const { WORKFLOW_STATUS, applyMoveToProductionWaiting, isProductionWaitingStageRecord } = await import(pathToFileURL(path.join(root,"src/utils/titanWorkflowStatus.js")).href);
const { getChargeableLots } = await import(pathToFileURL(path.join(root,"src/utils/equipmentWorkflowService.js")).href);
const { EQUIPMENT_RAW_LIST } = await import(pathToFileURL(path.join(root,"src/config/equipmentConfig.js")).href);
const { syncMasterCategoryToStore } = await import(pathToFileURL(path.join(root,"src/foundation/data/master/masterDataSync.js")).href);
const ION = "\uC774\uC628\uC9C8\uD654";
for (const label of ["RC1", "GP0"]) {
  resetTitanDataEngineInstance(); getTitanDataEngine();
  syncMasterCategoryToStore("equipment", EQUIPMENT_RAW_LIST.filter((r)=>!r.maintenance).map((r)=>({id:r.id,code:r.code,name:r.name,process:r.process,active:true})));
  replaceSessionProductionRecords([]);
  const company = label === "RC1" ? "RC1\uC785\uACE0\uAC80\uC99D" : "GP0\uAC70\uB798\uCC98";
  addSessionProductionRecord({ id:label+"-1", mesManagementNo:label+"-1", company, partName:"P", partNo:label+"-P0", material:"SCM440", qty:3, heatTreatment:ION, processDetail:ION, incomingRegistered:true, registered:false, workflowStatus:WORKFLOW_STATUS.WORK_WAIT, lotNo:"" });
  applyMoveToProductionWaiting([label+"-1"]);
  const lots = getChargeableLots("ION-01");
  console.log(label, "waiting", isProductionWaitingStageRecord, "lots", lots.length);
}