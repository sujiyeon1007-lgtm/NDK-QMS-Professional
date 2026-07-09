/**
 * Sprint 10 Phase 3 — QR Engine Registry (master auto-generate + on-demand operations)
 * Reuses qrRegistryStore — no duplicate data engine.
 */
import { QR_ENGINE_GENERATOR_TYPES, QR_ENGINE_ROUTES } from "../config/qrEngineArchitecture";
import {
  buildEquipmentQrBrowserUrl,
  buildQrEntryBrowserUrl,
  buildLotQrBrowserUrl,
} from "../config/qrBrowserUrlConfig";
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

const GENERATOR_TYPE_LIST = Object.values(QR_ENGINE_GENERATOR_TYPES);
const GENERATOR_TYPE_BY_ID = Object.fromEntries(GENERATOR_TYPE_LIST.map((type) => [type.id, type]));
const GENERATOR_TYPE_BY_REGISTRY = Object.fromEntries(
  GENERATOR_TYPE_LIST.map((type) => [type.registryType, type])
);
const ENGINE_TYPES = new Set(GENERATOR_TYPE_LIST.map((type) => type.registryType));

let autoRegistrySynced = false;
let autoRegistrySyncSummary = {
  createdEquipment: 0,
  createdLots: 0,
  createdProducts: 0,
  createdMaterials: 0,
  createdWorkers: 0,
};
let registryRowsCache = null;
let registryCountsCache = null;
let autoRegistrySyncPromise = null;

export function invalidateQrEngineRegistryCache({ forceAutoSync = false } = {}) {
  registryRowsCache = null;
  registryCountsCache = null;
  if (forceAutoSync) autoRegistrySynced = false;
}

export function isQrEngineAutoRegistrySynced() {
  return autoRegistrySynced;
}

function runWhenIdle(callback) {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(callback, { timeout: 1200 });
  }
  return setTimeout(callback, 0);
}

export function scheduleQrEngineAutoRegistrySync({ force = false } = {}) {
  if (autoRegistrySynced && !force) return Promise.resolve(autoRegistrySyncSummary);
  if (autoRegistrySyncPromise && !force) return autoRegistrySyncPromise;

  autoRegistrySyncPromise = new Promise((resolve) => {
    runWhenIdle(() => {
      try {
        resolve(syncQrEngineAutoRegistry({ force }));
      } finally {
        autoRegistrySyncPromise = null;
      }
    });
  });
  return autoRegistrySyncPromise;
}

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

function getQrTypeMetaByGeneratorId(generatorTypeId) {
  return GENERATOR_TYPE_BY_ID[generatorTypeId] ?? QR_ENGINE_GENERATOR_TYPES.equipment;
}

function getQrTypeMetaByRegistryType(registryType) {
  return GENERATOR_TYPE_BY_REGISTRY[registryType] ?? null;
}

function buildSmartAccessId(qrType, target) {
  const key = String(target ?? "").trim();
  if (!key) return "";
  if (qrType === QR_REGISTRY_TYPES.EQUIPMENT) return buildEquipmentScanValue(key);
  if (qrType === QR_REGISTRY_TYPES.LOT) return buildLotScanValue(key);
  if (qrType === QR_REGISTRY_TYPES.INBOUND) return "NDK://INCOMING";
  if (qrType === QR_REGISTRY_TYPES.OUTBOUND) return "NDK://OUTGOING";
  if (qrType === QR_REGISTRY_TYPES.PRODUCT) return `NDK://PRODUCT/${key}`;
  if (qrType === QR_REGISTRY_TYPES.MATERIAL) return `NDK://MATERIAL/${key}`;
  if (qrType === QR_REGISTRY_TYPES.DOCUMENT) return `NDK://DOCUMENT/${key}`;
  if (qrType === QR_REGISTRY_TYPES.WORKER) return `NDK://WORKER/${key}`;
  return `NDK://QR/${qrType}/${key}`;
}

function buildWorkflowPayload({ qrType, target, title, browserUrl, smartAccessId }) {
  const meta = getQrTypeMetaByRegistryType(qrType);
  return [
    `QR 종류: ${meta?.labelKo ?? qrType}`,
    `대상: ${title || target}`,
    `업무 연결: ${browserUrl}`,
    `Smart Access ID: ${smartAccessId}`,
    "Project TITAN QR Engine",
  ].join("\n");
}

