/**
 * HOME Dashboard - RC1 Runtime metrics (Workflow + Master SSOT)
 * No hardcoded / demo snapshot counts.
 */

import { initMasterDataStoresFromSessionStorage, getMasterStoreSummary } from "../foundation/data/master/masterDataSync";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { getHomeScreenData, buildHomeTopKpiCounts } from "./homeDashboardData";

export function refreshHomeDashboardMasterSources() {
  try {
    initMasterDataStoresFromSessionStorage();
  } catch {
    /* keep last in-memory snapshot */
  }
}

export function buildHomeDashboardRuntimeMetrics() {
  const records = getSessionProductionRecords();
  const { counts } = getHomeScreenData(records);
  const master = getMasterStoreSummary();

  return {
    inboundRegistered: records.filter((row) => isIncomingRegistered(row)).length,
    productionInProgress: counts.HT_RUNNING ?? 0,
    shipWait: counts.SHIP_WAIT ?? 0,
    companies: master.companies ?? 0,
    products: master.products ?? 0,
    materials: master.materials ?? 0,
    heatTreatment: master.heatTreatment ?? 0,
    equipment: master.equipment ?? 0,
    workers: master.workers ?? 0,
    records,
    counts,
    topKpi: buildHomeTopKpiCounts(records),
  };
}
