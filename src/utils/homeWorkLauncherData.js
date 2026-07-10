import { getEquipmentList, getEquipmentSummary } from "./equipmentWorkflowService";
import { getTitanDataEngine } from "../foundation/data";
import { buildHomeDashboardRuntimeMetrics } from "./homeDashboardRuntimeMetrics";
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
 * HOME 업무 바로가기 카드 — Runtime Workflow + Master 집계 (RC1)
 * @param {object[]} [records]
 */
export function buildHomeWorkLauncherMetrics(records = getHomeWorkspaceRecords()) {
  const runtime = buildHomeDashboardRuntimeMetrics();
  const workflowRecords = runtime.records.length > 0 ? runtime.records : records;
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

  const { counts } = runtime;
  const topKpi = runtime.topKpi;
  const productionDone = workflowRecords.filter((row) =>
    String(row.completionStatus ?? row.workflowStatus ?? "").includes("생산완료")
  ).length;

  return {
    inbound: {
      todayIncoming: topKpi.todayIncoming,
      inboundWait: runtime.inboundRegistered,
    },
    equipmentStatus: {
      running: equipmentSummary.running,
      ready: equipmentSummary.ready,
      maintenance: equipmentSummary.maintenance,
    },
    productStatus: {
      inProgress: runtime.productionInProgress,
      inspectionWait: counts.INSPECTION_WAIT ?? 0,
      shipWait: runtime.shipWait,
    },
    qrCharging: {
      chargeableLots: chargeableLotCount,
      runningEquipment: equipmentSummary.running,
    },
    outbound: {
      todayShipment: topKpi.todayShipment,
      shipWait: runtime.shipWait,
    },
    statistics: {
      heatRunning: runtime.productionInProgress,
      inspectionWait: counts.INSPECTION_WAIT ?? 0,
    },
    accountingClerk: {
      activeFeatures: 0,
      statementViews: workflowRecords.filter((row) => row.shipmentDate).length,
    },
    accounting: {
      referenceViews: 0,
      statementViews: workflowRecords.filter((row) => row.shipmentDate).length,
    },
    qrEngine: {
      registry: 0,
      scanRoutes: 0,
    },
    operations: {
      todayIncoming: topKpi.todayIncoming,
      inboundWait: runtime.inboundRegistered,
      shipWait: runtime.shipWait,
    },
    production: {
      runningLots: runtime.productionInProgress,
      heatWait: counts.HT_WAIT ?? 0,
      productionDone,
    },
    quality: {
      inspectionWait: counts.INSPECTION_WAIT ?? 0,
      certWait: counts.CERT_WAIT ?? 0,
      nonConformance: 0,
    },
    equipment: {
      running: equipmentSummary.running,
      maintenance: equipmentSummary.maintenance,
      ready: equipmentSummary.ready,
    },
    masterData: {
      companies: runtime.companies,
      products: runtime.products,
      materials: runtime.materials,
      processes: runtime.heatTreatment,
      equipment: runtime.equipment,
      workers: runtime.workers,
    },
    management: {
      statements: topKpi.todayShipment,
      clerkViews: 0,
      accountingViews: 0,
    },
  };
}
