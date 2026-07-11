import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "electron";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, "../../src/database/schemas/master-v11.sql");
const V11_SPRINT1_MASTER_VERSION = "V1.1-SPRINT1-MASTER-1.0";

const CATEGORY_TABLE = {
  companies: "master_companies",
  products: "master_products",
  materials: "master_materials",
  equipment: "master_equipment",
  workers: "master_workers",
  heatTreatment: "master_processes",
  internalItems: "master_internal_items",
};

/** @type {import("better-sqlite3").Database | null} */
let db = null;
let driverAvailable = false;
let driverMessage = null;

function resolveDbPath() {
  const userData = app?.getPath?.("userData") ?? process.cwd();
  const dir = path.join(userData, "titan");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "titan-qms.db");
}

async function loadDriver() {
  try {
    const mod = await import("better-sqlite3");
    const Database = mod.default ?? mod;
    driverAvailable = true;
    return Database;
  } catch (error) {
    driverAvailable = false;
    driverMessage = error?.message ?? "better-sqlite3 not installed";
    return null;
  }
}

function applySchema(database) {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  database.exec(sql);
  const now = new Date().toISOString();
  database.prepare(
    "INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run("schema_version", V11_SPRINT1_MASTER_VERSION, now);
}

function extractIndexedFields(row) {
  const id = String(row?.id ?? row?.code ?? row?.partNo ?? row?.name ?? "").trim();
  return {
    id: id || `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    code: row?.code ? String(row.code).trim() : null,
    name: row?.name ? String(row.name).trim() : row?.itemName ? String(row.itemName).trim() : null,
    partNo: row?.partNo ? String(row.partNo).trim() : null,
    companyId: row?.companyId ? String(row.companyId).trim() : row?.company ? String(row.company).trim() : null,
    processSlug: row?.processSlug ? String(row.processSlug).trim() : row?.process ? String(row.process).trim() : null,
    itemName: row?.itemName ? String(row.itemName).trim() : row?.name ? String(row.name).trim() : null,
  };
}

function insertRowStatement(database, table, row, updatedAt) {
  const fields = extractIndexedFields(row);
  const payload = JSON.stringify(row ?? {});

  switch (table) {
    case "master_companies":
      database.prepare(
        "INSERT OR REPLACE INTO master_companies (id, code, name, payload_json, updated_at) VALUES (?, ?, ?, ?, ?)"
      ).run(fields.id, fields.code, fields.name ?? fields.id, payload, updatedAt);
      break;
    case "master_products":
      database.prepare(
        "INSERT OR REPLACE INTO master_products (id, company_id, part_no, payload_json, updated_at) VALUES (?, ?, ?, ?, ?)"
      ).run(fields.id, fields.companyId, fields.partNo ?? fields.id, payload, updatedAt);
      break;
    case "master_materials":
      database.prepare(
        "INSERT OR REPLACE INTO master_materials (id, name, payload_json, updated_at) VALUES (?, ?, ?, ?)"
      ).run(fields.id, fields.name ?? fields.id, payload, updatedAt);
      break;
    case "master_equipment":
      database.prepare(
        "INSERT OR REPLACE INTO master_equipment (id, code, process_slug, payload_json, updated_at) VALUES (?, ?, ?, ?, ?)"
      ).run(fields.id, fields.code ?? fields.id, fields.processSlug, payload, updatedAt);
      break;
    case "master_workers":
      database.prepare(
        "INSERT OR REPLACE INTO master_workers (id, code, name, payload_json, updated_at) VALUES (?, ?, ?, ?, ?)"
      ).run(fields.id, fields.code, fields.name ?? fields.id, payload, updatedAt);
      break;
    case "master_processes":
      database.prepare(
        "INSERT OR REPLACE INTO master_processes (id, name, payload_json, updated_at) VALUES (?, ?, ?, ?)"
      ).run(fields.id, fields.name ?? fields.id, payload, updatedAt);
      break;
    case "master_internal_items":
      database.prepare(
        "INSERT OR REPLACE INTO master_internal_items (id, item_name, payload_json, updated_at) VALUES (?, ?, ?, ?)"
      ).run(fields.id, fields.itemName, payload, updatedAt);
      break;
    default:
      throw new Error(`Unknown master table: ${table}`);
  }
}

export async function initTitanDatabase() {
  const Database = await loadDriver();
  if (!Database) {
    return { ok: false, message: driverMessage ?? "better-sqlite3 unavailable" };
  }
  if (!db) {
    db = new Database(resolveDbPath());
    db.pragma("journal_mode = WAL");
    applySchema(db);
  }
  return { ok: true, path: resolveDbPath(), schemaVersion: V11_SPRINT1_MASTER_VERSION };
}

export function getTitanDatabaseStatus() {
  return {
    available: Boolean(db) && driverAvailable,
    driverAvailable,
    driverMessage,
    path: db ? resolveDbPath() : null,
    schemaVersion: V11_SPRINT1_MASTER_VERSION,
  };
}

export function listMasterRows(category) {
  if (!db) return { ok: false, rows: [], message: "Database not initialized" };
  const table = CATEGORY_TABLE[category];
  if (!table) return { ok: false, rows: [], message: `Unknown category: ${category}` };
  const rows = db.prepare(`SELECT payload_json FROM ${table} ORDER BY updated_at DESC`).all();
  const parsed = rows.map((row) => {
    try { return JSON.parse(row.payload_json); } catch { return null; }
  }).filter(Boolean);
  return { ok: true, rows: parsed, count: parsed.length };
}

export function replaceAllMasterRows(category, rows) {
  if (!db) return { ok: false, count: 0, message: "Database not initialized" };
  const table = CATEGORY_TABLE[category];
  if (!table) return { ok: false, count: 0, message: `Unknown category: ${category}` };
  const list = Array.isArray(rows) ? rows : [];
  const updatedAt = new Date().toISOString();
  const tx = db.transaction((items) => {
    db.prepare(`DELETE FROM ${table}`).run();
    for (const row of items) insertRowStatement(db, table, row, updatedAt);
    db.prepare(
      "INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    ).run(`master:${category}:count`, String(items.length), updatedAt);
  });
  tx(list);
  return { ok: true, count: list.length, category, table };
}

export function closeTitanDatabase() {
  if (db) { db.close(); db = null; }
}
