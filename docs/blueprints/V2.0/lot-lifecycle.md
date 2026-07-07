# Blueprint — LOT Lifecycle (V2.0 · ⭐ Final Blueprint)

**Status:** 🔒 **Freeze (Official)** · PM Final Review 2026-07-07 (⑩/10) · **Route:** `/traceability/lot/{lotNo}` · **Sidebar ❌ (QR Scan 진입)** · **구현 ❌**

> **공식 역할:** Project TITAN 전체를 연결하는 **최종 Traceability Workspace**  
> **공식 원칙:** LOT 중심 · Workflow 중심 · Workspace 중심 · SSoT · QR Traceability (5대 원칙 종합)  
> Code SSoT: `LOT_LIFECYCLE_BLUEPRINT` · `TITAN_V20_LOT_LIFECYCLE_BLUEPRINT_REVIEW` · `TITAN_V20_PHASE1_COMPLETE`

---

## ⭐ Final Blueprint — Phase 1 완료

이 Blueprint는 지금까지 Freeze한 **9개 Workspace를 하나의 LOT 중심 시스템으로 연결하는 최종 설계**입니다.

```text
QR Scan → LOT Lifecycle → 전체 이력 조회 → 관련 문서 → 현재 상태 → Traceability
```

---

## 공식 역할

LOT Lifecycle은 **Project TITAN 전체를 연결하는 최종 Workspace**입니다.

- 하나의 LOT 전체 이력 조회
- QR Scan의 **최종 도착 화면**
- Timeline 기반 Traceability
- 관련 문서 통합 조회
- 현재 상태·진행률 확인
- 경영/품질/생산 공통 LOT 소통

---

## 공식 화면 구조

```text
LOT Lifecycle
├ LOT 기본정보
├ LOT KPI (상단)
├ LOT Health
├ Timeline
├ 운영 이력
├ 생산 이력
├ 품질 이력
├ 출고 이력
├ 관련 문서
├ Related LOT (Roadmap)
└ QR / PDF / Document No.
```

### LOT 기본정보

관리번호 · LOT 번호 · 제품 · 고객사 · 현재공정 · 현재설비 · 현재상태 · 진행률

### LOT KPI (공식)

현재 공정 · 진행률 · 총 소요시간 · 현재 작업자 · 현재 설비 · 품질 상태

### LOT Health (공식)

LOT 건강 상태를 하나의 상태값으로 표현:

```text
정상 · 주의 · 지연 · 완료
```

### Timeline (공식)

LOT 생명주기를 **시간순**으로 기록. **Engine 자동 생성 · 수정 ❌**

```text
입고 → 생산계획 → 장입 → 생산 → 검사 → 성적서 → 출고
```

### 관련 문서 (공식)

모든 문서는 **동일 LOT**를 참조:

입고리스트 · 작업지시서 · 생산일보 · 검사리포트 · 성적서 · 거래명세서

### Related LOT (Blueprint only)

같이 장입한 LOT · 동일 작업 LOT · 동일 고객 LOT — **Blueprint 정의만 · 구현 나중**

---

## QR 정책 (공식)

- LOT Lifecycle = **Traceability QR 최종 목적지**
- **1 LOT = 1 Traceability QR**
- QR payload에 **Document No. 저장 ❌**

---

## Data 정책 (공식)

```text
TitanDataEngine
      ↓
TitanWorkflowEngine
      ↓
Timeline Store
      ↓
LOT Lifecycle
```

Engine 기반 집계만 · 업무 데이터 직접 수정 ❌

---

## 1. Purpose

TITAN 전체 Workflow 완성본. Traceability QR Scan 최종 도착. LOT 전체 Lifecycle 통합 조회 — **조회 전용** · Sidebar ❌.

## 2. Role

**가능:** LOT Lifecycle 조회(권한별) · Timeline·Document No. · 4 이력 통합 · PDF 링크(권한)  
**불가:** 업무 수행(등록·수정) · 개별 문서 Deep Link만 · 문서마다 다른 QR · QR에 Document No.

## 3. Task Scope

| 항목 | 내용 |
|------|------|
| **Workspace** | QR Scan / LOT 선택 — LOT 전체 Lifecycle (통합 조회) |
| **표시만** | LOT 기본정보 · KPI · Health · Timeline · 4 이력 · 관련 문서 |
| **표시 안 함** | 다른 LOT · 권한 외 필드 |

## 4. Exit Condition

| 항목 | 내용 |
|------|------|
| **종료 조건** | 조회 종료 (업무 수행 ❌) |
| **다음 화면** | 권한별 출력물 PDF 링크 |
| **Engine** | TitanWorkflowEngine (상태·진행률·Health 계산) |

## 5. Layout

```text
Header · LOT 번호 · QR ID
LOT KPI · LOT Health
LOT 기본정보 Grid
Timeline (Engine 자동)
이력 — 운영 · 생산 · 품질 · 출고
관련 문서 · Related LOT (Roadmap)
QR · PDF · Document No. (권한)
```

## 6. Data

- Store: `lotStore` · `productionStore` · `qualityStore` · `timelineStore` · `equipmentStore`
- Engine: `TitanDataEngine → TitanWorkflowEngine → Timeline Store`
- Master 참조: Master Store · Company Store — **참조만**
- Model: `lotTraceabilityModel.js` · `timelineQuery.js`

## 7. Workflow

```text
Traceability QR Scan → LOT Lifecycle (최종 도착)
관리번호 → 제품 → 공정 → 설비 → 진행률 · Health
운영 · 생산 · 검사 · 성적서 · 출고 · Timeline 통합
역할별 필드 마스킹 (admin · internal · customer)
```

## 8. Automation

| 사용자 | 시스템 |
|--------|--------|
| Scan only · 조회 | LOT resolve · Lifecycle aggregate · Timeline · Health/KPI 계산 · 권한 필터 |

## 9. Connected Screens

**9 Workspace 통합:** 운영 · 생산 · 품질 · 설비현황 · 출고 · Master · Company · 모든 출력물

## 10. Output

조회 화면(출력 ❌) · 연관 PDF 링크 · 동일 LOT Traceability QR on prints

## 11. Freeze Criteria

- [x] 9 Workspace 통합 연결
- [x] LOT 기본정보 · Timeline · 4 이력 · 관련 문서
- [x] LOT Health · LOT KPI · Related LOT (Blueprint)
- [x] 1 LOT = 1 Traceability QR
- [x] Engine 기반 · SSoT · 5대 원칙
- [x] PM Final Review · **Official Freeze → Phase 1 완료**

---

## PM Final Review 결과 (2026-07-07 · 🔒 Freeze)

| 항목 | 결과 |
|------|------|
| Purpose | ✅ Approved |
| Role | ✅ Approved |
| Task Scope | ✅ Approved |
| Exit Condition | ✅ Approved |
| Layout | ✅ Approved |
| Data | ✅ Approved |
| Workflow | ✅ Approved |
| Automation | ✅ Approved |
| Connected Screens | ✅ Approved |
| Output | ✅ Approved |
| Freeze Criteria | ✅ Approved |

**Phase 1 (Architecture + Blueprint) 공식 완료** → **Phase 2 Implementation** 시작
