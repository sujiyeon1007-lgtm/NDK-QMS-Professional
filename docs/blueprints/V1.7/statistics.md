# Blueprint — 통계관리 (V1.7)

**Status:** ⏳ PM 승인 대기 · **Route:** `/statistics`

---

## 1. 목적 (Purpose)

열처리 QMS **경영 Dashboard** — 조회·분석 전용.  
전체 생산 · 품질 · 영업 3 Tab Executive 통계.

---

## 2. 역할 (Role)

**가능**

- 기간·단위·Tab 조회 · KPI · Chart · List 분석

**불가**

- 등록/수정/삭제 · Workflow 상태 변경

---

## 3. 화면 구성 (Layout)

```text
Breadcrumb
  ↓
KPI Bar
  ↓
조회 기준 (단위 · 기간 · 기준일)
  ↓
Dashboard Charts
  ↓
Statistics List (접힘 기본)
```

---

## 4. 데이터 (Data)

**Single pipeline:** `buildExecutiveStatisticsDashboard()`

| Source | 용도 |
|--------|------|
| `productionStore` · `qualityStore` · `lotStore` | 집계 |
| `statisticsExecutiveDashboard.js` | Tab · KPI config |

---

## 5. Workflow

```text
period + unitFilter + tab → 단일 analytics
  → KPI + Chart + List 동시 갱신 (이중 호출 ❌)
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| 기간 · Tab · 단위 | KPI · Chart · List |

---

## 7. 연결 화면

HOME · 입출고 · 생산 · 품질 · 출고

---

## 8. 출력물

Excel/PDF (future) · **조회 전용**

---

## 9. 완료 조건 (Freeze)

- [ ] Single pipeline 검증
- [ ] Browser QA · **PM 승인**
