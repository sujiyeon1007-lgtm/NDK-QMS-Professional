# Blueprint — 품질관리 (V1.7)

**Status:** ⏳ PM 승인 대기 · **Route:** `/quality`

---

## 1. 목적 (Purpose)

검사 · 성적서 · 불량 · 문서 · 품질 업무일지 **Hub**.  
LOT Lifecycle의 **검사 · 성적서** 구간 담당.

---

## 2. 역할 (Role)

**가능**

- 검사 등록/수정 · 검사일지
- 성적서 발행 · PDF
- 불량/NCR · 문서관리
- **Traceability QR → LOT Lifecycle 조회**

**불가**

- 입고/출고 · 설비 장입
- QR **생성** (Scan/조회만)

---

## 3. 화면 구성 (Layout)

```text
Breadcrumb → Launcher Hub
하위: KPI → Search → Table → [상세] Popup
```

---

## 4. 데이터 (Data)

| Store | 용도 |
|-------|------|
| `qualityStore` | 검사 · 성적서 |
| `lotStore` · `timelineStore` | LOT · Timeline |
| `heatTreatmentCalculationEngine` | 경화깊이 계산 |

---

## 5. Workflow

```text
검사대기 → 검사 → 검사완료 → 성적서대기 → 발행 → 출고 가능
불합격 → 불량이력 → NCR → 재처리
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| 검사값 · 판정 · 경도 최종 | 자동 계산 · Workflow · Timeline · Document No. · QR 부착 |

---

## 7. 연결 화면

생산 · 입출고 · LOT Lifecycle · 기준정보(제품 Spec)

---

## 8. 출력물

- 검사일지 · 성적서 COA
- **Document No. + Traceability QR (동일 LOT)**

---

## 9. 완료 조건 (Freeze)

- [ ] 검사→성적서→출고 Workflow
- [ ] qualityStore 연동 · Browser QA · **PM 승인**
