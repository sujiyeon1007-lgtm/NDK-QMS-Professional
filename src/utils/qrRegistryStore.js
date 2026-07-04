/**
 * Project TITAN V1.3 — QR Registry unified store (SQLite-ready)
 * Browser: sessionStorage adapter · Electron: IPC stub via window.titanQrRegistry (future)
 *
 * @see src/database/schemas/qrRegistry.sql
 */

import { getCurrentTitanUser } from "./titanHistorySession";

export const QR_REGISTRY_TYPES = {
  INOUT: "inout",
  EQUIPMENT: "equipment",
};

const STORAGE_KEY = "project-titan-qr-registry-v1";

/** @typedef {"inout"|"equipment"} QrRegistryType */
/** @typedef {"active"|"regenerated"} QrRegistryStatus */

/**
 * @typedef {object} QrRegistryRow
 * @property {string} id
 * @property {QrRegistryType} qrType
 * @property {string} entityKey
 * @property {string} payload
 * @property {QrRegistryStatus} status
 * @property {string} createdAt
 * @property {string|null} createdBy
 * @property {string|null} regeneratedAt
 * @property {string|null} regeneratedBy
 * @property {number} printCount
 * @property {string|null} lastPrintedAt
 * @property {string|null} deletedAt
 */

function getElectronAdapter() {
  if (typeof globalThis.window === "undefined") return null;
  const bridge = globalThis.window.titanQrRegistry;
  if (!bridge || typeof bridge.invoke !== "function") return null;
  return bridge;
}

function safeReadSessionRows() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.rows) ? parsed.rows : [];
  } catch {
    return [];
  }
}

function safeWriteSessionRows(rows) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify({ rows }));
  } catch {
    /* ignore */
  }
}

function normalizeRow(row) {
  if (!row) return null;
  return {
    id: String(row.id ?? ""),
    qrType: row.qrType ?? row.qr_type,
    entityKey: String(row.entityKey ?? row.entity_key ?? ""),
    payload: String(row.payload ?? ""),
    status: row.status === "regenerated" ? "regenerated" : "active",
    createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
    createdBy: row.createdBy ?? row.created_by ?? null,
    regeneratedAt: row.regeneratedAt ?? row.regenerated_at ?? null,
    regeneratedBy: row.regeneratedBy ?? row.regenerated_by ?? null,
    printCount: Number(row.printCount ?? row.print_count ?? 0) || 0,
    lastPrintedAt: row.lastPrintedAt ?? row.last_printed_at ?? null,
    deletedAt: row.deletedAt ?? row.deleted_at ?? null,
  };
}

function activeRows(rows) {
  return rows.map(normalizeRow).filter((row) => row && !row.deletedAt);
}

async function readAllRows() {
  const electron = getElectronAdapter();
  if (electron) {
    try {
      const result = await electron.invoke("list", {});
      return activeRows(Array.isArray(result) ? result : []);
    } catch {
      /* fall through to session */
    }
  }
  return activeRows(safeReadSessionRows());
}

async function writeAllRows(rows) {
  const electron = getElectronAdapter();
  if (electron) {
    try {
      await electron.invoke("replaceAll", { rows });
      return;
    } catch {
      /* fall through */
    }
  }
  safeWriteSessionRows(rows);
}

function buildId(qrType, entityKey) {
  return `QR-${qrType}-${entityKey}`;
}

export async function listQrRegistry(qrType = null) {
  const rows = await readAllRows();
  if (!qrType) return rows;
  return rows.filter((row) => row.qrType === qrType);
}

export async function getQrById(id) {
  const rows = await readAllRows();
  return rows.find((row) => row.id === id) ?? null;
}

export async function getQrByEntity(qrType, entityKey) {
  const key = String(entityKey ?? "").trim();
  if (!key) return null;
  const rows = await readAllRows();
  return rows.find((row) => row.qrType === qrType && row.entityKey === key) ?? null;
}