function normalizeOptionLabel(row, fallbackKey) {
  const code = row.code ?? row.partNo ?? row.id ?? fallbackKey;
  const name = row.name ?? row.productName ?? row.materialName ?? row.workerName ?? row.label ?? code;
  return `${code} · ${name}`;
}

function getStaticGeneratorOptions(generatorTypeId) {
  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.inbound.id) {
    return [{ value: "inbound-entry", label: "입고등록 QR · 간편 입고등록" }];
  }
  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.outbound.id) {
    return [{ value: "outbound-entry", label: "출고등록 QR · 출고등록/거래명세서" }];
  }
  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.document.id) {
    return [{ value: "quality-documents", label: "문서 QR · 품질 문서관리" }];
  }
  return [];
}

function getMasterQrTarget(row, fallbackKeys = []) {
  const candidates = [
    row?.qrUuid,
    ...fallbackKeys.map((key) => row?.[key]),
    row?.id,
  ];
  return candidates.map((value) => String(value ?? "").trim()).find(Boolean) ?? "";
}

function findMasterQrRow(categoryKey, target, fallbackKeys = []) {
  const key = String(target ?? "").trim();
  if (!key) return null;
  return (
    getMasterDataByCategory(categoryKey).find((row) => {
      const values = [row.qrUuid, row.id, ...fallbackKeys.map((field) => row[field])];
      return values.some((value) => String(value ?? "").trim() === key);
    }) ?? null
  );
}

function buildOptionFromMasterRow(row, fallbackKeys = []) {
  const value = getMasterQrTarget(row, fallbackKeys);
  if (!value) return null;
  return { value, label: normalizeOptionLabel(row, value) };
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

function buildLotMetadataByLotNo() {
  const map = new Map();
  getSessionProductionRecords().forEach((row) => {
    const lotNo = String(row.lotNo ?? "").trim();
    if (!lotNo || map.has(lotNo)) return;
    map.set(lotNo, {
      lotNo,
      companyName: String(row.companyName ?? row.company ?? "").trim(),
      partName: String(row.partName ?? row.itemName ?? "").trim(),
      partNo: String(row.partNo ?? "").trim(),
      equipmentName: String(row.equipmentName ?? row.equipment ?? row.processEquipment ?? "").trim(),
    });
  });
  return map;
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
  const key = String(equipmentCode ?? "").trim();
  if (!key) return { ok: false, message: "설비 코드가 없습니다." };

  const equipment = findMasterQrRow("equipment", key, ["code"]);
  if (!equipment) return { ok: false, message: "설비를 찾을 수 없습니다." };

  const qrTarget = getMasterQrTarget(equipment, ["code"]);
  const scanValue = buildEquipmentScanValue(qrTarget);
  const payload = buildEquipmentQrPayloadText(equipment);
  const existing = getQrByEntitySync(QR_REGISTRY_TYPES.EQUIPMENT, qrTarget);

  if (existing && !options.reissue) {
    if (existing.scanValue !== scanValue) {
      upsertQrRegistryEntry({ ...existing, scanValue, payload });
      invalidateQrEngineRegistryCache();
    }
    return { ok: true, record: getQrByEntitySync(QR_REGISTRY_TYPES.EQUIPMENT, qrTarget), created: false };
  }

  if (existing && options.reissue) {
    const result = regenerateQrRegistryEntry(existing.id, payload, getCurrentTitanUser(), {
      scanValue,
    });
    if (result.ok) invalidateQrEngineRegistryCache();
    return { ...result, created: false, reissued: true };
  }

  const result = createQrRegistryEntry(
    QR_REGISTRY_TYPES.EQUIPMENT,
    qrTarget,
    payload,
    getCurrentTitanUser(),
    { scanValue }
  );
  if (result.ok) invalidateQrEngineRegistryCache();
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
      invalidateQrEngineRegistryCache();
    }
    return { ok: true, record: getQrByEntitySync(QR_REGISTRY_TYPES.LOT, lot), created: false };
  }

  if (existing && options.reissue) {
    const result = regenerateQrRegistryEntry(existing.id, payload, getCurrentTitanUser(), {
      scanValue,
    });
    if (result.ok) invalidateQrEngineRegistryCache();
    return { ...result, created: false, reissued: true };
  }

  const result = createQrRegistryEntry(QR_REGISTRY_TYPES.LOT, lot, payload, getCurrentTitanUser(), {
    scanValue,
  });
  if (result.ok) invalidateQrEngineRegistryCache();
  return { ...result, created: Boolean(result.ok) };
}

