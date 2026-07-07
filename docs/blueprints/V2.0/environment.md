# Blueprint — 환경설정 (V2.0 · System Administration Workspace)

**Status:** 🔒 **Freeze (Official)** · PM Final Review 2026-07-07 (⑧/10) · **Route:** `/environment` · **구현 ❌**

> **공식 역할:** 시스템 동작 방식을 관리하는 **System Administration Workspace**  
> **공식 원칙:** 운영/생산/품질 데이터 직접 수정 ❌ · 설정으로 시스템 전체 동작 제어  
> Code SSoT: `ENVIRONMENT_BLUEPRINT` · `TITAN_V20_ENVIRONMENT_PROFILES` · `TITAN_V20_ENVIRONMENT_BLUEPRINT_REVIEW`

---

## 공식 역할

환경설정은 **System Administration Workspace**입니다.

운영·생산·품질 데이터를 직접 수정하지 않으며, **설정 변경을 통해 시스템 전체의 동작을 제어**합니다.

```text
환경설정 (설정)
   ↓
시스템 전역 동작 반영
```

---

## Workspace 구조 (공식)

```text
환경설정
├ 관리자
├ 시스템
├ 개발자
└ QR 등록
```

Launcher **4 Cards** 구조.

---

## 3 Profile (PM 추가 지시)

### ① System Profile

시스템 기본 동작.

| 항목 | 내용 |
|------|------|
| 회사 기본 설정 | 회사 기준값 |
| 시스템 옵션 | 동작 옵션 |
| 출력 옵션 | 인쇄/PDF |
| QR 옵션 | QR 정책 |

### ② Permission Profile

권한 프로파일.

| 항목 | 내용 |
|------|------|
| 관리자 권한 | 전체 권한 |
| 일반 사용자 권한 | 제한 권한 |
| 읽기/쓰기 권한 | R/W 제어 |

### ③ Environment Profile

실행 환경.

```text
개발 → 테스트 → 운영
```

> 이 세 가지 Profile을 기준으로 환경설정을 설계합니다.

---

## PM Screen Review 보완 (2026-07-07)

### ① Role Profile

권한은 **역할(Role) 기반**으로 관리합니다.

| Role | 비고 |
|------|------|
| Administrator | 전체 |
| Quality | 품질 |
| Production | 생산 |
| Sales | 영업 |
| Viewer | 조회 |

**Blueprint 정의만 · 구현 나중.**

### ② Feature Toggle

기능 확장 정책 (On/Off).

| 항목 | 예시 |
|------|------|
| Module ON/OFF | 회계 · 영업 모듈 |
| Print ON/OFF | 출력 정책 |
| Workflow ON/OFF | Workflow 정책 |

### ③ QR Policy

QR 등록은 **QR 발급 정책**을 관리합니다. (생성 정책만 · 실제 생성은 Workflow)

| QR | 용도 |
|----|------|
| Master QR | 설비 등 Master |
| LOT QR | LOT 단위 |
| Traceability QR | 추적 |

> 각 QR는 **생성 정책만 관리**하며, 실제 생성은 Workflow에서 수행합니다.

### System Policy

```text
Feature Toggle · Module Enable/Disable · Print Policy · Workflow Policy
```

예: 회계 모듈 On/Off · 영업 모듈 On/Off · 출력 정책 · Workflow 정책

### Data 정책

```text
System Setting → Engine → Workspace
```

설정만 변경하고, **실제 업무 데이터는 변경하지 않습니다.**

---

## 1. Purpose

System Administration Workspace — 시스템 동작 방식 관리 (System/Permission/Environment Profile). 관리자·시스템·개발자·QR등록 설정 · 저장경로 · MES PoC(Admin) · About.

## 2. Role

**가능:** System/Permission/Environment Profile · 개발자 도구 · QR 등록 센터  
**불가:** 운영/생산/품질 데이터 직접 수정 · 일상 생산/품질 업무 · Master Data 대체

## 3. Task Scope

| 항목 | 내용 |
|------|------|
| **Workspace** | 시스템 관리자 — 설정으로 시스템 전체 제어 |
| **표시만** | System · Permission · Environment Profile · 개발자 · QR등록 |
| **표시 안 함** | 업무 LOT 데이터 · 운영/생산/품질 트랜잭션 |
| **다음 화면** | 해당 없음 (설정 반영은 전역) |

## 4. Exit Condition

| 항목 | 내용 |
|------|------|
| **종료 조건** | 해당 없음 (설정 상시) |
| **다음 화면** | 설정 변경 → 시스템 전역 반영 |
| **Engine** | 해당 없음 |

## 5. Layout

```text
Breadcrumb → Launcher Hub (4카드)
Section panels per Profile
```

## 6. Data

- Store: `dashboardStore` (cache)
- Config: `operationMode` · `titanEditionSession` · `demoAdminPolicy`
- Profiles: System · Permission · Environment
- 설정만 관리 · 업무 데이터 직접 수정 ❌

## 7. Workflow

```text
설정 변경 → Session/config persist → Sidebar/HOME 반영 (module)
Permission Profile → 사용자 권한 · 화면 접근 제어
Environment Profile → 개발/테스트/운영 동작 전환
```

## 8. Automation

| 사용자 | 시스템 |
|--------|--------|
| 설정값 · Profile 선택 · Edition | Demo Admin watermark · Repository status · 권한 게이트 |

## 9. Connected Screens

전역 · 기준정보(QR) · HOME · 권한 게이트 전 화면

## 10. Output

QR 출력센터 (Roadmap)

## 11. Freeze Criteria

- [ ] System Administration
- [ ] System Profile
- [ ] Permission Profile
- [ ] Role Profile
- [ ] Environment Profile
- [ ] QR Policy
- [ ] Feature Toggle
- [ ] PM Final Review · Freeze

---

## PM Screen Review 결과 (2026-07-07)

| 항목 | 결과 |
|------|------|
| Purpose | ✅ Approved |
| Role | ✅ Approved |
| Task Scope | ✅ Approved |
| Exit Condition | ✅ Approved |
| Layout | ✅ Approved |
| Data | ⚠️ → Feature Toggle / Role Profile 추가 (반영) |
| Workflow | ✅ Approved |
| Automation | ✅ Approved |
| Connected Screens | ✅ Approved |
| Output | ✅ Approved |
| Freeze Criteria | ✅ Approved (Final Review) |

**보완 반영:** Role Profile · Feature Toggle · QR Policy · System Policy → **🔒 Official Freeze**
