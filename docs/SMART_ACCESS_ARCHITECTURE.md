# Project TITAN — Smart Access Architecture

**Version:** V1.2 Smart Access Platform (2026-07-04)  
**Date:** 2026-07-04  
**Type:** 설계 반영 (UI 변경 ❌ · Config · Rule · Workflow · 문서)

> **V1.2 SSoT:** `docs/TITAN_V12_SMART_ACCESS_PLATFORM.md` · `src/config/titanV12SmartAccessPlatform.js`  
> **Official SSoT:** `docs/TITAN_OFFICIAL_ARCHITECTURE.md` · `src/config/titanOfficialArchitecture.js`

---

## 1. 개요

Project TITAN은 **PC QMS만이 아닌 Hybrid System**입니다.

| 채널 | 역할 |
|------|------|
| **Paper** | 기존 출력물 — 유지 · 삭제 금지 |
| **QR** | Smart Mode — 1차 개발 |
| **Mobile** | QR URL → 브라우저/모바일 업무 화면 |
| **NFC** | Future Mode — QR와 **동일 URL** |

---

## 2. 핵심 철학

```text
One Time Input
    ↓
One Scan
    ↓
One Workflow
```

- **One Time Input:** 한 번 입력한 데이터는 다른 메뉴에서 재입력하지 않음 (Master · Session 연동)
- **One Scan:** QR/NFC 1회 → 해당 업무 화면 직행
- **One Workflow:** Paper · Smart · NFC 모두 `titanWorkflowStatus` 상태머신 공유

---

## 3. Smart Access vs 기존 방식

### 기존 (PC)

```text
메뉴 선택 → 클릭 → 클릭 → 등록 → 변경
```

### Smart Access

```text
QR 또는 NFC → 업무 화면 → 등록 · 상태 변경
```

---

## 4. 지원 방식

### 4.1 Paper Mode (유지)

| 출력 | DOC | 상태 |
|------|-----|------|
| 입고리스트 | DOC-01 | ✅ 유지 |
| 출고리스트 | OUT | ✅ 유지 |
| 거래명세서 | DOC-04 | ✅ 유지 |
| 생산일보 | DOC-02 | ✅ 유지 |

### 4.2 Smart Mode (QR · Active)

- QR 스캔 → URL → 기존 화면 deep link
- **현재 구현:** 설비 QR → 작업일보 (`equipmentQr.js` · `SmartProduciblePanel`)

### 4.3 Future Mode (NFC · Planned)

- NFC 태그 = QR과 **동일 URL**
- 앱 수정 없이 QR ↔ NFC 교체 가능

---

## 5. QR/NFC 적용 대상 (Route Registry)

Config SSoT: `src/config/smartAccessArchitecture.js` → `SMART_ACCESS_TARGETS`

| # | 대상 | 진입 URL (예) | 구현 |
|---|------|---------------|------|
| ① | 입고등록 QR | `/inout/incoming?smart=register` | planned |
| ② | 설비 QR | `/production/daily-report?equipment=3S-3` | **active** |
| ③ | 검사실 QR | `/quality/inspection?smart=register&room=QC-01` | planned |
| ④ | 품질실 QR | `/quality/certificate?smart=1` | planned |
| ⑤ | 출고장 QR | `/inout/shipment?smart=register&dock=DOCK-01` | planned |
| ⑥ | 설비관리 QR | `/settings/equipment?detail={code}` | planned |

### Payload / Smart Access ID (통합 규칙)

**Canonical:** `NDK://` prefix — see `SMART_ACCESS_ID_REGISTRY` in `titanOfficialArchitecture.js`

| Canonical | Legacy Alias | 용도 |
|-----------|--------------|------|
| `NDK://INCOMING` | `NDK\|IN\|REG` | 입고등록 |
| `NDK://EQ/{code}` | `NDK\|EQ\|{code}` | 설비 (생산) |
| `NDK://INSPECTION` | `NDK\|QC\|ROOM\|{code}` | 검사실 |
| `NDK://CERTIFICATE` | `NDK\|QC\|CERT\|{code}` | 성적서 |
| `NDK://OUTGOING` | `NDK\|OUT\|DOCK\|{code}` | 출고장 |
| `NDK://EQ/{code}` | `NDK\|EQ\|INFO\|{code}` | 설비 Master |

---

## 6. QR 출력센터 (향후)

- **메뉴:** 환경설정 → QR 관리 (planned: `/environment/qr`)
- **기능:** 설비 · 입고 · 검사 · 출고 · 성적서 · 관리자 QR
- **출력:** PDF · 재출력 · 동일 QR 다매 부착

---

## 7. NFC 확장 원칙

```text
QR  → https://titan.local/production/daily-report?equipment=3S-3
NFC → https://titan.local/production/daily-report?equipment=3S-3
         ↑ 동일 URL · 동일 Handler
```

- `buildSmartAccessPath(targetId, { code })` — QR/NFC 공통 경로 생성
- 향후 `smartAccessRouter.js` — URL 파싱 → React Router navigate

---

## 8. 코드 SSoT 맵

| 영역 | 파일 |
|------|------|
| **Official Architecture (Primary)** | `src/config/titanOfficialArchitecture.js` |
| Smart Access Architecture | `src/config/smartAccessArchitecture.js` |
| V1.1 Workflow | `src/config/titanV11Workflow.js` |
| 설비 QR (Active) | `src/utils/equipmentQr.js` |
| 생산 가능 목록 | `src/utils/smartProducibleWorkList.js` |
| Workflow 상태 | `src/utils/titanWorkflowStatus.js` |
| Cursor Rule | `.cursor/rules/project-titan-smart-access-architecture.mdc` |

---

## 9. 향후 개발 순서 (권장)

1. `smartAccessRouter.js` — URL → targetId → navigate (공통 Handler)
2. 입고 · 검사 · 출고 Smart URL (기존 화면 query 연동)
3. QR 출력센터 (환경설정)
4. NFC — URL만 태그에 기록 (앱 변경 없음)

---

## 10. 관련 문서

- `docs/TITAN_V11_WORKFLOW.md` — V1.1 업무 프로세스
- `.cursor/rules/project-titan-v11-workflow.mdc` — V1.1 개발 규칙
