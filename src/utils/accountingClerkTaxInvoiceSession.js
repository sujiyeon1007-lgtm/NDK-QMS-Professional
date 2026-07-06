/**
 * Project TITAN — 경리관리 세금계산서 발행 여부 (SessionStorage)
 */

import {
  TAX_INVOICE_STATUS,
  TAX_INVOICE_STATUS_LABELS,
} from "../config/accountingClerkPolicy";
import { getCurrentTitanUser, getTransactionStatements } from "./titanHistorySession";

const STORAGE_KEY = "accounting_clerk_tax_invoice_status";

function readStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(rows) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function buildSeedFromStatements() {
  const statements = getTransactionStatements();
  return statements.map((stmt) => ({
    id: `TI-${stmt.id}`,
    statementId: stmt.id,
    company: stmt.company,
    managementId: stmt.managementId,
    partName: stmt.partName ?? "",
    partNo: stmt.partNo ?? "",
    material: stmt.material ?? "",
    shippedAt: stmt.printedAt,
    supplyAmount: stmt.supplyAmount,
    vat: stmt.vat,
    issueStatus: TAX_INVOICE_STATUS.UNISSUED,
    issuedAt: "",
    manager: "",
    note: "",
    updatedAt: "",
    updatedBy: "",
  }));
}

const FALLBACK_SEED = [
  {
    id: "TI-TS-20260629-001",
    statementId: "TS-DEMO-003",
    company: "서암기계공업",
    managementId: "SE_20260703_0020",
    partName: "#2 PINION GEAR",
    partNo: "CWFYH11251",
    material: "SACM645",
    shippedAt: "2026-06-29",
    supplyAmount: 513128,
    vat: 51313,
    issueStatus: TAX_INVOICE_STATUS.ISSUED,
    issuedAt: "2026-06-30",
    manager: "경리 / 김경리",
    note: "홈택스 발행 완료",
    updatedAt: "2026-06-30",
    updatedBy: "경리 / 김경리",
  },
  {
    id: "TI-DEMO-002",
    statementId: "",
    company: "대한정밀",
    managementId: "DH_20260701_0003",
    partName: "SHAFT",
    partNo: "DH-SHAFT-01",
    material: "SCM440",
    shippedAt: "2026-07-02",
    supplyAmount: 880000,
    vat: 88000,
    issueStatus: TAX_INVOICE_STATUS.UNISSUED,
    issuedAt: "",
    manager: "",
    note: "",
    updatedAt: "",
    updatedBy: "",
  },
];

function ensureSeed() {
  const stored = readStorage();
  if (stored?.length) return stored;

  const fromStatements = buildSeedFromStatements();
  const seed = fromStatements.length ? fromStatements : FALLBACK_SEED;
  writeStorage(seed);
  return seed;
}

export function getTaxInvoiceStatusRows() {
  return [...ensureSeed()].sort((a, b) => b.shippedAt.localeCompare(a.shippedAt));
}

export function getTaxInvoiceStatusById(id) {
  return getTaxInvoiceStatusRows().find((row) => row.id === id) ?? null;
}

export function updateTaxInvoiceStatus(id, patch = {}) {
  const rows = ensureSeed();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return null;

  const next = {
    ...rows[index],
    ...patch,
    updatedAt: new Date().toISOString().slice(0, 10),
    updatedBy: getCurrentTitanUser(),
  };

  if (next.issueStatus === TAX_INVOICE_STATUS.ISSUED && !next.issuedAt) {
    next.issuedAt = next.updatedAt;
  }
  if (next.issueStatus === TAX_INVOICE_STATUS.UNISSUED) {
    next.issuedAt = patch.issuedAt ?? "";
  }

  rows[index] = next;
  writeStorage(rows);
  return next;
}

export function mapTaxInvoiceListRow(row) {
  return {
    id: row.id,
    company: row.company ?? "—",
    managementId: row.managementId ?? "—",
    partName: row.partName ?? "—",
    partNo: row.partNo ?? "—",
    material: row.material ?? "—",
    shippedAt: row.shippedAt ?? "—",
    supplyAmount: row.supplyAmount ?? 0,
    supplyAmountLabel: Number(row.supplyAmount ?? 0).toLocaleString("ko-KR"),
    vat: row.vat ?? 0,
    vatLabel: Number(row.vat ?? 0).toLocaleString("ko-KR"),
    issueStatus: row.issueStatus ?? TAX_INVOICE_STATUS.UNISSUED,
    issueStatusLabel: TAX_INVOICE_STATUS_LABELS[row.issueStatus] ?? "미발행",
    issuedAt: row.issuedAt || "—",
    manager: row.manager || "—",
    note: row.note || "—",
    raw: row,
  };
}
