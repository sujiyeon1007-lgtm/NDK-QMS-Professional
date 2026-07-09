# Project TITAN V1.1 — SQLite Migration Blueprint

**Status:** PM Blueprint (Design Only) · **2026-07-10**  
**Scope:** V1.1 development kickoff — **no RC1 runtime SQLite code**  
**RC1 Official:** sessionStorage SSOT · SQLite implementation deferred to V1.1 Sprint  
**Code SSoT referenced:** `src/config/repositoryArchitecture.js` · `src/foundation/data/TitanDataEngine.js` · `src/foundation/data/titanDataStorageKeys.js` · `src/utils/productionRecords.js` · `src/utils/masterData.js` · `src/utils/titanHistorySession.js` · `src/utils/qrRegistryStore.js` · `src/database/schemas/qrRegistry.sql` · `src/config/mesArchitecturePolicy.js` (`DEFERRED_INTEGRATION` includes `sqlite-swap`)

---

## Document Purpose

RC1에서 **sessionStorage Official Freeze**가 확정되었다. 본 문서는 **V1.1 전환 시 SQLite 영속화** 설계를 PM 승인용 Blueprint로 고정한다.

**Architecture Lock (Platform REV.6):**

- **UI · Workflow 불변** — Repository / Adapter / IPC만 교체 (`REPOSITORY_SWAP_POLICY`)
- **Primary Key:** `mesManagementNo` (Demo: `record.id` alias — `DEMO_ID_FIELD_ALIAS`)
- **File Blob SQLite 저장 금지** — Storage 폴더 + SQLite metadata (`STORAGE_ARCHITECTURE` · Official Architecture §6–§8)

---

## ① 현재 Session 구조 (Inventory)

V1.0 / RC1 Demo는 **Browser sessionStorage** + `readJson` / `writeJson` (`sessionStorageAdapter`) 패턴이다. UI는 **직접 sessionStorage 접근 금지** 원칙이나, Demo·Legacy Session 모듈과 **TitanDataEngine Store**가 병행한다.

### A. Operations SSOT (P0 · Write Path)

| Domain | sessionStorage Key | Module (SSoT) | Notes |
|--------|-------------------|---------------|-------|
| **productionRecords** | `titan-operations-production-records-v1` | `src/utils/productionRecords.js` | 입고·출고·재고·Workflow 연동 · PK `mesManagementNo` / `id` |
| **shipmentEvents** | `titan-operations-shipment-events-v1` | `src/utils/titanHistorySession.js` | 출고 이벤트 |
| **transactionStatements** | `titan-operations-transaction-statements-v1` | `titanHistorySession.js` | 거래명세서 발행 이력 |
| **defectRecords** | `titan-operations-defect-records-v1` | `titanHistorySession.js` | 불량 이력 |
| **operationsDataMode** | `titan-operations-data-mode-v1` | `presentationBuildPolicy.js` | Demo / QA seed mode |

### B. Master Data (Legacy + Engine)

| Domain | sessionStorage Key | Module | Notes |
|--------|-------------------|--------|-------|
| **masterData (bundle)** | `project-titan-master-data-v3` | `src/utils/masterData.js` · `masterConstants.js` | 거래처·제품·재질·공정·설비·작업자 통합 JSON |
| **masterExcelImportLog** | `project-titan-master-excel-import-log-v1` | `masterExcelImportLog.js` | Import audit |

### C. TitanDataEngine V1.6 (Namespaced Stores)

Namespace: `titan-data-engine-v1.6` (`TITAN_DATA_ENGINE_NAMESPACE`)

| Store | Key suffix | File |
|-------|------------|------|
| meta | `/meta` | `TitanDataEngine.js` |
| equipment | `/equipment` | `equipmentStore.js` |
| lots | `/lots` | `lotStore.js` |
| production | `/production` | `productionStore.js` |
| quality | `/quality` | `qualityStore.js` |
| dashboard | `/dashboard` | `dashboardStore.js` |
| timeline | `/timeline` | `timelineStore.js` |
| customer | `/master/customer` | `customerStore.js` |
| product | `/master/product` | `productStore.js` |
| material | `/master/material` | `materialStore.js` |
| process | `/master/process` | `processStore.js` |
| worker | `/master/worker` | `workerStore.js` |
| company | `/master/company` | `companyStore.js` |

