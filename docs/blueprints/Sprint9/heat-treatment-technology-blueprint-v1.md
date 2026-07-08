# Sprint 9 Blueprint V1.2 — Heat Treatment Technology Database

**Status:** 🔒 **OFFICIAL BLUEPRINT** · Phase 4 ✅ · Phase 5 ✅ **완료** · Sprint 9 Official Freeze 대기  
**Version:** Blueprint V1.7 (Phase 5 LOT Lifecycle · Document JSON Payload · TDE Interface) · **2026-07-08**
**Baseline:** Sprint 8 Official Freeze — Master Data Workspace  
**구현:** Phase 1 ✅ · Phase 2 🔒 · Phase 3 🔒 · Phase 4 ✅ · Phase 5 ✅ · **Sprint 9 Official Freeze 대기**

> **PM 지시:** 현재 코드 구조가 아니라 **최종 업무 프로세스**를 기준으로 설계합니다.  
> 구현은 Blueprint PM 승인 후 Sprint 9에서 **단계적으로** 진행합니다.

---

## 0. Executive Summary

Sprint 9는 Project TITAN이 **회사의 열처리 기술을 축적·연결하는 데이터베이스**를 갖추는 Sprint입니다.

| 구분 | Sprint 9 목표 | Sprint 9 제외 |
|------|---------------|---------------|
| **목적** | 표준 Recipe · 실제 작업 · 검사 결과를 LOT 단위로 연결 | AI 추천 · ML · 자동 최적화 |
| **산출** | Blueprint · 데이터 모델 · Workspace 정의 | React · Router · Store · API 구현 |
| **가치** | "이 LOT는 왜 이렇게 작업했고, 결과는 어땠는가"를 기술 데이터로 보존 | 신뢰도 점수 · Recommendation UI |

---

## 1. 설계 목적 (Purpose)

### 1.1 왜 Sprint 9인가

Sprint 8까지 **Master Data Workspace**가 Freeze되었습니다.

- 거래처 · 제품 · 재질 · 공정 · 설비 · 작업자 = **"누가 · 무엇을 · 어떤 설비/공정으로"**
- Sprint 9 = **"어떤 조건으로 · 어떤 목표 품질을 · 실제로 어떻게 만들었는가"**

열처리 전문 QMS의 핵심 경쟁력은 **기술 데이터의 축적**입니다.

### 1.2 Sprint 9가 해결하는 현장 문제

| 현장 문제 | Sprint 9 Blueprint 답 |
|-----------|----------------------|
| 도면 요구 경도/깊이가 제품마다 다른데 어디에 저장? | **Product Specification** |
| 회사 표준 열처리 조건이 사람/폴더/경험에만 있음 | **Heat Treatment Recipe Master** |
| 생산일보에 실제 온도·시간을 썼지만 표준과 비교 불가 | **표준 Recipe + Actual Work Record** 분리 |
| 검사 결과와 작업 조건이 LOT에서 끊김 | **Knowledge Record** (LOT 단위 기술 데이터) |
| 성적서(TDE)에 어떤 Spec 기준으로 판정했는지 추적 어려움 | **Specification Snapshot + TDE 연계** |

### 1.3 설계 철학

```text
표준(Recipe)은 참고용
실제(Production)는 작업자가 입력
목표(Specification)는 도면/고객 기준
결과(Inspection)는 측정/판정
────────────────────────────────
Knowledge = 위 네 가지를 LOT 단위로 묶은 기술 이력
```

**AI가 없어도** 현장은 이 구조만으로 기술 DB가 됩니다.

---

## 2. Architecture

### 2.1 전체 Architecture (Sprint 8 Baseline 위 확장)

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Sprint 8 — Master Data (Freeze)               │
│  Customer · Product · Material · Process · Equipment · Worker   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ 참조 (Read Only from Workspace)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Sprint 9 — Technology Layer (Blueprint)       │
│  Product Specification │ Recipe Master │ Knowledge Record Schema │
└───────────────────────────────┬─────────────────────────────────┘
                                │ LOT 단위 연결
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Operational Workspace (기존 Blueprint · Freeze)       │
│  Production Workspace  │  Quality Workspace  │  LOT Lifecycle    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TDE (성적서 · 출력)                       │
│  Specification 기준 판정 · Inspection 결과 · Knowledge 이력       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 개념 4분리 (Sprint 9 핵심 — 혼합 금지)

| 개념 | 의미 | 저장 위치 | 비고 |
|------|------|-----------|------|
| **Product Specification** | 도면/고객 **목표 품질** | Product Master (업체+품번) | "얼마나 좋아야 하는가" |
| **Heat Treatment Recipe** | 회사 **표준 작업 조건** | Recipe Master | "보통 이렇게 한다" |
| **Actual Work Record** | **실제 작업 조건** | Production (LOT/작업 이력) | 작업자 직접 입력 |
| **Inspection Result** | **측정·판정 결과** | Quality (검사일지) | Spec 대비 PASS/FAIL |

> **Current Process (9-stage Workflow)** 와 **Heat Treatment Process (이온질화·침탄 등)** · **Task Status** · **Inspection Result** 는 Sprint 8과 동일하게 **절대 혼합하지 않습니다.**

### 2.3 Store Architecture (Blueprint 정의 · 구현 예정)

| Store (planned) | SSoT | 쓰기 | 읽기 |
|-----------------|------|------|------|
| `customerStore` | 거래처 | Master | 전 Workspace |
| `productStore` | 제품 + **Product Specification** | Master | 전 Workspace |
| `materialStore` | 재질 | Master | 전 Workspace |
| `processStore` | 공정 **종류** | Master | 전 Workspace |
| `equipmentStore` | 설비 | Master | 전 Workspace |
| `workerStore` | 작업자 | Master | 전 Workspace |
| **`recipeStore`** (신규) | **표준 Recipe** | Recipe Master | Production · Knowledge |
| `lotStore` | LOT Lifecycle | Production Engine | 전 Workspace |
| `productionStore` | 생산일보 · **Actual Work Record** | Production | Knowledge · LOT |
| `qualityStore` | 검사 · **Inspection Result** | Quality | Knowledge · TDE |
| **`knowledgeStore`** (신규) | **Knowledge Record** | Engine (자동 집계) | LOT · TDE · 통계(향후) |

**원칙:** Master/Recipe는 해당 Workspace에서만 CRUD · 운영 Workspace는 **참조 + Actual/Inspection 입력**.

### 2.5 공식 Architecture 흐름 (PM 확정 · V1.2 유지)

```text
Material
        ↓
Product
        ↓
Product Specification
        ↓
Heat Treatment Recipe (Status · Version)
        ↓
Production (Recipe Version 참조 · Actual 입력)
        ↓
Inspection
        ↓
LOT (Lifecycle · Technology Summary)
        ↓
Knowledge Record (스키마 · §2.6)
        ↓
TDE (Rendering only · §2.7)
```

**V1.2 Architecture 확장:** Knowledge Record 저장 항목 · TDE Rendering 원칙 추가 — **흐름 순서 변경 없음**

### 2.6 Knowledge Record 연계 (PM V1.2 · Architecture)

Production · Inspection 완료 후 **Knowledge Record**에 기술 데이터를 귀속합니다. (Engine 구현 ❌ · 스키마만)

```text
Production
        ↓
Inspection
        ↓
Knowledge Record
```

**Knowledge Record 저장 항목 (Blueprint):**

| 항목 | 출처 | 비고 |
|------|------|------|
| **Recipe Version** | Production Snapshot | V1 · V2 · V3 고정 |
| **실제 작업 조건** | Actual Work Record | 작업자 입력 |
| **Inspection Result** | Quality Store | 경도 · 깊이 · 외관 |
| **Equipment** | Equipment Store | 설비 ID · 명 |
| **Operator** | Worker Store | 작업자 · 검사자 |
| **Quantity** | LOT / Production | 수량 |
| **PASS / FAIL** | Inspection Result | Spec 기준 판정 |

