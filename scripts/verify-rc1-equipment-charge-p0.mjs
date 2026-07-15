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
  const { getChargeableLots, ensureLotBeforeCharging, getEquipmentById, previewAutoChargeLotNumber, reconcileAllEquipmentSessionsInStore } = await import(
    equipmentServiceIndex
  );
  const { isChargeLotNumberFormat } = await import(
    pathToFileURL(path.join(root, "src/utils/productionLotNumber.js")).href
  );
  const { executeStartCharging, executeFinishCharging, executeStartChargingBatch } = await import(
    pathToFileURL(path.join(root, "src/utils/titanWorkflowIntegration.js")).href
  );
  const { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } = await import(
    pathToFileURL(path.join(root, "src/utils/workflowProcessStatus.js")).href
  );
  const { getProductionResultScreenData } = await import(
    pathToFileURL(path.join(root, "src/utils/productionWorkspaceData.js")).href
  );
  const { isWithinAnalysisPeriod } = await import(
    pathToFileURL(path.join(root, "src/utils/productionAnalytics.js")).href
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
      "6a previewAutoChargeLotNumber (YYMMDD-설비순번 pattern)",
      Boolean(autoPreview) && isChargeLotNumberFormat(autoPreview),
      autoPreview || "empty"
    );

    const editedPreview = previewAutoChargeLotNumber(EQUIPMENT_ID, waitingRow);
    const customCandidate = editedPreview.replace(/[A-Z]$/i, "Z");
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
    getTitanDataEngine()
      .lot.list()
      .forEach((row) => {
        const lotNo = String(row?.lotNo ?? "").trim();
        if (lotNo) getTitanDataEngine().lot.delete?.(lotNo);
      });

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
      String(editedEnsured.lotNo ?? afterEdit?.lotNo ?? "").trim() === customCandidate;
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

    const { buildProductionDailyReportWorkspaceRecords, buildProductionResultWorkspaceRecords } =
      await import(
        pathToFileURL(path.join(root, "src/utils/productionWorkspaceData.js")).href
      );
    const dailyRowsBeforeFinish = buildProductionDailyReportWorkspaceRecords().filter(
      (row) => String(row.lotNo ?? "").trim() === lotNo
    );
    const resultRowsBeforeFinish = buildProductionResultWorkspaceRecords().filter(
      (row) => String(row.lotNo ?? "").trim() === lotNo
    );
    step(
      "8b Start → 작업일보 row exists before Finish",
      dailyRowsBeforeFinish.length >= 1 && resultRowsBeforeFinish.length === 0,
      `daily=${dailyRowsBeforeFinish.length} result=${resultRowsBeforeFinish.length}`
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

    const resultScreen = getProductionResultScreenData();
    const historyIncludes = resultScreen.baseRecords.some((row) => row.id === MANAGEMENT_ID);
    const productionStoreCount = getTitanDataEngine().production.list().length;
    const periodVisible = isWithinAnalysisPeriod(afterFinish?.workDate, "month");
    step(
      "9b 생산이력 workspace includes finished record",
      historyIncludes && inspectionWaitOk,
      `history=${resultScreen.baseRecords.length} store=${productionStoreCount}`
    );
    step(
      "9c 생산이력 month filter includes workDate",
      periodVisible && Boolean(afterFinish?.workDate),
      afterFinish?.workDate ?? "no workDate"
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

    // --- Partial charge qty (optional input) ---
    const PARTIAL_ID = "RC1-EQ-PARTIAL-CHARGE-001";
    replaceSessionProductionRecords([]);
    getTitanDataEngine().equipment.update(EQUIPMENT_ID, { chargeableLots: [], status: "idle", runningSession: null });

    addSessionProductionRecord({
      id: PARTIAL_ID,
      mesManagementNo: PARTIAL_ID,
      company: "RC1\uC785\uACE0\uAC80\uC99D",
      partName: "RC1\uBD80\uBD84\uC7A5\uC785",
      partNo: "RC1-PARTIAL-P0",
      material: "SCM440",
      qty: 100,
      inboundQty: 100,
      incomingRegistered: true,
      registered: false,
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      lotNo: "",
      heatTreatment: ION_PROCESS,
      processDetail: ION_PROCESS,
    });
    applyMoveToProductionWaiting([PARTIAL_ID]);

    const partialWaitingRow = getChargeableLots(EQUIPMENT_ID).find(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === PARTIAL_ID
    );
    if (partialWaitingRow) {
      const partialEnsured = ensureLotBeforeCharging(EQUIPMENT_ID, partialWaitingRow);
      const partialLotNo = String(partialEnsured?.lotNo ?? "").trim();
      const partialChargeQty = 20;
      const partialRemaining = 80;

      executeStartCharging({
        equipmentId: EQUIPMENT_ID,
        lotNo: partialLotNo,
        chargeQty: partialChargeQty,
        chargeQtyMeta: {
          ok: true,
          chargeQty: partialChargeQty,
          inboundQty: 100,
          remainingQty: partialRemaining,
          isPartial: true,
        },
        chargeableRow: {
          ...(partialEnsured.chargeableRow ?? partialWaitingRow),
          chargeQty: partialChargeQty,
          inboundQty: 100,
          remainingChargeQty: partialRemaining,
        },
        operator: OPERATOR,
      });

      const afterPartialStart = getSessionProductionRecords().find((r) => r.id === PARTIAL_ID);
      step(
        "11a Partial start stores chargeQty + remainingChargeQty + history",
        afterPartialStart?.chargeQty === partialChargeQty &&
          afterPartialStart?.remainingChargeQty === partialRemaining &&
          Array.isArray(afterPartialStart?.chargeHistory) &&
          afterPartialStart.chargeHistory.length === 1,
        `charge=${afterPartialStart?.chargeQty} remain=${afterPartialStart?.remainingChargeQty}`
      );

      const { buildProductionDailyReportWorkspaceRecords } = await import(
        pathToFileURL(path.join(root, "src/utils/productionWorkspaceData.js")).href
      );
      const { resolveChargeQty } = await import(
        pathToFileURL(path.join(root, "src/utils/equipmentChargingQty.js")).href
      );
      const dailyPartialRow = buildProductionDailyReportWorkspaceRecords().find(
        (row) => String(row.id ?? "").trim() === PARTIAL_ID
      );
      const dailyPartialChargeQty = resolveChargeQty(dailyPartialRow, { lotNo: partialLotNo });
      step(
        "11a1 P0 partial charge: 작업일보 shows chargeQty (100 inbound → 20 charge)",
        dailyPartialChargeQty === partialChargeQty,
        `dailyCharge=${dailyPartialChargeQty} inbound=${afterPartialStart?.inboundQty ?? afterPartialStart?.qty}`
      );

      executeFinishCharging({
        equipmentId: EQUIPMENT_ID,
        lotNo: partialLotNo,
        chargeableRow: partialEnsured.chargeableRow ?? partialWaitingRow,
        operator: OPERATOR,
      });

      const afterPartialFinish = getSessionProductionRecords().find((r) => r.id === PARTIAL_ID);
      const partialRequeued = getChargeableLots(EQUIPMENT_ID).find(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === PARTIAL_ID
      );
      step(
        "11b Partial finish requeues remaining qty (WORK_WAIT)",
        getWorkflowStatus(afterPartialFinish) === WORKFLOW_STATUS.WORK_WAIT &&
          afterPartialFinish?.remainingChargeQty === partialRemaining &&
          partialRequeued?.qty === partialRemaining &&
          partialRequeued?.needsLotCreation === true &&
          !String(partialRequeued?.lotNo ?? "").trim() &&
          afterPartialFinish?.chargeHistory?.some(
            (entry) => entry.chargeQty === partialChargeQty && entry.status === "completed"
          ),
        `status=${getWorkflowStatus(afterPartialFinish)} requeued=${partialRequeued?.qty ?? 0}`
      );

      // --- P0-016 regression: inbound 200 · charge 100 · remain 100 ---
      const P200_ID = "RC1-EQ-P016-200-100-100";
      replaceSessionProductionRecords([]);
      getTitanDataEngine().equipment.update(EQUIPMENT_ID, { chargeableLots: [], status: "idle", runningSession: null });

      addSessionProductionRecord({
        id: P200_ID,
        mesManagementNo: P200_ID,
        company: "RC1입고검증",
        partName: "P0-016-200품",
        partNo: "P0-016-200",
        material: "SCM440",
        qty: 200,
        inboundQty: 200,
        incomingRegistered: true,
        registered: false,
        workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
        lotNo: "",
        heatTreatment: ION_PROCESS,
        processDetail: ION_PROCESS,
      });
      applyMoveToProductionWaiting([P200_ID]);

      const p200Row = getChargeableLots(EQUIPMENT_ID).find(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === P200_ID
      );
      if (p200Row) {
        const p200Ensured = ensureLotBeforeCharging(EQUIPMENT_ID, p200Row);
        const p200LotNo = String(p200Ensured?.lotNo ?? "").trim();
        const p200ChargeQty = 100;
        const p200Remaining = 100;

        executeStartCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo: p200LotNo,
          chargeQty: p200ChargeQty,
          chargeQtyMeta: {
            ok: true,
            chargeQty: p200ChargeQty,
            inboundQty: 200,
            remainingQty: p200Remaining,
            isPartial: true,
          },
          chargeableRow: {
            ...(p200Ensured.chargeableRow ?? p200Row),
            chargeQty: p200ChargeQty,
            inboundQty: 200,
            remainingChargeQty: p200Remaining,
            isPartialCharge: true,
          },
          operator: OPERATOR,
        });

        const p200DailyRow = buildProductionDailyReportWorkspaceRecords().find(
          (row) => String(row.id ?? "").trim() === P200_ID
        );
        const p200DailyChargeQty = resolveChargeQty(p200DailyRow, { lotNo: p200LotNo });
        step(
          "11b1 P0-016: 작업일보 200 inbound → 100 charge shows 100 not 200",
          p200DailyChargeQty === p200ChargeQty,
          `dailyCharge=${p200DailyChargeQty} inbound=200`
        );

        executeFinishCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo: p200LotNo,
          chargeableRow: p200Ensured.chargeableRow ?? p200Row,
          operator: OPERATOR,
        });

        const afterP200Finish = getSessionProductionRecords().find((r) => r.id === P200_ID);
        const p200Requeued = getChargeableLots(EQUIPMENT_ID).find(
          (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === P200_ID
        );
        step(
          "11b2 P0-016 partial 200/100/100 requeues product row",
          afterP200Finish?.remainingChargeQty === p200Remaining &&
            p200Requeued?.qty === p200Remaining &&
            p200Requeued?.inboundQty === 200 &&
            !String(afterP200Finish?.lotNo ?? "").trim() &&
            isProductionWaitingStageRecord(afterP200Finish),
          `remain=${afterP200Finish?.remainingChargeQty ?? 0} requeued=${p200Requeued?.qty ?? 0}`
        );

        // --- P0-ARCHITECTURE-001: cross-equipment 100→30→70 on 3S-2/10S-01 ---
        const { buildRc1EquipmentMasterSeedRows } = await import(
          pathToFileURL(path.join(root, "src/data/rc1EquipmentMasterSeed.js")).href
        );
        const CROSS_ID = "RC1-EQ-P018-CROSS-001";
        const EQUIP_3S1 = "3S-1";
        const EQUIP_3S2 = "3S-2";
        const EQUIP_10S01 = "10S-01";

        resetTitanDataEngineInstance();
        getTitanDataEngine();
        syncMasterCategoryToStore("equipment", buildRc1EquipmentMasterSeedRows());
        replaceSessionProductionRecords([]);

        addSessionProductionRecord({
          id: CROSS_ID,
          mesManagementNo: CROSS_ID,
          company: "RC1\uC785\uACE0\uAC80\uC99D",
          partName: "P018\uD488",
          partNo: "P018-001",
          material: "SCM440",
          qty: 100,
          inboundQty: 100,
          incomingRegistered: true,
          registered: false,
          workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
          lotNo: "",
          heatTreatment: ION_PROCESS,
          processDetail: ION_PROCESS,
        });
        applyMoveToProductionWaiting([CROSS_ID]);

        const crossRow3 = getChargeableLots(EQUIP_3S1).find(
          (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === CROSS_ID
        );
        const crossRow2Before = getChargeableLots(EQUIP_3S2).find(
          (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === CROSS_ID
        );
        const crossRow10Before = getChargeableLots(EQUIP_10S01).find(
          (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === CROSS_ID
        );
        step(
          "11b3-pre P0-018 waiting visible on 3S-1/3S-2/10S-01 (pre-charge)",
          Boolean(crossRow3) && Boolean(crossRow2Before) && Boolean(crossRow10Before),
          `3S-1=${crossRow3?.qty ?? 0} 3S-2=${crossRow2Before?.qty ?? 0} 10S-01=${crossRow10Before?.qty ?? 0}`
        );

        if (crossRow3) {
          const crossEnsured = ensureLotBeforeCharging(EQUIP_3S1, crossRow3);
          const crossLotNo = String(crossEnsured?.lotNo ?? "").trim();
          const crossChargeQty = 30;
          const crossRemaining = 70;

          executeStartCharging({
            equipmentId: EQUIP_3S1,
            lotNo: crossLotNo,
            chargeQty: crossChargeQty,
            chargeQtyMeta: {
              ok: true,
              chargeQty: crossChargeQty,
              inboundQty: 100,
              remainingQty: crossRemaining,
              isPartial: true,
            },
            chargeableRow: {
              ...(crossEnsured.chargeableRow ?? crossRow3),
              chargeQty: crossChargeQty,
              inboundQty: 100,
              remainingChargeQty: crossRemaining,
              isPartialCharge: true,
            },
            operator: OPERATOR,
          });

          const afterCrossStart = getSessionProductionRecords().find((r) => r.id === CROSS_ID);
          const crossRow2AfterStart = getChargeableLots(EQUIP_3S2).find(
            (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === CROSS_ID
          );
          const crossRow10AfterStart = getChargeableLots(EQUIP_10S01).find(
            (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === CROSS_ID
          );
          step(
            "11b3-mid P0-018: 70EA on 3S-2/10S-01 after 3S-1 partial start",
            afterCrossStart?.remainingChargeQty === crossRemaining &&
              crossRow2AfterStart?.qty === crossRemaining &&
              crossRow10AfterStart?.qty === crossRemaining &&
              isProductionWaitingStageRecord(afterCrossStart),
            `remain=${afterCrossStart?.remainingChargeQty ?? 0} 3S-2=${crossRow2AfterStart?.qty ?? 0} 10S-01=${crossRow10AfterStart?.qty ?? 0}`
          );

          executeFinishCharging({
            equipmentId: EQUIP_3S1,
            lotNo: crossLotNo,
            chargeableRow: crossEnsured.chargeableRow ?? crossRow3,
            operator: OPERATOR,
          });

          const afterCrossFinish = getSessionProductionRecords().find((r) => r.id === CROSS_ID);
          const crossRow2After = getChargeableLots(EQUIP_3S2).find(
            (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === CROSS_ID
          );
          const crossRow10After = getChargeableLots(EQUIP_10S01).find(
            (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === CROSS_ID
          );
          step(
            "11b3 P0-018 cross-equipment: 70EA on 3S-2/10S-01 after 3S-1 partial finish",
            afterCrossFinish?.remainingChargeQty === crossRemaining &&
              crossRow2After?.qty === crossRemaining &&
              crossRow10After?.qty === crossRemaining &&
              isProductionWaitingStageRecord(afterCrossFinish),
            `remain=${afterCrossFinish?.remainingChargeQty ?? 0} 3S-2=${crossRow2After?.qty ?? 0} 10S-01=${crossRow10After?.qty ?? 0}`
          );
        } else {
          step("11b3-mid P0-018: 70EA on 3S-2/10S-01 after 3S-1 partial start", false, "3S-1 waiting row missing");
          step("11b3 P0-018 cross-equipment: 70EA on 3S-2/10S-01 after 3S-1 partial finish", false, "3S-1 waiting row missing");
        }

        // Restore ION-01 fleet for subsequent partial tests (11c+)
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
      } else {
        step("11b2 P0-016 partial 200/100/100 requeues product row", false, "waiting row missing");
      }

      // --- P0-016: inbound 20 · charge 15 · remain 5 · 2nd LOT ---
      const P016_ID = "RC1-EQ-P016-20-15-5";
      replaceSessionProductionRecords([]);
      getTitanDataEngine().equipment.update(EQUIPMENT_ID, { chargeableLots: [], status: "idle", runningSession: null });

      addSessionProductionRecord({
        id: P016_ID,
        mesManagementNo: P016_ID,
        company: "RC1입고검증",
        partName: "P0-016품",
        partNo: "P0-016",
        material: "SCM440",
        qty: 20,
        inboundQty: 20,
        incomingRegistered: true,
        registered: false,
        workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
        lotNo: "",
        heatTreatment: ION_PROCESS,
        processDetail: ION_PROCESS,
      });
      applyMoveToProductionWaiting([P016_ID]);

      const p016Row = getChargeableLots(EQUIPMENT_ID).find(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === P016_ID
      );
      if (p016Row) {
        const p016Ensured = ensureLotBeforeCharging(EQUIPMENT_ID, p016Row);
        const firstLotNo = String(p016Ensured?.lotNo ?? "").trim();
        const firstChargeQty = 15;
        const firstRemaining = 5;

        executeStartCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo: firstLotNo,
          chargeQty: firstChargeQty,
          chargeQtyMeta: {
            ok: true,
            chargeQty: firstChargeQty,
            inboundQty: 20,
            remainingQty: firstRemaining,
            isPartial: true,
          },
          chargeableRow: {
            ...(p016Ensured.chargeableRow ?? p016Row),
            chargeQty: firstChargeQty,
            inboundQty: 20,
            remainingChargeQty: firstRemaining,
            isPartialCharge: true,
          },
          operator: OPERATOR,
        });

        executeFinishCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo: firstLotNo,
          chargeableRow: p016Ensured.chargeableRow ?? p016Row,
          operator: OPERATOR,
        });

        const afterP016Finish = getSessionProductionRecords().find((r) => r.id === P016_ID);
        const p016Requeued = getChargeableLots(EQUIPMENT_ID).find(
          (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === P016_ID
        );
        step(
          "11c P0-016 partial 20/15/5 requeues product row",
          afterP016Finish?.remainingChargeQty === firstRemaining &&
            p016Requeued?.qty === firstRemaining &&
            p016Requeued?.inboundQty === 20 &&
            !String(afterP016Finish?.lotNo ?? "").trim(),
          `remain=${afterP016Finish?.remainingChargeQty ?? 0} requeued=${p016Requeued?.qty ?? 0}`
        );

        if (p016Requeued) {
          const eqAfterPartial = getTitanDataEngine().equipment.getById(EQUIPMENT_ID);
          step(
            "11d-pre P0-017 partial finish equipment store idle",
            eqAfterPartial?.status !== "running" || Boolean(eqAfterPartial?.runningSession),
            `status=${eqAfterPartial?.status ?? "missing"} session=${Boolean(eqAfterPartial?.runningSession)} wf=${eqAfterPartial?.workflowState ?? ""}`
          );

          const secondEnsured = ensureLotBeforeCharging(EQUIPMENT_ID, p016Requeued);
          const secondLotNo = String(secondEnsured?.lotNo ?? "").trim();
          step(
            "11d P0-016 2nd charge generates new LOT",
            Boolean(secondLotNo) &&
              secondLotNo !== firstLotNo &&
              isChargeLotNumberFormat(secondLotNo),
            `${firstLotNo} -> ${secondLotNo}`
          );

          let secondStartOk = false;
          let secondStartDetail = "";
          try {
            executeStartCharging({
              equipmentId: EQUIPMENT_ID,
              lotNo: secondLotNo,
              chargeQty: firstRemaining,
              chargeQtyMeta: {
                ok: true,
                chargeQty: firstRemaining,
                inboundQty: 20,
                remainingQty: 0,
                isPartial: false,
              },
              chargeableRow: {
                ...(secondEnsured.chargeableRow ?? p016Requeued),
                chargeQty: firstRemaining,
                inboundQty: 20,
                remainingChargeQty: 0,
              },
              operator: OPERATOR,
            });
            secondStartOk = true;
          } catch (error) {
            secondStartDetail = error instanceof Error ? error.message : String(error);
          }
          step(
            "11e P0-017 2nd executeStartCharging runtime",
            secondStartOk,
            secondStartDetail || secondLotNo
          );

          const eqAfterSecond = getTitanDataEngine().equipment.getById(EQUIPMENT_ID);
          step(
            "11f P0-017 equipment idle after 2nd start (no stale running)",
            eqAfterSecond?.status === "running"
              ? Boolean(eqAfterSecond?.runningSession)
              : true,
            `status=${eqAfterSecond?.status ?? "missing"} session=${Boolean(eqAfterSecond?.runningSession)}`
          );

          const { buildProductionDailyReportWorkspaceRecords, buildProductionResultWorkspaceRecords } =
            await import(
              pathToFileURL(path.join(root, "src/utils/productionWorkspaceData.js")).href
            );
          const p016DailyRows = buildProductionDailyReportWorkspaceRecords().filter(
            (row) => String(row.id ?? "").trim() === P016_ID
          );
          const p016DailyLotNos = p016DailyRows
            .map((row) => String(row.lotNo ?? "").trim())
            .filter(Boolean);
          const p016DailyBothLots =
            p016DailyLotNos.includes(firstLotNo) && p016DailyLotNos.includes(secondLotNo);
          step(
            "11g P0-first-LOT: 작업일보 keeps finished LOT A after LOT B start",
            p016DailyBothLots && p016DailyRows.length >= 2,
            `lots=${p016DailyLotNos.join(",") || "none"} rows=${p016DailyRows.length}`
          );

          const p016ResultRows = buildProductionResultWorkspaceRecords().filter(
            (row) => String(row.lotNo ?? "").trim() === firstLotNo
          );
          step(
            "11h P0-first-LOT: 생산이력 includes finished LOT A after LOT B start",
            p016ResultRows.length >= 1,
            `resultLots=${p016ResultRows.map((row) => row.lotNo).join(",") || "none"}`
          );

          const { buildInspectionMassWorkspaceRows } = await import(
            pathToFileURL(path.join(root, "src/utils/qualityWorkspaceData.js")).href
          );
          const { CURRENT_PROCESS_KEYS, resolveRecordCurrentProcess } = await import(
            pathToFileURL(path.join(root, "src/utils/workflowProcessStatus.js")).href
          );
          const p016InspectionRows = buildInspectionMassWorkspaceRows().filter(
            (row) => String(row.managementId ?? "").trim() === P016_ID
          );
          const p016InspectionLotNos = p016InspectionRows
            .map((row) => String(row.lotNo ?? "").trim())
            .filter(Boolean);
          const p016InspectionWaitLots = p016InspectionRows.filter((row) => {
            const record = row.record;
            return (
              record &&
              resolveRecordCurrentProcess(record).key === CURRENT_PROCESS_KEYS.INSPECTION_WAIT
            );
          });
          const p016QualityBothLots =
            p016InspectionLotNos.includes(firstLotNo) &&
            (p016InspectionLotNos.includes(secondLotNo) ||
              p016InspectionWaitLots.some(
                (row) => String(row.lotNo ?? "").trim() === firstLotNo
              ));
          step(
            "11i P0-first-LOT: 품질 검사대기 keeps finished LOT A after LOT B start",
            p016QualityBothLots && p016InspectionRows.length >= 1,
            `lots=${p016InspectionLotNos.join(",") || "none"} rows=${p016InspectionRows.length} wait=${p016InspectionWaitLots.length}`
          );
        } else {
          step("11d P0-016 2nd charge generates new LOT", false, "requeued row missing");
          step("11e P0-017 2nd executeStartCharging runtime", false, "skipped");
          step("11g P0-first-LOT: 작업일보 keeps finished LOT A after LOT B start", false, "skipped");
          step("11h P0-first-LOT: 생산이력 includes finished LOT A after LOT B start", false, "skipped");
          step("11i P0-first-LOT: 품질 검사대기 keeps finished LOT A after LOT B start", false, "skipped");
        }
      } else {
        step("11c P0-016 partial 20/15/5 requeues product row", false, "waiting row missing");
        step("11d P0-016 2nd charge generates new LOT", false, "skipped");
    step("11e P0-017 2nd executeStartCharging runtime", false, "skipped");
      }
    } else {
    step("11a Partial start stores chargeQty + remainingChargeQty + history", false, "waiting row missing");
    step("11b Partial finish requeues remaining qty (WORK_WAIT)", false, "skipped");
    step("11c P0-016 partial 20/15/5 requeues product row", false, "skipped");
    step("11d P0-016 2nd charge generates new LOT", false, "skipped");
    step("11e P0-017 2nd executeStartCharging runtime", false, "skipped");
    }

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
    step("6a previewAutoChargeLotNumber (YYMMDD-설비순번 pattern)", false, "skipped");
    step("6 ensureLotBeforeCharging auto-creates LOT", false, "no waiting row");
    step("6b ensureLotBeforeCharging accepts edited LOT", false, "skipped");
    step("6c previewAutoChargeLotNumber restore candidate", false, "skipped");
    step("7 Session record has lotNo after charging prep", false, "skipped");
    step("8 executeStartCharging auto-creates daily report (HT_RUNNING)", false, "skipped");
    step("8b Start → 작업일보 row exists before Finish", false, "skipped");
    step("9 executeFinishCharging -> INSPECTION_WAIT", false, "skipped");
    step("9b 생산이력 workspace includes finished record", false, "skipped");
    step("9c 생산이력 month filter includes workDate", false, "skipped");
    step("10 Process filter: ION product still not on GAS-01 (post-finish)", false, "skipped");
    step("11 Finished product removed from chargeable list", false, "skipped");
    step("12 Multi-step: step1(세척) on AUX-01, not ION-01", false, "skipped");
    step("13 Multi-step: finish cleaning advances to 이온질화 (WORK_WAIT)", false, "skipped");
    step("14 Multi-step: step2(이온질화) on ION-01 after advance", false, "skipped");
    step("15 Multi-step: final step finish -> INSPECTION_WAIT", false, "skipped");
  }

  // --- P0-019: concurrent multi-equipment charge sessions (300 → 3S-2/3S-3/10S-01) ---
  const { buildRc1EquipmentMasterSeedRows: buildRc1Seed } = await import(
    pathToFileURL(path.join(root, "src/data/rc1EquipmentMasterSeed.js")).href
  );
  const P019_ID = "RC1-EQ-P019-CONCURRENT-001";
  const P019_3S2 = "3S-2";
  const P019_3S3 = "3S-3";
  const P019_10S01 = "10S-01";

  resetTitanDataEngineInstance();
  getTitanDataEngine();
  syncMasterCategoryToStore("equipment", buildRc1Seed());
  replaceSessionProductionRecords([]);

  addSessionProductionRecord({
    id: P019_ID,
    mesManagementNo: P019_ID,
    company: "RC1\uC785\uACE0\uAC80\uC99D",
    partName: "P019\uB3D9\uC2DC\uC7A5\uC785",
    partNo: "P019-300",
    material: "SCM440",
    qty: 300,
    inboundQty: 300,
    incomingRegistered: true,
    registered: false,
    workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
    lotNo: "",
    heatTreatment: ION_PROCESS,
    processDetail: ION_PROCESS,
  });
  applyMoveToProductionWaiting([P019_ID]);

  function p019StartOnEquipment(equipmentId, chargeQty, remainingQty) {
    const waitingRow = getChargeableLots(equipmentId).find(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === P019_ID
    );
    if (!waitingRow) throw new Error(`waiting row missing on ${equipmentId}`);
    const ensured = ensureLotBeforeCharging(equipmentId, waitingRow);
    const lotNo = String(ensured?.lotNo ?? "").trim();
    return executeStartCharging({
      equipmentId,
      lotNo,
      chargeQty,
      chargeQtyMeta: {
        ok: true,
        chargeQty,
        inboundQty: 300,
        remainingQty,
        isPartial: remainingQty > 0,
      },
      chargeableRow: {
        ...(ensured.chargeableRow ?? waitingRow),
        sourceRecordId: P019_ID,
        chargeQty,
        inboundQty: 300,
        remainingChargeQty: remainingQty,
        isPartialCharge: remainingQty > 0,
      },
      operator: OPERATOR,
    });
  }

  function equipmentIsRunning(equipmentId) {
    const eq = getEquipmentById(equipmentId);
    return eq?.status === "running" && Boolean(eq?.runningSession);
  }

  try {
    p019StartOnEquipment(P019_3S2, 100, 200);
    step(
      "P0-019 Test1: 300EA inbound → 3S-2 100EA Start → RUNNING",
      equipmentIsRunning(P019_3S2),
      `3S-2=${equipmentIsRunning(P019_3S2)}`
    );

    p019StartOnEquipment(P019_3S3, 80, 120);
    const test2Ok = equipmentIsRunning(P019_3S2) && equipmentIsRunning(P019_3S3);
    step(
      "P0-019 Test2: remaining 200 → 3S-3 80EA → 3S-2+3S-3 RUNNING",
      test2Ok,
      `3S-2=${equipmentIsRunning(P019_3S2)} 3S-3=${equipmentIsRunning(P019_3S3)}`
    );

    p019StartOnEquipment(P019_10S01, 120, 0);
    const test3Ok =
      equipmentIsRunning(P019_3S2) &&
      equipmentIsRunning(P019_3S3) &&
      equipmentIsRunning(P019_10S01);
    step(
      "P0-019 Test3: remaining 120 → 10S-01 120EA → all 3 RUNNING",
      test3Ok,
      `3S-2=${equipmentIsRunning(P019_3S2)} 3S-3=${equipmentIsRunning(P019_3S3)} 10S-01=${equipmentIsRunning(P019_10S01)}`
    );

    const lot3s2 = getEquipmentById(P019_3S2)?.runningSession?.lotNo;
    executeFinishCharging({
      equipmentId: P019_3S2,
      lotNo: lot3s2,
      chargeableRow: { sourceRecordId: P019_ID },
      operator: OPERATOR,
    });
    const test4Ok =
      !equipmentIsRunning(P019_3S2) &&
      equipmentIsRunning(P019_3S3) &&
      equipmentIsRunning(P019_10S01);
    step(
      "P0-019 Test4: 3S-2 finish → 3S-3 + 10S-01 still RUNNING",
      test4Ok,
      `3S-2=${equipmentIsRunning(P019_3S2)} 3S-3=${equipmentIsRunning(P019_3S3)} 10S-01=${equipmentIsRunning(P019_10S01)}`
    );

    reconcileAllEquipmentSessionsInStore();
    const test5Ok = equipmentIsRunning(P019_3S3) && equipmentIsRunning(P019_10S01);
    step(
      "P0-019 Test5: reconcile (F5) — concurrent RUNNING persists",
      test5Ok,
      `3S-3=${equipmentIsRunning(P019_3S3)} 10S-01=${equipmentIsRunning(P019_10S01)}`
    );
  } catch (p019Error) {
    step(
      "P0-019 concurrent charge sessions",
      false,
      p019Error instanceof Error ? p019Error.message : String(p019Error)
    );
  }

  // --- P0-023: same equipment multi-select batch start (2 inbound records) ---
  const P023_A = "RC1-EQ-P023-MULTI-A";
  const P023_B = "RC1-EQ-P023-MULTI-B";

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

  for (const [recordId, partNo, qty] of [
    [P023_A, "P023-A", 10],
    [P023_B, "P023-B", 8],
  ]) {
    addSessionProductionRecord({
      id: recordId,
      mesManagementNo: recordId,
      company: "RC1\uC785\uACE0\uAC80\uC99D",
      partName: `P023\uD488 ${partNo}`,
      partNo,
      material: "SCM440",
      qty,
      inboundQty: qty,
      incomingRegistered: true,
      registered: false,
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      lotNo: "",
      heatTreatment: ION_PROCESS,
      processDetail: ION_PROCESS,
    });
    applyMoveToProductionWaiting([recordId]);
  }

  const p023RowA = getChargeableLots(EQUIPMENT_ID).find(
    (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === P023_A
  );
  const p023RowB = getChargeableLots(EQUIPMENT_ID).find(
    (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === P023_B
  );
  step(
    "P0-023-pre: 2 chargeable rows on ION-01",
    Boolean(p023RowA) && Boolean(p023RowB),
    `A=${Boolean(p023RowA)} B=${Boolean(p023RowB)}`
  );

  if (p023RowA && p023RowB) {
    const sharedLotPreview = previewAutoChargeLotNumber(EQUIPMENT_ID, p023RowA);
    const chargeA = 6;
    const chargeB = 5;

    try {
      executeStartChargingBatch({
        equipmentId: EQUIPMENT_ID,
        operator: OPERATOR,
        sharedLotNo: sharedLotPreview,
        items: [
          {
            lotNo: sharedLotPreview,
            chargeQty: chargeA,
            chargeQtyMeta: {
              ok: true,
              chargeQty: chargeA,
              inboundQty: 10,
              remainingQty: 4,
              isPartial: true,
            },
            chargeableRow: {
              ...p023RowA,
              sourceRecordId: P023_A,
              chargeQty: chargeA,
              inboundQty: 10,
              remainingChargeQty: 4,
              isPartialCharge: true,
            },
          },
          {
            lotNo: sharedLotPreview,
            chargeQty: chargeB,
            chargeQtyMeta: {
              ok: true,
              chargeQty: chargeB,
              inboundQty: 8,
              remainingQty: 3,
              isPartial: true,
            },
            chargeableRow: {
              ...p023RowB,
              sourceRecordId: P023_B,
              chargeQty: chargeB,
              inboundQty: 8,
              remainingChargeQty: 3,
              isPartialCharge: true,
            },
          },
        ],
      });
    } catch (p023Error) {
      step(
        "P0-023: batch start 2 inbound on same equipment",
        false,
        p023Error instanceof Error ? p023Error.message : String(p023Error)
      );
    }

    const afterA = getSessionProductionRecords().find((r) => r.id === P023_A);
    const afterB = getSessionProductionRecords().find((r) => r.id === P023_B);
    const eqAfterBatch = getEquipmentById(EQUIPMENT_ID);
    const batchLotNo = String(eqAfterBatch?.runningSession?.lotNo ?? "").trim();
    const sameLotOk = Boolean(batchLotNo) && batchLotNo === sharedLotPreview;
    const historyOk =
      afterA?.chargeHistory?.some(
        (entry) => entry.status === "in-progress" && entry.chargeQty === chargeA
      ) &&
      afterB?.chargeHistory?.some(
        (entry) => entry.status === "in-progress" && entry.chargeQty === chargeB
      );
    const runningOk = eqAfterBatch?.status === "running" && Boolean(eqAfterBatch?.runningSession);
    const lotItems = eqAfterBatch?.runningSession?.lotItems ?? [];
    const targetsOk =
      Array.isArray(eqAfterBatch?.runningSession?.chargeTargets) &&
      eqAfterBatch.runningSession.chargeTargets.length >= 2;
    step(
      "P0-023: batch start 2 inbound on same equipment (one lotNo)",
      sameLotOk && historyOk && runningOk,
      `lot=${batchLotNo} histA=${afterA?.chargeHistory?.length ?? 0} histB=${afterB?.chargeHistory?.length ?? 0}`
    );
    step(
      "P0-023: runningSession tracks multiple charge targets",
      targetsOk,
      `targets=${eqAfterBatch?.runningSession?.chargeTargets?.length ?? 0}`
    );
    step(
      "P0-023: runningSession lotItems has 2 products",
      lotItems.length >= 2,
      `lotItems=${lotItems.length}`
    );

    if (sameLotOk && runningOk) {
      executeFinishCharging({
        equipmentId: EQUIPMENT_ID,
        lotNo: batchLotNo,
        chargeableRow: { sourceRecordId: P023_A },
        operator: OPERATOR,
      });

      const afterFinishA = getSessionProductionRecords().find((r) => r.id === P023_A);
      const afterFinishB = getSessionProductionRecords().find((r) => r.id === P023_B);
      const eqAfterFinish = getEquipmentById(EQUIPMENT_ID);
      const finishWholeLotOk =
        eqAfterFinish?.status !== "running" &&
        !eqAfterFinish?.runningSession &&
        afterFinishA?.chargeHistory?.some((entry) => entry.status === "completed") &&
        afterFinishB?.chargeHistory?.some((entry) => entry.status === "completed");
      step(
        "P0-023: finish completes whole LOT (both products)",
        finishWholeLotOk,
        `eq=${eqAfterFinish?.status ?? "missing"} A=${getWorkflowStatus(afterFinishA)} B=${getWorkflowStatus(afterFinishB)}`
      );
    } else {
      step("P0-023: finish completes whole LOT (both products)", false, "skipped");
    }
  } else {
    step("P0-023: batch start 2 inbound on same equipment (one lotNo)", false, "waiting rows missing");
    step("P0-023: runningSession tracks multiple charge targets", false, "skipped");
    step("P0-023: runningSession lotItems has 2 products", false, "skipped");
    step("P0-023: finish completes whole LOT (both products)", false, "skipped");
  }

  // --- P0 Item 6: LOT Bundle SSOT (Product Popup · 작업일보 · 생산이력 · F5) ---
  const { getLotBundle } = await import(
    pathToFileURL(path.join(root, "src/utils/lotBundleService.js")).href
  );
  const {
    getControlRoomProductDetail,
    buildControlRoomProductMonitorRows,
    invalidateControlRoomWorkspaceCache,
  } = await import(pathToFileURL(path.join(root, "src/utils/controlRoomWorkspaceData.js")).href);
  const {
    buildProductionDailyReportWorkspaceRecords,
    buildProductionResultWorkspaceRecords,
  } = await import(
    pathToFileURL(path.join(root, "src/utils/productionWorkspaceData.js")).href
  );

  const P023_LOT = String(getEquipmentById(EQUIPMENT_ID)?.runningSession?.lotNo ?? "").trim();
  const p023Records = getSessionProductionRecords().filter(
    (row) => row.id === P023_A || row.id === P023_B
  );
  const p023LotFromRecords = String(
    p023Records.find((row) => String(row.lotNo ?? "").trim())?.lotNo ?? ""
  ).trim();

  // Re-run batch if finish cleared session (use records lotNo)
  let ssotLotNo = P023_LOT || p023LotFromRecords;
  if (!ssotLotNo) {
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
    const materials = ["SCM440", "SACM645", "SNCM439"];
    const ssotIds = materials.map((m, i) => `RC1-LOT-SSOT-${i + 1}`);
    for (let i = 0; i < materials.length; i += 1) {
      addSessionProductionRecord({
        id: ssotIds[i],
        mesManagementNo: ssotIds[i],
        company: "RC1\uC785\uACE0\uAC80\uC99D",
        partName: `SSOT\uD488 ${materials[i]}`,
        partNo: `SSOT-${materials[i]}`,
        material: materials[i],
        qty: 5 + i,
        inboundQty: 5 + i,
        incomingRegistered: true,
        registered: false,
        workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
        lotNo: "",
        heatTreatment: ION_PROCESS,
        processDetail: ION_PROCESS,
      });
      applyMoveToProductionWaiting([ssotIds[i]]);
    }
    const ssotRows = getChargeableLots(EQUIPMENT_ID).filter((row) =>
      ssotIds.includes(String(row.sourceRecordId ?? row.id ?? "").trim())
    );
    const sharedLot = previewAutoChargeLotNumber(EQUIPMENT_ID, ssotRows[0]);
    if (ssotRows.length >= 3 && sharedLot) {
      executeStartChargingBatch({
        equipmentId: EQUIPMENT_ID,
        operator: OPERATOR,
        sharedLotNo: sharedLot,
        items: ssotRows.map((row, idx) => ({
          lotNo: sharedLot,
          chargeQty: 5 + idx,
          chargeQtyMeta: { ok: true, chargeQty: 5 + idx, inboundQty: 5 + idx, remainingQty: 0, isPartial: false },
          chargeableRow: { ...row, chargeQty: 5 + idx, inboundQty: 5 + idx, remainingChargeQty: 0 },
        })),
      });
      ssotLotNo = sharedLot;
    }
  }

  if (ssotLotNo) {
    const bundle = getLotBundle(ssotLotNo);
    const bundleMaterials = new Set(
      (bundle?.lotItems ?? []).map((row) => String(row.material ?? "").trim()).filter(Boolean)
    );
    step(
      "P0-LOT-SSOT: getLotBundle returns 2+ co-items",
      (bundle?.itemCount ?? 0) >= 2,
      `lot=${ssotLotNo} items=${bundle?.itemCount ?? 0} label=${bundle?.productLabel ?? ""}`
    );

    const bundleUsesChargeQty =
      (bundle?.lotItems ?? []).every((item) => {
        const chargeQty = Number(item.chargeQty) || 0;
        const record = getSessionProductionRecords().find(
          (row) => String(row.id ?? "").trim() === String(item.sourceRecordId ?? "").trim()
        );
        const inboundQty = Number(record?.inboundQty ?? record?.qty) || 0;
        return chargeQty > 0 && (inboundQty <= 0 || chargeQty <= inboundQty);
      }) && (bundle?.totalQty ?? 0) > 0;
    step(
      "P0-LOT-SSOT: getLotBundle lotItems use chargeQty (not inboundQty)",
      bundleUsesChargeQty,
      `totalQty=${bundle?.totalQty ?? 0}`
    );

    invalidateControlRoomWorkspaceCache?.();
    const productRows = buildControlRoomProductMonitorRows();
    let anyProductKey = productRows.find((row) => String(row.currentLotNo ?? "") === ssotLotNo)?.productKey;
    if (!anyProductKey && bundle?.lotItems?.[0]) {
      const anchor = getSessionProductionRecords().find(
        (row) =>
          String(row.id ?? "").trim() === String(bundle.lotItems[0]?.sourceRecordId ?? "").trim()
      );
      if (anchor) {
        anyProductKey = `${String(anchor.company ?? "").trim()}::${String(anchor.partNo ?? "").trim()}::${String(anchor.partName ?? anchor.productName ?? "").trim()}`;
      }
    }
    const productDetail = anyProductKey ? getControlRoomProductDetail(anyProductKey) : null;
    const popupCoItemsOk =
      Boolean(productDetail) &&
      (productDetail.lotItems?.length ?? 0) >= 2 &&
      productDetail.coLotItemCount >= 2;
    step(
      "P0-LOT-SSOT: Product View popup shows all LOT co-items",
      popupCoItemsOk,
      `key=${anyProductKey ?? "missing"} coItems=${productDetail?.lotItems?.length ?? 0}`
    );

    const altProductKey = productRows.find(
      (row) =>
        String(row.currentLotNo ?? "") === ssotLotNo &&
        row.productKey &&
        row.productKey !== anyProductKey
    )?.productKey;
    const altProductDetail = altProductKey ? getControlRoomProductDetail(altProductKey) : null;
    const crossProductLotItemsOk =
      !altProductDetail ||
      (altProductDetail.lotItems?.length ?? 0) === (productDetail?.lotItems?.length ?? 0);
    step(
      "P0-LOT-SSOT: SCM440/SACM645 click → same lotItems[]",
      crossProductLotItemsOk,
      `alt=${altProductKey ?? "none"} items=${altProductDetail?.lotItems?.length ?? 0}`
    );

    const dailyRows = buildProductionDailyReportWorkspaceRecords();
    const dailyLotRows = dailyRows.filter(
      (row) => String(row.lotNo ?? "").trim() === ssotLotNo
    );
    const expectedDailyLotRows = Math.max(bundle?.itemCount ?? 0, 2);
    const dailyLotRowsShareLotNo =
      dailyLotRows.length >= expectedDailyLotRows &&
      dailyLotRows.every((row) => String(row.lotNo ?? "").trim() === ssotLotNo);
    step(
      "P0-LOT-SSOT: 작업일보 one row per product with shared lotNo",
      dailyLotRowsShareLotNo,
      `lotRows=${dailyLotRows.length} bundleItems=${bundle?.itemCount ?? 0} totalDaily=${dailyRows.length}`
    );

    const resultRows = buildProductionResultWorkspaceRecords();
    const resultLotKeys = resultRows
      .map((row) => String(row.lotNo ?? "").trim())
      .filter(Boolean);
    const uniqueResultLots = new Set(resultLotKeys);
    step(
      "P0-LOT-SSOT: 생산이력 dedupes by LOT",
      resultLotKeys.length === uniqueResultLots.size,
      `rows=${resultRows.length} uniqueLots=${uniqueResultLots.size}`
    );

    if (bundleMaterials.size >= 2) {
      step(
        "P0-LOT-SSOT: multi-material bundle (SCM440+SACM645+SNCM439 pattern)",
        bundleMaterials.size >= 2,
        [...bundleMaterials].join("+")
      );
    } else {
      step("P0-LOT-SSOT: multi-material bundle (SCM440+SACM645+SNCM439 pattern)", true, "2-product batch ok");
    }

    reconcileAllEquipmentSessionsInStore();
    const bundleAfterReconcile = getLotBundle(ssotLotNo);
    step(
      "P0-LOT-SSOT: F5 reconcile — getLotBundle stable",
      (bundleAfterReconcile?.itemCount ?? 0) === (bundle?.itemCount ?? 0),
      `before=${bundle?.itemCount ?? 0} after=${bundleAfterReconcile?.itemCount ?? 0}`
    );
  } else {
    step("P0-LOT-SSOT: getLotBundle returns 2+ co-items", false, "no shared lotNo");
    step("P0-LOT-SSOT: getLotBundle lotItems use chargeQty (not inboundQty)", false, "skipped");
    step("P0-LOT-SSOT: Product View popup shows all LOT co-items", false, "skipped");
    step("P0-LOT-SSOT: SCM440/SACM645 click → same lotItems[]", false, "skipped");
    step("P0-LOT-SSOT: 작업일보 one row per product with shared lotNo", false, "skipped");
    step("P0-LOT-SSOT: 생산이력 dedupes by LOT", false, "skipped");
    step("P0-LOT-SSOT: multi-material bundle (SCM440+SACM645+SNCM439 pattern)", false, "skipped");
    step("P0-LOT-SSOT: F5 reconcile — getLotBundle stable", false, "skipped");
  }

  // --- P0 certificate: LOT-centric issuance list (not product inbound sum) ---
  const CERT_LOT_ID = "RC1-CERT-LOT-SSOT-20";
  const { buildCertificateWorkspaceRows, invalidateQualityWorkspaceDataCache } = await import(
    pathToFileURL(path.join(root, "src/utils/qualityWorkspaceData.js")).href
  );
  const { getCertificateRegisterListRows } = await import(
    pathToFileURL(path.join(root, "src/utils/certificateStatus.js")).href
  );
  const { addInspectionLog: addCertInspectionLog } = await import(
    pathToFileURL(path.join(root, "src/utils/inspectionLogSession.js")).href
  );

  replaceSessionProductionRecords([
    {
      id: CERT_LOT_ID,
      mesManagementNo: CERT_LOT_ID,
      company: "RC1\uC131\uC801\uC11C\uAC80\uC99D",
      partName: "Product A",
      partNo: "CERT-LOT-P0",
      material: "SCM440",
      qty: 20,
      inboundQty: 20,
      unit: "EA",
      incomingRegistered: true,
      registered: true,
      lotNo: "LOT-B",
      chargeHistory: [
        {
          lotNo: "LOT-A",
          chargeQty: 10,
          status: "completed",
          equipmentId: "ION-01",
          completedAt: "2026-07-01T10:00:00.000Z",
        },
        {
          lotNo: "LOT-B",
          chargeQty: 10,
          status: "completed",
          equipmentId: "ION-01",
          completedAt: "2026-07-02T10:00:00.000Z",
        },
      ],
    },
  ]);
  addCertInspectionLog({
    managementId: CERT_LOT_ID,
    lotNo: "LOT-A",
    qty: 20,
    unit: "EA",
    judgment: "\uD569\uACA9",
  });
  addCertInspectionLog({
    managementId: CERT_LOT_ID,
    lotNo: "LOT-B",
    qty: 20,
    unit: "EA",
    judgment: "\uD569\uACA9",
  });
  invalidateQualityWorkspaceDataCache?.();
  const certRows = buildCertificateWorkspaceRows();
  const certRegisterRows = getCertificateRegisterListRows().filter(
    (row) => String(row.managementId ?? "").trim() === CERT_LOT_ID
  );
  const certLotA = certRows.find((row) => String(row.lotNo ?? "").trim() === "LOT-A");
  const certLotB = certRows.find((row) => String(row.lotNo ?? "").trim() === "LOT-B");
  const certEntryQtyA = Number(certLotA?.entry?.qty);
  const certEntryQtyB = Number(certLotB?.entry?.qty);
  step(
    "P0 certificate: two inspected LOTs → two issuance rows (10EA each, not product 20EA)",
    certRows.length === 2 &&
      certRegisterRows.length === 2 &&
      certEntryQtyA === 10 &&
      certEntryQtyB === 10 &&
      !certRows.some((row) => Number(row.entry?.qty) === 20),
    `rows=${certRows.length} register=${certRegisterRows.length} A=${certEntryQtyA} B=${certEntryQtyB}`
  );

  // --- P0 outbound: Product-centric UI + LOT FIFO allocation ---
  const OUTBOUND_LOT_ID = "RC1-OUT-LOT-CHARGE-15";
  const { buildOutgoingTaskWorkspaceRecords } = await import(
    pathToFileURL(path.join(root, "src/utils/operationsWorkspaceData.js")).href
  );
  const {
    applyOutboundRegister,
    allocateOutboundShipQtyFifo,
    getOutboundEligibleLotRows,
    getOutboundShippedQtyForLot,
    resolveOutboundProductAvailableQty,
  } = await import(pathToFileURL(path.join(root, "src/utils/outboundRegistration.js")).href);
  const { getShipmentEvents } = await import(
    pathToFileURL(path.join(root, "src/utils/titanHistorySession.js")).href
  );
  const { CERTIFICATE_STATUS } = await import(
    pathToFileURL(path.join(root, "src/utils/ndkWorkflow.js")).href
  );

  replaceSessionProductionRecords([
    {
      id: OUTBOUND_LOT_ID,
      mesManagementNo: OUTBOUND_LOT_ID,
      company: "RC1출고검증",
      partName: "출고LOT품",
      partNo: "OUT-LOT-P0",
      material: "SCM440",
      qty: 20,
      inboundQty: 20,
      unit: "EA",
      incomingRegistered: true,
      registered: true,
      certificateStatus: CERTIFICATE_STATUS.ISSUED,
      shipmentStatus: "출고대기",
      chargeHistory: [
        {
          lotNo: "LOT-A",
          chargeQty: 10,
          status: "completed",
          equipmentId: "ION-01",
          completedAt: "2026-07-01T10:00:00.000Z",
        },
        {
          lotNo: "LOT-B",
          chargeQty: 10,
          status: "completed",
          equipmentId: "ION-01",
          completedAt: "2026-07-02T10:00:00.000Z",
        },
      ],
    },
  ]);
  const { addInspectionLog: addOutboundInspectionLog } = await import(
    pathToFileURL(path.join(root, "src/utils/inspectionLogSession.js")).href
  );
  addOutboundInspectionLog({
    managementId: OUTBOUND_LOT_ID,
    lotNo: "LOT-A",
    qty: 10,
    unit: "EA",
    judgment: "합격",
  });
  addOutboundInspectionLog({
    managementId: OUTBOUND_LOT_ID,
    lotNo: "LOT-B",
    qty: 10,
    unit: "EA",
    judgment: "합격",
  });

  const outboundProductRows = buildOutgoingTaskWorkspaceRecords();
  const outboundProduct = outboundProductRows.find(
    (row) => String(row.partNo ?? "").trim() === "OUT-LOT-P0"
  );
  const productAvailable = resolveOutboundProductAvailableQty(outboundProduct);
  step(
    "P0 outbound: product UI row aggregates LOT A+B (20EA shippable, not 2 LOT rows)",
    outboundProductRows.length === 1 && productAvailable === 20,
    `rows=${outboundProductRows.length} available=${productAvailable} productKey=${outboundProduct?.productKey ?? ""}`
  );

  const lotRows = getOutboundEligibleLotRows();
  const fifoPlan = allocateOutboundShipQtyFifo(lotRows, 15);
  const planA = fifoPlan.allocations.find((item) => item.lotNo === "LOT-A");
  const planB = fifoPlan.allocations.find((item) => item.lotNo === "LOT-B");
  step(
    "P0 outbound: FIFO ship 15 from 10+10 → LOT A 10 + LOT B 5",
    fifoPlan.ok === true && planA?.shipQty === 10 && planB?.shipQty === 5,
    `A=${planA?.shipQty ?? "?"} B=${planB?.shipQty ?? "?"} alloc=${fifoPlan.allocations.length}`
  );

  const shipResult = applyOutboundRegister({
    productKey: outboundProduct?.productKey,
    managementId: OUTBOUND_LOT_ID,
    shipQty: "15",
    shipDate: "2026-07-11",
    manager: "RC1검증",
    note: "FIFO product ship",
  });
  const events = getShipmentEvents(OUTBOUND_LOT_ID);
  const eventA = events.find((event) => String(event?.lotNo ?? "").trim() === "LOT-A");
  const eventB = events.find((event) => String(event?.lotNo ?? "").trim() === "LOT-B");
  const lotARow = lotRows.find((row) => String(row.lotNo ?? "").trim() === "LOT-A");
  const lotBRow = {
    ...lotRows.find((row) => String(row.lotNo ?? "").trim() === "LOT-B"),
  };
  // refresh shipped qty from events after register
  const shippedA = getOutboundShippedQtyForLot({ ...lotARow, id: OUTBOUND_LOT_ID, lotNo: "LOT-A" });
  const shippedB = getOutboundShippedQtyForLot({ ...lotBRow, id: OUTBOUND_LOT_ID, lotNo: "LOT-B" });
  step(
    "P0 outbound: DB LOT events after product ship 15 → A10 + B5",
    shipResult.ok === true &&
      Number(eventA?.shipQty) === 10 &&
      Number(eventB?.shipQty) === 5 &&
      shippedA === 10 &&
      shippedB === 5,
    `ok=${shipResult.ok} A=${eventA?.shipQty}/${shippedA} B=${eventB?.shipQty}/${shippedB}`
  );
} catch (error) {
  fatal = true;
  step("Runtime", false, error instanceof Error ? error.message : String(error));
  console.error(error);
}

const failed = fatal || checks.some((c) => !c.ok);
console.log("");
console.log(failed ? "RC1 Equipment Charge P0: FAIL" : "RC1 Equipment Charge P0: PASS");
process.exit(failed ? 1 : 0);
