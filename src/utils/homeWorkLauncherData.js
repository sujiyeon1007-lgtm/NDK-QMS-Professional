import { getEquipmentList, getEquipmentSummary } from "./equipmentWorkflowService";
import { buildHomeTopKpiCounts, getHomeScreenData } from "./homeDashboardData";
import { getSessionProductionRecords } from "./productionRecords";

/**
 * HOME 업무 바로가기 카드 — 현재 상태 요약 (KPI · List와 동일 records)
 * @param {object[]} [records]
 */
export function buildHomeWorkLauncherMetrics(records = getSessionProductionRecords()) {
  const equipmentSummary = getEquipmentSummary();
  const chargeableLotCount = getEquipmentList()
    .filter((item) => item.status === "ready")
    .reduce((sum, item) => sum + item.chargeableLots.length, 0);

  const { counts, baseRecords } = getHomeScreenData(records);
  const topKpi = buildHomeTopKpiCounts(records);

  return {
    inbound: {
      todayIncoming: topKpi.todayIncoming,
      inboundWait: counts.RECEIVED ?? 0,
    },
    equipmentStatus: {
      running: equipmentSummary.running,
      ready: equipmentSummary.ready,
      maintenance: equipmentSummary.maintenance,
    },
    productStatus: {
      inProgress: baseRecords.length,
      inspectionWait: counts.INSPECTION_WAIT ?? 0,
      shipWait: counts.SHIP_WAIT ?? 0,
    },
    qrCharging: {
      chargeableLots: chargeableLotCount,
      runningEquipment: equipmentSummary.running,
    },
    outbound: {
      todayShipment: topKpi.todayShipment,
      shipWait: counts.SHIP_WAIT ?? 0,
    },
    statistics: {
      heatRunning: counts.HT_RUNNING ?? 0,
      inspectionWait: counts.INSPECTION_WAIT ?? 0,
    },
  };
}
