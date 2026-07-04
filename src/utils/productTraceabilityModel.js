/**
 * Project TITAN V2.0 — 제품 Traceability (QR · 작업 이력 · LOT 동시장입)
 */

import { getQrTraceabilityEvents } from "./qrTraceabilitySession";
import { getSessionProductionRecords, normalizeLotNo } from "./productionRecords";
import { resolveHomeWorkflowCurrentPhase } from "./homeDashboardData";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { isIncomingRegistered } from "./productionRecords";

const EVENT_LABELS = {
  incomingRegistered: "입고등록",
  productionStart: "생산 시작",
  productionEnd: "생산 종료",
  inspectionStart: "검사 시작",
  inspectionEnd: "검사 완료",
  certificateIssued: "성적서 발행",
  shipmentReady: "출고 준비",
  shipmentCompleted: "출고 완료",
};

/** @param {string | Date} value */
export function formatTraceabilityDateTime(value) {
  if (!value) return "—";
  const text = String(value).trim();
  if (!text) return "—";

  const iso = text.includes("T") ? text : `${text.slice(0, 10)}T${text.length > 10 ? text.slice(11) : "00:00:00"}`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return text.length > 10 ? text.replace("T", " ").slice(0, 16) : text;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

/** @param {number} minutes */
export function formatTraceabilityDuration(minutes) {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return "—";
  const total = Math.round(minutes);
  if (total < 60) return `${total}분`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

function diffMinutes(startAt, endAt) {
  if (!startAt || !endAt) return null;
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

function pickEvent(events, type) {
  return events.find((item) => item.type === type) ?? null;
}

function inferEventsFromRecord(record) {
  if (!record) return [];
  const events = [];

  if (isIncomingRegistered(record)) {
    const at = record.incomingRegisteredAt || record.lotCreatedAt || `${record.incomingDate ?? ""}T09:00:00`;
    events.push({ type: "incomingRegistered", at, worker: record.registrar ?? record.manager ?? "", source: "system" });
  }

  if (record.registered && record.lotNo?.trim()) {
    const workDate = record.workDate || record.completionDate;
    if (workDate) {
      events.push({
        type: "productionStart",
        at: record.productionStartAt || `${workDate}T08:00:00`,
        worker: record.worker ?? "",
        equipment: record.equipment ?? "",
        source: "system",
      });
      events.push({
        type: "productionEnd",
        at: record.productionEndAt || `${workDate}T17:00:00`,
        worker: record.worker ?? "",
        equipment: record.equipment ?? "",
        source: "system",
      });
    }
  }

  if (hasInspectionLogForManagementId(record.id)) {
    events.push({
      type: "inspectionStart",
      at: record.inspectionStartAt || `${record.workDate ?? record.incomingDate ?? ""}T08:30:00`,
      worker: record.inspector ?? record.assignee ?? "",
      source: "system",
    });
    events.push({
      type: "inspectionEnd",
      at: record.inspectionEndAt || `${record.workDate ?? record.incomingDate ?? ""}T09:30:00`,
      worker: record.inspector ?? record.assignee ?? "",
      source: "system",
    });
  }

  if (record.certificateStatus === "발행완료" || record.certificateStatus === "issued") {
    events.push({
      type: "certificateIssued",
      at: record.certificateIssuedAt || `${record.workDate ?? record.incomingDate ?? ""}T10:00:00`,
      worker: record.certificateRegistrar ?? "",
      source: "system",
    });
  }

  if ((record.shippedQty ?? 0) > 0) {
    events.push({
      type: "shipmentCompleted",
      at: record.shipCompletedAt || `${record.shipDate ?? record.lastShipDate ?? ""}T15:00:00`,
      worker: record.shipManager ?? "",
      source: "system",
    });
  }

  return events;
}

function mergeEvents(record) {
  const qrEvents = getQrTraceabilityEvents(record?.id);
  if (qrEvents.length > 0) return qrEvents;
  return inferEventsFromRecord(record);
}

export function getCoLotProducts(record, records = getSessionProductionRecords()) {
  const lotKey = normalizeLotNo(record?.lotNo);
  if (!lotKey) return [];

  return records
    .filter((row) => normalizeLotNo(row.lotNo) === lotKey)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map((row, index) => ({
      order: index + 1,
      managementId: row.id,
      partName: row.partName ?? "—",
      partNo: row.partNo ?? "—",
      lotNo: row.lotNo ?? "—",
      isCurrent: row.id === record?.id,
    }));
}

function buildProcessDurations(events) {
  const productionStart = pickEvent(events, "productionStart");
  const productionEnd = pickEvent(events, "productionEnd");
  const inspectionStart = pickEvent(events, "inspectionStart");
  const inspectionEnd = pickEvent(events, "inspectionEnd");
  const shipmentReady = pickEvent(events, "shipmentReady");
  const shipmentCompleted = pickEvent(events, "shipmentCompleted");
  const certificateIssued = pickEvent(events, "certificateIssued");

  const productionMinutes = diffMinutes(productionStart?.at, productionEnd?.at);
  const inspectionMinutes = diffMinutes(inspectionStart?.at, inspectionEnd?.at);
  const shipmentPrepMinutes = diffMinutes(shipmentReady?.at, shipmentCompleted?.at);
  const certificateToShipMinutes =
    certificateIssued?.at && shipmentCompleted?.at
      ? diffMinutes(certificateIssued.at, shipmentCompleted.at)
      : null;

  return [
    {
      key: "production",
      label: "생산",
      minutes: productionMinutes,
      durationLabel: formatTraceabilityDuration(productionMinutes),
    },
    {
      key: "inspection",
      label: "검사",
      minutes: inspectionMinutes,
      durationLabel: formatTraceabilityDuration(inspectionMinutes),
    },
    {
      key: "shipmentPrep",
      label: "출고 준비",
      minutes: shipmentPrepMinutes,
      durationLabel: formatTraceabilityDuration(shipmentPrepMinutes),
    },
    {
      key: "leadTime",
      label: "생산 리드타임",
      minutes: certificateToShipMinutes,
      durationLabel: formatTraceabilityDuration(certificateToShipMinutes),
    },
  ].filter((item) => item.minutes != null);
}

function buildQrHistoryRows(events) {
  return events.map((event) => ({
    key: event.type,
    label: EVENT_LABELS[event.type] ?? event.type,
    at: event.at,
    atLabel: formatTraceabilityDateTime(event.at),
    worker: event.worker?.trim() || "—",
    equipment: event.equipment?.trim() || "",
  }));
}

function buildTimelineSteps(events) {
  const incoming = pickEvent(events, "incomingRegistered");
  const productionStart = pickEvent(events, "productionStart");
  const productionEnd = pickEvent(events, "productionEnd");
  const inspectionStart = pickEvent(events, "inspectionStart");
  const inspectionEnd = pickEvent(events, "inspectionEnd");
  const certificate = pickEvent(events, "certificateIssued");
  const shipment = pickEvent(events, "shipmentCompleted");

  const steps = [];

  if (incoming) {
    steps.push({
      id: "incoming",
      label: "입고",
      timeLabel: formatTraceabilityDateTime(incoming.at).slice(11) || formatTraceabilityDateTime(incoming.at),
      detail: formatTraceabilityDateTime(incoming.at),
      status: "done",
    });
  }

  if (productionStart || productionEnd) {
    const startLabel = productionStart ? formatTraceabilityDateTime(productionStart.at).slice(11) : "—";
    const endLabel = productionEnd ? formatTraceabilityDateTime(productionEnd.at).slice(11) : "—";
    steps.push({
      id: "production",
      label: "생산",
      timeLabel: `${startLabel}~${endLabel}`,
      detail: pickEvent(events, "productionStart")?.worker
        ? `담당 ${productionStart.worker}`
        : "",
      durationLabel: formatTraceabilityDuration(diffMinutes(productionStart?.at, productionEnd?.at)),
      status: productionEnd ? "done" : "active",
    });
  }

  if (inspectionStart || inspectionEnd) {
    const startLabel = inspectionStart ? formatTraceabilityDateTime(inspectionStart.at).slice(11) : "—";
    const endLabel = inspectionEnd ? formatTraceabilityDateTime(inspectionEnd.at).slice(11) : "—";
    steps.push({
      id: "inspection",
      label: "검사",
      timeLabel: `${startLabel}~${endLabel}`,
      detail: inspectionStart?.worker ? `담당 ${inspectionStart.worker}` : "",
      durationLabel: formatTraceabilityDuration(diffMinutes(inspectionStart?.at, inspectionEnd?.at)),
      status: inspectionEnd ? "done" : "active",
    });
  }

  if (certificate) {
    steps.push({
      id: "certificate",
      label: "성적서",
      timeLabel: formatTraceabilityDateTime(certificate.at).slice(11),
      detail: formatTraceabilityDateTime(certificate.at),
      status: "done",
    });
  }

  if (shipment) {
    steps.push({
      id: "shipment",
      label: "출고",
      timeLabel: formatTraceabilityDateTime(shipment.at).slice(11),
      detail: formatTraceabilityDateTime(shipment.at),
      status: "done",
    });
  }

  return steps;
}

/**
 * @param {object | null} record production session record
 */
export function buildProductTraceability(record) {
  if (!record?.id) {
    return null;
  }

  const events = mergeEvents(record);
  const current = resolveHomeWorkflowCurrentPhase(record);

  return {
    managementId: record.id,
    lotNo: record.lotNo?.trim() || "—",
    company: record.company ?? "—",
    partName: record.partName ?? "—",
    partNo: record.partNo ?? "—",
    material: record.material ?? "—",
    qtyLabel: `${Number(record.qty) || 0} ${record.unit || "EA"}`,
    currentProcess: current.label,
    currentProcessKey: current.key,
    qrHistory: buildQrHistoryRows(events),
    timeline: buildTimelineSteps(events),
    processDurations: buildProcessDurations(events),
    coLotProducts: getCoLotProducts(record),
    hasQrData: getQrTraceabilityEvents(record.id).length > 0,
    processName: getProductionProcessName(record) ?? record.heatTreatment ?? "—",
  };
}

/** 통계 Tab 연동용 — 평균 생산/검사 시간 집계 */
export function aggregateTraceabilityDurations(records = getSessionProductionRecords()) {
  const productionMinutes = [];
  const inspectionMinutes = [];

  records.forEach((record) => {
    const trace = buildProductTraceability(record);
    if (!trace) return;
    trace.processDurations.forEach((item) => {
      if (item.key === "production" && item.minutes != null) productionMinutes.push(item.minutes);
      if (item.key === "inspection" && item.minutes != null) inspectionMinutes.push(item.minutes);
    });
  });

  const avg = (values) =>
    values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : null;

  return {
    sampleCount: records.length,
    avgProductionMinutes: avg(productionMinutes),
    avgProductionLabel: formatTraceabilityDuration(avg(productionMinutes)),
    avgInspectionMinutes: avg(inspectionMinutes),
    avgInspectionLabel: formatTraceabilityDuration(avg(inspectionMinutes)),
  };
}
