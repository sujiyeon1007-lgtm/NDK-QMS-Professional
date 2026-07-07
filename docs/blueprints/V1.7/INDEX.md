# Project TITAN V1.7 — Blueprint Pack ⚠️ SUPERSEDED (List 중심 초안)

> 🚫 **본 V1.7 Pack은 List 중심 초안으로, V2.0 (Task 중심)으로 대체되었습니다.**
> **최신 SSoT:** [docs/blueprints/V2.0/INDEX.md](../V2.0/INDEX.md) — 10항목(Task Scope) · 9화면
> 아래 내용은 이력 참고용으로만 유지합니다.

**Lock:** 2026-07-07 · **Methodology:** Architecture → Blueprint → PM 승인 → 구현 → QA → Freeze

**Code SSoT:** `src/config/blueprints/titanBlueprintsV17.js` (V2.0 내용으로 갱신됨)  
**Methodology SSoT:** `src/config/titanBlueprintV17.js`

---

## PM 승인 체크리스트

| # | Blueprint | Doc | As-Built Review | PM 승인 | 구현 범위 확정 |
|---|-----------|-----|-----------------|---------|----------------|
| 1 | HOME | [home.md](./home.md) | ✅ 완료 (2026-07-07) | ☐ | ☐ |
| 2 | 입출고관리 | [inout-management.md](./inout-management.md) | ☐ | ☐ | ☐ |
| 3 | 생산관리 | [production-management.md](./production-management.md) | ☐ | ☐ | ☐ |
| 4 | 품질관리 | [quality-management.md](./quality-management.md) | ☐ | ☐ | ☐ |
| 5 | MES | [mes.md](./mes.md) | ☐ | ☐ | ☐ |
| 6 | 통계관리 | [statistics.md](./statistics.md) | ☐ | ☐ | ☐ |
| 7 | 기준정보관리 | [master-data.md](./master-data.md) | ☐ | ☐ | ☐ |
| 8 | 환경설정 | [environment.md](./environment.md) | ☐ | ☐ | ☐ |
| 9 | LOT Lifecycle | [lot-lifecycle.md](./lot-lifecycle.md) | ☐ | ☐ | ☐ |

**이번 Sprint:** Blueprint 작성 완료 → **PM 승인 후** 다음 Sprint부터 Blueprint 기준 구현

---

## Blueprint 표준 양식

모든 화면은 아래 9항목을 사용합니다.

1. 목적 (Purpose)  
2. 역할 (Role)  
3. 화면 구성 (Layout)  
4. 데이터 (Data)  
5. Workflow  
6. 자동화 (Automation)  
7. 연결 화면  
8. 출력물  
9. 완료 조건 (Freeze)

---

## Freeze 정책 (V1.7)

- 기능 정상 · Workflow 검증 · Store 연동 · Browser QA · PM 승인 → **Freeze**
- Freeze 후 구조 변경 ❌ · Review 개선만

---

## QR 설계 (Blueprint · 구현 ❌)

| 항목 | 정책 |
|------|------|
| Traceability QR | **1 LOT = 1 QR** · 동일 LOT 모든 출력물 동일 QR |
| Scan 대상 | **LOT Lifecycle** (문서 열기 ❌) |
| Document No. | QR payload ❌ · Lifecycle 화면 표시 |
| QR ID | `QR-2026-000001` (design-only) |
| QR Version | V1 → 재발행 V2 · 재출력 = 기존 Version |

See: `src/config/titanQrArchitectureV17.js` · `.cursor/rules/project-titan-qr-architecture-v1.7.mdc`
