/**
 * Equipment charging quantity helpers (optional partial charge).
 *
 * Three-field contract (RC1 P0 SSOT):
 * - inboundQty — original inbound qty, never changes (입고관리 · 입고이력)
 * - chargeQty — actual qty charged in this LOT session (작업일보 · 설비가동 · 생산이력 · LOT popup)
 * - remainingChargeQty — warehouse remaining after cumulative charges (생산대기 · 재고 · 장입가능 리스트)
 *
 * Use resolveInboundQty / resolveChargeQty / resolveRemainingChargeQty — do not use record.qty
 * for heat-treatment work/charge display when chargeHistory or chargeQty exists.
 */

function toPositiveNumber(value) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function toNonNegativeNumber(value) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Cumulative completed charge qty from history or persisted field */
export function resolveTotalChargedQty(record) {
  const history = Array.isArray(record?.chargeHistory) ? record.chargeHistory : [];
  const fromHistory = history
    .filter((entry) => entry?.status === "completed")
    .reduce((sum, entry) => sum + (Number(entry?.chargeQty) || 0), 0);
  if (fromHistory > 0) return fromHistory;

  const fromField = Number(record?.totalChargedQty);
  return Number.isFinite(fromField) && fromField > 0 ? fromField : 0;
}

/** 잔여수량 = 입고수량 - 누적 장입수량 (partial charge 시 remainingChargeQty>0 SSoT) */
export function resolveRemainingChargeQty(record) {
  const inboundQty = resolveInboundQty(record);
  const totalCharged = resolveTotalChargedQty(record);
  const calculated = inboundQty > 0 ? Math.max(0, inboundQty - totalCharged) : 0;

  const rawRemaining = record?.remainingChargeQty;
  const hasExplicitRemaining =
    rawRemaining !== undefined &&
    rawRemaining !== null &&
    String(rawRemaining).trim() !== "";

  if (hasExplicitRemaining) {
    const explicit = toNonNegativeNumber(rawRemaining);
    if (explicit === 0) return 0;
    if (explicit != null) {
      return inboundQty > 0
        ? Math.min(explicit, calculated > 0 ? calculated : explicit)
        : explicit;
    }
  }

  return calculated;
}

/** Original inbound qty — baseline, never reduced by partial charge */
export function resolveInboundQty(record) {
  return toPositiveNumber(record?.inboundQty) || toPositiveNumber(record?.qty);
}

export function resolveInboundQtyForChargeRow(lotRow) {
  return resolveInboundQty(lotRow) || toPositiveNumber(lotRow?.remainingChargeQty);
}

export function resolveChargeQtyInput(lotRow, draftChargeQty = "") {
  const inboundQty = resolveInboundQtyForChargeRow(lotRow);
  const unit = String(lotRow?.unit ?? "EA").trim() || "EA";
  const maxQty =
    resolveRemainingChargeQty(lotRow) ||
    toPositiveNumber(lotRow?.remainingChargeQty) ||
    inboundQty ||
    toPositiveNumber(lotRow?.qty);

  const rawInput = String(draftChargeQty ?? "").trim();
  if (!rawInput) {
    const chargeQty = maxQty;
    if (chargeQty <= 0) {
      return {
        ok: false,
        message: "장입할 수량이 없습니다.",
        chargeQty: 0,
        inboundQty,
        unit,
        remainingQty: 0,
        isPartial: false,
      };
    }
    return {
      ok: true,
      chargeQty,
      inboundQty: inboundQty || chargeQty,
      unit,
      remainingQty: 0,
      isPartial: false,
    };
  }

  const chargeQty = toPositiveNumber(rawInput);
  if (chargeQty <= 0) {
    return {
      ok: false,
      message: "유효한 장입수량을 입력하세요.",
      chargeQty: 0,
      inboundQty,
      unit,
      remainingQty: 0,
      isPartial: false,
    };
  }

  if (maxQty > 0 && chargeQty > maxQty) {
    return {
      ok: false,
      message: `장입수량은 ${maxQty.toLocaleString("ko-KR")} ${unit} 이하로 입력하세요.`,
      chargeQty: 0,
      inboundQty,
      unit,
      remainingQty: 0,
      isPartial: false,
    };
  }

  const remainingQty = maxQty > 0 ? Math.max(0, maxQty - chargeQty) : 0;
  return {
    ok: true,
    chargeQty,
    inboundQty: inboundQty || maxQty || chargeQty,
    unit,
    remainingQty,
    isPartial: remainingQty > 0,
  };
}

export function getInProgressChargeSessions(record) {
  const history = Array.isArray(record?.chargeHistory) ? record.chargeHistory : [];
  return history.filter((entry) => entry?.status === "in-progress");
}

export function hasInProgressChargeOnEquipment(record, equipmentId) {
  const eqKey = String(equipmentId ?? "").trim();
  if (!eqKey) return false;
  return getInProgressChargeSessions(record).some(
    (entry) => String(entry?.equipmentId ?? "").trim() === eqKey
  );
}

export function hasOtherInProgressChargeSessions(record, excludeEquipmentId) {
  const excludeKey = String(excludeEquipmentId ?? "").trim();
  return getInProgressChargeSessions(record).some(
    (entry) => String(entry?.equipmentId ?? "").trim() !== excludeKey
  );
}