> **AI 기능 ❌** — Sprint 9는 **저장 구조만** 정의 · 추천·분석·자동 판정 없음

### 2.7 TDE 연계 원칙 (PM V1.2 · Architecture 마지막)

TDE(Technical Document Engine)는 Architecture **최종 단계**이며, 아래 원칙을 **절대 위반하지 않습니다.**

```text
TDE는 TITAN이 생성한 Document JSON만 Rendering한다.
TDE는 계산하지 않는다.
TDE는 판정하지 않는다.
TDE는 데이터를 생성하지 않는다.
```

| 역할 | 담당 (TDE ❌) |
|------|---------------|
| **계산** (유효경화깊이 등) | `heatTreatmentCalculationEngine` · Inspection |
| **판정** (PASS/FAIL) | Inspection · Product Specification |
| **데이터 생성** | Production · Quality · Master Store |
| **Rendering** | **TDE** — Document JSON → Print/PDF/Preview |

**Architecture 흐름 순서 변경 없음** — §2.5는 Sprint 9 Blueprint **공식 Architecture**입니다.

---

### 2.4 Primary Key · Traceability 축

```text
mesManagementNo (MES 관리번호) — 품질 Primary Key
        ↓
lotNo (작업일보 LOT 생성) — 생산·품질 Traceability Key
        ↓
knowledgeRecordId — 기술 데이터 묶음 Key (1 LOT · 1 공정 cycle = 1 Record 권장)
```

---

## 3. Workspace 구성

### 3.1 기준정보관리 Launcher 확장 (Blueprint)

Sprint 8 Freeze Launcher **6 Cards** 유지 + Sprint 9 **1 Card 추가**:

```text
기준정보관리 (/settings)
├ Master Dashboard          (/settings/dashboard)     — Sprint 8 Freeze
├ 거래처관리                (/settings/companies)     — Business Master
├ 제품관리                  (/settings/products)      — Business Master + Spec
├ 재질관리                  (/settings/materials)     — Domain Master
├ 공정관리                  (/settings/processes)     — Domain Master
├ 설비관리                  (/settings/equipment)     — Domain Master
├ 작업자관리                (/settings/workers)       — Domain Master
└ ★ 열처리 Recipe 관리      (/settings/recipes)       — Sprint 9 (Domain Master)
```

**UX 패턴:** Sprint 8 Domain Master Workspace (2-Panel) 재사용 — KPI · Search · List · Detail Tabs · Footer Health.

### 3.2 Product Specification Workspace

**위치:** 제품관리 (Business Master) — **별도 Sidebar 메뉴 ❌**

```text
제품관리
  List → Double-click Popup
    Tab: 기본정보 · 도면/Revision · ★ 품질 Specification · 연관 Recipe · 생산이력 · 품질이력
```

**역할:** 업체+품번 기준 **목표 품질 SSOT** (Default Specification Key = Company + Part No).

### 3.3 Heat Treatment Recipe Master Workspace

**위치:** 기준정보관리 Launcher **8번째 카드**

```text
열처리 Recipe 관리 (Domain Master · 2-Panel)
  Left:  Recipe List (Recipe명 · 공정 · 재질 · 설비 · 상태 · Health)
  Right: Detail Tabs
    ① 기본정보
    ② 공정 조건 (온도 · 시간 · 분위기 · 압력 · 냉각)
    ③ 연결 Master (재질 · 공정 · 설비 · 적용 제품)
    ④ 적용 이력 (LOT · Actual vs Standard diff — 조회)
    ⑤ 작업 메모 · 주의사항
    ⑥ Version · Approval 이력 · Status · 최근 수정
  Footer: 선택 Recipe · Recipe코드 · Version · Status · Approved By · Health Badge
```

### 3.4 Production Workspace 연계 (기존 Freeze · Sprint 9 확장 정의)

**변경 원칙:** 생산일보 UI Freeze V1.3 **레이아웃 유지** · **Actual Work Record 필드 추가**만 Blueprint.

```text
생산일보 / 설비장입 (기존)
  + 표준 Recipe 선택/자동 제안 (Read Only 참조)
  + Actual Work Record 입력 (작업자)
      온도 · 유지시간 · 분위기 · 압력 · 냉각 · 특이사항
```

### 3.5 Quality Workspace 연계 (기존 Freeze · Sprint 9 정의)

```text
검사관리 (기존)
  + appliedSpecification (Product Spec Snapshot) 자동 연결
  + Inspection Result → Knowledge Record 연결
  + Spec 대비 판정 (목표 vs 측정)
```

---

## 4. 데이터 흐름 (Data Flow)

### 4.1 공식 End-to-End 흐름

```text
① Material Master
        ↓ (재질 특성 · 대표 공정 참조)
② Product Master (업체 + 품번)
        ↓
③ Product Specification (목표 품질 · 도면 요구)
        ↓
④ Heat Treatment Recipe (회사 표준 조건 · 재질+공정+설비 연결)
        ↓
⑤ Production
   · 표준 Recipe 참조 (자동 제안 · 변경 가능)
   · Actual Work Record 입력 (작업자 · 최종 진실)
        ↓
⑥ Inspection
   · Spec Snapshot 기준 자동 계산 (경도 · 유효경화깊이)
   · 측정값 · 외관 · PASS/FAIL/REWORK
        ↓
⑦ LOT
   · LOT Lifecycle · Technology Summary (요약만)
        ↓
⑧ Knowledge Record
   · Spec + Recipe Version + Actual + Inspection 묶음 (스키마)
        ↓
⑨ TDE (성적서 · 검사 리포트)
   · Spec 기준 출력 · Inspection Final · Knowledge 이력 링크
```

### 4.2 LOT 단위 Knowledge Record 생성 흐름 (Engine · Blueprint)

```text
LOT 생성 (생산계획)
  → Product Spec Snapshot 저장
  → Recipe **특정 Version** 참조/선택 (Approved만 Production 선택 가능)
  → 생산 완료 시 Actual Work Record 확정
  → 검사 완료 시 Inspection Result 확정
  → Knowledge Record 자동 생성/갱신 (구현 Sprint — Blueprint는 스키마만)
  → LOT Lifecycle (요약) · TDE에서 조회
```

### 4.3 표준 vs 실제 vs 목표 vs 결과 관계

```text
┌──────────────────┐     ┌──────────────────┐
│ Product Spec     │     │ Recipe (표준)     │
│ (목표 품질)       │     │ (표준 작업 조건)   │
└────────┬─────────┘     └────────┬─────────┘
         │                        │ 참고
         │ 목표                   ▼
         │              ┌──────────────────┐
         │              │ Actual Work      │
         │              │ (실제 작업 조건)  │
         │              └────────┬─────────┘
         │                       │
         ▼                       ▼
┌────────────────────────────────────────────┐
│           Inspection Result                 │
│  Spec 대비 판정 · Recipe 대비 편차(참고)      │
└────────────────────┬───────────────────────┘
                     ▼
            Knowledge Record (LOT)
```

**정책:**

- **합격/불합격 판정** = Product Specification vs Inspection (Recipe ❌)
- **Recipe vs Actual 편차** = 기술 이력·분석용 (판정 ❌)
- **작업자** = Actual Work Record **최종 입력 책임**

---

## 5. 각 Master / 데이터 영역의 역할

### 5.1 Sprint 8 Master (Freeze · 참조만)

