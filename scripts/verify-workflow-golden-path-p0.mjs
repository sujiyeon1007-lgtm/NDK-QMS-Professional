/**
 * RC1 Equipment Charge P0 (node, no browser)
 * Run: npx vite-node scripts/verify-rc1-equipment-charge-p0.mjs
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

globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
};

/**
 * Workflow Golden Path P0 (node, no browser)
 * Run: npx vite-node scripts/verify-workflow-golden-path-p0.mjs
 */
const dataIndex = pathToFileURL(path.join(root, "src/foundation/data/index.js")).href;
const productionRecordsIndex = pathToFileURL(path.join(root, "src/utils/productionRecords.js")).href;
const workflowStatusIndex = pathToFileURL(path.join(root, "src/utils/titanWorkflowStatus.js")).href;
const equipmentServiceIndex = pathToFileURL(path.join(root, "src/utils/equipmentWorkflowService.js")).href;
const equipmentConfigIndex = pathToFileURL(path.join(root, "src/config/equipmentConfig.js")).href;
const masterSyncIndex = pathToFileURL(path.join(root, "src/foundation/data/master/masterDataSync.js")).href;
const masterDataIndex = pathToFileURL(path.join(root, "src/utils/masterData.js")).href;
const integrationIndex = pathToFileURL(path.join(root, "src/utils/titanWorkflowIntegration.js")).href;
const processStatusIndex = pathToFileURL(path.join(root, "src/utils/workflowProcessStatus.js")).href;
const inspectionIndex = pathToFileURL(path.join(root, "src/utils/inspectionLogSession.js")).href;
const certificateIndex = pathToFileURL(path.join(root, "src/utils/certificateSession.js")).href;
const outboundIndex = pathToFileURL(path.join(root, "src/utils/outboundRegistration.js")).href;
const inboundStatusIndex = pathToFileURL(path.join(root, "src/utils/inboundManagementStatus.js")).href;
const operationsWorkspaceIndex = pathToFileURL(path.join(root, "src/utils/operationsWorkspaceData.js")).href;
const certPolicyIndex = pathToFileURL(path.join(root, "src/utils/certificateIssuePolicy.js")).href;

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log((ok ? "PASS" : "FAIL") + " " + name + (detail ? " :: " + detail : ""));
}

let fatal = false;
const EQUIPMENT_ID = "ION-01";
const ION_PROCESS = "이온질화";
const OPERATOR = "생산부";
const COMPANY = "GP0거래처";
const TODAY = "2026-07-11";

async function runVariant(label, managementId, partNo, partName, certPolicy) {
  const { stageMasterAdd } = await import(masterDataIndex);
  const { addSessionProductionRecord, getSessionProductionRecords } = await import(productionRecordsIndex);
  const { WORKFLOW_STATUS, applyMoveToProductionWaiting, isProductionWaitingStageRecord, getWorkflowStatus } = await import(workflowStatusIndex);
  const { getChargeableLots, ensureLotBeforeCharging, getEquipmentById } = await import(equipmentServiceIndex);
  const { executeStartCharging, executeFinishCharging } = await import(integrationIndex);
  const { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } = await import(processStatusIndex);
  const { addInspectionLog, buildInspectionLogFromRecord } = await import(inspectionIndex);
  const { upsertCertificateFileEntry, buildCertificateEntryFromRecord } = await import(certificateIndex);
  const { applyOutboundRegister } = await import(outboundIndex);

  const productResult = stageMasterAdd("products", {
    company: COMPANY,
    partNo,
    name: partName,
    material: "SCM440",
    processCategory: "ion",
    processDetail: ION_PROCESS,
    process: ION_PROCESS,
    specification: { certificatePolicy: { issuePolicy: certPolicy } },
  });
  step(label + " product register", productResult.ok === true, productResult.message || partNo);
  if (!productResult.ok) return;

  addSessionProductionRecord({
    id: managementId,
    mesManagementNo: managementId,
    company: COMPANY,
    partName,
    partNo,
    material: "SCM440",
    qty: 3,
    heatTreatment: ION_PROCESS,
    processDetail: ION_PROCESS,
    incomingRegistered: true,
    registered: false,
    workflowStatus: "",
    lotNo: "",
  });

  let record = getSessionProductionRecords().find((r) => r.id === managementId);
  step(label + " inbound RECEIVED", resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.RECEIVED, resolveRecordCurrentProcess(record).key);

  applyMoveToProductionWaiting([managementId]);
  record = getSessionProductionRecords().find((r) => r.id === managementId);
  step(label + " move HT_WAIT", resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.HT_WAIT, resolveRecordCurrentProcess(record).key);

  const chargeable = getChargeableLots(EQUIPMENT_ID);
  const waitingRow = chargeable.find((row) => String(row.sourceRecordId ?? row.id ?? "").trim() === managementId);
  const ionEq = getEquipmentById(EQUIPMENT_ID);
  step(label + " production waiting", isProductionWaitingStageRecord(record), getWorkflowStatus(record) || "null");
  step(label + " chargeable lot row", Boolean(waitingRow), "rows=" + chargeable.length + " eq=" + (ionEq?.status ?? "?"));
  if (!waitingRow) return;

  const ensured = ensureLotBeforeCharging(EQUIPMENT_ID, waitingRow);
  record = getSessionProductionRecords().find((r) => r.id === managementId);
  const lotNo = String(record?.lotNo ?? ensured?.lotNo ?? "").trim();
  step(label + " ensure LOT", ensured.ok === true && lotNo.length > 0, lotNo || ensured?.message || "");
  if (!lotNo) return;

  executeStartCharging({ equipmentId: EQUIPMENT_ID, lotNo, chargeableRow: waitingRow, operator: OPERATOR });
  record = getSessionProductionRecords().find((r) => r.id === managementId);
  const { canCancelInbound: canCancelAfterCharge, hasInboundChargeStarted } = await import(inboundStatusIndex);
  step(label + " charge started blocks cancel", hasInboundChargeStarted(record) === true, String(hasInboundChargeStarted(record)));
  step(label + " cancel blocked after charge", canCancelAfterCharge(record).ok === false, canCancelAfterCharge(record).message || "");
  executeFinishCharging({ equipmentId: EQUIPMENT_ID, lotNo, chargeableRow: waitingRow, operator: OPERATOR });
  record = getSessionProductionRecords().find((r) => r.id === managementId);
  step(label + " heat treatment INSPECTION_WAIT", resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.INSPECTION_WAIT, resolveRecordCurrentProcess(record).key);

  const log = addInspectionLog(buildInspectionLogFromRecord(record, { judgment: "합격", assignee: OPERATOR }));
  record = getSessionProductionRecords().find((r) => r.id === managementId);
  step(label + " inspection complete", Boolean(log?.id), log?.id || "");

  if (certPolicy === "never_issue") {
    step(label + " policy SHIP_WAIT", resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.SHIP_WAIT, resolveRecordCurrentProcess(record).key);
  } else {
    step(label + " policy INSPECTION_DONE", resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.INSPECTION_DONE, resolveRecordCurrentProcess(record).key);
    upsertCertificateFileEntry(buildCertificateEntryFromRecord(record));
    record = getSessionProductionRecords().find((r) => r.id === managementId);
    step(
      label + " issue without attachment",
      getWorkflowStatus(record) === WORKFLOW_STATUS.CERT_DONE,
      getWorkflowStatus(record) || "null"
    );
    step(label + " policy SHIP_WAIT after cert", resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.SHIP_WAIT, resolveRecordCurrentProcess(record).key);
  }

  const outbound = applyOutboundRegister({
    managementId,
    shipQty: "3",
    shipDate: TODAY,
    manager: OPERATOR,
    note: label,
  });
  record = getSessionProductionRecords().find((r) => r.id === managementId);
  step(label + " outbound register", outbound.ok === true, outbound.message || "");
  step(label + " SHIPPED", resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.SHIPPED, resolveRecordCurrentProcess(record).key);
}

