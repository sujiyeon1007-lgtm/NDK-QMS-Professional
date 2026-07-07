# Blueprint — HOME (V1.7)

**Status:** 🔎 As-Built Review 완료 · PM 승인 대기 · **Route:** `/home` · **UI:** 🟢 UI Freeze (V1.5)

> 본 문서는 **현재 구현된 HOME(As-Built)** 을 기준으로 검토·갱신되었습니다.
> SSoT 코드: `src/pages/Home/Home.jsx` · `src/config/homeDashboard.js` · `src/config/homeWorkLauncher.js`
> Freeze 근거: `.cursor/rules/project-titan-home-ui-freeze-v1.5.mdc` · `project-titan-v1.5-hub-architecture.mdc`

---

## 1. 목적 (Purpose)

공장 전체 운영현황을 한눈에 보여주는 **PQMS 통합 Dashboard (Control Tower / Hub)**.
조회 전용이 아니라 **금일 진행현황 · 할 일 · 업무 바로가기**를 파악하는 상황판.

**V1.5 Hub 원칙:** HOME은 요약·바로가기만 제공. **상세 리스트/검색 Widget 금지** — 기능 확장은 전용 화면으로.

---

## 2. 역할 (Role)

**가능**

- 현재 진행현황 (6 Workflow 단계) 조회
- 공지사항 · 업무일정 확인/등록
- 최근 작업 Timeline 확인 → 이력조회
- 업무 바로가기 (2×3 Launcher) 진입
- 새로고침 (Workflow refresh 반영)

**불가**

- 입고/출고/생산/검사 **등록** (전용 메뉴에서 수행)
- Master Data CRUD
- 제품/LOT/설비 **상세 리스트 Widget** (V1.5 Hub — HOME 금지)
- 통합검색 · 진행현황 테이블 (V1.5에서 제거됨 · deprecated)
- 레이아웃·Widget 구조 변경 (UI Freeze)

---

## 3. 화면 구성 (Layout) — As-Built

```text
PageTopBar (HOME · kicker · 새로고침 · compact)
  ↓
HomeAccessNotice (module/permission 차단 시 조건부)
  ↓
HomeTodaySummary — 현재 진행현황 (6 Workflow 단계 카드)
  입고등록 · 열처리대기 · 열처리중 · 검사대기 · 성적서대기 · 출고대기
  ↓
home-board (2단)
  ├─ 좌측: HomeLeftPanel
  │    · 공지사항 (HomeNoticePanel)
  │    · 업무일정 (HomeWorkSchedulePanel)
  │    · 최근 작업 Timeline (HomeRecentWorkPanel)
  └─ 우측: Main — 업무 바로가기 (HomeWorkLauncherPanel · 2×3)
       입고관리 · 설비현황 · 제품현황 · 설비장입관리 · 출고관리 · 통계관리
```

> ⚠️ 기존 Blueprint 초안의 `KPI Bar(입고·재고·작업·검사·출고)` 및 `통합검색·진행현황 Widget Grid`는
> **현재 HOME에 렌더링되지 않음** (V1.5 Hub Freeze에서 제거). As-Built 기준으로 정정함.

---

## 4. 데이터 (Data) — As-Built

| Source | 용도 | SSOT 여부 |
|--------|------|----------|
| `getSessionProductionRecords()` | HOME 핵심 records | ⚠️ Legacy (Gap) |
| `dashboardStore.getKpi()` | Launcher metrics (설비 running/ready/maintenance) | ✅ Foundation |
| `lotStore.list()` | Launcher metrics (진행중·검사대기·장입) | ✅ Foundation |
| `equipmentStore` (via `equipmentWorkflowService`) | 설비 요약 | ✅ Foundation |
| `homeNoticesSession` | 공지사항 | Session |
| `homeTasksSession` | 업무일정 · 금일 할 일 | Session |

**파생 계산**

- `buildTodayWorkSummary(records)` → 현재 진행현황
- `buildHomeWorkLauncherMetrics(records)` → 업무 바로가기 metrics
- `buildHomeRecentWorkItems(records)` → 최근 작업 Timeline

**Module/Permission:** `useTitanModuleFlags` · `isHomeWidgetVisible`
**Refresh:** `subscribeWorkflowDataRefresh` → `refreshKey` 증가 → 재계산

---

## 5. Workflow

```text
records = getSessionProductionRecords()
  ↓
진행현황 = buildTodayWorkSummary(records)
업무 바로가기 = dashboardStore · lotStore · equipmentStore 집계
최근작업 = buildHomeRecentWorkItems(records)
  ↓
Workflow 이벤트 → notifyWorkflowDataRefresh → refreshKey++ → HOME 재계산
  ↓
카드/타임라인 클릭 → 전용 화면 deep link
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| 새로고침 · 공지 등록 · 업무일정 추가/완료 | 진행현황 집계 · Launcher metrics · 최근작업 Timeline · Workflow refresh 자동 반영 · module/permission gating |

---

## 7. 연결 화면 (Connected Screens)

입출고관리 · 생산관리 · 품질관리 · MES(설비 현황 · 제품 현황) · 통계관리 · 이력조회 · 환경설정(모듈/권한)

---

## 8. 출력물 (Output)

없음 (Dashboard — 출력 ❌ · QR ❌)

---

## 9. 완료 조건 (Freeze Criteria)

- [ ] V1.5 Hub UI Freeze 유지 (레이아웃·Widget 불변)
- [ ] Workflow 갱신 시 HOME 자동 반영
- [ ] Launcher metrics = Foundation Store 집계
- [ ] Console Error 0 · Browser QA
- [ ] **PM 승인** → Freeze

---

## 🔎 PM Review — As-Built Gap 분석 (구현 항목 아님 · 승인 후 Roadmap)

| # | 심각도 | Gap | 권고 |
|---|--------|-----|------|
| 1 | 🟡 Medium | HOME 핵심 records가 `getSessionProductionRecords()` (legacy) 경유. Launcher metrics만 Foundation Store 사용. | UI 불변 유지하며 records read를 **TitanDataEngine(lot/production)** 로 단계 전환 (승인 후 구현). |
| 2 | ⓘ Info | HOME은 V1.5 Hub로 **상세 리스트 없음** → 'KPI=리스트' 규칙의 리스트 대상이 HOME에 없음 (의도된 설계). | HOME은 요약·바로가기만. 상세 리스트 KPI=리스트는 **제품현황·이력조회**에서 준수. |
| 3 | ⓘ Info | 최근작업/진행현황 → **LOT Lifecycle 화면** 직접 진입 경로 없음 (Lifecycle 미구현). | LOT Lifecycle Blueprint 승인·구현 후 Timeline/최근작업 → Lifecycle deep link 검토. |
| 4 | 🔵 Low | `HomeKpiPanel`·`HomeIntegratedSearchPanel`·`HomeProgressPanel`·`HomeStatusSummaryPanel`·`HomeQuickMenu` 등 미사용(@deprecated) 컴포넌트 잔존. | Freeze 유지 · **Dead Code Sprint(전체 화면 완료 후)** 일괄 정리. 지금 삭제 ❌. |

**Review 결론:** 현재 HOME 구현 = **V1.5 Hub Freeze와 일치**. 신규 UI/기능 구현 필요 없음.
유일한 실질 Gap은 **Data SSOT 전환(#1)** — UI 불변 조건으로 별도 승인 후 진행.

**PM 결정 요청:**
- ☐ HOME Blueprint 승인 → Freeze 확정 (현 구현 유지)
- ☐ Gap #1 (Data SSOT 전환) 별도 구현 승인 여부
