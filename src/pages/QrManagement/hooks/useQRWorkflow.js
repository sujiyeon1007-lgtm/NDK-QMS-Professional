import { useCallback, useEffect, useMemo, useState } from "react";

import { getTitanDataEngine } from "../../../foundation/data";
import {
  executeFinishCharging,
  executeStartCharging,
} from "../../../utils/titanWorkflowIntegration";
import { subscribeWorkflowDataRefresh } from "../../../utils/titanWorkflowRefresh";
import { ensureLotBeforeCharging, previewAutoChargeLotNumber } from "../../../utils/equipmentWorkflowService";
import { resolveChargeQtyInput } from "../../../utils/equipmentChargingQty";
import { getWorkflowCompletionDialog } from "../../../config/workflowNavigation";
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

export function useQRWorkflow(initialEquipmentId) {
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
  const [draftLotNo, setDraftLotNo] = useState("");
  const [autoLotNo, setAutoLotNo] = useState("");
  const [lotInputMode, setLotInputMode] = useState("auto");
  const [chargeQtyEnabled, setChargeQtyEnabled] = useState(false);
  const [draftChargeQty, setDraftChargeQty] = useState("");

  useEffect(() => {
    if (initialEquipmentId) {
      setSelectedEquipmentId(initialEquipmentId);
      setActiveLotId(null);
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

  const chargingButtons = useMemo(() => {
    const status = selectedEquipment?.status === "ready" ? "idle" : selectedEquipment?.status;
    const hasChargeable = availableLots.length > 0;
    const resolvedLotRow = resolveChargingLotRow(
      selectedEquipmentId,
      activeLotId,
      selectedLotRow
    );

    if (status === "running") {
      return resolveEquipmentChargingButtons("running");
    }
    if (status === "maintenance") {
      return resolveEquipmentChargingButtons("maintenance");
    }

    if (hasChargeable) {
      const lotReady = Boolean(resolvedLotRow || activeSession?.lotNo);
      return {
        showStart: true,
        showComplete: false,
        startEnabled: lotReady,
        completeEnabled: false,
      };
    }

    return resolveEquipmentChargingButtons("idle");
  }, [
    activeLotId,
    availableLots.length,
    selectedEquipment?.status,
    selectedEquipmentId,
    selectedLotRow,
    activeSession?.lotNo,
  ]);

  const selectEquipment = useCallback((equipmentId) => {
    setSelectedEquipmentId(equipmentId);
    setActiveLotId(null);
    setDraftLotNo("");
    setAutoLotNo("");
    setWorkflowError("");
  }, []);

  const selectLot = useCallback(
    (lotId) => {
      setActiveLotId(lotId);
      setWorkflowError("");
      setChargeQtyEnabled(false);
      setDraftChargeQty("");
      const row = getAvailableLots(selectedEquipmentId).find((item) => item.id === lotId);
      if (row && (!row.lotNo?.trim() || row.needsLotCreation)) {
        const auto = previewAutoChargeLotNumber(selectedEquipmentId, row);
        setAutoLotNo(auto);
        setDraftLotNo(lotInputMode === "manual" ? draftLotNo || auto : auto);
      } else {
        setAutoLotNo("");
        setDraftLotNo(row?.lotNo?.trim() ?? "");
      }
    },
    [selectedEquipmentId, refreshKey, lotInputMode, draftLotNo]
  );

  useEffect(() => {
    if (!selectedEquipmentId || activeSession?.lotNo) return;
    const lots = getAvailableLots(selectedEquipmentId);
    if (lots.length !== 1) return;
    if (activeLotId && lots.some((row) => row.id === activeLotId)) return;
    selectLot(lots[0].id);
  }, [activeLotId, activeSession?.lotNo, refreshKey, selectLot, selectedEquipmentId]);

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
    let lotRow = resolveChargingLotRow(selectedEquipmentId, activeLotId, selectedLotRow);
    let lotNo = String(draftLotNo ?? lotRow?.lotNo ?? activeSession?.lotNo ?? "").trim();
    if (!selectedEquipmentId) {
      setWorkflowError("설비를 선택하세요.");
      return;
    }
    const needsLotPrep =
      lotRow &&
      (lotRow.needsLotCreation ||
        lotRow.source === "production-waiting" ||
        sessionRecordNeedsLotCreation(lotRow) ||
        !lotNo ||
        !String(lotRow.lotNo ?? "").trim());
    if (needsLotPrep) {
      lotRow = { ...lotRow, lotNo: lotNo || undefined };
      const ensured = ensureLotBeforeCharging(selectedEquipmentId, lotRow);
      if (!ensured.ok) {
        setWorkflowError(ensured.message);
        return;
      }
      lotNo = String(ensured.lotNo ?? "").trim();
      lotRow = ensured.chargeableRow ?? { ...lotRow, lotNo };
    }
    if (!lotNo) {
      setWorkflowError("장입할 LOT를 선택하세요.");
      return;
    }

    const mobileChargeQty = String(actionOptions.workConditions?.chargeQty ?? "").trim();
    const effectiveChargeQtyInput =
      String(draftChargeQty ?? "").trim() || mobileChargeQty;
    const qtyResolved = resolveChargeQtyInput(lotRow, effectiveChargeQtyInput);
    if (!qtyResolved.ok) {
      setWorkflowError(qtyResolved.message);
      return;
    }

    const chargeableRowWithQty = {
      ...(lotRow ?? {}),
      chargeQty: qtyResolved.chargeQty,
      inboundQty: qtyResolved.inboundQty,
      qty: qtyResolved.chargeQty,
      unit: qtyResolved.unit ?? lotRow?.unit ?? "EA",
      remainingChargeQty: qtyResolved.remainingQty,
      isPartialCharge: qtyResolved.isPartial,
    };

    try {
      executeStartCharging({
        ...actionOptions,
        equipmentId: selectedEquipmentId,
        lotNo,
        chargeQty: qtyResolved.chargeQty,
        chargeQtyMeta: qtyResolved,
        chargeableRow: chargeableRowWithQty,
        managementId:
          lotRow?.managementId ?? lotRow?.sourceRecordId ?? lotRow?.id ?? undefined,
      });
      setActiveLotId(null);
      setChargeQtyEnabled(false);
      setDraftChargeQty("");
      setWorkflowNextStep(getWorkflowCompletionDialog("productionStart"));
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : String(error));
    }
  }, [activeLotId, activeSession?.lotNo, chargeQtyEnabled, draftChargeQty, draftLotNo, normalizeActionOptions, selectedEquipmentId, selectedLotRow]);

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
      } catch (error) {
        setWorkflowError(error instanceof Error ? error.message : String(error));
      }
    },
    [activeSession?.lotNo, selectedEquipmentId, selectedLotRow]
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
    refreshKey,
  };
}
