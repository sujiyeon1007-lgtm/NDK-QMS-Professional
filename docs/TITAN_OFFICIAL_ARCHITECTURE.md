# Project TITAN — Official Architecture

**Lock Date:** 2026-07-04  
**Type:** Architecture Lock (설계 · Config · Rule · 문서 — UI 변경 ❌)  
**SSoT (Code):** `src/config/titanOfficialArchitecture.js`  
**V1.2 Primary:** `docs/TITAN_V12_OFFICIAL_ARCHITECTURE.md` · `src/config/titanV12OfficialArchitecture.js` (14 sections · consolidated)

---

## 1. Project Identity

**Project TITAN** = QMS + Smart Factory Lite + Mobile + QR + Future NFC + MES Ready — **통합 업무 플랫폼**

| 구성 | 역할 |
|------|------|
| QMS | 품질 · 검사 · 성적서 · Traceability |
| Smart Factory Lite | 설비 QR · 생산 가능 목록 · Smart Workflow |
| Mobile (Future) | 현장 전용 화면 — PC 축소 ❌ |
| QR | Smart Mode 1차 채널 |
| NFC (Future) | QR와 동일 Smart Access ID |
| MES Ready | Repository 교체 · UI 불변 |

**Formula:** POP + QMS  
**MES:** TITAN은 MES를 **대체하지 않음** — MES Ready 구조만 준비

---

## 2. Philosophy

> *"기존 업무를 없애는 시스템이 아니라 기존 업무를 더 편하게 만드는 시스템"*

| 원칙 | 내용 |
|------|------|
| Paper Workflow | **유지** — 삭제 금지 |
| Smart Workflow | **추가** — QR/NFC deep link |
| 사용자 선택 | Paper **OR** Smart — 병행 지원 |

### Smart Access Trinity

```text
One Time Input  →  한 번 입력 · Master 재사용 · 중복 입력 ❌
One Scan        →  QR/NFC 1회 → 업무 화면 직행 (메뉴 탐색 ❌)
One Workflow    →  Paper · Smart · NFC 동일 상태머신
```

---

## 3. Development Priority (Mandatory)

```text
Workflow → UI → Database → 개발 → 테스트 → 현장 피드백 → 개선
```

**Workflow > UI** — 업무 흐름 확정 후 화면 · DB · 구현

Config: `DEVELOPMENT_PRIORITY_PIPELINE` in `titanOfficialArchitecture.js`

---

## 4. One Time Input — Data Flow

```text
제품관리 → 입고 → 생산 → 검사 → 성적서 → 출고 → 통계
```

- 단일 데이터 흐름 · 메뉴 간 **재입력 ❌**
- Master Data (`제품관리` 공정·재질·도번) 적극 활용

---

## 5. Support Modes (Parallel)

| Mode | Status | Rule |
|------|--------|------|
| **Paper** | active | HTL · OUT · INV · DPR 출력 **삭제 금지** |
| **Smart (QR)** | active (설비) / planned | 기존 화면 deep link |
| **NFC** | planned | QR와 **동일 Smart Access ID** |

---

## 6. Paper Workflow (Fixed)

```text
입고 → 입고리스트 출력 → 생산 → 검사 → 성적서 → 출고 → 통계
```

| 출력 | DOC |
|------|-----|
| 입고리스트 (열처리 작업 요청) | DOC-01 |
| 생산일보 | DOC-02 |
| 검사성적서 | DOC-03 |
| 거래명세서 | DOC-04 |
| 출고리스트 | OUT |

---

## 7. Smart Workflow (Additive)

```text
QR/NFC → 설비/위치 자동 인식 → 공정 자동 인식 → 생산 가능 목록
  → LOT 등록 → 생산중 → 생산완료 → 검사대기 → 검사 → 성적서 → 출고
```

Paper Workflow와 **병행** — 대체 ❌

---

## 8. QR Targets (6 Official)

| # | 위치 | Smart Access | 화면 |
|---|------|--------------|------|
| 1 | 입고창고 | `NDK://INCOMING` | 입고등록 |
| 2 | 생산설비 | `NDK://EQ/{code}` | 생산등록 (작업일보) |
| 3 | 검사실 | `NDK://INSPECTION` | 검사등록 |
| 4 | 품질실 | `NDK://CERTIFICATE` | 성적서관리 |
| 5 | 출고장 | `NDK://OUTGOING` | 출고등록 |
| 6 | 설비 | `NDK://EQ/{code}` | 설비정보/점검이력/생산현황 |

Route mapping: `src/config/smartAccessArchitecture.js` → `SMART_ACCESS_TARGETS`

---

## 9. Smart Access ID (Official Format)

**Canonical:** `NDK://` prefix — QR · NFC · Future Barcode 공통

| Canonical ID | Legacy Alias | 용도 |
|--------------|--------------|------|
| `NDK://INCOMING` | `NDK\|IN\|REG` | 입고등록 |
| `NDK://OUTGOING` | `NDK\|OUT\|DOCK\|{code}` | 출고등록 |
| `NDK://INSPECTION` | `NDK\|QC\|ROOM\|{code}` | 검사등록 |
| `NDK://CERTIFICATE` | `NDK\|QC\|CERT\|{code}` | 성적서관리 |
| `NDK://EQ/ION-01` | `NDK\|EQ\|ION-01` | 이온질화 설비 |
| `NDK://EQ/GAS-01` | `NDK\|EQ\|GAS-01` | 가스질화 설비 |
| `NDK://EQ/SOFT-01` | `NDK\|EQ\|SOFT-01` | 연질화 설비 |

