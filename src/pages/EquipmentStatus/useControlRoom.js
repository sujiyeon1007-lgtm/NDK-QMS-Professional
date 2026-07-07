import { useCallback, useEffect, useMemo, useState } from "react";

import { subscribeWorkflowDataRefresh } from "../../utils/titanWorkflowRefresh";
import {
  CONTROL_ROOM_DEFAULT_VIEW,
  buildControlRoomKpiCards,
  buildControlRoomLotMonitorRows,
  buildControlRoomProductMonitorRows,
  getControlRoomEquipmentDetail,
  getControlRoomEquipmentGroups,
  getControlRoomEquipmentSummary,
  getControlRoomLotDetail,
  getControlRoomLotTimelineSummary,
  getControlRoomLots,
  getControlRoomProductDetail,
  getControlRoomRecords,
  refreshControlRoomCache,
} from "../../utils/controlRoomWorkspaceData";

/** URL ?view= 값을 Control Room View id로 정규화 (Sprint 3E 진입 경로) */
function resolveInitialView(view) {
  const key = String(view ?? "").trim().toLowerCase();
  return ["equipment", "lot", "product"].includes(key) ? key : CONTROL_ROOM_DEFAULT_VIEW;
}

/**
 * Control Room Workspace Hook
 * TitanDataEngine → ControlRoomWorkspaceData → useControlRoom → View
 * @param {{ initialView?: string }} [options]
 */
export function useControlRoom({ initialView } = {}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState(() => resolveInitialView(initialView));

  const bumpRefresh = useCallback(() => {
    refreshControlRoomCache();
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    return subscribeWorkflowDataRefresh(() => {
      bumpRefresh();
    });
  }, [bumpRefresh]);

  const records = useMemo(() => getControlRoomRecords(), [refreshKey]);
  const lots = useMemo(() => getControlRoomLots(), [refreshKey]);
  const kpiCards = useMemo(() => buildControlRoomKpiCards(records), [records]);

  const equipmentGroups = useMemo(() => getControlRoomEquipmentGroups(), [refreshKey]);
  const equipmentSummary = useMemo(() => getControlRoomEquipmentSummary(), [refreshKey]);
  const lotMonitorRows = useMemo(() => buildControlRoomLotMonitorRows(lots, records), [lots, records]);
  const productMonitorRows = useMemo(
    () => buildControlRoomProductMonitorRows(records, lots),
    [records, lots]
  );

  const getEquipmentDetail = useCallback(
    (equipmentId) => getControlRoomEquipmentDetail(equipmentId),
    [refreshKey]
  );

  const getLotDetail = useCallback(
    (lotNo) => getControlRoomLotDetail(lotNo),
    [refreshKey]
  );

  const getLotTimeline = useCallback(
    (lotNo, limit) => getControlRoomLotTimelineSummary(lotNo, limit),
    [refreshKey]
  );

  const getProductDetail = useCallback(
    (productKey) => getControlRoomProductDetail(productKey),
    [refreshKey]
  );

  return {
    refreshKey,
    activeView,
    setActiveView,
    records,
    lots,
    kpiCards,
    equipmentGroups,
    equipmentSummary,
    lotMonitorRows,
    productMonitorRows,
    getEquipmentDetail,
    getLotDetail,
    getLotTimeline,
    getProductDetail,
    refresh: bumpRefresh,
  };
}

export default useControlRoom;
