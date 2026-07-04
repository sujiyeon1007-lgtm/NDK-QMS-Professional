# Project TITAN V1.2 — Menu Architecture

**Lock Date:** 2026-07-04  
**Type:** Architecture Lock (UI/Sidebar 변경 ❌ · Config · Rule · 문서)  
**SSoT (Code):** `src/config/titanV12MenuArchitecture.js`  
**Runtime Sidebar:** Menu Freeze V1.3 (`src/config/menuFreezeV1.js`) — PM 승인 후 V1.2 Sidebar 전환

---

## 1. 배경 · 목표

MES 분석 결과: 기능은 많지만 메뉴가 과도하게 세분화되어 사용성이 낮음.

**Project TITAN 목표:** 기능은 많지만 **메뉴는 단순**

### 핵심 철학

> **메뉴는 적게 · 기능은 깊게**  
> *(Menu Simple, Function Deep)*

- 메인 메뉴: **10~12개** 이내
- 각 메뉴 **내부**에서 기능 확장
- **HOME** 강화 — 메뉴 탐색 대신 바로 업무 시작
- **QR/NFC** — 메뉴와 동일 철학 (스캔 → 업무 화면)

---

## 2. V1.2 메인 메뉴 (11 active)

| # | 메뉴 | 역할 |
|---|------|------|
| 1 | **HOME** | Dashboard · 빠른 메뉴 · 최근 작업 · QR 진입 |
| 2 | **기준정보관리** | 거래처 · 제품 · 재질 · 공정 · 설비 · 작업자 |
| 3 | **입고관리** | 입고등록 · 현황 · 리스트 · HTL · QR 입고 |
| 4 | **생산관리** | 작업지시 · 생산일보 · 현황 · LOT · QR 생산 · 설비모니터링 |
| 5 | **검사관리** | 수입/공정/최종검사 · 기준 · 불량 · X-R · 이력 |
| 6 | **성적서관리** | 등록 · PDF · 재발행 · 이력 · 버전 |
| 7 | **출고관리** | 등록 · 현황 · 거래명세서 · 마감 · 납기 |
| 8 | **이력조회** | LOT · 관리번호 · 제품 · 업체 · 전체이력 |
| 9 | **문서관리** | 도면 · 작업표준서 · 품질문서 · 첨부 · Revision |
| 10 | **통계관리** | **메뉴 1개** · 내부 Tab 확장 |
| 11 | **관리자** | 사용자 · 권한 · QR 출력센터 · Smart Access · 로그 · 백업 |

### 향후 (구조만)

| 메뉴 | 내부 기능 |
|------|-----------|
| **경리관리** | 거래명세서 · 월마감 · 세금계산서 · 매출 · 미수금 |
| **회계관리** | 전표 · 조회 · 계정과목 · 월별현황 |

---

## 3. 통계관리 — 내부 Tab

메뉴는 **하나**만 유지:

- 생산통계 · 검사통계 · 출고통계
- 업체별 · 제품별 · 설비별 · 작업자별 통계

**현재 화면 재사용:** `/statistics/*` (StatisticsLayout · StatisticsScreen)

---

## 4. HOME 역할 강화 (설계)

HOME에서 바로 시작:

- 입고 · 생산 · 검사 · 성적서 · 출고 · 통계 **빠른 메뉴**
- **최근 작업**
- **QR 진입**
- 운영 KPI · 진행현황

→ 사용자가 Sidebar를 많이 탐색하지 않도록 설계

---

## 5. QR ↔ 메뉴 (동일 철학)

| QR 위치 | Smart Access ID | V1.2 메뉴 | 기능 |
|---------|-----------------|-----------|------|
| 입고창고 | `NDK://INCOMING` | 입고관리 | 입고등록 |
| 생산설비 | `NDK://EQ/{code}` | 생산관리 | 생산등록 |
| 검사실 | `NDK://INSPECTION` | 검사관리 | 검사등록 |
| 품질실 | `NDK://CERTIFICATE` | 성적서관리 | 성적서관리 |
| 출고장 | `NDK://OUTGOING` | 출고관리 | 출고등록 |
| 설비 | `NDK://EQ/{code}` | 기준정보/관리 | 설비정보 · 점검 · 생산현황 |

---

## 6. V1.3 → V1.2 전환 매핑

| 현재 Sidebar (V1.3) | V1.2 목표 | 조치 |
|---------------------|-----------|------|
| HOME | HOME | 유지 |
| 기준정보관리 | 기준정보관리 | 유지 |
| 입고현황 | **입고관리** | 그룹화 · 내부 기능 확장 |
| 재고현황 | 입고관리 / HOME | 내부 기능 또는 HOME KPI |
| 작업일보 | **생산관리** | 그룹화 |
| 업무일지 | HOME | 최근 작업 통합 |
| 품질관리 | **검사관리 + 성적서관리** | 분리 |
| 문서관리 | 문서관리 | 유지 |
| 출고현황 | **출고관리** | 그룹화 |
| 이력조회 | 이력조회 | 유지 |
| 통계조회 | **통계관리** | 명칭 · Tab 통합 |
| 환경설정 | **관리자** | 확장 (QR 출력센터 등) |

**⚠️ 현재 Runtime:** Sidebar V1.3 유지 — Architecture Lock만 반영

---

## 7. 기존 화면 재사용 맵

| V1.2 기능 | 기존 화면 | Path |
|-----------|-----------|------|
| 입고등록/현황/HTL | InboundManagement | `/inout/incoming` |
| 생산일보/LOT/QR 생산 | DailyProductionReport | `/production/daily-report` |
| 생산현황 | ProductionResultsManagement | `/production/results` |
| 검사관리 | InspectionLogManagement | `/quality/inspection` |
| 성적서관리 | CertificateManagement | `/quality/certificate` |
| 출고관리 | OutboundManagement | `/inout/shipment` |
| 이력조회 | QualityHistoryInquiry | `/history` |
| 문서관리 | DocumentManagementPage | `/documents` |
| 통계관리 | StatisticsScreen | `/statistics/*` |
| 기준정보 6화면 | Settings pages | `/settings/*` |
| 관리자 | EnvironmentManagement | `/environment/*` |

---

## 8. 코드 SSoT

| 영역 | 파일 |
|------|------|
| **V1.2 Menu Architecture** | `src/config/titanV12MenuArchitecture.js` |
| Runtime Sidebar (V1.3) | `src/config/menuFreezeV1.js` · `menuConfig.js` |
| Smart Access Platform | `src/config/titanV12SmartAccessPlatform.js` |
| Official Architecture | `src/config/titanOfficialArchitecture.js` |

---

## 9. 향후 Sidebar 전환 (PM 승인 후)

1. `menuConfig.js` — V1.2 메인 메뉴 id/label 반영
2. `menuFreezeV1.js` — Sidebar order · groups 갱신
3. 검사/성적서 Sidebar 분리 — 기존 QualityLayout Tab 활용
4. HOME 빠른 메뉴 · QR 진입 UI (승인된 디자인 내)
5. 관리자 메뉴 — QR 출력센터 · Smart Access 관리 Tab 추가

**Do Not:** PM 승인 없이 Sidebar 변경 · Paper Workflow 삭제 · 승인 UI 임의 변경

---

## 10. 관련 문서

- `docs/TITAN_V12_SMART_ACCESS_PLATFORM.md`
- `docs/TITAN_OFFICIAL_ARCHITECTURE.md`
- `docs/MENU_FREEZE_V1.3.md`
