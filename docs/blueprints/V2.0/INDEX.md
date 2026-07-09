# Project TITAN V2.0 — Blueprint Pack (Final · PM 승인)

**Status:** ✅ **Phase 1 Complete** — Architecture + Blueprint 공식 완료 (2026-07-07) · **구현 ❌ (Phase 2)**
**Lock:** 2026-07-07

**Architecture SSoT:** `src/config/titanV20MenuWorkflowArchitecture.js` · `docs/TITAN_V20_MENU_WORKFLOW_ARCHITECTURE.md`
**Blueprint SSoT (code):** `src/config/blueprints/titanBlueprintsV17.js`
**Methodology SSoT:** `src/config/titanBlueprintV17.js`

---

## 공식 개발 순서

```text
Architecture → Blueprint → PM Review → PM 승인 → 구현 → Browser QA → Freeze
```

Blueprint 승인 전: UI · Router · Store · Workflow · CSS 변경 **모두 금지**

---

## Workspace First Principle (PM 추가 지시 · 공식)

**기능(Function) 중심 ❌ · 업무 공간(Workspace) 중심 ✅** — 화면 하나 = 담당자의 책상.

| 화면 | Workspace |
|------|-----------|
| HOME | 회사 전체 상황 (작업 ❌) |
| 설비현황 | 공장 관제실 (작업 ❌) |
| 운영관리 | 운영담당자 오늘 처리 업무 |
| 생산관리 | 생산담당자 오늘 처리 업무 |
| 품질관리 | 품질담당자 오늘 처리 업무 |

> Blueprint Review: **11항목 순차** (Purpose → … → Freeze) · 항목별 PM 승인.

---

## Workspace Principle (Blueprint)

**페이지 = 업무 공간(Workspace)** — 담당자가 **지금 처리할 업무만** 표시. 동일 LOT 반복 표시 ❌.

---

## Blueprint 표준 양식 (V2.0 Final · 11항목)

| # | 섹션 | 설명 |
|---|------|------|
| 1 | Purpose | 목적 |
| 2 | Role | 가능/불가 |
| 3 | **Task Scope** | **표시할 데이터 (무엇을 보여줄 것인가)** |
| 4 | **Exit Condition** | **종료 시점 · 다음 화면 (언제/어디로 이동)** |
| 5 | Layout | 화면 구성 |
| 6 | Data | Store · 필터 |
| 7 | Workflow | 업무 흐름 |
| 8 | Automation | 자동화 |
| 9 | Connected Screens | 연결 화면 |
| 10 | Output | 출력물 |
| 11 | Freeze Criteria | 완료 조건 |

---

## Master Store (V2.0 Final · 각 Master = 단일 SSoT)

```text
Master Store (SSoT · 중복 관리 ❌)
├ Customer Store   → 거래처
├ Product Store    → 제품 · 품번 · 열처리 Spec
├ Material Store   → 재질
├ Process Store    → 공정
├ Equipment Store  → 설비 · 설비 QR
├ Worker Store     → 기준정보관리 · 작업자관리
└ Company Store    → 회사정보 (신규 · Config/Session ❌)
```

- **각 Master = 단일 진실 공급원** · 수정은 해당 Store에서만 · 타 Workspace는 참조만
- **회사정보 Sidebar:** 회사정보만 (작업자관리 ❌)
- **기준정보 Launcher:** 거래처 · 제품 · 재질 · 공정 · 설비 · **작업자관리**
- **Company Store:** 모든 출력물 Header 참조

---

## Blueprint Review 순서 (PM 공식)

각 화면: **PM Review → PM 승인 → Freeze** 후 다음 진행

