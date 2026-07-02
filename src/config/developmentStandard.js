/**
 * Project TITAN Professional V1.0 — Development Standard (PM 최종 승인)
 * V1.0 official lock: 2026-07-02 — see titanV1DevelopmentDirection.js
 * Cursor 및 개발자 공통 참조 · 변경 시 PM 승인 필요
 */

/** 화면 개발 순서 (V1.0 Standalone QMS — official 2026-07-02) */
export const SCREEN_BUILD_ORDER = [
  "HOME",
  "입고관리",
  "LOT 관리",
  "생산일보",
  "검사등록",
  "외관검사",
  "경도관리",
  "유효경화깊이",
  "조직사진",
  "성적서관리",
  "문서관리",
  "품질이력",
  "통계",
  "환경설정",
];

/** V1.0에서 보류 (V1.1 MES · V2.0 고도화 · 코드 유지) */
export const V1_0_EXCLUDED_SCREENS = [
  "MES 연동",
  "출고관리 (MES 조회)",
  "재고관리",
  "거래명세서",
  "V2.0 Revision Control · Approval Workflow",
];

/** 필수 개발 프로세스 */
export const DEVELOPMENT_PROCESS = [
  "기획",
  "화면 설계",
  "PM 승인",
  "Cursor 개발",
  "테스트",
  "수정",
  "다음 화면",
];

/** 고정 Workflow (V1.0 Standalone QMS · SessionStorage Demo) */
export const WORKFLOW_PHASES = [
  "입고관리",
  "LOT 관리",
  "생산일보",
  "검사등록",
  "외관검사",
  "경도",
  "유효경화깊이",
  "조직사진",
  "성적서",
  "문서관리",
  "QR · Traceability",
  "품질이력",
  "출력물",
];

/** @deprecated SEARCH_ADVANCED_OPEN_LABEL 사용 */
export const SEARCH_ADVANCED_LABEL = "▼ 상세검색";

/** 공통 Layout 영역 */
export const LAYOUT_REGIONS = ["Header", "Sidebar", "Main", "Footer"];

/** Foundation 공통 컴포넌트 (동일 기능 중복 생성 금지) */
export const FOUNDATION_COMPONENTS = [
  "Button",
  "Table",
  "TitanDataTable",
  "TitanSearchPanel",
  "TitanAdvancedSearch",
  "TitanTableFooter",
  "TitanPagination",
  "TitanPageSizeSelector",
  "StatusChip",
  "SearchPanel",
  "Card",
  "CollapsePanel",
  "Input",
];

/** 자동 입력 권장 필드 (관리번호는 MES 생성 · TITAN 조회) */
export const AUTO_FILL_FIELDS = ["등록일", "작성자", "상태"];

/** @deprecated 관리번호는 MES mesManagementNo — TITAN 생성 금지 */
export const MES_MANAGEMENT_NUMBER_FIELD = "mesManagementNo";

/** 신규 기능 테스트 체크리스트 */
export const TEST_CHECKLIST = [
  "UI 깨짐 여부",
  "반응형 여부",
  "데이터 연동",
  "버튼 동작",
  "검색 기능",
  "CRUD 기능",
  "Workflow 연결",
];

/** V1.0 Sprint order (official 2026-07-02) — see titanV1DevelopmentDirection.js SPRINT_PLAN */
export const V1_0_SPRINT_ORDER = [
  "Sprint 3: Print Engine · 성적서 · 출력물 · 문서관리 기본 구조",
  "Sprint 4: 품질접수 · 검사등록 · 경도 · 유효경화깊이 · 조직사진",
  "Sprint 5: 품질이력 · 통계 · Dashboard",
  "Sprint 6: 문서관리 고도화 · QR · PDF · 검색 기능",
  "After PoC: Oracle PoC → MES 연동 여부 → V1.1 MES Connected → V2.0 고도화",
];

/** 개발 철학 (요약) */
export const DEVELOPMENT_PHILOSOPHY = {
  goal: "NDK 품질관리 업무 통합 QMS — 실제 업무에 사용 가능한 독립 실행형 시스템",
  officialDate: "2026-07-02",
  topPriority: "NDK에서 실제 사용할 수 있는 독립 실행형 QMS 완성",
  corePromise: "MES 때문에 흔들리지 않는다",
  officialPolicy: "titanV1DevelopmentDirection.js — V1.0 Standalone Edition",
  v1Direction: "titanV1DevelopmentDirection.js — SessionStorage Demo · MES 연동 V1.1",
  demoAdmin: "demoAdminPolicy.js — DEMO_ADMIN_MODE=true (V1.1 Role 교체)",
  platformVision: "V1.0 QMS → V1.1 MES → V2.0 Document/Traceability",
  editionArchitecture: "V1.0: Standalone · MES Connected on hold until V1.1",
  architecture: "Core Platform · Edition · Repository · Data Source",
  v1Principles: [
    "현재 Sprint에서는 MES 연동을 구현하지 않는다",
    "NDK에서 실제 사용할 수 있는 QMS를 완성한다",
    "MES 연동은 Repository 구조 유지 · V1.1에서 진행",
    "UI와 Workflow를 먼저 완성 (SessionStorage Demo)",
    "기존 설계 유지, 불필요한 변경 금지",
  ],
  principles: [
    "실제 업무 중심",
    "리스트 중심",
    "최소 입력",
    "최대 조회",
    "공통 컴포넌트 재사용",
    "단순하고 직관적인 UI",
    "유지보수가 쉬운 구조",
    "확장 가능한 구조",
  ],
};
