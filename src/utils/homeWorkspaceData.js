/**
 * Project TITAN V2.0 — HOME Workspace Data (Engine SSOT)
 *
 * Blueprint ① HOME — Session Legacy → TitanDataEngine 전환
 * HOME는 데이터를 보관하지 않음 · Engine 조회만
 */

import { getTitanDataEngine } from "../foundation/data";
import { getSessionProductionRecords } from "./productionRecords";
import { refreshHomeDashboardMasterSources } from "./homeDashboardRuntimeMetrics";

/** DashboardStore 캐시 갱신 — Workflow 이벤트 · 수동 새로고침 */
export function refreshHomeWorkspaceCache() {
  refreshHomeDashboardMasterSources();
  try {
    return getTitanDataEngine().dashboard.refreshCache();
  } catch {
    return null;
  }
}

/**
 * HOME Workspace — operational Session SSOT (입고·생산·출고 CRUD)
 * RC1: demo-seeded productionStore is not used for HOME KPI.
 * @returns {object[]}
 */
export function getHomeWorkspaceRecords() {
  return getSessionProductionRecords();
}

/** HOME Engine 연동 스냅샷 — QA · 디버그 */
export function getHomeWorkspaceSnapshot() {
  try {
    const engine = getTitanDataEngine();
    refreshHomeWorkspaceCache();
    return {
      source: "engine",
      kpi: engine.dashboard.getKpi(),
      progress: engine.dashboard.getProgressOverview(),
      recentTimeline: engine.dashboard.getRecentWork(7),
      recordCount: getHomeWorkspaceRecords().length,
      pipeline: engine.getPipelineStatus(),
    };
  } catch (error) {
    return {
      source: "legacy",
      recordCount: getSessionProductionRecords().length,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
