# Blueprint — 품질관리 (V2.0 · LOT Quality Validation Engine)

**Status:** 🔒 **Official Freeze** (⑤/10 · PM Final Review 2026-07-07) · **Route:** `/quality` · **구현 ❌**

> **공식 역할:** LOT Quality Validation Engine — LOT Lifecycle **품질 검증·인증**  
> **공식 원칙:** 검사 화면 ❌ · Type · Status · **Result** 독립 분리  
> Code SSoT: `QUALITY_MANAGEMENT_BLUEPRINT` · `TITAN_V20_QUALITY_INSPECTION_TYPES` · `TITAN_V20_QUALITY_INSPECTION_STATUS` · `TITAN_V20_QUALITY_INSPECTION_RESULT`

**Freeze Policy:** 구조 변경 ❌ · 개선 = Review 문서(Update)만

---

## TITAN Engine 체계

| Workspace | Engine / 역할 |
|-----------|---------------|
| 운영관리 | 업무 **시작** Workspace |
| 생산관리 | **LOT Engine** (생산) |
| **품질관리** | **LOT Quality Validation Engine** (검증·인증) |

```text
LOT → 생산완료 → 품질검증 → 성적서 → 출고
```

생산의 연장 ❌ · LOT Lifecycle 품질 **보증** ✅

---

## Launcher 구조 (PM 승인 · 5 Cards)

```text
품질관리 (Quality Workspace · LOT Quality Validation)
├ 검사관리          Task — HT_COMPLETE · 검사 대기/진행
├ 성적서관리        Task — 검사완료 · 성적서 미발행
├ 불량이력관리      History — FAIL/REWORK 이력
├ 문서관리          Document — 표준서·공정서·고객·ISO·도면
└ 품질업무일지      Journal — 품질 담당자
```

**Workspace 유형 (공식):**

| 유형 | 화면 |
|------|------|
| Task Workspace | 검사관리 · 성적서관리 |
| History Workspace | 불량이력관리 |
| Document Workspace | 문서관리 |
| Journal Workspace | 품질업무일지 |

---

## Inspection 3축 분리 (PM 공식)

### 1. 검사 종류 (Type) — 독립

| Type | 용도 |
|------|------|
| 양산검사 | 양산 LOT |
| 개발검사 | 개발/시험 LOT |
| 기타검사 | 기타 분류 |

### 2. 검사 상태 (Status) — Workflow · 독립

```text
검사 대기 → 검사 진행 → 검사 완료 → 성적서 대기 → 성적서 완료
```

| Status | workflowKey | 주 화면 |
|--------|-------------|---------|
| 검사 대기 | INSPECTION_WAIT | 검사관리 (HT_COMPLETE 진입) |
| 검사 진행 | INSPECTION_IN_PROGRESS | 검사관리 |
| 검사 완료 | INSPECTION_DONE | → 성적서관리 |
| 성적서 대기 | CERT_WAIT | 성적서관리 |
| 성적서 완료 | CERT_DONE | → 출고등록 |

**Type × Status 예:** `양산검사 + 검사 진행` · `개발검사 + 검사 완료`

### 3. 검사 판정 (Result) — 품질 결과 · Status와 별개

| Result | 의미 | 분기 |
|--------|------|------|
| **PASS** | 합격 | → 성적서관리 |
| **FAIL** | 불합격 | → 불량이력관리 |
| **HOLD** | 보류 | 추가 확인 |
| **REWORK** | 재작업 | → 재처리 → 재검사 |

**Type × Status × Result 예:**

- `양산검사 + 검사 완료 + PASS`
- `개발검사 + 검사 완료 + HOLD`

**정책:** Workflow Status ≠ 품질 Result · Engine + 검사자 기록 · 사용자 Stage 수동 변경 ❌

---

## 화면별 Task Scope

### 검사관리 (Task)

- **진입:** HT_COMPLETE · 생산 완료 LOT
- **표시:** 검사 대기 · 검사 진행
- **표시 ❌:** 생산 진행(HT_RUNNING) 제품
- **완료:** Result 기록 → PASS/HOLD → 성적서관리 · FAIL/REWORK → 불량이력

### 성적서관리 (Task)

- **표시:** 검사 완료 · **성적서 미발행**
- **Exit:** 성적서 발행 → **운영관리 출고등록** (Engine)

### 불량이력관리 (History)

- 불량 등록 · 원인 · 조치 · 재발방지 · 이력 조회
- FAIL / REWORK 분기 LOT

### 문서관리 (Document)

- 표준서 · 공정서 · 고객문서 · ISO · 도면

### 품질업무일지 (Journal)

- 품질 담당자 업무일지

---

## Exit Condition (Engine)

```text
검사 완료 (+ Result)
    ↓ PASS/HOLD
성적서관리
    ↓ 성적서 발행
운영관리 → 출고등록

FAIL/REWORK → 불량이력 → (재처리) → 재검사
```

TitanWorkflowEngine 자동 · 사용자 Stage 직접 변경 ❌

---

## 1. Purpose

LOT Lifecycle 품질 검증·인증 Workspace. HT_COMPLETE LOT만 · Type/Status/Result 3축.

## 2. Role

| 가능 | 불가 |
|------|------|
| LOT 품질 검증 · 성적서 · 불량 이력 | 입고/출고 (운영) |
| Type × Status × Result 조합 | 설비 장입 (생산) |
| heatTreatmentCalculationEngine | 생산 진행 LOT 표시 |
| | Stage/Status 수동 변경 |

## 3. Task Scope

→ 위 **화면별 Task Scope** · **Inspection 3축** SSoT

## 4. Exit Condition

→ Engine chain (검사→성적서→출고 · FAIL→불량)

## 5. Layout

Launcher Hub 5 cards · 검사/성적서: Type Tab + Status Filter + Result · KPI · Search · Table · Detail Popup

## 6. Data

```text
TitanDataEngine → TitanWorkflowEngine → Quality Workspace
```

- Stores: qualityStore · lotStore · timelineStore
- Attributes: inspectionType · inspectionStatus · **inspectionResult**
- Legacy Session — Blueprint only · Engine 전환 · UI 불변

## 7. Workflow

생산(HT_COMPLETE) → 검사(Type/Status/Result) → 성적서 → 출고

## 8. Automation

유효경화깊이 계산 · Status Engine 이동 · Result 기록 · Timeline · Document No. · Traceability QR

## 9. Connected Screens

생산관리(HT_COMPLETE) → **품질관리** → 운영관리(출고) · LOT Lifecycle · 기준정보

## 10. Output

검사일지 · 성적서 COA (+ Traceability QR) · PDF

## 11. Freeze Criteria ⏳

- LOT Quality Validation Engine
- Type · Status · Result 분리
- Exit Condition · Workflow Engine
- Workspace 유형 (Task/History/Document/Journal)
- PM Final Review → Freeze

---

## PM Final Review (2026-07-07)

| 항목 | 결과 |
|------|------|
| Purpose · Role · Task Scope · Exit Condition | ✅ |
| Layout · Data · Workflow · Automation | ✅ |
| Connected Screens · Output · Freeze Criteria | ✅ |

**PM 반영 (Screen Review):**

1. ✅ LOT Quality Validation Engine
2. ✅ Inspection Result (PASS/FAIL/HOLD/REWORK)
3. ✅ 불량이력 **History** Workspace
4. ✅ 검사관리 HT_COMPLETE · 생산진행 제외

**판정:** Approved → **Official Freeze**

**다음:** ⑥ 통계관리 Blueprint Review
