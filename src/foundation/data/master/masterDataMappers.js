/**
 * Project TITAN V1.6 — Master row ↔ Store record mappers
 */

function resolveLocalHeatTreatmentProcessCode(labelOrCode) {
  const raw = String(labelOrCode ?? "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (upper === "ION" || upper === "SOFT" || upper === "GAS") return upper;
  if (raw === "\uC774\uC628\uC9C8\uD654" || raw === "\uC9C8\uD654") return "ION";
  if (raw === "\uC5F0\uC9C8\uD654" || raw === "\uAC00\uC2A4\uC5F0\uC9C8\uD654") return "SOFT";
  if (raw === "\uAC00\uC2A4\uC9C8\uD654") return "GAS";
  return "";
}

function getLocalHeatTreatmentProcessLabel(code) {
  const key = String(code ?? "").trim().toUpperCase();
  if (key === "ION") return "\uC774\uC628\uC9C8\uD654";
  if (key === "SOFT") return "\uC5F0\uC9C8\uD654";
  if (key === "GAS") return "\uAC00\uC2A4\uC9C8\uD654";
  return String(code ?? "").trim();
}

function normalizeRunStatus(value) {
  return String(value ?? "").trim().toLowerCase();
}

function hasChargedLot(chargeableLots = []) {
  return chargeableLots.some((row) => String(row?.lotNo ?? "").trim());
}

function resolveExplicitRunStatus(row = {}) {
  const runStatus = normalizeRunStatus(row.runStatus ?? row.masterRunStatus);
  if (row.breakdown === true || row.breakdownMode === true || runStatus === "breakdown") {
    return "breakdown";
  }
  if (row.maintenanceMode === true || runStatus === "maintenance") {
    return "maintenance";
  }
  return "";
}

/**
 * @param {Record<string, unknown>} record
 * @returns {Record<string, unknown>}
 */
export function equipmentStoreToMasterRow(record) {
  if (!record) return record;
  const processCode =
    record.processCode ?? resolveLocalHeatTreatmentProcessCode(record.process ?? record.equipType ?? "");
  return {
    id: record.masterId ?? record.equipmentId,
    code: record.code ?? record.equipmentId,
    name: record.equipmentName ?? record.name ?? record.code,
    equipType: record.process ?? record.equipType ?? getLocalHeatTreatmentProcessLabel(processCode),
    processCode,
    location: record.location ?? "",
    inspectionCycle: record.inspectionCycle ?? "",
    note: record.note ?? "",
    active: record.active !== false,
    maintenanceMode: record.maintenanceMode === true,
    runStatus: record.runStatus,
    breakdown: record.breakdown === true || record.breakdownMode === true,
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
  const explicitStatus = runtime.status ?? resolveExplicitRunStatus(row);
  const status =
    explicitStatus ||
    (runningSession ? "running" : hasChargedLot(chargeableLots) ? "ready" : "idle");
  const maintenance = status === "maintenance";

  const processCode = resolveLocalHeatTreatmentProcessCode(
    row.processCode ?? row.equipType ?? row.process ?? existing?.processCode ?? existing?.process ?? ""
  );
  const processLabel = getLocalHeatTreatmentProcessLabel(processCode) || String(row.equipType ?? row.process ?? "").trim();

  return {
    equipmentId,
    equipmentName: String(row.name ?? code).trim(),
    process: processLabel,
    processCode,
    code,
    masterId: row.id,
    location: row.location ?? "",
    inspectionCycle: row.inspectionCycle ?? "",
    note: row.note ?? "",
    active: row.active !== false,
    maintenance,
    maintenanceMode: row.maintenanceMode === true,
    runStatus: row.runStatus,
    breakdown: row.breakdown === true || row.breakdownMode === true,
    maintenanceDisabled: false,
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