### D. Quality · Inspection · Certificate

| Domain | Key | Module |
|--------|-----|--------|
| inspectionLog | `project-titan-inspection-log-v3` | `inspectionLogSession.js` |
| inspectionReport | `project-titan-inspection-report-v1` | `inspectionReportSession.js` |
| otherInspection | `project-titan-other-inspection-v1` | `otherInspectionSession.js` |
| developmentInspection | `project-titan-development-inspection-v1` | `developmentInspectionSession.js` |
| certificateFiles | `project-titan-certificate-files-v2` | `certificateSession.js` |
| defectHistory (legacy) | `titan-defect-history-v2` | `defectHistorySession.js` |

### E. QR · Document · Workflow UI State

| Domain | Key | Module |
|--------|-----|--------|
| qrRegistry | `project-titan-qr-registry-v1` | `qrRegistryStore.js` (schema: `qrRegistry.sql`) |
| qrEngineRecentScans | `titan-qr-engine-recent-scans-v1` | `qrEngineArchitecture.js` |
| documentMetadata | `project-titan-document-metadata-v1` | `documentMetadataSession.js` |
| documentJson | `project-titan-document-json-v1` | `titanDocumentJsonModel.js` |
| qualityNotices | `project-titan-quality-notices-v1` | `qualityNoticeSession.js` |
| incomingDocumentArchive | `project-titan-incoming-document-archive-v1` | `incomingDocumentArchiveSession.js` |
| foundationAttachments | `titan-document-foundation-attachments-v1` | `documentFoundationAttachments.js` |

### F. Repository Layer (Read Path · V1.0)

`getRepositories()` → `createSessionRepositories()` (`src/repositories/index.js`)

| Repository | Session impl | Oracle PoC |
|------------|--------------|------------|
| CustomerRepository | session | oracle (Electron) |
| ProductRepository | session | oracle |
| IncomingRepository | session | oracle |
| InspectionRepository | session | oracle |
| CertificateRepository | session | oracle |

**Backend enum:** `REPOSITORY_BACKEND.STANDALONE_V1_0 = sessionStorage` · `STANDALONE_V1_1 = sqlite` (planned)

### G. App / UX Session (Migrate last · or keep session)

Auth (`project-titan-auth-data-v1`), edition, environment settings, search history, column visibility, work journal, department work, HOME widgets — **SQLite 대상 아님** 또는 **app_meta / user_prefs** 테이블로 선택 이전.

---

## ② SQLite 테이블 설계

**DB file (Electron):** `{storageRoot}/titan/titan-qms.db`  
**Engine:** `better-sqlite3` (Main Process only)  
**Convention:** snake_case columns · ISO8601 TEXT dates · JSON TEXT for nested blobs (workflow payload, HT calc)

### Core Master

```sql
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  part_no TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  UNIQUE(company_id, part_no)
);

CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL
);

CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  process_slug TEXT,
  payload_json TEXT NOT NULL
);
```

### Operations · Production (Workflow Hub)

```sql
CREATE TABLE production_records (
  mes_management_no TEXT PRIMARY KEY NOT NULL,
  lot_no TEXT,
  company_id TEXT REFERENCES companies(id),
  product_id TEXT REFERENCES products(id),
  current_process TEXT NOT NULL,
  workflow_status_json TEXT,
  record_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_production_records_lot ON production_records(lot_no);
CREATE INDEX idx_production_records_process ON production_records(current_process);

CREATE TABLE shipment_events (
  id TEXT PRIMARY KEY,
  mes_management_no TEXT NOT NULL REFERENCES production_records(mes_management_no),
  event_json TEXT NOT NULL,
  shipped_at TEXT NOT NULL
);
```

### Quality

```sql
CREATE TABLE inspection_logs (
  id TEXT PRIMARY KEY,
  mes_management_no TEXT NOT NULL REFERENCES production_records(mes_management_no),
  log_json TEXT NOT NULL,
  inspected_at TEXT,
  result TEXT
);

CREATE TABLE certificate_files (
  id TEXT PRIMARY KEY,
  mes_management_no TEXT NOT NULL REFERENCES production_records(mes_management_no),
  cert_no TEXT,
  file_path TEXT NOT NULL,
  meta_json TEXT NOT NULL,
  issued_at TEXT
);
```

