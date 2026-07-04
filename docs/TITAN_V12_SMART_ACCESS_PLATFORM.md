# Project TITAN V1.2 — Smart Access Platform

**Lock Date:** 2026-07-04  
**Type:** Architecture Lock (UI 변경 ❌ · Config · Rule · Workflow · 문서)  
**SSoT (Code):** `src/config/titanV12SmartAccessPlatform.js`  
**Parent:** `docs/TITAN_OFFICIAL_ARCHITECTURE.md` · `src/config/titanOfficialArchitecture.js`

---

## 1. Project TITAN 목표

Project TITAN은 단순한 QMS가 아닙니다.

| 구성 | 역할 |
|------|------|
| QMS | 품질 · 검사 · 성적서 |
| Paper Workflow | 기존 출력물 기반 업무 — **유지** |
| Smart Workflow | QR/NFC deep link 업무 |
| QR | Smart Access 1차 채널 (V1.2) |
| NFC (Future) | QR와 동일 Smart Access ID (V2.0) |
| MES Ready | Repository 교체 · UI 불변 (V3.0) |

**현장 중심 통합 업무 플랫폼**

---

## 2. 핵심 철학

> *"기존 업무를 없애는 시스템이 아니라 기존 업무를 더 편하게 만드는 시스템"*

- **Paper Workflow** — 그대로 유지 · 삭제 금지
- **Smart Workflow** — 추가 · 사용자가 Paper **OR** Smart 선택

### Smart Access

```text
기존:  메뉴 → 클릭 → 클릭 → 등록 → 변경
Smart: QR/NFC → 업무 화면 → 등록
```

---

## 3. 버전 로드맵

```text
V1.0  기본 QMS
  ↓
V1.1  Paper + Workflow
  ↓
V1.2  QR Smart Access          ← 현재 Architecture Lock
  ↓
V2.0  QR + NFC
  ↓
V3.0  MES 연동
```

Config: `TITAN_VERSION_ROADMAP` in `titanV12SmartAccessPlatform.js`

---

## 4. QR 적용 대상 (6)

| # | 위치 | Smart Access ID | 화면 | Status |
|---|------|-----------------|------|--------|
| ① | 입고창고 | `NDK://INCOMING` | 입고등록 | planned |
| ② | 생산설비 | `NDK://EQ/{code}` | 생산등록 | **active** |
| ③ | 검사실 | `NDK://INSPECTION` | 검사등록 | planned |
| ④ | 품질실 | `NDK://CERTIFICATE` | 성적서관리 | planned |
| ⑤ | 출고장 | `NDK://OUTGOING` | 출고등록 | planned |
| ⑥ | 설비 | `NDK://EQ/{code}` | 설비정보/점검이력/생산현황 | planned |

Route: `src/config/smartAccessArchitecture.js` → `SMART_ACCESS_TARGETS`

---

## 5. 설비 QR 규칙

| Rule | Value |
|------|-------|
| 제품마다 QR | ❌ |
| LOT마다 QR | ❌ |
| **설비마다 QR 1개** | ✅ |

공식 예시: `ION-01` · `ION-02` · `GAS-01` · `SOFT-01`

- 동일 QR **다매 출력** · 회사 여러 위치 부착 가능

---

## 6. QR 출력센터 (향후)

**메뉴:** 환경설정 → **QR 출력센터** (`/environment/qr`)

| 지원 | Smart Access ID |
|------|-----------------|
| 설비 QR | `NDK://EQ/{code}` |
| 입고등록 QR | `NDK://INCOMING` |
| 검사등록 QR | `NDK://INSPECTION` |
| 성적서 QR | `NDK://CERTIFICATE` |
| 출고등록 QR | `NDK://OUTGOING` |
| 관리자 QR | (planned) |

**기능:** PDF 출력 · 재출력 · 미리보기 · 인쇄

---

## 7. QR 라벨 규격

