/**
 * Project TITAN (NDK PQMS) — 재고현황 자동 집계
 * 입고현황 + 작업일보 + 출고현황 · 직접 입력 ❌
 *
 * @see src/utils/inventory.js — record 단위 재고
 */

import { getIncomingQty, getShippedQty, getStockQty } from "./inventory";
import { getSessionProductionRecords } from "./productionRecords";

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
        lastIncomingDateLabel: row.lastIncomingDate || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
      };
    })
    .sort((a, b) => b.lastIncomingDate.localeCompare(a.lastIncomingDate) || a.partNo.localeCompare(b.partNo, "ko"));
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

  const includes = (value, query) =>
    !query?.trim() ||
    String(value ?? "")
      .toLowerCase()
      .includes(String(query).trim().toLowerCase());

  if (!includes(row.partName, search.partName)) return false;
  if (!includes(row.partNo, search.partNo)) return false;
  if (!includes(row.material, search.material)) return false;
  if (!includes(row.company, search.company)) return false;
  if (!includes(row.spec, search.spec)) return false;
  if (search.status && row.statusLabel !== search.status) return false;

  return true;
}

export function createEmptyInventoryStatusSearch() {
  return {
    company: "",
    partName: "",
    partNo: "",
    material: "",
    spec: "",
    status: "",
  };
}
