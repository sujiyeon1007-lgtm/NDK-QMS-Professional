/**
 * Project TITAN (NDK PQMS) — 재고관리 자동 집계
 * 입고 · 출고 이력 기반 · 직접 입력 ❌
 *
 * @see src/utils/inventory.js — record 단위 재고
 * @see src/config/inventoryManagementPolicy.js — V1.0/V2.0 scope
 */

import { INVENTORY_VIEW_MODES } from "../config/inventoryManagementPolicy";
import { getIncomingQty, getShippedQty, getStockQty } from "./inventory";
import { mapV13ProductListRow } from "./processFlow";
import { getSessionProductionRecords } from "./productionRecords";
import { buildInventoryWorkspaceRecords } from "./operationsWorkspaceData";
import {
  CURRENT_PROCESS_KEYS,
  matchesCurrentProcessKpiBucket,
  resolveRecordCurrentProcess,
} from "./workflowProcessStatus";

export { INVENTORY_VIEW_MODES };

const INVENTORY_KPI_CHIP_IDS = [
  "inCustody",
  "HT_WAIT",
  "HT_RUNNING",
  "INSPECTION_WAIT",
  "CERT_WAIT",
  "SHIP_WAIT",
];

/** 고객 제품 보관 중 — 입고 등록 완료 · 출고 완료 제외 */
export function isInventoryInCustodyRecord(record) {
  if (!record?.incomingRegistered) return false;
  return resolveRecordCurrentProcess(record).key !== CURRENT_PROCESS_KEYS.SHIPPED;
}

/**
 * 재고관리 — KPI · List shared base records + workflow counts
 * @param {object[]} [records]
 */
export function getInventoryScreenData(records = getSessionProductionRecords()) {
  const baseRecords = buildInventoryWorkspaceRecords(records).filter(isInventoryInCustodyRecord);

  const countKpiBucket = (kpiId) => {
    if (kpiId === "inCustody") return baseRecords.length;
    return baseRecords.filter((record) => matchesCurrentProcessKpiBucket(record, kpiId)).length;
  };

  return {
    baseRecords,
    counts: Object.fromEntries(INVENTORY_KPI_CHIP_IDS.map((id) => [id, countKpiBucket(id)])),
  };
}

/**
 * KPI chip filter — record level (list rebuild 전 필터)
 * @param {object[]} records
 * @param {object} search
 */
export function filterInventoryRecordsByChipSearch(records, search = {}) {
  if (!search) return records;

  if (search.__chipInCustody) {
    return records.filter(isInventoryInCustodyRecord);
  }
  if (search.__chipHT_WAIT) {
    return records.filter(
      (record) => isInventoryInCustodyRecord(record) && matchesCurrentProcessKpiBucket(record, "HT_WAIT")
    );
  }
  if (search.__chipHT_RUNNING) {
    return records.filter(
      (record) =>
        isInventoryInCustodyRecord(record) && matchesCurrentProcessKpiBucket(record, "HT_RUNNING")
    );
  }
  if (search.__chipINSPECTION_WAIT) {
    return records.filter(
      (record) =>
        isInventoryInCustodyRecord(record) &&
        matchesCurrentProcessKpiBucket(record, "INSPECTION_WAIT")
    );
  }
  if (search.__chipCERT_WAIT) {
    return records.filter(
      (record) =>
        isInventoryInCustodyRecord(record) && matchesCurrentProcessKpiBucket(record, "CERT_WAIT")
    );
  }
  if (search.__chipSHIP_WAIT) {
    return records.filter(
      (record) =>
        isInventoryInCustodyRecord(record) && matchesCurrentProcessKpiBucket(record, "SHIP_WAIT")
    );
  }

  return records;
}

/**
 * KPI chip filter — record matches (Production · Outbound pattern)
 * @param {object} record
 * @param {object} search
 */
