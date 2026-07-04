-- Project TITAN V1.3 — QR Registry (SQLite-ready)
-- Metadata only — QR payload stored as text; no file blobs.

CREATE TABLE IF NOT EXISTS qr_registry (
  id TEXT PRIMARY KEY NOT NULL,
  qr_type TEXT NOT NULL CHECK (qr_type IN ('inout', 'equipment')),
  entity_key TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'regenerated')),
  created_at TEXT NOT NULL,
  created_by TEXT,
  regenerated_at TEXT,
  regenerated_by TEXT,
  print_count INTEGER NOT NULL DEFAULT 0,
  last_printed_at TEXT,
  deleted_at TEXT,
  UNIQUE (qr_type, entity_key)
);

CREATE INDEX IF NOT EXISTS idx_qr_registry_type ON qr_registry (qr_type);
CREATE INDEX IF NOT EXISTS idx_qr_registry_entity ON qr_registry (entity_key);
CREATE INDEX IF NOT EXISTS idx_qr_registry_status ON qr_registry (status);
