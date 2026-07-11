/**
 * Project TITAN V1.0 — 단가 이력 관리
 * 단가 변경 시 기존 이력을 덮어쓰지 않고 적용일 기준 이력을 누적
 */

import { findProductByCompanyAndPartNo, findProductByPartNo } from "./masterData";

function priceKey(company, partNo) {
  return `${company?.trim() ?? ""}|${partNo?.trim() ?? ""}`;
}

let unitPriceStore = new Map([
  [
    priceKey("서암기계공업", "H2E19655"),
    {
      company: "서암기계공업",
      partNo: "H2E19655",
      partName: "BULL GEAR",
      history: [{ id: "up1", effectiveDate: "2026-07-01", price: 5462200, note: "" }],
    },
  ],
  [
    priceKey("서암기계공업", "CQ91BUL504"),
    {
      company: "서암기계공업",
      partNo: "CQ91BUL504",
      partName: "BULL GEAR",
      history: [{ id: "up2", effectiveDate: "2026-07-01", price: 660000, note: "" }],
    },
  ],
]);

function sortHistory(history) {
  return [...history].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
}

export function getUnitPriceEntry(company, partNo) {
  return unitPriceStore.get(priceKey(company, partNo)) ?? null;
}

export function getUnitPriceHistory(company, partNo) {
  const entry = getUnitPriceEntry(company, partNo);
  return entry ? sortHistory(entry.history) : [];
}

export function getUnitPriceAtDate(company, partNo, dateStr) {
  const history = getUnitPriceHistory(company, partNo);
  if (history.length === 0) return 0;

  const target = dateStr || new Date().toISOString().slice(0, 10);
  let applicable = history[0].price;

  for (const row of history) {
    if (row.effectiveDate <= target) {
      applicable = row.price;
    }
  }

  return applicable;
}

export function getCurrentUnitPrice(company, partNo) {
  const history = getUnitPriceHistory(company, partNo);
  if (history.length === 0) return 0;
  return history[history.length - 1].price;
}

function parseNumericPrice(raw) {
  if (raw === "" || raw == null) return 0;
  const num = Number(String(raw).replace(/,/g, ""));
  return Number.isFinite(num) ? num : 0;
}

/** 거래명세서·출고 — 단가 이력 → 레코드 → 제품 마스터 순 */
export function resolveRecordUnitPrice(record, company, partNo) {
  const companyName = company ?? record?.company;
  const part = partNo ?? record?.partNo;

  const fromHistory = getCurrentUnitPrice(companyName, part);
  if (fromHistory > 0) return fromHistory;

  const fromRecord = parseNumericPrice(record?.unitPrice);
  if (fromRecord > 0) return fromRecord;

  const product =
    findProductByCompanyAndPartNo(companyName, part) ?? findProductByPartNo(part);
  if (product) {
    const fromProduct = parseNumericPrice(
      product.unitPrice ?? product.defaultUnitPrice ?? product.defaultPrice ?? product.price
    );
    if (fromProduct > 0) return fromProduct;
  }

  return 0;
}

export function getAllUnitPriceEntries() {
  return [...unitPriceStore.values()].map((entry) => ({
    ...entry,
    history: sortHistory(entry.history),
    currentPrice: sortHistory(entry.history).at(-1)?.price ?? 0,
  }));
}

export function addUnitPriceHistory({ company, partNo, partName, effectiveDate, price, note = "" }) {
  const key = priceKey(company, partNo);
  const existing = unitPriceStore.get(key);
  const newRow = {
    id: `up${Date.now()}`,
    effectiveDate,
    price: Number(price) || 0,
    note: note?.trim() ?? "",
  };

  if (existing) {
    const history = sortHistory([...existing.history, newRow]);
    unitPriceStore.set(key, { ...existing, history });
    return { ok: true, entry: { ...existing, history } };
  }

  const entry = {
    company: company.trim(),
    partNo: partNo.trim(),
    partName: partName?.trim() ?? "",
    history: [newRow],
  };
  unitPriceStore.set(key, entry);
  return { ok: true, entry };
}

export function calculateAmounts(qty, unitPrice) {
  const quantity = Number(qty) || 0;
  const price = Number(unitPrice) || 0;
  const supplyAmount = Math.round(quantity * price);
  const vat = Math.round(supplyAmount * 0.1);
  const totalAmount = supplyAmount + vat;
  return { supplyAmount, vat, totalAmount };
}
