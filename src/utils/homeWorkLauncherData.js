import { getEquipmentList, getEquipmentSummary } from "./equipmentWorkflowService";
import { getTitanDataEngine } from "../foundation/data";
import { buildHomeTopKpiCounts, getHomeScreenData } from "./homeDashboardData";
import { getHomeWorkspaceRecords } from "./homeWorkspaceData";

function readDashboardKpi() {
  try {
    return getTitanDataEngine().dashboard.getKpi();
  } catch {
    return null;
  }
}

function readLotSummary() {
  try {
    const lots = getTitanDataEngine().lot.list();
    return {
      inProgress: lots.filter((row) => {
        const status = String(row.status ?? "");
        return status.includes("열처리") || status.includes("운전") || status.includes("생산");
      }).length,
      inspectionWait: lots.filter((row) => String(row.status ?? "").includes("검사")).length,
      chargeReady: lots.filter((row) => String(row.status ?? "").includes("장입")).length,
    };
  } catch {
    return null;
  }
}

/**
 * HOME 업무 바로가기 카드 — DashboardStore · LotStore · EquipmentStore 집계
 * @param {object[]} [records]
 */
export function buildHomeWorkLauncherMetrics(records = getHomeWorkspaceRecords()) {
  const dashboardKpi = readDashboardKpi();
  const lotSummary = readLotSummary();
  const equipmentSummary = dashboardKpi
    ? {
        running: dashboardKpi.equipmentRunning ?? 0,
        ready: dashboardKpi.equipmentReady ?? 0,
        maintenance: dashboardKpi.equipmentMaintenance ?? 0,
      }
    : getEquipmentSummary();

  const chargeableLotCount = lotSummary?.chargeReady ??
    getEquipmentList()
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
      inProgress: lotSummary?.inProgress ?? baseRecords.length,
      inspectionWait: lotSummary?.inspectionWait ?? counts.INSPECTION_WAIT ?? 0,
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
      heatRunning: dashboardKpi?.equipmentRunning ?? counts.HT_RUNNING ?? 0,
      inspectionWait: lotSummary?.inspectionWait ?? counts.INSPECTION_WAIT ?? 0,
    },
    accountingClerk: {
      activeFeatures: 6,
      comingSoon: 7,
    },
    accounting: {
      referenceViews: 4,
      comingSoon: 6,
    },
    qrEngine: {
      registry: 0,
      scanRoutes: 2,
    },
  };
}