function ensureWorkflowQrEntry(qrType, target, title, options = {}) {
  const key = String(target ?? "").trim();
  if (!key) return { ok: false, message: "QR UUID가 없습니다." };
  const meta = getQrTypeMetaByRegistryType(qrType);
  if (!meta) return { ok: false, message: "지원하지 않는 QR 종류입니다." };

  const browserUrl = buildQrEntryBrowserUrl(qrType, key);
  const smartAccessId = buildSmartAccessId(qrType, key);
  const payload = buildWorkflowPayload({
    qrType,
    target: key,
    title,
    browserUrl,
    smartAccessId,
  });
  const scanValue =
    qrType === QR_REGISTRY_TYPES.EQUIPMENT ? buildEquipmentScanValue(key) : smartAccessId;
  const existing = getQrByEntitySync(qrType, key);

  if (existing && !options.reissue) {
    if (existing.payload !== payload || existing.scanValue !== scanValue) {
      upsertQrRegistryEntry({ ...existing, payload, scanValue });
      invalidateQrEngineRegistryCache();
    }
    return { ok: true, record: getQrByEntitySync(qrType, key), created: false };
  }

  if (existing && options.reissue) {
    const result = regenerateQrRegistryEntry(existing.id, payload, getCurrentTitanUser(), {
      scanValue,
    });
    if (result.ok) invalidateQrEngineRegistryCache();
    return { ...result, created: false, reissued: true };
  }

  const result = createQrRegistryEntry(qrType, key, payload, getCurrentTitanUser(), { scanValue });
  if (result.ok) invalidateQrEngineRegistryCache();
  return { ...result, created: Boolean(result.ok) };
}

function resolveOnDemandRegistryType(entityType) {
  const type = normalizeQrServiceEntityType(entityType);
  if (type === "lot") return QR_REGISTRY_TYPES.LOT;
  if (type === "inbound" || type === "incoming") return QR_REGISTRY_TYPES.INBOUND;
  if (
    type === "outbound" ||
    type === "shipment" ||
    type === "delivery" ||
    type === "invoice" ||
    type === "transactionstatement"
  ) {
    return QR_REGISTRY_TYPES.OUTBOUND;
  }
  if (
    type === "document" ||
    type === "certificate" ||
    type === "purchaseorder" ||
    type === "releaseslip" ||
    type === "mtc" ||
    type === "inspectionstandard" ||
    type === "taxinvoice" ||
    type === "etc"
  ) {
    return QR_REGISTRY_TYPES.DOCUMENT;
  }
  return null;
}

export function ensureOnDemandQrEntry(entityType, target, options = {}) {
  const type = normalizeQrServiceEntityType(entityType);
  if (type === "lot") {
    const lotNo = typeof target === "object" ? target?.lotNo : target;
    return ensureLotQrEntry(lotNo, options);
  }

  const qrType = resolveOnDemandRegistryType(type);
  if (!qrType) return { ok: false, message: "지원하지 않는 QR 대상입니다." };

  const key = String(
    typeof target === "object"
      ? target?.qrUuid ?? target?.id ?? target?.documentNo ?? target?.managementId ?? target?.lotNo
      : target
  ).trim();
  const title = String(
    options.title ??
      (typeof target === "object"
        ? target?.title ?? target?.documentTitle ?? target?.name ?? target?.documentNo ?? key
        : key)
  ).trim();

  return ensureWorkflowQrEntry(qrType, key, title || key, options);
}

