# Blueprint — 기준정보관리 (V1.7)

**Status:** ⏳ PM 승인 대기 · **Route:** `/settings`

---

## 1. 목적 (Purpose)

거래처 · 제품 · 설비 · 공정 · 작업자 **Master SSOT**.  
**Master QR (설비)** 생성 · 관리의 공식 위치.

---

## 2. 역할 (Role)

**가능**

- Master CRUD (Popup)
- **설비 QR 생성 · 재생성 · PDF · 미리보기** (Roadmap 1)
- 열처리 Spec (업체+품번)
- in-use 삭제 가드

**불가**

- LOT/생산 Workflow · 입출고 트랜잭션

---

## 3. 화면 구성 (Layout)

```text
Breadcrumb → Launcher Hub
  ↓
List (TitanDataTable) → Detail Popup (Tabs)
```

설비 상세: **QR 생성 · 미리보기 · PDF** (Roadmap)

---

## 4. 데이터 (Data)

| Store | 용도 |
|-------|------|
| `customerStore` · `productStore` · `processStore` · `workerStore` | Master |
| `equipmentStore` | 설비 SSOT ← `masterEquipmentBuilder` |
| `masterDataSync.js` | Session ↔ Store |

---

## 5. Workflow

```text
Master 등록 → Store SSOT → 전 메뉴 참조
설비 QR → Master QR · NDK://EQ/{code}
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| Master 입력 · QR 생성 요청 | Store sync · Smart Access ID · 삭제 가드 |

---

## 7. 연결 화면

입출고 · 생산 · 품질 · MES · 환경설정

---

## 8. 출력물

- **설비 QR PDF** (Master QR · Roadmap 1)

---

## 9. 완료 조건 (Freeze)

- [ ] V1.6 Master Store Integration
- [ ] Browser QA · **PM 승인**