### QR · Timeline · Meta

```sql
-- Align with src/database/schemas/qrRegistry.sql
CREATE TABLE qr_registry (
  id TEXT PRIMARY KEY NOT NULL,
  qr_type TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  created_by TEXT,
  regenerated_at TEXT,
  regenerated_by TEXT,
  print_count INTEGER NOT NULL DEFAULT 0,
  last_printed_at TEXT,
  deleted_at TEXT,
  UNIQUE (qr_type, entity_key)
);

CREATE TABLE workflow_timeline (
  id TEXT PRIMARY KEY,
  mes_management_no TEXT REFERENCES production_records(mes_management_no),
  event_type TEXT NOT NULL,
  event_json TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);

CREATE TABLE app_meta (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE migration_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phase TEXT NOT NULL,
  source_key TEXT,
  row_count INTEGER,
  status TEXT NOT NULL,
  message TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);
```

### Relations (Summary)

```text
companies 1—N products
production_records (PK mes_management_no) 1—N shipment_events | inspection_logs | certificate_files | workflow_timeline
qr_registry: logical link via entity_key (= mes_management_no | equipment code | lot)
```

**TitanDataEngine** namespaced keys → **normalize into** master tables + `production_records` + `workflow_timeline` during migration (duplicate master JSON 제거).

---

## ③ Migration 순서

**Rule:** Master first · FK-safe · UI read-only until cutover flag set.

| Phase | Scope | Session / Store sources |
|-------|--------|-------------------------|
| 1 **Master** | companies, products, materials, equipment, workers/process | `project-titan-master-data-v3`, TitanDataEngine `/master/*` |
| 2 **QR Registry** | qr_registry | `project-titan-qr-registry-v1`, `qrRegistry.sql` |
| 3 **Operations** | production_records, shipment_events, transaction statement meta | `titan-operations-production-records-v1`, history session keys |
| 4 **Production** | lots, production store, lot lifecycle | DataEngine `/lots`, `/production`, `titan-lot-lifecycle-events` |
| 5 **Quality** | inspection_logs, certificate_files | inspection* session keys, certificate session |
| 6 **Document** | document metadata, quality notices, incoming archive (metadata only) | document* sessions, Storage paths |
| 7 **Statistics** | materialized aggregates or replay from production_records | analytics rebuild job |

Each phase: **backup → import → validate row counts → migration_log → rollback script**.

---

## ④ Repository 구조 (session → sqlite)

**Target API unchanged:** `getRepositories()` (`src/repositories/index.js`)

```text
React UI
  → getRepositories()
       ├─ session  → createSessionRepositories()     [RC1 / browser dev]
       ├─ oracle   → createOracleRepositories()       [MES PoC · Electron]
       └─ sqlite   → createSqliteRepositories()       [V1.1 Release · Electron]
```

| Component | Path (planned) | Role |
|-----------|----------------|------|
| `setRepositoryBackend('sqlite')` | `repositories/index.js` | Edition / env switch |
| `createSqliteRepositories()` | `repositories/sqlite/createSqliteRepositories.js` | Factory |
| `sqliteAdapter` | `repositories/sqlite/sqliteAdapter.js` | CRUD · transactions |
| IPC bridge | `electron/preload.cjs` + `electron/main.mjs` | Renderer **never** loads better-sqlite3 |

**Swap policy:** `mesArchitecturePolicy.js` · `DEFERRED_INTEGRATION` = `sqlite-swap` until V1.1 gate.

---

## ⑤ Electron (better-sqlite3 · IPC)

| Layer | Responsibility |
|-------|----------------|
| **electron-builder** | Package `Project TITAN.exe`, bundle `better-sqlite3` native rebuild for target arch |
| **Main Process** | Open DB, migrations, backup, `better-sqlite3` |
| **Preload** | `contextBridge.exposeInMainWorld('titanDb', { invoke methods })` |
| **Renderer** | Repository → IPC only |

**Channels (example):** `titan:db:query`, `titan:db:run`, `titan:db:migrate`, `titan:db:backup`

