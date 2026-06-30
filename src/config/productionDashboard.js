/**
 * Project TITAN V1.0 — 생산관리 KPI · 조회 기준 구성
 */

import { CircleCheck, Clock3, Cog, Factory, AlertTriangle, TrendingUp } from "lucide-react";

/** @typedef {'blue' | 'orange' | 'green' | 'purple'} ProductionKpiTone */

/** @type {{ id: string, label: string, subLabel: string, icon: import("react").ComponentType, tone: ProductionKpiTone, to?: string }} */
export const PRODUCTION_DAILY_STATUS_CARDS = [
  {
    id: "prodWaiting",
    label: "생산 대기",
    subLabel: "생산 예정 건",
    icon: Clock3,
    tone: "blue",
    to: "/production/daily-report",
  },
  {
    id: "prodProgress",
    label: "생산 진행",
    subLabel: "작업 진행 중",
    icon: Cog,
    tone: "green",
    to: "/production/daily-report",
  },
  {
    id: "prodDone",
    label: "생산 완료",
    subLabel: "생산 완료 건",
    icon: CircleCheck,
    tone: "purple",
    to: "/production/daily-report",
  },
];

export const PRODUCTION_RESULTS_METRIC_CARDS = [
  { id: "todayQty", label: "금일 생산량", subLabel: "금일 완료 수량", icon: Factory, tone: "blue" },
  { id: "weekQty", label: "주간 생산량", subLabel: "금주 완료 수량", icon: TrendingUp, tone: "green" },
  { id: "monthQty", label: "월간 생산량", subLabel: "금월 완료 수량", icon: Cog, tone: "purple" },
  { id: "completionRate", label: "생산 완료율", subLabel: "입고 대비 완료", icon: CircleCheck, tone: "orange" },
];

export const DEFECT_STATUS_METRIC_CARDS = [
  { id: "todayDefect", label: "금일 불량", subLabel: "금일 불량 수량", icon: AlertTriangle, tone: "orange" },
  { id: "weekDefect", label: "주간 불량", subLabel: "금주 불량 수량", icon: AlertTriangle, tone: "blue" },
  { id: "monthDefect", label: "월간 불량", subLabel: "금월 불량 수량", icon: AlertTriangle, tone: "purple" },
  { id: "defectRate", label: "불량률", subLabel: "생산 대비 불량", icon: TrendingUp, tone: "green" },
];

export const ANALYSIS_DIMENSIONS = [
  { id: "equipment", label: "설비별", field: "equipment" },
  { id: "company", label: "업체별", field: "company" },
  { id: "material", label: "재질별", field: "material" },
  { id: "process", label: "공정별", field: "process" },
];

export const ANALYSIS_PERIODS = [
  { id: "day", label: "일간" },
  { id: "week", label: "주간" },
  { id: "month", label: "월간" },
  { id: "year", label: "연간" },
];

export const PRODUCTION_DAILY_STATUS_PANEL = {
  title: "생산 현황",
  titleIcon: Factory,
};

export const PRODUCTION_RESULTS_STATUS_PANEL = {
  title: "생산 현황",
  titleIcon: Factory,
};

export const DEFECT_STATUS_PANEL = {
  title: "불량 현황",
  titleIcon: AlertTriangle,
};