**Parser:** `parseSmartAccessId()` · `buildCanonicalSmartAccessId()` in `titanOfficialArchitecture.js`  
**Active impl:** `equipmentQr.js` — legacy + `NDK://EQ/{code}` both supported

---

## 10. Equipment QR Rules

| Rule | Value |
|------|-------|
| Per product | ❌ |
| Per LOT | ❌ |
| One QR per equipment | ✅ |
| Multi-copy print | ✅ (동일 QR · 여러 위치 부착) |

**Official codes:** ION-01 · ION-02 · GAS-01 · SOFT-01

---

## 11. QR Print Center (Future)

- **Menu:** 환경설정 → QR 관리 (`/environment/qr`)
- **Categories:** 설비 · 입고 · 검사 · 성적서 · 출고 · 관리자 QR
- **Features:** PDF · 재출력 · 미리보기 · 인쇄

Config: `QR_PRINT_CENTER_OFFICIAL` in `titanOfficialArchitecture.js`

---

## 12. NFC Ready

- QR **먼저** · 모든 구조 **NFC-ready**
- QR · NFC → **동일 Smart Access ID** · **동일 Handler**
- Example: `NDK://EQ/ION-01` → `https://titan/equipment/ION-01`
- QR→NFC 교체 시 **프로그램 변경 ❌**

---

## 13. Mobile (Future Design Only)

| Principle | Rule |
|-----------|------|
| Layout | PC 화면 축소 ❌ — Mobile 전용 화면 |
| UX | 큰 버튼 · ≤3 클릭 · 현재 업무만 |
| Entry | Smart Access ID → 해당 업무 화면 |

---

## 14. User Role Screens (Design Reference)

| Role | Screens |
|------|---------|
| 품질팀 | 입고 · 검사 · 성적서 · 출고 · 기준정보 |
| 생산팀 | 설비 QR · 생산 가능 목록 · LOT · 생산중/완료 |
| 관리자 | HOME · KPI · 현황 · 통계 · 설비현황 |

---

## 15. MES Ready

```text
현재:  SessionStorage → TITAN → 생산상태
향후:  MES → SQLite/API → TITAN → 품질관리
```

- TITAN **UI·Workflow 불변**
- Repository / Data Source만 교체 (`getRepositories()`)

---

## 16. Development Principles (10 Rules — Lock)

1. 기존 디자인 임의 변경 금지
2. 기존 기능 삭제 금지
3. Workflow 중심 개발
4. 클릭 최소화
5. One Time Input
6. Paper + Smart 병행
7. QR + NFC Ready
8. Master Data 적극 활용
9. 빌드 성공 후 보고
10. Commit 가능한 상태 유지

---

## 17. Code SSoT Map

| 영역 | File |
|------|------|
| **Official Architecture (Primary)** | `src/config/titanOfficialArchitecture.js` |
| Smart Access Routes | `src/config/smartAccessArchitecture.js` |
| V1.1 Workflow | `src/config/titanV11Workflow.js` |
| Development Direction | `src/config/titanV1DevelopmentDirection.js` |
| QMS Menu Workflow | `src/config/qmsMenuWorkflow.js` |
| Equipment QR (Active) | `src/utils/equipmentQr.js` |
| Workflow Status | `src/utils/titanWorkflowStatus.js` |

---

## 18. Cursor Rules

| Rule | Path |
|------|------|
| **Official Architecture (Primary)** | `.cursor/rules/project-titan-official-architecture.mdc` |
| Smart Access | `.cursor/rules/project-titan-smart-access-architecture.mdc` |
| V1.1 Workflow | `.cursor/rules/project-titan-v11-workflow.mdc` |
| Progress | `.cursor/rules/project-titan-progress-v1.mdc` |

---

## 19. Related Documents

- `docs/TITAN_V12_SMART_ACCESS_PLATFORM.md` — **V1.2 Smart Access Platform**
- `docs/SMART_ACCESS_ARCHITECTURE.md` — Smart Access detail
- `docs/TITAN_V11_WORKFLOW.md` — V1.1 workflow detail
- `.cursor/rules/project-titan-v12-smart-access-platform.mdc` — V1.2 Cursor rule
- `.cursor/rules/project-titan-v1-development-direction.mdc` — Version 3 PQMS scope

---

## 20. Future Extension Guide

1. **New Smart Access target** — register in `SMART_ACCESS_ID_REGISTRY` + `SMART_ACCESS_TARGETS` first
2. **URL/Handler** — `parseSmartAccessId()` → `targetId` → `buildSmartAccessPath()` → navigate
3. **NFC** — encode same `NDK://` ID or equivalent URL — no new handler
4. **Mobile** — dedicated screen per role · Smart Access entry only
5. **MES** — swap Repository adapter · UI unchanged
6. **QR Print Center** — admin menu when PM approves Sprint

**Do Not:** Remove Paper prints · Create ad-hoc URL schemes · Change approved UI for Smart features
