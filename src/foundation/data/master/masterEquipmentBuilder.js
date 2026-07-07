/**
 * Project TITAN V1.6 — Master equipment → EquipmentStore records
 */

import {
  EQUIPMENT_CHARGEABLE_LOTS,
  EQUIPMENT_MAINTENANCE_IDS,
  EQUIPMENT_RUNNING_LOTS,
} from "../../../config/equipmentConfig";
import { masterRowToEquipmentRecord } from "./masterDataMappers";

/**
 * @param {Record<string, unknown>[]} masterRows
 * @param {Record<string, unknown>[]} [existingRecords]
 */
export function buildEquipmentRecordsFromMasterRows(masterRows = [], existingRecords = []) {
  const existingById = new Map(
    existingRecords.map((row) => [String(row.equipmentId ?? row.code ?? ""), row])
  );

  return masterRows
    .filter((row) => String(row.code ?? row.name ?? "").trim())
    .map((row) => {
      const code = String(row.code ?? row.name ?? "").trim();
      const existing = existingById.get(code) ?? null;
      const runningSession = EQUIPMENT_RUNNING_LOTS[code] ?? null;
      const chargeableLots = (EQUIPMENT_CHARGEABLE_LOTS[code] ?? []).map((item) => ({ ...item }));
      const maintenance = EQUIPMENT_MAINTENANCE_IDS.has(code) || row.active === false;

      let status = "idle";
      if (maintenance) status = "maintenance";
      else if (runningSession) status = "running";
      else if (chargeableLots.length > 0) status = "ready";

      return masterRowToEquipmentRecord(row, existing, {
        runningSession,
        chargeableLots,
        maintenance,
        status,
      });
    });
}
