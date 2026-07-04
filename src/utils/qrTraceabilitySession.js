/**
 * Project TITAN V2.0 — QR Traceability 이벤트 (SessionStorage)
 * QR 스캔 · Smart Access → 작업 시작/종료 · 작업자 자동 기록
 */

const STORAGE_KEY = "project-titan-qr-traceability-v1";

/** @typedef {'incomingRegistered'|'productionStart'|'productionEnd'|'inspectionStart'|'inspectionEnd'|'certificateIssued'|'shipmentReady'|'shipmentCompleted'} QrTraceEventType */

/**
 * @typedef {object} QrTraceEvent
 * @property {QrTraceEventType} type
 * @property {string} at ISO datetime
 * @property {string} [worker]
 * @property {string} [equipment]
 * @property {string} [source] qr | manual | system
 */

/** V2.0 데모 — LOT 260701-3S1A 장입 동시작업 예시 */
const TRACEABILITY_SEED = {
  SE_20260703_0001: {
    lotNo: "260701-3S1A",
    events: [
      { type: "incomingRegistered", at: "2026-07-10T09:15:00", worker: "김입고", source: "qr" },
      { type: "productionStart", at: "2026-07-10T13:42:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
      { type: "productionEnd", at: "2026-07-10T18:36:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
      { type: "inspectionStart", at: "2026-07-11T08:21:00", worker: "정반이", source: "qr" },
      { type: "inspectionEnd", at: "2026-07-11T09:04:00", worker: "정반이", source: "qr" },
      { type: "certificateIssued", at: "2026-07-11T10:11:00", worker: "품질관리부", source: "system" },
      { type: "shipmentReady", at: "2026-07-11T14:22:00", worker: "이출고", source: "qr" },
      { type: "shipmentCompleted", at: "2026-07-11T15:42:00", worker: "이출고", source: "qr" },
    ],
  },
  SE_20260703_0002: {
    lotNo: "260701-3S1A",
    events: [
      { type: "incomingRegistered", at: "2026-07-10T09:18:00", worker: "김입고", source: "qr" },
      { type: "productionStart", at: "2026-07-10T13:42:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
      { type: "productionEnd", at: "2026-07-10T18:36:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
      { type: "inspectionStart", at: "2026-07-11T08:25:00", worker: "정반이", source: "qr" },
      { type: "inspectionEnd", at: "2026-07-11T09:08:00", worker: "정반이", source: "qr" },
      { type: "certificateIssued", at: "2026-07-11T10:15:00", worker: "품질관리부", source: "system" },
    ],
  },
  SE_20260703_0003: {
    lotNo: "260701-3S1A",
    events: [
      { type: "incomingRegistered", at: "2026-07-10T09:20:00", worker: "김입고", source: "qr" },
      { type: "productionStart", at: "2026-07-10T13:42:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
      { type: "productionEnd", at: "2026-07-10T18:36:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
    ],
  },
};

function safeReadAll() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safeWriteAll(data) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getQrTraceabilityEvents(managementId) {
  const id = String(managementId ?? "").trim();
  if (!id) return [];

  const stored = safeReadAll()[id];
  if (Array.isArray(stored?.events) && stored.events.length > 0) {
    return stored.events;
  }

  const seed = TRACEABILITY_SEED[id];
  return seed?.events ? [...seed.events] : [];
}

export function recordQrTraceabilityEvent(managementId, event) {
  const id = String(managementId ?? "").trim();
  if (!id || !event?.type || !event?.at) return null;

  const all = safeReadAll();
  const current = all[id] ?? { events: [] };
  const nextEvent = {
    source: "qr",
    ...event,
    at: event.at,
  };
  const events = [...(current.events ?? []), nextEvent];
  all[id] = { ...current, events };
  safeWriteAll(all);
  return nextEvent;
}

export function upsertQrTraceabilityEvents(managementId, events = []) {
  const id = String(managementId ?? "").trim();
  if (!id) return;
  const all = safeReadAll();
  all[id] = { ...(all[id] ?? {}), events: [...events] };
  safeWriteAll(all);
}