/** Sync helpers for legacy callers (session-only, immediate) */
export function listQrRegistrySync(qrType = null) {
  const rows = activeRows(safeReadSessionRows());
  if (!qrType) return rows;
  return rows.filter((row) => row.qrType === qrType);
}

export function getQrByEntitySync(qrType, entityKey) {
  const key = String(entityKey ?? "").trim();
  if (!key) return null;
  return listQrRegistrySync(qrType).find((row) => row.entityKey === key) ?? null;
}

export function getQrByIdSync(id) {
  return listQrRegistrySync().find((row) => row.id === id) ?? null;
}

function persistMutation(mutator) {
  const all = safeReadSessionRows().map(normalizeRow).filter(Boolean);
  const next = mutator(all);
  safeWriteSessionRows(next);
  return next;
}

/**
 * @param {QrRegistryType} qrType
 * @param {string} entityKey
 * @param {string} payload
 * @param {string} [createdBy]
 */
export function createQrRegistryEntry(qrType, entityKey, payload, createdBy = getCurrentTitanUser()) {
  const key = String(entityKey ?? "").trim();
  if (!key) return { ok: false, message: "대상 키가 없습니다." };
  if (!payload?.trim()) return { ok: false, message: "QR payload가 없습니다." };

  const existing = getQrByEntitySync(qrType, key);
  if (existing) return { ok: false, message: "이미 QR이 생성된 항목입니다." };

  const now = new Date().toISOString();
  const record = {
    id: buildId(qrType, key),
    qrType,
    entityKey: key,
    payload: payload.trim(),
    status: "active",
    createdAt: now,
    createdBy,
    regeneratedAt: null,
    regeneratedBy: null,
    printCount: 0,
    lastPrintedAt: null,
    deletedAt: null,
  };

  persistMutation((rows) => [record, ...rows.filter((row) => !(row.qrType === qrType && row.entityKey === key))]);
  return { ok: true, record };
}

export function regenerateQrRegistryEntry(id, payload, regeneratedBy = getCurrentTitanUser()) {
  const current = getQrByIdSync(id);
  if (!current) return { ok: false, message: "QR을 찾을 수 없습니다." };

  const next = {
    ...current,
    payload: payload?.trim() || current.payload,
    status: "regenerated",
    regeneratedAt: new Date().toISOString(),
    regeneratedBy,
  };

  persistMutation((rows) => rows.map((row) => (row.id === id ? next : row)));
  return { ok: true, record: next };
}

export function markQrRegistryPrinted(ids = []) {
  const idSet = new Set(ids.filter(Boolean));
  if (!idSet.size) return { ok: false, message: "출력할 QR이 없습니다." };

  const now = new Date().toISOString();
  let updated = 0;

  persistMutation((rows) =>
    rows.map((row) => {
      if (!idSet.has(row.id)) return row;
      updated += 1;
      return {
        ...row,
        printCount: (row.printCount ?? 0) + 1,
        lastPrintedAt: now,
      };
    })
  );

  return { ok: updated > 0, count: updated };
}

export function deleteQrRegistryEntry(id) {
  const current = getQrByIdSync(id);
  if (!current) return { ok: false, message: "QR을 찾을 수 없습니다." };

  persistMutation((rows) =>
    rows.map((row) =>
      row.id === id ? { ...row, deletedAt: new Date().toISOString() } : row
    )
  );
  return { ok: true, record: current };
}

export function upsertQrRegistryEntry(record) {
  if (!record?.qrType || !record?.entityKey) return { ok: false, message: "레코드 형식 오류" };
  persistMutation((rows) => {
    const filtered = rows.filter(
      (row) => !(row.qrType === record.qrType && row.entityKey === record.entityKey)
    );
    return [normalizeRow(record), ...filtered];
  });
  return { ok: true, record: normalizeRow(record) };
}

export function importQrRegistryRows(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return { ok: true, count: 0 };
  let count = 0;
  rows.forEach((row) => {
    const normalized = normalizeRow(row);
    if (!normalized) return;
    upsertQrRegistryEntry(normalized);
    count += 1;
  });
  return { ok: true, count };
}
