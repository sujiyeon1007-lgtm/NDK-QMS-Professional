# Project TITAN (NDK PQMS) — Menu Freeze V1.3 (최종 확정)

**Presentation Build V1.3** · Lock date: 2026-07-03  
**Source:** `src/config/menuFreezeV1.js` · `src/config/menuConfig.js`

---

## PQMS 정의

Project TITAN은 **QMS가 아닌 PQMS** (Production & Quality Management System)입니다.  
MES를 대체하지 않으며, **생산 + 품질 + 현장 실무** 통합 관리가 목표입니다.

| Version | 정책 |
|---------|------|
| V1 | MES 완전 연동 (장기) |
| V2 | MES + PQMS 협업 |
| **V3 (현재)** | NDK PQMS Presentation Build — 시연·실사용 검토 |

**개발 철학:** 기준정보를 기반으로 입고부터 출고까지 모든 제품 이력을 관리하고, 품질 업무와 담당자의 업무를 함께 지원하는 현장 중심의 PQMS를 구축한다.

---

## Sidebar (12 menus · 순서 고정)

| # | 메뉴 | id | Route | 역할 |
|---|------|-----|-------|------|
| 1 | HOME | `home` | `/home` | 전체 Dashboard |
| 2 | **기준정보관리** | `masterData` | `/settings` | Master (Popup) · **Master First** |
| 3 | 입고현황 | `inboundStatus` | `/inout/incoming` | 입고 등록 · 관리번호 |
| 4 | 재고현황 | `inventoryStatus` | `/inventory` | 재고 자동 관리 |
| 5 | 작업일보 | `workDaily` | `/production/daily-report` | LOT · 생산 이력 |
| 6 | 업무일지 | `workJournal` | `/work-journal` | 담당자 업무 기록 |
| 7 | 품질관리 | `quality` | `/quality/inspection` | 검사 · 성적서 |
| 8 | 문서관리 | `documents` | `/documents` | 제품별 문서 Popup |
| 9 | 출고현황 | `outboundStatus` | `/inout/shipment` | 출고 · 거래명세서 |
| 10 | 이력조회 | `history` | `/history` | Traceability |
| 11 | 통계조회 | `statisticsInquiry` | `/statistics/inquiry` | 경영 Dashboard |
| 12 | 환경설정 | `environment` | `/environment` | 시스템 설정 |

**V1.3 변경:** 기준정보관리를 **2번**으로 이동 (V1.2: 8번) — Master First Architecture 반영.

**변경 정책:** 사장님 요청 시에만 메뉴 구조 변경.

---

## Sidebar 그룹 (시각 구분선)

Sidebar는 5개 그룹으로 구분선이 표시됩니다 (`buildSidebarGroups` · `Sidebar.jsx`).

| 그룹 id | 메뉴 |
|---------|------|
| `home` | HOME |
| `master` | 기준정보관리 |
| `operations` | 입고현황 · 재고현황 · 작업일보 · 업무일지 · 품질관리 · 문서관리 · 출고현황 |
| `analysis` | 이력조회 · 통계조회 |
| `system` | 환경설정 |

```text
HOME
── 기준정보관리
── 입고~출고 (7 ops menus)
── 이력·통계
── 환경설정
```

---

## 제품 Workflow (업무일지 제외)

```text
입고현황 → 재고현황 → 작업일보 → 품질관리 → 문서관리 → 출고현황 → 이력조회
```

**업무일지** — Workflow 미포함 · 사람 중심 독립 메뉴

---

## 작업일보 vs 업무일지

| | 작업일보 | 업무일지 |
|---|---------|---------|
| 중심 | 제품 · LOT · 생산 | 사람 · 업무 |
| 예 | LOT, 설비, 공정, 완료 | NCR, 회의, 고객대응, 특이사항 |

---

## 메뉴 개발 순서 (Presentation Build)

한 메뉴 완성 후 다음 메뉴. Presentation에서는 **Workflow · UI 완성도 우선**.

```text
HOME → 기준정보 → 입고 → 재고 → 작업일보 → 업무일지 → 품질 → 문서 → 출고 → 이력 → 통계 → 환경
```

---

## 메뉴당 개발 Flow (V1.3)

```text
Workflow → UI → 기능 → 구현 → 테스트 → 검토 → 승인
```

**V1.3 변경:** `검토` 단계 추가 (V1.2: 테스트 → 승인).

---

## Git · 배포

`main` · `presentation` · `develop` · `feature/*` — 사장님 시연은 **`presentation`만** 배포.

---

## 코드 참조

| 항목 | 위치 |
|------|------|
| Menu Freeze 상수 | `src/config/menuFreezeV1.js` |
| Sidebar · Router SoT | `src/config/menuConfig.js` |
| 무결성 검사 | `src/utils/menuIntegrity.js` |
| Workflow | `src/config/qmsMenuWorkflow.js` |
| Sidebar UI | `src/foundation/layout/Sidebar.jsx` |

상세 역할: `MENU_FREEZE_ROLES` in `src/config/menuFreezeV1.js`
