# Blueprint — 생산관리 (V2.0 · LOT 중심 Production Workspace)

**Status:** 🔒 **Official Freeze** (④/10 · PM Final Review 2026-07-07) · **Route:** `/production` · **구현 ❌**

> **공식 역할:** Project TITAN **핵심 LOT Engine** — LOT 생명주기 운영  
> **공식 원칙:** 설비 관리 ❌ · LOT Workflow 관리 ✅  
> Code SSoT: `PRODUCTION_MANAGEMENT_BLUEPRINT` · `TITAN_V20_PRODUCTION_HT_STAGES` · `productionManagementLauncher.js`

**Freeze Policy:** 구조 변경 ❌ · 개선 = Review 문서(Update)만

---

## 공식 역할

생산관리는 **LOT를 계획 → 장입 → 생산 → 완료**까지 관리하는 Production Workspace입니다.

설비를 관리하는 것이 아니라, **LOT의 생명주기를 운영**합니다.

---

## Launcher 구조 (공식 · 5 Cards)

```text
생산관리 (Production Workspace · LOT Engine)
├ 생산계획          Task — HT_WAIT
├ 설비장입현황      Task — LOT↔설비 연결 (최중요)
├ 생산일보          Task — HT_RUNNING · UI Freeze V1.3
├ 생산실적관리      Analytics — LOT별 포함
└ 출력관리          Print — operationsProductionPrint
```

**Workspace 유형:** Task · Analytics · Print

---

## HT Stage (공식)

```text
HT_WAIT → HT_RUNNING → HT_COMPLETE
```

| Stage | 화면 | 의미 |
|-------|------|------|
| HT_WAIT | 생산계획 | LOT 생성 · 작업지시 · 생산 시작 전 |
| HT_RUNNING | 설비장입현황 · 생산일보 | 장입 · 생산 진행 |
| HT_COMPLETE | 생산일보(완료) · 생산실적 | 생산 완료 → 품질관리 |

---

## LOT Workflow (공식)

```text
입고완료 → 생산계획 → LOT 생성 → 작업지시 출력
→ 설비장입 → 생산진행 → 생산완료 → 품질관리(검사관리)
```

TitanWorkflowEngine 자동 · 사용자 Stage 수동 변경 ❌

---

## 1. Purpose · 2. Role · 3. Task Scope · 4. Exit Condition

→ `PRODUCTION_MANAGEMENT_BLUEPRINT` SSoT (Frozen)

## 5. Layout

Launcher Hub 5 cards · 설비장입 `/production/charging` · 생산일보 UI Freeze V1.3

## 6. Data

```text
TitanDataEngine → TitanWorkflowEngine → Production Workspace
```

Legacy Session — Blueprint only · 구현 시 Engine 전환 · UI 불변

## 7–10. Workflow · Automation · Connected · Output

운영 → **생산** → 품질 · 출력=운영 100% 동일 Component

## 11. Freeze Criteria ✅

PM Final Review 2026-07-07 — **All Approved · Official Freeze**

---

## PM Final Review (2026-07-07)

| 항목 | 결과 |
|------|------|
| Purpose · Role · Task Scope · Exit Condition | ✅ |
| Layout · Data · Workflow · Automation | ✅ |
| Connected Screens · Output · Freeze Criteria | ✅ |

**다음:** ⑤ 품질관리 Blueprint Review
