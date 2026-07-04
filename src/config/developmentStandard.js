/**
 * Project TITAN Professional — Development Standard (PM 최종 승인)
 * Version 3 PQMS · Presentation Build framework: 2026-07-03 — see titanV1DevelopmentDirection.js
 * Cursor 및 개발자 공통 참조 · 변경 시 PM 승인 필요
 */

/** Presentation Version polish priorities — see PRESENTATION_VERSION_PRIORITIES */
export const SCREEN_BUILD_ORDER = [
  "HOME",
  "입고현황",
  "작업일보",
  "품질관리",
  "문서관리",
  "기준정보관리",
  "출고현황",
  "이력조회",
  "환경설정",
  "출력물",
];

/** Version 1 / Version 2 Architecture Roadmap only (코드 유지 · Version 3 = 현재 구현) */
export const V1_0_EXCLUDED_SCREENS = [
  "Version 1 — MES 완전 연동",
  "Version 1 — Oracle Repository",
  "Version 2 — MES + TITAN Hybrid 협업",
];

/**
 * 설계 승인 = UI 반영 — Config/Rule만 변경하고 실제 화면 미반영은 미완료
 * @see .cursor/rules/project-titan-development-standard.mdc
 */
export const DESIGN_APPROVAL_UI_SYNC_PRINCIPLE =
  "설계 승인 = Rule · Config · Sidebar · Route · Page(UI) 동시 반영. Rule/Config만 변경하고 UI 미반영은 미완료.";

/** 기능·메뉴·설계 변경 완료 체크리스트 */
export const COMPLETION_CHECKLIST = [
  "Rule (.cursor/rules)",
  "Config (src/config)",
  "Workflow",
  "Sidebar",
  "Route",
  "Page (UI)",
  "browser verify",
  "npm run build",
];

/** UI Layout Standard V1.0 — @see src/config/titanUiStandard.js · titan-ui-standard.css */
export const UI_LAYOUT_STANDARD_V1 =
  "ERP/MES: 레이아웃 고정 · 축소/반응형 ❌ · 스크롤 처리 · 공통 Component 먼저 수정";

/** V1.3 UI Freeze · Reference Screen — @see src/config/screenUiStatus.js */
export {
  SCREEN_UI_STATUS,
  SCREEN_UI_STATUS_BY_KEY,
  SCREEN_UI_STATUS_TABLE,
  HOME_REFERENCE_DESIGN_LANGUAGE,
  getScreenUiStatus,
  isUiFrozen,
} from "./screenUiStatus.js";

/** HOME = 디자인 기준 화면 (Reference Screen) · V1.3 UI Freeze */
export const HOME_REFERENCE_SCREEN_POLICY =
  "HOME Dashboard V1.3 UI Freeze — 레이아웃·Widget·색상 변경 금지, 기능 추가만. 나머지 화면은 HOME 디자인 언어로 통일.";

/** @deprecated use UI_LAYOUT_STANDARD_V1 */
export const UI_STANDARD_POLICY = UI_LAYOUT_STANDARD_V1;

/** Hub + Modal UI 정책 — 기준정보관리 · 문서관리 */
export const HUB_MODAL_UI_POLICY =
  "Hub + TitanWorkspaceModal(Popup V1.0 · 90vw×90vh Portal). overlap → titan-ui-standard.css 공통 scroll/layout.";

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

/** 오류 수정 · 긴급 복구 프로세스 (V1.3) — 분석 없이 수정 금지 */
export const INCIDENT_FIX_PROCESS = [
  "원인 분석 (Console · Router · 최근 변경 · 무한 렌더 · Mock 예외)",
  "영향 범위 분석",
  "수정 계획 보고",
  "최소 범위 수정",
  "Regression Test",
  "npm run build",
  "최종 보고 (수정 파일 · 원인 · 테스트 · Build · 영향 페이지)",
];

/** @deprecated INCIDENT_FIX_PROCESS — 동일 절차 */
export const BUG_FIX_PROCESS = INCIDENT_FIX_PROCESS;

/**
 * Project TITAN 공식 개발 프로세스 (V1.3 최종)
 * 분석 → 보고 → 승인 → 최소 수정 → Build → 실행 테스트 → Regression → Commit → 다음 작업
 */
export const OFFICIAL_DEVELOPMENT_PROCESS = [
  "분석",
  "원인·영향 보고",
  "PM 승인",
  "최소 범위 수정",
  "npm run build",
  "실행 테스트 (해당 화면)",
  "Regression Test",
  "Git Commit",
  "다음 작업",
];

/**
 * 화면·기능 단위 작업 순서 — 한 번에 여러 페이지 수정 금지
 * @example 검사관리 수정 → Build → 실행 테스트 → Commit → 다음 화면
 */
export const SINGLE_SCREEN_WORKFLOW = [
  "단일 화면/기능 수정",
  "npm run build",
  "실행 테스트 (해당 화면)",
  "Regression Test",
  "Git Commit",
  "다음 화면",
];

/** 매 작업 후 필수 Regression Test */
export const REGRESSION_TEST_CHECKLIST = [
  "HOME 정상",
  "로그인 정상",
  "Sidebar 정상",
  "Router 정상",
  "모든 메뉴 진입 가능",
  "White Screen 없음",
  "Console Error = 0",
];

