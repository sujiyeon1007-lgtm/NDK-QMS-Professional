import { useCallback, useEffect, useMemo, useState } from "react";



import { getTitanDataEngine } from "../../../foundation/data";

import {

  executeFinishCharging,

  executeStartCharging,

  executeStartChargingBatch,

} from "../../../utils/titanWorkflowIntegration";

import { subscribeWorkflowDataRefresh } from "../../../utils/titanWorkflowRefresh";

import { ensureLotBeforeCharging, ensureSharedBatchLot, previewAutoChargeLotNumber } from "../../../utils/equipmentWorkflowService";

import { resolveChargeQtyInput, validateChargeSelections } from "../../../utils/equipmentChargingQty";

import { getRecordsForProductionLot } from "../../../utils/productionDailyReportPrintData";

import { getSessionProductionRecords } from "../../../utils/productionRecords";

import { shouldPromptProcessStepOnComplete } from "../../../utils/productProcessWorkflow";

import {

  getActiveChargingSession,

  getAvailableLots,

  getDefaultEquipmentId,

  getEquipmentList,

  getEquipmentSummary,

  resolveEquipmentChargingButtons,

} from "../services/qrWorkflowService";



/**

 * 설비 장입관리 — TitanWorkflowEngine 연동

 */



function resolveChargingLotRow(selectedEquipmentId, activeLotId, selectedLotRow) {

  if (selectedLotRow) return selectedLotRow;

  const lots = getAvailableLots(selectedEquipmentId);

  if (activeLotId) {

    const matched = lots.find((row) => row.id === activeLotId);

    if (matched) return matched;

  }

  return lots.length === 1 ? lots[0] : null;

}



function buildFinishChargeableRowFromRecord(record, lotNo = "") {

  if (!record) return null;

  const resolvedLotNo = String((lotNo || record.lotNo) ?? "").trim();

  return {

    id: record.id,

    sourceRecordId: record.id,

    managementId: String(record.mesManagementNo ?? record.id ?? "").trim(),

    lotNo: resolvedLotNo,

    partName: String(record.partName ?? record.productName ?? "").trim(),

    partNo: String(record.partNo ?? "").trim(),

    company: String(record.company ?? "").trim(),

    material: String(record.material ?? "").trim(),

    qty: record.qty,

    unit: record.unit ?? "EA",

  };

}



function resolveFinishChargeableRow(lotNo, selectedLotRow, equipmentId = "") {

  if (selectedLotRow) return selectedLotRow;



  const key = String(lotNo ?? "").trim();

  if (key) {

    const record = getRecordsForProductionLot(key, getSessionProductionRecords(), {

      registeredOnly: false,

    })[0];

    const fromLot = buildFinishChargeableRowFromRecord(record, key);

    if (fromLot) return fromLot;

  }



  const equipmentKey = String(equipmentId ?? "").trim();

  if (!equipmentKey) return null;



  const runningSession = getTitanDataEngine().equipment.getById(equipmentKey)?.runningSession;

  const productionWorkflowId = String(runningSession?.productionId ?? "").trim();

  if (!productionWorkflowId) return null;



  const record = getSessionProductionRecords().find(

    (row) => String(row.productionWorkflowId ?? "").trim() === productionWorkflowId

  );

  return buildFinishChargeableRowFromRecord(

    record,

    key || String(runningSession?.lotNo ?? "").trim()

  );

}



function resolveFinishChargingContext(equipmentId, lotNoHint, selectedLotRow) {

  const equipmentKey = String(equipmentId ?? "").trim();

  const engineEquipment = equipmentKey ? getTitanDataEngine().equipment.getById(equipmentKey) : null;

  const lotNo =

    String(lotNoHint ?? "").trim() ||

    String(engineEquipment?.runningSession?.lotNo ?? engineEquipment?.currentLot ?? "").trim();

  const chargeableRow = resolveFinishChargeableRow(lotNo, selectedLotRow, equipmentKey) ?? undefined;

  return { lotNo, chargeableRow };

}



