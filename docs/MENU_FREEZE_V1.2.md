# Project TITAN (NDK PQMS) — Menu Freeze V1.2 (최종 확정)

**Presentation Build V1.2** · Lock date: 2026-07-03  
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

---

## Sidebar (12 menus)

| # | 메뉴 | Route | 역할 |
|---|------|-------|------|
| 1 | HOME | `/home` | 전체 Dashboard |
| 2 | 입고현황 | `/inout/incoming` | 입고 등록 · 관리번호 |
| 3 | 재고현황 | `/inventory` | 재고 자동 관리 |
| 4 | 작업일보 | `/production/daily-report` | LOT · 생산 이력 |
| 5 | **업무일지** | `/work-journal` | 담당자 업무 기록 |
| 6 | 품질관리 | `/quality/inspection` | 검사 · 성적서 |
| 7 | 문서관리 | `/documents` | 제품별 문서 Popup |
| 8 | 기준정보관리 | `/settings` | Master (Popup) |
| 9 | 출고현황 | `/inout/shipment` | 출고 · 거래명세서 |
| 10 | 이력조회 | `/history` | Traceability |
| 11 | 통계조회 | `/statistics/inquiry` | 경영 Dashboard |
| 12 | 환경설정 | `/environment` | 시스템 설정 |

**변경 정책:** 사장님 요청 시에만 메뉴 구조 변경.

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

## 개발 순서

```text
Workflow → UI → 기능 → 구현 → 테스트 → 승인
```

한 메뉴 완성 후 다음 메뉴. Presentation에서는 **Workflow · UI 완성도 우선**.

---

## Git

`main` · `presentation` · `develop` · `feature/*` — 사장님 시연은 **`presentation`만** 배포.

---

상세: `MENU_FREEZE_ROLES` in `src/config/menuFreezeV1.js`
