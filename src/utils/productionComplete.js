/**
 * 생산일보 — 생산 완료 / 취소 처리 (V1.3)
 *
 * UI policy: per-row [완료]/[취소] in list last column — not top toolbar.
 * Top toolbar: registration · print/export · bulk only.
 *
 * Complete → PROD_DONE → 양산검사(Mass Production Inspection) 대기열(검사대기).
 * Cancel  → PROD_PROGRESS → 양산검사 대기열에서 자동 제거 (별도 log 없을 때).
 */

import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { getSessionProductionRecords, updateSessionProductionRecord } from "./productionRecords";
import { recordQrTraceabilityEvent } from "./qrTraceabilitySession";
import {
  getWorkflowStatus,
  onProductionComplete,
  onProductionCompleteReverted,
  WORKFLOW_STATUS,
} from "./titanWorkflowStatus";

export function isProductionComplete(record) {
  if (!record) return false;
  return (
    record.completionStatus === WORKFLOW_STATUS.PROD_DONE ||
    getWorkflowStatus(record) === WORKFLOW_STATUS.PROD_DONE
  );
}

/**
 * @param {object | null | undefined} record
 * @returns {{ ok: boolean, reason?: string }}
 */
export function canCompleteProduction(record) {
  if (!record?.registered || !record?.lotNo?.trim()) {
    return { ok: false, reason: "열처리일보 등록 후 열처리 완료할 수 있습니다." };
  }

  if (isProductionComplete(record)) {
    return { ok: false, reason: "이미 열처리 완료 처리된 제품입니다." };
  }

  if (hasInspectionLogForManagementId(record.id)) {
    return { ok: false, reason: "검사가 시작된 제품은 열처리 완료를 변경할 수 없습니다." };
  }

  const status = getWorkflowStatus(record);
  if (status !== WORKFLOW_STATUS.PROD_PROGRESS) {
    return { ok: false, reason: "열처리중 상태에서만 열처리 완료할 수 있습니다." };
  }

  return { ok: true };
}

/**
 * @param {string} managementId
 * @param {{ worker?: string, equipment?: string, source?: string }} [options]
 */
export function completeProductionRecord(managementId, options = {}) {
  const id = String(managementId ?? "").trim();
  if (!id) return { ok: false, reason: "관리번호가 없습니다." };

  const record = getSessionProductionRecords().find((item) => item.id === id);
  const check = canCompleteProduction(record);
  if (!check.ok) return check;

  const now = new Date().toISOString();
  const worker = options.worker?.trim() || record.registrar || record.worker || "관리자";
  const equipment = options.equipment?.trim() || record.equipment || "";

  onProductionComplete(id, {
    productionEndAt: now,
    productionCompletedAt: now,
    productionCompletedBy: worker,
    updatedAt: now,
  });

  recordQrTraceabilityEvent(id, {
    type: "productionEnd",
    at: now,
    worker,
    equipment,
    source: options.source || "manual",
  });

  updateSessionProductionRecord(id, {
    productionWorkLog: {
      ...(record.productionWorkLog ?? {}),
      endAt: now,
      completedAt: now,
      worker,
      equipment,
      source: options.source || "manual",
    },
  });

  return { ok: true, id };
}

/**
 * @param {string[]} managementIds
 * @param {{ worker?: string, equipment?: string, source?: string }} [options]
 */
export function completeProductionRecords(managementIds = [], options = {}) {
  const ids = [...new Set(managementIds.map((id) => String(id ?? "").trim()).filter(Boolean))];
  if (!ids.length) {
    return { ok: false, reason: "열처리 완료할 제품을 선택하세요." };
  }

  const results = ids.map((id) => completeProductionRecord(id, options));
  const failed = results.find((result) => !result.ok);
  if (failed) {
    return { ok: false, reason: failed.reason, results };
  }

  return { ok: true, results };
}

/**
 * @param {object | null | undefined} record
 * @returns {{ ok: boolean, reason?: string }}
 */
export function canCancelProductionComplete(record) {
  if (!record?.registered || !record?.lotNo?.trim()) {
    return { ok: false, reason: "열처리일보 등록된 LOT만 열처리완료를 취소할 수 있습니다." };
  }

  if (!isProductionComplete(record)) {
    return { ok: false, reason: "열처리완료 상태에서만 취소할 수 있습니다." };
  }

  if (hasInspectionLogForManagementId(record.id)) {
    return { ok: false, reason: "검사가 등록된 제품은 열처리완료를 취소할 수 없습니다." };
  }

  return { ok: true };
}

/**
 * Revert mistaken production complete — row returns to 생산중.
 * @param {string} managementId
 * @param {{ source?: string }} [options]
 */
export function cancelProductionCompleteRecord(managementId, options = {}) {
  const id = String(managementId ?? "").trim();
  if (!id) return { ok: false, reason: "관리번호가 없습니다." };

  const record = getSessionProductionRecords().find((item) => item.id === id);
  const check = canCancelProductionComplete(record);
  if (!check.ok) return check;

  const now = new Date().toISOString();

  onProductionCompleteReverted(id, { updatedAt: now });

  updateSessionProductionRecord(id, {
    productionWorkLog: {
      ...(record.productionWorkLog ?? {}),
      endAt: "",
      completedAt: "",
      revertedAt: now,
      source: options.source || "manual-revert",
    },
  });

  return { ok: true, id };
}
