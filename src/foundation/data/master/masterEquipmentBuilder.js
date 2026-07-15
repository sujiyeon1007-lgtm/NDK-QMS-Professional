/**
 * Project TITAN V1.6 — Master equipment → EquipmentStore records
 */

import { masterRowToEquipmentRecord } from "./masterDataMappers";

function normalizeRunStatus(value) {
  return String(value ?? "").trim().toLowerCase();
}

function hasChargedLot(chargeableLots = []) {
  return chargeableLots.some((row) => String(row?.lotNo ?? "").trim());
}

function computeMasterSeedRunStatus(row, runningSession, chargeableLots) {
  const runStatus = normalizeRunStatus(row?.runStatus ?? row?.masterRunStatus);
  if (row?.breakdown === true || row?.breakdownMode === true || runStatus === "breakdown") {
    return "breakdown";
  }
  if (row?.maintenanceMode === true || runStatus === "maintenance") {
    return "maintenance";
  }
  if (runningSession) return "running";
  if (hasChargedLot(chargeableLots)) return "ready";
  return "idle";
}

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
      const runningSession =
        existing && "runningSession" in existing
          ? existing.runningSession ?? null
          : null;
      const chargeableLots =
        existing && Array.isArray(existing.chargeableLots)
          ? existing.chargeableLots.map((item) => ({ ...item }))
          : [];
      const status = computeMasterSeedRunStatus(row, runningSession, chargeableLots);

      return masterRowToEquipmentRecord(row, existing, {
        runningSession,
        chargeableLots,
        status,
      });
    });
}
