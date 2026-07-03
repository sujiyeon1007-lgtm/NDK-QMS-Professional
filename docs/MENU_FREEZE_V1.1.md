# Project TITAN (NDK PQMS) — Menu Freeze V1.1 (최종 확정)

**Lock date:** 2026-07-03  
**Source of truth:** `src/config/menuFreezeV1.js` · `src/config/menuConfig.js`

---

## 최종 메뉴 (Sidebar 11)

| # | 메뉴 | Route |
|---|------|-------|
| 1 | 🏠 HOME | `/home` |
| 2 | 📦 입고현황 | `/inout/incoming` |
| 3 | 📦 재고현황 | `/inventory` |
| 4 | 📝 작업일보 | `/production/daily-report` |
| 5 | 🛡 품질관리 | `/quality/inspection` |
| 6 | 📚 문서관리 | `/documents` |
| 7 | 🗂 기준정보관리 | `/settings` |
| 8 | 🚚 출고현황 | `/inout/shipment` |
| 9 | 🔍 이력조회 | `/history` |
| 10 | 📊 통계조회 | `/statistics/inquiry` |
| 11 | ⚙ 환경설정 | `/environment` |

**변경 정책:** 사장님 요청 기능을 제외하고는 메뉴 구조를 변경하지 않습니다.

---

## 개발 순서 (고정)

```text
Workflow → UI → 기능 → 구현 → 테스트
```

---

## Presentation Version V1.0 목표

실제 NDK 1공장에서 사용할 수 있는 수준의 **생산품질관리시스템(PQMS)** 구축

---

## 설계 원칙

- **재고** — 직접 입력 ❌ · 입고 + 작업일보 + 출고 데이터 자동 계산
- **통계** — 업무 데이터 자동 집계 · 조회 전용
- **One Source of Truth** · **Master First Architecture**

---

## 이력조회 Traceability

```text
입고현황 → 재고현황 → 작업일보 → 품질관리 → 문서관리 → 출고현황
```

---

## 문서관리 Status

| Status | 표시 |
|--------|------|
| 최신 | 🟢 |
| 개정 필요 | 🟡 |
| 승인 대기 | 🔵 |
| 미등록 | ⚫ |
| 폐기 | 🔴 |

문서 진행률 예: `7 / 9 · 78%`

---

상세 메뉴 역할 정의는 `MENU_FREEZE_ROLES` in `src/config/menuFreezeV1.js` 참조.
