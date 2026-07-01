/**
 * HOME Dashboard — PM V1.0 승인 KPI Panel 구성 (시안 기준)
 */

import {
  Package,
  Truck,
  ShoppingCart,
  Factory,
  ShieldCheck,
  Clock3,
  Cog,
  CircleCheck,
  Search,
  ClipboardCheck,
} from "lucide-react";

/** @typedef {'blue' | 'orange' | 'green' | 'purple'} KpiTone */
/** @typedef {{ id: string, label: string, subLabel: string, icon: import("react").ComponentType, to: string, tone: KpiTone }} HomeKpiCardDef */
/** @typedef {{ id: string, title: string, titleIcon: import("react").ComponentType, footerLabel: string, footerTo: string, cards: HomeKpiCardDef[] }} HomeKpiPanelDef */

/** @type {HomeKpiPanelDef[]} */
export const HOME_STATUS_GROUPS = [
  {
    id: "inout",
    title: "입출고 현황",
    titleIcon: Truck,
    footerLabel: "입출고관리 바로가기",
    footerTo: "/inout/incoming",
    cards: [
      {
        id: "incomingDone",
        label: "입고 완료",
        subLabel: "입고 완료 건",
        icon: Package,
        to: "/inout/incoming",
        tone: "blue",
      },
      {
        id: "shipWaiting",
        label: "출고대기",
        subLabel: "출고 대기 건",
        icon: ShoppingCart,
        to: "/inout/shipment",
        tone: "orange",
      },
      {
        id: "shipDone",
        label: "출고 완료",
        subLabel: "출고 완료 건",
        icon: Truck,
        to: "/inout/shipment",
        tone: "green",
      },
    ],
  },
  {
    id: "production",
    title: "생산 현황",
    titleIcon: Factory,
    footerLabel: "생산관리 바로가기",
    footerTo: "/production/daily-report",
    cards: [
      {
        id: "prodWaiting",
        label: "생산 대기",
        subLabel: "생산 예정 건",
        icon: Clock3,
        to: "/production/daily-report",
        tone: "blue",
      },
      {
        id: "prodProgress",
        label: "생산 진행",
        subLabel: "작업 진행 중",
        icon: Cog,
        to: "/production/daily-report",
        tone: "green",
      },
      {
        id: "prodDone",
        label: "생산 완료",
        subLabel: "생산 완료 건",
        icon: CircleCheck,
        to: "/production/results",
        tone: "purple",
      },
    ],
  },
  {
    id: "quality",
    title: "품질현황",
    titleIcon: ShieldCheck,
    footerLabel: "품질관리 바로가기",
    footerTo: "/quality/inspection",
    cards: [
      {
        id: "inspectWaiting",
        label: "검사대기",
        subLabel: "검사 예정 건",
        icon: Search,
        to: "/quality/inspection",
        tone: "blue",
      },
      {
        id: "inspectDone",
        label: "검사완료",
        subLabel: "검사 완료 건",
        icon: ClipboardCheck,
        to: "/quality/inspection",
        tone: "green",
      },
      {
        id: "certDone",
        label: "성적서 완료",
        subLabel: "성적서 발행 건",
        icon: CircleCheck,
        to: "/quality/certificate",
        tone: "purple",
      },
    ],
  },
];

export const HOME_PAGE_META = {
  title: "HOME",
  description: "출근 후 가장 먼저 확인하는 실시간 업무 상황판입니다.",
};

/** HOME 우측 상단 KPI (금일 핵심 현황 5종) */
export const HOME_TOP_KPI_CARDS = [
  {
    id: "todayIncoming",
    label: "금일 입고",
    subLabel: "금일 입고 건",
    icon: Package,
    to: "/inout/incoming",
    tone: "blue",
  },
  {
    id: "prodProgress",
    label: "생산 진행",
    subLabel: "진행 중",
    icon: Cog,
    to: "/production/daily-report",
    tone: "green",
  },
  {
    id: "inspectWait",
    label: "검사 대기",
    subLabel: "검사 대기 건",
    icon: Search,
    to: "/quality/inspection",
    tone: "blue",
  },
  {
    id: "shipScheduled",
    label: "출고 예정",
    subLabel: "출고 예정 건",
    icon: ShoppingCart,
    to: "/inout/shipment",
    tone: "orange",
  },
  {
    id: "certWait",
    label: "성적서 대기",
    subLabel: "등록 대기",
    icon: Clock3,
    to: "/quality/certificate",
    tone: "purple",
  },
];

/** HOME 제품 진행 Workflow 단계 (입고 → 출고완료) */
export const HOME_WORKFLOW_PHASES = [
  { key: "incoming", label: "입고" },
  { key: "production", label: "생산중" },
  { key: "inspection", label: "검사" },
  { key: "certificate", label: "성적서" },
  { key: "shipment", label: "출고완료" },
];

export const HOME_WORKFLOW_PREVIEW_LIMIT = 15;

export const HOME_WORKFLOW_FULL_VIEW_PATH = "/inout/incoming";

/** Status Chip KPI — @deprecated statusChipConfigs.js WORKFLOW_CHIP_STATUS_FILTER */
export { WORKFLOW_CHIP_STATUS_FILTER } from "./statusChipConfigs";
export const HOME_NOTICES_PREVIEW_LIMIT = 3;
export const HOME_NOTICES_FULL_VIEW_PATH = "/notices";

/** HOME 업무일정 — 미리보기 건수 */
export const HOME_WORK_SCHEDULE_PREVIEW_LIMIT = 5;

/** @deprecated HOME_WORK_SCHEDULE_PREVIEW_LIMIT 사용 */
export const HOME_TODO_PREVIEW_LIMIT = HOME_WORK_SCHEDULE_PREVIEW_LIMIT;

/** HOME 좌측 현황 요약 Tab — 2×2 그리드 순서 (1행: 생산·입출고 / 2행: 검사·성적서) */
export const HOME_STATUS_SUMMARY_TABS = [
  { id: "production", label: "생산현황" },
  { id: "inout", label: "입출고현황" },
  { id: "inspection", label: "검사현황" },
  { id: "certificate", label: "성적서현황" },
];

export const HOME_WORKFLOW_STATUS_OPTIONS = [
  "입고대기",
  "입고완료",
  "생산대기",
  "생산중",
  "생산완료",
  "검사대기",
  "검사중",
  "검사완료",
  "성적서등록대기",
  "성적서완료",
  "출고대기",
  "출고완료",
];

export const HOME_RECENT_TABS = [
  { id: "incoming", label: "입고" },
  { id: "production", label: "생산중" },
  { id: "inspection", label: "검사" },
  { id: "certificate", label: "성적서" },
  { id: "shipment", label: "출고완료" },
];

export const HOME_PRODUCTION_PERIODS = [
  { id: "today", label: "금일" },
  { id: "week", label: "주간" },
  { id: "month", label: "월간" },
];

export const HOME_QUICK_MENUS = [
  { id: "incoming", label: "입고등록", to: "/inout/incoming" },
  { id: "daily", label: "생산일보", to: "/production/daily-report" },
  { id: "inspection", label: "검사등록", to: "/quality/inspection/register" },
  { id: "certificate", label: "성적서관리", to: "/quality/certificate" },
  { id: "shipment", label: "출고등록", to: "/inout/shipment" },
];

export const HOME_RECENT_LIST_TITLE = "최근 등록현황";
export const HOME_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
