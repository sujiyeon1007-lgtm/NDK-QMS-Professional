# Project TITAN V1.1 — Workflow Reorganization

**Date:** 2026-07-04  
**Type:** 업무 프로세스 재구성 (디자인 변경 ❌)

> **Official Architecture (Primary):** `docs/TITAN_OFFICIAL_ARCHITECTURE.md` · `src/config/titanOfficialArchitecture.js`  
> **Smart Access:** `docs/SMART_ACCESS_ARCHITECTURE.md` — Paper · QR · Mobile · NFC Hybrid

## Philosophy

- **One Time Input → One Scan → One Workflow**
- 기존 Paper Workflow **유지** (입고리스트 · 출고리스트 · 거래명세서 · 생산일보 출력 삭제 금지)
- Smart Workflow **추가** (설비 QR → 생산 가능 목록 → LOT → 생산완료 → 검사대기)
- NFC(Future) — QR과 **동일 URL** · Handler 공유
- 제품관리 Master (공정 · 재질 · 도번) → 생산 화면에서 그대로 활용
- MES 대체 ❌ · MES 연동 전 TITAN SessionStorage · 연동 후 MES 데이터 수신

## Paper Workflow (unchanged)

```
입고 → 입고리스트 출력 → 생산 → 검사 → 성적서 → 출고 → 통계
```

## Smart Workflow (new)

```
QR/NFC → 설비/위치 인식 → 공정 확인 → 생산 가능 목록 → LOT → 생산중 → 생산완료 → 검사대기 → 검사 → 성적서 → 출고
```

## Smart Access Targets (Route Registry)

| targetId | Screen | Status |
|----------|--------|--------|
| `equipment` | 작업일보 | **active** |
| `inboundRegister` | 입고현황 | planned |
| `inspectionRegister` | 검사일지 | planned |
| `certificate` | 성적서 | planned |
| `outboundRegister` | 출고현황 | planned |
| `equipmentMaster` | 설비관리 | planned |

Config: `src/config/smartAccessArchitecture.js` · `buildSmartAccessPath()`

## Implementation

| Area | Path |
|------|------|
| Smart Access Architecture | `src/config/smartAccessArchitecture.js` |
| Config | `src/config/titanV11Workflow.js` |
| Equipment QR | `src/utils/equipmentQr.js` — `NDK://EQ/{code}` · `NDK\|EQ\|{code}` (legacy) |
| Producible list | `src/utils/smartProducibleWorkList.js` |
| UI (existing 작업일보) | `src/pages/Production/DailyProductionReport.jsx` |
| Panel | `src/pages/Production/SmartProduciblePanel.jsx` |

## Smart Entry URL

```
/production/daily-report?equipment=ION-01
/production/daily-report?qr=NDK://EQ/ION-01
/production/daily-report?qr=NDK|EQ|ION-01
```

(Sidebar: **작업일보** → `/production/daily-report`)

## Producible List Rules

- Filter: `record.heatTreatment === equipment.equipType`
- 🟢 **금일 입고**: HTL 출력 후 LOT 미등록 · `incomingDate === 금일`
- 🔵 **기존 재고**: HTL 출력 후 LOT 미등록 · 금일 이전 입고

## Next Steps

1. `smartAccessRouter.js` — QR/NFC 공통 URL Handler
2. 입고 · 검사 · 출고 Smart URL (기존 화면 query 연동)
3. QR 출력센터 (환경설정 → QR 관리)
4. 기준정보관리 6화면 마감
5. MES adapter hook (future)
