# Blueprint — HOME (V2.0 · Workspace First)

**Status:** 🔒 **Official Freeze** (2026-07-07) · **Route:** `/home`  
**Policy:** 구조 변경 ❌ · 개선 필요 시 **Review 문서(Update)** 방식만

> **Workspace First:** HOME = 회사 전체 Dashboard. 작업 화면 ❌ · 요약 + Launcher만.  
> Code SSoT: `src/config/blueprints/titanBlueprintsV17.js` → `HOME_BLUEPRINT`

---

## 1. Purpose ✅

회사 전체를 한눈에 파악하는 통합 Dashboard. 작업 화면 ❌.

## 2. Role ✅

회사 전체 현황 · KPI · 공지 · 일정 · 최근 알림 · 실시간 진행현황 · **Launcher**만 수행.

## 3. Task Scope ✅

**요약 정보만:** 오늘 입고/출고 · 생산 진행 · 검사 대기 · 성적서 미발행 · 설비 가동률 · 일정 · 공지 · 최근 알림 · 진행현황  
**표시 안 함:** 전체 LOT/입고/출고/검사 리스트

## 4. Exit Condition ✅

모든 KPI·Widget = **Launcher 정책** (HOME → Launcher → 업무 Workspace). Legacy Route 향후 제거.

## 5. Layout ✅

V1.5 HOME Hub Layout 유지.

## 6. Data ✅

Session = Legacy · 최종 구현 = TitanDataEngine/TitanWorkflowEngine (UI 불변).

## 7. Workflow ✅

상태 변경 ❌ · Launcher 이동만.

## 8. Automation ✅

KPI · 공지 · 일정 · 최근 알림 · 진행현황 자동 갱신.

## 9. Connected Screens ✅

운영 · 생산 · 품질 · **설비현황** · 통계 · 이력 (제품현황 = ② 설비현황에서 확정)

## 10. Output ✅

없음.

## 11. Freeze Criteria ✅

Workspace · Launcher · Task Scope · Exit Condition · Data Migration Plan · PM Approval — **Freeze 완료**

---

# PM Final Review — Official Freeze (2026-07-07)

| 섹션 | 결과 |
|------|------|
| 전체 | ✅ Approved → 🔒 **Freeze** |

**다음:** ② 설비현황 Blueprint Review
