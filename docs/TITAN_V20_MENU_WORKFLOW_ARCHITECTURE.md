# Project TITAN V2.0 — 업무 중심 (Menu & Workflow) Architecture

**Status:** ✅ PM 최종 승인 · **Lock:** 2026-07-07  
**Implementation:** ⏳ Architecture Only — Blueprint V2.0 개정 · PM 승인 후 구현

> ⚠️ **Vision Roadmap V2.0** (Smart QR · Mobile · NFC)과 **별개**입니다.  
> 본 문서 = **Menu & Workflow Architecture V2.0** (List → Task 중심 전환)

**Code SSoT:** `src/config/titanV20MenuWorkflowArchitecture.js`  
**Rule:** `.cursor/rules/project-titan-v2.0-menu-workflow-architecture.mdc`

---

## 목적

현재 TITAN은 모든 메뉴에서 **동일한 LOT 리스트**를 표시하고 **현재공정만 변경**하는 방식이다.

| 문제 | V2.0 해결 |
|------|-----------|
| 모든 페이지가 동일하게 보여 혼란 | **한 화면 = 한 업무** |
| 처리할 업무가 직관적이지 않음 | **해당 단계 데이터만 표시** |
| 같은 데이터 반복 조회 | **완료 시 자동 이동 · 이전 화면에서 제거** |
| ERP/QMS/MES 전문성 부족 | **업무(Task) 중심 Workflow** |

---

## 핵심 원칙

```text
한 화면 = 한 업무
한 LOT = 하나의 Workflow
한 작업 완료 = 다음 단계 자동 이동
같은 데이터를 여러 화면에서 반복 표시하지 않는다
사용자는 항상 "지금 내가 처리해야 할 업무"만 본다
```

- 각 메뉴는 **자신의 업무에 필요한 데이터만** 표시
- 다른 단계 데이터 **표시 ❌**
- 작업 완료 → **Workflow Engine**이 다음 단계로 자동 이동
- **사용자가 상태를 직접 변경 ❌**

---

## 공식 Workflow

```text
입고등록 → 입고완료 → 생산계획 → LOT 생성 → 설비 장입
  → 생산 진행 → 생산 완료 → 검사 대기 → 검사 완료
  → 성적서 발행 → 출고 대기 → 출고 완료
```

각 단계 완료 시 **이전 화면에서 자동 제거** · **다음 화면에 자동 표시**

---

## Sidebar Menu (공식 · 9 menus)

```text
HOME
설비현황          (Launcher ❌ — 실시간 관제)
운영관리          (Launcher)
생산관리          (Launcher)
품질관리          (Launcher)
통계관리          (Launcher)
기준정보관리      (Launcher)
환경설정          (Launcher)
회사정보          (Launcher · 신규)
```

**V1.5 대비 변경**

| 항목 | V2.0 |
|------|------|
| MES 그룹 | **삭제** → 설비현황 Sidebar로 통합 |
| 입출고관리 | **운영관리**로 명칭 정리 |
| 제품현황 Sidebar 1Depth | **설비현황 하위**로 이동 |
| 회사정보 | **신규** Sidebar |

---

## HOME

- **Dashboard** — V1.5 Hub Freeze 유지 (요약 · 바로가기)
- 상세 리스트 Widget ❌

---

## 설비현황 (Launcher ❌)

공장 **실시간 관제** — MES 개념 ❌

| 하위 | 역할 |
|------|------|
| 설비현황 | 설비 상태 · LOT · 가동률 · 알람 |
| 제품현황 | LOT · 공정 · Timeline 추적 |

**표시:** 설비 상태 · 현재 LOT · 현재 작업 · 가동률 · 알람 · 생산 진행률  
**금지:** QR Scan · 장입 · 열처리 완료 (작업 수행 ❌)

---

## 운영관리 (Launcher)

| 카드 | 표시 대상 | 자동 이동 |
|------|-----------|-----------|
| **입고등록** | 입고 완료 · 생산 미투입 | 생산계획 투입 시 제거 |
| **출고등록** | 출고 대기 · 출고완료(탭) | 입고 제품 ❌ |
| **입출고이력** | 입고+출고 전체 이력 | — |
| **재고관리** | 현재 보관중 제품만 | — |
| **출력관리** | 입고리스트 · 출고리스트 · 거래명세서 | 기간: 금일/주/월/지정 |
| **영업업무일지** | 부서 → 사원별 일지 | — |

