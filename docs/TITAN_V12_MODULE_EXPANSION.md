# Project TITAN V1.2 — Module Expansion

**Lock Date:** 2026-07-04  
**Type:** Architecture Lock (UI 변경 ❌ · Config · Rule · 문서)  
**SSoT (Code):** `src/config/titanV12ModuleExpansion.js`

---

## 1. 개요

Project TITAN은 **QMS에서 시작**하여 회사 전체 운영 플랫폼으로 확장 가능합니다.

V1.2 Module Expansion:
- **경리관리** · **회계관리** 모듈 추가
- 모든 확장 기능 = **선택형 모듈** (환경설정 ON/OFF)
- 기능 **삭제 ❌** — OFF 시 숨김만 · 데이터 유지

### 개발 원칙

> *"사용할 수도 있고, 사용하지 않을 수도 있는"* 선택형 Module 구조

---

## 2. 모듈 관리 구조

```text
관리자 → 환경설정 → 모듈 관리 (/environment/modules)
```

| 모듈 | 기본 | ON/OFF |
|------|------|--------|
| 품질관리 | ON | Core (고정) |
| 생산관리 | ON | Core |
| 성적서관리 | ON | Core |
| 출고관리 | ON | Core |
| QR 시스템 | ON | Core |
| NFC 시스템 | OFF | Toggle |
| **경리관리** | OFF | **Toggle** |
| **회계관리** | OFF | **Toggle** |
| 문서관리 | ON | Toggle |
| 설비관리 | ON | Toggle |
| 통계관리 | ON | Toggle |

Config: `TITAN_MODULE_REGISTRY` in `titanV12ModuleExpansion.js`

---

## 3. ON/OFF 동작 방식

### OFF 시

| 영역 | 동작 |
|------|------|
| **Sidebar** | 해당 모듈 메뉴 숨김 |
| **HOME** | 관련 위젯·빠른 메뉴 숨김 |
| **권한** | 권한 화면 해당 항목 숨김 |
| **DB/Session** | **데이터 유지 · 삭제 ❌** |
| **Smart Access** | 해당 QR target 비활성 안내 (향후) |

### 다시 ON 시

- Sidebar · HOME · 권한 즉시 복원
- **기존 데이터 그대로** 사용

Helpers: `isModuleEnabled()` · `getEnabledMenuIds()` · `getVisiblePermissionKeys()`

---

## 4. 메뉴 표시 방식

```text
moduleFlags (Session/SQLite)
    ↓
isModuleEnabled(moduleId)
    ↓
getEnabledMenuIds() → Sidebar filter
    ↓
getVisiblePermissionKeys() → 권한 UI filter
    ↓
HOME widget registry → moduleId별 filter
```

- V1.2 Menu Architecture (`titanV12MenuArchitecture.js`)의 `menuId` ↔ `TITAN_MODULE_REGISTRY.menuIds` 연동
- **Runtime Sidebar V1.3** — PM 승인 후 ModuleGuard 적용

---

## 5. 권한 연동 방식

| Layer | Rule |
|-------|------|
| **Module OFF** | `permissionKeys` 숨김 — 역할 편집 UI에서 제외 |
| **Module ON** | 기존 역할 프로필의 저장된 권한 복원 |
| **Core modules** | `toggleable: false` — 항상 ON |
| **향후** | `PERMISSION_MENUS` → module-aware keys 확장 |

현재: `environmentSettingsSession.js` → `PERMISSION_MENUS` (향후 `moduleFlags` 연동)

---

## 6. DB 설계 방향

### Module Flags

```text
titan_module_flags
  module_id · enabled · updated_at · updated_by
```

### Data Retention

- **module_off_no_delete** — OFF = soft hide only
- 모듈별 namespace 분리:

| Module | Tables (planned) |
|--------|------------------|
| 경리관리 | invoices · closings · receivables · tax_invoice_status |
| 회계관리 | journal_entries · accounts · vat_summary |
| 문서관리 | document_registry · revisions |
| 품질 | inspection_logs · certificates |

V1.0: SessionStorage → V2: SQLite (`MODULE_DB_DESIGN`)

---

## 7. 경리관리 (실무 수준)

| 기능 | 비고 |
|------|------|
| 거래명세서 관리 | 출고 연계 |
| 거래명세서 재출력 | |
| 거래명세서 발행이력 | |
| 출고 마감 | |
| 월 마감 | |
| 미수금 관리 | |
| 거래처별 매출 | |
| 세금계산서 발행현황 | **홈택스 발행** — TITAN은 발행여부·일·상태만 |
| 매출 통계 | |

---

## 8. 회계관리 (ERP 대체 ❌)

| 기능 | 비고 |
|------|------|
| 회계전표 작성 | |
| 회계전표 조회 | |
| 전표 승인 | |
| 계정과목 관리 | |
| 월별 현황 | |
| 원가 현황 | |
| 부가세 관리(현황) | |

사용하지 않는 회사 → **모듈 OFF**

---

## 9. MES/ERP 연동 가능 구조

### MES 구축 후

| MES 제공 | TITAN 유지 |
|----------|------------|
| 입고·출고·생산실적·재고 | **품질 · 성적서 · 문서 · 경리 · 회계 · 통계** |

`MODULES_SURVIVING_MES` — MES 연동 후에도 TITAN 모듈 독립 사용

### ERP

- TITAN 회계 = **지원 수준** · ERP 병행
- Repository Adapter (`getRepositories()`) — module별 data source 교체 · **UI 불변**

---

## 10. 코드 SSoT

| 영역 | 파일 |
|------|------|
| **Module Expansion** | `src/config/titanV12ModuleExpansion.js` |
| Menu Architecture | `src/config/titanV12MenuArchitecture.js` |
| Environment Settings | `src/config/environmentSettings.js` |
| Session (향후) | `src/utils/environmentSettingsSession.js` |

---

## 11. 향후 구현 순서

1. `/environment/modules` UI — ON/OFF toggle (PM 승인)
2. `moduleFlags` SessionStorage persist
3. Sidebar · HOME · Permission filter hooks
4. 경리관리 화면 (기존 출고·거래명세서 재사용)
5. 회계관리 화면
6. SQLite `titan_module_flags` + module tables
7. MES adapter — production/inbound/outbound only

---

## 12. 관련 문서

- `docs/TITAN_V12_MENU_ARCHITECTURE.md`
- `docs/TITAN_V12_SMART_ACCESS_PLATFORM.md`
- `docs/TITAN_OFFICIAL_ARCHITECTURE.md`
