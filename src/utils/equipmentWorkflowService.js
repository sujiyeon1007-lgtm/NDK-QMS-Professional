/**
 * Project TITAN V1.5 — 설비 Workflow Foundation SSOT
 * HOME · 설비 장입관리 · MES 설비현황 공통 데이터
 *
 * Read path: TitanDataEngine.equipmentStore → ViewModel (Fallback: equipmentConfig)
 */

import {
  EQUIPMENT_LOT_PRODUCTS,
  EQUIPMENT_PROCESS_GROUP_ORDER,
  EQUIPMENT_RAW_LIST,
  EQUIPMENT_RUN_STATUS_SSOT,
  resolveEquipmentChargingButtons,
  resolveRc1ChargeableRowStatusLabel,
} from "../config/equipmentConfig";
import { getTitanDataEngine } from "../foundation/data";
import { masterRowToEquipmentRecord } from "../foundation/data/master/masterDataMappers";
import { getProductionProcessName, resolveProductDetailProcessCode } from "../config/productionProcessCodes";
import {
  addSessionProductionRecord,
  getSessionProductionRecords,
  updateSessionProductionRecord,
} from "./productionRecords";
import {
  generateEquipmentChargeLotNo,
} from "./productionLotNumber";
import { getPrintOutputDate } from "./titanPrintDates";
import { resolveRecordCurrentProcessDetail } from "./productProcessWorkflow";
import { resolveRemainingChargeQty, resolveChargeQty, findInProgressChargeEntry } from "./equipmentChargingQty";
import { getLotBundle } from "./lotBundleService";
import { notifyWorkflowDataRefresh } from "./titanWorkflowRefresh";
import { isProductionWaitingStageRecord, WORKFLOW_STATUS } from "./titanWorkflowStatus";

/** Product process detail -> equipment process group */
const PRODUCT_DETAIL_TO_EQUIPMENT_PROCESS = {
  "\uc774\uc628\uc9c8\ud654": "\uc774\uc628\uc9c8\ud654",
  "\uac00\uc2a4\uc9c8\ud654": "\uac00\uc2a4\uc9c8\ud654",
  "\uac00\uc2a4\uc5f0\uc9c8\ud654": "\uac00\uc2a4\uc5f0\uc9c8\ud654",
  "\uC5F0\uC9C8\uD654": "\uC5F0\uC9C8\uD654",
  "\uce68\ud0c4": "\uce68\ud0c4",
  "\ud0c8\ud0c4": "\uce68\ud0c4",
  "\uace0\uc8fc\ud30c": "\uace0\uc8fc\ud30c",
  "\uc9c8\ud654": "\uc774\uc628\uc9c8\ud654",
  "\uc9c8\ud654+\uace0\uc8fc\ud30c": "\uace0\uc8fc\ud30c",
  "\uc1fc\ud2b8": "\uae30\ud0c0",
  "\uc138\uccad": "\uae30\ud0c0",
  "\uc138\ucc29": "\uae30\ud0c0",
  "\uc138\ucc99": "\uae30\ud0c0",
  "\uae30\ud0c0": "\uae30\ud0c0",
};

export { resolveEquipmentChargingButtons };

function resolveRecordProductProcessDetail(record) {
  return resolveRecordCurrentProcessDetail(record);
}

function recordMatchesEquipmentProcess(record, equipmentProcess, equipmentProcessCode = "") {
  const targetCode = String(equipmentProcessCode ?? "").trim().toUpperCase();
  const targetLabel = String(equipmentProcess ?? "").trim();
  if (!targetCode && !targetLabel) return false;
  if (!record) return false;

  const productCode = resolveProductDetailProcessCode(resolveRecordProductProcessDetail(record));
  if (productCode && targetCode) {
    return productCode === targetCode;
  }

  const detail = resolveRecordProductProcessDetail(record);
  const mapped = detail ? PRODUCT_DETAIL_TO_EQUIPMENT_PROCESS[detail] : "";
  if (mapped && targetLabel && mapped === targetLabel) return true;

  const recordProcess = mapped || getProductionProcessName(record);
  return recordProcess === targetLabel || getProductionProcessName(record) === targetLabel;
}

function getProductionWaitingRecordsForEquipment(equipmentProcess, equipmentProcessCode = "") {
  const process = String(equipmentProcess ?? "").trim();
  const processCode = String(equipmentProcessCode ?? "").trim().toUpperCase();
  if (!process && !processCode) return [];

  return getSessionProductionRecords().filter(
    (record) =>
      isProductionWaitingStageRecord(record) &&
      recordMatchesEquipmentProcess(record, process, processCode) &&
      resolveRemainingChargeQty(record) > 0
  );
}

function hasProductionWaitingForEquipment(storeRecord) {
  if (!storeRecord?.process || storeRecord.maintenance) return false;
  return (
    getProductionWaitingRecordsForEquipment(storeRecord.process, storeRecord.processCode).length > 0
  );
}

function buildWaitingProductChargeableRows(equipment) {
  if (!equipment?.process || equipment.maintenance || equipment.status === "running") {
    return [];
  }

  return getProductionWaitingRecordsForEquipment(equipment.process, equipment.processCode)
    .map((record) => {
    const inboundQty = Number(record.inboundQty ?? record.qty) || 0;
    const remainingQty = resolveRemainingChargeQty(record);
    if (remainingQty <= 0) return null;
    return {
    id: record.id,
    lotNo: "",
    company: String(record.company ?? "").trim(),
    partName: String(record.partName ?? record.productName ?? "").trim() || "—",
    partNo: String(record.partNo ?? "").trim(),
    material: String(record.material ?? "").trim(),
    qty: remainingQty,
    inboundQty,
    remainingChargeQty: remainingQty,
    unit: record.unit ?? "EA",
    operator: String(record.registrar ?? "").trim(),
    workDate: String(record.workDate ?? record.incomingDate ?? getPrintOutputDate()).trim(),
    statusLabel: "생산대기",
    source: "production-waiting",
    sourceRecordId: record.id,
    managementId: String(record.mesManagementNo ?? record.id ?? "").trim(),
    needsLotCreation: true,
  };
  })
    .filter(Boolean);
}

function resolveSessionRecordForChargeableRow(row) {
  const sourceId = String(row.sourceRecordId ?? row.id ?? "").trim();
  const records = getSessionProductionRecords();
  if (sourceId) {
    const byId = records.find((record) => record.id === sourceId);
    if (byId) return byId;
    const byMes = records.find((record) => String(record.mesManagementNo ?? "").trim() === sourceId);
    if (byMes) return byMes;
  }
  const lotKey = String(row.lotNo ?? "").trim();
  if (lotKey) {
    return records.find((record) => String(record.lotNo ?? "").trim() === lotKey) ?? null;
  }
  return null;
}

