/**
 * Titan DB Bridge — Renderer to Electron Main (window.titanDb)
 */
import { TITAN_DB_BRIDGE_UNAVAILABLE_MESSAGE } from "../config/titanDbBridgePolicy.js";

function getBridge() {
  if (typeof window !== "undefined" && window.titanDb) return window.titanDb;
  return null;
}

export function isTitanDbBridgeAvailable() {
  return Boolean(getBridge()?.isAvailable?.());
}

export function requireTitanDbBridge() {
  const bridge = getBridge();
  if (!bridge) return { available: false, message: TITAN_DB_BRIDGE_UNAVAILABLE_MESSAGE };
  return { available: true, bridge };
}

export async function initTitanDb() {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { ok: false, message: gate.message, bridgeRequired: true };
  return gate.bridge.init();
}

export async function titanDbMasterList(category) {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { ok: false, rows: [], message: gate.message, bridgeRequired: true };
  return gate.bridge.masterList(category);
}

export async function titanDbMasterReplaceAll(category, rows) {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { ok: false, count: 0, message: gate.message, bridgeRequired: true };
  return gate.bridge.masterReplaceAll(category, rows);
}

export async function titanDbGetStatus() {
  const gate = requireTitanDbBridge();
  if (!gate.available) return { available: false, message: gate.message };
  return gate.bridge.getStatus();
}
