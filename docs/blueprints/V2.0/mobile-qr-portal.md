# Blueprint — Mobile QR Portal (Project TITAN · Approved)

**Status:** ✅ **PM Approved** · 2026-07-09 · **Architecture Only** · 구현 ❌  
**Route Policy:** `/mobile/qr/equipment/{UUID}` · `/mobile/qr/lot/{UUID}` · `/mobile/qr/document/{UUID}` · `/mobile/qr/worker/{UUID}`  
**V1.0.1 Route Contracts:** `/mobile/qr/master/{type}/{UUID}` · `/mobile/qr/data/{type}/{UUID}` · `/mobile/qr/menu/{shortcutId}`  
**Code SSoT:** `MOBILE_QR_PORTAL_BLUEPRINT` · `MOBILE_QR_PORTAL_URL_POLICY`

---

## 공식 방향

Project TITAN의 QR는 단순 생성/출력 대상이 아니라 **현장에서 바로 작업하는 진입점**입니다.

```text
Desktop TITAN = 관리 업무 Workspace
Mobile QR Portal = QR 기반 현장 작업 Portal
```

Desktop UI를 휴대폰에 축소하지 않습니다. 휴대폰 QR Scan 사용자는 Sidebar, Dashboard, Launcher, 통계, 환경설정이 아니라 **해당 QR 대상의 정보와 필요한 작업 버튼**만 봅니다.

---

## Desktop / Mobile 역할 분리

| 영역 | 역할 |
|------|------|
| Desktop TITAN | 품질관리 · 생산관리 · 경리관리 · 통계 · 환경설정 · 기준정보 등 관리 업무 |
| Mobile QR Portal | QR Scan 후 현장 작업 수행 · 상태 확인 · 최소 정보 조회 |

**공통:** 데이터는 동일 API · 동일 DB · 동일 QR Registry · 동일 Workflow Engine을 사용합니다.  
**분리:** UI Shell, Navigation, 화면 밀도, 버튼 크기, 정보량은 Mobile 전용으로 설계합니다.

---

## 1. Purpose

휴대폰 카메라로 QR를 스캔한 사용자가 Desktop 관리 화면이 아니라, QR 대상별 현장 작업 화면으로 바로 진입하도록 하는 Mobile 전용 Portal을 설계합니다.

목표는 **QR 생성**보다 **QR를 활용한 모바일 작업 경험**입니다.

## 2. Role

**가능:**

- QR 대상 정보 요약 조회
- 설비 · LOT · 작업자 · 문서별 현장 작업 버튼 제공
- 작업 시작/종료, 검사 조회/등록, 성적서 조회, 출고 현황 등 향후 확장
- 첨부파일 확인, 사진 업로드, 전자서명, 작업 승인 확장

**불가:**

- Desktop Sidebar 표시
- Dashboard / Launcher 표시
- 복잡한 Navigation 표시
- 환경설정 · 통계 · 기준정보 CRUD
- Desktop table/list workspace를 모바일에 축소 표시

## 3. Task Scope

| QR 대상 | 표시 정보 | 큰 버튼 |
|---------|-----------|---------|
| 설비 QR | 설비명 · 설비 상태 · 현재 작업 · 현재 LOT | 장입 시작 · 장입 완료 · 작업 현황 · 점검 이력 |
| LOT QR | LOT 번호 · 품명 · 재질 · 규격 · 수량 · 현재 공정 | LOT 정보 · 검사 등록 · 성적서 보기 · 출고 현황 |
| 작업자 QR | 작업자명 · 담당 공정 | 작업 시작 · 작업 종료 · 작업 이력 |
| 문서 QR | 문서제목 · 문서유형 · 관련 LOT · 첨부파일 | 문서 보기 · 첨부파일 · 관련 LOT · 승인/확인 |

**표시 안 함:** Sidebar · Dashboard · Launcher · 통계 · 환경설정 · Master CRUD · Desktop Workspace Table.

## 4. Exit Condition

| 항목 | 내용 |
|------|------|
| 종료 조건 | 모바일 작업 완료 또는 사용자가 Portal 종료 |
| 다음 화면 | 동일 Mobile Portal 유지 또는 QR Scan/카메라로 복귀 |
| Desktop 이동 | 기본 없음 — Desktop 관리 UI로 자동 이동하지 않음 |
| Engine | 동일 API · DB · Workflow Engine으로 작업 결과 반영 |

## 5. Layout

```text
MobilePortalShell (Sidebar 없음)
├ QR 대상 요약 Card
├ 현재 상태 Card
├ 큰 Action Button Grid
├ 필요 시 상세 Section
└ 세로 Scroll 중심
```

