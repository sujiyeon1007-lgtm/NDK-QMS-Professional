-- Project TITAN V1.1 Sprint 1 — Master SQLite Schema (PM Official)
-- Engine: better-sqlite3 (Electron Main Process only)
-- Convention: payload_json stores full row object; indexed columns for lookup

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS master_companies (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS master_products (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT,
  part_no TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_master_products_part_no ON master_products(part_no);

CREATE TABLE IF NOT EXISTS master_materials (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS master_equipment (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT UNIQUE NOT NULL,
  process_slug TEXT,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS master_workers (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS master_processes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS master_internal_items (
  id TEXT PRIMARY KEY NOT NULL,
  item_name TEXT,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
