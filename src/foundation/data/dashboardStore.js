/**
 * Project TITAN V1.5 — dashboardStore (SSOT)
 * HOME Dashboard — KPI · 최근 작업 · 진행 현황 (Store 집계)
 */

import { TITAN_DATA_STORAGE_KEYS } from "./titanDataStorageKeys";
import { createJsonObjectStore } from "./storeFactory";
import equipmentStore from "./equipmentStore";
import lotStore from "./lotStore";
import productionStore from "./productionStore";
import timelineStore from "./timelineStore";

function buildComputedSnapshot() {
  const equipmentSummary = equipmentStore.getSummary();
  const lots = lotStore.list();
  const productions = productionStore.list();
  const timeline = timelineStore.list();

  const runningLots = lots.filter((row) => Number(row.progress) > 0).length;
  const chargeReadyLots = lots.filter((row) => String(row.status ?? "").includes("장입")).length;

  return {
    generatedAt: new Date().toISOString(),
    kpi: {
      equipmentTotal: equipmentSummary.total,
      equipmentRunning: equipmentSummary.running,
      equipmentReady: equipmentSummary.ready,
      equipmentMaintenance: equipmentSummary.maintenance,
      lotTotal: lots.length,
      lotRunning: runningLots,
      lotChargeReady: chargeReadyLots,
      productionTotal: productions.length,
    },
    recentWork: timeline.slice(0, 10).map((row) => ({ ...row })),
    progress: {
      incoming: productions.filter((row) => row.payload?.incomingRegistered).length,
      production: productions.filter((row) => row.payload?.registered).length,
      inspection: productions.filter((row) => row.payload?.inspectionStatus).length,
      shipment: productions.filter((row) => row.payload?.shipmentStatus === "출고완료").length,
    },
  };
}

const objectStore = createJsonObjectStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.dashboard,
  getSeed: buildComputedSnapshot,
});

export const dashboardStore = {
  storageKey: objectStore.storageKey,

  /** Store 집계 기반 실시간 스냅샷 (캐시 저장 없음) */
  getSnapshot() {
    return buildComputedSnapshot();
  },

  /** SessionStorage 캐시 갱신 */
  refreshCache() {
    return objectStore.replace(buildComputedSnapshot());
  },

  readCached() {
    return objectStore.read();
  },

  seedIfEmpty() {
    return objectStore.seedIfEmpty();
  },

  clear() {
    objectStore.clear();
  },

  getKpi() {
    return buildComputedSnapshot().kpi;
  },

  getRecentWork(limit = 10) {
    return buildComputedSnapshot().recentWork.slice(0, limit);
  },

  getProgressOverview() {
    return buildComputedSnapshot().progress;
  },
};

export default dashboardStore;
