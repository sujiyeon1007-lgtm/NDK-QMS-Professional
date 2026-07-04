# White Screen — Git 기반 복구 분석 보고 (2026-07-04)

## 요약

White Screen은 **빌드 실패가 아니라 런타임 모듈 로드 오류**였습니다.  
`AppRouter.jsx`가 모든 페이지를 **eager import** 하므로, **하나의 파일이라도 import/구문 오류가 있으면 `/login` 포함 전체 앱이 하얀 화면**이 됩니다.

임시 패치(추측 수정)가 아니라 **Git diff로 원인 파일을 특정**한 뒤, **해당 파일만 되돌리거나 수정**하고, **기능별로 순차 재적용**하는 방식이 정식 복구 절차입니다.

---

## 1. 기준 Commit

| 구분 | Commit | 설명 |
|------|--------|------|
| **마지막 정상 (Baseline)** | `01d8747` | Presentation Build V0.9.0 RC — White Screen 없음 |
| **대량 변경 (위험)** | `4902820` | feat: Presentation Build V1.3 UI refinement — **292 files** |
| **복구·통합 (현재 안정)** | `5726094` | fix: stabilize Project TITAN V1.3 before UI standardization |
| **정책만 추가** | `eedc09f` | Beta site release workflow policy |

**교훈:** `4902820` + `5726094`에 **5~6개 화면 + QR + 공통 컴포넌트**가 한 Commit에 묶여 원인 추적·롤백이 어려웠습니다.

---

## 2. Git Diff — 변경 규모

```bash
git diff --stat 01d8747..4902820   # 292 files
git diff --stat 4902820..5726094    # 257 files
```

White Screen 직접 원인은 **`5726094`에 추가된 QR Route + 깨진 페이지 모듈**이 `AppRouter` eager import 체인을 끊은 것입니다.

---

## 3. White Screen 원인 파일 (특정 완료)

`AppRouter` import 체인에서 **런타임 ReferenceError / duplicate import**를 일으킨 파일:

| # | 파일 | 오류 유형 | 증상 |
|---|------|-----------|------|
| 1 | `src/pages/QrManagement/QrInoutScreen.jsx` | duplicate import · `useTitanListSearch` API 오용 | QR Route 로드 시 전체 crash |
| 2 | `src/pages/QrManagement/QrEquipmentScreen.jsx` | `useTitanListSearch` API 오용 | 동일 |
| 3 | `src/pages/Statistics/StatisticsScreen.jsx` | `PurchaseOrderNoField` 미 import 참조 | 통계 Route 로드 시 crash |
| 4 | `src/pages/InOut/InboundManagement.jsx` | `SectionPageActions` 미 import | 입고 Route crash |
| 5 | `src/pages/Production/DailyProductionReport.jsx` | `buildStandardProductListColumns` / `SectionPageActions` 미 import | 생산 Route crash |
| 6 | `src/pages/InOut/OutboundManagement.jsx` | `OutboundStatementPromptDialog` 미 import | 출고 Route crash |
| 7 | `src/router/AppRouter.jsx` | QR·Guard eager import 추가 | 위 파일 중 하나만 깨져도 **로그인 포함 전체 White Screen** |

**패턴:** Vite dev(oxc)는 duplicate import를 잡지만, production build(rolldown)는 통과할 수 있음 → **Build 성공 ≠ White Screen 없음**.

---

## 4. Git 기반 복구 절차 (정식)

White Screen 발생 시 **아래 순서만** 사용합니다. 전체 재작성·무작위 수정 금지.

### Step 1 — 마지막 정상 Commit 확인

```bash
git log --oneline -20
# Baseline: 01d8747 (또는 PM이 지정한 마지막 정상 tag/commit)
git checkout 01d8747
npm run build && npm run preview
# 브라우저: /login · HOME 정상 확인
git checkout presentation   # 작업 브랜치로 복귀
```

### Step 2 — Diff로 변경 파일 목록

```bash
git diff --name-only 01d8747 HEAD
git diff 01d8747 HEAD -- src/router/AppRouter.jsx
```

Console에 나온 **첫 번째 ReferenceError 파일**과 `AppRouter` import 목록을 대조합니다.

### Step 3 — 문제 파일만 되돌리기 (선택적 rollback)

```bash
# 예: Statistics만 baseline으로 복원
git checkout 01d8747 -- src/pages/Statistics/StatisticsScreen.jsx
npm run build && npm run preview
# Regression Test
```

여러 파일이면 **한 파일(또는 한 기능)씩** 되돌리고 매번 Build · 실행 테스트.

### Step 4 — 정상 확인 후 순차 재적용

```text
① 검사관리 개선 → Build → 실행 테스트 → Commit
② 문서관리 개선 → Build → 실행 테스트 → Commit
③ QR관리 추가     → Build → 실행 테스트 → Commit
```

**기능 하나 = Commit 하나.** 한 Commit에 5~6 화면 수정 금지.

### Step 5 — Push / Beta 배포

White Screen · Console Error = 0 · Build 성공 **이후에만** Push · `beta-demo` · Vercel.

---

## 5. 현재 HEAD 상태 (2026-07-04)

- `npm run build` — **성공** (bundle: `index-CeMoLfd1.js`)
- 위 7개 파일 — **import/API 오류 수정 반영됨** (`5726094`)
- 앞으로 V1.3 리스트 표준화 등은 **화면 단위 Commit**으로만 진행

---

## 6. 재발 방지 — 절대 금지

- 5~6개 화면을 한 번에 수정
- 공통 컴포넌트 수정 후 테스트 없이 다음 작업
- Build 실패 상태에서 계속 개발
- **White Screen 상태에서 Push / Beta 배포**

---

## 7. 참조

- `src/config/developmentStandard.js` — `GIT_BASED_INCIDENT_RECOVERY` · `DAILY_WORK_COMMIT_POLICY` · `DEVELOPMENT_ABSOLUTE_PROHIBITIONS`
- `.cursor/rules/project-titan-development-standard.mdc`