function isChargeableRowVisibleForEquipment(row, equipment = {}) {
  const sessionRecord = resolveSessionRecordForChargeableRow(row);
  if (sessionRecord) {
    return (
      isProductionWaitingStageRecord(sessionRecord) &&
      resolveRemainingChargeQty(sessionRecord) > 0 &&
      recordMatchesEquipmentProcess(
        sessionRecord,
        equipment.process,
        equipment.processCode
      )
    );
  }
  return false;
}

function mergeChargeableRows(storedLots = [], waitingRows = [], equipment = {}) {
  const merged = storedLots.map((row) => ({ ...row }));
  const storedLotKeys = new Set(
    merged.map((row) => String(row.lotNo ?? "").trim().toUpperCase()).filter(Boolean)
  );

  waitingRows.forEach((row) => {
    const sourceId = String(row.sourceRecordId ?? "").trim();
    if (sourceId) {
      const storedIndex = merged.findIndex(
        (stored) => String(stored.sourceRecordId ?? stored.id ?? "").trim() === sourceId
      );
      if (storedIndex >= 0) {
        merged[storedIndex] = {
          ...merged[storedIndex],
          ...row,
          lotNo: row.needsLotCreation ? "" : row.lotNo || merged[storedIndex].lotNo || "",
        };
        return;
      }
    }

    const lotKey = String(row.lotNo ?? "").trim().toUpperCase();
    if (lotKey && storedLotKeys.has(lotKey)) return;
    merged.push({ ...row });
    if (lotKey) storedLotKeys.add(lotKey);
  });

  return merged
    .filter((row) => isChargeableRowVisibleForEquipment(row, equipment))
    .map((row) => ({
      ...row,
      statusLabel: resolveRc1ChargeableRowStatusLabel(row),
    }));
}

function normalizeEquipmentKey(value) {
  return String(value ?? "").trim();
}

function normalizeRunStatus(value) {
  return String(value ?? "").trim().toLowerCase();
}

function hasExplicitMaintenanceFlag(equipment) {
  return (
    equipment?.maintenanceMode === true ||
    normalizeRunStatus(equipment?.runStatus ?? equipment?.masterRunStatus) === "maintenance"
  );
}

function hasExplicitBreakdownFlag(equipment) {
  return (
    equipment?.breakdown === true ||
    equipment?.breakdownMode === true ||
    normalizeRunStatus(equipment?.runStatus ?? equipment?.masterRunStatus) === "breakdown"
  );
}

function hasChargedLot(equipment) {
  const lots = Array.isArray(equipment?.chargeableLots) ? equipment.chargeableLots : [];
  return lots.some((row) => String(row?.lotNo ?? "").trim());
}

function upsertLotStoreRecord(lotNo, patch) {
  const key = String(lotNo ?? "").trim();
  if (!key) return null;
  const dataEngine = getTitanDataEngine();
  const existing = dataEngine.lot.getByLotNo(key);
  if (existing) {
    return dataEngine.lot.update(key, { ...existing, ...patch, lotNo: key });
  }
  return dataEngine.lot.create({ lotNo: key, ...patch });
}

/** @param {Record<string, unknown>} row */
function buildLotItemFromChargeableRow(row, chargeQty = null) {
  const sourceRecordId = String(row?.sourceRecordId ?? row?.id ?? row?.managementId ?? "").trim();
  const qty = Number.isFinite(Number(chargeQty))
    ? Number(chargeQty)
    : Number(row?.chargeQty ?? row?.qty) || 0;
  return {
    sourceRecordId,
    managementId: String(row?.managementId ?? sourceRecordId).trim(),
    partNo: String(row?.partNo ?? "").trim(),
    partName: String(row?.partName ?? row?.productName ?? "").trim(),
    material: String(row?.material ?? "").trim(),
    company: String(row?.company ?? "").trim(),
    chargeQty: qty,
    qty,
    unit: row?.unit ?? "EA",
  };
}

function appendLotStoreItems(lotNo, items = [], patch = {}) {
  const key = String(lotNo ?? "").trim();
  if (!key || items.length === 0) return null;

  const dataEngine = getTitanDataEngine();
  const existing = dataEngine.lot.getByLotNo(key);
  const currentItems = Array.isArray(existing?.lotItems) ? [...existing.lotItems] : [];

  items.forEach((item) => {
    const sourceKey = String(item?.sourceRecordId ?? "").trim();
    if (!sourceKey) return;
    const index = currentItems.findIndex(
      (row) => String(row?.sourceRecordId ?? "").trim() === sourceKey
    );
    if (index >= 0) {
      currentItems[index] = { ...currentItems[index], ...item };
    } else {
      currentItems.push(item);
    }
  });

  const totalQty = currentItems.reduce(
    (sum, row) => sum + (Number(row?.chargeQty ?? row?.qty) || 0),
    0
  );

  return upsertLotStoreRecord(key, {
    ...(existing ?? {}),
    ...patch,
    lotItems: currentItems,
    quantity: totalQty,
    productCount: currentItems.length,
  });
}

/**
 * LOT-centric product label — "SCM440 외 2건"
 * @param {Array<{ material?: string, partName?: string, partNo?: string }>} items
 */
export function formatLotProductSummaryLabel(items = []) {
  const labels = [];
  const pushLabel = (value) => {
    const text = String(value ?? "").trim();
    if (!text || labels.includes(text)) return;
    labels.push(text);
  };

  items.forEach((row) => {
    pushLabel(row?.material || row?.partName || row?.partNo);
  });

  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0];
  return `${labels[0]} 외 ${labels.length - 1}건`;
}

/**
 * Resolve products charged under one LOT (runtime · not static demo map)
 * @param {string} lotNo
 * @param {{ runningSession?: object | null } | null} [equipment]
 */
