/**
 * Project TITAN V1.7 — Timeline LOT · 설비 기준 조회
 */

import { getTitanDataEngine } from "../foundation/data";
import { normalizeProductionLotKey } from "./productionDailyReportPrintData";

/**
 * @param {import("../foundation/data/titanDataModels").TimelineRecord} row
 */
export function normalizeTimelineRow(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title ?? "—",
    target: row.target ?? "",
    time: row.time ?? "—",
    user: row.user ?? "",
    detail: row.detail ?? "",
    lotNo: row.lotNo ?? "",
    equipmentId: row.equipmentId ?? "",
  };
}

/**
 * @param {string} [lotNo]
 * @param {string} [equipmentId]
 */
export function getTimelineEntries({ lotNo, equipmentId, limit = 50 } = {}) {
  const lotKey = normalizeProductionLotKey(lotNo);
  const equipmentKey = String(equipmentId ?? "").trim();

  const rows = getTitanDataEngine().timeline.list();

  const filtered = rows.filter((row) => {
    const rowLot = normalizeProductionLotKey(row.lotNo ?? row.target);
    const target = String(row.target ?? "");
    const rowEquipment = String(row.equipmentId ?? "").trim();

    if (lotKey) {
      if (rowLot && rowLot.includes(lotKey)) return true;
      if (target.toUpperCase().includes(lotKey)) return true;
    }

    if (equipmentKey) {
      if (rowEquipment === equipmentKey) return true;
      if (target.includes(equipmentKey)) return true;
    }

    return !lotKey && !equipmentKey;
  });

  const source = lotKey || equipmentKey ? filtered : rows;
  return source.slice(0, limit).map(normalizeTimelineRow);
}

/**
 * @param {string} lotNo
 */
export function getTimelineByLotNo(lotNo, limit = 50) {
  return getTimelineEntries({ lotNo, limit });
}

/**
 * @param {string} equipmentId
 */
export function getTimelineByEquipmentId(equipmentId, limit = 50) {
  return getTimelineEntries({ equipmentId, limit });
}

/**
 * @param {import("../foundation/data/titanDataModels").TimelineRecord[]} rows
 */
export function mapTimelineToDisplayItems(rows = []) {
  return rows.map((row) => ({
    time: row.time ?? "—",
    label: row.title ?? "—",
    detail: row.detail ?? row.user ?? "",
    lotNo: row.lotNo ?? "",
    equipmentId: row.equipmentId ?? "",
  }));
}
