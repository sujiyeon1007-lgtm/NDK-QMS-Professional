# Blueprint — 입출고관리 (V1.7)

**Status:** ⏳ PM 승인 대기 · **Route:** `/inout` (Launcher Hub)

---

## 1. 목적 (Purpose)

입고 · 출고 · 재고 · 출력 · 이력 업무의 **Launcher Hub**.  
입고등록 · **LOT 생성** · **Operation QR** · 출력관리의 공식 시작점.

---

## 2. 역할 (Role)

**가능**

- 입고등록 · HTL(입고리스트) 출력
- 출고등록 · 거래명세서
- 재고 조회 · 입출고 이력
- LOT QR 자동 생성 (Roadmap) · LOT 라벨
- 출력관리 — Document No. + **동일 LOT Traceability QR**

**불가**

- 열처리 장입 (생산관리)
- 검사/성적서 (품질관리)
- 설비 QR 생성 (기준정보)

---

## 3. 화면 구성 (Layout)

```text
Breadcrumb
  ↓
Launcher Intro · Workflow Line
  ↓
Badge Cards — 입고 · 출고 · 이력 · 재고 · 출력 · 업무일지
  ↓
Card Metrics
```

---

## 4. 데이터 (Data)

| Store | 용도 |
|-------|------|
| `lotStore` | LOT SSOT |
| `customerStore` · `productStore` | Master 참조 |
| Legacy `productionRecords` | 입고/출고 레코드 |

---

## 5. Workflow

```text
입고등록 → LOT 생성 → Operation QR (Roadmap 2)
  → HTL 출력 → 생산관리
  → 출고 (성적서 후)
Traceability QR: LOT 1개 = QR 1개 · 모든 출력물 동일 QR
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| 수량 · 메모 · 출력 선택 | 관리번호 · LOT · Workflow · QR · Document No. · Timeline |

---

## 7. 연결 화면

생산관리 · 품질관리 · MES · **LOT Lifecycle** · HOME

---

## 8. 출력물

- LOT 라벨 (Operation QR)
- 입고리스트 · 출고리스트 · 거래명세서
- **Document No. + Traceability QR (동일 LOT)**
- PDF · QR 재출력

---

## 9. 완료 조건 (Freeze)

- [ ] Launcher · Breadcrumb · Badge
- [ ] 입고→LOT→출력 Workflow (Blueprint 승인 후 단계 구현)
- [ ] Store 연동 · Browser QA · **PM 승인**
