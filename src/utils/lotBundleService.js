/**
 * LOT Bundle SSOT
 */
import { getTitanDataEngine } from "../foundation/data";
import { formatLotProductSummaryLabel, getLotProducts } from "./equipmentWorkflowService";
import { resolveChargeQty } from "./equipmentChargingQty";
import { getSessionProductionRecords } from "./productionRecords";
import { normalizeProductionLotKey } from "./productionDailyReportPrintData";
import { WORKFLOW_STATUS } from "./titanWorkflowStatus";

export { normalizeProductionLotKey };

/** Resolve LOT for list row — record.lotNo · chargeHistory SSOT */
export function resolveRecordLotNo(record) {
  const direct = String(record?.lotNo ?? "").trim();
  if (direct) return direct;

  const history = Array.isArray(record?.chargeHistory) ? record.chargeHistory : [];
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    const lotNo = String(entry?.lotNo ?? "").trim();
    if (!lotNo) continue;
    if (entry?.status === "in-progress" || entry?.status === "completed") {
      return lotNo;
    }
  }

  return "";
}

/** @deprecated alias — 작업일보·품질 공통 */
export function resolveProductionDailyReportLotNo(record) {
  return resolveRecordLotNo(record);
}

/** One virtual row per chargeHistory entry — finished LOTs stay visible when lotNo is overwritten */
export function buildChargeHistoryVirtualRow(record, entry, { markComplete = false } = {}) {
  const lotNo = String(entry?.lotNo ?? "").trim();
  const row = {
    ...record,
    lotNo,
    registered: true,
    dailyReportAutoCreated: true,
    chargeQty: Number(entry?.chargeQty) || Number(record?.chargeQty) || 0,
    workQty: Number(entry?.chargeQty) || Number(record?.workQty) || 0,
    equipment: entry?.equipmentName ?? entry?.equipmentId ?? record?.equipment,
    equipmentId: entry?.equipmentId ?? record?.equipmentId,
    productionWorkflowId: entry?.productionId ?? record?.productionWorkflowId,
    chargeStartAt: entry?.startedAt ?? record?.chargeStartAt,
  };
  if (markComplete) {
    row.workflowStatus = WORKFLOW_STATUS.PROD_DONE;
    row.completionStatus = WORKFLOW_STATUS.PROD_DONE;
    row.productionCompletedAt = entry?.completedAt ?? record?.productionCompletedAt;
  }
  return row;
}

/** @deprecated alias */
export function buildChargeHistoryRow(record, entry, options) {
  return buildChargeHistoryVirtualRow(record, entry, options);
}

/**
 * Expand production records — one row per chargeHistory entry (in-progress · completed).
 * @param {object[]} records
 * @param {{ completedOnly?: boolean }} [options]
 */
export function expandRecordsByChargeHistory(records, { completedOnly = false } = {}) {
  const expanded = [];
  for (const record of records) {
    const entries = (record.chargeHistory ?? []).filter((entry) => {
      const lotNo = String(entry?.lotNo ?? "").trim();
      if (!lotNo) return false;
      if (completedOnly) return entry?.status === "completed";
      return entry?.status === "in-progress" || entry?.status === "completed";
    });

    if (entries.length > 0) {
      entries.forEach((entry) => {
        expanded.push(
          buildChargeHistoryVirtualRow(record, entry, {
            markComplete: entry?.status === "completed",
          })
        );
      });
    } else {
      expanded.push(record);
    }
  }
  return expanded;
}

/** @deprecated alias */
export function expandRecordsWithChargeHistory(records, options) {
  return expandRecordsByChargeHistory(records, options);
}

/** Dedupe key for id + LOT virtual rows */
export function buildRecordLotRowKey(record) {
  const idKey = String(record?.id ?? "").trim();
  const lotKey = normalizeProductionLotKey(String(record?.lotNo ?? "").trim());
  return lotKey ? `${idKey}::${lotKey}` : idKey;
}

function recordBelongsToLot(record, lotKey) {
  if (normalizeProductionLotKey(record?.lotNo) === lotKey) return true;
  return (record?.chargeHistory ?? []).some(
    (entry) =>
      normalizeProductionLotKey(entry?.lotNo) === lotKey &&
      (entry?.status === "in-progress" || entry?.status === "completed")
  );
}

function buildLotItemFromRecord(record, lotNo = "") {
  const chargeQty = resolveChargeQty(record, { lotNo: lotNo || record?.lotNo });
  return {
    sourceRecordId: record.id ?? record.mesManagementNo,
    managementId: record.id ?? record.mesManagementNo,
    partNo: String(record.partNo ?? record.productNo ?? "").trim(),
    partName: String(record.partName ?? record.productName ?? "").trim(),
    material: String(record.material ?? "").trim(),
    company: String(record.company ?? "").trim(),
    chargeQty,
    qty: chargeQty,
    unit: record.unit ?? "EA",
  };
}

