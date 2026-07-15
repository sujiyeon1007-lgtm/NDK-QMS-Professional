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

const dataIndex = pathToFileURL(path.join(root, "src/foundation/data/index.js")).href;
const productionRecordsIndex = pathToFileURL(
  path.join(root, "src/utils/productionRecords.js")
).href;
const workflowStatusIndex = pathToFileURL(path.join(root, "src/utils/titanWorkflowStatus.js")).href;
const equipmentServiceIndex = pathToFileURL(
  path.join(root, "src/utils/equipmentWorkflowService.js")
).href;
const equipmentConfigIndex = pathToFileURL(path.join(root, "src/config/equipmentConfig.js")).href;
const masterSyncIndex = pathToFileURL(
  path.join(root, "src/foundation/data/master/masterDataSync.js")
).href;

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`);
}

let fatal = false;

try {
  const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(dataIndex);
  const {
    replaceSessionProductionRecords,
    getSessionProductionRecords,
    addSessionProductionRecord,
  } = await import(productionRecordsIndex);
  const {
    WORKFLOW_STATUS,
    applyMoveToProductionWaiting,
    isProductionWaitingStageRecord,
    getWorkflowStatus,
  } = await import(workflowStatusIndex);
  const { getChargeableLots, ensureLotBeforeCharging, getEquipmentById, previewAutoChargeLotNumber } = await import(
    equipmentServiceIndex
  );
  const { isChargeLotNumberFormat } = await import(
    pathToFileURL(path.join(root, "src/utils/productionLotNumber.js")).href
  );
  const { executeStartCharging, executeFinishCharging } = await import(
    pathToFileURL(path.join(root, "src/utils/titanWorkflowIntegration.js")).href
  );
  const { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } = await import(
    pathToFileURL(path.join(root, "src/utils/workflowProcessStatus.js")).href
  );
  const { EQUIPMENT_RAW_LIST } = await import(equipmentConfigIndex);
  const { syncMasterCategoryToStore } = await import(masterSyncIndex);

  step("1 Import modules (equipmentWorkflowService, titanWorkflowStatus, productionRecords)", true);

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

  const EQUIPMENT_ID = "ION-01";
  const GAS_EQUIPMENT_ID = "GAS-01";
  const MANAGEMENT_ID = "RC1-EQ-CHARGE-P0-001";
  const ION_PROCESS = "\uC774\uC628\uC9C8\uD654";
  const OPERATOR = "\uC0DD\uC0B0\uBD80";

  const storeCount = getTitanDataEngine().equipment.list().length;
  const ionEquipment = getEquipmentById(EQUIPMENT_ID);
  step(
    "2 Equipment ION-01 available in store",
    storeCount > 0 && ionEquipment?.id === EQUIPMENT_ID,
    `store=${storeCount} process=${ionEquipment?.process ?? "missing"}`
  );

  addSessionProductionRecord({
    id: MANAGEMENT_ID,
    mesManagementNo: MANAGEMENT_ID,
    company: "RC1\uC785\uACE0\uAC80\uC99D",
    partName: "RC1\uC791\uC785\uD488",
    partNo: "RC1-EQ-P0",
    material: "SCM440",
    qty: 3,
    heatTreatment: ION_PROCESS,
    processDetail: ION_PROCESS,
    incomingRegistered: true,
    registered: false,
    workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
    lotNo: "",
  });

  const recordAfterCreate = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
  const createOk =
    Boolean(recordAfterCreate) &&
    recordAfterCreate.incomingRegistered === true &&
    getWorkflowStatus(recordAfterCreate) === WORKFLOW_STATUS.WORK_WAIT &&
    !String(recordAfterCreate.lotNo ?? "").trim();
  step(
    "3 Mock production record (incoming, \uC774\uC628\uC9C8\uD654, WORK_WAIT, no lotNo)",
    createOk,
    createOk ? MANAGEMENT_ID : "create failed"
  );

  const moveResult = applyMoveToProductionWaiting([MANAGEMENT_ID]);
  const stillWaiting = isProductionWaitingStageRecord(
    getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID)
  );
  step(
    "4 applyMoveToProductionWaiting (idempotent / production waiting)",
    stillWaiting,
    `moved=${moveResult.moved} skipped=${moveResult.skipped}`
  );

  const chargeable = getChargeableLots(EQUIPMENT_ID);
  const waitingRow = chargeable.find(
    (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
  );
  const chargeableOk =
    chargeable.length > 0 &&
    Boolean(waitingRow) &&
    (waitingRow.needsLotCreation === true || !String(waitingRow.lotNo ?? "").trim());
  step(
    "5 getChargeableLots(ION-01) includes waiting product row",
    chargeableOk,
    chargeableOk
      ? `rows=${chargeable.length} source=${waitingRow?.source}`
      : `rows=${chargeable.length}`
  );

  const gasBeforeCharge = getChargeableLots(GAS_EQUIPMENT_ID);
  const ionOnGasBefore = gasBeforeCharge.some(
    (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
  );
  step(
    "5b Process filter: ION waiting not on GAS-01 (pre-charge)",
    !ionOnGasBefore,
    `gasRows=${gasBeforeCharge.length}`
  );

  if (waitingRow) {
    const autoPreview = previewAutoChargeLotNumber(EQUIPMENT_ID, waitingRow);
    step(
      "6a previewAutoChargeLotNumber (DS-L-YYYYMMDD-#### pattern)",
      Boolean(autoPreview) && isChargeLotNumberFormat(autoPreview),
      autoPreview || "empty"
    );

    const editedPreview = previewAutoChargeLotNumber(EQUIPMENT_ID, waitingRow);
    const customCandidate = editedPreview.replace(/\d{4}$/, "0099");
    const ensuredAuto = ensureLotBeforeCharging(EQUIPMENT_ID, waitingRow);
    const afterAuto = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
    const autoLotNo = String(afterAuto?.lotNo ?? ensuredAuto?.lotNo ?? "").trim();
    const lotOk =
      ensuredAuto.ok === true &&
      ensuredAuto.autoCreated === true &&
      autoLotNo.length > 0 &&
      isChargeLotNumberFormat(autoLotNo);
    step("6 ensureLotBeforeCharging auto-creates LOT", lotOk, lotOk ? autoLotNo : String(ensuredAuto?.message ?? "no lotNo"));

    replaceSessionProductionRecords(
      getSessionProductionRecords().map((row) =>
        row.id === MANAGEMENT_ID ? { ...row, lotNo: "", registered: false, dailyReportAutoCreated: false } : row
      )
    );
    getTitanDataEngine().equipment.update(EQUIPMENT_ID, { chargeableLots: [], status: "idle", runningSession: null });

    const waitingRow2 = getChargeableLots(EQUIPMENT_ID).find(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
    );
    const editedEnsured = ensureLotBeforeCharging(EQUIPMENT_ID, {
      ...waitingRow2,
      lotNo: customCandidate,
    });
    const afterEdit = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
    const editOk =
      editedEnsured.ok === true &&
      editedEnsured.userEdited === true &&
      String(afterEdit?.lotNo ?? "").trim() === customCandidate;
    step("6b ensureLotBeforeCharging accepts edited LOT", editOk, editOk ? customCandidate : String(editedEnsured?.message ?? "fail"));

    const restorePreview = previewAutoChargeLotNumber(EQUIPMENT_ID, waitingRow2);
    step(
      "6c previewAutoChargeLotNumber restore candidate",
      Boolean(restorePreview) && isChargeLotNumberFormat(restorePreview),
      restorePreview || "empty"
    );

    replaceSessionProductionRecords(
      getSessionProductionRecords().map((row) =>
        row.id === MANAGEMENT_ID ? { ...row, lotNo: "", registered: false, dailyReportAutoCreated: false } : row
      )
    );
    getTitanDataEngine().equipment.update(EQUIPMENT_ID, { chargeableLots: [], status: "idle", runningSession: null });

    const waitingRow3 = getChargeableLots(EQUIPMENT_ID).find(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
    );
    const ensured = ensureLotBeforeCharging(EQUIPMENT_ID, waitingRow3);
    const after = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
    const lotNo = String(after?.lotNo ?? ensured?.lotNo ?? "").trim();
    step(
      "7 Session record has lotNo after charging prep",
      Boolean(after?.lotNo?.trim()),
      after?.lotNo ?? ""
    );

    const chargeableRow = ensured.chargeableRow ?? waitingRow3;
    let startResult = null;
    try {
      startResult = executeStartCharging({
        equipmentId: EQUIPMENT_ID,
        lotNo,
        chargeableRow,
        operator: OPERATOR,
      });
    } catch (error) {
      step("8 executeStartCharging", false, error instanceof Error ? error.message : String(error));
    }

    const afterStart = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
    const dailyReportOk =
      Boolean(startResult?.lotNo) &&
      afterStart?.registered === true &&
      afterStart?.dailyReportAutoCreated === true &&
      Boolean(afterStart?.productionWorkLog?.startAt) &&
      resolveRecordCurrentProcess(afterStart).key === CURRENT_PROCESS_KEYS.HT_RUNNING;
    step(
      "8 executeStartCharging auto-creates daily report (HT_RUNNING)",
      dailyReportOk,
      dailyReportOk
        ? `status=${getWorkflowStatus(afterStart)} process=${resolveRecordCurrentProcess(afterStart).key}`
        : String(startResult?.message ?? "start failed")
    );

    let finishResult = null;
    try {
      finishResult = executeFinishCharging({
        equipmentId: EQUIPMENT_ID,
        lotNo,
        chargeableRow,
        operator: OPERATOR,
      });
    } catch (error) {
      step("9 executeFinishCharging -> INSPECTION_WAIT", false, error instanceof Error ? error.message : String(error));
    }

    const afterFinish = getSessionProductionRecords().find((r) => r.id === MANAGEMENT_ID);
    const inspectionWaitOk =
      Boolean(finishResult?.lotNo) &&
      getWorkflowStatus(afterFinish) === WORKFLOW_STATUS.PROD_DONE &&
      resolveRecordCurrentProcess(afterFinish).key === CURRENT_PROCESS_KEYS.INSPECTION_WAIT &&
      Boolean(afterFinish?.productionCompletedAt) &&
      Boolean(afterFinish?.productionWorkLog?.endAt);
    step(
      "9 executeFinishCharging -> INSPECTION_WAIT",
      inspectionWaitOk,
      inspectionWaitOk
        ? resolveRecordCurrentProcess(afterFinish).key
        : `status=${getWorkflowStatus(afterFinish)} process=${resolveRecordCurrentProcess(afterFinish)?.key ?? "?"}`
    );

    const gasChargeable = getChargeableLots(GAS_EQUIPMENT_ID);
    const ionRowOnGas = gasChargeable.some(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
    );
    step(
      "10 Process filter: ION product still not on GAS-01 (post-finish)",
      !ionRowOnGas,
      `gasRows=${gasChargeable.length}`
    );

    const ionChargeableAfter = getChargeableLots(EQUIPMENT_ID);
    const ionRowAfterFinish = ionChargeableAfter.some(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MANAGEMENT_ID
    );
    step(
      "11 Finished product removed from chargeable list",
      !ionRowAfterFinish,
      `ionRows=${ionChargeableAfter.length}`
    );

    // --- Multi-step workflow: 세척 -> 이온질화 ---
    const MULTI_ID = "RC1-EQ-MULTI-WF-001";
    const CLEANING_PROCESS = "\uc138\ucc99";
    const AUX_EQUIPMENT_ID = "AUX-01";
    const multiWorkflow = [
      { order: 1, processCategory: "cleaning", processDetail: CLEANING_PROCESS },
      { order: 2, processCategory: "heatTreatment", processDetail: ION_PROCESS },
    ];

    replaceSessionProductionRecords([]);
    getTitanDataEngine().equipment.update(EQUIPMENT_ID, { chargeableLots: [], status: "idle", runningSession: null });
    getTitanDataEngine().equipment.update(AUX_EQUIPMENT_ID, { chargeableLots: [], status: "idle", runningSession: null });

    addSessionProductionRecord({
      id: MULTI_ID,
      mesManagementNo: MULTI_ID,
      company: "RC1\uC785\uACE0\uAC80\uC99D",
      partName: "RC1\uB2E4\uB2E8\uACC4\uD488",
      partNo: "RC1-MULTI-P0",
      material: "SCM440",
      qty: 2,
      incomingRegistered: true,
      registered: false,
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      lotNo: "",
      processWorkflow: multiWorkflow,
      currentProcessStepIndex: 0,
      currentProcessCategory: "cleaning",
      currentProcessDetail: CLEANING_PROCESS,
      processCategory: "cleaning",
      processDetail: CLEANING_PROCESS,
      heatTreatment: CLEANING_PROCESS,
      awaitingNextProcessStep: false,
    });

    applyMoveToProductionWaiting([MULTI_ID]);

    const ionBeforeCleaning = getChargeableLots(EQUIPMENT_ID);
    const auxBeforeCleaning = getChargeableLots(AUX_EQUIPMENT_ID);
    const multiOnIonBefore = ionBeforeCleaning.some(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MULTI_ID
    );
    const multiOnAuxBefore = auxBeforeCleaning.some(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MULTI_ID
    );
    step(
      "12 Multi-step: step1(세척) on AUX-01, not ION-01",
      !multiOnIonBefore && multiOnAuxBefore,
      `ion=${ionBeforeCleaning.length} aux=${auxBeforeCleaning.length}`
    );

    const auxWaitingRow = auxBeforeCleaning.find(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MULTI_ID
    );
    if (auxWaitingRow) {
      const auxEnsured = ensureLotBeforeCharging(AUX_EQUIPMENT_ID, auxWaitingRow);
      const auxLotNo = String(auxEnsured?.lotNo ?? "").trim();
      const auxStart = executeStartCharging({
        equipmentId: AUX_EQUIPMENT_ID,
        lotNo: auxLotNo,
        chargeableRow: auxEnsured.chargeableRow ?? auxWaitingRow,
        operator: OPERATOR,
      });
      const auxFinish = executeFinishCharging({
        equipmentId: AUX_EQUIPMENT_ID,
        lotNo: auxLotNo,
        chargeableRow: auxEnsured.chargeableRow ?? auxWaitingRow,
        operator: OPERATOR,
      });

      const afterCleaning = getSessionProductionRecords().find((r) => r.id === MULTI_ID);
      const advancedOk =
        Boolean(auxStart?.lotNo) &&
        Boolean(auxFinish?.lotNo) &&
        afterCleaning?.currentProcessStepIndex === 1 &&
        afterCleaning?.currentProcessDetail === ION_PROCESS &&
        afterCleaning?.awaitingNextProcessStep === true &&
        getWorkflowStatus(afterCleaning) === WORKFLOW_STATUS.WORK_WAIT;
      step(
        "13 Multi-step: finish cleaning advances to 이온질화 (WORK_WAIT)",
        advancedOk,
        advancedOk
          ? `step=${afterCleaning.currentProcessStepIndex} detail=${afterCleaning.currentProcessDetail}`
          : `status=${getWorkflowStatus(afterCleaning)} step=${afterCleaning?.currentProcessStepIndex}`
      );

      const ionAfterAdvance = getChargeableLots(EQUIPMENT_ID);
      const auxAfterAdvance = getChargeableLots(AUX_EQUIPMENT_ID);
      const multiOnIonAfter = ionAfterAdvance.some(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MULTI_ID
      );
      const multiOnAuxAfter = auxAfterAdvance.some(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MULTI_ID
      );
      step(
        "14 Multi-step: step2(이온질화) on ION-01 after advance",
        multiOnIonAfter && !multiOnAuxAfter,
        `ion=${ionAfterAdvance.length} aux=${auxAfterAdvance.length}`
      );

      const ionWaitingRow2 = ionAfterAdvance.find(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === MULTI_ID
      );
      if (ionWaitingRow2) {
        const ionEnsured2 = ensureLotBeforeCharging(EQUIPMENT_ID, ionWaitingRow2);
        const ionLotNo2 = String(ionEnsured2?.lotNo ?? auxLotNo ?? "").trim();
        executeStartCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo: ionLotNo2,
          chargeableRow: ionEnsured2.chargeableRow ?? ionWaitingRow2,
          operator: OPERATOR,
        });
        executeFinishCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo: ionLotNo2,
          chargeableRow: ionEnsured2.chargeableRow ?? ionWaitingRow2,
          operator: OPERATOR,
        });

        const afterIonFinish = getSessionProductionRecords().find((r) => r.id === MULTI_ID);
        const finalOk =
          getWorkflowStatus(afterIonFinish) === WORKFLOW_STATUS.PROD_DONE &&
          resolveRecordCurrentProcess(afterIonFinish).key === CURRENT_PROCESS_KEYS.INSPECTION_WAIT;
        step(
          "15 Multi-step: final step finish -> INSPECTION_WAIT",
          finalOk,
          finalOk
            ? resolveRecordCurrentProcess(afterIonFinish).key
            : `status=${getWorkflowStatus(afterIonFinish)}`
        );
      } else {
        step("15 Multi-step: final step finish -> INSPECTION_WAIT", false, "ion waiting row missing");
      }
    } else {
      step("13 Multi-step: finish cleaning advances to 이온질화 (WORK_WAIT)", false, "aux waiting row missing");
      step("14 Multi-step: step2(이온질화) on ION-01 after advance", false, "skipped");
      step("15 Multi-step: final step finish -> INSPECTION_WAIT", false, "skipped");
    }
  } else {
    step("5b Process filter: ION waiting not on GAS-01 (pre-charge)", false, "skipped");
    step("6a previewAutoChargeLotNumber (DS-L-YYYYMMDD-#### pattern)", false, "skipped");
    step("6 ensureLotBeforeCharging auto-creates LOT", false, "no waiting row");
    step("6b ensureLotBeforeCharging accepts edited LOT", false, "skipped");
    step("6c previewAutoChargeLotNumber restore candidate", false, "skipped");
    step("7 Session record has lotNo after charging prep", false, "skipped");
    step("8 executeStartCharging auto-creates daily report (HT_RUNNING)", false, "skipped");
    step("9 executeFinishCharging -> INSPECTION_WAIT", false, "skipped");
    step("10 Process filter: ION product still not on GAS-01 (post-finish)", false, "skipped");
    step("11 Finished product removed from chargeable list", false, "skipped");
    step("12 Multi-step: step1(세척) on AUX-01, not ION-01", false, "skipped");
    step("13 Multi-step: finish cleaning advances to 이온질화 (WORK_WAIT)", false, "skipped");
    step("14 Multi-step: step2(이온질화) on ION-01 after advance", false, "skipped");
    step("15 Multi-step: final step finish -> INSPECTION_WAIT", false, "skipped");
  }
} catch (error) {
  fatal = true;
  step("Runtime", false, error instanceof Error ? error.message : String(error));
  console.error(error);
}

const failed = fatal || checks.some((c) => !c.ok);
console.log("");
console.log(failed ? "RC1 Equipment Charge P0: FAIL" : "RC1 Equipment Charge P0: PASS");
process.exit(failed ? 1 : 0);
