# 📌 Project TITAN (NDK PQMS)

# Presentation Build V1.3 (최종 인수인계)

> **용도:** 새 채팅방 · Cursor 세션 시작 시 이 문서를 붙여넣으면 Presentation Build V1.3부터 이어서 개발할 수 있습니다.  
> **코드 기준:** `src/config/menuFreezeV1.js` · `docs/MENU_FREEZE_V1.3.md` · `docs/PRESENTATION_BUILD.md`

---

## 프로젝트 방향 (최종 확정)

Project TITAN은 **QMS가 아닌 PQMS (Production & Quality Management System)** 이다.

MES를 대체하는 시스템이 아니라,

**생산 + 품질 + 현장 실무를 지원하는 통합 관리 시스템**을 목표로 한다.

현재 개발 목표는 **Presentation Build V1.0**으로, 사장님 시연 및 실사용 검토를 위한 안정적인 버전을 구축하는 것이다.

---

# Version 정책

### Version 1

MES 완전 연동 (장기)

### Version 2

MES + PQMS 협업

### ⭐ Version 3 (현재)

Presentation Build

사장님 시연용 버전

---

# ✅ Menu Freeze V1.3 (최종 확정)

```
🏠 HOME

⚙ 기준정보관리

📥 입고현황

📦 재고현황

📝 작업일보

📒 업무일지

✔ 품질관리

📄 문서관리

🚚 출고현황

🕒 이력조회

📊 통계조회

🔧 환경설정
```

앞으로 메뉴 구조는 변경하지 않는다.

사장님 요청이 있을 경우에만 변경한다.

---

# Sidebar 구성

```
🏠 HOME

────────────────────

⚙ 기준정보관리

────────────────────

📥 입고현황

📦 재고현황

📝 작업일보

📒 업무일지

✔ 품질관리

📄 문서관리

🚚 출고현황

────────────────────

🕒 이력조회

📊 통계조회

────────────────────

🔧 환경설정
```

---

# 메뉴 역할

## HOME

* Dashboard
* 진행현황
* 공지사항
* 업무일정
* 통합검색

---

## 기준정보관리

프로그램의 Master Data 관리

* 업체관리
* 제품 Master
* 재질관리
* 공정관리
* 설비관리
* 작업자 Master

---

## 입고현황

* 입고 등록
* 관리번호 생성
* 입고 리스트
* 입고 출력

---

## 재고현황

자동 계산

```
입고

+

생산

-

출고

=

현재 재고
```

---

## 작업일보

제품 중심 관리

* LOT
* 작업자
* 설비
* 공정
* 작업 시작
* 작업 완료

---

## 업무일지

사람 중심 관리

* 업무 기록
* 고객 대응
* NCR
* 회의
* 특이사항
* 개선사항

향후

* PDF 출력
* 사진 첨부
* 업무 통계

---

## 품질관리

* 검사 등록
* 합격 / 불합격
* 성적서 발행

---

## 문서관리

제품 중심 관리

Popup에서

* 도면
* 검사기준서
* 작업표준서
* 관리계획서
* FMEA
* 고객 요구사항
* NCR
* 기타 문서

관리

---

## 출고현황

* 출고 등록
* 거래명세서
* 출고 리스트

---

## 이력조회

관리번호 기준

```
입고

↓

재고

↓

작업

↓

검사

↓

문서

↓

출고
```

전체 이력 조회

---

## 통계조회

* 생산 통계
* 품질 통계
* 월별 현황
* 업체별 통계

---

## 환경설정

* 프로그램 설정
* 사용자 설정
* 시스템 관리

---

# 제품 Workflow

```
입고현황

↓

재고현황

↓

작업일보

↓

품질관리

↓

문서관리

↓

출고현황

↓

이력조회
```

※ 업무일지는 Workflow에 포함하지 않는다.

---

# 문서관리 정책

Workflow

```
검색

↓

제품 선택

↓

Popup

↓

문서 관리
```

문서 Status

