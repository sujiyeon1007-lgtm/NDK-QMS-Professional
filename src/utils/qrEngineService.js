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
import { getEquipmentDetailSnapshot } from "./equipmentWorkflowService";
import { getMasterDataByCategory } from "./masterData";
import {
  countEngineRegistryByType,
  listQrEngineRegistryRows,
  syncQrEngineAutoRegistry,
} from "./qrEngineRegistryService";
import { getCurrentTitanUser } from "./titanHistorySession";
import { countEquipmentTodayWorkFinishes } from "./productionPlanLot";

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

function resolveEquipmentCodeFromQrTarget(target) {
  const key = String(target ?? "").trim();
  if (!key) return "";
  const master =
    getMasterDataByCategory("equipment").find((row) =>
      [row.qrUuid, row.code, row.id].some((value) => String(value ?? "").trim() === key)
    ) ?? null;
  return String(master?.code ?? key).trim();
}

function resolveSmartEntryQr(payload) {
  const text = String(payload ?? "").trim();
  const match = text.match(/^NDK:\/\/(INCOMING|OUTGOING|PRODUCT|MATERIAL|DOCUMENT|WORKER)(?:\/(.+))?$/i);
  if (!match) return null;
  const type = match[1].toLowerCase();
  const target = decodeURIComponent(String(match[2] ?? "").trim());
  if (type === "incoming") return { type: QR_ENGINE_SCAN_TYPES.inbound.id, target: "inbound-entry" };
  if (type === "outgoing") return { type: QR_ENGINE_SCAN_TYPES.outbound.id, target: "outbound-entry" };
  if (type === "product") return { type: QR_ENGINE_SCAN_TYPES.product.id, target };
  if (type === "material") return { type: QR_ENGINE_SCAN_TYPES.material.id, target };
  if (type === "document") return { type: QR_ENGINE_SCAN_TYPES.document.id, target: target || "quality-documents" };
  if (type === "worker") return { type: QR_ENGINE_SCAN_TYPES.worker.id, target };
  return null;
}

function getEntryNavigationPath(type, target, browserPath = "") {
  if (browserPath) return browserPath;
  if (type === QR_ENGINE_SCAN_TYPES.inbound.id) return QR_ENGINE_ROUTES.inboundEntry;
  if (type === QR_ENGINE_SCAN_TYPES.outbound.id) return QR_ENGINE_ROUTES.outboundEntry;
  if (type === QR_ENGINE_SCAN_TYPES.product.id) return QR_ENGINE_ROUTES.productEntry(target);
  if (type === QR_ENGINE_SCAN_TYPES.material.id) return QR_ENGINE_ROUTES.materialEntry(target);
  if (type === QR_ENGINE_SCAN_TYPES.document.id) return QR_ENGINE_ROUTES.documentEntry;
  if (type === QR_ENGINE_SCAN_TYPES.worker.id) return QR_ENGINE_ROUTES.workerEntry(target);
  return QR_ENGINE_ROUTES.dashboard;
}

