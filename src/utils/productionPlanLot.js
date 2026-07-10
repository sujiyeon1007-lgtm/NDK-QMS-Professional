/**
 * Project TITAN — 생산작업계획 LOT 생성 · 취소 (Soft Delete · 이력)
 */

import { getJournalReferenceDate } from "./workJournalData";
import {
  getSessionProductionRecords,
  isIncomingRegistered,
  updateSessionProductionRecord,
} from "./productionRecords";
import { getCurrentTitanUser } from "./titanHistorySession";
import { WORKFLOW_STATUS } from "./titanWorkflowStatus";

const LIFECYCLE_STORAGE_KEY = "titan-lot-lifecycle-events";

export const LOT_BADGE_STATUS = {
  CREATED: "LOT생성",
  IN_PROGRESS: "작업진행중",
  PRODUCTION_DONE: "생산완료",
  CERT_DONE: "성적서완료",
  SHIPPED: "출고완료",
  CANCELLED: "LOT취소",
};

function readLifecycleEvents() {
  try {
    const raw = globalThis.sessionStorage?.getItem(LIFECYCLE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLifecycleEvents(events) {
  globalThis.sessionStorage?.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(events));
}

export function getLotLifecycleEvents(managementId) {
  const events = readLifecycleEvents();
  if (!managementId) return [...events].reverse();
  return events.filter((event) => event.managementIds?.includes(managementId)).reverse();
}

function appendLotLifecycleEvent(event) {
  const events = readLifecycleEvents();
  events.push({
    id: `LOT-EVT-${Date.now()}-${events.length}`,
    ...event,
  });
  writeLifecycleEvents(events);
}

export function recordLotEquipmentLifecycleEvent({
  lotNo,
  action,
  equipmentId = "",
  equipmentName = "",
  operator = "",
  managementIds = [],
} = {}) {
  const key = String(lotNo ?? "").trim();
  if (!key) return null;

  const resolvedIds =
    managementIds.length > 0
      ? managementIds
      : getSessionProductionRecords()
          .filter((row) => String(row.lotNo ?? "").trim() === key)
          .map((row) => row.id);

  const isStart = action === "equipmentWorkStart";
  appendLotLifecycleEvent({
    type: action,
    action: isStart ? "설비 작업 시작" : "설비 작업 완료",
    lotNo: key,
    equipmentId,
    equipmentName,
    operator,
    managementIds: resolvedIds,
    createdAt: new Date().toISOString(),
    source: "qr-equipment",
  });
  return true;
}

export function getLotLifecycleEventsByLotNo(lotNo) {
  const key = String(lotNo ?? "").trim();
  if (!key) return [];
  return readLifecycleEvents()
    .filter((event) => String(event.lotNo ?? "").trim() === key)
    .slice()
    .reverse();
}

export function countEquipmentTodayWorkFinishes(equipmentId, dateKey = null) {
  const equipmentKey = String(equipmentId ?? "").trim();
  if (!equipmentKey) return 0;
  const today = dateKey ?? new Date().toISOString().slice(0, 10);
  return readLifecycleEvents().filter(
    (event) =>
      event.type === "equipmentWorkFinish" &&
      String(event.equipmentId ?? "").trim() === equipmentKey &&
      String(event.createdAt ?? "").slice(0, 10) === today
  ).length;
}

export function resolveLotBadgeStatus(record) {
  if (!record) return null;

  if (record.lotCancelledAt && !record.lotNo?.trim()) {
    return LOT_BADGE_STATUS.CANCELLED;
  }

  if (!record.lotNo?.trim()) return null;

  if (record.shipmentStatus === "출고완료") return LOT_BADGE_STATUS.SHIPPED;
  if (record.certificateStatus === "발행완료") return LOT_BADGE_STATUS.CERT_DONE;
  if (record.registered) return LOT_BADGE_STATUS.PRODUCTION_DONE;
  if (record.workDate?.trim() || record.completionStatus === "작업중") {
    return LOT_BADGE_STATUS.IN_PROGRESS;
  }

  return LOT_BADGE_STATUS.CREATED;
}

export function canCancelLot(record) {
  if (!record?.lotNo?.trim()) {
    return { ok: false, reason: "LOT가 없는 제품입니다." };
  }
  if (record.registered) {
    return { ok: false, reason: "생산일보 LOT가 등록되어 취소할 수 없습니다." };
  }
  if (record.workDate?.trim()) {
    return { ok: false, reason: "작업이 시작되어 취소할 수 없습니다." };
  }
  if (record.certificateStatus === "발행완료") {
    return { ok: false, reason: "성적서가 발행되어 취소할 수 없습니다." };
  }
  if (record.shipmentStatus === "출고완료") {
    return { ok: false, reason: "출고가 완료되어 취소할 수 없습니다." };
  }
  return { ok: true };
}

function generateLotNo(records) {
  const datePart = getJournalReferenceDate().replace(/-/g, "").slice(2);
  const prefix = `LOT${datePart}-`;
  const count = records.filter((row) => row.lotNo?.trim().startsWith(prefix)).length;
  return `${prefix}${String(count + 1).padStart(2, "0")}`;
}

export function mapRecordToPlanRow(record) {
  const lotBadge = resolveLotBadgeStatus(record);
  const displayStatus = record.lotNo?.trim() ? "생산계획" : "입고완료";

  return {
    id: record.id,
    company: record.company,
    partName: record.partName,
    partNo: record.partNo,
    drawingNo: record.drawingNo ?? "",
    material: record.material,
    heatTreatment: record.heatTreatment,
    qty: record.qty,
    unit: record.unit ?? "EA",
    dueDate: record.dueDate,
    status: displayStatus,
    urgent: record.urgent ?? false,
    note: record.note ?? "",
    lot: record.lotNo ?? "",
    lotNo: record.lotNo ?? "",
    lotCreatedAt: record.lotCreatedAt ?? "",
    lotBadge,
    htlNo: record.htlNo ?? "",
    registered: record.registered,
    qrGenerated: record.qrGenerated ?? false,
    workSheetGenerated: record.workSheetGenerated ?? false,
    workDate: record.workDate,
    certificateStatus: record.certificateStatus,
    shipmentStatus: record.shipmentStatus,
  };
}

export function getProductionPlanQueueRecords() {
  return getSessionProductionRecords()
    .filter((record) => isIncomingRegistered(record))
    .map(mapRecordToPlanRow);
}

export function createProductionLots(managementIds, { htlListNo = "", memo = "" } = {}) {
  const records = getSessionProductionRecords();
  const targets = managementIds
    .map((id) => records.find((row) => row.id === id))
    .filter(Boolean);

  if (!targets.length) {
    return { ok: false, message: "LOT를 생성할 제품을 선택하세요." };
  }

  const waiting = targets.filter((row) => !row.lotNo?.trim());
  if (!waiting.length) {
    return { ok: false, message: "선택한 제품에 이미 LOT가 있습니다." };
  }

  const lotNo = generateLotNo(records);
  const now = new Date().toISOString();
  const user = getCurrentTitanUser();

  waiting.forEach((row) => {
    updateSessionProductionRecord(row.id, {
      lotNo,
      htlNo: htlListNo,
      lotCreatedAt: now,
      lotCreatedBy: user,
      lotCancelledAt: "",
      lotCancelledBy: "",
      lotCancelReason: "",
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      completionStatus: WORKFLOW_STATUS.WORK_WAIT,
    });
  });

  appendLotLifecycleEvent({
    type: "create",
    action: "LOT 생성",
    lotNo,
    htlListNo,
    memo,
    managementIds: waiting.map((row) => row.id),
    createdAt: now,
    createdBy: user,
  });

  return { ok: true, lotNo, count: waiting.length };
}

export function cancelProductionLots(managementIds, { reason = "" } = {}) {
  const records = getSessionProductionRecords();
  const targets = managementIds
    .map((id) => records.find((row) => row.id === id))
    .filter(Boolean);

  if (!targets.length) {
    return { ok: false, message: "LOT를 취소할 제품을 선택하세요." };
  }

  const blocked = targets
    .map((row) => ({ row, check: canCancelLot(row) }))
    .filter(({ check }) => !check.ok);

  if (blocked.length) {
    return { ok: false, message: blocked[0].check.reason };
  }

  const now = new Date().toISOString();
  const user = getCurrentTitanUser();
  const lotNumbers = [...new Set(targets.map((row) => row.lotNo?.trim()).filter(Boolean))];

  targets.forEach((row) => {
    updateSessionProductionRecord(row.id, {
      lotNo: "",
      htlNo: "",
      lotCancelledAt: now,
      lotCancelledBy: user,
      lotCancelReason: reason,
      completionStatus: "작업대기",
      workDate: "",
      equipment: "",
    });
  });

  appendLotLifecycleEvent({
    type: "cancel",
    action: "LOT 취소",
    lotNo: lotNumbers.join(", "),
    reason,
    managementIds: targets.map((row) => row.id),
    cancelledAt: now,
    cancelledBy: user,
  });

  return { ok: true, count: targets.length };
}
