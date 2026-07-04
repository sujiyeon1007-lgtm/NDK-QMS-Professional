/**
 * Project TITAN PQMS — UI Layout Standard V1.0 (최종 확정)
 * ERP/MES: 레이아웃 고정 · 반응형 축소 ❌ · 스크롤 처리
 * @see src/foundation/styles/titan-ui-standard.css
 */

export const TITAN_UI_LAYOUT_STANDARD_VERSION = "V1.0";
export const TITAN_UI_LAYOUT_STANDARD_DATE = "2026-07-03";
export const TITAN_UI_LAYOUT_STANDARD_LOCKED = true;

/** 지원 해상도 — 레이아웃 동일 · 스크롤만 생성 */
export const TITAN_UI_VIEWPORT_BASELINES = [
  "1920×1080",
  "1600×900",
  "1440×900",
  "1366×768",
  "태블릿",
  "휴대폰",
];

export const TITAN_UI_ZOOM_BASELINES = ["80%", "100%", "125%", "150%"];

/** @type {Record<string, string>} */
export const TITAN_UI_DIMENSIONS = {
  appMinWidth: "var(--titan-app-min-width)",
  controlHeight: "var(--titan-control-h)",
  buttonMinHeight: "var(--titan-btn-min-h)",
  buttonGap: "var(--titan-btn-gap)",
  searchFieldWidth: "var(--titan-search-field-w)",
  searchFieldsMinWidth: "var(--titan-search-fields-min-w)",
  tableRowMinHeight: "var(--titan-table-row-min-h)",
  cardPadding: "var(--titan-card-padding)",
  gridGap: "var(--titan-grid-gap-standard)",
  popupWidth: "var(--titan-popup-width)",
  popupHeight: "var(--titan-popup-height)",
  popupMaxWidth: "var(--titan-popup-max-width)",
  popupMaxHeight: "var(--titan-popup-max-height)",
  popupMinWidth: "var(--titan-popup-min-width)",
  popupMinHeight: "var(--titan-popup-min-height)",
  workspaceModalWidth: "var(--titan-popup-width)",
  workspaceModalHeight: "var(--titan-popup-height)",
  leftWidgetWidth: "var(--titan-left-widget-width)",
  leftWidgetWidthMax: "var(--titan-left-widget-width-max)",
  popupSplitMinWidth: "var(--titan-popup-split-min-w)",
};

/** Popup Standard V1.0 — TitanWorkspaceModal / TitanAppDialog */
export const TITAN_POPUP_STANDARD = {
  version: "V1.0",
  component: "TitanWorkspaceModal",
  alias: "TitanAppDialog",
  portal: "document.body",
  bodyScrollLock: true,
  width: "90vw",
  height: "90vh",
  maxWidth: "1800px",
  maxHeight: "95vh",
  minWidth: "1400px",
  minHeight: "800px",
  shrinkContent: false,
  scroll: "popup internal only — table region flex:1 overflow auto",
  slots: ["header", "toolbar", "search", "table", "footer", "detail"],
};

/** UI Layout Standard V1.0 — 핵심 원칙 */
export const TITAN_UI_LAYOUT_POLICY = {
  paradigm: "ERP/MES — 레이아웃 고정 + 스크롤",
  responsiveCompression: false,
  layoutChangeOnResize: false,
  scrollStrategy: "viewport 또는 컨테이너 overflow auto — 겹침/잘림 금지",
  popup: TITAN_POPUP_STANDARD,
  development: "페이지별 수정 ❌ — titan-ui-standard.css · TitanWorkspaceModal 먼저",
};

export const TITAN_UI_STANDARD_RULES = [
  "레이아웃은 모든 해상도에서 동일 — 버튼/검색/Table/Popup 크기 자동 축소 ❌",
  "viewport 또는 영역이 좁으면 가로·세로 스크롤 생성",
  "검색: 1행 고정 · 필드 150px · 좁으면 titan-search-panel 가로 스크롤",
  "리스트+상세: 2단 Grid 고정 · side panel 스택 ❌",
  "Popup: 90vw×90vh (max 1800×95vh, min layout 1400×800) · Portal · 내부 scroll",
  "버튼/Input/Table Row 높이 tokens 통일",
  "Container query · @media layout 변경 ❌ (KPI grid 고정 등 desktop-layout 예외만)",
];

export const TITAN_UI_QA_SCREENS = [
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

export const TITAN_UI_QA_CHECKLIST = [
  "검색창과 버튼 겹침 없음",
  "Input/Button 잘림·overflow 없음",
  "Table Header/Body 정렬",
  "좌우 Panel 높이 동일",
  "Popup Portal · Popup 내부 스크롤만 · clipping 없음",
  "Padding/Margin/Grid Gap 통일",
  "1920×1080 · 1366×768 · Zoom 80~150%",
  "Overlap · Cut · Layout break · Scroll error 없음",
];

/** @deprecated use TITAN_UI_LAYOUT_STANDARD_VERSION */
export const TITAN_UI_STANDARD_VERSION = TITAN_UI_LAYOUT_STANDARD_VERSION;
