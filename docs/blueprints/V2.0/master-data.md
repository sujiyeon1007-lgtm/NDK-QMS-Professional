# Blueprint — 기준정보관리 (V2.0 · Master Data Workspace)

**Status:** 🔒 **Freeze (Official)** · PM Final Review 2026-07-07 (⑦/10) · **Route:** `/settings` · **구현 ❌**

> **공식 역할:** 모든 Workspace가 참조하는 **Master Data Workspace (SSoT)**  
> **공식 원칙:** 각 Master = 단일 진실 공급원(SSoT) · 중복 관리 ❌  
> Code SSoT: `MASTER_DATA_BLUEPRINT` · `TITAN_V20_MASTER_STORE_SSOT_PRINCIPLE` · `TITAN_V20_MASTER_DATA_BLUEPRINT_REVIEW`

---

## 공식 역할

기준정보관리는 **Master Data Workspace**입니다.

직접 생산·품질 업무를 수행하지 않으며, 모든 Workspace가 참조하는 **Master의 단일 관리 영역**입니다.

```text
기준정보관리 (Master SSoT)
        ↑ 참조
운영관리 · 생산관리 · 품질관리 · 통계관리 · LOT Lifecycle
```

---

## Workspace 구조 (공식)

```text
기준정보관리
├ 거래처관리
├ 제품관리
├ 재질관리
├ 공정관리
├ 설비관리
└ 작업자관리
```

Launcher **6 Cards** 구조.

---

## Master Store 원칙 (PM 추가 지시)

각 Master는 **단일 진실 공급원(SSoT)** 이며, 다른 Workspace에서 중복 관리하지 않습니다.

| Store | 관리 대상 |
|-------|-----------|
| **Customer Store** | 거래처 |
| **Product Store** | 제품 · 품번 · 열처리 Spec |
| **Material Store** | 재질 |
| **Process Store** | 공정 |
| **Equipment Store** | 설비 · 설비 QR |
| **Worker Store** | 작업자 |
| **Company Store** | 회사정보 (회사정보 화면) |

**단일 SSoT 예시**

```text
제품명 수정   → Product Store만 변경
설비명 수정   → Equipment Store만 변경
작업자 정보   → Worker Store만 변경
```

> Master 수정은 **해당 Store에서만** · 다른 Workspace는 **참조만 (Read Only)**.

---

## PM Screen Review 보완 (2026-07-07)

### ① Master Version

각 Master는 변경 버전을 관리합니다.

```text
Product Master   v1 → v2 → v3
```

향후 변경 이력 관리 · 성적서/문서 Revision 연동. **Blueprint 정의만 · 구현 나중.**

### ② Master Audit

모든 Master는 변경 이력을 남깁니다.

| 필드 | 내용 |
|------|------|
| 수정자 | 변경한 사용자 |
| 수정일 | 변경 일시 |
| 변경 내용 | 변경 항목 |

**Blueprint 정의만 · 구현 나중.**

### ③ Equipment QR (설비관리)

```text
설비등록 → Equipment QR 생성 → Control Room → 생산관리
```

설비당 1 QR · Master QR payload · Smart Access ID.

### ④ Product Master 확장 (제품관리)

단순 품번만 관리하지 않습니다. 공식 관리 항목:

| 항목 | 비고 |
|------|------|
| 품번 | |
| 품명 | |
| 고객사 | Customer Store 참조 |
| 재질 | Material Store 참조 |
| 열처리 Spec | 업체+품번 기준 |
| 도면번호 | |
| Revision | 도면 개정 |

> 향후 **성적서 자동 생성** 시 이 정보를 그대로 사용합니다.

### ⑤ Worker = Master Data

작업자관리는 향후 **생산일보 · 검사관리 · LOT 로그 · 권한**이 모두 참조합니다. Worker = Master Data.

### Data 정책 (Read Only)

```text
Master Store (읽기/쓰기 유일)
        ↓
Workspace (Read Only)
```

Master Store는 **읽기/쓰기 가능한 유일한 공간**이며, 다른 Workspace는 **읽기 전용**입니다.

---

## 1. Purpose

Master Data Workspace (SSoT). 모든 Workspace가 참조하는 Master 단일 관리 영역. Master First 정책 기준 · 설비 QR(Master) 생성.

## 2. Role

**가능:** Master CRUD · 설비 QR · 열처리 Spec(업체+품번) · 삭제 가드  
**불가:** LOT/Workflow 실행 · 입고/출고 트랜잭션 · **다른 Workspace Master 중복 관리**

## 3. Task Scope

| 항목 | 내용 |
|------|------|
| **Workspace** | 기준정보 담당자 — Master 등록·관리 |
| **표시만** | 거래처 · 제품 · 재질 · 공정 · 설비 · 작업자 |
| **표시 안 함** | Workflow LOT 진행 데이터 |
| **SSoT** | 각 Master = 단일 SSoT · 중복 관리 ❌ |

## 4. Exit Condition

| 항목 | 내용 |
|------|------|
| **종료 조건** | 해당 없음 (Master 상시) |
| **다음 화면** | 전 화면 Master 참조 (Master First) |
| **Engine** | 해당 없음 |

## 5. Layout

Breadcrumb → Launcher Hub (6카드) → List (TitanDataTable) → Detail Popup (Tabs)

## 6. Data

- Store: `customerStore` · `productStore` · `materialStore` · `processStore` · `equipmentStore` · `workerStore`
- Company Store = 회사정보 화면 관리 (별도 화면)
- 각 Store = **단일 SSoT** · 중복 관리 ❌
- Sync: `masterDataSync.js` · `initMasterDataStoresFromSessionStorage`

## 7. Workflow

```text
Master 등록 → Store SSoT → 운영/생산/품질/통계/LOT Lifecycle 참조
Master 수정 → 해당 Store만 변경 (중복 관리 ❌)
설비 QR → Master QR payload
```

## 8. Automation

| 사용자 | 시스템 |
|--------|--------|
| Master 입력 · QR 생성 | EquipmentStore seed · Smart Access ID · 삭제 가드 |

## 9. Connected Screens

Master SSoT — **전 Workspace 참조**: 운영 · 생산 · 품질 · 통계 · 설비현황 · LOT Lifecycle · 회사정보(Company Store)

## 10. Output

설비 QR PDF (Roadmap)

## 11. Freeze Criteria

- [ ] Master Store (7 Store · SSoT)
- [ ] SSoT · 타 Workspace Read Only
- [ ] Master Audit (Blueprint 정의)
- [ ] Master Version (Blueprint 정의)
- [ ] Equipment QR (설비관리)
- [ ] Worker Master
- [ ] PM Final Review · Freeze

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

**Freeze 기준 충족:** Master Store · SSoT · Master Version · Master Audit · Equipment QR · Worker Master → **Official Freeze**
