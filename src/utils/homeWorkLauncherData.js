import { getEquipmentList, getEquipmentSummary } from "./equipmentWorkflowService";
import { getTitanDataEngine } from "../foundation/data";
import { getMasterStoreSummary } from "../foundation/data/master/masterDataSync";
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

function readMasterSummary() {
  try {
    return getMasterStoreSummary();
  } catch {
    return {
      companies: 0,
      products: 0,
      materials: 0,
      heatTreatment: 0,
      equipment: 0,
      workers: 0,
    };
  }
}

/**
 * HOME 업무 바로가기 카드 — DashboardStore · LotStore · EquipmentStore 집계
 * @param {object[]} [records]
 */
export function buildHomeWorkLauncherMetrics(records = getHomeWorkspaceRecords()) {
  const dashboardKpi = readDashboardKpi();
  const lotSummary = readLotSummary();
  const masterSummary = readMasterSummary();
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
  const productionDone = baseRecords.filter((row) =>
    String(row.completionStatus ?? row.workflowStatus ?? "").includes("생산완료")
  ).length;

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
      statementViews: baseRecords.filter((row) => row.shipmentDate).length,
    },
    accounting: {
      referenceViews: 4,
      statementViews: baseRecords.filter((row) => row.shipmentDate).length,
    },
    qrEngine: {
      registry: 0,
      scanRoutes: 2,
    },
    operations: {
      todayIncoming: topKpi.todayIncoming,
      inboundWait: counts.RECEIVED ?? 0,
      shipWait: counts.SHIP_WAIT ?? 0,
    },
    production: {
      runningLots: lotSummary?.inProgress ?? counts.HT_RUNNING ?? 0,
      heatWait: counts.HT_WAIT ?? 0,
      productionDone,
    },
    quality: {
      inspectionWait: lotSummary?.inspectionWait ?? counts.INSPECTION_WAIT ?? 0,
      certWait: counts.CERT_WAIT ?? 0,
      nonConformance: 0,
    },
    equipment: {
      running: equipmentSummary.running,
      maintenance: equipmentSummary.maintenance,
      ready: equipmentSummary.ready,
    },
    masterData: {
      companies: masterSummary.companies ?? 0,
      products: masterSummary.products ?? 0,
      materials: masterSummary.materials ?? 0,
      processes: masterSummary.heatTreatment ?? 0,
      equipment: masterSummary.equipment ?? 0,
      workers: masterSummary.workers ?? 0,
    },
    management: {
      statements: topKpi.todayShipment,
      clerkViews: 6,
      accountingViews: 4,
    },
  };
}
