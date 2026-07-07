/**
 * Project TITAN V2.0 — HOME Workspace Data (Engine SSOT)
 *
 * Blueprint ① HOME — Session Legacy → TitanDataEngine 전환
 * HOME는 데이터를 보관하지 않음 · Engine 조회만
 */

import { getTitanDataEngine } from "../foundation/data";
import { getSessionProductionRecords } from "./productionRecords";

/** DashboardStore 캐시 갱신 — Workflow 이벤트 · 수동 새로고침 */
export function refreshHomeWorkspaceCache() {
  try {
    return getTitanDataEngine().dashboard.refreshCache();
  } catch {
    return null;
  }
}

/** productionStore row → HOME KPI/Launcher 호환 record */
function mapProductionStoreRowToRecord(row) {
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  const id = String(payload.id ?? payload.mesManagementNo ?? row.productionId ?? "").trim();
  if (!id) return null;
  return { ...payload, id };
}

/**
 * HOME Workspace — TitanDataEngine productionStore 기반 records
 * @returns {object[]}
 */
export function getHomeWorkspaceRecords() {
  try {
    refreshHomeWorkspaceCache();
    const rows = getTitanDataEngine().production.list();
    const records = rows.map(mapProductionStoreRowToRecord).filter(Boolean);
    if (records.length > 0) return records;
  } catch {
    // legacy fallback below
  }
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
