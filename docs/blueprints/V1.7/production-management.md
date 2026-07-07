# Blueprint — 생산관리 (V1.7)

**Status:** ⏳ PM 승인 대기 · **Route:** `/production` · **생산일보 UI:** 🟢 Freeze

---

## 1. 목적 (Purpose)

열처리 **생산 Workflow Hub**.  
**Master QR Scan** → LOT 선택 → 장입 → **생산일보 자동 생성** → 열처리 완료.

---

## 2. 역할 (Role)

**가능**

- Master QR Scan · 설비 장입 · 열처리 완료
- 생산일보 조회 · 메모 (자동 초안)
- 생산계획 · 실적 · 업무일지

**불가**

- 설비 QR **생성** (기준정보)
- LOT/Traceability QR **생성**
- 검사/성적서 등록

---

## 3. 화면 구성 (Layout)

**Launcher Hub**

```text
Breadcrumb → Cards (계획 · 장입 · 일보 · 실적 · 일지)
```

**설비 장입 (`/production/charging/equipment/{id}`)**

```text
현재 상태 → LOT Table → Timeline → LOT Traceability Panel → Actions
```

**생산일보 (`/production/daily-report`)** — UI Freeze

```text
KPI → Search → Table → Detail Popup
```

---

## 4. 데이터 (Data)

| Store / Engine | 용도 |
|----------------|------|
| `equipmentStore` | 설비 SSOT |
| `lotStore` · `productionStore` | LOT · 생산 |
| `timelineStore` | Timeline |
| `TitanWorkflowEngine` | startCharging · finishCharging |

---

## 5. Workflow

```text
Master QR Scan → EquipmentStore
  → LOT 선택 → startCharging
  → 생산일보 자동 · Timeline
  → finishCharging → 검사대기
  → Dashboard / MES 갱신
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| 특이사항 · 메모 · LOT 선택 | 시작/종료 · 작업자 · 일보 초안 · Timeline · 상태 |

---

## 7. 연결 화면

입출고 · 품질 · MES · HOME · **LOT Lifecycle**

---

## 8. 출력물

- 생산일보 DOC-02 + **Traceability QR (동일 LOT)**
- PDF · Excel

---

## 9. 완료 조건 (Freeze)

- [ ] 생산일보 UI Freeze 유지
- [ ] 장입 E2E · KPI=리스트
- [ ] Browser QA · **PM 승인**
