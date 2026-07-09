# Blueprint — 통계관리 (V2.0 · Analytics Workspace)

**Status:** 🔒 **Freeze (Official)** · PM Final Review 2026-07-07 (⑥/10) · **Route:** `/statistics` · **구현 ❌**

> **공식 역할:** 경영 의사결정 지원 **Analytics Engine** — 업무 화면 ❌  
> **공식 원칙:** LOT Workflow 분석 · **Read Only** · Dashboard Drill Down  
> Code SSoT: `STATISTICS_BLUEPRINT` · `TITAN_V20_STATISTICS_LOT_TRACEABILITY_ANALYTICS` · `TITAN_V20_STATISTICS_DRILL_DOWN`

---

## 공식 역할

통계관리는 **업무를 수행하는 Workspace가 아니라 경영 분석(Analytics) Workspace**입니다.

HOME → 설비현황 → 운영관리 → 생산관리 → 품질관리로 이어진 **하나의 LOT Workflow를 분석**하여, 경영 의사결정을 지원합니다.

역할:
- 경영 현황 분석
- 생산성 분석
- 품질 분석
- 영업 실적 분석

---

## Launcher 구조 (4 Cards)

```text
통계관리 (Analytics Workspace)
├ 전체통계    경영 현황 · KPI 종합
├ 생산통계    생산성 (설비/업체/품명/재질/LOT별)
├ 품질통계    품질 (합격률·불량률·판정 분포)
└ 영업통계    영업 실적 (업체별·매출·출고)
```

**Workspace 유형:** Analytics Workspace (단일)

---

## LOT Traceability Analytics (PM 공식 · 강화)

설비별·업체별 통계 + **LOT 중심 분석** (통계관리 핵심):

### Core Metrics

| Metric | 의미 |
|--------|------|
| LOT 처리 시간 | 입고 → 출고 전체 리드타임 |
| LOT 공정 소요 시간 | 단계별 소요 |
| LOT 병목 구간 | 지연 단계 식별 |
| LOT 불량률 | LOT 기준 FAIL 비율 |

### Enhanced Metrics (PM 추가)

| Metric | 용도 |
|--------|------|
| LOT 평균 Lead Time | 리드타임 평균 |
| LOT 설비 대기시간 | 장입 전 대기 |
| LOT 검사 대기시간 | 검사 전 대기 |
| LOT 출고 대기시간 | 출고 전 대기 |
| LOT 재작업(REWORK) 횟수 | 재작업 추적 |

**목적:** 병목 분석 — 대기시간·REWORK 추적으로 원인 규명  
**Data Source:** timelineStore (LOT Timeline) · TitanWorkflowEngine 집계

---

## 4 Tab 조회 기준

| Tab | 조회 기준 |
|-----|-----------|
| **전체통계** | 금일 입고·출고 · 생산완료 · 검사완료 · 성적서 발행 · 불량률 · 설비 가동률 |
| **생산통계** | 설비별 · 업체별 · 품명별 · 재질별 · **LOT별(필수)** |
| **품질통계** | PASS · FAIL · HOLD · REWORK · 검사 종류 · LOT별 불량률 |
| **영업통계** | 고객사별 · 매출 · 입고 · 출고 · 거래 건수 · 납기 준수율 |

---

## 상단 KPI (가장 먼저 보는 지표)

금일 생산 · 금일 출고 · 금일 검사 · **LOT 평균 리드타임** · 불량률 · 설비 가동률

### KPI Card 표시 정책 (PM 2026-07-09)

생산통계 · 품질통계 · 영업통계 상단 KPI Card는 **숫자 우선 Foundation KPI Card**로 통일한다.

**KPI Card 내부 금지:**
- Sparkline · 미니 Line Graph · 카드 내부 차트 ❌
- Progress Bar · Badge ❌
- Line / Bar / Pie / Gauge 등 시각화는 **Dashboard Charts 영역에만** 배치

**KPI 종류별 표시:**

| Kind | 표시 방식 |
|------|-----------|
| Count | 큰 숫자 + 전월 대비 증감 |
| Rate (%) | 큰 퍼센트 + 목표/전월 대비 텍스트 |
| Status | 숫자 또는 짧은 상태 텍스트 |
| Target | 목표값 표시 |
| Trend | ▲/▼ Delta 표시 |

**예시:**
- 검사건수 `11건` `▲ +2건 (전월)`
- 합격률 `98.7%` · 목표 `98%`
- 불량률 `1.3%` · 목표 `2%` · `▼ 양호`
- NCR `3건`

**원칙:** KPI는 즉시 읽히는 현황 지표이며, 추이 분석은 Dashboard Chart에서만 제공한다.

---

## Dashboard Drill Down (PM 공식)

> 통계는 숫자 표시 ❌ · **원인을 바로 확인** ✅ — KPI 클릭 시 관련 Workspace 이동