try {
  const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(dataIndex);
  const { replaceSessionProductionRecords } = await import(productionRecordsIndex);
  const { EQUIPMENT_RAW_LIST } = await import(equipmentConfigIndex);
  const { syncMasterCategoryToStore } = await import(masterSyncIndex);
  const { stageMasterAdd } = await import(masterDataIndex);
  const { CERTIFICATE_ISSUE_POLICY } = await import(certPolicyIndex);

  step("0 Import modules", true);

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

  const companyResult = stageMasterAdd("companies", {
    name: COMPANY,
    code: "GP0TC",
    ceoName: "홍길동",
    phone: "051-555-0101",
  });
  step("1 company register", companyResult.ok === true, companyResult.message || COMPANY);

  const { addSessionProductionRecord, deleteSessionProductionRecord, getSessionProductionRecords } = await import(productionRecordsIndex);
  const { applyMoveToProductionWaiting } = await import(workflowStatusIndex);
  const { canCancelInbound, canEditInboundRecord, hasInboundChargeStarted } = await import(inboundStatusIndex);
  const { buildInboundHistoryWorkspaceRecords } = await import(operationsWorkspaceIndex);
  const { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } = await import(processStatusIndex);

  const CANCEL_MID = "GP0-CANCEL-001";
  addSessionProductionRecord({
    id: CANCEL_MID,
    mesManagementNo: CANCEL_MID,
    company: COMPANY,
    partName: "GP0취소테스트",
    partNo: "GP0-C-001",
    material: "SCM440",
    qty: 2,
    heatTreatment: ION_PROCESS,
    processDetail: ION_PROCESS,
    incomingRegistered: true,
    registered: false,
    workflowStatus: "",
    lotNo: "",
  });
  applyMoveToProductionWaiting([CANCEL_MID]);
  let cancelRecord = getSessionProductionRecords().find((r) => r.id === CANCEL_MID);
  step(
    "1b inbound history after HT_WAIT",
    buildInboundHistoryWorkspaceRecords().some((r) => r.id === CANCEL_MID),
    resolveRecordCurrentProcess(cancelRecord).key
  );
  step("1c edit allowed pre-charge", canEditInboundRecord(cancelRecord) === true, String(canEditInboundRecord(cancelRecord)));
  step("1d cancel allowed pre-charge", canCancelInbound(cancelRecord).ok === true, canCancelInbound(cancelRecord).message || "ok");
  const deleteResult = deleteSessionProductionRecord(CANCEL_MID);
  step("1e delete pre-charge", deleteResult.ok === true, deleteResult.message || "");
  step(
    "1f removed from history",
    !buildInboundHistoryWorkspaceRecords().some((r) => r.id === CANCEL_MID),
    "count=" + buildInboundHistoryWorkspaceRecords().length
  );

  await runVariant("never_issue", "GP0-NEVER-001", "GP0-N-001", "GP0내용품", CERTIFICATE_ISSUE_POLICY.NEVER_ISSUE);
  await runVariant("always_issue", "GP0-ALWAYS-001", "GP0-A-001", "GP0상시품", CERTIFICATE_ISSUE_POLICY.ALWAYS_ISSUE);
} catch (error) {
  fatal = true;
  step("Runtime", false, error instanceof Error ? error.message : String(error));
  console.error(error);
}

const failed = fatal || checks.some((c) => !c.ok);
console.log("");
console.log(failed ? "Workflow Golden Path P0: FAIL" : "Workflow Golden Path P0: PASS");
process.exit(failed ? 1 : 0);