export function matchesInventoryChipSearch(record, search = {}) {
  if (!search || !record) return true;

  if (search.__chipInCustody && !isInventoryInCustodyRecord(record)) return false;
  if (search.__chipHT_WAIT && !matchesCurrentProcessKpiBucket(record, "HT_WAIT")) return false;
  if (search.__chipHT_RUNNING && !matchesCurrentProcessKpiBucket(record, "HT_RUNNING")) return false;
  if (search.__chipINSPECTION_WAIT && !matchesCurrentProcessKpiBucket(record, "INSPECTION_WAIT")) {
    return false;
  }
  if (search.__chipCERT_WAIT && !matchesCurrentProcessKpiBucket(record, "CERT_WAIT")) return false;
  if (search.__chipSHIP_WAIT && !matchesCurrentProcessKpiBucket(record, "SHIP_WAIT")) return false;

  return true;
}

/**
 * 재고관리 List SSOT — KPI baseRecords · chip · search · viewMode 단일 파이프라인
 * @param {string} viewMode
 * @param {object[]} baseRecords — getInventoryScreenData().baseRecords
 * @param {object} search
 */
export function filterInventoryStatusListRows(viewMode = "byLot", baseRecords = [], search = {}) {
  const chipScopedRecords = filterInventoryRecordsByChipSearch(baseRecords, search);
  const allRows = buildInventoryRowsByViewMode(viewMode, chipScopedRecords);

  return allRows.filter((row) => {
    const record = row.record ?? null;
    if (record && !matchesInventoryChipSearch(record, search)) return false;
    return matchesInventoryStatusSearch(row, search);
  });
}

function buildGroupKey(record) {
  const company = String(record.company ?? "").trim().toLowerCase();
  const partNo = String(record.partNo ?? "").trim().toLowerCase();
  return `${company}::${partNo}`;
}

function isWorkInputRecord(record) {
  return Boolean(record?.registered && String(record.lotNo ?? "").trim());
}

function resolveInventoryStatusLabel(row) {
  if (row.currentStock <= 0 && row.shippedQty > 0) return { label: "출고완료", variant: "complete" };
  if (row.currentStock <= 0) return { label: "재고없음", variant: "wait" };
  if (row.workInputQty > 0 && row.currentStock > 0) return { label: "재고보유", variant: "progress" };
  return { label: "입고대기", variant: "wait" };
}

/**
 * @param {object[]} records
 */
export function buildInventoryStatusRows(records = getSessionProductionRecords()) {
  /** @type {Map<string, object>} */
  const groups = new Map();

  for (const record of records) {
    if (!record?.incomingRegistered) continue;

    const key = buildGroupKey(record);
    const inboundQty = getIncomingQty(record);
    const shippedQty = getShippedQty(record);
    const workInputQty = isWorkInputRecord(record) ? inboundQty : 0;
    const currentStock = getStockQty(record);

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        company: record.company ?? "—",
        partName: record.partName ?? "—",
        partNo: record.partNo ?? "—",
        material: record.material ?? "—",
        spec: record.spec ?? "—",
        unit: record.unit ?? "EA",
        inboundQty: 0,
        workInputQty: 0,
        shippedQty: 0,
        currentStock: 0,
        lastIncomingDate: "",
        recordCount: 0,
      });
    }

    const row = groups.get(key);
    row.inboundQty += inboundQty;
    row.workInputQty += workInputQty;
    row.shippedQty += shippedQty;
    row.currentStock += currentStock;
    row.recordCount += 1;

    if (!row.spec || row.spec === "—") {
      row.spec = record.spec ?? "—";
    }

    const incomingDate = String(record.incomingDate ?? "");
    if (incomingDate && incomingDate >= row.lastIncomingDate) {
      row.lastIncomingDate = incomingDate;
    }
  }

  return [...groups.values()]
    .map((row) => {
      const status = resolveInventoryStatusLabel(row);
      return {
        ...row,
        inboundQtyLabel: `${row.inboundQty.toLocaleString("ko-KR")} ${row.unit}`,
        workInputQtyLabel: `${row.workInputQty.toLocaleString("ko-KR")} ${row.unit}`,
        shippedQtyLabel: `${row.shippedQty.toLocaleString("ko-KR")} ${row.unit}`,
        currentStockLabel: `${row.currentStock.toLocaleString("ko-KR")} ${row.unit}`,
        incomingDateLabel: row.lastIncomingDate || "—",
        lastIncomingDateLabel: row.lastIncomingDate || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
      };
    })
    .sort((a, b) => b.lastIncomingDate.localeCompare(a.lastIncomingDate) || a.partNo.localeCompare(b.partNo, "ko"));
}