/**
 * LOT display qty — chargeQty / workQty / active chargeHistory only (NOT inboundQty / qty).
 * @param {Record<string, unknown> | null | undefined} recordOrItem
 * @param {{ lotNo?: string }} [options]
 */
export function resolveChargeQty(recordOrItem, { lotNo = "" } = {}) {
  if (!recordOrItem) return 0;

  const explicit = Number(recordOrItem.chargeQty);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  const workQty = Number(recordOrItem.workQty);
  if (Number.isFinite(workQty) && workQty > 0) return workQty;

  const lotKey = String(lotNo || recordOrItem.lotNo || "").trim().toUpperCase();
  const history = Array.isArray(recordOrItem.chargeHistory) ? recordOrItem.chargeHistory : [];

  if (lotKey) {
    const inProgress = findInProgressChargeEntry(recordOrItem, { lotNo: lotKey });
    const fromActive = Number(inProgress?.chargeQty);
    if (Number.isFinite(fromActive) && fromActive > 0) return fromActive;

    const fromCompleted = history
      .filter(
        (entry) =>
          entry?.status === "completed" &&
          String(entry?.lotNo ?? "").trim().toUpperCase() === lotKey
      )
      .reduce((sum, entry) => sum + (Number(entry?.chargeQty) || 0), 0);
    if (fromCompleted > 0) return fromCompleted;
  } else if (history.length > 0) {
    const latest = history[history.length - 1];
    const fromLatest = Number(latest?.chargeQty);
    if (Number.isFinite(fromLatest) && fromLatest > 0) return fromLatest;
  }

  return 0;
}

export function findInProgressChargeEntry(record, { equipmentId = "", lotNo = "", productionId = "" } = {}) {
  const eqKey = String(equipmentId ?? "").trim();
  const lotKey = String(lotNo ?? "").trim().toUpperCase();
  const prodKey = String(productionId ?? "").trim();
  const history = Array.isArray(record?.chargeHistory) ? record.chargeHistory : [];

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const row = history[index];
    if (row?.status !== "in-progress") continue;
    if (eqKey && String(row?.equipmentId ?? "").trim() !== eqKey) continue;
    if (lotKey && String(row?.lotNo ?? "").trim().toUpperCase() !== lotKey) continue;
    if (prodKey && String(row?.productionId ?? row?.chargeId ?? "").trim() !== prodKey) continue;
    return row;
  }
  return null;
}

/**
 * Validate multi-select charge rows before batch start.
 * @param {Array<Record<string, unknown>>} rows
 * @param {Record<string, string>} qtyByRowId
 * @param {boolean} [qtyInputEnabled=false]
 */
export function validateChargeSelections(rows = [], qtyByRowId = {}, qtyInputEnabled = false) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, message: "장입할 제품을 선택하세요.", selections: [], totalChargeQty: 0 };
  }

  const selections = [];
  let totalChargeQty = 0;

  for (const row of rows) {
    const rowId = String(row?.id ?? "").trim();
    const draftQty = qtyInputEnabled ? String(qtyByRowId?.[rowId] ?? "").trim() : "";
    const resolved = resolveChargeQtyInput(row, draftQty);
    if (!resolved.ok) {
      const label = String(row?.managementId ?? row?.mesManagementNo ?? row?.partNo ?? rowId).trim();
      return {
        ok: false,
        message: label ? `${label}: ${resolved.message}` : resolved.message,
        selections: [],
        totalChargeQty: 0,
      };
    }
    selections.push({ row, ...resolved });
    totalChargeQty += resolved.chargeQty;
  }

  return { ok: true, message: "", selections, totalChargeQty };
}

export function appendChargeHistory(existingHistory, entry) {
  const history = Array.isArray(existingHistory) ? [...existingHistory] : [];
  const equipmentId = String(entry?.equipmentId ?? "").trim();
  const productionId = String(entry?.productionId ?? entry?.chargeId ?? "").trim();
  history.push({
    id: `${equipmentId || "eq"}-${String(entry?.lotNo ?? "lot").trim()}-${Date.now()}`,
    status: "in-progress",
    ...entry,
    ...(productionId ? { productionId, chargeId: productionId } : {}),
  });
  return history;
}

export function completeLatestChargeHistoryEntry(existingHistory, lotNo, patch = {}) {
  const history = Array.isArray(existingHistory) ? [...existingHistory] : [];
  const lotKey = String(lotNo ?? "").trim();
  const equipmentId = String(patch?.equipmentId ?? "").trim();
  const productionId = String(patch?.productionId ?? patch?.chargeId ?? "").trim();

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const row = history[index];
    if (row?.status !== "in-progress") continue;
    if (lotKey && String(row?.lotNo ?? "").trim() !== lotKey) continue;
    if (equipmentId && String(row?.equipmentId ?? "").trim() !== equipmentId) continue;
    if (productionId && String(row?.productionId ?? row?.chargeId ?? "").trim() !== productionId) {
      continue;
    }
    history[index] = {
      ...row,
      ...patch,
      status: patch.status ?? "completed",
    };
    break;
  }
  return history;
}
