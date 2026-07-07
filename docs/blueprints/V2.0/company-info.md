# Blueprint — 회사정보 (V2.0 · Company Master Workspace)

**Status:** 🔒 **Freeze (Official)** · PM Final Review 2026-07-07 (⑨/10) · **Route:** `/company` · **구현 ❌**

> **공식 역할:** 출력물·시스템 공통 회사 정보 단일 Master — **Company Master Workspace**  
> **공식 원칙:** Company Store SSoT · 모든 출력물은 참조만 (Read Only)  
> Code SSoT: `COMPANY_INFO_BLUEPRINT` · `TITAN_V20_COMPANY_MASTER_STRUCTURE` · `TITAN_V20_COMPANY_INFO_BLUEPRINT_REVIEW`

---

## 공식 역할

회사정보는 **Company Master Workspace**입니다.

출력물과 시스템 전체에서 공통으로 사용하는 회사 정보를 관리하는 **단일 Master**입니다.

```text
회사정보 (Company Store · SSoT)
        ↓ 참조 (Read Only)
성적서 · 검사리포트 · 거래명세서 · 작업지시서 · 생산일보 · 입출고리스트
```

---

## Workspace 구조 (공식)

```text
회사정보
├ 회사 기본정보
├ CI / Logo 관리
├ 사업장 정보
└ 인증 정보
```

Launcher **4 Cards** 구조.

---

## Company Master (PM 추가 지시)

### ① Company Master — 회사 기본 정보

| 항목 |
|------|
| 회사명 |
| 대표자 |
| 사업자등록번호 |
| 주소 |
| 연락처 |
| 이메일 |
| 홈페이지 |

### ② Branding

| 항목 | 용도 |
|------|------|
| CI | 기업 아이덴티티 |
| Logo | 출력물 Header |
| 직인 | 성적서·거래명세서 |
| 서명 이미지 | 승인/발행 |

### ③ Certification

| 항목 |
|------|
| ISO 인증 |
| 고객 인증 |
| 기타 인증 |

> 회사정보는 **Company Store의 단일 관리 영역**이며, 모든 출력물은 이 정보를 **참조만** 합니다.

---

## PM Screen Review 보완 (2026-07-07)

### ① Brand Theme

출력물 품질을 위한 테마 (Form Engine 연동).

| 항목 |
|------|
| Primary Color |
| Secondary Color |
| Font |
| Report Theme |

**Blueprint 정의만 · 구현 나중.**

### ② Certification 확장

인증에 **유효기간·상태**를 추가합니다.

| 항목 |
|------|
| 인증명 |
| 인증번호 |
| 발급기관 |
| 유효기간 |
| 상태 |

> 향후 **인증 만료 알림**과 연계.

### ③ Business Location (다중 사업장)

| 유형 | 필드 |
|------|------|
| 본사 | 사업장명 · 주소 · 연락처 |
| 공장 | 사업장명 · 주소 · 연락처 |
| 창고 | 사업장명 · 주소 · 연락처 |

> 향후 여러 사업장 지원 설계.

### Company Store 정책 (출력물 연동)

```text
Company Store (R/W · SSoT)
        ↓ 참조 (Read Only)
성적서 · 검사리포트 · 거래명세서 · 생산일보 · 작업지시서 · 입출고리스트
```

Company 정보를 **개별 문서에서 관리하지 않습니다.**

---

## 1. Purpose

Company Master Workspace. Company Store SSoT — 회사 기본정보·Branding·Certification. 모든 출력물 Header/인증 공통 참조. 작업자관리 ❌ (기준정보관리).

## 2. Role

**가능:** 회사 기본정보 · Branding(CI·Logo·직인·서명) · Certification(ISO·고객·기타)  
**불가:** 작업자관리(→기준정보) · LOT/Workflow · Config/SessionStorage 저장

## 3. Task Scope

| 항목 | 내용 |
|------|------|
| **Workspace** | 관리 담당자 — 회사 Master (출력물 공통) |
| **표시만** | 회사 기본정보 · CI/Logo/직인/서명 · 사업장 · 인증 |
| **표시 안 함** | 업무 LOT · 작업자 명단 |

## 4. Exit Condition

| 항목 | 내용 |
|------|------|
| **종료 조건** | 해당 없음 (회사정보 상시) |
| **다음 화면** | 모든 출력물 Header/인증 자동 참조 (Read Only) |
| **Engine** | 해당 없음 |

## 5. Layout

```text
Breadcrumb → Launcher Hub (4카드)
회사정보 Form/Panel per block
```

## 6. Data

- **Store:** `companyStore` (신규 · Blueprint-only · SSoT · 구현 승인 후)
- **금지:** config · sessionStorage
- **Company Master:** 회사명 · 대표자 · 사업자등록번호 · 주소 · 연락처 · 이메일 · 홈페이지
- **Branding:** CI · Logo · 직인 · 서명 이미지
- **Certification:** ISO · 고객 · 기타 인증
- **정책:** Company Store = 유일한 R/W · 출력물은 참조만 (Read Only)

## 7. Workflow

```text
회사정보 등록/수정 → Company Store(SSoT) → 모든 출력물 Header/인증 반영
Branding(직인·서명) → 성적서·거래명세서 자동 삽입
```

## 8. Automation

| 사용자 | 시스템 |
|--------|--------|
| 회사 Master 입력 · CI/Logo/직인/서명 업로드 · 인증 등록 | 출력물 Header 자동 반영 |

## 9. Connected Screens

**출력물 공통 참조 (Read Only):** 성적서 · 검사리포트 · 거래명세서 · 작업지시서 · 생산일보 · 입출고리스트  
**연결:** 환경설정(System Profile)

## 10. Output

회사정보 = 모든 출력물 공통 Header/인증

## 11. Freeze Criteria

- [ ] Company Master (기본정보)
- [ ] Branding (CI·Logo·직인·서명)
- [ ] Brand Theme (Color·Font·Report Theme)
- [ ] Business Location (본사·공장·창고)
- [ ] Certification (유효기간·상태 확장)
- [ ] Company Store SSoT (Config/Session ❌)
- [ ] 출력물 Header 자동 참조 (Read Only)
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
| Data | ⚠️ → Brand Theme / Certification 확장 / Business Location 추가 (반영) |
| Workflow | ✅ Approved |
| Automation | ✅ Approved |
| Connected Screens | ✅ Approved |
| Output | ✅ Approved |
| Freeze Criteria | ✅ Approved (Final Review) |

**보완 반영:** Brand Theme · Certification 확장(유효기간·상태) · Business Location(본사·공장·창고) → **🔒 Official Freeze**