| KPI | Drill Down |
|-----|-----------|
| 불량률 | 품질관리 → 불량이력관리 |
| 설비 가동률 | 설비현황 |
| LOT Lead Time | LOT Lifecycle |
| 금일 생산 | 생산관리 |
| 금일 출고 | 운영관리 → 출고등록 |
| 금일 검사 | 품질관리 → 검사관리 |

---

## Read Only 정책 (PM 공식)

```text
Analytics = Read Only
등록 ❌ · 수정 ❌ · 삭제 ❌
TitanDataEngine → TitanWorkflowEngine → Timeline Store → Analytics
```

---

## 1. Purpose

경영 의사결정 지원 Analytics Workspace. LOT Workflow 분석 — 경영/생산성/품질/영업 + LOT Traceability. 조회 전용.

## 2. Role

| 가능 | 불가 |
|------|------|
| 기간·단위 조회 | 등록/수정/삭제 |
| KPI · Chart · List 분석 | Workflow 상태 변경 |
| Tab 전환 (전체/생산/품질/영업) | 개별 업무 수행 |
| LOT Traceability Analytics | |

## 3. Task Scope

- **표시:** 집계·분석 데이터 (완료 단계 기반)
- **표시 ❌:** 개별 업무 수행 폼
- **Tab:** 전체 · 생산 · 품질 · 영업
- **LOT Traceability:** 처리시간 · 공정소요 · 병목 · 불량률

## 4. Exit Condition

Analytics Workspace · Workflow 이동 ❌ · **조회 종료 = Drill Down 또는 종료**  
KPI 클릭 → 관련 Workspace/LOT Lifecycle (위 Drill Down 표)

## 5. Layout

```text
Breadcrumb → KPI Bar (조회 기간 기준)
조회 기준 (단위·기간·기준일)
Dashboard Charts
LOT Traceability Analytics
Statistics List (접힘 기본)
```

## 6. Data

```text
TitanDataEngine · TitanWorkflowEngine 집계
→ buildExecutiveStatisticsDashboard() 단일 진입
```

- Stores: productionStore · qualityStore · lotStore · timelineStore
- LOT Timeline = Traceability Analytics 축
- Legacy Session 집계 — Blueprint only · Engine 전환 · UI 불변

## 7. Workflow

period/unitFilter/tab → 단일 analytics → KPI+Chart+List 동시 갱신 · LOT Traceability → Timeline 기반 분석

## 8. Automation

| 사용자 | 시스템 |
|--------|--------|
| 기간 · Tab · 단위 필터 | KPI · Chart series · List rows · LOT Traceability metrics |

## 9. Connected Screens

```text
운영관리 · 생산관리 · 품질관리 (완료 데이터 집계) → 통계관리
통계관리 KPI → Drill Down → 품질관리(불량이력) · 설비현황 · LOT Lifecycle · 생산관리 · 운영관리
```

Also: HOME

## 10. Output

Excel/PDF export (future) · 조회 전용

## 11. Freeze Criteria ⏳

- Analytics Workspace 원칙 (업무 화면 ❌)
- LOT Traceability Analytics (Core + Enhanced)
- Read Only (등록/수정/삭제 ❌)
- Dashboard KPI · Drill Down
- Workflow Analytics · Single pipeline
- KPI Card Sparkline/Progress/Badge 제거 · number-first 정책 준수
- PM Final Review → Freeze

---

## PM Screen Review 결과 (2026-07-07)

| 항목 | 결과 |
|------|------|
| Purpose · Role · Task Scope | ✅ Approved |
| Exit Condition (Drill Down/종료) | ✅ Approved |
| Layout · Workflow · Automation · Output | ✅ Approved |
| Data (Read Only) | ✅ 명시 반영 |
| Connected (Drill Down) | ✅ 추가 반영 |
| Launcher 4 | ✅ Approved |
| Freeze Criteria | ⏳ Final Review 대기 |

**PM 수정 요청 3건 — 반영 완료:**

1. ✅ Read Only 정책 (데이터 수정 절대 ❌)
2. ✅ Dashboard Drill Down (KPI → Workspace)
3. ✅ LOT Analytics 강화 (평균 Lead Time · 설비/검사/출고 대기시간 · REWORK 횟수)

**역할 분리:**

```text
① HOME 🔒 · ② 설비현황 🔒 · ③ 운영관리 🔒 · ④ 생산관리 🔒 · ⑤ 품질관리 🔒
⑥ 통계관리 ⏳ = 경영 의사결정 지원 Analytics Workspace (Final Review 대기)
```

**다음:** PM Final Review → Official Freeze → ⑦ 기준정보관리

**Do Not:** 구현 · UI/Router 변경 · 등록/수정/삭제 기능 추가
