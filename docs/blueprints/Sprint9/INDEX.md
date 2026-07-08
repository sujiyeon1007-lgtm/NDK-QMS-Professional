# Sprint 9 Blueprint — INDEX

**Status:** ✅ V1.7 · Phase 5 ✅ 완료 · Sprint 9 Official Freeze 대기  
**구현:** Phase 1 ✅ · Phase 2 🔒 Freeze · Phase 3 🔒 Freeze · Phase 4 ✅ 승인 · Phase 5 🔄 진행 (LOT Lifecycle · TDE)  
**Official Freeze:** Phase 5 완료 후 **Sprint 9 전체 Freeze**

---

## Sprint 9 목표

Project TITAN의 **열처리 기술 데이터베이스** 기반을 설계합니다.

> **PM 메모:** AI/추천 ❌ — **회사 열처리 기술을 체계적으로 저장**하는 데이터 구조와 업무 흐름 설계.

---

## 문서

| # | 문서 | 내용 |
|---|------|------|
| 1 | [heat-treatment-technology-blueprint-v1.md](./heat-treatment-technology-blueprint-v1.md) | Sprint 9 Blueprint **V1.2** — 전체 설계 |

---

## V1.7 보완 (2026-07-08 · PM Phase 5)

| # | 항목 | 섹션 |
|---|------|------|
| ㉕ | **Phase 5 목적** — LOT Lifecycle + Document JSON · **TDE 구현 ❌** | §6.0 |
| ㉖ | **역할 분리** TITAN(생성) vs TDE(Rendering Only) | §6.0.1 |
| ㉗ | **Document JSON Schema** — Header/Body/Table/Graph/Photo/Approval/Footer | §6.2.1 |
| ㉘ | **TDE Interface** — JSON 수신 형태 · Rendering Slots | §6.2.1 |

**Code SSoT (Phase 5):** `src/config/titanDocumentJsonModel.js` · `src/utils/lotTechnologyLifecycle.js` · `src/utils/titanDocumentJsonBuilder.js` · `src/pages/LotLifecycle/LotLifecyclePage.jsx`

---

## V1.6 보완 (2026-07-08 · PM Phase 4 승인 + Phase 5)

| # | 항목 | 섹션 |
|---|------|------|
| ㉑ | Phase 4 Knowledge Record Store **승인** (Official Freeze = Phase 5 후 Sprint 9 전체) | §5.6 |
| ㉒ | **Knowledge Status** 작성→검증→확정 (정책만 · 구현 ❌) | §5.6.2 |
| ㉓ | **Knowledge Source** — LOT · Actual Work · Inspection · Recipe Version · Template Version 필수 | §5.6.3 |
| ㉔ | **Phase 5** LOT Lifecycle · Knowledge · TDE 연계 | §6.0 |

---

## V1.5 보완 (2026-07-08 · PM Phase 3 Freeze + Phase 4)

| # | 항목 | 섹션 |
|---|------|------|
| ⑰ | Phase 3 Actual Work Record **Official Freeze** | §5.4 |
| ⑱ | **Actual Work Lock** 정책 (검사완료 → 읽기전용 · 구현 Phase 4 이후) | §5.4.5 |
| ⑲ | **Phase 4 Knowledge Record Store** (Store만 · Engine ❌) | §5.6 |
| ⑳ | Actual Snapshot · Recipe Snapshot · Template Engine **재사용** | §5.6.1 |

**Code SSoT (Phase 4):** `src/config/knowledgeRecordModel.js` · `src/utils/knowledgeRecordStore.js` · `src/pages/Quality/KnowledgeRecordPage.jsx`

---

## V1.4 보완 (2026-07-08 · PM Phase 2 Freeze + Phase 3)

| # | 항목 | 섹션 |
|---|------|------|
| ⑩ | Phase 2 Recipe Master **Official Freeze** | §5.3 |
| ⑪ | **Recipe Template Version** 정책 (설계만 · 구현 ❌) | §5.3.0.1 |
| ⑫ | **Parameter Metadata** 구조 (설계만 · 구현 ❌) | §5.3.0.2 |
| ⑬ | **Phase 3 Actual Work Record** (표준=읽기전용 · 실제=입력) | §5.4 |
| ⑭ | Actual → Knowledge 입력 구조 설계 (Engine ❌) | §5.4.4 |
| ⑮ | **Actual Work Status** 작성중→작업중→완료→검사완료 | §5.4.5 |
| ⑯ | **Template 선택 정책** — `active`만 노출 · `planned` 제외 | §5.4.6 |

**Code SSoT (Phase 3):** `src/config/actualWorkRecordModel.js` · `src/utils/actualWorkRecordStore.js` · `src/pages/Production/ActualWorkRecordPage.jsx`

---

## V1.3 보완 (2026-07-08 · PM Phase 2 Revision — Recipe Template)

| # | 항목 | 섹션 |
|---|------|------|
| ⑥ | **Recipe Template Engine** (공정별 Parameter 자동 생성) | §5.3.0 |
| ⑦ | 이온질화 · 연질화 Active Template | §5.3.0 |
| ⑧ | 가스질화 · 산질화 Planned Template | §5.3.0 |
| ⑨ | Health Badge — Approved + 적용 제품 0건 = 🟡 | §5.3.0 |

**Code SSoT:** `src/config/recipeTemplateEngine.js`

---

## V1.2 보완 (2026-07-08 · PM Official Review)

| # | 항목 | 섹션 |
|---|------|------|
| ① | Recipe Approval Metadata | §5.3.3 |
| ② | Approval Workflow · Soft Delete | §5.3.1 |
| ③ | Recipe Version · LOT Snapshot 불변 | §5.3.2 |
| ④ | Knowledge Record 연계 · 저장 항목 | §2.6 · §5.6 |
| ⑤ | TDE Rendering 원칙 | §2.7 · §6.2.1 |

---

## 공식 Architecture (변경 없음)

```text
Material → Product → Product Specification → Heat Treatment Recipe
        → Production → Inspection → LOT → Knowledge Record → TDE
```

---

## Workspace 정책 (유지)

| 영역 | 정책 |
|------|------|
| Product Specification | Product Popup Tab |
| Recipe Master | Launcher 8번째 · Domain Master · Approval Metadata |
| Knowledge | Engine ❌ · 데이터 구조만 |
| TDE | Rendering only · 계산/판정/생성 ❌ |

---

## 구현 Phase (순서 유지)

```text
Phase 1 — Product Specification              ✅ 완료
Phase 2 — Recipe Master (Template Engine)    🔒 Official Freeze
Phase 3 — Production Actual Work Record       🔒 Official Freeze
Phase 4 — Knowledge Record Store             ✅ 승인 (Sprint 9 전체 Freeze 대기)
Phase 5 — LOT Lifecycle / Document JSON        ✅ 완료 (TDE Engine ❌)
```

---

## Companion

- Sprint 8 Freeze: Commit `07050c1`
- Blueprint Methodology: `.cursor/rules/project-titan-blueprint-v1.7.mdc`