export function ensureQrForMasterRecord(categoryKey, row, options = {}) {
  if (!row) return { ok: false, message: "QR 생성 대상이 없습니다." };
  if (categoryKey === "equipment") {
    return ensureEquipmentQrEntry(getMasterQrTarget(row, ["code"]), options);
  }
  if (categoryKey === "products") {
    return ensureWorkflowQrEntry(
      QR_REGISTRY_TYPES.PRODUCT,
      getMasterQrTarget(row, ["code", "partNo"]),
      normalizeOptionLabel(row, row.qrUuid),
      options
    );
  }
  if (categoryKey === "materials") {
    return ensureWorkflowQrEntry(
      QR_REGISTRY_TYPES.MATERIAL,
      getMasterQrTarget(row, ["code", "name"]),
      normalizeOptionLabel(row, row.qrUuid),
      options
    );
  }
  if (categoryKey === "workers") {
    return ensureWorkflowQrEntry(
      QR_REGISTRY_TYPES.WORKER,
      getMasterQrTarget(row, ["code", "employeeNo", "name"]),
      normalizeOptionLabel(row, row.qrUuid),
      options
    );
  }
  return { ok: false, message: "자동 QR 생성 대상이 아닙니다." };
}

/** V1.0.1: Auto-generate missing QR entries from stable Master data only. */
export function syncQrEngineAutoRegistry({ force = false } = {}) {
  if (autoRegistrySynced && !force) return autoRegistrySyncSummary;

  repairRegistryScanValues();

  let createdEquipment = 0;
  let createdLots = 0;
  let createdProducts = 0;
  let createdMaterials = 0;
  let createdWorkers = 0;

  getMasterDataByCategory("equipment")
    .filter((row) => row.active !== false && hasText(getMasterQrTarget(row, ["code"])))
    .forEach((row) => {
      const result = ensureQrForMasterRecord("equipment", row);
      if (result.ok && result.created) createdEquipment += 1;
    });

  getMasterDataByCategory("products")
    .filter((row) => row.active !== false && hasText(getMasterQrTarget(row, ["code", "partNo"])))
    .forEach((row) => {
      const result = ensureQrForMasterRecord("products", row);
      if (result.ok && result.created) createdProducts += 1;
    });

  getMasterDataByCategory("materials")
    .filter((row) => row.active !== false && hasText(getMasterQrTarget(row, ["code", "name"])))
    .forEach((row) => {
      const result = ensureQrForMasterRecord("materials", row);
      if (result.ok && result.created) createdMaterials += 1;
    });

  getMasterDataByCategory("workers")
    .filter((row) => row.active !== false && hasText(getMasterQrTarget(row, ["code", "employeeNo", "name"])))
    .forEach((row) => {
      const result = ensureQrForMasterRecord("workers", row);
      if (result.ok && result.created) createdWorkers += 1;
    });

  collectUniqueLotNumbers().forEach((lotNo) => {
    const result = ensureLotQrEntry(lotNo);
    if (result.ok && result.created) createdLots += 1;
  });

  autoRegistrySynced = true;
  autoRegistrySyncSummary = {
    createdEquipment,
    createdLots,
    createdProducts,
    createdMaterials,
    createdWorkers,
  };
  return autoRegistrySyncSummary;
}

