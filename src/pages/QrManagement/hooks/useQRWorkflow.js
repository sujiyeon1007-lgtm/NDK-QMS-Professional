import { useCallback, useEffect, useMemo, useState } from "react";

import {
  executeFinishCharging,
  executeStartCharging,
} from "../../../utils/titanWorkflowIntegration";
import { subscribeWorkflowDataRefresh } from "../../../utils/titanWorkflowRefresh";
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
export function useQRWorkflow(initialEquipmentId) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [workflowError, setWorkflowError] = useState("");

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
    const base = resolveEquipmentChargingButtons(selectedEquipment?.status);
    if (base.showStart && !selectedLotRow && !activeSession?.lotNo) {
      return { ...base, startEnabled: false };
    }
    return base;
  }, [selectedEquipment?.status, selectedLotRow, activeSession?.lotNo]);

  const selectEquipment = useCallback((equipmentId) => {
    setSelectedEquipmentId(equipmentId);
    setActiveLotId(null);
    setWorkflowError("");
  }, []);

  const selectLot = useCallback((lotId) => {
    setActiveLotId(lotId);
    setWorkflowError("");
  }, []);

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
    const lotRow = selectedLotRow;
    const lotNo = lotRow?.lotNo ?? activeSession?.lotNo ?? "";
    if (!selectedEquipmentId) {
      setWorkflowError("설비를 선택하세요.");
      return;
    }
    if (!lotNo) {
      setWorkflowError("장입할 LOT를 선택하세요.");
      return;
    }

    try {
      executeStartCharging({
        ...actionOptions,
        equipmentId: selectedEquipmentId,
        lotNo,
        chargeableRow: lotRow ?? undefined,
      });
      setActiveLotId(null);
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : String(error));
    }
  }, [activeSession?.lotNo, normalizeActionOptions, selectedEquipmentId, selectedLotRow]);

  const handleFinishCharging = useCallback((options) => {
    setWorkflowError("");
    const actionOptions = normalizeActionOptions(options);
    if (!selectedEquipmentId) {
      setWorkflowError("설비를 선택하세요.");
      return;
    }

    const lotNo = activeSession?.lotNo ?? selectedLotRow?.lotNo ?? "";
    try {
      executeFinishCharging({
        ...actionOptions,
        equipmentId: selectedEquipmentId,
        lotNo,
        chargeableRow: selectedLotRow ?? undefined,
      });
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : String(error));
    }
  }, [activeSession?.lotNo, normalizeActionOptions, selectedEquipmentId, selectedLotRow]);

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
    refreshKey,
  };
}
