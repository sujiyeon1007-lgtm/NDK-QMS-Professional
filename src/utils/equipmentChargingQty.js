/**
 * Equipment charging quantity helpers (optional partial charge).
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
  const inboundQty = toPositiveNumber(record?.inboundQty) || toPositiveNumber(record?.qty);
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

export function resolveInboundQtyForChargeRow(lotRow) {
  return toPositiveNumber(lotRow?.inboundQty ?? lotRow?.qty ?? lotRow?.remainingChargeQty);
}

export function resolveChargeQtyInput(lotRow, draftChargeQty = "") {
  const inboundQty = resolveInboundQtyForChargeRow(lotRow);
  const unit = String(lotRow?.unit ?? "EA").trim() || "EA";
  const maxQty = toPositiveNumber(lotRow?.remainingChargeQty) || inboundQty || toPositiveNumber(lotRow?.qty);

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
