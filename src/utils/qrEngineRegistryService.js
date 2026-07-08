/**
 * Sprint 10 Phase 3 — QR Engine Registry (auto-generate + reissue + list)
 * Reuses qrRegistryStore — no duplicate data engine.
 */
import { QR_ENGINE_GENERATOR_TYPES } from "../config/qrEngineArchitecture";
import { buildEquipmentCanonicalId } from "./equipmentQr";
import { buildEquipmentQrPayloadText } from "./qrManagementModel";
import { getMasterDataByCategory } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { getActualWorkRecords } from "./actualWorkRecordStore";
import { getKnowledgeRecords } from "./knowledgeRecordStore";
import { buildLotQrPayload } from "./ndkWorkflow";
import { getCurrentTitanUser } from "./titanHistorySession";
import { formatTraceabilityDateTime } from "./productTraceabilityModel";
import {
  QR_REGISTRY_TYPES,
  createQrRegistryEntry,
  getQrByEntitySync,
  listQrRegistrySync,
  markQrRegistryPrinted,
  regenerateQrRegistryEntry,
  upsertQrRegistryEntry,
} from "./qrRegistryStore";

const ENGINE_TYPES = new Set([QR_REGISTRY_TYPES.EQUIPMENT, QR_REGISTRY_TYPES.LOT]);

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

export function buildEquipmentScanValue(equipmentCode) {
  const code = String(equipmentCode ?? "").trim();
  if (!code) return "";
  return buildEquipmentCanonicalId(code) || `NDK://EQ/${code}`;
}

export function buildLotScanValue(lotNo) {
  const lot = String(lotNo ?? "").trim();
  if (!lot) return "";
  return buildLotQrPayload(lot) || lot;
}

export function buildLotQrLabelPayload(lotNo) {
  const lot = String(lotNo ?? "").trim();
  if (!lot) return "";
  return [`LOT.NO: ${lot}`, "Project TITAN QR Engine"].join("\n");
}

function collectUniqueLotNumbers() {
  const lots = new Set();
  getSessionProductionRecords().forEach((row) => {
    if (hasText(row.lotNo)) lots.add(String(row.lotNo).trim());
  });
  getActualWorkRecords().forEach((row) => {
    if (hasText(row.lotNo)) lots.add(String(row.lotNo).trim());
  });
  getKnowledgeRecords().forEach((row) => {
    if (hasText(row.lotNo)) lots.add(String(row.lotNo).trim());
  });
  return [...lots].sort((a, b) => a.localeCompare(b));
}

function repairRegistryScanValues() {
  listQrRegistrySync(QR_REGISTRY_TYPES.EQUIPMENT).forEach((row) => {
    const expected = buildEquipmentScanValue(row.entityKey);
    if (!expected || row.scanValue === expected) return;
    upsertQrRegistryEntry({ ...row, scanValue: expected });
  });

  listQrRegistrySync(QR_REGISTRY_TYPES.LOT).forEach((row) => {
    const expected = buildLotScanValue(row.entityKey);
    if (!expected || row.scanValue === expected) return;
    upsertQrRegistryEntry({ ...row, scanValue: expected });
  });
}

export function ensureEquipmentQrEntry(equipmentCode, options = {}) {
  const code = String(equipmentCode ?? "").trim();
  if (!code) return { ok: false, message: "설비 코드가 없습니다." };

  const equipment =
    getMasterDataByCategory("equipment").find((row) => row.code === code) ?? null;
  if (!equipment) return { ok: false, message: "설비를 찾을 수 없습니다." };

  const scanValue = buildEquipmentScanValue(code);
  const payload = buildEquipmentQrPayloadText(equipment);
  const existing = getQrByEntitySync(QR_REGISTRY_TYPES.EQUIPMENT, code);

  if (existing && !options.reissue) {
    if (existing.scanValue !== scanValue) {
      upsertQrRegistryEntry({ ...existing, scanValue, payload });
    }
    return { ok: true, record: getQrByEntitySync(QR_REGISTRY_TYPES.EQUIPMENT, code), created: false };
  }

  if (existing && options.reissue) {
    const result = regenerateQrRegistryEntry(existing.id, payload, getCurrentTitanUser(), {
      scanValue,
    });
    return { ...result, created: false, reissued: true };
  }

  const result = createQrRegistryEntry(
    QR_REGISTRY_TYPES.EQUIPMENT,
    code,
    payload,
    getCurrentTitanUser(),
    { scanValue }
  );
  return { ...result, created: Boolean(result.ok) };
}

export function ensureLotQrEntry(lotNo, options = {}) {
  const lot = String(lotNo ?? "").trim();
  if (!lot) return { ok: false, message: "LOT.NO가 없습니다." };

  const scanValue = buildLotScanValue(lot);
  const payload = buildLotQrLabelPayload(lot);
  const existing = getQrByEntitySync(QR_REGISTRY_TYPES.LOT, lot);

  if (existing && !options.reissue) {
    if (existing.scanValue !== scanValue) {
      upsertQrRegistryEntry({ ...existing, scanValue, payload });
    }
    return { ok: true, record: getQrByEntitySync(QR_REGISTRY_TYPES.LOT, lot), created: false };
  }

  if (existing && options.reissue) {
    const result = regenerateQrRegistryEntry(existing.id, payload, getCurrentTitanUser(), {
      scanValue,
    });
    return { ...result, created: false, reissued: true };
  }

  const result = createQrRegistryEntry(QR_REGISTRY_TYPES.LOT, lot, payload, getCurrentTitanUser(), {
    scanValue,
  });
  return { ...result, created: Boolean(result.ok) };
}

