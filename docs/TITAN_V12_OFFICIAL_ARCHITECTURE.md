# Project TITAN V1.2 — Official Architecture

**Lock Date:** 2026-07-04  
**Version:** V1.2 Official Architecture Update  
**Type:** Architecture Lock (기능 추가 ❌ · Config · Rule · 문서)  
**SSoT (Code):** `src/config/titanV12OfficialArchitecture.js`  
**Parent:** `src/config/titanOfficialArchitecture.js` · `docs/TITAN_OFFICIAL_ARCHITECTURE.md`

---

## Overview

Project TITAN 공식 Architecture 확정 — 기존 설계 유지 + 회사 전체 운영 플랫폼 확장.

| Pillar | Config |
|--------|--------|
| Menu Architecture | `titanV12MenuArchitecture.js` |
| Module System | `titanV12ModuleExpansion.js` |
| Smart Access | `titanV12SmartAccessPlatform.js` · `smartAccessArchitecture.js` |
| Storage | `titanV12OfficialArchitecture.js` → `STORAGE_ARCHITECTURE` |
| Official (parent) | `titanOfficialArchitecture.js` |

---

## §1 Menu Architecture

**철학:** Menu Simple, Function Deep — MES처럼 기능은 많지만 **메뉴는 단순**

**메인 메뉴 (11 core + 2 module-gated):**

HOME · 기준정보관리 · 입고관리 · 생산관리 · 검사관리 · 성적서관리 · 출고관리 · 이력조회 · 문서관리 · 통계관리 · 관리자 · **경리관리** · **회계관리**

- 기능은 각 메뉴 **내부**에서 확장
- Runtime Sidebar: Menu Freeze V1.3 → PM 승인 후 V1.2 전환

Doc: `docs/TITAN_V12_MENU_ARCHITECTURE.md`

---

## §2 Module System

**모든 확장 메뉴 = ON/OFF 모듈**

```text
관리자 → 환경설정 → 모듈 관리 (/environment/modules)
```

Toggle 대상: 문서 · 통계 · 경리 · 회계 · 설비 · NFC 등  
Core: 품질 · 생산 · 성적서 · 출고 · QR

| OFF | ON 복귀 |
|-----|---------|
| Sidebar · HOME Widget · 권한 숨김 | 즉시 복원 |
| **DB/Storage 데이터 유지** | **기존 데이터 그대로** |

Doc: `docs/TITAN_V12_MODULE_EXPANSION.md`

---

## §3 QR / NFC Smart Access

```text
QR  → Mobile → 업무 화면
NFC → 동일 Smart Access ID → 동일 업무 화면
```

| Smart Access ID | 화면 |
|-----------------|------|
| `NDK://INCOMING` | 입고등록 |
| `NDK://OUTGOING` | 출고등록 |
| `NDK://INSPECTION` | 검사등록 |
| `NDK://CERTIFICATE` | 성적서 |
| `NDK://EQ/ION-01` | 설비/생산 |
| `NDK://EQ/GAS-01` | 가스질화 |

---

## §4 QR 출력센터

**관리자 → QR 출력센터**

설비 · 입고 · 검사 · 성적서 · 출고 · 관리자 QR  
PDF · 재출력 · 미리보기 · **동일 QR 다매 출력**

---

## §5 NFC Ready

- 현재: **QR 우선**
- NFC Tag = 동일 Smart Access ID — **프로그램 수정 ❌**

---

## §6 Storage Architecture

```text
Project TITAN
├── Database (SQLite) — 메타데이터 · 업무 데이터
├── Storage/          — 실제 파일
│   ├── Certificate
│   ├── Shipment
│   ├── Inspection
│   ├── Drawing
│   ├── Image
│   ├── Document
│   └── Backup
└ Config
```

**SQLite:** 파일 저장 ❌ — `file_path` · `file_name` · `registered_at` · `registered_by` · `revision` 등 **메타만**

**사용자:** Windows 폴더 직접 사용 ❌ — TITAN 프로그램 내부에서 모든 작업

---

## §7 Storage Manager

**환경설정 → Storage 관리** (`/environment/storage`)

| 사용량 | 관리 기능 |
|--------|-----------|
| Storage · DB · PDF · Image · Document · Backup · 총량 | 최적화 · Cache 정리 · 백업 · 복원 · Storage 검사 |

---

## §8 Storage Location

환경설정에서 경로 변경 — **프로그램 수정 ❌**

```text
D:\ProjectTITAN\Storage → \\SERVER\... → NAS → Cloud
```

---

## §9 경리관리

실무 사용 수준 · 모듈 ON/OFF

거래명세서 · 재출력 · 발행이력 · 출고/월 마감 · 매출 · 거래처별 매출 · 미수금 · **세금계산서 발행현황** (홈택스 발행 — TITAN은 상태만)

---

## §10 회계관리

**ERP 대체 ❌** · 지원 수준 · 모듈 OFF 가능

전표 작성/조회/승인 · 계정과목 · 월별/원가/부가세 현황

---

## §11 Company Asset Management

TITAN 내부에서 관리: 성적서 · 거래명세서 · 도면 · 검사사진 · 작업표준서 · 품질문서 · 첨부 · 백업

검색 · 조회 · 출력 · 다운로드 — **프로그램 내부만**

---

## §12 HOME 역할 강화

**프로그램 시작점**

- 빠른 메뉴: 입고 · 생산 · 검사 · 성적서 · 출고
- 최근 작업 · QR 진입 · 통계
- 공지 · 해야 할 일 · **금일 업무** · KPI · 진행현황
- moduleFlags OFF → 관련 Widget 숨김

---

## §13 개발 철학

```text
One Time Input → One Scan → One Workflow
```

```text
입고 → 생산 → 검사 → 성적서 → 출고 → 통계
```

Paper + Smart 병행 · Master Data 재사용 · 중복 입력 ❌

---

## §14 최종 목표

| 단계 | 역할 |
|------|------|
| **MES 전** | NDK 1공장 **실무 운영 프로그램** |
| **MES 후** | MES 연동 **QMS + DMS + Smart Access + 경리 + 회계** 통합 플랫폼 |

**MES 대체 ❌**

---

## Code SSoT Map

| Section | File |
|---------|------|
| **V1.2 Consolidated** | `src/config/titanV12OfficialArchitecture.js` |
| Menu | `src/config/titanV12MenuArchitecture.js` |
| Module | `src/config/titanV12ModuleExpansion.js` |
| Smart Access | `src/config/titanV12SmartAccessPlatform.js` |
| Smart Access Routes | `src/config/smartAccessArchitecture.js` |
| Parent Official | `src/config/titanOfficialArchitecture.js` |

## Cursor Rules

- `.cursor/rules/project-titan-official-architecture.mdc` (alwaysApply)
- `.cursor/rules/project-titan-v12-menu-architecture.mdc`
- `.cursor/rules/project-titan-v12-module-expansion.mdc`
- `.cursor/rules/project-titan-v12-smart-access-platform.mdc`

## Related Docs

- `docs/TITAN_OFFICIAL_ARCHITECTURE.md`
- `docs/TITAN_V12_MENU_ARCHITECTURE.md`
- `docs/TITAN_V12_MODULE_EXPANSION.md`
- `docs/TITAN_V12_SMART_ACCESS_PLATFORM.md`
- `docs/SMART_ACCESS_ARCHITECTURE.md`