export function collectDistinctLotNumbers(records = getSessionProductionRecords()) {
  const lotNos = new Set();
  records.forEach((record) => {
    const lotNo = String(record.lotNo ?? "").trim();
    if (lotNo) lotNos.add(lotNo);
    (record.chargeHistory ?? []).forEach((entry) => {
      const historyLot = String(entry?.lotNo ?? "").trim();
      if (historyLot) lotNos.add(historyLot);
    });
  });
  try {
    getTitanDataEngine().lot.list().forEach((row) => {
      const lotNo = String(row?.lotNo ?? "").trim();
      if (lotNo) lotNos.add(lotNo);
    });
    getTitanDataEngine().equipment.list().forEach((equipment) => {
      const sessionLot = String(equipment?.runningSession?.lotNo ?? "").trim();
      if (sessionLot) lotNos.add(sessionLot);
    });
  } catch {
    // partial engine in tests
  }
  return [...lotNos].sort((a, b) => b.localeCompare(a));
}

export function getLotBundle(lotNo, options = {}) {
  const key = String(lotNo ?? "").trim();
  if (!key) return null;
  const records = options.records ?? getSessionProductionRecords();
  const lotKey = normalizeProductionLotKey(key);
  const fromRecords = records
    .filter((record) => recordBelongsToLot(record, lotKey))
    .map((record) => buildLotItemFromRecord(record, key));
  let equipment = null;
  let lotStoreRow = null;
  try {
    const dataEngine = getTitanDataEngine();
    lotStoreRow = dataEngine.lot.getByLotNo(key);
    const equipmentId = String(lotStoreRow?.equipmentId ?? "").trim();
    if (equipmentId) equipment = dataEngine.equipment.getById(equipmentId);
    if (!equipment) {
      equipment =
        dataEngine.equipment.list().find(
          (row) => String(row?.runningSession?.lotNo ?? "").trim().toUpperCase() === lotKey
        ) ?? null;
    }
  } catch {
    // partial engine in tests
  }
  const runtimeProducts = getLotProducts(key, equipment);
  const storeItems = Array.isArray(lotStoreRow?.lotItems) ? lotStoreRow.lotItems : [];
  const sessionItems = Array.isArray(equipment?.runningSession?.lotItems)
    ? equipment.runningSession.lotItems
    : [];
  const lotItems = [];
  const pushItem = (item) => {
    const sourceKey = String(item?.sourceRecordId ?? "").trim();
    if (!sourceKey) return;
    const normalized = {
      ...item,
      chargeQty: resolveChargeQty(item, { lotNo: key }),
    };
    normalized.qty = normalized.chargeQty;
    const index = lotItems.findIndex((row) => String(row.sourceRecordId) === sourceKey);
    if (index >= 0) lotItems[index] = { ...lotItems[index], ...normalized };
    else lotItems.push(normalized);
  };
  [...fromRecords, ...storeItems, ...sessionItems, ...runtimeProducts].forEach(pushItem);
  const totalQty = lotItems.reduce((sum, row) => sum + (Number(row.chargeQty) || 0), 0);
  const primaryRecord = records.find((record) => recordBelongsToLot(record, lotKey));
  return {
    lotNo: key,
    lotItems,
    itemCount: lotItems.length,
    totalQty,
    productLabel: formatLotProductSummaryLabel(lotItems),
    company: lotItems[0]?.company || primaryRecord?.company || lotStoreRow?.company || "",
    partNo: lotItems[0]?.partNo || primaryRecord?.partNo || lotStoreRow?.partNo || "",
    managementId:
      lotItems[0]?.managementId ||
      primaryRecord?.id ||
      primaryRecord?.mesManagementNo ||
      lotStoreRow?.managementId ||
      "",
    equipmentId:
      lotStoreRow?.equipmentId ||
      equipment?.equipmentId ||
      equipment?.id ||
      primaryRecord?.equipmentId ||
      "",
    equipmentName: equipment?.equipmentName || equipment?.name || primaryRecord?.equipment || "",
    process: lotStoreRow?.process || equipment?.process || primaryRecord?.processDetail || "",
    operator:
      equipment?.runningSession?.operator || lotStoreRow?.operator || primaryRecord?.operator || "",
    progress: Number(lotStoreRow?.progress ?? equipment?.runningSession?.progress ?? 0),
    status:
      lotStoreRow?.status ||
      equipment?.runningSession?.statusLabel ||
      primaryRecord?.currentProcess ||
      "",
  };
}