| Master | Sprint 9에서의 역할 |
|--------|---------------------|
| **Material** | Recipe 재질 연결 · Spec 재질 참조 · 재질별 대표 공정 힌트 |
| **Product** | Spec Host · Recipe 적용 대상 · LOT·TDE 중심 Key |
| **Process** | 공정 **종류** 정의 (이온질화·침탄·고주파…) — Recipe의 공정 분류 |
| **Equipment** | Recipe 사용 설비 · Actual Work 설비 · QR 장입 |
| **Worker** | Actual Work 입력자 · 검사자 · Knowledge Audit |
| **Customer** | Spec 업체 기준 · Recipe/Spec 업체별 차이 |

### 5.2 Product Specification (Sprint 9 신규 정의)

**SSoT Key:** `company + partNo` (업체+품번 — PM 확정 정책)

| 섹션 | 필드 (예) | 비고 |
|------|-----------|------|
| **경도 목표** | 표면경도 · 심부경도 · 단위(HV/HRC…) | 도면 Spec |
| **깊이 목표** | 유효경화깊이 · 경화깊이 · 연마여유 | 계산 기준 포함 |
| **층 목표** | 화합물층 · 질화층 · 침탄층 · 산화층 | 공정별 해당 항목 |
| **외관** | 찍힘 · 색상 · 얼룩 · 기타 | 검사 Checklist 연동 |
| **치수** | 항목별 Spec (선택) | |
| **조직** | 조직사진 필요 여부 | |
| **열처리 계산 설정** | effectiveDepthBasis · specifiedHv · grindingAllowance · certificateOutputMode | 기존 Engine 정책 유지 |
| **기타 고객 요구** | free text · 첨부 참조 | |
| **도면/Revision** | drawingNo · revision · 승인일 | Document Management 연동(향후) |

**역할:** "이 품번은 **이 품질**이어야 한다" — **목표만** 저장 · 작업 조건 ❌

### 5.3 Heat Treatment Recipe Master (Sprint 9 신규)

**SSoT Key:** `recipeId` (내부) · 표시: `recipeCode` (예: `RCP-ION-SCM415-001`)

> **Phase 2 Revision (2026-07-08):** Recipe는 **고정 입력폼 ❌**. 공정(Process)에 따라 **Recipe Template**이 결정되고, Parameter는 Template 정의에서 **자동 생성**됩니다.

#### 5.3.0 Recipe Template Engine (PM 신규 Architecture · Phase 2 Revision)

**Code SSoT:** `src/config/recipeTemplateEngine.js`

```text
Recipe
  ↓
Process (Sprint 8 Process Master)
  ↓
Recipe Template
  ↓
Parameter (key-value · recipe.parameters)
```

| 원칙 | 내용 |
|------|------|
| **Parameter 하드코딩 ❌** | UI/페이지에 온도·시간·가스 필드를 직접 정의하지 않음 |
| **Template SSoT** | Template Registry에 Parameter 정의 → Workspace 자동 렌더 |
| **공정별 Template** | 이온질화 ≠ 연질화 — 관리 항목이 다름 |
| **확장** | 신규 공정 = **Template 추가만** — 화면 수정 ❌ |

**Architecture:**

```text
Process Master (Freeze)
        ↓
Recipe Template Registry
        ↓
Recipe.parameters { key: value }
        ↓
Workspace 「공정 조건」Tab (자동 생성)
```

**Active Templates (현재 지원):**

| Template ID | 공정 | Parameter (예) |
|-------------|------|----------------|
| `ion-nitriding` | 이온질화 | 방전전류 · 방전전압 · 처리압력 · 처리온도 · 처리시간 · 질소 · 수소 · 아르곤 · X2 |
| `soft-nitriding` | 연질화 | 처리온도 · 처리시간 · CO₂ · 질소 · 암모니아 |

**Planned Templates (Blueprint 준비 · 향후 Template 추가):**

| Template ID | 공정 | 상태 |
|-------------|------|------|
| `gas-nitriding` | 가스질화 | planned |
| `salt-bath-nitriding` | 염욕질화/산질화 | planned |

**Recipe 데이터 모델 (Template 기반):**

```json
{
  "templateId": "ion-nitriding",
  "processId": "h2",
  "processName": "이온질화",
  "parameters": {
    "dischargeCurrent": "45",
    "dischargeVoltage": "380",
    "processPressure": "2.0",
    "treatmentTemp": "520",
    "treatmentTime": "1200",
    "nitrogen": "24",
    "hydrogen": "2",
    "argon": "0",
    "x2": ""
  }
}
```

**향후 확장 방식:**

1. `RECIPE_TEMPLATE_REGISTRY`에 Template Definition 추가
2. `processNames` / `processIds`로 Process Master 연결
3. Workspace · Health · Summary는 Template Engine이 자동 반영
4. **화면(RecipeManagementPage) 수정 ❌**

**Health Badge (Template + 적용 제품 기준):**

| 조건 | Badge |
|------|-------|
| 필수 Parameter 누락 · Obsolete | 🔴 관리 필요 |
| Draft · Review · 설비 미연결 · **Approved + 적용 제품 0건** | 🟡 확인 필요 |
| Approved + 필수 Parameter + 설비 + 적용 제품 | 🟢 정상 |

| 섹션 | 필드 (예) | 비고 |
|------|-----------|------|
| **기본** | Recipe명 · 코드 · **Status** · **Version** · **Template** · 비고 | Version 정책 §5.3.2 |
| **Master 연결** | materialId · processId · equipmentId(s) | Sprint 8 Store 참조 |
| **공정 조건** | **Template 기반 Parameter** (자동 생성) | §5.3.0 |
| **작업 메모** | 주의사항 · 현장 Tip · 변경 이력 | Template 외 고정 필드 |
| **적용 범위** | 적용 제품(품번) · LOT 이력 (조회) | |

**역할:** "회사는 **보통 이렇게** 한다" — **표준만** 저장 · Actual ❌

**Process Master vs Recipe Master:**

| | Process Master | Recipe Master |
|---|----------------|---------------|
| 질문 | 어떤 **종류**의 열처리인가? | **구체적으로** 몇 ℃ · 몇 분? |
| 예 | 이온질화 · 침탄 | SCM415 이온질화 520℃ × 20h NH₃ |
| Sprint | 8 Freeze | 9 Blueprint |

#### 5.3.0.1 Recipe Template Version 정책 (PM V1.3 · 설계만 · 구현 ❌)

> **Status:** 🔵 **Blueprint 설계만** — 본 Phase 구현 ❌. Template 정의 변경(Parameter 추가·삭제·필수화 등) 이력을 추적하기 위한 **Template 자체의 Version** 정책.

**Recipe Version(§5.3.2)과 별개 개념입니다.**

| 개념 | 대상 | 질문 |
|------|------|------|
| **Recipe Version** | 개별 Recipe 조건값 | 이 Recipe의 조건이 바뀌었나? (520℃ → 530℃) |
| **Template Version** | Template 정의(Parameter 구조) | 이 공정의 **관리 항목**이 바뀌었나? (X2 Parameter 추가) |

```text
Ion Nitriding Template
        ↓
      V1   (방전전류 · 방전전압 · 처리압력 · 처리온도 · 처리시간 · 질소 · 수소 · 아르곤)
        ↓
      V2   (+ X2 Parameter 추가)
```

**설계 원칙 (향후 구현 대상):**

| 규칙 | 내용 |
|------|------|
| **Template 정의 변경** | Parameter 추가·삭제·필수 변경 시 **Template Version 증가** |
| **기존 Recipe 영향** | 과거 Recipe는 **작성 당시 Template Version** 기준으로 해석 |
| **Registry 필드 (향후)** | `templateVersion` · `templateVersionHistory[]` |
| **하위 호환** | 신규 Parameter는 optional 우선 · required 승격 시 Template Version 증가 |
| **Actual Work Record** | `templateId` + `templateVersion` Snapshot 기록 (§5.4) |

**향후 Registry 구조 (설계 예시 · 구현 ❌):**