export function formatEngineDisplayQrId(qrType, index) {
  const meta = getQrTypeMetaByRegistryType(qrType);
  const prefix = meta?.displayPrefix ?? "QR";
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

export function listQrEngineRegistryRows({ autoSync = true } = {}) {
  if (autoSync) syncQrEngineAutoRegistry();
  if (registryRowsCache) return registryRowsCache;

  const rows = listQrRegistrySync()
    .slice()
    .filter((row) => ENGINE_TYPES.has(row.qrType))
    .sort((a, b) => {
      const aMeta = getQrTypeMetaByRegistryType(a.qrType);
      const bMeta = getQrTypeMetaByRegistryType(b.qrType);
      const typeCompare =
        GENERATOR_TYPE_LIST.findIndex((type) => type.registryType === aMeta?.registryType) -
        GENERATOR_TYPE_LIST.findIndex((type) => type.registryType === bMeta?.registryType);
      return typeCompare || String(a.entityKey).localeCompare(String(b.entityKey));
    });

  const equipmentByQrTarget = new Map(
    getMasterDataByCategory("equipment").map((row) => [getMasterQrTarget(row, ["code"]), row])
  );
  const lotMetaByLotNo = buildLotMetadataByLotNo();

  const mapRow = (row, index, qrType) => {
    const typeMeta = getQrTypeMetaByRegistryType(qrType);
    const smartAccessId = row.scanValue ?? row.payload;
    const browserUrl = buildQrEntryBrowserUrl(qrType, row.entityKey);
    const equipment = qrType === QR_REGISTRY_TYPES.EQUIPMENT ? equipmentByQrTarget.get(row.entityKey) : null;
    const lotMeta = qrType === QR_REGISTRY_TYPES.LOT ? lotMetaByLotNo.get(row.entityKey) : null;
    const connectionLabel =
      qrType === QR_REGISTRY_TYPES.EQUIPMENT
        ? equipment?.name ?? row.entityKey
        : qrType === QR_REGISTRY_TYPES.LOT
          ? [row.entityKey, lotMeta?.companyName, lotMeta?.partName].filter(Boolean).join(" · ")
          : row.entityKey;
    const createdAtLabel = formatTraceabilityDateTime(row.createdAt).slice(0, 10);
    return {
      id: row.id,
      displayQrId: formatEngineDisplayQrId(qrType, index),
      qrType,
      qrTypeLabel: typeMeta?.labelKo ?? qrType,
      target: row.entityKey,
      lotNo: lotMeta?.lotNo ?? (qrType === QR_REGISTRY_TYPES.LOT ? row.entityKey : ""),
      companyName: lotMeta?.companyName ?? "",
      partName: lotMeta?.partName ?? "",
      partNo: lotMeta?.partNo ?? "",
      equipmentName: equipment?.name ?? lotMeta?.equipmentName ?? "",
      connectionLabel,
      scanValue: browserUrl,
      smartAccessId,
      browserUrl,
      payload: row.payload,
      status: row.status === "regenerated" ? "Reissued" : "Active",
      statusKey: row.status,
      createdAt: row.createdAt,
      createdAtLabel,
      reissueCount: row.reissueCount ?? 0,
      printCount: row.printCount ?? 0,
      lastPrintedAt: row.lastPrintedAt,
      lastPrintedAtLabel: row.lastPrintedAt
        ? formatTraceabilityDateTime(row.lastPrintedAt).slice(0, 10)
        : "",
      registryRow: row,
      printTitle: equipment?.name ?? lotMeta?.partName ?? row.entityKey,
      printSubtitle: typeMeta?.labelKo ?? row.entityKey,
      printLotNo: qrType === QR_REGISTRY_TYPES.LOT ? row.entityKey : "",
      printEquipment: equipment?.name ?? lotMeta?.equipmentName ?? "",
      printEquipmentCode:
        equipment?.code ?? (qrType === QR_REGISTRY_TYPES.EQUIPMENT ? row.entityKey : ""),
      printShortPath:
        qrType === QR_REGISTRY_TYPES.EQUIPMENT
          ? QR_ENGINE_ROUTES.equipmentWork(equipment?.code ?? row.entityKey)
          : "",
      printCreatedAt: createdAtLabel,
    };
  };

  const indexByType = {};
  registryRowsCache = rows.map((row) => {
    const nextIndex = indexByType[row.qrType] ?? 0;
    indexByType[row.qrType] = nextIndex + 1;
    return mapRow(row, nextIndex, row.qrType);
  });
  return registryRowsCache;
}

export function getQrEngineRegistryRowByTarget(generatorTypeId, target, { autoSync = true } = {}) {
  const qrType = getQrTypeMetaByGeneratorId(generatorTypeId).registryType;
  const rows = listQrEngineRegistryRows({ autoSync }).filter((row) => row.qrType === qrType);
  return rows.find((row) => row.target === String(target ?? "").trim()) ?? null;
}

export function markQrEnginePrinted(ids = []) {
  const result = markQrRegistryPrinted(ids.filter(Boolean));
  if (result.ok) invalidateQrEngineRegistryCache();
  return result;
}

export function getEquipmentGeneratorOptions() {
  return getMasterDataByCategory("equipment")
    .filter((row) => row.active !== false && hasText(row.code))
    .map((row) => buildOptionFromMasterRow(row, ["code"]))
    .filter(Boolean)
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function getLotGeneratorOptions() {
  return collectUniqueLotNumbers().map((lotNo) => ({ value: lotNo, label: lotNo }));
}

export function getGeneratorOptions(generatorTypeId) {
  const meta = getQrTypeMetaByGeneratorId(generatorTypeId);
  if (meta.id === QR_ENGINE_GENERATOR_TYPES.equipment.id) return getEquipmentGeneratorOptions();
  if (meta.id === QR_ENGINE_GENERATOR_TYPES.lot.id) return getLotGeneratorOptions();
  if (meta.id === QR_ENGINE_GENERATOR_TYPES.product.id) {
    return getMasterDataByCategory("products")
      .filter((row) => row.active !== false)
      .map((row) => buildOptionFromMasterRow(row, ["code", "partNo"]))
      .filter(Boolean)
      .sort((a, b) => a.value.localeCompare(b.value));
  }
  if (meta.id === QR_ENGINE_GENERATOR_TYPES.material.id) {
    return getMasterDataByCategory("materials")
      .filter((row) => row.active !== false)
      .map((row) => buildOptionFromMasterRow(row, ["code", "name"]))
      .filter(Boolean)
      .sort((a, b) => a.value.localeCompare(b.value));
  }
  if (meta.id === QR_ENGINE_GENERATOR_TYPES.worker.id) {
    return getMasterDataByCategory("workers")
      .filter((row) => row.active !== false)
      .map((row) => buildOptionFromMasterRow(row, ["code", "employeeNo", "name"]))
      .filter(Boolean)
      .sort((a, b) => a.value.localeCompare(b.value));
  }
  return getStaticGeneratorOptions(meta.id);
}

export function buildGeneratorPreview(generatorTypeId, target) {
  const trimmed = String(target ?? "").trim();
  if (!trimmed) return null;
  const meta = getQrTypeMetaByGeneratorId(generatorTypeId);

  if (meta.id === QR_ENGINE_GENERATOR_TYPES.equipment.id) {
    const equipment = findMasterQrRow("equipment", trimmed, ["code"]);
    if (!equipment) return null;
    const qrTarget = getMasterQrTarget(equipment, ["code"]);
    return {
      generatorTypeId,
      target: qrTarget,
      scanValue: buildEquipmentQrBrowserUrl(qrTarget),
      smartAccessId: buildEquipmentScanValue(qrTarget),
      browserUrl: buildEquipmentQrBrowserUrl(qrTarget),
      payload: buildEquipmentQrPayloadText(equipment),
      title: equipment.name ?? qrTarget,
      subtitle: qrTarget,
    };
  }

  if (meta.id === QR_ENGINE_GENERATOR_TYPES.lot.id) {
    return {
      generatorTypeId,
      target: trimmed,
      scanValue: buildLotQrBrowserUrl(trimmed),
      smartAccessId: buildLotScanValue(trimmed),
      browserUrl: buildLotQrBrowserUrl(trimmed),
      payload: buildLotQrLabelPayload(trimmed),
      title: trimmed,
      subtitle: "LOT QR",
    };
  }

  const option = getGeneratorOptions(meta.id).find((row) => row.value === trimmed);
  const title = option?.label ?? trimmed;
  const browserUrl = buildQrEntryBrowserUrl(meta.registryType, trimmed);
  const smartAccessId = buildSmartAccessId(meta.registryType, trimmed);
  return {
    generatorTypeId,
    target: trimmed,
    scanValue: browserUrl,
    smartAccessId,
    browserUrl,
    payload: buildWorkflowPayload({
      qrType: meta.registryType,
      target: trimmed,
      title,
      browserUrl,
      smartAccessId,
    }),
    title,
    subtitle: meta.labelKo,
  };
}

export function generateOrReissueFromGenerator(generatorTypeId, target, { reissue = false } = {}) {
  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.equipment.id) {
    return ensureEquipmentQrEntry(target, { reissue });
  }
  if (generatorTypeId === QR_ENGINE_GENERATOR_TYPES.lot.id) {
    return ensureLotQrEntry(target, { reissue });
  }

  const meta = getQrTypeMetaByGeneratorId(generatorTypeId);
  if (!meta?.registryType) return { ok: false, message: "지원하지 않는 QR 종류입니다." };

  const preview = buildGeneratorPreview(generatorTypeId, target);
  if (!preview) return { ok: false, message: "QR 생성 대상을 찾을 수 없습니다." };

  const existing = getQrByEntitySync(meta.registryType, preview.target);
  if (existing && !reissue) {
    if (existing.scanValue !== preview.scanValue || existing.payload !== preview.payload) {
      upsertQrRegistryEntry({
        ...existing,
        scanValue: preview.scanValue,
        payload: preview.payload,
      });
      invalidateQrEngineRegistryCache();
    }
    return { ok: true, record: getQrByEntitySync(meta.registryType, preview.target), created: false };
  }

  if (existing && reissue) {
    const result = regenerateQrRegistryEntry(existing.id, preview.payload, getCurrentTitanUser(), {
      scanValue: preview.scanValue,
    });
    if (result.ok) invalidateQrEngineRegistryCache();
    return { ...result, created: false, reissued: true };
  }

  const result = createQrRegistryEntry(
    meta.registryType,
    preview.target,
    preview.payload,
    getCurrentTitanUser(),
    { scanValue: preview.scanValue }
  );
  if (result.ok) invalidateQrEngineRegistryCache();
  return { ...result, created: Boolean(result.ok) };
}

export function countEngineRegistryByType({ autoSync = true } = {}) {
  if (autoSync) syncQrEngineAutoRegistry();
  if (registryCountsCache) return registryCountsCache;

  const rows = listQrRegistrySync().filter((row) => ENGINE_TYPES.has(row.qrType));
  registryCountsCache = GENERATOR_TYPE_LIST.reduce(
    (acc, type) => {
      acc[type.id] = rows.filter((row) => row.qrType === type.registryType).length;
      return acc;
    },
    { total: rows.length }
  );
  return registryCountsCache;
}

function normalizeQrServiceEntityType(entityType) {
  return String(entityType ?? "").trim().toLowerCase();
}

function findQrServiceRegistryRow(uuid, registryType = null) {
  const key = String(uuid ?? "").trim();
  if (!key) return null;
  return (
    listQrRegistrySync(registryType).find((row) =>
      [row.id, row.entityKey, row.scanValue, row.payload].some((value) =>
        String(value ?? "").trim().includes(key)
      )
    ) ?? null
  );
}

export const QRService = {
  createIfNotExists(entityType, target, options = {}) {
    const type = normalizeQrServiceEntityType(entityType);
    if (type === "lot") {
      const lotNo = typeof target === "object" ? target?.lotNo : target;
      return ensureLotQrEntry(lotNo, { reissue: false, ...options });
    }

    const categoryKey =
      type === "product" ? "products" :
      type === "material" ? "materials" :
      type === "worker" ? "workers" :
      type;

    if (["products", "equipment", "materials", "workers"].includes(categoryKey)) {
      return ensureQrForMasterRecord(categoryKey, target, { reissue: false, ...options });
    }

    const onDemandType = resolveOnDemandRegistryType(type);
    if (onDemandType) {
      return ensureOnDemandQrEntry(type, target, { reissue: false, ...options });
    }

    return { ok: false, message: "지원하지 않는 QR 대상입니다." };
  },

  get(uuid, entityType = null) {
    const type = normalizeQrServiceEntityType(entityType);
    const registryType =
      type === "product" || type === "products" ? QR_REGISTRY_TYPES.PRODUCT :
      type === "equipment" ? QR_REGISTRY_TYPES.EQUIPMENT :
      type === "material" || type === "materials" ? QR_REGISTRY_TYPES.MATERIAL :
      type === "worker" || type === "workers" ? QR_REGISTRY_TYPES.WORKER :
      type === "lot" ? QR_REGISTRY_TYPES.LOT :
      resolveOnDemandRegistryType(type);
    return findQrServiceRegistryRow(uuid, registryType);
  },

  print(uuid, entityType = null) {
    const row = this.get(uuid, entityType);
    if (!row) return { ok: false, message: "출력할 QR을 찾을 수 없습니다." };
    return {
      ok: true,
      row,
      uuid: row.entityKey,
      scanValue: row.scanValue ?? row.payload,
      payload: row.payload,
      printTitle: row.entityKey,
      printSubtitle: row.qrType,
    };
  },

  regenerate(entityType, target, options = {}) {
    return this.createIfNotExists(entityType, target, { ...options, reissue: true });
  },

  invalidateCache(options) {
    invalidateQrEngineRegistryCache(options);
  },
};