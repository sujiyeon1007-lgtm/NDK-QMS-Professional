/**
 * Sprint 10 Phase 2 — QR Engine Service
 */
import {
  QR_ENGINE_RECENT_SCANS_KEY,
  QR_ENGINE_ROUTES,
  QR_ENGINE_SCAN_STATS_KEY,
  QR_ENGINE_SCAN_TYPES,
} from "../config/qrEngineArchitecture";
import { resolveQrBrowserUrlPayload } from "../config/qrBrowserUrlConfig";
import { parseEquipmentFromQrPayload } from "./equipmentQr";
import { processEquipmentQrScan } from "./equipmentQrWorkflow";
import { getEquipmentList } from "./equipmentWorkflowService";
import { countEngineRegistryByType, syncQrEngineAutoRegistry } from "./qrEngineRegistryService";
import { parseLotFromQrPayload } from "./ndkWorkflow";

const LOT_PATTERN = /^LOT[-\dA-Z]/i;

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readJson(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return fallback;
}

function writeJson(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function resolveLotQr(payload) {
  const text = String(payload ?? "").trim();
  const lotNo = parseLotFromQrPayload(text);
  if (!hasText(lotNo)) return null;
  if (text.toUpperCase().startsWith("NDK|LOT|")) {
    return lotNo;
  }
  if (LOT_PATTERN.test(lotNo)) {
    return lotNo;
  }
  return null;
}

export function resolveQrScanType(payload) {
  const text = String(payload ?? "").trim();
  if (!text) return { type: "unknown", payload: text };

  const browserUrl = resolveQrBrowserUrlPayload(text);
  if (browserUrl?.type === "equipment" && browserUrl.equipmentId) {
    const equipmentResult = processEquipmentQrScan(browserUrl.equipmentId);
    if (equipmentResult.ok) {
      return {
        type: QR_ENGINE_SCAN_TYPES.equipment.id,
        payload: text,
        equipmentCode: equipmentResult.equipmentId,
        equipmentResult,
      };
    }
  }
  if (browserUrl?.type === "lot" && browserUrl.lotNo) {
    return {
      type: QR_ENGINE_SCAN_TYPES.lot.id,
      payload: text,
      lotNo: browserUrl.lotNo,
    };
  }

  const equipmentCode = parseEquipmentFromQrPayload(text);
  if (equipmentCode) {
    const equipmentResult = processEquipmentQrScan(text);
    if (equipmentResult.ok) {
      return {
        type: QR_ENGINE_SCAN_TYPES.equipment.id,
        payload: text,
        equipmentCode: equipmentResult.equipmentId,
        equipmentResult,
      };
    }
  }

  const lotNo = resolveLotQr(text);
  if (lotNo) {
    return {
      type: QR_ENGINE_SCAN_TYPES.lot.id,
      payload: text,
      lotNo,
    };
  }

  return { type: "unknown", payload: text };
}

function appendRecentScan(entry) {
  const list = readJson(QR_ENGINE_RECENT_SCANS_KEY, []);
  const next = [
    { ...entry, at: new Date().toISOString() },
    ...list.filter((row) => row.id !== entry.id),
  ].slice(0, 10);
  writeJson(QR_ENGINE_RECENT_SCANS_KEY, next);
}

function bumpScanStats(type) {
  const stats = readJson(QR_ENGINE_SCAN_STATS_KEY, { today: "", totalToday: 0, byType: {} });
  const key = todayKey();
  if (stats.today !== key) {
    stats.today = key;
    stats.totalToday = 0;
    stats.byType = {};
  }
  stats.totalToday += 1;
  stats.byType[type] = (stats.byType[type] ?? 0) + 1;
  writeJson(QR_ENGINE_SCAN_STATS_KEY, stats);
  return stats;
}

export function processQrEngineScan(payload) {
  const text = String(payload ?? "").trim();
  if (!text) {
    return { ok: false, message: "QR 코드를 입력하세요." };
  }

  const resolved = resolveQrScanType(text);

  if (resolved.type === QR_ENGINE_SCAN_TYPES.equipment.id && resolved.equipmentResult?.ok) {
    const equipmentId = resolved.equipmentResult.equipmentId;
    bumpScanStats("equipment");
    appendRecentScan({
      id: `eq-${equipmentId}-${Date.now()}`,
      type: "equipment",
      label: resolved.equipmentResult.equipment?.name ?? equipmentId,
      target: equipmentId,
      navigationPath: QR_ENGINE_ROUTES.equipmentWork(equipmentId),
    });
    return {
      ok: true,
      type: "equipment",
      typeLabel: QR_ENGINE_SCAN_TYPES.equipment.labelKo,
      equipmentId,
      equipment: resolved.equipmentResult.equipment,
      navigationPath: QR_ENGINE_ROUTES.equipmentWork(equipmentId),
      chargingPath: QR_ENGINE_ROUTES.chargingEquipment(equipmentId),
    };
  }

  if (resolved.type === QR_ENGINE_SCAN_TYPES.lot.id && resolved.lotNo) {
    bumpScanStats("lot");
    appendRecentScan({
      id: `lot-${resolved.lotNo}-${Date.now()}`,
      type: "lot",
      label: resolved.lotNo,
      target: resolved.lotNo,
      navigationPath: QR_ENGINE_ROUTES.lotLifecycle(resolved.lotNo),
    });
    return {
      ok: true,
      type: "lot",
      typeLabel: QR_ENGINE_SCAN_TYPES.lot.labelKo,
      lotNo: resolved.lotNo,
      navigationPath: QR_ENGINE_ROUTES.lotLifecycle(resolved.lotNo),
    };
  }

  return {
    ok: false,
    message:
      "지원하지 않는 QR입니다.\n설비 QR (NDK://EQ/코드) 또는 LOT QR (LOT-...)을 입력하세요.",
  };
}

export function getQrEngineRecentScans() {
  return readJson(QR_ENGINE_RECENT_SCANS_KEY, []);
}

export function getQrEngineScanStats() {
  const stats = readJson(QR_ENGINE_SCAN_STATS_KEY, { today: "", totalToday: 0, byType: {} });
  if (stats.today !== todayKey()) {
    return { today: todayKey(), totalToday: 0, byType: {} };
  }
  return stats;
}

function countUniqueLots() {
  return countEngineRegistryByType().lot;
}

export function buildQrEngineDashboard() {
  const stats = getQrEngineScanStats();
  const recentScans = getQrEngineRecentScans();
  const equipmentList = getEquipmentList();

  return {
    todayScanCount: stats.totalToday ?? 0,
    activeEquipmentCount: equipmentList.filter(
      (row) => row.status === "running" || row.status === "ready"
    ).length,
    equipmentQrCount: equipmentList.length,
    lotQrCount: countUniqueLots(),
    recentScans: recentScans.slice(0, 7),
    recentWork: recentScans
      .filter((row) => row.type === "equipment")
      .slice(0, 5)
      .map((row) => ({
        label: row.label,
        path: row.navigationPath,
        at: row.at,
      })),
  };
}