```json
{
  "id": "ion-nitriding",
  "label": "Ion Nitriding Template (이온질화)",
  "templateVersion": "V2",
  "status": "active",
  "sections": [ /* Parameter Metadata (§5.3.0.2) */ ]
}
```

**현재 구현 상태:** Template Version 미도입 — 모든 Active Template은 논리적 `V1`. 실제 `templateVersion` 필드·이력 관리는 **향후 Phase**에서 구현.

#### 5.3.0.2 Parameter Metadata 구조 (PM V1.3 · 설계만 · 구현 ❌)

> **Status:** 🔵 **Blueprint 설계만** — 본 Phase 구현 ❌. Registry Parameter가 **입력 화면 자동 생성**의 기준이 되도록 Metadata를 확장하는 설계.

**목적:** Recipe 등록/수정 Modal · Actual Work Record 입력 폼을 **Registry 정의만으로 자동 생성**. UI에 입력 필드를 하드코딩하지 않음.

**Parameter Metadata (향후 Registry 표준):**

```json
{
  "key": "treatmentTemp",
  "label": "처리온도",
  "type": "number",
  "unit": "℃",
  "required": true,
  "min": 0,
  "max": 1200,
  "step": 1,
  "placeholder": "예) 520",
  "group": "process",
  "actualInput": true
}
```

| 필드 | 설명 | 현재 지원 |
|------|------|-----------|
| `key` | Parameter 고유 키 (parameters 객체 Key) | ✅ |
| `label` | 표시 라벨 | ✅ |
| `unit` | 단위 (℃ · min · L/min …) | ✅ |
| `required` | 필수 여부 (Health 판정) | ✅ |
| **`type`** | 입력 타입 (`number` · `text` · `select`) | 🔵 향후 |
| **`min` · `max` · `step`** | 숫자 입력 검증 범위 | 🔵 향후 |
| **`placeholder`** | 입력 힌트 | 🔵 향후 |
| **`group`** | Section 그룹핑 키 | 🔵 향후 |
| **`actualInput`** | Actual Work Record 입력 대상 여부 | 🔵 향후 |
| **`options`** | `select` 타입 선택지 | 🔵 향후 |

**활용 (향후):**

```text
RECIPE_TEMPLATE_REGISTRY (Parameter Metadata)
        ↓
자동 입력 폼 생성 (Recipe Modal · Actual Work Record)
        ↓
type/min/max/required 기반 검증
```

**현재 구현 상태:** Parameter는 `{ key, label, unit, required }`만 정의. `type` · `min` · `max` · `options` 등 확장 Metadata 및 자동 입력 폼 생성은 **향후 Phase**에서 구현.

#### 5.3.1 Recipe Approval Workflow (승인 상태 · PM V1.1/V1.2)

Recipe Status는 **Master 승인 상태**입니다. Current Process(9-stage) · Task Status · Inspection Result와 **혼합 금지**.

```text
Draft → Review → Approved → Obsolete
```

| Status | 역할 | Production 선택 | 신규 Version | 비고 |
|--------|------|-----------------|--------------|------|
| **Draft** | 작성 중 | ❌ | ✅ (Draft 내 작성) | 초안 · 미완성 조건 허용 |
| **Review** | 검토 중 | ❌ | ❌ (Review 중 동결) | 공정/품질 담당자 검토 |
| **Approved** | 사용 가능 | ✅ **(유일)** | ✅ → **신규 Version** (V2…) | Production·Knowledge 참조 **유일 허용** |
| **Obsolete** | 사용 종료 | ❌ | ❌ | **기존 LOT 조회만** · 신규 작업 ❌ |

**Approval Workflow (PM V1.2 정책):**

```text
Draft ──(검토 요청)──→ Review ──(승인 + Approval Metadata)──→ Approved ──(폐기)──→ Obsolete
  ↑                        │
  └────(반려)───────────────┘
```

| 정책 | 내용 |
|------|------|
| **Draft → Production** | ❌ 선택 불가 |
| **Review → Production** | ❌ 선택 불가 |
| **Approved → Production** | ✅ 선택 가능 (**유일**) |
| **Obsolete → Production** | ❌ · **기존 LOT/Knowledge 조회만** |
| **물리 삭제 (Delete)** | ❌ **금지** |
| **Soft Delete** | ✅ `isDeleted` / `deletedAt` — UI 비표시 · 이력·ISO 추적성 유지 |

**정책:**

- Production · Actual Work Record는 **Approved** Recipe Version만 참조
- Obsolete Version은 **과거 LOT/Knowledge 이력** 조회용 — 수정 ❌
- Status · Approval 변경 = Recipe Master Workspace에서만 (Audit 이력)

#### 5.3.2 Recipe Version 정책 (PM V1.1/V1.2 · In-place 수정 ❌)

Recipe는 **기존 Version in-place 수정 ❌**. 조건 변경 시 **항상 신규 Version** 생성.

```text
Recipe (recipeCode: RCP-ION-SCM415)
        ↓
      V1
        ↓
      V2
        ↓
      V3
```

| 규칙 | 내용 |
|------|------|
| **In-place 수정** | ❌ **금지** |
| **조건 변경** | **항상 신규 Version** (V(n+1)) 생성 |
| **Production 참조** | **특정 Version Snapshot** 고정 참조 |
| **LOT Version** | LOT는 **당시 Version 유지** — 이후 Recipe V3 승인되어도 LOT Snapshot 불변 |
| **이전 Version** | 신규 Version Approved 시 이전 Approved → **Obsolete** (자동 권장) |

**Production 참조 예:**

```text
LOT-20260708-001
        ↓
Recipe V2 Snapshot  (작업 시작 시점 · 불변)
```

**Actual Work Record 필드 (Version 참조):**

- `recipeId` · `recipeCode` · `recipeVersionNo` (예: `V2`)
- `recipeVersionSnapshot` — 작업 시작 시점 Recipe Version 전체 복사

**상세 Recipe 조건:** Recipe Detail Workspace에서만 전체 표시 · LOT Lifecycle은 **요약만** (§6.1.1)

#### 5.3.3 Recipe Approval Metadata (PM V1.2)

Recipe Workspace · **Version 승인 시** Approval Metadata를 기록합니다. (ISO 추적성 · Version 승인 이력)

| 필드 | 설명 |
|------|------|
| **Approved By** | 승인자 (Worker Store · 사용자 ID) |
| **Approved Date** | 승인 일시 |
| **Review Comment** | 검토/승인 코멘트 (반려 사유 · 조건 변경 사유) |

**목적:**

- **승인 이력 관리** — Version별 누가 · 언제 · 왜 Approved 했는지
- **ISO 추적성** — Audit Trail · Soft Delete와 병행
- **Version 승인 기록** — V1 · V2 · V3 각 Version 독립 Approval Metadata

**저장 위치 (Blueprint):** `recipeStore.versions[].approval` — Recipe Detail Tab **「Approval / Version 이력」**

**Review → Approved 전환 시** Approved By · Approved Date · Review Comment **필수** (Blueprint 정책)

### 5.4 Actual Work Record (Production · Phase 3 구현)

> **Status:** 🔄 **Phase 3 구현** (2026-07-08) · **Code SSoT:** `src/utils/actualWorkRecordStore.js` · `src/config/actualWorkRecordModel.js`

**SSoT:** Actual Work Record Store (SessionStorage) · LOT + 작업 이벤트 단위

**역할:** "이 LOT는 **실제로** 이렇게 했다" — **최종 작업 진실**

#### 5.4.1 표준 vs 실제 분리 원칙 (PM 핵심 설계 · 끝까지 유지)

```text
표준 Recipe (Recipe Master)          실제 작업 조건 (Actual Work Record)
        ↓                                      ↓
    읽기 전용 (Read Only)                작업자가 입력 (Editable)
```

