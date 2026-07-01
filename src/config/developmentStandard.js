/**
 * Project TITAN Professional V1.0 — Development Standard (PM 최종 승인)
 * Cursor 및 개발자 공통 참조 · 변경 시 PM 승인 필요
 */

/** 화면 개발 순서 (한 번에 하나씩) */
export const SCREEN_BUILD_ORDER = [
  "HOME",
  "입출고관리",
  "생산관리",
  "품질관리",
  "부서별 업무",
  "통계자료",
  "기준정보관리",
  "환경설정",
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

/** 고정 Workflow (변경 금지) — 대분류 */
export const WORKFLOW_PHASES = ["입고", "생산", "품질", "출고", "통계"];

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

/** 자동 입력 권장 필드 */
export const AUTO_FILL_FIELDS = ["관리번호", "등록일", "작성자", "상태"];

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

/** 개발 철학 (요약) */
export const DEVELOPMENT_PHILOSOPHY = {
  goal: "실제 엔디케이 업무를 가장 쉽고 빠르게 처리",
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