export function getLotProducts(lotNo, equipment = null) {
  const key = String(lotNo ?? "").trim();
  if (!key) return [];

  const lotKey = key.toUpperCase();
  const records = getSessionProductionRecords();
  const fromRecords = records
    .filter((row) => String(row.lotNo ?? "").trim().toUpperCase() === lotKey)
    .map((row) => ({
      sourceRecordId: row.id,
      partName: String(row.partName ?? row.productName ?? "").trim(),
      partNo: String(row.partNo ?? "").trim(),
      material: String(row.material ?? "").trim(),
      company: String(row.company ?? "").trim(),
      chargeQty: Number(row.chargeQty ?? row.workQty ?? row.qty) || 0,
    }))
    .filter((row) => row.partName || row.partNo || row.material);

  if (fromRecords.length > 0) return fromRecords;

  try {
    const lotRow = getTitanDataEngine().lot.getByLotNo(key);
    const lotItems = Array.isArray(lotRow?.lotItems) ? lotRow.lotItems : [];
    if (lotItems.length > 0) {
      return lotItems.map((row) => ({
        sourceRecordId: row.sourceRecordId,
        partName: String(row.partName ?? "").trim(),
        partNo: String(row.partNo ?? "").trim(),
        material: String(row.material ?? "").trim(),
        company: String(row.company ?? "").trim(),
        chargeQty: Number(row.chargeQty ?? row.qty) || 0,
      }));
    }
  } catch {
    // partial engine in node verify
  }

  const session = equipment?.runningSession ?? null;
  const sessionLot = String(session?.lotNo ?? "").trim().toUpperCase();
  if (session && sessionLot === lotKey) {
    const lotItems = Array.isArray(session.lotItems) ? session.lotItems : [];
    if (lotItems.length > 0) {
      return lotItems.map((row) => ({
        sourceRecordId: row.sourceRecordId,
        partName: String(row.partName ?? "").trim(),
        partNo: String(row.partNo ?? "").trim(),
        material: String(row.material ?? "").trim(),
        company: String(row.company ?? "").trim(),
        chargeQty: Number(row.chargeQty ?? row.qty) || 0,
      }));
    }

    const targets = Array.isArray(session.chargeTargets) ? session.chargeTargets : [];
    if (targets.length > 0) {
      return targets
        .map((target) => {
          const sourceId = String(target?.sourceRecordId ?? "").trim();
          const record = sourceId
            ? records.find((row) => String(row.id ?? "").trim() === sourceId)
            : null;
          return {
            sourceRecordId: sourceId,
            partName: String(record?.partName ?? record?.productName ?? "").trim(),
            partNo: String(record?.partNo ?? "").trim(),
            material: String(record?.material ?? "").trim(),
            company: String(record?.company ?? "").trim(),
            chargeQty: Number(target?.chargeQty) || 0,
          };
        })
        .filter((row) => row.partName || row.partNo || row.material);
    }
  }

  const legacy = EQUIPMENT_LOT_PRODUCTS[key] ?? [];
  return legacy.map((row) => ({ ...row }));
}

/**
 * Normalize runningSession — merge chargeTargets into lotItems on read
 * @param {object | null | undefined} session
 */
export function normalizeRunningSession(session) {
  if (!session) return null;

  const lotItems = Array.isArray(session.lotItems) ? [...session.lotItems] : [];
  const targets = Array.isArray(session.chargeTargets) ? session.chargeTargets : [];
  const records = getSessionProductionRecords();

  if (lotItems.length === 0 && targets.length > 0) {
    targets.forEach((target) => {
      const sourceId = String(target?.sourceRecordId ?? "").trim();
      const record = sourceId
        ? records.find((row) => String(row.id ?? "").trim() === sourceId)
        : null;
      lotItems.push(
        buildLotItemFromChargeableRow(
          {
            ...record,
            sourceRecordId: sourceId,
            chargeQty: target.chargeQty,
          },
          target.chargeQty
        )
      );
    });
  }

  const totalChargeQty =
    Number(session.chargeQty) ||
    lotItems.reduce((sum, row) => sum + (Number(row.chargeQty ?? row.qty) || 0), 0) ||
    targets.reduce((sum, row) => sum + (Number(row.chargeQty) || 0), 0) ||
    0;

  return {
    ...session,
    lotItems,
    chargeTargets: targets.length > 0 ? targets : lotItems.map((row) => ({
      lotNo: session.lotNo,
      sourceRecordId: row.sourceRecordId,
      chargeQty: row.chargeQty ?? row.qty,
    })),
    chargeQty: totalChargeQty,
    productSummary: formatLotProductSummaryLabel(lotItems),
  };
}

function buildManualProductionId(lotNo) {
  const safeLot = String(lotNo ?? "").replace(/[^A-Za-z0-9-]/g, "");
  return `MANUAL-${safeLot || Date.now()}`;
}