```
🟢 최신

🟡 개정 필요

🔵 승인 대기

⚫ 미등록

🔴 폐기
```

관리 항목

* Revision
* 승인자
* 등록일
* 수정일
* 보기
* 등록
* 수정
* 다운로드

---

# UI 정책

* ERP/MES 방식
* 반응형 축소 사용 안 함
* 부족한 공간은 스크롤 처리
* 모든 페이지 동일한 디자인
* 파스텔톤 사용
* Header / Toolbar / Search / Table 규격 통일

---

# Popup 정책

공통 구조

```
Header

Toolbar

검색

Table

Footer
```

공통 Component

```
CommonModal

CommonToolbar

CommonSearchBar

CommonTable

CommonStatusBadge

CommonButtonGroup

CommonPagination
```

---

# 출력 정책

기본

* PDF

예외

* 입고리스트
* 출고리스트
* 작업일보

Excel + PDF 지원

---

# 상태(Status) 정책

```
입고완료

↓

생산중

↓

검사대기

↓

검사완료

↓

성적서대기

↓

성적서완료

↓

출고예정

↓

출고완료
```

모든 메뉴 동일 적용

---

# 개발 순서

```
Workflow

↓

UI

↓

기능

↓

구현

↓

테스트

↓

검토

↓

승인
```

**한 메뉴를 완성한 후 다음 메뉴를 진행한다.**

---

# Git 운영

```
main

presentation

develop

feature/*
```

사장님께는

**presentation 브랜치만 배포**

---

# 현재 완료 상태

✅ PQMS 방향 확정

✅ Menu Freeze V1.3 완료

✅ Sidebar 그룹 구성 완료

✅ Router 동기화 완료

✅ Workflow 확정

✅ 작업일보 / 업무일지 역할 분리

✅ 기준정보관리 상단 배치

✅ Popup 정책 확정

✅ UI Standard 확정

✅ Cursor Rule 반영

✅ 문서 동기화 완료

✅ `npm run build` 통과

---

# 다음 개발 순서 (고정)

1. HOME
2. 기준정보관리
3. 입고현황
4. 재고현황
5. 작업일보
6. 업무일지
7. 품질관리
8. 문서관리
9. 출고현황
10. 이력조회
11. 통계조회
12. 환경설정

각 메뉴는 다음 순서를 따른다.

```
UI

↓

Workflow

↓

기능 구현

↓

테스트

↓

검토

↓

승인

↓

Commit
```

---

# 개발 원칙 (최우선)

* Menu Freeze V1.3 유지
* 사장님 승인 없는 메뉴 변경 금지
* 기능 추가보다 기존 기능 안정화 우선
* 공통 Component 적극 활용
* 모든 Popup 동일 UI 적용
* 모든 페이지 동일 디자인 적용
* **한 번에 한 메뉴씩 완성**
* **완료 → 테스트 → 검토 → 승인 → Commit → 다음 메뉴**
* Presentation Build에서는 **기능보다 Workflow와 UI 완성도를 우선**한다.

---

## 🎯 현재 프로젝트 상태

**Presentation Build V1.3의 설계 및 메뉴 구조는 완료되었으며, 이제부터는 메뉴 구조를 변경하지 않고 각 메뉴를 실사용 가능한 수준으로 완성하는 기능 개발 단계에 집중한다.**

---

## 코드 · 문서 참조

| 항목 | 경로 |
|------|------|
| Menu Freeze | `src/config/menuFreezeV1.js` |
| Menu catalog | `src/config/menuConfig.js` |
| Sidebar UI | `src/foundation/layout/Sidebar.jsx` |
| Integrity check | `src/utils/menuIntegrity.js` |
| Menu spec | `docs/MENU_FREEZE_V1.3.md` |
| HOME spec | `docs/HOME_V1.3.md` |
| Build policy | `docs/PRESENTATION_BUILD.md` |
| Cursor rule | `.cursor/rules/project-titan-menu-freeze-v1.mdc` |
