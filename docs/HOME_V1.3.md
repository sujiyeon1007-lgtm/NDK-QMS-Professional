# 🏠 HOME (Presentation Build V1.3 REV.1)

> **역할:** PQMS 통합 Dashboard (Control Tower) — 조회 화면 ❌ · 상황판 ✅  
> **코드:** `src/pages/Home/` · `docs/HOME_V1.3.md`

---

## Header

- **HOME**
- **PQMS 통합 Dashboard**
- 금일 입고부터 작업, 검사, 출고까지 전체 진행 상황을 한눈에 확인합니다.
- 우측: `YYYY-MM-DD Fri` · 새로고침

---

## KPI Dashboard (5종)

📥 금일 입고 · 📦 현재 재고 · ⚙ 작업 진행 · 🔍 검사 대기 · 🚚 금일 출고

---

## 본문 Layout (승인안)

```text
┌──────────────┬────────────────────────────────────────────┐
│ 공지사항      │              통합검색                        │
├──────────────┤                                            │
│ 업무일정      │              진행현황 (6건 미리보기)          │
└──────────────┴────────────────────────────────────────────┘

최근 작업 이력
```

---

## 진행현황 (유일 메인 테이블 · REV.1 + 기능 복구)

**공정 Chip:** 입고 · 작업중 · 검사 · 성적서 · 출고 (클릭 → 파란 Border · 리스트 Filter)

| 관리번호 | LOT | 업체명 | 품명 | 재질 | 수량 | 현재공정 | 진행률(%) |

- `HomeProgressOverviewPanel` → Chip 클릭 → `search.status` Filter
- `HomeProductProgressTable` → Live Search + Chip 동시 적용
- **전체 보기** → `/history` (이력조회)
- Row Expand → 공정 흐름도 상세 (기존 유지)
- **Progress Bar** — 0% → 목표 % (1s ease) · 공정별 색상
- **Step Indicator** — ✓ 완료 · ● 현재(Pulse) · ○ 대기
- **Hover Tooltip** — 현재 공정 · 진행률 · 예상 다음 단계
- **진행률 기준** — 입고 20% · 작업 40% · 검사 60% · 성적서 80% · 출고 100%

---

## 통합검색

- 관리번호 · LOT · 업체명 · 품번 · 품명
- Live Search · 자동완성 · Enter 검색

---

## 설계 철학

HOME는 **현재 상황을 빠르게 파악**하는 Control Tower.  
상세 조회·관리는 각 메뉴(작업일보 · 품질관리 · 이력조회 등)에서 담당.

---

## 완료 기준

- [x] KPI Dashboard
- [x] 좌: 공지사항 · 업무일정 / 우: 진행현황
- [x] 통합검색 (본문 하단)
- [x] 최근 작업 이력
- [x] 제품 진행현황 삭제
- [ ] Console Error = 0 · PM 승인

---

## Companion

- `docs/PRESENTATION_BUILD_V1.3_HANDOVER.md`
- `src/config/homeDashboard.js`
- `src/config/productWorkflowList.jsx` → `buildHomeProgressColumns()`