function sessionRecordNeedsLotCreation(lotRow) {

  const sourceRecordId = String(lotRow?.sourceRecordId ?? lotRow?.id ?? "").trim();

  if (!sourceRecordId) return false;

  const sessionRecord = getSessionProductionRecords().find((row) => row.id === sourceRecordId);

  return Boolean(sessionRecord && !String(sessionRecord.lotNo ?? "").trim());

}



function resolvePrimaryChargingRecord(lotNo, chargeableRow) {

  const records = getSessionProductionRecords();

  const sourceRecordId = String(

    chargeableRow?.sourceRecordId ?? chargeableRow?.managementId ?? chargeableRow?.id ?? ""

  ).trim();



  if (sourceRecordId) {

    const bySource = records.find((row) => String(row.id ?? "").trim() === sourceRecordId);

    if (bySource) return bySource;

  }



  const byLot = getRecordsForProductionLot(lotNo, records, { registeredOnly: false });

  return byLot[0] ?? null;

}



function rowNeedsLotPrep(lotRow, lotNo = "") {

  return Boolean(

    lotRow &&

      (lotRow.needsLotCreation ||

        lotRow.source === "production-waiting" ||

        sessionRecordNeedsLotCreation(lotRow) ||

        !lotNo ||

        !String(lotRow.lotNo ?? "").trim())

  );

}



function prepareChargeItem({

  lotRow,

  equipmentId,

  draftLotNo = "",

  sharedLotNo = "",

  chargeQtyEnabled = false,

  draftChargeQty = "",

  chargeQtyByRowId = {},

  actionOptions = {},

}) {

  let workingRow = { ...lotRow };

  let lotNo = String(

    sharedLotNo ||

      (lotRow.id === workingRow.id && draftLotNo ? draftLotNo : workingRow?.lotNo ?? "")

  ).trim();



  if (rowNeedsLotPrep(workingRow, lotNo)) {

    workingRow = { ...workingRow, lotNo: lotNo || undefined };

    const ensured = ensureLotBeforeCharging(equipmentId, workingRow);

    if (!ensured.ok) {

      return { ok: false, message: ensured.message };

    }

    lotNo = String(ensured.lotNo ?? sharedLotNo ?? "").trim();

    workingRow = ensured.chargeableRow ?? { ...workingRow, lotNo };

  } else if (sharedLotNo) {

    lotNo = sharedLotNo;

    workingRow = { ...workingRow, lotNo: sharedLotNo };

  }



  if (!lotNo) {

    return { ok: false, message: "장입할 LOT를 선택하세요." };

  }



  const rowId = String(workingRow?.id ?? "").trim();

  const mobileChargeQty = String(actionOptions.workConditions?.chargeQty ?? "").trim();

  const perRowDraft = chargeQtyEnabled ? String(chargeQtyByRowId?.[rowId] ?? "").trim() : "";

  const effectiveChargeQtyInput =

    perRowDraft || (rowId && draftChargeQty && !chargeQtyByRowId[rowId] ? draftChargeQty : "") || mobileChargeQty;

  const qtyResolved = resolveChargeQtyInput(workingRow, effectiveChargeQtyInput);

  if (!qtyResolved.ok) {

    return { ok: false, message: qtyResolved.message };

  }



  const chargeableRowWithQty = {

    ...workingRow,

    chargeQty: qtyResolved.chargeQty,

    inboundQty: qtyResolved.inboundQty,

    qty: qtyResolved.chargeQty,

    unit: qtyResolved.unit ?? workingRow?.unit ?? "EA",

    remainingChargeQty: qtyResolved.remainingQty,

    isPartialCharge: qtyResolved.isPartial,

  };



  return {

    ok: true,

    lotNo,

    chargeQty: qtyResolved.chargeQty,

    chargeQtyMeta: qtyResolved,

    chargeableRow: chargeableRowWithQty,

    managementId:

      workingRow?.managementId ?? workingRow?.sourceRecordId ?? workingRow?.id ?? undefined,

  };

}



