/**
 * Project TITAN V1.3 — QR관리 모델 (생성 · 출력 · 상세조회)
 */

import { mapV13ProductListRow } from "./processFlow";
import { formatTraceabilityDateTime } from "./productTraceabilityModel";
import { getQrTraceabilityEvents } from "./qrTraceabilitySession";
import { getSessionProductionRecords } from "./productionRecords";
import { resolveRecordCurrentProcess } from "./workflowProcessStatus";

/** QR 상세 — 작업이력 Demo 라벨 (V1.3) */
export const QR_WORK_HISTORY_LABELS = {
  incomingRegistered: "입고등록",
  productionStart: "생산시작",
  productionEnd: "생산종료",
  inspectionStart: "검사시작",
  inspectionEnd: "검사종료",
  certificateIssued: "성적서발행",
  shipmentReady: "출고준비",
  shipmentCompleted: "출고완료",
};

export const QR_STATUS_LABELS = {
  active: "정상",
  regenerated: "재생성",
};

export const QR_STATUS_VARIANTS = {
  active: "complete",
  regenerated: "info",
};

/**
 * 입출고 QR payload (V1.3 Phase 1)
 * @param {object} row
 */
export function buildInoutQrPayloadText(row) {
  if (!row) return "";
  return [
    `관리번호: ${row.managementId ?? row.id ?? "—"}`,
    `LOT번호: ${row.lotNo ?? "—"}`,
    `업체명: ${row.company ?? "—"}`,
    `품명: ${row.partName ?? "—"}`,
    `품번: ${row.partNo ?? "—"}`,
  ].join("\n");
}

/** @deprecated use buildInoutQrPayloadText */
export function buildQrPayloadText(row) {
  return buildInoutQrPayloadText(row);
}

/**
 * 설비 QR payload (V1.3 Phase 1)
 * @param {object} equipment
 */
export function buildEquipmentQrPayloadText(equipment) {
  if (!equipment) return "";
  return [
    `설비번호: ${equipment.code ?? "—"}`,
    `설비명: ${equipment.name ?? "—"}`,
    `위치: ${equipment.location ?? "—"}`,
    `점검주기: ${equipment.inspectionCycle ?? "월 1회"}`,
  ].join("\n");
}

export const QR_PENDING_STATUS = {
  label: "미생성",
  variant: "wait",
};

export function resolveQrStatusDisplay(qrRecord) {
  if (!qrRecord) return QR_PENDING_STATUS;
  return {
    label: QR_STATUS_LABELS[qrRecord.status] ?? "정상",
    variant: QR_STATUS_VARIANTS[qrRecord.status] ?? "complete",
  };
}

export function resolveQrCurrentProcess(record) {
  if (!record) return "—";
  return resolveRecordCurrentProcess(record).label;
}

export function buildQrWorkHistoryRows(managementId) {
  return getQrTraceabilityEvents(managementId).map((event) => ({
    key: event.type,
    label: QR_WORK_HISTORY_LABELS[event.type] ?? event.type,
    atLabel: formatTraceabilityDateTime(event.at),
    worker: event.worker?.trim() || "—",
  }));
}

/**
 * @param {object} qrRecord
 * @param {object} [productionRecord]
 */
export function mapQrInoutListRow(productionRecord, qrRecord = null) {
  const record = productionRecord ?? null;
  const entityKey = record?.id ?? qrRecord?.entityKey ?? "";
  const status = resolveQrStatusDisplay(qrRecord);
  const payload =
    qrRecord?.payload ??
    (record ? buildInoutQrPayloadText({ ...record, managementId: record.id }) : "");
  const v13 = record
    ? mapV13ProductListRow(record, { label: status.label, variant: status.variant })
    : {
        incomingDate: "—",
        productionDate: "—",
        lotNo: "—",
        company: "—",
        partName: "—",
        partNo: "—",
        inboundQtyLabel: "—",
        workQtyLabel: "—",
        currentProcess: "—",
        workflowProcess: "—",
        remark: "—",
      };

  return {
    ...v13,
    id: qrRecord?.id ?? `pending-inout-${entityKey}`,
    entityKey,
    managementId: entityKey,
    qrStatusLabel: status.label,
    qrStatusVariant: status.variant,
    hasQr: Boolean(qrRecord),
    createdAtLabel: qrRecord
      ? formatTraceabilityDateTime(qrRecord.createdAt).slice(0, 10)
      : "—",
    createdBy: qrRecord?.createdBy ?? "—",
    qrPayload: payload,
    record,
    qrRecord,
    printTitle: record?.partName ?? entityKey,
    printSubtitle: entityKey,
  };
}

export function mapQrEquipmentListRow(equipment, qrRecord = null) {
  const status = resolveQrStatusDisplay(qrRecord);
  const entityKey = equipment?.code ?? equipment?.id ?? "";
  const payload = qrRecord?.payload ?? buildEquipmentQrPayloadText(equipment);

  return {
    id: qrRecord?.id ?? `pending-equipment-${entityKey}`,
    entityKey,
    equipmentCode: equipment?.code ?? "—",
    equipmentName: equipment?.name ?? "—",
    location: equipment?.location ?? "—",
    equipmentStatusLabel: equipment?.active === false ? "미사용" : "사용",
    equipmentStatusVariant: equipment?.active === false ? "hold" : "complete",
    qrStatusLabel: status.label,
    qrStatusVariant: status.variant,
    hasQr: Boolean(qrRecord),
    createdAtLabel: qrRecord
      ? formatTraceabilityDateTime(qrRecord.createdAt).slice(0, 10)
      : "—",
    qrPayload: payload,
    equipment,
    qrRecord,
    printTitle: equipment?.name ?? entityKey,
    printSubtitle: entityKey,
  };
}

/** @deprecated use mapQrInoutListRow */
export function mapQrManagementListRow(qrRecord, productionRecord) {
  const record =
    productionRecord ??
    getSessionProductionRecords().find((item) => item.id === qrRecord?.managementId) ??
    null;
  return mapQrInoutListRow(record, qrRecord);
}