**Dev:** `npm run electron:dev` — same IPC path as production.

---

## ⑥ Migration 방법 (First-run)

1. **Detect:** `app_meta.migration_version` absent → first Electron launch after upgrade.
2. **Backup:** Copy sessionStorage export JSON + optional `titan-qms.db` snapshot to `{storageRoot}/backup/pre-sqlite-{timestamp}/`.
3. **Export:** Renderer serializes known keys (§① inventory) to Main via IPC `titan:migrate:importSession`.
4. **Import:** Main runs phased migration (§③) inside transaction per phase.
5. **Validate:** Row counts vs session arrays; sample `mesManagementNo` workflow spot-check.
6. **Cutover:** Set `app_meta.repository_backend = sqlite`; restart with `getRepositories()` on sqlite.
7. **Rollback:** Restore backup JSON → sessionStorage (browser tools) or restore DB file.

**RC1:** No auto-migration code shipped — Blueprint only.

---

## ⑦ 예상 Sprint (V1.1-0 … V1.1-7)

| Sprint | Focus | Duration (est.) |
|--------|--------|-----------------|
| **V1.1-0** | Schema freeze · `qrRegistry.sql` merge · migration_log · app_meta | 1 week |
| **V1.1-1** | Electron IPC skeleton · better-sqlite3 PoC · DB path from Storage settings | 1.5 weeks |
| **V1.1-2** | Master migration + `createSqliteRepositories` (Customer/Product) | 2 weeks |
| **V1.1-3** | Operations `production_records` + shipment_events | 2 weeks |
| **V1.1-4** | Quality inspection + certificate metadata | 2 weeks |
| **V1.1-5** | QR registry + workflow_timeline | 1 week |
| **V1.1-6** | Document metadata + first-run migration UX + backup | 2 weeks |
| **V1.1-7** | Statistics rebuild · regression · EXE build · PM sign-off | 2 weeks |

**Total:** ~13.5 weeks (parallel QA throughout)

---

## ⑧ 예상 작업 규모

| Area | Files / artifacts (est.) | Effort |
|------|---------------------------|--------|
| SQL schema + migrations | 8–12 files | M |
| `repositories/sqlite/*` | 15–25 files | L |
| Electron IPC + preload | 5–8 files | M |
| Session → SQL importers | 10–15 modules | L |
| Tests / verify scripts | 5–10 mjs | M |
| Docs + Rule sync | 3–5 | S |

**~4–6 engineer-months** (1 dev full-time equivalent) including regression and Demo seed parity.

---

## ⑨ 리스크

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dual SSOT (productionRecords vs TitanDataEngine) | Data drift | Migration normalization rules · single write path post-cutover |
| Native module rebuild (better-sqlite3) | EXE build fail | electron-rebuild in CI · lock Node/Electron versions |
| Large session JSON | Migration timeout | Chunked IPC · phase transactions |
| Workflow regression | Production stop | Phase validation · keep session backup · feature flag backend |
| File paths vs DB | Broken PDF links | Storage root migration with path remap table |
| Browser-only Vercel Beta | SQLite N/A | Beta stays session; SQLite = Electron Release only |

---

## ⑩ 권장 개발 순서

1. **Freeze schema** (§②) + align `qrRegistry.sql` — PM sign-off  
2. **IPC + empty DB** — no UI change  
3. **Implement sqlite Customer/Product repos** — parity tests vs session  
4. **Migrate Master** — importers + validation  
5. **production_records** cutover (Operations P0)  
6. **Quality + Certificate** repos  
7. **QR + timeline**  
8. **First-run migration + backup UX**  
9. **Statistics recompute**  
10. **Electron EXE · RC2** — RC1 remains sessionStorage only  

---

## RC1 Policy Reminder

- **sessionStorage Official Freeze** for RC1 Presentation / Beta demo.
- **No SQLite runtime code** in RC1 branch (`DEFERRED_INTEGRATION` · `sqlite-swap`).
- V1.1 work starts from **approved Blueprint** → implementation Sprints §⑦.

---

*Generated by Project TITAN V1.1 Architecture · Repository swap only · UI/Workflow unchanged.*