/** LOT별 — 관리번호 단위 (입고 등록 건마다 1행) */
export function buildInventoryByLotRows(records = getSessionProductionRecords()) {
  return records
    .filter((record) => record?.incomingRegistered)
    .map((record) => {
      const inboundQty = getIncomingQty(record);
      const shippedQty = getShippedQty(record);
      const currentStock = getStockQty(record);
      const workInputQty = isWorkInputRecord(record) ? inboundQty : 0;
      const row = {
        id: record.id ?? record.mesManagementNo ?? "",
        managementId: record.mesManagementNo ?? record.id ?? "—",
        lotNo: record.lotNo?.trim() || "—",
        company: record.company ?? "—",
        partName: record.partName ?? "—",
        partNo: record.partNo ?? "—",
        material: record.material ?? "—",
        unit: record.unit ?? "EA",
        inboundQty,
        workInputQty,
        shippedQty,
        currentStock,
        lastIncomingDate: String(record.incomingDate ?? ""),
      };
      const status = resolveInventoryStatusLabel(row);
      const v13 = mapV13ProductListRow(record, status, { workQty: workInputQty || inboundQty, screenKey: "inventory" });
      return {
        ...row,
        ...v13,
        id: row.id,
        record,
        inboundQtyLabel: `${row.inboundQty.toLocaleString("ko-KR")} ${row.unit}`,
        workQtyLabel: `${(workInputQty || inboundQty).toLocaleString("ko-KR")} ${row.unit}`,
        workInputQtyLabel: `${row.workInputQty.toLocaleString("ko-KR")} ${row.unit}`,
        shippedQtyLabel: `${row.shippedQty.toLocaleString("ko-KR")} ${row.unit}`,
        currentStockLabel: `${row.currentStock.toLocaleString("ko-KR")} ${row.unit}`,
        incomingDateLabel: row.lastIncomingDate || "—",
        lastIncomingDateLabel: row.lastIncomingDate || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
      };
    })
    .sort(
      (a, b) =>
        b.lastIncomingDate.localeCompare(a.lastIncomingDate) ||
        a.managementId.localeCompare(b.managementId, "ko")
    );
}

/** 거래처별 — 업체 단위 집계 */
export function buildInventoryByCompanyRows(records = getSessionProductionRecords()) {
  /** @type {Map<string, object>} */
  const groups = new Map();
  /** @type {Map<string, Set<string>>} */
  const skuKeysByCompany = new Map();

  for (const record of records) {
    if (!record?.incomingRegistered) continue;

    const key = String(record.company ?? "").trim().toLowerCase() || "—";
    const inboundQty = getIncomingQty(record);
    const shippedQty = getShippedQty(record);
    const currentStock = getStockQty(record);

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        company: record.company ?? "—",
        skuCount: 0,
        lotCount: 0,
        inboundQty: 0,
        shippedQty: 0,
        currentStock: 0,
        unit: "EA",
        lastIncomingDate: "",
      });
      skuKeysByCompany.set(key, new Set());
    }

    const row = groups.get(key);
    row.inboundQty += inboundQty;
    row.shippedQty += shippedQty;
    row.currentStock += currentStock;
    row.lotCount += 1;
    skuKeysByCompany.get(key).add(String(record.partNo ?? "").trim().toLowerCase());

    const incomingDate = String(record.incomingDate ?? "");
    if (incomingDate && incomingDate >= row.lastIncomingDate) {
      row.lastIncomingDate = incomingDate;
    }
  }

  return [...groups.values()]
    .map((row) => {
      const status = resolveInventoryStatusLabel(row);
      const skuCount = skuKeysByCompany.get(row.id)?.size ?? 0;
      return {
        ...row,
        skuCount,
        inboundQtyLabel: `${row.inboundQty.toLocaleString("ko-KR")} ${row.unit}`,
        shippedQtyLabel: `${row.shippedQty.toLocaleString("ko-KR")} ${row.unit}`,
        currentStockLabel: `${row.currentStock.toLocaleString("ko-KR")} ${row.unit}`,
        skuCountLabel: skuCount.toLocaleString("ko-KR"),
        lotCountLabel: row.lotCount.toLocaleString("ko-KR"),
        incomingDateLabel: row.lastIncomingDate || "—",
        lastIncomingDateLabel: row.lastIncomingDate || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
      };
    })
    .sort((a, b) => b.currentStock - a.currentStock || a.company.localeCompare(b.company, "ko"));
}