| 원칙 | 내용 |
|------|------|
| **Recipe 수정 ❌** | Production/Actual 화면에서 **Recipe 자체를 수정 금지** |
| **Recipe 참조** | Approved Recipe Version **Snapshot 복사** — 이후 불변 |
| **작업자 입력** | 실제 사용 조건만 입력 (표준값은 참고 표시) |
| **Template 재사용** | 입력 항목 = **Recipe Template Parameter** 기반 (§5.3.0) |

#### 5.4.2 저장 항목 (PM V1.4 기준)

```text
ActualWorkRecord {
  id                       // actualWorkRecordId
  lotNo                    // LOT (필수)
  mesManagementNo          // Traceability (선택)

  // ── 표준 Recipe 참조 (Snapshot · 불변) ──
  recipeId
  recipeCode
  recipeVersionNo          // V1 · V2 · V3
  templateId               // ion-nitriding · soft-nitriding …
  recipeParameterSnapshot  // 작업 시작 시점 Recipe 표준 Parameter 복사

  // ── 실제 작업 조건 (작업자 입력) ──
  actualParameters {       // Template Parameter 기반 (실제값)
    treatmentTemp          // 실제 처리온도
    treatmentTime          // 실제 처리시간
    processPressure        // 실제 압력
    dischargeCurrent       // 실제 방전전류
    dischargeVoltage       // 실제 방전전압
    nitrogen · hydrogen …  // 실제 가스 조건
  }

  // ── 작업 정보 ──
  equipmentId · equipmentName   // 설비
  workerId · workerName         // 작업자
  chargeStartAt                 // 장입 시작
  chargeEndAt                   // 장입 종료
  workMemo                      // 작업 메모

  // ── 상태 · 메타 ──
  status                   // 작성중 → 작업중 → 완료 → 검사완료 (§5.4.5)
  createdAt · updatedAt
  isDeleted                // Soft Delete
}
```

#### 5.4.5 Actual Work Status (PM V1.4)

```text
작성중(draft) → 작업중(in-progress) → 완료(completed) → 검사완료(inspected)
```

| Status | 값 | 의미 |
|--------|-----|------|
| **작성중** | `draft` | 기록 작성 중 (신규 기본값) |
| **작업중** | `in-progress` | 장입·열처리 진행 중 |
| **완료** | `completed` | 열처리 작업 완료 |
| **검사완료** | `inspected` | 검사(Inspection) 완료 · Knowledge 입력 준비 |

**Recipe Status(Master 승인)와 혼합 금지** — Actual Work Status는 개별 작업 진행 상태입니다.

##### Actual Work Lock (PM V1.5 · 정책만 · 구현 Phase 4 이후)

> **Status:** 🔵 **Blueprint 정책만** — 본 Phase 구현 ❌.

```text
작성중 → 작업중 → 완료 → 검사완료
                              ↓
                        읽기 전용 (Lock)
```

| 규칙 | 내용 |
|------|------|
| **Lock 전환 시점** | Status가 **`검사완료(inspected)`** 로 전환되면 |
| **Lock 대상** | Actual Work Record **전체** (실제 작업 조건 · 작업 정보) |
| **동작** | 수정 ❌ · 조회 전용 — 검사 완료 후 실제 작업 데이터 변경 금지 |
| **근거** | 검사 이후 작업 진실 고정 · Knowledge Record 입력 데이터 무결성 · ISO 추적성 |
| **해제** | 원칙적으로 ❌ (예외 정책은 향후 별도 · Audit 필요) |

**구현:** Phase 4 이후 (`검사완료` 상태 Row 수정/삭제 버튼 비활성 + Lock 배지).

#### 5.4.6 Template 선택 정책 (PM V1.4)

- 실제 작업 표준 선택은 **Template status `active`** 공정만 노출 (현재 이온질화 · 연질화)
- **`planned` Template**(가스질화 · 산질화)은 선택 목록에서 **제외**
- 향후 Template이 `active`로 변경되면 **자동 표시** (화면 수정 ❌)

| 항목 | 출처 | 입력 |
|------|------|------|
| Recipe Version · Template ID | Recipe Master (Approved) | 선택 (읽기 전용 참조) |
| 실제 처리온도/시간/가스/압력 | 작업자 | ✅ 입력 |
| 실제 방전전류/방전전압 | 작업자 (이온질화 Template) | ✅ 입력 |
| 작업자 · 설비 | Worker/Equipment Master | 선택 |
| 장입 시작/종료 · LOT · 작업 메모 | 작업자 | ✅ 입력 |

#### 5.4.3 Template Engine 재사용 (입력 항목 자동 생성)

실제 작업 조건 입력 항목은 **선택한 Recipe의 Template Parameter**를 그대로 사용합니다.

```text
선택 Recipe → templateId → RECIPE_TEMPLATE_REGISTRY
        ↓
Template Parameter (방전전류 · 처리온도 …)
        ↓
표준값 (읽기 전용) + 실제값 (작업자 입력) 2열 표시
```

- **입력 항목 하드코딩 ❌** — Template 정의 기반 자동 생성 (§5.3.0)
- 신규 공정 Template 추가 시 Actual Work Record 화면 **수정 불필요**

#### 5.4.4 Knowledge Record 연계 (구조 설계만 · Engine ❌)

> **Phase 3 구현 ❌** — Actual Work Record가 **향후 Knowledge Record 입력 데이터**가 되도록 구조만 설계.

```text
Actual Work Record  ─┐
                     ├─→ Knowledge Record (향후 §5.6)
Inspection Result   ─┘
```

- Actual Work Record는 `recipeVersionNo` · `templateId` · `actualParameters` · `lotNo`를 보유 → Knowledge Record의 `actualWorkConditions` 입력원
- **Knowledge Engine · 자동 생성 · 추천 = 본 Phase 구현 ❌**

### 5.5 Inspection Result (Quality · Blueprint)

**SSoT:** Quality Store · 검사일지

| 필드 (예) | 비고 |
|-----------|------|
| `specificationSnapshot` | 검사 시점 Product Spec 복사 |
| **경도** | 측정값 · Engine auto · 검사자 final |
| **유효경화깊이/경화깊이** | heatTreatmentCalculations |
| **외관** | 항목별 OK/NG |
| **Result** | PASS · FAIL · HOLD · REWORK |
| `inspectorId` · `inspectedAt` | |

**역할:** "측정 결과는 **Spec 기준**으로 이렇다"

### 5.6 Knowledge Record (Phase 4 ✅ 승인 · Store만 · Engine ❌)

> **Status:** ✅ **Phase 4 승인** (2026-07-08) · **Official Freeze = Phase 5 완료 후 Sprint 9 전체 Freeze**  
> **Code SSoT:** `src/config/knowledgeRecordModel.js` · `src/utils/knowledgeRecordStore.js`

**목적:** Production(Actual Work Record) + Inspection 결과를 **하나의 기술 데이터**로 LOT에 귀속 (§2.6)

```text
Production → Inspection → Knowledge Record
```

#### 5.6.1 Phase 4 구현 범위 (PM V1.5)

| 항목 | 구현 |
|------|------|
| **Knowledge Record Store** | ✅ SessionStorage CRUD · Soft Delete |
| **Actual Work Record 참조** | ✅ Actual Snapshot(`actualParameters`) 그대로 재사용 |
| **Recipe Snapshot** | ✅ `recipeParameterSnapshot` 그대로 재사용 |
| **Template Engine** | ✅ 조건 표시 재사용 (§5.3.0) |
| **Inspection Result 저장** | ✅ 경도 · 유효경화깊이 · 경화깊이 · 외관 · PASS/FAIL |
| **Knowledge Engine · 추천 · AI** | ❌ **본 Phase 구현 ❌** |
| **Derived Summary (spec/recipe vs actual)** | ❌ Engine 영역 · 구현 ❌ |