/** Auto-generate missing Equipment / LOT QR entries (PM Phase 3 default) */
export function syncQrEngineAutoRegistry() {
  repairRegistryScanValues();

  let createdEquipment = 0;
  let createdLots = 0;

  getMasterDataByCategory("equipment")
    .filter((row) => row.active !== false && hasText(row.code))
    .forEach((row) => {
      const result = ensureEquipmentQrEntry(row.code);
      if (result.ok && result.created) createdEquipment += 1;
    });

  collectUniqueLotNumbers().forEach((lotNo) => {
    const result = ensureLotQrEntry(lotNo);
    if (result.ok && result.created) createdLots += 1;
  });

  return { createdEquipment, createdLots };
}

export function formatEngineDisplayQrId(qrType, index) {
  const meta =
    qrType === QR_REGISTRY_TYPES.EQUIPMENT
      ? QR_ENGINE_GENERATOR_TYPES.equipment
      : qrType === QR_REGISTRY_TYPES.LOT
        ? QR_ENGINE_GENERATOR_TYPES.lot
        : null;
  const prefix = meta?.displayPrefix ?? "QR";
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

export function listQrEngineRegistryRows() {
  syncQrEngineAutoRegistry();

  const equipmentRows = listQrRegistrySync(QR_REGISTRY_TYPES.EQUIPMENT)
    .slice()
    .sort((a, b) => String(a.entityKey).localeCompare(String(b.entityKey)));
  const lotRows = listQrRegistrySync(QR_REGISTRY_TYPES.LOT)
    .slice()
    .sort((a, b) => String(a.entityKey).localeCompare(String(b.entityKey)));

  const mapRow = (row, index, qrType) => {
    const typeMeta =
      qrType === QR_REGISTRY_TYPES.EQUIPMENT
        ? QR_ENGINE_GENERATOR_TYPES.equipment
        : QR_ENGINE_GENERATOR_TYPES.lot;
    return {
      id: row.id,
      displayQrId: formatEngineDisplayQrId(qrType, index),
      qrType,
      qrTypeLabel: typeMeta.labelKo,
      target: row.entityKey,
      scanValue: row.scanValue ?? row.payload,
      payload: row.payload,
      status: row.status === "regenerated" ? "Active" : "Active",
      statusKey: row.status,
      createdAt: row.createdAt,
      createdAtLabel: formatTraceabilityDateTime(row.createdAt).slice(0, 10),
      reissueCount: row.reissueCount ?? 0,
      printCount: row.printCount ?? 0,
      lastPrintedAt: row.lastPrintedAt,
      registryRow: row,
      printTitle:
        qrType === QR_REGISTRY_TYPES.EQUIPMENT
          ? (getMasterDataByCategory("equipment").find((eq) => eq.code === row.entityKey)?.name ??
            row.entityKey)
          : row.entityKey,
      printSubtitle: row.entityKey,
    };
  };

  return [
    ...equipmentRows.map((row, index) => mapRow(row, index, QR_REGISTRY_TYPES.EQUIPMENT)),
    ...lotRows.map((row, index) => mapRow(row, index, QR_REGISTRY_TYPES.LOT)),
  ];
}

export function getQrEngineRegistryRowByTarget(generatorTypeId, target) {
  const qrType =
    generatorTypeId === QR_ENGINE_GENERATOR_TYPES.lot.id
      ? QR_REGISTRY_TYPES.LOT
      : QR_REGISTRY_TYPES.EQUIPMENT;
  const rows = listQrEngineRegistryRows().filter((row) => row.qrType === qrType);
  return rows.find((row) => row.target === String(target ?? "").trim()) ?? null;
}

export function markQrEnginePrinted(ids = []) {
  return markQrRegistryPrinted(ids.filter(Boolean));
}

export function getEquipmentGeneratorOptions() {
  syncQrEngineAutoRegistry();
  return getMasterDataByCategory("equipment")
    .filter((row) => row.active !== false && hasText(row.code))
    .map((row) => ({ value: row.code, label: `${row.code} · ${row.name ?? row.code}` }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function getLotGeneratorOptions() {
  syncQrEngineAutoRegistry();
  return collectUniqueLotNumbers().map((lotNo) => ({ value: lotNo, label: lotNo }));
}

export function buildGeneratorPreview(generatorTypeId, target) {
  const trimmed = String(target ?? "").trim();
  if (!trimmed) return null;

  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.equipment.id) {
    const equipment =
      getMasterDataByCategory("equipment").find((row) => row.code === trimmed) ?? null;
    if (!equipment) return null;
    return {
      generatorTypeId,
      target: trimmed,
      scanValue: buildEquipmentScanValue(trimmed),
      payload: buildEquipmentQrPayloadText(equipment),
      title: equipment.name ?? trimmed,
      subtitle: trimmed,
    };
  }

  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.lot.id) {
    return {
      generatorTypeId,
      target: trimmed,
      scanValue: buildLotScanValue(trimmed),
      payload: buildLotQrLabelPayload(trimmed),
      title: trimmed,
      subtitle: "LOT QR",
    };
  }

  return null;
}

export function generateOrReissueFromGenerator(generatorTypeId, target, { reissue = false } = {}) {
  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.equipment.id) {
    return ensureEquipmentQrEntry(target, { reissue });
  }
  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.lot.id) {
    return ensureLotQrEntry(target, { reissue });
  }
  return { ok: false, message: "지원하지 않는 QR 종류입니다." };
}

export function countEngineRegistryByType() {
  const rows = listQrEngineRegistryRows();
  return {
    equipment: rows.filter((row) => row.qrType === QR_REGISTRY_TYPES.EQUIPMENT).length,
    lot: rows.filter((row) => row.qrType === QR_REGISTRY_TYPES.LOT).length,
    total: rows.filter((row) => ENGINE_TYPES.has(row.qrType)).length,
  };
}