| # | Blueprint | Doc | 개정 | Review | 승인 |
|---|-----------|-----|------|--------|------|
| ① | HOME | [home.md](./home.md) | ✅ | 🔒 **Freeze** | ✅ |
| ② | 설비현황 | [equipment-monitor.md](./equipment-monitor.md) | ✅ | 🔒 **Freeze** | ✅ |
| ③ | 운영관리 | [operations-management.md](./operations-management.md) | ✅ | 🔒 **Freeze** | ✅ |
| ④ | 생산관리 | [production-management.md](./production-management.md) | ✅ | 🔒 **Freeze** | ✅ |
| ⑤ | 품질관리 | [quality-management.md](./quality-management.md) | ✅ | 🔒 **Freeze** | ✅ |
| ⑥ | 통계관리 | [statistics.md](./statistics.md) | ✅ | 🔒 **Freeze** | ✅ |
| ⑦ | 기준정보관리 | [master-data.md](./master-data.md) | ✅ | 🔒 **Freeze** | ✅ |
| ⑧ | 환경설정 | [environment.md](./environment.md) | ✅ | 🔒 **Freeze** | ✅ |
| ⑨ | 회사정보 | [company-info.md](./company-info.md) | ✅ | 🔒 **Freeze** | ✅ |
| ⑩ | LOT Lifecycle | [lot-lifecycle.md](./lot-lifecycle.md) | ✅ | 🔒 **Freeze** | ✅ |

> **Phase 1 Complete (2026-07-07):** 10 Blueprint 전체 Official Freeze → **Phase 2 Implementation** 시작

> LOT Lifecycle: Sidebar ❌ · QR Scan 또는 LOT 선택으로 진입

### Phase 5 Supporting Blueprints

| # | Blueprint | Doc | Status | 구현 |
|---|-----------|-----|--------|------|
| S-① | Mobile QR Portal | [mobile-qr-portal.md](./mobile-qr-portal.md) | ✅ PM Approved | ❌ Architecture Only |
| S-② | Document Management V1.0.1 Restructuring | [document-management-v101.md](./document-management-v101.md) | ✅ PM Approved | ❌ Architecture Only |
| S-③ | Transaction Statement Output Restore V1.0.1 | [transaction-statement-output-v101.md](./transaction-statement-output-v101.md) | ✅ PM Approved | ❌ Architecture Only |
| S-④ | V1.0.1 Expansion Policy | [v1-0-1-expansion-policy.md](./v1-0-1-expansion-policy.md) | ✅ PM Approved | ❌ Architecture Only |
| S-⑤ | Foundation Attachment Global Policy | [foundation-attachment-policy.md](./foundation-attachment-policy.md) | ✅ PM Approved | ❌ Architecture Only |
| S-⑥ | QR Menu Shortcut | [qr-menu-shortcut.md](./qr-menu-shortcut.md) | ✅ PM Approved | ❌ Architecture Only |
| S-⑦ | V1.0.2 Foundation Action / TDE Policy | [v1-0-2-foundation-action-tde-policy.md](./v1-0-2-foundation-action-tde-policy.md) | ✅ PM Approved | ❌ Architecture Only |
| S-⑧ | Foundation Workspace Layout Standard | [foundation-workspace-layout.md](./foundation-workspace-layout.md) | ✅ PM Approved | ❌ Architecture Only |

