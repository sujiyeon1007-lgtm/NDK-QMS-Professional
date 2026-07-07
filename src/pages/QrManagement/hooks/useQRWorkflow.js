import { useCallback, useMemo, useState } from "react";

import {
  getActiveChargingSession,
  getAvailableLots,
  getDefaultEquipmentId,
  getEquipmentList,
  getEquipmentSummary,
  resolveEquipmentChargingButtons,
} from "../services/qrWorkflowService";

/**
 * 설비 장입관리 UI Foundation — 로컬 선택 상태만 (Workflow 미연결)
 */
export function useQRWorkflow() {
  const equipmentList = useMemo(() => getEquipmentList(), []);
  const equipmentSummary = useMemo(() => getEquipmentSummary(), []);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(() => getDefaultEquipmentId());
  const [activeLotId, setActiveLotId] = useState(null);

  const selectedEquipment = useMemo(
    () => equipmentList.find((item) => item.id === selectedEquipmentId) ?? null,
    [equipmentList, selectedEquipmentId]
  );

  const chargingButtons = useMemo(
    () => resolveEquipmentChargingButtons(selectedEquipment?.status),
    [selectedEquipment?.status]
  );

  const availableLots = useMemo(
    () => getAvailableLots(selectedEquipmentId),
    [selectedEquipmentId]
  );

  const activeSession = useMemo(
    () => getActiveChargingSession(selectedEquipmentId),
    [selectedEquipmentId]
  );

  const selectEquipment = useCallback((equipmentId) => {
    setSelectedEquipmentId(equipmentId);
    setActiveLotId(null);
  }, []);

  const selectLot = useCallback((lotId) => {
    setActiveLotId(lotId);
  }, []);

  return {
    equipmentList,
    equipmentSummary,
    selectedEquipmentId,
    selectedEquipment,
    chargingButtons,
    availableLots,
    activeLotId,
    activeSession,
    selectEquipment,
    selectLot,
  };
}