**원칙:** Store는 **저장·조회만** — 분석/추천/자동판정 로직 없음.

#### 5.6.2 Knowledge Status (PM V1.6 · 정책만 · 구현 ❌)

> **Status:** 🔵 **Blueprint 정책만** — 본 Phase 구현 ❌.

```text
작성(draft) → 검증(verified) → 확정(confirmed)
```

| Status | 값 | 의미 |
|--------|-----|------|
| **작성** | `draft` | Knowledge Record 초기 작성 · 입력 중 (신규 기본값) |
| **검증** | `verified` | 기술 데이터 검토·교차 확인 완료 |
| **확정** | `confirmed` | LOT 기술 데이터 확정 · 이력·TDE 연계 준비 |

**Actual Work Status · Recipe Status와 혼합 금지** — Knowledge Status는 기술 데이터 생명주기 전용입니다.

**구현:** Phase 5 이후 (Status 필드 · 전환 규칙 · 확정 Lock).

#### 5.6.3 Knowledge Source (PM V1.6 · 필수 Source 정책)

> **Status:** 🔒 **Blueprint 정책** — Knowledge Record는 아래 Source를 **반드시** 유지합니다.

Knowledge Record는 독립 생성 데이터가 아닙니다. 아래 **5가지 Source**를 Traceability 축으로 **항상** 보유·참조합니다.

| Source | 필드 (예) | 역할 |
|--------|-----------|------|
| **LOT** | `lotNo` · `mesManagementNo` | 귀속 단위 · Traceability 허브 |
| **Actual Work** | `actualWorkRecordId` · `actualParameters` | 실제 작업 조건 Snapshot |
| **Inspection** | `inspectionResult` · `result` (PASS/FAIL) | 검사 결과 Snapshot |
| **Recipe Version** | `recipeVersionNo` · `recipeParameterSnapshot` | 표준 Recipe Version Snapshot |
| **Template Version** | `templateId` · (향후 `templateVersionNo`) | 공정 Template 식별 · Version (§5.3.0.1) |

```text
LOT ──┐
      ├──→ Knowledge Record (기술 데이터)
Actual Work ──┤
Inspection ───┤
Recipe Version ─┤
Template Version ┘
```

**정책:**
- Source 중 **하나라도 누락**되면 Knowledge Record는 **불완전**으로 간주 (향후 검증 규칙).
- Source는 **기록 시점 Snapshot** — 원본 Master/Actual/Inspection 변경과 **무관하게 고정**.
- `templateVersionNo`는 §5.3.0.1 Template Version 정책 활성화 시 추가 (현재 `templateId`만).

**구현:** Phase 4 Store는 `lotNo` · `actualWorkRecordId` · `inspectionResult` · `recipeVersionNo` · `templateId` 저장 ✅ · Template Version 필드는 Blueprint 준비.

```text
KnowledgeRecord {
  id                    // knowledgeRecordId
  lotNo
  mesManagementNo
  company · partNo · partName
  quantity                // 수량

  // ── PM V1.2 저장 항목 ──
  recipeVersionNo         // V1 · V2 · V3
  recipeVersionSnapshot   // Recipe Version Snapshot
  actualWorkConditions    // 실제 작업 조건 (Actual Work Record)
  inspectionResult        // Inspection Result (경도 · 깊이 · 외관)
  equipmentId · equipmentName
  operatorId · operatorName   // 작업자 (Operator)
  inspectorId · inspectorName // 검사자 (선택)
  passFail                // PASS · FAIL · HOLD · REWORK

  // Snapshots (시점 고정)
  specificationSnapshot   // Product Spec
  recipeStatusAtSnapshot  // Approved (고정)
  approvalMetadata        // Approved By · Date · Comment (Recipe Version)

  // References
  actualWorkRecordId
  inspectionResultId

  // Derived (향후 Engine — Sprint 9 구현 ❌ · AI ❌)
  specVsInspectionSummary
  recipeVsActualSummary

  // Audit · TDE
  createdAt · updatedAt · createdBy
  tdeDocumentRefs[]       // TDE Document JSON 링크 (Rendering only)
}
```

**Sprint 9:** 스키마 · 연결 규칙만 정의 · **Knowledge Engine · AI 구현 ❌**

---

## 6. LOT / Document JSON / TDE Interface (Phase 5 구현)

> **Status:** ✅ **Phase 5 완료** (2026-07-08) · TDE Engine **구현 ❌**

### 6.0 Phase 5 목적 (PM V1.7)

Phase 5는 **TDE를 구현하지 않습니다.**

목적은 LOT Lifecycle에 Knowledge와 Actual Work를 연결하고, **TDE가 사용할 Document JSON 구조를 완성**하는 것입니다.

| Phase 5에서 TITAN이 확정하는 항목 | 내용 |
|--------------------------------|------|
| **LOT Lifecycle 표시** | Technology Summary Block — 어떤 정보를 표시할 것인가 (§6.1.1) |
| **Document JSON 데이터** | Header · Body · Table · Graph · Photo · Approval · Footer에 포함될 데이터 |
| **TDE Interface** | TDE가 어떤 형태의 JSON을 수신하는가 (Schema · Version · Sources) |

**본 Phase:** Document JSON **구조·인터페이스 정의 + TITAN 생성** ✅ · TDE Rendering Engine **구현 ❌**

```text
Phase 4 Knowledge Record Store
        ↓
Phase 5 LOT Lifecycle ← Technology Summary (Knowledge + Actual Work)
        ↓
TITAN Document JSON 생성 (Structure · Interface)
        ↓
TDE (향후) — JSON 수신 → Preview · PDF · Print (Rendering Only)
```

#### 6.0.1 역할 분리 원칙 (PM V1.7 · 절대 위반 ❌)

| **TITAN** | **TDE** |
|-----------|---------|
| 업무 프로세스 | Document JSON **수신** |
| Recipe · Actual Work · Inspection · Knowledge | Header · Body · Table · Graph · Photo · Approval · Footer **Rendering** |
| LOT Traceability | Preview · PDF · Print |
| **Document JSON 생성** | **Rendering Only** |

```text
TDE는 계산 · 판정 · Workflow · 데이터 생성을 담당하지 않는다.
TDE는 TITAN이 생성한 Document JSON만 Rendering한다. (§2.7 · §6.2.1)
```

**Code SSoT (Phase 5):**
- `src/config/titanDocumentJsonModel.js` — Document JSON Schema · TDE Interface
- `src/utils/lotTechnologyLifecycle.js` — LOT Technology Summary
- `src/utils/titanDocumentJsonBuilder.js` — Document JSON 생성 (TITAN)

### 6.0.2 Phase 5 구현 범위

| 항목 | 구현 |
|------|------|
| **LOT Lifecycle Technology Summary** | ✅ Knowledge + Actual Work 연결 · 요약 표시 |
| **Document JSON Schema** | ✅ Header/Body/Table/Graph/Photo/Approval/Footer 구조 |
| **TITAN Document JSON Builder** | ✅ Knowledge Record → JSON 생성 · SessionStorage |
| **TDE Rendering Engine** | ❌ **본 Phase 구현 ❌** |
| **Knowledge Status (작성→검증→확정)** | ❌ 정책만 (§5.6.2) |
| **Knowledge Engine · AI** | ❌ Sprint 9 제외 |

### 6.1 LOT Lifecycle 연계

LOT Lifecycle (`docs/blueprints/V2.0/lot-lifecycle.md`) Timeline에 **Technology Block** 추가:

```text
LOT Lifecycle
├ 제품정보 (관리번호 · LOT · 고객 · 현재공정)
├ ★ Technology Summary (Sprint 9)
│    ├ 목표 Spec (요약)
│    ├ 표준 Recipe (참조)
│    ├ 실제 작업 조건 (요약)
│    └ 검사 결과 (요약 · PASS/FAIL)
├ Timeline (기존)
├ 생산일보 · 검사일지 · 성적서 · 출고
└ Document No.
```