> Mobile QR Portal: Desktop 관리 UI와 분리된 QR 기반 현장 작업 Portal. QR payload는 Desktop Workspace가 아니라 `/mobile/qr/{type}/{UUID}` Mobile Portal URL을 사용한다.
> Document Management V1.0.1: 기존 10 Workspace 순서 변경 없이 문서관리 내부를 `Quality Document Management` / `Internal Document Management`로 분리하는 지원 Blueprint다.
> Transaction Statement Output Restore V1.0.1: Outbound Management와 Accounting Lite의 DOC-04 출력 복원, 공통 Foundation Document Action, 향후 Email/TDE/Outgoing Documents 연계를 정의하는 Architecture-only Addendum이다.
> V1.0.1 Expansion Policy: QR Engine split · Mobile Menu Shortcut QR · Work Type Workflow · Shot Work Status · Shot Statistics · KPI policy · Incoming Archive · Accounting Lite · Foundation reuse.
> Foundation Attachment Global Policy: 첨부 가능 화면은 공통 `FoundationAttachment` + Foundation Detail Popup을 사용한다. 리스트 표시는 `📎 {count}개` / `○ 미등록`만 허용하며, 업로드·미리보기·다운로드·삭제는 PM 승인 후 구현 단계에서 실제 동작해야 한다.
> QR Menu Shortcut: Data QR와 분리된 고정 메뉴 진입 QR. `/mobile/qr/menu/{shortcutId}` 또는 직접 Mobile route로 현장 작업 화면을 즉시 연다.
> V1.0.2 Foundation Action / TDE Policy: 삭제·수정·QR·첨부·PDF·출력·메일·닫기는 공통 Foundation Action Bar로 통일하고, 성적서·거래명세서·출고증·발주서·QR·PDF 출력은 화면별 구현이 아니라 TDE 중심으로 정리한다.
> Foundation Workspace Layout Standard: Dashboard · Business · Archive · Master · Tool 5개 Layout을 정의한다. Accounting Lite는 Dashboard가 아니라 Business Layout이며, Gallery는 문서/Reference Blueprint만 있고 Runtime UI/Router 구현은 하지 않는다.

### V1.0.1 Approved Implementation Sequence

```text
Foundation unification
→ Document Management restructure
→ Statistics UX
→ QR Engine
→ Work Type
→ Shot
→ Accounting
→ Browser QA
```

**Principles:** Foundation first · Additive development · Router stability · Existing feature deletion prohibited · Build → Browser QA → PM Review → Official Freeze

---

## Task Scope · Exit Condition 요약

| 화면 | Task Scope (표시) | Exit Condition → 다음 |
|------|-------------------|----------------------|
| 입고등록 | 생산 미투입 | 생산계획 투입 → 생산계획 |
| 출고등록 | 출고 대기 | 출고 완료 → 출고완료 탭 |
| 생산계획 | 열처리 대기품 | LOT 생성/생산 시작 → 설비장입 |
| 설비장입 | 장입 대기/장입중 | 장입 완료 → 생산일보 |
| 생산일보 | 생산 진행/완료 (HT_RUNNING) | 생산 완료 → 검사관리 |
| 생산실적 | HT_COMPLETE · 설비/업체/품명/재질/**LOT별** | 조회 전용 |
| 검사관리 | HT_COMPLETE · 검사 대기/진행 (Type×Status×Result) | 검사완료 → 성적서 (PASS) · 불량 (FAIL) |
| 성적서관리 | 검사완료 · 성적서 미발행 | 발행 → 출고등록 |
| 기준정보관리 | 거래처·제품·재질·공정·설비·작업자 (Master SSoT) | 상시 · 전 화면 참조 (Master First) |

**Engine:** TitanWorkflowEngine · 사용자 수동 상태 변경 ❌

---

## 출력관리 (공통)

운영관리 · 생산관리 출력관리 = **동일 Layout · 동일 Component · 동일 UX** (공통 컴포넌트)

---

## V2.0 공식 철학

```text
한 화면 = 하나의 업무(Workspace)
한 LOT = 하나의 Workflow
한 작업 완료 = 다음 단계 자동 이동
동일 LOT를 여러 화면에서 반복 표시하지 않는다
사용자는 항상 현재 자신이 처리해야 할 업무만 본다
Workflow Engine이 상태를 자동으로 관리한다
Master Data를 기준으로 모든 화면이 동작한다
```

---

## Phase 1 공식 완료 (2026-07-07)

```text
Phase 1 — Architecture + Blueprint  ✅ 완료
Phase 2 — Implementation (구현)
Phase 3 — Inspection Report Engine
Phase 4 — Document / Form Engine
Phase 5 — QR / Mobile / AI
```

**확정 핵심 원칙:** LOT 중심 · Workflow 중심 · Workspace 중심 UI · SSoT · Control Room/Workspace 분리 · 1 LOT = 1 Traceability QR