| 항목 | 권장 |
|------|------|
| 출력 | A4 시트에 배치 |
| 크기 | **A6** 또는 **A7** |
| 코팅 | 무광 |
| 부착 | 설비 앞 |

### 라벨 레이아웃 (예)

```text
Project TITAN
ION-01
이온질화 1호기
[ QR Code ]
(향후 NFC 영역)
```

Config: `QR_LABEL_SPEC` in `titanV12SmartAccessPlatform.js`

---

## 8. NFC Ready

현재: **QR 우선 개발**  
설계: **모든 Smart Access = NFC Ready**

```text
QR  → NDK://EQ/ION-01
NFC → NDK://EQ/ION-01   ← 동일 Smart Access ID
```

프로그램 수정 없이 NFC 태그만 추가 → 동일 기능

---

## 9. Smart Access ID (공통 규칙)

QR · NFC · 향후 Barcode — **동일 ID**

| Smart Access ID | 화면 |
|-----------------|------|
| `NDK://INCOMING` | 입고등록 |
| `NDK://OUTGOING` | 출고등록 |
| `NDK://INSPECTION` | 검사등록 |
| `NDK://CERTIFICATE` | 성적서관리 |
| `NDK://EQ/ION-01` | 이온질화 1호기 |
| `NDK://EQ/GAS-01` | 가스질화 |

Legacy alias: `NDK|EQ|{code}` — `equipmentQr.js` backward compat

---

## 10. 모바일 화면 (Future)

- PC 화면 축소 ❌ — **Mobile 전용 UI**
- 큰 버튼 · **3번 이하 클릭** · 현재 작업만 · 현장 중심

---

## 11. Smart Access Dashboard (Future · HOME)

**금일** Smart Access 사용 통계 (예):

| 항목 | 횟수 |
|------|------|
| 입고 | 15회 |
| 생산 | 42회 |
| 검사 | 31회 |
| 출고 | 11회 |

→ 현장 Smart Access 실제 사용률 확인

Config: `SMART_ACCESS_DASHBOARD` — `periodBasis: "금일"`

---

## 12. Smart Workflow (Full Chain)

```text
QR/NFC → 설비 자동 인식 → 공정 자동 인식 → 생산 가능 목록
  → LOT 등록 → 생산중 → 생산완료 → 검사대기 → 검사 → 성적서 → 출고
```

---

## 13. Paper Workflow (Unchanged)

```text
입고 → 입고리스트 출력 → 생산 → 검사 → 성적서 → 출고 → 통계
```

---

## 14. 코드 SSoT 맵

| 영역 | 파일 |
|------|------|
| V1.2 Platform | `src/config/titanV12SmartAccessPlatform.js` |
| Official Architecture | `src/config/titanOfficialArchitecture.js` |
| Route Registry | `src/config/smartAccessArchitecture.js` |
| V1.1 Workflow | `src/config/titanV11Workflow.js` |
| 설비 QR (active) | `src/utils/equipmentQr.js` |
| Cursor Rule | `.cursor/rules/project-titan-v12-smart-access-platform.mdc` |

---

## 15. 향후 개발 순서

1. `smartAccessRouter.js` — `parseSmartAccessId()` → navigate (QR/NFC/Barcode 공통)
2. QR 출력센터 — PDF · 라벨 규격(`QR_LABEL_SPEC`) · 다매 출력
3. 입고 · 검사 · 출고 Smart URL (기존 화면 query)
4. Mobile 전용 화면 (PM 승인 후)
5. Smart Access Dashboard (HOME)
6. V2.0 NFC — 태그에 Smart Access ID 기록
7. V3.0 MES — Repository 교체 · UI 불변

---

## 16. 관련 문서

- `docs/TITAN_OFFICIAL_ARCHITECTURE.md`
- `docs/SMART_ACCESS_ARCHITECTURE.md`
- `docs/TITAN_V11_WORKFLOW.md`
