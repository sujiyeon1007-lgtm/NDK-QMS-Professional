# Blueprint — 운영관리 (V2.0 · Operations Workspace)

**Status:** 🔒 **Official Freeze** (2026-07-07) · **Route:** `/inout`  
**Policy:** 구조 변경 ❌ · 개선 = Review 문서(Update)만 · **구현 ❌**

> **첫 Task Workspace** — 회사 운영 업무 수행 · CRUD ❌ · 업무 흐름 ✅  
> Code SSoT: `OPERATIONS_MANAGEMENT_BLUEPRINT`

---

## 공식 구조 (Freeze)

```text
운영관리 (Operations Workspace)
├ 입고등록 · 출고등록 · 재고관리     Task Workspace
├ 입출고이력                        History Workspace
├ 출력관리                          Print Workspace
└ 영업업무일지                      Journal Workspace
```

## Stage Filter (공식)

입고=미투입 · 출고=대기 · 재고=현재 · 이력=전체(예외)

## Exit Condition (Engine)

입고→생산계획 · 출고→입출고이력 · 재고→자동 갱신

## Legacy

`inoutManagement` → **Operations Workspace** (구현 시 제거)

## 출력

`operationsProductionPrint` — 생산관리와 **동일 Component**

---

# PM Final Review — Official Freeze (2026-07-07)

| 전체 | ✅ Approved → 🔒 **Freeze** |

**다음:** ④ 생산관리 Blueprint Review
