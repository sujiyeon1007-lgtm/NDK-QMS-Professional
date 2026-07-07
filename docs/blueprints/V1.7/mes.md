# Blueprint — MES (V1.7)

**Status:** ⏳ PM 승인 대기 · **Routes:** `/equipment-status` · `/product-status`

---

## 1. 목적 (Purpose)

**설비 · 제품 실시간 현황 Dashboard**.  
WorkflowEngine 이벤트 반영 · `equipmentStore` SSOT · 생산관리 장입과 동기화.

---

## 2. 역할 (Role)

**가능**

- 설비 가동/대기/점검 · 공정별 그룹
- 제품/LOT 진행 조회
- QR Scan → 장입 작업 화면 이동

**불가**

- Master 편집 · Oracle MES 쓰기
- 장입 Workflow 대체 (생산관리)

---

## 3. 화면 구성 (Layout)

**설비 현황**

```text
QR Scan Bar → Summary Bar → 공정별 Cards → Detail Panel
```

**제품 현황**

```text
KPI → Search → Progress Table
```

---

## 4. 데이터 (Data)

| Store | 용도 |
|-------|------|
| `equipmentStore` | 설비 SSOT (Master 연동) |
| `lotStore` · `productionStore` | LOT · 생산 |
| `dashboardStore` | 집계 캐시 |

---

## 5. Workflow

```text
WorkflowEngine → equipmentStore 갱신
  → notifyWorkflowDataRefresh → MES UI
Card 클릭 → /production/charging/equipment/{id}
```

---

## 6. 자동화 (Automation)

| 사용자 | 시스템 |
|--------|--------|
| 설비 선택 · QR Scan | 진행률 · LOT · 상태 · 가동 집계 |

---

## 7. 연결 화면

생산관리 · HOME · 기준정보(설비)

---

## 8. 출력물

없음 (Monitor)

---

## 9. 완료 조건 (Freeze)

- [ ] EquipmentStore SSOT · 장입 후 즉시 반영
- [ ] Browser QA · **PM 승인**
