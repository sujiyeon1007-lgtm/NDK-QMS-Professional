# Blueprint — LOT Lifecycle (V1.7 · 신규)

**Status:** ⏳ PM 승인 대기 · **Entry:** Traceability QR Scan · **Route (planned):** `/traceability/lot/{lotNo}`

---

## 1. 목적 (Purpose)

**Traceability QR Scan 시 진입하는 공식 화면.**  
제품(LOT) **전체 Lifecycle** 조회 — **문서를 여는 QR ❌**.

> PM 원칙: **1 LOT = 1 Traceability QR** · 동일 LOT 모든 출력물 동일 QR

---

## 2. 역할 (Role)

**가능**

- LOT Lifecycle 조회 (역할별 필드)
- Timeline · Document No. **목록** 표시
- 연결 PDF 링크 (권한)

**불가**

- 개별 문서 Deep Link만 여는 UX
- 문서마다 다른 Traceability QR
- QR payload에 Document No. 저장

---

## 3. 화면 구성 (Layout)

```text
Header · LOT · QR ID (future: QR-2026-000001 · V1)

제품정보
  LOT · 관리번호 · 고객사 · 현재공정 · 현재설비 · 진행률

────────────────
Timeline
────────────────

생산일보 · 검사일지 · 성적서 · 출고상태

────────────────
Document No. (Lifecycle 내 표시 — QR 밖)
  NDK-IN-2026-000123
  NDK-PR-2026-000123
  NDK-QA-2026-000123
  NDK-COA-2026-000123
  NDK-OUT-2026-000123

출력물 — PDF · QR · Document No. (권한)
```

---

## 4. 데이터 (Data)

| Store / Model | 용도 |
|---------------|------|
| `lotStore` | LOT SSOT |
| `productionStore` · `qualityStore` | 생산 · 검사 · 성적서 |
| `timelineStore` | Timeline by lotNo |
| `equipmentStore` | 현재 설비 |
| `lotTraceabilityModel.js` | Lifecycle aggregate |
| `TITAN_QR_LOOKUP_PERMISSIONS` | 역할별 마스킹 |

**Design-only:** `TITAN_QR_ID_POLICY` · `TITAN_QR_VERSION_POLICY`

---

## 5. Workflow

```text
Traceability QR Scan
  ↓
LOT Lifecycle
  ↓
관리번호 → 제품 → 고객 → 공정 → 설비
  ↓
생산일보 → 검사 → 성적서 → 출고 → Timeline
```

**Lifecycle Chain (PM):**

```text
입고 → LOT 생성 → 생산 → 검사 → 성적서 → 출고 → Timeline
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| Scan | LOT resolve · Lifecycle aggregate · Document No. collect · Timeline · 권한 필터 |

---

## 7. 연결 화면

입출고 · 생산 · 품질 · MES · **모든 공식 출력물**

동일 LOT 출력물: 입고리스트 · 생산일보 · 검사일지 · 성적서 · 거래명세서 · 출고리스트 → **동일 Traceability QR**

---

## 8. 출력물

- 화면 자체: **조회 전용**
- 연관 PDF 링크 (권한)
- Print outputs carry same LOT Traceability QR + per-doc Document No.

---

## 9. QR 조회 권한

| 역할 | 조회 | 불가 |
|------|------|------|
| **관리자** | 전체 (LOT · Timeline · 일보 · 메모 …) | — |
| **사내** | LOT · 공정 · 설비 · 상태 · 성적서 · Timeline | 내부 메모 (정책) |
| **고객** | 제품 · LOT · 성적서 · 출고 · 진행 | 생산일보 · 메모 · 작업자 · 설비 상세 |

---

## 10. QR ID · Version (설계만 · 구현 ❌)

| 항목 | 정책 |
|------|------|
| QR ID | `QR-2026-000001` — 재발행 · 출력 이력 · QR 관리 확장 |
| Version | V1 → 재발행 V2 · **재출력 = 기존 Version 유지** |

---

## 11. 완료 조건 (Freeze)

- [ ] 1 LOT = 1 Traceability QR
- [ ] Scan → Lifecycle (문서 ❌)
- [ ] 3-tier 권한 QA
- [ ] QR ID/Version Registry (Roadmap)
- [ ] Browser QA · **PM 승인**