**정책:** Traceability QR Scan → LOT Lifecycle → Technology Summary **조회** (작업 수행 ❌)

#### 6.1.1 LOT Lifecycle 표시 정책 (PM V1.1 · 요약만)

LOT Lifecycle에서는 **Recipe 전체 조건을 표시하지 않습니다.** 핵심 값 **요약 + 편차**만 제공합니다.

**표시 ❌:** 분위기 전체 · 압력 상세 · 구간별 전체 테이블 · Recipe Tab 전체 필드  
**표시 ✅:** 대표 온도 · 대표 시간 · Version · 편차 · 판정 요약  
**상세 조회:** Recipe Detail Workspace (`/settings/recipes`) — **전체 Recipe는 여기서만**

**표시 예 (Technology Summary Block):**

```text
LOT-20260708-001 · Recipe RCP-ION-SCM415 · V2

표준 Recipe          실제 작업           편차
─────────────────────────────────────────────
520℃                 518℃               -2℃
24h                  24.5h              +30min
─────────────────────────────────────────────
편차 판정: 정상
```

**편차 판정 (Blueprint · 규칙 기반 · AI ❌):**

| 편차 판정 | 의미 (예) | 표시 |
|-----------|-----------|------|
| **정상** | 허용 공차 이내 | 정상 |
| **확인 필요** | 공차 근접 · 메모 필요 | 확인 필요 |
| **관리 필요** | 공차 초과 · 품질 검토 | 관리 필요 |

> 편차 판정은 **Recipe vs Actual** 참고용 · **합격/불합격 ❌** (합격 = Spec vs Inspection)

**Knowledge Record 연계:** `recipeVsActualSummary`에 요약 저장 (Engine 구현 ❌ · 스키마만)

**Deep Link:** LOT Lifecycle Summary → "Recipe 상세 보기" → Recipe Detail Workspace (해당 Version)

### 6.2 TDE Interface — Document JSON (Phase 5 · Structure Only · Engine ❌)

> **TDE 구현 ❌** — 본 섹션은 **Document JSON 구조·인터페이스**만 정의합니다.

TITAN이 Knowledge Record + LOT Source를 조합하여 **Document JSON**을 생성합니다. TDE는 이 JSON을 **수신하여 Rendering**만 수행합니다 (향후).

#### 6.2.1 Document JSON Schema (PM V1.7)

```text
TitanDocumentJson {
  schemaVersion          // "1.0"
  documentId             // TITAN 생성 ID
  documentType           // technology-summary · coa · inspection-report (향후)
  generatedAt            // ISO timestamp

  // ── Knowledge Source (§5.6.3 필수) ──
  sources {
    lotNo
    mesManagementNo
    actualWorkRecordId
    knowledgeRecordId
    recipeVersionNo
    templateId
    templateVersionNo      // null until §5.3.0.1 active
  }

  // ── PM Phase 5 Payload (TDE 전달 데이터 · TITAN 생성) ──
  payload {
    customer               // { company }
    product                // { partNo, partName, quantity }
    material               // { materialId, materialName }
    productSpecificationSnapshot
    recipeSnapshot         // Recipe Version Snapshot + parameters
    actualWorkSnapshot     // Actual Work Snapshot + parameters
    inspectionResult       // values + result + inspector
    knowledgeSummary       // deviation · representative temp/time
    lotInfo                // lotNo · mesManagementNo
  }

  // ── TDE Rendering Slots (TDE가 수신·Rendering) ──
  header { title, documentNo, lotNo, company, partNo, partName, processName, recipeName, recipeVersionNo }
  body   { summary, workMemo, equipmentName, workerName, chargeStartAt, chargeEndAt }
  table  { title, columns[], rows[] }     // 표준 vs 실제 vs 편차
  graph  { enabled, series[] }            // Phase 5: placeholder · TDE Rendering
  photo  { enabled, items[] }             // Phase 5: placeholder · TDE Rendering
  approval { inspectorName, inspectedAt, result, inspectionRows[] }
  footer { generatedBy, platform, renderingOnly: true }

  meta { tdeEngine: false, renderingOnly: true }
}
```

**TDE Rendering Slots:**

| Slot | TDE 역할 | TITAN 역할 |
|------|----------|------------|
| **header** | Render | 데이터 생성 |
| **body** | Render | 데이터 생성 |
| **table** | Render | Snapshot 비교 데이터 생성 |
| **graph** | Render | 데이터 전달 (Phase 5 placeholder) |
| **photo** | Render | 데이터 전달 (Phase 5 placeholder) |
| **approval** | Render | Inspection Result Snapshot |
| **footer** | Render | Platform 메타 |

#### 6.2.2 TDE Rendering 원칙 (PM V1.2 · §2.7 · 유지)

```text
TDE는 TITAN이 생성한 Document JSON만 Rendering한다.
TDE는 계산하지 않는다.
TDE는 판정하지 않는다.
TDE는 데이터를 생성하지 않는다.
```

**TDE 출력 원칙 (기존 Freeze 유지):**

- 판정·출력 = **Product Specification** 기준
- Recipe = 성적서 본문 **기본 출력 ❌** (내부 이력·LOT Lifecycle)
- Actual = 생산일보/DPR 출력 · LOT Lifecycle

### 6.3 Document Management 연계 (향후)

| 문서 | Sprint 9 Blueprint 연결 |
|------|-------------------------|
| 도면 | Product Spec Revision |
| 검사기준서 | Spec hardness/depth 항목 |
| 작업표준서 | Recipe Master **Version** (Approved) |
| 성적서 | TDE ← Inspection + Spec |

---

## 7. Blueprint V2.0 Final 11항목 (Sprint 9 신규 Workspace)

### 7.1 Product Specification (제품관리 확장)

| # | 항목 | 내용 |
|---|------|------|
| 1 | Purpose | 업체+품번 **목표 품질 SSOT** |
| 2 | Role | Spec CRUD · Recipe/검사 **참조源** · Workflow 실행 ❌ |
| 3 | Task Scope | 경도·깊이·층·외관·고객요구·계산설정 |
| 4 | Exit Condition | 저장 → Product Store · 검사/성적서 자동 연결 |
| 5 | Layout | Product Popup Tab "품질 Specification" |
| 6 | Data | `productStore.specification` · Revision(향후) |
| 7 | Workflow | Master 등록 → 입고/생산/검사 Read Only 참조 |
| 8 | Automation | 검사등록 시 Spec Snapshot · Engine auto calc |
| 9 | Connected | Recipe · Production · Quality · TDE · LOT |
| 10 | Output | Spec 변경 이력(향후) · TDE 필드 필터 |
| 11 | Freeze Criteria | Spec CRUD · Snapshot · Engine 연동 · PM 승인 |

### 7.2 Heat Treatment Recipe Master

| # | 항목 | 내용 |
|---|------|------|
| 1 | Purpose | 회사 **표준 열처리 조건 SSOT** |
| 2 | Role | Recipe CRUD · Production **참조 제안** · Actual 입력 ❌ |
| 3 | Task Scope | 온도·시간·분위기·압력·냉각·메모 · **Status · Version · Approval Metadata** |
| 4 | Exit Condition | Approved Version → recipeStore · Production 선택 가능 |
| 5 | Layout | Domain Master 2-Panel · Version Tab · Approval 이력 |
| 6 | Data | `recipeStore` · Version · Status · **approval** · Soft Delete |
| 7 | Workflow | Master 등록 → 생산 시 참조 → Knowledge 이력 |
| 8 | Automation | 재질+공정 매칭 시 Recipe 제안(규칙 기반 · AI ❌) |
| 9 | Connected | Product · Production · Knowledge · LOT |
| 10 | Output | Recipe Card(향후) · 작업지시 참고(향후) |
| 11 | Freeze Criteria | CRUD · Health · Production 참조 · PM 승인 |

