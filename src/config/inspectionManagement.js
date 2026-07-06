/**
 * Project TITAN V1.3 — 검사관리 3탭 (양산 · 개발 · 기타)
 */

export const INSPECTION_MANAGEMENT_TABS = [
  { id: "mass", label: "양산검사", path: "/quality/inspection/mass" },
  { id: "dev", label: "개발검사", path: "/quality/inspection/dev" },
  { id: "other", label: "기타검사", path: "/quality/inspection/other" },
];

export const INSPECTION_TAB_IDS = INSPECTION_MANAGEMENT_TABS.map((tab) => tab.id);

export const MASS_INSPECTION_STATUS = {
  NOT_DONE: "미검사",
  DONE: "검사완료",
  /** @deprecated */
  WAIT: "미검사",
};

export const MASS_INSPECTION_STATUS_OPTIONS = ["미검사", "검사완료"];

export const DEVELOPMENT_INSPECTION_STATUS = ["대기", "진행중", "완료", "보류"];

export const OTHER_INSPECTION_STATUS = ["대기", "진행중", "완료", "보류"];

export const OTHER_INSPECTION_CATEGORIES = [
  { value: "업체의뢰", label: "업체의뢰" },
  { value: "자체검사", label: "자체검사" },
  { value: "설비", label: "설비" },
  { value: "게이지", label: "게이지" },
  { value: "시험편", label: "시험편" },
  { value: "기타", label: "기타" },
];

export const RESERVED_INSPECTION_ROUTE_PARAMS = ["register"];

export function resolveInspectionTab(tabParam) {
  if (RESERVED_INSPECTION_ROUTE_PARAMS.includes(tabParam)) return null;
  if (INSPECTION_TAB_IDS.includes(tabParam)) return tabParam;
  return "mass";
}

export function getInspectionTabDef(tabId) {
  return INSPECTION_MANAGEMENT_TABS.find((tab) => tab.id === tabId) ?? INSPECTION_MANAGEMENT_TABS[0];
}
