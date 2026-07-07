/**
 * Project TITAN V1.3 — Screen UI Status Registry
 * 🟢 UI Freeze · 🟡 In Progress · 🔵 Planning
 *
 * HOME = Reference Screen (디자인 기준 화면)
 * @see .cursor/rules/project-titan-ui-freeze-v1.3.mdc
 */

/** @typedef {'ui-freeze' | 'in-progress' | 'planning'} ScreenUiStatusId */

/** @typedef {{ id: ScreenUiStatusId, label: string, emoji: string, description: string }} ScreenUiStatusMeta */

export const SCREEN_UI_STATUS = {
  UI_FREEZE: {
    id: "ui-freeze",
    label: "UI Freeze",
    emoji: "🟢",
    description: "디자인 확정 — 레이아웃·색상·배치 변경 금지, 기능 추가만 허용",
  },
  IN_PROGRESS: {
    id: "in-progress",
    label: "In Progress",
    emoji: "🟡",
    description: "UI/UX 수정 중 — HOME 디자인 언어에 맞춰 개선",
  },
  PLANNING: {
    id: "planning",
    label: "Planning",
    emoji: "🔵",
    description: "설계 단계 — PM 승인 후 구현",
  },
};

/** @type {Readonly<Record<string, ScreenUiStatusId>>} */
export const SCREEN_UI_STATUS_BY_KEY = {
  home: "ui-freeze",
  login: "ui-freeze",
  inbound: "in-progress",
  dailyProductionReport: "ui-freeze",
  inspection: "in-progress",
  certificate: "in-progress",
  outbound: "in-progress",
  inventory: "in-progress",
  workJournal: "in-progress",
  documents: "in-progress",
  qr: "planning",
  masterData: "in-progress",
  admin: "in-progress",
};

/** HOME을 기준으로 통일할 디자인 언어 */
export const HOME_REFERENCE_DESIGN_LANGUAGE = [
  "검색창 디자인",
  "KPI 디자인",
  "버튼 스타일",
  "Widget 스타일",
  "여백",
  "폰트",
  "색상",
  "테이블 디자인",
];

/** @param {string} screenKey */
export function getScreenUiStatus(screenKey) {
  const id = SCREEN_UI_STATUS_BY_KEY[screenKey] ?? "in-progress";
  return Object.values(SCREEN_UI_STATUS).find((item) => item.id === id) ?? SCREEN_UI_STATUS.IN_PROGRESS;
}

/** @param {string} screenKey */
export function isUiFrozen(screenKey) {
  return getScreenUiStatus(screenKey).id === "ui-freeze";
}

/** Cursor · 개발자용 요약 테이블 */
export const SCREEN_UI_STATUS_TABLE = [
  { screen: "HOME Dashboard (V1.5 Hub UI Freeze)", key: "home", status: "ui-freeze" },
  { screen: "로그인", key: "login", status: "ui-freeze" },
  { screen: "기준정보관리", key: "masterData", status: "in-progress" },
  { screen: "입고관리", key: "inbound", status: "in-progress" },
  { screen: "열처리일보", key: "dailyProductionReport", status: "ui-freeze" },
  { screen: "검사관리", key: "inspection", status: "in-progress" },
  { screen: "성적서관리", key: "certificate", status: "in-progress" },
  { screen: "출고관리", key: "outbound", status: "in-progress" },
  { screen: "재고관리", key: "inventory", status: "in-progress" },
  { screen: "업무일지", key: "workJournal", status: "in-progress" },
  { screen: "문서관리", key: "documents", status: "in-progress" },
  { screen: "QR관리", key: "qr", status: "planning" },
  { screen: "관리자", key: "admin", status: "in-progress" },
];
