/**
 * Project TITAN V1.5 — TitanEventBus (Workflow 내부 이벤트)
 * Page는 Event 직접 처리 ❌ · Store Handler만 구독
 */

export class TitanEventBus {
  constructor() {
    /** @type {Map<string, Set<(payload: unknown) => unknown>>} */
    this.listeners = new Map();
  }

  /** @param {string} event @param {(payload: unknown) => unknown} handler */
  on(event, handler) {
    const key = String(event);
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(handler);
    return () => this.off(event, handler);
  }

  /** @param {string} event @param {(payload: unknown) => unknown} handler */
  off(event, handler) {
    const key = String(event);
    this.listeners.get(key)?.delete(handler);
  }

  /** @param {string} event @param {unknown} [payload] */
  emit(event, payload = {}) {
    const key = String(event);
    const handlers = this.listeners.get(key);
    if (!handlers?.size) {
      return { event: key, handled: 0, results: [] };
    }

    const results = [];
    handlers.forEach((handler) => {
      try {
        results.push(handler(payload));
      } catch (error) {
        results.push({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    return { event: key, handled: handlers.size, results };
  }

  clear() {
    this.listeners.clear();
  }
}

/** @type {TitanEventBus | null} */
let busInstance = null;

export function getTitanEventBus() {
  if (!busInstance) {
    busInstance = new TitanEventBus();
  }
  return busInstance;
}

export function resetTitanEventBusInstance() {
  busInstance?.clear();
  busInstance = null;
}

export default getTitanEventBus;
