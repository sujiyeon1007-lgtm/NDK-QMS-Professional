/**
 * Project TITAN V1.0 — 부서별 업무 · 부서 · KPI · 상태
 */

import { Briefcase, CircleCheck, ClipboardList, Clock3, PauseCircle } from "lucide-react";

/** 확장 가능 — 향후 material, purchase, admin 등 추가 */
export const DEPARTMENT_DEFINITIONS = [
  { id: "production", label: "생산부", defaultAssigneeDept: "생산부" },
  { id: "quality", label: "품질부", defaultAssigneeDept: "품질부" },
  { id: "sales", label: "영업부", defaultAssigneeDept: "영업부" },
];

export const DEPARTMENT_TAB_ALL = "all";

export function getDepartmentLabel(departmentId) {
  if (departmentId === DEPARTMENT_TAB_ALL) return "전체";
  return DEPARTMENT_DEFINITIONS.find((item) => item.id === departmentId)?.label ?? departmentId;
}

export function getDepartmentOptions() {
  return DEPARTMENT_DEFINITIONS.map((item) => ({ value: item.id, label: item.label }));
}

export const DEPARTMENT_WORK_STATUS = ["대기", "진행중", "완료", "보류"];

export const DEPARTMENT_WORK_PRIORITY = ["높음", "보통", "낮음"];

export const DEPARTMENT_WORK_STATUS_PANEL = {
  title: "부서별 업무 현황",
  titleIcon: Briefcase,
};

export const DEPARTMENT_WORK_STATUS_CARDS = [
  {
    id: "waiting",
    label: "대기",
    subLabel: "대기 업무",
    icon: Clock3,
    tone: "orange",
  },
  {
    id: "inProgress",
    label: "진행중",
    subLabel: "진행 업무",
    icon: ClipboardList,
    tone: "blue",
  },
  {
    id: "completed",
    label: "완료",
    subLabel: "완료 업무",
    icon: CircleCheck,
    tone: "green",
  },
  {
    id: "hold",
    label: "보류",
    subLabel: "보류 업무",
    icon: PauseCircle,
    tone: "gray",
  },
];

/** 부서별 Tab 기본 업무 예시 (시드 참고) */
export const DEPARTMENT_WORK_EXAMPLES = {
  production: ["생산 예정", "생산 진행", "생산 완료", "설비 점검", "작업 지시 확인"],
  quality: ["검사 대기", "검사 진행", "성적서 등록", "부적합 처리", "고객 대응"],
  sales: ["출고 준비", "거래명세서 확인", "납기 관리", "고객 요청사항"],
};

/** V1.0 미적용 — 향후 환경설정 사용자 관리 연동 */
export const DEFAULT_DEPARTMENT_TAB_BY_ROLE = {
  production: "production",
  quality: "quality",
  sales: "sales",
  admin: DEPARTMENT_TAB_ALL,
};

export function resolveDefaultDepartmentTab(_userRole) {
  return DEPARTMENT_TAB_ALL;
}
