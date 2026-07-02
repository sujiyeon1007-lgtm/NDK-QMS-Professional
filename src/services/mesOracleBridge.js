/**
 * MES Oracle Bridge — Renderer → Electron Main (window.titanMesOracle)
 * Browser-only: returns clear fallback message
 */

import {
  MES_ORACLE_BRIDGE_UNAVAILABLE_MESSAGE,
  MES_ORACLE_REAL_POC_VERSION,
} from "../config/mesOracleRealPoc";

function getBridge() {
  if (typeof window !== "undefined" && window.titanMesOracle) {
    return window.titanMesOracle;
  }
  return null;
}

export function isMesOracleBridgeAvailable() {
  return Boolean(getBridge()?.isAvailable?.());
}

export function getMesOracleBridgeVersion() {
  return MES_ORACLE_REAL_POC_VERSION;
}

/**
 * @returns {{ available: false, message: string } | { available: true, bridge: object }}
 */
export function requireMesOracleBridge() {
  const bridge = getBridge();
  if (!bridge) {
    return { available: false, message: MES_ORACLE_BRIDGE_UNAVAILABLE_MESSAGE };
  }
  return { available: true, bridge };
}

/**
 * @param {{ host?: string, port?: number | string, service?: string, user?: string, password?: string }} config
 */
export async function testConnection(config = {}) {
  const gate = requireMesOracleBridge();
  if (!gate.available) {
    return {
      ok: false,
      status: "fail",
      message: gate.message,
      bridgeRequired: true,
    };
  }
  return gate.bridge.testConnection(config);
}

/**
 * @param {string} queryId
 */
export async function runReadOnlyQuery(queryId) {
  const gate = requireMesOracleBridge();
  if (!gate.available) {
    return {
      ok: false,
      status: "fail",
      message: gate.message,
      rows: [],
      columns: [],
      rowCount: 0,
      bridgeRequired: true,
    };
  }
  return gate.bridge.runReadOnlyQuery(queryId);
}

export async function getOracleEnvironment() {
  const gate = requireMesOracleBridge();
  if (!gate.available) {
    return {
      available: false,
      message: gate.message,
    };
  }
  return gate.bridge.getOracleEnvironment();
}

export async function getPocLogs() {
  const gate = requireMesOracleBridge();
  if (!gate.available) {
    return [];
  }
  const logs = await gate.bridge.getPocLogs();
  return Array.isArray(logs) ? logs : [];
}