/** Beta 사이트 배포 후 필수 확인 (Vercel · ndk-qms-beta.vercel.app) */
export const BETA_SITE_VERIFICATION_CHECKLIST = [
  "로그인 정상",
  "HOME 정상",
  "입고관리 정상",
  "생산관리 정상",
  "검사관리 정상",
  "성적서관리 정상",
  "출고관리 정상",
  "문서관리 정상",
  "QR관리 정상",
  "White Screen 없음",
  "Console Error = 0",
];

/**
 * 공식 개발 → Beta 배포 Flow (V1.3)
 * Build 성공 · Regression 통과 후에만 beta-demo push
 */
export const OFFICIAL_RELEASE_FLOW = [
  "개발 (단일 화면/기능)",
  "npm run build",
  "Regression Test (localhost/preview)",
  "Git Commit",
  "Git Push (presentation)",
  "beta-demo 브랜치 동기화 · Push",
  "Vercel Beta 자동 배포",
  "Beta 사이트 동작 확인",
  "작업 완료",
];

/**
 * 공통 컴포넌트 수정 시 — 영향받는 모든 페이지 테스트 후에만 완료
 * (TitanDataTable · TitanSearchPanel · TitanScreenDetailPopup · TitanTableRowActions 등)
 */
export const SHARED_COMPONENT_CHANGE_POLICY = {
  rule: "공통 컴포넌트 수정 = 전체 영향 — 사용 페이지 전수 테스트 + 결과 보고 필수",
  reportFields: ["수정 컴포넌트", "영향 페이지 목록", "페이지별 테스트 결과", "Build 결과"],
  completionBlockedUntil: "영향 페이지 Regression Test 완료",
};

export const WORKFLOW_PHASES = [
  "HOME",
  "입고현황",
  "작업일보",
  "품질관리",
  "문서관리",
  "기준정보관리",
  "출고현황",
  "이력조회",
  "환경설정",
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

/**
 * 신규 메뉴 추가 · 메뉴명 변경 시 필수 체크리스트 (PQMS 공식 Development Standard)
 * @see .cursor/rules/project-titan-development-standard.mdc
 */
export const MENU_ADDITION_CHECKLIST = [
  "Sidebar 메뉴 등록",
  "Router(Route) 등록",
  "Page 생성 (JSX / CSS)",
  "Menu Config 등록",
  "Header / Breadcrumb 연결",
  "권한(Role) 연결",
  "검색(Search) 연결 여부 확인",
  "메뉴 Active 상태 확인",
  "Placeholder 또는 기본 화면 생성",
  "Build 정상 통과 확인",
  "npm run build 성공 확인 후 완료 처리",
];

/** Presentation Sprint order — see titanV1DevelopmentDirection.js SPRINT_PLAN */
export const V1_0_SPRINT_ORDER = [
  "Sprint 1: HOME Dashboard Polish · 입고관리 Workflow",
  "Sprint 2: 검사등록 · 성적서관리 · Print Engine · PDF/Preview",
  "Sprint 3: 문서관리 · 출고관리 · 거래명세서 · 출력물",
  "Sprint 4: 품질이력 · QR 구조 · 통계 · Dashboard Polish",
  "Version 1 Gate (ON HOLD): 정부/MES 방향 · Oracle PoC → Version 1 MES Connected",
];

/** 개발 철학 (요약) */
export const DEVELOPMENT_PHILOSOPHY = {
  goal: "Version 3 NDK PQMS (Presentation Version) — NDK 1공장 생산·품질 업무 통합 구축 · CEO Demo 시연",
  officialDate: "2026-07-03",
  currentVersion: "v3",
  buildLabel: "Version 3 — NDK Production & Quality Management System (Presentation Version)",
  topPriority: "Version 3 PQMS Presentation Version · CEO Demo · 내부 검토 완성",
  corePromise: "Version 3 PQMS(Presentation Version)만 구현 — Version 1·2 Architecture Roadmap only",
  officialPolicy: "titanV1DevelopmentDirection.js — Version 3 PQMS · Presentation Build",
  v1Direction: "titanV1DevelopmentDirection.js — SessionStorage Demo · V1/V2 roadmap only",
  demoAdmin: "demoAdminPolicy.js — DEMO_ADMIN_MODE=true",
  deployment: "titanDeploymentPolicy.js — localhost 개발 · Vercel Beta CEO Demo · Sprint 후 push",
  platformVision:
    "Version 1 MES 완전 연동 (long-term) → Version 2 MES+TITAN 협업 (future-review) → Version 3 NDK PQMS (Presentation Version) ★ (CURRENT)",
  editionArchitecture: "Version 3: NDK PQMS Presentation Version · Version 1·2 = roadmap only",
  architecture: "Core Platform · Edition · Repository · Data Source",
  v1Principles: [
    "Version 3(PQMS Presentation Version)만 개발한다",
    "Version 1·2는 Architecture Roadmap 문서만 — Oracle/MES 연동 구현 ❌",
    "Presentation Build = Version 3 delivery label (별도 architecture version ❌)",
    "SessionStorage · UI/UX·Workflow·화면 Polish 우선",
    "CRUD · PDF/Preview · Demo 데이터 · Demo-ready",
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