export function buildInventoryRowsByViewMode(viewMode = "byLot", records = getSessionProductionRecords()) {
  const scopedRecords = records.filter(isInventoryInCustodyRecord);
  switch (viewMode) {
    case "byLot":
      return buildInventoryByLotRows(scopedRecords);
    case "byCompany":
      return buildInventoryByCompanyRows(scopedRecords);
    default:
      return buildInventoryStatusRows(scopedRecords);
  }
}

export function summarizeInventoryStatus(rows = buildInventoryStatusRows()) {
  return {
    skuCount: rows.length,
    inStockSkuCount: rows.filter((row) => row.currentStock > 0).length,
    totalCurrentStock: rows.reduce((sum, row) => sum + row.currentStock, 0),
    totalInboundQty: rows.reduce((sum, row) => sum + row.inboundQty, 0),
    totalShippedQty: rows.reduce((sum, row) => sum + row.shippedQty, 0),
  };
}

export function matchesInventoryStatusSearch(row, search) {
  if (!search) return true;

  const record = row?.record ?? null;
  if (record && !matchesInventoryChipSearch(record, search)) return false;

  const includes = (value, query) =>
    !query?.trim() ||
    String(value ?? "")
      .toLowerCase()
      .includes(String(query).trim().toLowerCase());

  if (!includes(row.managementId ?? row.id, search.managementId)) return false;
  if (!includes(row.lotNo, search.lotNo)) return false;
  if (!includes(row.partName, search.partName)) return false;
  if (!includes(row.partNo, search.partNo)) return false;
  if (!includes(row.material, search.material)) return false;
  if (!includes(row.company, search.company)) return false;
  if (!includes(row.spec, search.spec)) return false;
  if (!includes(row.note ?? row.remark, search.note)) return false;
  if (
    search.process &&
    !includes(
      row.processName ?? row.heatTreatment ?? row.currentProcessLabel ?? row.currentProcess,
      search.process
    )
  ) {
    return false;
  }
  if (search.status) {
    const statusText = String(
      row.statusLabel ?? row.workflowStatus ?? row.currentProcessLabel ?? row.currentProcess ?? ""
    ).trim();
    const query = search.status.trim().toLowerCase();
    if (!statusText || !statusText.toLowerCase().includes(query)) return false;
  }
  const incomingDate = row.lastIncomingDate ?? row.incomingDate ?? row.incomingDateLabel ?? "";
  if (search.incomingDateFrom && incomingDate && incomingDate !== "—" && incomingDate < search.incomingDateFrom) {
    return false;
  }
  if (search.incomingDateTo && incomingDate && incomingDate !== "—" && incomingDate > search.incomingDateTo) {
    return false;
  }

  return true;
}

export function createEmptyInventoryStatusSearch() {
  return {
    company: "",
    partName: "",
    partNo: "",
    material: "",
    managementId: "",
    lotNo: "",
    spec: "",
    status: "",
    incomingDateFrom: "",
    incomingDateTo: "",
    productionDateFrom: "",
    productionDateTo: "",
    manager: "",
    customerLotNo: "",
    process: "",
    qty: "",
    note: "",
  };
}