export function resolveQrScanType(payload) {
  const text = String(payload ?? "").trim();
  if (!text) return { type: "unknown", payload: text };

  const browserUrl = resolveQrBrowserUrlPayload(text);
  if (browserUrl?.type === "equipment" && browserUrl.equipmentId) {
    const equipmentCode = resolveEquipmentCodeFromQrTarget(browserUrl.equipmentId);
    const equipmentResult = processEquipmentQrScan(equipmentCode);
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
  if (browserUrl && QR_ENGINE_SCAN_TYPES[browserUrl.type]) {
    return {
      type: browserUrl.type,
      payload: text,
      target: browserUrl.target ?? "",
      navigationPath: getEntryNavigationPath(browserUrl.type, browserUrl.target, browserUrl.path),
    };
  }

  const equipmentCode = parseEquipmentFromQrPayload(text);
  if (equipmentCode) {
    const resolvedEquipmentCode = resolveEquipmentCodeFromQrTarget(equipmentCode);
    const equipmentResult = processEquipmentQrScan(resolvedEquipmentCode);
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

  const smartEntry = resolveSmartEntryQr(text);
  if (smartEntry) {
    return {
      ...smartEntry,
      payload: text,
      navigationPath: getEntryNavigationPath(smartEntry.type, smartEntry.target),
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

export function getEquipmentScanLotChoices(equipmentId) {
  const detail = getEquipmentDetailSnapshot(equipmentId);
  if (!detail) return [];

  const choices = [];
  const seen = new Set();

  const pushChoice = (lotNo, meta = {}) => {
    const key = String(lotNo ?? "").trim();
    if (!key) return;
    const normalized = key.toUpperCase();
    if (seen.has(normalized)) return;
    seen.add(normalized);
    choices.push({
      lotNo: key,
      label: key,
      isActive: Boolean(meta.isActive),
      isChargeable: Boolean(meta.isChargeable),
      partName: meta.partName ?? "",
      companyName: meta.companyName ?? "",
    });
  };

  if (detail.currentLotNo) {
    pushChoice(detail.currentLotNo, { isActive: true });
  }

  (detail.chargeableLots ?? []).forEach((row) => {
    pushChoice(row?.lotNo ?? row, {
      isChargeable: true,
      partName: row?.partName ?? row?.itemName ?? "",
      companyName: row?.companyName ?? row?.company ?? "",
    });
  });

  (detail.displayLots ?? []).forEach((row) => {
    if (typeof row === "string") {
      pushChoice(row);
      return;
    }
    pushChoice(row?.lotNo, {
      partName: row?.partName ?? row?.itemName ?? "",
      companyName: row?.companyName ?? row?.company ?? "",
    });
  });

  return choices.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.lotNo.localeCompare(b.lotNo, "ko");
  });
}

export function completeEquipmentLotScan(equipmentId, lotNo, equipmentName = "") {
  const resolvedLot = String(lotNo ?? "").trim();
  if (!resolvedLot) {
    return { ok: false, message: "LOT.NO를 선택하세요." };
  }

  bumpScanStats("equipment");
  appendRecentScan({
    id: `eq-lot-${resolvedLot}-${Date.now()}`,
    type: "lot",
    label: resolvedLot,
    target: resolvedLot,
    equipmentId,
    equipmentName,
    navigationPath: QR_ENGINE_ROUTES.lotLifecycle(resolvedLot),
  });

  return {
    ok: true,
    type: "lot",
    typeLabel: QR_ENGINE_SCAN_TYPES.lot.labelKo,
    lotNo: resolvedLot,
    equipmentId,
    navigationPath: QR_ENGINE_ROUTES.lotLifecycle(resolvedLot),
  };
}

export function buildEquipmentWorkPanelSummary({ equipmentId, detail, activeSession } = {}) {
  const equipmentName =
    String(detail?.equipmentName ?? "").trim() ||
    String(equipmentId ?? "").trim() ||
    "-";
  const worker =
    String(activeSession?.operator ?? detail?.operator ?? getCurrentTitanUser() ?? "").trim() || "-";
  const startTime =
    String(activeSession?.startTime ?? detail?.startTime ?? "").trim() || "-";
  const expectedEndTime =
    String(activeSession?.expectedEndTime ?? detail?.expectedEndTime ?? "").trim() || "-";
  const todayWorkCount = countEquipmentTodayWorkFinishes(equipmentId);

  return {
    equipmentName,
    worker,
    startTime,
    expectedEndTime,
    todayWorkCount,
  };
}

export function processQrEngineScan(payload) {
  const text = String(payload ?? "").trim();
  if (!text) {
    return { ok: false, message: "QR 코드를 입력하세요." };
  }

  const resolved = resolveQrScanType(text);

  if (resolved.type === QR_ENGINE_SCAN_TYPES.equipment.id && resolved.equipmentResult?.ok) {
    const equipmentId = resolved.equipmentResult.equipmentId;
    const equipment = resolved.equipmentResult.equipment;
    const navigationPath = QR_ENGINE_ROUTES.equipmentWork(equipmentId);

    bumpScanStats("equipment");
    appendRecentScan({
      id: `eq-${equipmentId}-${Date.now()}`,
      type: "equipment",
      label: equipment?.name ?? equipmentId,
      target: equipmentId,
      navigationPath,
    });

    return {
      ok: true,
      type: "equipment",
      typeLabel: QR_ENGINE_SCAN_TYPES.equipment.labelKo,
      equipmentId,
      equipment,
      navigationPath,
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

  if (QR_ENGINE_SCAN_TYPES[resolved.type]?.labelKo && resolved.navigationPath) {
    bumpScanStats(resolved.type);
    appendRecentScan({
      id: `${resolved.type}-${resolved.target || "entry"}-${Date.now()}`,
      type: resolved.type,
      label: QR_ENGINE_SCAN_TYPES[resolved.type].labelKo,
      target: resolved.target || resolved.navigationPath,
      navigationPath: resolved.navigationPath,
    });
    return {
      ok: true,
      type: resolved.type,
      typeLabel: QR_ENGINE_SCAN_TYPES[resolved.type].labelKo,
      target: resolved.target,
      navigationPath: resolved.navigationPath,
    };
  }

  return {
    ok: false,
    message:
      "지원하지 않는 QR입니다.\n설비, LOT, 입고등록, 출고등록, 제품, 재질, 문서, 작업자 QR을 입력하세요.",
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

function resolveRegistryNavigationPath(row) {
  if (!row) return QR_ENGINE_ROUTES.dashboard;
  if (row.qrType === "lot") return QR_ENGINE_ROUTES.lotLifecycle(row.target);
  if (row.qrType === "equipment") return QR_ENGINE_ROUTES.equipmentWork(row.target);
  if (row.qrType === "inbound") return QR_ENGINE_ROUTES.inboundEntry;
  if (row.qrType === "outbound") return QR_ENGINE_ROUTES.outboundEntry;
  if (row.qrType === "product") return QR_ENGINE_ROUTES.productEntry(row.target);
  if (row.qrType === "material") return QR_ENGINE_ROUTES.materialEntry(row.target);
  if (row.qrType === "document") return QR_ENGINE_ROUTES.documentEntry;
  if (row.qrType === "worker") return QR_ENGINE_ROUTES.workerEntry(row.target);
  return QR_ENGINE_ROUTES.registry;
}

export function buildQrEngineDashboard() {
  syncQrEngineAutoRegistry();
  const stats = getQrEngineScanStats();
  const recentScans = getQrEngineRecentScans();
  const counts = countEngineRegistryByType({ autoSync: false });
  const registryRows = listQrEngineRegistryRows({ autoSync: false });

  const recentGenerated = registryRows
    .slice()
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    .slice(0, 7)
    .map((row) => ({
      id: `gen-${row.id}`,
      label: `${row.displayQrId} · ${row.connectionLabel || row.target}`,
      qrType: row.qrType,
      target: row.target,
      at: row.createdAt,
      navigationPath: resolveRegistryNavigationPath(row),
    }));

  const recentPrinted = registryRows
    .filter((row) => row.lastPrintedAt)
    .sort((a, b) => String(b.lastPrintedAt ?? "").localeCompare(String(a.lastPrintedAt ?? "")))
    .slice(0, 7)
    .map((row) => ({
      id: `print-${row.id}`,
      label: `${row.displayQrId} · ${row.connectionLabel || row.target}`,
      qrType: row.qrType,
      target: row.target,
      at: row.lastPrintedAt,
      printCount: row.printCount,
      navigationPath: QR_ENGINE_ROUTES.generator,
    }));

  return {
    totalQrCount: counts.total ?? 0,
    todayScanCount: stats.totalToday ?? 0,
    equipmentQrCount: counts.equipment ?? 0,
    lotQrCount: counts.lot ?? 0,
    recentScans: recentScans.slice(0, 7),
    recentGenerated,
    recentPrinted,
  };
}

export function resolveEquipmentWorkEntry(codeOrPayload, { recordScan = false } = {}) {
  const text = String(codeOrPayload ?? "").trim();
  if (!text) {
    return { ok: false, message: "\uC124\uBE44 \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694." };
  }

  const resolved = resolveQrScanType(text);
  if (resolved.type === QR_ENGINE_SCAN_TYPES.equipment.id && resolved.equipmentResult?.ok) {
    const equipmentId = resolved.equipmentResult.equipmentId;
    const navigationPath = QR_ENGINE_ROUTES.equipmentWork(equipmentId);
    if (recordScan) {
      appendRecentScan({
        id: `test-eq-${equipmentId}-${Date.now()}`,
        type: "equipment",
        label: `${resolved.equipmentResult.equipment?.name ?? equipmentId} (Test Mode)`,
        target: equipmentId,
        navigationPath,
        source: "test-mode",
      });
    }
    return {
      ok: true,
      equipmentId,
      equipment: resolved.equipmentResult.equipment,
      navigationPath,
      availableLots: resolved.equipmentResult.availableLots ?? [],
      detail: resolved.equipmentResult.detail,
    };
  }

  const direct = processEquipmentQrScan(text);
  if (direct.ok) {
    const navigationPath = QR_ENGINE_ROUTES.equipmentWork(direct.equipmentId);
    if (recordScan) {
      appendRecentScan({
        id: `test-eq-${direct.equipmentId}-${Date.now()}`,
        type: "equipment",
        label: `${direct.equipment?.name ?? direct.equipmentId} (Test Mode)`,
        target: direct.equipmentId,
        navigationPath,
        source: "test-mode",
      });
    }
    return {
      ok: true,
      equipmentId: direct.equipmentId,
      equipment: direct.equipment,
      navigationPath,
      availableLots: direct.availableLots ?? [],
      detail: direct.detail,
    };
  }

  return { ok: false, message: direct.message ?? "\uC124\uBE44\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." };
}