---

## 8. Health Badge (Recipe Master · Blueprint)

Sprint 8 Health 패턴 재사용:

| 상태 | 조건 (예) | 표시 |
|------|-----------|------|
| 🟢 정상 | Status=Approved · Master 연결 완료 · Version 유효 · 필수 조건 입력 | 정상 |
| 🟡 확인 필요 | Status=Review/Draft · 설비 미연결 · 적용 제품 0 | 확인 필요 |
| 🔴 관리 필요 | 필수 온도/시간 누락 · Status=Obsolete(신규 선택) · 연결 Master 삭제 | 관리 필요 |

**Sprint 9:** Health Engine **공통화 ❌** — Sprint 8 Footer/Badge **패턴만** Recipe에 적용 (공통 Engine = 향후 Sprint).

---

## 9. 이번 Sprint에서 제외 (Explicit Out of Scope)

| 항목 | 사유 | 향후 Sprint |
|------|------|-------------|
| AI 추천 | 데이터 축적 전 | Sprint 10+ |
| Recommendation Engine | Blueprint 별도 | Sprint 10+ |
| 머신러닝 · 신뢰도 계산 | | Sprint 10+ |
| 자동 최적화 | | Sprint 10+ |
| Knowledge Engine **구현** | Sprint 9 = 스키마만 | Sprint 9b 또는 10 |
| Health Engine 공통화 | Sprint 8 패턴 유지 | Sprint 10 |
| QR Registry 확장 | V1.7 QR Architecture | 별도 Sprint |
| Repository Oracle/API | Version 1 Roadmap | V1.1 Gate |

---

## 10. 향후 확장 계획 (Roadmap)

### 10.1 Sprint 9 구현 Phase (PM 승인 후 · 예정)

```text
Phase 1 — Product Specification Workspace
  · Spec Tab · Snapshot · Engine 연동 검증

Phase 2 — Recipe Master Workspace
  · Domain Master UI · recipeStore · Status · Version · Health

Phase 3 — Production Actual Work Record
  · Approved Recipe Version 참조 · Actual 입력 · 생산일보 연동

Phase 4 — Knowledge Record Store
  · 스키마 구현 · recipeVersionSnapshot

Phase 5 — LOT Lifecycle / TDE 연계
  · Technology Summary (요약) · 편차 표시 · Knowledge ↔ COA 이력
```

### 10.2 Sprint 10+ (Blueprint 예비 · 구현 ❌)

```text
Heat Treatment Recipe Master (완성)
        ↓
Knowledge Engine (집계 · diff · 이력 API)
        ↓
Recommendation Engine (규칙 → AI 순)
        ↓
Health Engine 공통화
        ↓
QR Registry · LOT Lifecycle deep link
        ↓
TDE Revision · Knowledge audit on COA
```

### 10.3 데이터 축적 후 가치

충분한 Knowledge Record가 쌓이면:

- 동일 재질+공정의 **Actual 분포** 분석
- Spec 대비 **양산 수율** 통계
- Recipe **Version** 효과 검증
- (향후) AI 추천 **입력 데이터**

**Sprint 9 Blueprint는 이 미래를 위한 "기술 DB 골격"만 정의합니다.**

---

## 11. 설계 원칙 Checklist

| # | 원칙 | Sprint 9 준수 |
|---|------|---------------|
| 1 | Master First — Sprint 8 Freeze Baseline | ✅ |
| 2 | 업체+품번 = Product Spec Key | ✅ |
| 3 | Recipe = 표준 · Actual = 작업자 · Spec = 목표 | ✅ |
| 4 | 판정 = Spec vs Inspection | ✅ |
| 5 | Workflow 9-stage / Type·Status·Result 분리 | ✅ |
| 6 | mesManagementNo · lotNo Traceability | ✅ |
| 7 | Workspace 역할 혼합 ❌ | ✅ |
| 8 | Blueprint 승인 전 구현 ❌ | ✅ |
| 9 | AI/ML/Recommendation 제외 | ✅ |
| 10 | Recipe Status (Draft/Review/Approved/Obsolete) | ✅ V1.1 |
| 11 | Recipe Version 관리 (in-place 수정 ❌) | ✅ V1.1 |
| 12 | LOT Lifecycle 요약 표시 (상세=Recipe Workspace) | ✅ V1.1 |
| 13 | Recipe Approval Metadata (ISO 추적성) | ✅ V1.2 |
| 14 | Soft Delete · 물리 Delete ❌ | ✅ V1.2 |
| 15 | TDE = Rendering only (계산/판정/생성 ❌) | ✅ V1.2 |
| 16 | Knowledge Record 저장 항목 (§2.6) | ✅ V1.2 |
| 17 | 최종 업무 프로세스 우선 | ✅ |

---

## 12. V1.2 보완 이력 · Official Blueprint 확정 대기

### 12.1 V1.0 PM 승인 (2026-07-08)

Sprint 9 Blueprint V1.0 **전체 Architecture · Workspace · Phase 순서** PM 승인.

### 12.2 V1.1 PM 보완 (2026-07-08)

| # | 보완 항목 | 반영 섹션 |
|---|-----------|-----------|
| ① | Recipe Status — Draft · Review · Approved · Obsolete | §5.3.1 |
| ② | Recipe Version — in-place 수정 ❌ · Production Version 참조 | §5.3.2 |
| ③ | LOT Lifecycle — 요약 표시 · 편차 · 상세=Recipe Workspace | §6.1.1 |

### 12.3 V1.2 PM Official Review (2026-07-08)

| # | 보완 항목 | 반영 섹션 |
|---|-----------|-----------|
| ① | **Recipe Approval Metadata** — Approved By · Approved Date · Review Comment | §5.3.3 |
| ② | **Approval Workflow** — Production 선택 정책 · Soft Delete · Delete ❌ | §5.3.1 |
| ③ | **Recipe Version** — LOT 당시 Version 유지 · Snapshot 불변 | §5.3.2 |
| ④ | **Knowledge Record 연계** — 저장 항목 7종 | §2.6 · §5.6 |
| ⑤ | **TDE 연계 원칙** — Rendering only | §2.7 · §6.2.1 |

### 12.4 유지 확인 (변경 없음)

| 항목 | 상태 |
|------|------|
| Architecture 흐름 (Material→…→Knowledge→TDE) | ✅ 유지 |
| Product Spec = Product Popup Tab | ✅ 유지 |
| Recipe Master = Launcher 8번째 · Domain Master | ✅ 유지 |
| Knowledge = 스키마만 · Engine ❌ | ✅ 유지 |
| Phase 1→5 순서 | ✅ 유지 |
| AI / Recommendation / ML | ❌ 제외 유지 |

### 12.5 Official Blueprint 확정 요청

- [ ] Sprint 9 Blueprint **V1.2 Official** 최종 승인
- [ ] 승인 후 **Phase 1 (Product Specification Workspace)** 구현 착수

---

## 13. Document Control

| 항목 | 값 |
|------|-----|
| Version | Blueprint **V1.2** (V1.0 + V1.1 + V1.2 PM Official Review) |
| Date | 2026-07-08 |
| Author | Project TITAN · Cursor Blueprint Sprint |
| Status | 🔒 **OFFICIAL BLUEPRINT** · PM Final Approved · Phase 1 구현 진행 |
| Implementation | ❌ Phase 1 시작 전 |
| Commit | ❌ (PM 지시 — Blueprint 문서만) |

**Companion:** [INDEX.md](./INDEX.md) · Sprint 8 `07050c1` · V2.0 Production/Quality/LOT Blueprints