### UI 원칙

- 큰 버튼
- 큰 글씨
- 카드형 UI
- 최소 정보만 표시
- 세로 스크롤 중심
- 장갑 착용 상태에서도 누르기 쉬운 터치 영역
- Desktop Layout 축소 금지

### Foundation Mobile Components (예정)

- `MobilePortalShell`
- `MobileQrSummaryCard`
- `MobileQrStatusCard`
- `MobileQrActionButton`
- `MobileAttachmentList`

## 6. Data

- API/DB: Desktop TITAN과 동일
- QR Registry: 동일 Registry 사용
- QR URL: Desktop 주소가 아니라 Mobile Portal 주소 저장
- 권한: 향후 `admin · internal · customer · fieldWorker` 등으로 확장 가능

### QR URL 정책

```text
/mobile/qr/equipment/{UUID}
/mobile/qr/lot/{UUID}
/mobile/qr/document/{UUID}
/mobile/qr/worker/{UUID}
```

QR를 휴대폰으로 스캔하면 Mobile Portal이 열립니다. Desktop Workspace URL을 QR payload 기본값으로 사용하지 않습니다.

### V1.0.1 Menu Shortcut QR 정책

```text
/mobile/qr/menu/{shortcutId}
```

Menu Shortcut QR는 고정·재사용 QR입니다. Desktop AppShell route가 아니라 Mobile Portal route를 열며, 작업 바로가기나 메뉴 진입을 현장용 큰 버튼 화면으로 연결합니다.

### V1.0.1 Master / Data QR route contracts

```text
/mobile/qr/master/{type}/{UUID}
/mobile/qr/data/{type}/{UUID}
```

- Master QR: 설비 · 제품 · 재질 · 작업자 · 회사(optional) 같은 고정 Master 대상.
- Data QR: LOT · 입고 · 출고 · 성적서 · 거래명세서 · 발주서 · 반출증 · 문서처럼 필요 시 생성되는 업무/문서 대상.
- Data QR는 on-demand only이며 QR Registry에는 실제 생성된 QR만 저장합니다.

## 7. Workflow

```text
휴대폰 카메라 QR Scan
 → /mobile/qr/{type}/{UUID}
 → QR Registry resolve
 → 대상 정보 조회
 → 현재 상태 + 필요한 작업 표시
 → 작업 버튼 수행
 → 동일 Workflow Engine / API에 반영
```

## 8. Automation

| 사용자 | 시스템 |
|--------|--------|
| QR Scan · 큰 버튼 Tap · 첨부/문서 확인 | UUID resolve · 대상 상태 로드 · 다음 작업 추천 · 작업 결과 저장 |

Future Automation:

- 작업 시작 / 종료 기록
- 설비 상태 자동 변경
- LOT 진행 상태 자동 반영
- 검사 결과 조회/등록
- 사진 업로드 metadata 저장
- 전자서명/승인 이력 저장

## 9. Connected Screens

- QR Registry
- 설비관리 / 설비현황
- LOT Lifecycle
- 생산관리
- 검사관리
- 성적서관리
- 출고관리
- 문서관리 / 첨부파일

Mobile Portal은 별도 관리 메뉴가 아니라 QR 기반 진입 화면입니다.

## 10. Output

기본 출력물 없음.  
향후 모바일 확인 이력, 사진 업로드, 전자서명, 작업 승인 기록을 이력/문서 출력에 연결할 수 있습니다.

## 11. Freeze Criteria

- [ ] Desktop / Mobile UI 분리 유지
- [ ] Mobile Portal에 Sidebar · Dashboard · Launcher 없음
- [ ] QR payload / QR URL이 Mobile Portal 주소 사용
- [ ] 설비 · LOT · 작업자 · 문서별 Summary + Action 정의 완료
- [ ] 큰 터치 버튼 / 카드형 / 세로 스크롤 UI 기준 확정
- [ ] 동일 API · DB · Workflow Engine 연동 정책 확정
- [ ] Foundation Mobile Component 기준 확정
- [ ] PM 승인 후 구현 착수

---

## Roadmap Position

```text
Phase 1 — Architecture + Blueprint ✅
Phase 2 — Workspace Implementation
Phase 3 — Inspection Report Engine
Phase 4 — Document / Form Engine
Phase 5 — QR / Mobile / AI  ← Mobile QR Portal
```

**Implementation Status:** Architecture Only. UI · Router · Store · Foundation 구현은 PM 승인 후 진행합니다.