function readEquipmentStoreList() {
  try {
    const list = getTitanDataEngine()?.equipment?.list?.() ?? [];
    return list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

function hasActiveEquipmentRunningRecord(runningSession, equipmentId = "") {
  if (!runningSession) return false;

  const eqKey = String(equipmentId ?? runningSession?.equipmentId ?? "").trim();
  const lotKey = String(runningSession.lotNo ?? "").trim().toUpperCase();
  const productionId = String(runningSession.productionId ?? "").trim();
  const sourceRecordId = String(runningSession.sourceRecordId ?? "").trim();

  if (!eqKey && !lotKey && !productionId) return false;

  try {
    const dataEngine = getTitanDataEngine();
    if (productionId) {
      const production = dataEngine.production.getById(productionId);
      if (production && !production.endTime) {
        if (!eqKey || String(production.equipmentId ?? "").trim() === eqKey) {
          return true;
        }
      }
    }
  } catch {
    /* production store unavailable */
  }

  const records = getSessionProductionRecords();
  const inbound =
    (sourceRecordId
      ? records.find((row) => String(row.id ?? "").trim() === sourceRecordId)
      : null) ??
    (lotKey
      ? records.find((row) => String(row.lotNo ?? "").trim().toUpperCase() === lotKey)
      : null);

  if (inbound && eqKey) {
    const activeEntry = findInProgressChargeEntry(inbound, {
      equipmentId: eqKey,
      lotNo: runningSession.lotNo,
      productionId,
    });
    if (activeEntry) return true;
  }

  if (productionId && eqKey) {
    try {
      const dataEngine = getTitanDataEngine();
      const openProduction = dataEngine.production
        .list()
        .find(
          (row) =>
            String(row.productionId ?? "").trim() === productionId &&
            !row.endTime &&
            String(row.equipmentId ?? "").trim() === eqKey
        );
      if (openProduction) return true;
    } catch {
      /* ignore */
    }
  }

  return false;
}

function reconcileEquipmentStoreRecord(storeRecord) {
  const equipmentKey = String(storeRecord.equipmentId ?? storeRecord.code ?? "").trim();
  let runningSession = storeRecord.runningSession ?? null;
  const chargeableLots = Array.isArray(storeRecord.chargeableLots)
    ? storeRecord.chargeableLots.map((row) => ({ ...row }))
    : [];

  if (runningSession && !hasActiveEquipmentRunningRecord(runningSession, equipmentKey)) {
    runningSession = null;
  }

  const status = computeEquipmentRunStatus({
    ...storeRecord,
    runningSession,
    chargeableLots,
  });
  const chargedLotNo = chargeableLots.find((row) => String(row?.lotNo ?? "").trim())?.lotNo ?? null;

  return {
    ...storeRecord,
    runningSession,
    chargeableLots,
    status,
    maintenance: status === "maintenance",
    currentLot: runningSession?.lotNo ?? chargedLotNo,
    workflowState: runningSession ? storeRecord.workflowState : undefined,
  };
}

/**
 * Boot/reconcile — clear orphan runningSession per equipment; preserve valid concurrent sessions.
 */
export function reconcileAllEquipmentSessionsInStore() {
  try {
    const dataEngine = getTitanDataEngine();
    const list = dataEngine.equipment.list();
    if (!list.length) return { reconciled: 0 };

    let reconciled = 0;
    list.forEach((storeRecord) => {
      const equipmentKey = String(storeRecord.equipmentId ?? storeRecord.code ?? "").trim();
      const next = reconcileEquipmentStoreRecord(storeRecord);
      const changed =
        Boolean(storeRecord.runningSession) !== Boolean(next.runningSession) ||
        storeRecord.status !== next.status ||
        Boolean(storeRecord.maintenance) !== Boolean(next.maintenance) ||
        storeRecord.currentLot !== next.currentLot;
      if (changed || storeRecord.runningSession !== next.runningSession) {
        dataEngine.equipment.update(equipmentKey, {
          runningSession: next.runningSession,
          status: next.status,
          maintenance: next.maintenance,
          currentLot: next.currentLot,
          workflowState: next.workflowState,
        });
        reconciled += 1;
      }
    });
    return { reconciled };
  } catch {
    return { reconciled: 0 };
  }
}

/**
 * @param {import("../config/equipmentConfig").EquipmentRawRecord} equipment
 * @returns {import("../config/equipmentConfig").EquipmentRunStatus}
 */
export function computeEquipmentRunStatus(equipment) {
  if (!equipment) return "idle";
  if (hasExplicitBreakdownFlag(equipment)) return "breakdown";
  if (hasExplicitMaintenanceFlag(equipment)) return "maintenance";
  if (equipment.runningSession) return "running";
  if (hasChargedLot(equipment)) return "ready";
  return "idle";
}

export function getEquipmentRunStatusLabel(status) {
  const key = String(status ?? "idle").trim();
  if (key === "ready") return "장입완료/작업준비";
  if (key === "running") return "열처리중";
  if (key === "maintenance") return "점검중";
  if (key === "breakdown") return "고장";
  return "비가동/대기";
}

/**
 * @param {Record<string, unknown>} storeRecord
 */
function buildEquipmentViewModelFromStore(storeRecord) {
  const reconciled = reconcileEquipmentStoreRecord(storeRecord);
  const status = /** @type {import("../config/equipmentConfig").EquipmentRunStatus} */ (
    computeEquipmentRunStatus(reconciled)
  );
  const runningSession = reconciled.runningSession ?? null;
  const storedChargeableLots = Array.isArray(reconciled.chargeableLots)
    ? reconciled.chargeableLots.map((row) => ({ ...row }))
    : [];
  const chargeableLots = mergeChargeableRows(
    storedChargeableLots,
    buildWaitingProductChargeableRows({
      process: reconciled.process,
      processCode: reconciled.processCode,
      maintenance: Boolean(reconciled.maintenance),
      status,
    }),
    {
      process: reconciled.process,
      processCode: reconciled.processCode,
    }
  );
  const displayLots = runningSession
    ? [runningSession.lotNo]
    : chargeableLots.map((row) => row.lotNo);

  return {
    id: storeRecord.equipmentId,
    name: storeRecord.equipmentName,
    process: storeRecord.process,
    processCode: storeRecord.processCode ?? "",
    code: storeRecord.code,
    maintenance: Boolean(reconciled.maintenance),
    maintenanceMode: Boolean(reconciled.maintenanceMode),
    runStatus: reconciled.runStatus,
    breakdown: Boolean(reconciled.breakdown),
    smartAccessId: reconciled.smartAccessId,
    status,
    runningSession: runningSession ? { ...runningSession } : null,
    chargeableLots,
    displayLots,
    chargingButtons: resolveEquipmentChargingButtons(status),
  };
}

/**
 * @param {import("../config/equipmentConfig").EquipmentRawRecord} equipment
 */
export function buildEquipmentViewModel(equipment) {
  const status = computeEquipmentRunStatus(equipment);

  return {
    ...equipment,
    status,
    runningSession: null,
    chargeableLots: [],
    displayLots: [],
    chargingButtons: resolveEquipmentChargingButtons(status),
  };
}

export function getEquipmentList() {
  reconcileAllEquipmentSessionsInStore();
  const storeList = readEquipmentStoreList();
  if (storeList?.length) {
    return storeList.map((row) => buildEquipmentViewModelFromStore(row));
  }
  return [];
}

function buildEquipmentViewModelFromRaw(raw) {
  const base = buildEquipmentViewModel(raw);
  const chargeableLots = mergeChargeableRows(
    [],
    buildWaitingProductChargeableRows({
      process: raw.process,
      processCode: "",
      maintenance: Boolean(raw.maintenance),
      status: base.status,
    }),
    { process: raw.process, processCode: "" }
  );
  const status = computeEquipmentRunStatus({
    ...raw,
    chargeableLots,
    runningSession: base.runningSession,
  });

  return {
    ...base,
    status,
    chargeableLots,
    displayLots: chargeableLots.map((row) => row.lotNo),
    chargingButtons: resolveEquipmentChargingButtons(status),
  };
}

export function getEquipmentById(equipmentId) {
  const key = String(equipmentId ?? "").trim();
  if (!key) return null;

  const storeList = readEquipmentStoreList();
  if (storeList?.length) {
    const storeRecord = storeList.find((row) => row.equipmentId === key || row.code === key);
    if (storeRecord) return buildEquipmentViewModelFromStore(storeRecord);
  }

  const raw = EQUIPMENT_RAW_LIST.find((item) => item.id === key);
  return raw ? buildEquipmentViewModelFromRaw(raw) : null;
}

export function getDefaultEquipmentId() {
  const storeList = readEquipmentStoreList();
  if (storeList?.length) return storeList[0].equipmentId;
  return EQUIPMENT_RAW_LIST[0]?.id ?? null;
}

export function getRunningSession(equipmentId) {
  const equipment = getEquipmentById(equipmentId);
  if (!equipment?.runningSession) return null;

  return {
    ...equipment.runningSession,
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    partName: getLotPrimaryPartName(equipment.runningSession.lotNo),
  };
}

/** @deprecated getRunningSession — QR Sprint 1 alias */
export function getActiveChargingSession(equipmentId) {
  return getRunningSession(equipmentId);
}

export function getChargeableLots(equipmentId) {
  const equipment = getEquipmentById(equipmentId);
  if (
    !equipment ||
    equipment.status === "running" ||
    equipment.status === "maintenance" ||
    equipment.status === "breakdown"
  ) {
    return [];
  }
  return equipment.chargeableLots.map((row) => ({ ...row }));
}

/**
 * 장입 UI — 자동 LOT 번호 Preview (편집 · 복원용)
 * @param {string} equipmentId
 * @param {Record<string, unknown>} [chargeableRow]
 */
export function previewAutoChargeLotNumber(equipmentId, chargeableRow = {}) {
  const equipmentKey = normalizeEquipmentKey(equipmentId);
  const equipment = getEquipmentById(equipmentKey);
  const workDate = getPrintOutputDate();
  const existingLotNo = String(chargeableRow?.lotNo ?? "").trim();
  return generateEquipmentChargeLotNo({
    equipmentId: equipmentKey,
    equipment,
    workDate,
    existingLotNo,
  });
}

/**
 * 장입 시작 전 LOT 자동 생성 (생산대기 제품 · LOT 미생성)
 * chargeableRow.lotNo — 사용자 편집값 (예외 허용)
 * @param {string} equipmentId
 * @param {Record<string, unknown>} [chargeableRow]
 */
export function ensureLotBeforeCharging(equipmentId, chargeableRow = {}) {
  const equipmentKey = normalizeEquipmentKey(equipmentId);
  const sourceRecordId = String(chargeableRow?.sourceRecordId ?? chargeableRow?.id ?? "").trim();
  const needsLot =
    Boolean(chargeableRow?.needsLotCreation) ||
    chargeableRow?.source === "production-waiting" ||
    Boolean(sourceRecordId);

  const existingLot = String(chargeableRow?.lotNo ?? "").trim();
  if (existingLot && !needsLot) {
    if (sourceRecordId) {
      const sessionRecord = getSessionProductionRecords().find((row) => row.id === sourceRecordId);
      if (sessionRecord && !String(sessionRecord.lotNo ?? "").trim()) {
        const equipmentSnapshot = getEquipmentById(equipmentKey);
        updateSessionProductionRecord(sourceRecordId, {
          lotNo: existingLot,
          equipment: equipmentSnapshot?.name ?? equipmentSnapshot?.equipmentName ?? equipmentKey,
          equipmentId: equipmentKey,
          workDate: String(chargeableRow?.workDate ?? getPrintOutputDate()).trim(),
          qrGenerated: true,
          lotAutoGeneratedAt: new Date().toISOString(),
        });
      }
    }
    return { ok: true, lotNo: existingLot, chargeableRow: { ...chargeableRow, lotNo: existingLot } };
  }

  if (!needsLot && !existingLot) {
    return { ok: false, message: "장입할 LOT를 선택하세요." };
  }

  const equipment = getEquipmentById(equipmentKey);
  if (!equipment) {
    return { ok: false, message: "설비 정보를 찾을 수 없습니다." };
  }

  const sessionRecordBeforeCreate = sourceRecordId
    ? getSessionProductionRecords().find((row) => row.id === sourceRecordId)
    : null;
  const hasCompletedCharge = (sessionRecordBeforeCreate?.chargeHistory ?? []).some(
    (entry) => entry?.status === "completed"
  );
  const isRechargeProduct =
    Boolean(sessionRecordBeforeCreate?.awaitingNextProcessStep) || hasCompletedCharge;
  const incomingLot = String(chargeableRow?.lotNo ?? "").trim();
  const sessionLot = String(sessionRecordBeforeCreate?.lotNo ?? "").trim();
  const userProvidedLot =
    incomingLot && (!sessionLot || incomingLot !== sessionLot) ? incomingLot : "";
  const partialLotReuse =
    Boolean(incomingLot) &&
    Boolean(sessionLot) &&
    incomingLot === sessionLot &&
    !isRechargeProduct;

  const workDate = getPrintOutputDate();
  const baselineAutoLotNo = previewAutoChargeLotNumber(equipmentKey, {
    ...(isRechargeProduct ? { ...chargeableRow, lotNo: "" } : chargeableRow),
    lotNo: "",
    needsLotCreation: true,
  });
  const lotSeed = isRechargeProduct ? { ...chargeableRow, lotNo: userProvidedLot } : chargeableRow;
  const autoGeneratedLotNo = previewAutoChargeLotNumber(equipmentKey, {
    ...lotSeed,
    lotNo: userProvidedLot,
    needsLotCreation: true,
  });
  const lotNo =
    userProvidedLot || (isRechargeProduct ? autoGeneratedLotNo : existingLot || autoGeneratedLotNo);

  if (!lotNo) {
    return { ok: false, message: "LOT 번호를 생성할 수 없습니다." };
  }

  if (existingLot && !isRechargeProduct) {
    const sessionRecord = sessionRecordBeforeCreate;
    if (sessionRecord?.lotNo?.trim() === lotNo) {
      return {
        ok: true,
        lotNo,
        autoGeneratedLotNo,
        chargeableRow: { ...chargeableRow, lotNo },
      };
    }
  }

  const result = createManualChargeableLot({
    equipmentId: equipmentKey,
    lotNo,
    workDate,
    sourceRecordId,
    managementId: String(chargeableRow?.managementId ?? sourceRecordId).trim(),
    company: String(chargeableRow?.company ?? "").trim(),
    productName: String(chargeableRow?.partName ?? "").trim(),
    partNo: String(chargeableRow?.partNo ?? "").trim(),
    material: String(chargeableRow?.material ?? "").trim(),
    qty: chargeableRow?.qty,
    operator: String(chargeableRow?.operator ?? "").trim(),
    note: String(chargeableRow?.note ?? "").trim(),
    source: "equipment-charging",
  });

  if (!result.ok) return result;

  return {
    ok: true,
    lotNo: result.lotNo,
    chargeableRow: result.chargeableRow,
    productionId: result.productionId,
    autoGeneratedLotNo,
    autoCreated: !incomingLot || lotNo === baselineAutoLotNo || lotNo === autoGeneratedLotNo,
    userEdited: Boolean(incomingLot && incomingLot !== baselineAutoLotNo && !partialLotReuse),
  };
}

/**
 * Multi-select batch — ONE shared LOT for all selected inbound products.
 * @param {string} equipmentId
 * @param {Record<string, unknown>[]} chargeableRows
 * @param {string} [draftLotNo]
 */
export function ensureSharedBatchLot(equipmentId, chargeableRows = [], draftLotNo = "") {
  const rows = Array.isArray(chargeableRows) ? chargeableRows.filter(Boolean) : [];
  if (rows.length === 0) {
    return { ok: false, message: "장입할 제품을 선택하세요." };
  }

  const equipmentKey = normalizeEquipmentKey(equipmentId);
  const sharedCandidate =
    String(draftLotNo ?? "").trim() ||
    previewAutoChargeLotNumber(equipmentKey, rows[0]) ||
    "";

  const firstEnsured = ensureLotBeforeCharging(equipmentKey, {
    ...rows[0],
    lotNo: sharedCandidate,
    needsLotCreation: true,
  });
  if (!firstEnsured.ok) return firstEnsured;

  const sharedLotNo = String(firstEnsured.lotNo ?? "").trim();
  const prepared = [
    {
      ...firstEnsured,
      chargeableRow: { ...(firstEnsured.chargeableRow ?? rows[0]), lotNo: sharedLotNo },
    },
  ];

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const sourceRecordId = String(row?.sourceRecordId ?? row?.id ?? "").trim();
    const attached = createManualChargeableLot({
      equipmentId: equipmentKey,
      lotNo: sharedLotNo,
      workDate: String(row?.workDate ?? getPrintOutputDate()).trim(),
      sourceRecordId,
      managementId: String(row?.managementId ?? sourceRecordId).trim(),
      company: String(row?.company ?? "").trim(),
      productName: String(row?.partName ?? row?.productName ?? "").trim(),
      partNo: String(row?.partNo ?? "").trim(),
      material: String(row?.material ?? "").trim(),
      qty: row?.qty,
      operator: String(row?.operator ?? "").trim(),
      note: String(row?.note ?? "").trim(),
      source: "equipment-charging",
    });

    if (!attached.ok && !attached.sharedLot) {
      return attached;
    }

    prepared.push({
      ok: true,
      lotNo: sharedLotNo,
      chargeableRow: attached.chargeableRow ?? { ...row, lotNo: sharedLotNo },
      sharedLot: true,
    });
  }

  return { ok: true, lotNo: sharedLotNo, items: prepared };
}

export { recordMatchesEquipmentProcess, getProductionWaitingRecordsForEquipment };

/**
 * 수기 LOT 등록 → 설비 장입 준비 연결.
 * LOT 번호는 호출자가 NDK 규칙으로 생성한 값을 전달하며, 이 함수는 버튼 클릭 이후에만 Store에 반영한다.
 * @param {{
 *   equipmentId: string,
 *   lotNo: string,
 *   workDate: string,
 *   company?: string,
 *   productName?: string,
 *   material?: string,
 *   qty?: number|string,
 *   operator?: string,
 *   note?: string,
 *   sourceRecordId?: string,
 *   managementId?: string,
 *   partNo?: string,
 *   source?: string,
 * }} input
 */
function ensureEquipmentStoreRecord(equipmentId) {
  const key = normalizeEquipmentKey(equipmentId);
  if (!key) return null;

  const dataEngine = getTitanDataEngine();
  const existing = dataEngine.equipment.getById(key);
  if (existing) return existing;

  const raw = EQUIPMENT_RAW_LIST.find((item) => item.id === key);
  if (!raw) return null;

  const record = masterRowToEquipmentRecord(raw);
  return dataEngine.equipment.create(record);
}

export function createManualChargeableLot(input) {
  const equipmentId = normalizeEquipmentKey(input?.equipmentId);
  const lotNo = String(input?.lotNo ?? "").trim();
  if (!equipmentId) return { ok: false, message: "설비를 선택하세요." };
  if (!lotNo) return { ok: false, message: "LOT 번호를 생성할 수 없습니다." };

  const dataEngine = getTitanDataEngine();
  const equipment = ensureEquipmentStoreRecord(equipmentId);
  if (!equipment) return { ok: false, message: "설비 정보를 찾을 수 없습니다." };
  const status = computeEquipmentRunStatus(equipment);
  if (status === "maintenance") {
    return { ok: false, message: "점검중 설비에는 LOT를 연결할 수 없습니다." };
  }
  if (status === "breakdown") {
    return { ok: false, message: "고장 설비에는 LOT를 연결할 수 없습니다." };
  }
  if (equipment.runningSession) {
    return { ok: false, message: "작업중 설비에는 새 LOT를 연결할 수 없습니다." };
  }

  const qty = Number(input?.qty) || 0;
  const lotSource = String(input?.source ?? "equipment-charging").trim() || "equipment-charging";
  const sourceRecordId = String(input?.sourceRecordId ?? "").trim();
  const managementId = String(input?.managementId ?? sourceRecordId).trim();
  const chargeableRow = {
    id: sourceRecordId || lotNo,
    lotNo,
    company: String(input?.company ?? "").trim(),
    partName: String(input?.productName ?? "").trim() || "수기 LOT",
    partNo: String(input?.partNo ?? "").trim(),
    material: String(input?.material ?? "").trim(),
    qty,
    operator: String(input?.operator ?? "").trim(),
    workDate: String(input?.workDate ?? "").trim(),
    statusLabel: "장입완료",
    source: lotSource,
    note: String(input?.note ?? "").trim(),
    ...(sourceRecordId ? { sourceRecordId, managementId } : {}),
  };

  const currentLots = Array.isArray(equipment.chargeableLots) ? equipment.chargeableLots : [];
  const filteredLots = sourceRecordId
    ? currentLots.filter(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() !== sourceRecordId
      )
    : currentLots;
  const lotKey = lotNo.toUpperCase();
  const existingLotIndex = filteredLots.findIndex(
    (row) => String(row?.lotNo ?? "").trim().toUpperCase() === lotKey
  );
  if (existingLotIndex >= 0 && sourceRecordId) {
    const existingLotRow = filteredLots[existingLotIndex];
    if (String(existingLotRow?.sourceRecordId ?? "").trim() === sourceRecordId) {
      return { ok: false, message: "이미 해당 설비에 연결된 제품입니다." };
    }

    const lotItem = buildLotItemFromChargeableRow(chargeableRow, qty);
    appendLotStoreItems(lotNo, [lotItem], {
      productName: formatLotProductSummaryLabel([
        ...(getLotProducts(lotNo) ?? []),
        lotItem,
      ]),
      partNo: chargeableRow.partNo,
      process: equipment.process ?? "",
      equipmentId,
      status: "장입완료",
      progress: 0,
      source: lotSource,
      workDate: chargeableRow.workDate,
      company: chargeableRow.company,
      material: chargeableRow.material,
      operator: chargeableRow.operator,
      note: chargeableRow.note,
    });

    if (sourceRecordId) {
      updateSessionProductionRecord(sourceRecordId, {
        lotNo,
        equipment: equipment.equipmentName ?? equipmentId,
        equipmentId,
        workDate: chargeableRow.workDate,
        registrar: chargeableRow.operator || "생산부",
        registered: false,
        incomingRegistered: true,
        workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
        currentProcess: "열처리 대기",
        qrGenerated: true,
        source: lotSource,
        lotAutoGeneratedAt: new Date().toISOString(),
      });
    }

    notifyWorkflowDataRefresh({
      action: "sharedLotProductAttached",
      equipmentId,
      lotNo,
      sourceRecordId,
    });

    return {
      ok: true,
      message: `${lotNo} LOT에 제품이 추가되었습니다.`,
      lotNo,
      equipmentId,
      equipmentName: equipment.equipmentName ?? equipmentId,
      chargeableRow: { ...chargeableRow, lotNo },
      sharedLot: true,
    };
  }

  if (existingLotIndex >= 0) {
    return { ok: false, message: "이미 해당 설비에 연결된 LOT입니다." };
  }

  const nextLots = [...filteredLots, chargeableRow];
  dataEngine.equipment.update(equipmentId, {
    chargeableLots: nextLots,
    status: "idle",
    currentLot: lotNo,
    workflowState: undefined,
    runningSession: null,
  });

  const lotRecord = upsertLotStoreRecord(lotNo, {
    productName: chargeableRow.partName,
    partNo: chargeableRow.partNo,
    quantity: qty,
    process: equipment.process ?? "",
    equipmentId,
    status: "장입완료",
    progress: 0,
    source: lotSource,
    workDate: chargeableRow.workDate,
    company: chargeableRow.company,
    material: chargeableRow.material,
    operator: chargeableRow.operator,
    note: chargeableRow.note,
    lotItems: [buildLotItemFromChargeableRow(chargeableRow, qty)],
    productCount: 1,
  });

  const productionId = sourceRecordId || buildManualProductionId(lotNo);
  if (sourceRecordId) {
    updateSessionProductionRecord(sourceRecordId, {
      lotNo,
      equipment: equipment.equipmentName ?? equipmentId,
      equipmentId,
      workDate: chargeableRow.workDate,
      registrar: chargeableRow.operator || "생산부",
      registered: false,
      incomingRegistered: true,
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      currentProcess: "열처리 대기",
      qrGenerated: true,
      source: lotSource,
      lotAutoGeneratedAt: new Date().toISOString(),
    });
  } else {
    addSessionProductionRecord({
      id: productionId,
      mesManagementNo: input?.managementId || productionId,
      company: chargeableRow.company || "수기 LOT",
      partName: chargeableRow.partName,
      productName: chargeableRow.partName,
      partNo: chargeableRow.partNo,
      material: chargeableRow.material,
      qty,
      quantity: qty,
      lotNo,
      equipment: equipment.equipmentName ?? equipmentId,
      workDate: chargeableRow.workDate,
      registrar: chargeableRow.operator || "생산부",
      note: chargeableRow.note,
      registered: false,
      incomingRegistered: true,
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      currentProcess: "열처리 대기",
      source: lotSource,
      createdAt: new Date().toISOString(),
    });
  }

  notifyWorkflowDataRefresh({
    action: lotSource === "manual-lot" ? "manualLotCreated" : "chargeLotPrepared",
    equipmentId,
    lotNo,
    productionId,
  });

  return {
    ok: true,
    message: `${lotNo} LOT가 생성되어 ${equipment.equipmentName ?? equipmentId} 설비에 연결되었습니다.`,
    lotNo,
    equipmentId,
    equipmentName: equipment.equipmentName ?? equipmentId,
    chargeableRow,
    lotRecord,
    productionId,
  };
}

/** @deprecated getChargeableLots */
export function getAvailableLots(equipmentId) {
  return getChargeableLots(equipmentId);
}

/**
 * 운전중 설비 Popup — 장입된 제품 리스트 행 (getLotBundle / runningSession.lotItems SSOT)
 * @param {Record<string, unknown> | null | undefined} session
 */
export function buildChargedLotRunningRows(session) {
  const lotNo = String(session?.lotNo ?? "").trim();
  if (!lotNo) return [];

  const bundle = getLotBundle(lotNo);
  const sessionItems = Array.isArray(session?.lotItems) ? session.lotItems : [];
  const items = bundle?.lotItems?.length ? bundle.lotItems : sessionItems;
  if (!items.length) return [];

  const records = getSessionProductionRecords();

  return items.map((item, index) => {
    const sourceId = String(item?.sourceRecordId ?? item?.managementId ?? item?.id ?? "").trim();
    const record =
      records.find((row) => String(row.id ?? "").trim() === sourceId) ??
      records.find((row) => String(row.mesManagementNo ?? "").trim() === sourceId) ??
      {};

    const mergedBase = {
      ...record,
      ...item,
      id: sourceId || `${lotNo}-${index}`,
      sourceRecordId: sourceId,
      company: String(item.company ?? record.company ?? "").trim(),
      partName: String(
        item.partName ?? item.itemName ?? record.partName ?? record.productName ?? ""
      ).trim(),
      partNo: String(item.partNo ?? record.partNo ?? "").trim(),
      material: String(item.material ?? record.material ?? "").trim(),
      inboundQty: record.inboundQty ?? record.qty ?? item.inboundQty,
      unit: record.unit ?? item.unit ?? "EA",
    };

    return {
      ...mergedBase,
      chargeQty: resolveChargeQty(mergedBase, { lotNo }),
    };
  });
}

function getLotPrimaryPartName(lotNo, equipment = null) {
  const products = getLotProducts(lotNo, equipment);
  return products[0]?.material || products[0]?.partName || products[0]?.partNo || "—";
}

/**
 * 설비 알람 계산 (Blueprint ② 설비 View — 설비 알람)
 * 저장 ❌ · Engine 상태 기반 항상 계산
 * @param {{ status?: string, maintenance?: boolean, runningSession?: { progress?: number } | null }} equipment
 * @returns {{ level: "warning"|"info", label: string } | null}
 */
export function computeEquipmentAlarm(equipment) {
  if (!equipment) return null;
  if (equipment.status === "breakdown") {
    return { level: "warning", label: "고장" };
  }
  if (equipment.maintenance || equipment.status === "maintenance") {
    return { level: "warning", label: "점검 필요" };
  }
  const progress = Number(equipment.runningSession?.progress ?? 0);
  if (equipment.status === "running" && progress >= 90) {
    return { level: "info", label: "종료 임박" };
  }
  return null;
}

export function getEquipmentSummary() {
  const list = getEquipmentList();
  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(EQUIPMENT_RUN_STATUS_SSOT.map((key) => [key, 0]));

  list.forEach((item) => {
    const key = item.status;
    if (counts[key] != null) {
      counts[key] += 1;
    }
  });

  return {
    total: list.length,
    idle: counts.idle,
    ready: counts.ready ?? 0,
    running: counts.running,
    maintenance: counts.maintenance,
    breakdown: counts.breakdown ?? 0,
  };
}

/**
 * HOME · QR 상세 패널용
 * @param {string | null | undefined} equipmentId
 */
export function getEquipmentDetailSnapshot(equipmentId) {
  const equipment = getEquipmentById(equipmentId);
  if (!equipment) return null;

  const runningSession = normalizeRunningSession(equipment.runningSession);
  const isRunning = equipment.status === "running" && Boolean(runningSession);
  const runningLotNo = isRunning ? String(runningSession?.lotNo ?? "").trim() : "";
  const sameLotProducts = runningLotNo ? getLotProducts(runningLotNo, equipment) : [];
  const chargeQty = isRunning
    ? Number(runningSession?.chargeQty) ||
      sameLotProducts.reduce((sum, row) => sum + (Number(row.chargeQty) || 0), 0) ||
      null
    : null;
  const productLabel =
    formatLotProductSummaryLabel(sameLotProducts) ||
    (isRunning ? getLotPrimaryPartName(runningLotNo, equipment) : null);

  return {
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    process: equipment.process,
    status: equipment.status,
    currentLotNo: runningLotNo || null,
    startTime: isRunning ? runningSession?.startTime ?? null : null,
    expectedEndTime: isRunning ? runningSession?.expectedEndTime ?? null : null,
    progress: isRunning ? runningSession?.progress ?? 0 : 0,
    statusLabel: isRunning ? runningSession?.statusLabel ?? null : null,
    operator: isRunning ? runningSession?.operator ?? null : null,
    currentProductName: isRunning ? productLabel : null,
    recipeName: isRunning ? runningSession?.recipeName ?? null : null,
    chargeQty,
    chargeQtyLabel: chargeQty > 0 ? `${chargeQty.toLocaleString("ko-KR")} EA` : null,
    alarm: computeEquipmentAlarm({ ...equipment, runningSession }),
    utilization: isRunning ? runningSession?.progress ?? 0 : 0,
    chargeableLots: equipment.chargeableLots,
    displayLots: equipment.displayLots,
    sameLotProducts,
    sameLotProductCount: sameLotProducts.length,
    chargingButtons: equipment.chargingButtons,
    runningSession,
  };
}

/**
 * MES Dashboard 카드용 ViewModel
 * @param {import("../config/equipmentConfig").EquipmentRawRecord | string} equipmentOrId
 */
export function getEquipmentMonitorCard(equipmentOrId) {
  const equipment =
    typeof equipmentOrId === "string" ? getEquipmentById(equipmentOrId) : equipmentOrId;
  if (!equipment) return null;

  const runningSession = normalizeRunningSession(equipment.runningSession);
  const isRunning = equipment.status === "running" && Boolean(runningSession);
  const runningLotNo = isRunning ? String(runningSession?.lotNo ?? "").trim() : "";
  const sameLotProducts = runningLotNo ? getLotProducts(runningLotNo, equipment) : [];
  const chargeQty = isRunning
    ? Number(runningSession?.chargeQty) ||
      sameLotProducts.reduce((sum, row) => sum + (Number(row.chargeQty) || 0), 0) ||
      null
    : null;
  const productLabel =
    formatLotProductSummaryLabel(sameLotProducts) ||
    (isRunning ? getLotPrimaryPartName(runningLotNo, equipment) : null);

  return {
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    process: equipment.process,
    status: equipment.status,
    currentLotNo: runningLotNo || null,
    startTime: isRunning ? runningSession?.startTime ?? null : null,
    expectedEndTime: isRunning ? runningSession?.expectedEndTime ?? null : null,
    progress: isRunning ? runningSession?.progress ?? 0 : 0,
    operator: isRunning ? runningSession?.operator ?? null : null,
    currentProductName: isRunning ? productLabel : null,
    recipeName: isRunning ? runningSession?.recipeName ?? null : null,
    chargeQty,
    chargeQtyLabel: chargeQty > 0 ? `${chargeQty.toLocaleString("ko-KR")} EA` : null,
    alarm: computeEquipmentAlarm({ ...equipment, runningSession }),
    utilization: isRunning ? runningSession?.progress ?? 0 : 0,
    sameLotProductCount: sameLotProducts.length,
    displayLots: isRunning ? equipment.displayLots : [],
    runningSession,
  };
}

/** 공정 그룹별 설비 목록 (MES Dashboard · 30대+ 확장) */
export function getEquipmentListGroupedByProcess() {
  /** @type {Map<string, ReturnType<typeof getEquipmentMonitorCard>[]>} */
  const groupMap = new Map();

  getEquipmentList().forEach((item) => {
    const process = item.process || "기타";
    if (!groupMap.has(process)) {
      groupMap.set(process, []);
    }
    const card = getEquipmentMonitorCard(item);
    if (card) {
      groupMap.get(process).push(card);
    }
  });

  const orderedProcesses = [
    ...EQUIPMENT_PROCESS_GROUP_ORDER.filter((process) => groupMap.has(process)),
    ...[...groupMap.keys()].filter((process) => !EQUIPMENT_PROCESS_GROUP_ORDER.includes(process)),
  ];

  return orderedProcesses.map((process) => ({
    process,
    items: groupMap.get(process) ?? [],
  }));
}
