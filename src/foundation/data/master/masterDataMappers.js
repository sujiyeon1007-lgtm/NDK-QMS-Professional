/**
 * Project TITAN V1.6 — Master row ↔ Store record mappers
 */

/**
 * @param {Record<string, unknown>} record
 * @returns {Record<string, unknown>}
 */
export function equipmentStoreToMasterRow(record) {
  if (!record) return record;
  return {
    id: record.masterId ?? record.equipmentId,
    code: record.code ?? record.equipmentId,
    name: record.equipmentName ?? record.name ?? record.code,
    equipType: record.process ?? record.equipType ?? "",
    location: record.location ?? "",
    inspectionCycle: record.inspectionCycle ?? "",
    note: record.note ?? "",
    active: record.active !== false && !record.maintenanceDisabled,
  };
}

/**
 * @param {Record<string, unknown>} row
 * @param {Record<string, unknown> | null | undefined} existing
 * @param {{
 *   runningSession?: Record<string, unknown> | null,
 *   chargeableLots?: Record<string, unknown>[],
 *   maintenance?: boolean,
 *   status?: string,
 * }} [runtime]
 */
export function masterRowToEquipmentRecord(row, existing = null, runtime = {}) {
  const code = String(row.code ?? row.name ?? "").trim();
  const equipmentId = code || String(row.id ?? "").trim();
  const runningSession =
    runtime.runningSession !== undefined
      ? runtime.runningSession
      : existing?.runningSession ?? null;
  const chargeableLots =
    runtime.chargeableLots !== undefined
      ? runtime.chargeableLots
      : Array.isArray(existing?.chargeableLots)
        ? existing.chargeableLots.map((item) => ({ ...item }))
        : [];
  const maintenance =
    runtime.maintenance !== undefined
      ? runtime.maintenance
      : Boolean(existing?.maintenance) || row.active === false;
  const status =
    runtime.status ??
    existing?.status ??
    (maintenance ? "maintenance" : runningSession ? "running" : chargeableLots.length ? "ready" : "idle");

  return {
    equipmentId,
    equipmentName: String(row.name ?? code).trim(),
    process: String(row.equipType ?? row.process ?? "").trim(),
    code,
    masterId: row.id,
    location: row.location ?? "",
    inspectionCycle: row.inspectionCycle ?? "",
    note: row.note ?? "",
    active: row.active !== false,
    maintenance,
    maintenanceDisabled: row.active === false,
    smartAccessId: `NDK://EQ/${code}`,
    status,
    currentLot: runningSession?.lotNo ?? chargeableLots[0]?.lotNo ?? null,
    startTime: runningSession?.startTime ?? null,
    expectedEndTime: runningSession?.expectedEndTime ?? null,
    progress: runningSession?.progress ?? 0,
    runningSession: runningSession ? { ...runningSession } : null,
    chargeableLots,
  };
}

/**
 * @param {Record<string, unknown>[]} rows
 */
export function cloneMasterRows(rows = []) {
  return rows.map((row) => ({ ...row }));
}