---

## 생산관리 (Launcher)

| 카드 | 표시 대상 | 자동 이동 |
|------|-----------|-----------|
| **생산계획** | 입고완료 · 열처리 대기품 | 생산 시작 후 제거 |
| **설비장입현황** | 장입중 LOT만 | 완료 시 제거 |
| **생산일보** | 생산 진행 · 생산 완료 | 완료 → 검사관리 |
| **생산실적관리** | 설비/업체/품명/재질별 분석 | — |
| **출력관리** | 생산일보 · LOT · 작업지시서 | 운영 출력과 **동일 Layout** |

**생산계획 조회:** 금일 · 이번주 · 이번달 · 전체 · 열처리 대기품

---

## 품질관리 (Launcher)

| 카드 | Tab / 내용 | 표시 대상 |
|------|------------|-----------|
| **검사관리** | 전체·양산·개발·기타·미검사·검사완료 | 생산 완료만 · 검사완료 시 제거 |
| **성적서관리** | 전체·미발행·발행완료 | 검사 완료만 · 발행 시 제거 |
| **불량이력관리** | 등록·원인·조치·재발방지·이력 | — |
| **문서관리** | 표준서·도면·공정서·고객·ISO·기타 | — |
| **품질업무일지** | 품질 담당자 일지 | — |

---

## 통계 · 기준정보 · 환경 · 회사정보

| Sidebar | Launcher 카드 |
|---------|---------------|
| 통계관리 | 전체 · 생산 · 품질 · 영업 |
| 기준정보관리 | 거래처 · 제품 · 재질 · 공정 · 설비 |
| 환경설정 | 관리자 · 시스템 · 개발자 · QR등록 |
| 회사정보 | 정보관리 · 작업자관리 |

---

## 데이터 표시 원칙 (가장 중요)

**모든 화면에서 동일 LOT 리스트 ❌**

| 화면 | 표시 |
|------|------|
| 입고등록 | 입고 완료 · 생산 미투입 |
| 생산계획 | 열처리 대기품 |
| 설비장입 | 장입 대기/장입중 |
| 생산일보 | 생산 진행 |
| 검사관리 | 검사 대기 (생산 완료) |
| 성적서관리 | 성적서 미발행 |
| 출고등록 | 출고 대기 |
| 재고관리 | 현재 재고 |

출고 완료 → **출고등록 '출고완료' 탭**에서만 조회

---

## 업무 자동 이동

```text
입고등록 완료 → 생산계획
LOT 생성 → 설비장입
생산일보 → 검사관리
검사관리 → 성적서관리
성적서관리 → 출고등록
출고등록 → 출고완료
```

**Engine:** TitanWorkflowEngine · 사용자 수동 상태 변경 ❌

---

## UI 원칙

- 모든 **Launcher** = 동일 디자인 (`TitanLauncherHubPage`)
- 모든 **리스트** = 동일 Layout (`TitanDataTable`)
- **출력관리** = 운영 · 생산 **동일 UI**

---

## Blueprint · 구현 게이트

```text
V2.0 Architecture (본 문서) ✅ PM 승인
      ↓
Blueprint V2.0 개정 (화면별 Task 필터 · 자동 이동 명세)
      ↓
PM 승인
      ↓
구현 → QA → Freeze
```

**현재 금지 (Blueprint V2.0 승인 전):**

- Sidebar / Router 변경
- 화면별 list filter 전환
- Launcher 카드 구조 변경
- Workflow auto-transition UI

**V1.7 Blueprint Sprint:** HOME Review 등 진행 중 — **V2.0 Architecture를 기준으로 Blueprint 개정** 필요

---

## Companion

- `src/config/titanBlueprintV17.js` — Blueprint 방법론
- `src/config/menuFreezeV1.js` — V1.5 Sidebar (현재 Runtime · V2.0 전환 전)
- `.cursor/rules/project-titan-v1.5-launcher-architecture-final.mdc`
- `src/foundation/workflow/TitanWorkflowEngine.js` — 자동 이동 Engine