export function useQRWorkflow(initialEquipmentId, { onChargingFinished } = {}) {

  const [refreshKey, setRefreshKey] = useState(0);

  const [workflowError, setWorkflowError] = useState("");

  const [stepCompleteDialog, setStepCompleteDialog] = useState({

    open: false,

    record: null,

    lotNo: "",

    chargeableRow: null,

  });

  const [workflowNextStep, setWorkflowNextStep] = useState(null);



  useEffect(() => {

    return subscribeWorkflowDataRefresh(() => {

      setRefreshKey((value) => value + 1);

    });

  }, []);



  const equipmentList = useMemo(() => getEquipmentList(), [refreshKey]);

  const equipmentSummary = useMemo(() => getEquipmentSummary(), [refreshKey]);

  const [selectedEquipmentId, setSelectedEquipmentId] = useState(

    () => initialEquipmentId || getDefaultEquipmentId()

  );

  const [activeLotId, setActiveLotId] = useState(null);

  const [selectedChargeRowIds, setSelectedChargeRowIds] = useState([]);

  const [chargeQtyByRowId, setChargeQtyByRowId] = useState({});

  const [draftLotNo, setDraftLotNo] = useState("");

  const [autoLotNo, setAutoLotNo] = useState("");

  const [lotInputMode, setLotInputMode] = useState("auto");

  const [chargeQtyEnabled, setChargeQtyEnabled] = useState(false);

  const [draftChargeQty, setDraftChargeQty] = useState("");



  useEffect(() => {

    if (initialEquipmentId) {

      setSelectedEquipmentId(initialEquipmentId);

      setActiveLotId(null);

      setSelectedChargeRowIds([]);

      setChargeQtyByRowId({});

    }

  }, [initialEquipmentId]);



  const selectedEquipment = useMemo(

    () => equipmentList.find((item) => item.id === selectedEquipmentId) ?? null,

    [equipmentList, selectedEquipmentId]

  );



  const availableLots = useMemo(

    () => getAvailableLots(selectedEquipmentId),

    [selectedEquipmentId, refreshKey]

  );



  const activeSession = useMemo(

    () => getActiveChargingSession(selectedEquipmentId),

    [selectedEquipmentId, refreshKey]

  );



  const selectedLotRow = useMemo(

    () => availableLots.find((row) => row.id === activeLotId) ?? null,

    [availableLots, activeLotId]

  );



  const selectedChargeRows = useMemo(

    () => availableLots.filter((row) => selectedChargeRowIds.includes(row.id)),

    [availableLots, selectedChargeRowIds]

  );



  const totalChargeQty = useMemo(() => {

    const validation = validateChargeSelections(

      selectedChargeRows.length > 0

        ? selectedChargeRows

        : selectedLotRow

          ? [selectedLotRow]

          : [],

      chargeQtyByRowId,

      chargeQtyEnabled

    );

    return validation.totalChargeQty;

  }, [chargeQtyByRowId, chargeQtyEnabled, selectedChargeRows, selectedLotRow]);



  const chargingButtons = useMemo(() => {
    const status = selectedEquipment?.status === "ready" ? "idle" : selectedEquipment?.status;
    const resolvedLotRow = resolveChargingLotRow(
      selectedEquipmentId,
      activeLotId,
      selectedLotRow
    );
    const hasSelection =
      selectedChargeRowIds.length > 0 || Boolean(resolvedLotRow || activeLotId);

    if (status === "running") {
      return resolveEquipmentChargingButtons("running");
    }
    if (status === "maintenance") {
      return resolveEquipmentChargingButtons("maintenance");
    }

    if (availableLots.length > 0 || hasSelection) {
      return {
        showStart: true,
        showComplete: false,
        startEnabled: hasSelection,
        completeEnabled: false,
      };
    }

    return resolveEquipmentChargingButtons("idle");
  }, [
    activeLotId,
    availableLots.length,
    selectedChargeRowIds,
    selectedEquipment?.status,
    selectedEquipmentId,
    selectedLotRow,
  ]);



  const selectEquipment = useCallback((equipmentId) => {

    setSelectedEquipmentId(equipmentId);

    setActiveLotId(null);

    setSelectedChargeRowIds([]);

    setChargeQtyByRowId({});

    setDraftLotNo("");

    setAutoLotNo("");

    setWorkflowError("");

  }, []);



  const syncLotDraftForRow = useCallback(

    (row) => {

      if (!row) return;

      if (row.needsLotCreation || !row.lotNo?.trim()) {

        const auto = previewAutoChargeLotNumber(selectedEquipmentId, row);

        setAutoLotNo(auto);

        setDraftLotNo(lotInputMode === "manual" ? draftLotNo || auto : auto);

      } else {

        setAutoLotNo("");

        setDraftLotNo(row?.lotNo?.trim() ?? "");

      }

    },

    [draftLotNo, lotInputMode, selectedEquipmentId]

  );



  const selectLot = useCallback(

    (lotId) => {

      setActiveLotId(lotId);

      setWorkflowError("");

      const row = getAvailableLots(selectedEquipmentId).find((item) => item.id === lotId);

      syncLotDraftForRow(row);

    },

    [selectedEquipmentId, syncLotDraftForRow]

  );



  const toggleChargeRow = useCallback(

    (rowId) => {

      setWorkflowError("");

      setSelectedChargeRowIds((current) => {

        const next = current.includes(rowId)

          ? current.filter((id) => id !== rowId)

          : [...current, rowId];

        if (!current.includes(rowId)) {

          const row = getAvailableLots(selectedEquipmentId).find((item) => item.id === rowId);

          if (row) {

            setActiveLotId(rowId);

            syncLotDraftForRow(row);

          }

        }

        return next;

      });

    },

    [selectedEquipmentId, syncLotDraftForRow]

  );



  const toggleAllChargeRows = useCallback(() => {

    setWorkflowError("");

    const lots = getAvailableLots(selectedEquipmentId);

    setSelectedChargeRowIds((current) => {

      if (current.length === lots.length) return [];

      if (lots.length > 0) {

        const first = lots[0];

        setActiveLotId(first.id);

        syncLotDraftForRow(first);

      }

      return lots.map((row) => row.id);

    });

  }, [selectedEquipmentId, syncLotDraftForRow]);



  const setChargeQtyForRow = useCallback((rowId, value) => {

    setChargeQtyByRowId((current) => ({

      ...current,

      [rowId]: value,

    }));

  }, []);



  useEffect(() => {

    if (!selectedEquipmentId || activeSession?.lotNo) return;

    const lots = getAvailableLots(selectedEquipmentId);

    if (lots.length !== 1) return;

    if (activeLotId && lots.some((row) => row.id === activeLotId)) return;

    const onlyRow = lots[0];

    selectLot(onlyRow.id);

    setSelectedChargeRowIds([onlyRow.id]);

  }, [activeLotId, activeSession?.lotNo, refreshKey, selectLot, selectedEquipmentId]);



  useEffect(() => {

    setSelectedChargeRowIds((current) =>

      current.filter((rowId) => availableLots.some((row) => row.id === rowId))

    );

  }, [availableLots]);



  const setLotInputModeSafe = useCallback(

    (mode) => {

      setLotInputMode(mode);

      if (mode === "auto" && autoLotNo) {

        setDraftLotNo(autoLotNo);

      }

    },

    [autoLotNo]

  );



  const restoreAutoLotNo = useCallback(() => {

    if (!autoLotNo) return;

    setDraftLotNo(autoLotNo);

    setWorkflowError("");

  }, [autoLotNo]);



  const normalizeActionOptions = useCallback((value) => {

    if (!value || typeof value !== "object") return {};

    if (typeof value.preventDefault === "function" || typeof value.stopPropagation === "function") {

      return {};

    }

    return value;

  }, []);



  const handleStartCharging = useCallback((options) => {

    setWorkflowError("");

    const actionOptions = normalizeActionOptions(options);

    if (!selectedEquipmentId) {

      setWorkflowError("설비를 선택하세요.");

      return;

    }



    const rowsToCharge =

      selectedChargeRowIds.length > 0

        ? availableLots.filter((row) => selectedChargeRowIds.includes(row.id))

        : [resolveChargingLotRow(selectedEquipmentId, activeLotId, selectedLotRow)].filter(Boolean);



    if (rowsToCharge.length === 0) {

      setWorkflowError("장입할 제품을 선택하세요.");

      return;

    }



    const validation = validateChargeSelections(rowsToCharge, chargeQtyByRowId, chargeQtyEnabled);

    if (!validation.ok) {

      setWorkflowError(validation.message);

      return;

    }



    if (

      !actionOptions.chargeStartConfirmed &&

      !Object.prototype.hasOwnProperty.call(actionOptions, "workConditions")

    ) {

      setWorkflowError("담당자 · 운전조건을 확인한 후 열처리 시작을 누르세요.");

      return;

    }



    const items = [];

    let batchPrepared = null;

    const sharedLotNo =

      rowsToCharge.length > 1

        ? String(

            draftLotNo ||

              autoLotNo ||

              previewAutoChargeLotNumber(selectedEquipmentId, rowsToCharge[0]) ||

              ""

          ).trim()

        : "";



    if (rowsToCharge.length > 1) {

      batchPrepared = ensureSharedBatchLot(

        selectedEquipmentId,

        rowsToCharge,

        sharedLotNo || draftLotNo || autoLotNo

      );

      if (!batchPrepared.ok) {

        setWorkflowError(batchPrepared.message);

        return;

      }

    }



    for (const lotRow of rowsToCharge) {

      const prepared = prepareChargeItem({

        lotRow,

        equipmentId: selectedEquipmentId,

        draftLotNo: lotRow.id === activeLotId ? draftLotNo : "",

        sharedLotNo:

          rowsToCharge.length > 1

            ? String(batchPrepared?.lotNo ?? sharedLotNo).trim()

            : "",

        chargeQtyEnabled,

        draftChargeQty,

        chargeQtyByRowId,

        actionOptions,

      });

      if (!prepared.ok) {

        setWorkflowError(prepared.message);

        return;

      }

      items.push(prepared);

    }



    try {

      if (items.length === 1) {

        const item = items[0];

        executeStartCharging({

          ...actionOptions,

          equipmentId: selectedEquipmentId,

          lotNo: item.lotNo,

          chargeQty: item.chargeQty,

          chargeQtyMeta: item.chargeQtyMeta,

          chargeableRow: item.chargeableRow,

          managementId: item.managementId,

        });

      } else {

        executeStartChargingBatch({

          ...actionOptions,

          equipmentId: selectedEquipmentId,

          sharedLotNo: items[0]?.lotNo,

          items,

        });

      }



      setActiveLotId(null);

      setSelectedChargeRowIds([]);

      setChargeQtyByRowId({});

      setChargeQtyEnabled(false);

      setDraftChargeQty("");

    } catch (error) {

      setWorkflowError(error instanceof Error ? error.message : String(error));

    }

  }, [

    activeLotId,

    availableLots,

    chargeQtyByRowId,

    chargeQtyEnabled,

    draftChargeQty,

    draftLotNo,

    normalizeActionOptions,

    selectedChargeRowIds,

    selectedEquipmentId,

    selectedLotRow,

  ]);



  const executeFinish = useCallback(

    (finishOptions = {}) => {

      const resolved =

        finishOptions.lotNo || finishOptions.chargeableRow

          ? {

              lotNo: String(finishOptions.lotNo ?? "").trim(),

              chargeableRow: finishOptions.chargeableRow,

            }

          : resolveFinishChargingContext(

              selectedEquipmentId,

              String(activeSession?.lotNo ?? selectedLotRow?.lotNo ?? "").trim(),

              selectedLotRow

            );

      const lotNo =

        String(finishOptions.lotNo ?? "").trim() ||

        resolved.lotNo ||

        String(activeSession?.lotNo ?? selectedLotRow?.lotNo ?? "").trim();

      const chargeableRow = finishOptions.chargeableRow ?? resolved.chargeableRow;



      try {

        executeFinishCharging({

          ...finishOptions,

          equipmentId: selectedEquipmentId,

          lotNo,

          chargeableRow,

        });

        onChargingFinished?.();

      } catch (error) {

        setWorkflowError(error instanceof Error ? error.message : String(error));

      }

    },

    [activeSession?.lotNo, onChargingFinished, selectedEquipmentId, selectedLotRow]

  );



  const handleFinishCharging = useCallback(

    (options) => {

      setWorkflowError("");

      const actionOptions = normalizeActionOptions(options);

      if (!selectedEquipmentId) {

        setWorkflowError("설비를 선택하세요.");

        return;

      }



      const { lotNo, chargeableRow } = resolveFinishChargingContext(

        selectedEquipmentId,

        String(activeSession?.lotNo ?? selectedLotRow?.lotNo ?? "").trim(),

        selectedLotRow

      );



      if (!actionOptions.confirmed) {

        const record = resolvePrimaryChargingRecord(lotNo, chargeableRow);

        if (shouldPromptProcessStepOnComplete(record)) {

          setStepCompleteDialog({

            open: true,

            record,

            lotNo,

            chargeableRow,

          });

          return;

        }

      }



      executeFinish({

        ...actionOptions,

        lotNo,

        chargeableRow,

      });

    },

    [activeSession?.lotNo, executeFinish, normalizeActionOptions, selectedEquipmentId, selectedLotRow]

  );



  const closeStepCompleteDialog = useCallback(() => {

    setStepCompleteDialog({

      open: false,

      record: null,

      lotNo: "",

      chargeableRow: null,

    });

  }, []);



  const confirmStepComplete = useCallback(

    ({ targetStepIndex, note }) => {

      const dialog = stepCompleteDialog;

      closeStepCompleteDialog();



      const fromIndex = Number(dialog.record?.currentProcessStepIndex) || 0;

      const defaultNext = fromIndex + 1;

      const overrideIndex = targetStepIndex !== defaultNext ? targetStepIndex : undefined;



      executeFinish({

        confirmed: true,

        lotNo: dialog.lotNo,

        chargeableRow: dialog.chargeableRow,

        nextProcessStepIndex: overrideIndex,

        workflowChangeNote: note,

      });

    },

    [closeStepCompleteDialog, executeFinish, stepCompleteDialog]

  );



  return {

    equipmentList,

    equipmentSummary,

    selectedEquipmentId,

    selectedEquipment,

    chargingButtons,

    availableLots,

    activeLotId,

    activeSession,

    workflowError,

    selectEquipment,

    selectLot,

    handleStartCharging,

    handleFinishCharging,

    stepCompleteDialog,

    closeStepCompleteDialog,

    confirmStepComplete,

    workflowNextStep,

    setWorkflowNextStep,

    draftLotNo,

    autoLotNo,

    lotInputMode,

    setLotInputMode: setLotInputModeSafe,

    setDraftLotNo,

    restoreAutoLotNo,

    chargeQtyEnabled,

    setChargeQtyEnabled,

    draftChargeQty,

    setDraftChargeQty,

    selectedChargeRowIds,

    toggleChargeRow,

    toggleAllChargeRows,

    chargeQtyByRowId,

    setChargeQtyForRow,

    totalChargeQty,

    refreshKey,

  };

}

