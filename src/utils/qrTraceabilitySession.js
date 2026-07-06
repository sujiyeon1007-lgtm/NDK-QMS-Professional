/**
 * Project TITAN V2.0 — QR Traceability 이벤트 (SessionStorage)
 * QR 스캔 · Smart Access → 작업 시작/종료 · 작업자 자동 기록
 */

import { TITAN_DEMO_QR_TRACEABILITY_SEED } from "../data/titanDemoSampleData";

const STORAGE_KEY = "project-titan-qr-traceability-v2";

/** @typedef {'incomingRegistered'|'productionStart'|'productionEnd'|'inspectionStart'|'inspectionEnd'|'certificateIssued'|'shipmentReady'|'shipmentCompleted'} QrTraceEventType */

/**
 * @typedef {object} QrTraceEvent
 * @property {QrTraceEventType} type
 * @property {string} at ISO datetime
 * @property {string} [worker]
 * @property {string} [equipment]
 * @property {string} [source] qr | manual | system
 */

/** V1.3 데모 — LOT 260701-3S1A 장입 동시작업 */
const TRACEABILITY_SEED = TITAN_DEMO_QR_TRACEABILITY_SEED;

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
