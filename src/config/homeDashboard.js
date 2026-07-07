/** HOME Dashboard — Presentation Build V1.3 (PQMS Control Tower) */

import {
  Package,
  Truck,
  Boxes,
  Cog,
  Search,
  ShoppingCart,
  Factory,
  ShieldCheck,
  CircleCheck,
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
    footerLabel: "입고현황 바로가기",
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
    title: "열처리 현황",
    titleIcon: Factory,
    footerLabel: "열처리일보 바로가기",
    footerTo: "/production/daily-report",
    cards: [
      {
        id: "prodProgress",
        label: "열처리 진행",
        subLabel: "작업 진행 중",
        icon: Cog,
        to: "/production/daily-report",
        tone: "green",
      },
      {
        id: "prodDone",
        label: "열처리 완료",
        subLabel: "열처리 완료 건",
        icon: CircleCheck,
        to: "/production/daily-report",
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
  kicker: "Project TITAN · Integrated Hub",
  description: "현재 회사 상황 요약 · 업무 바로가기 · Timeline",
};

/** HOME 금일 업무현황 — V1.4 Workflow KPI (6 waiting stages) */
export const HOME_TODAY_WORK_CARDS = [
  {
    summaryId: "RECEIVED",
    label: "입고등록",
    subLabel: "입고 등록",
    icon: Package,
    to: "/inout/incoming",
    tone: "incoming",
  },
  {
    summaryId: "HT_WAIT",
    label: "열처리 대기",
    subLabel: "열처리 대기",
    icon: Cog,
    to: "/production/daily-report",
    tone: "production",
  },
  {
    summaryId: "HT_RUNNING",
    label: "열처리 중",
    subLabel: "열처리 진행",
    icon: Cog,
    to: "/production/daily-report",
    tone: "production",
  },
  {
    summaryId: "INSPECTION_WAIT",
    label: "검사 대기",
    subLabel: "검사 대기",
    icon: Search,
    to: "/quality/inspection",
    tone: "inspection",
  },
  {
    summaryId: "CERT_WAIT",
    label: "성적서 대기",
    subLabel: "성적서 대기",
    icon: ClipboardCheck,
    to: "/quality/certificate",
    tone: "certificate",
  },
  {
    summaryId: "SHIP_WAIT",
    label: "출고 대기",
    subLabel: "출고 대기",
    icon: Truck,
    to: "/inout/shipment",
    tone: "shipment",
  },
];

/** HOME 상단 KPI — Presentation V1.3 (5종) */
export const HOME_TOP_KPI_CARDS = [
  {
    id: "todayIncoming",
    label: "금일 입고",
    subLabel: "금일 신규 등록",
    icon: Package,
    to: "/inout/incoming",
    tone: "blue",
    countSuffix: "건",
  },
  {
    id: "currentStock",
    label: "현재 재고",
    subLabel: "보유 수량",
    icon: Boxes,
    to: "/inventory",
    tone: "green",
    countSuffix: "",
  },
  {
    id: "workProgress",
    label: "작업 진행",
    subLabel: "작업 중 LOT",
    icon: Cog,
    to: "/production/daily-report",
    tone: "orange",
    countSuffix: "건",
  },
  {
    id: "inspectWait",
    label: "검사 대기",
    subLabel: "검사 대기 건",
    icon: Search,
    to: "/quality/inspection",
    tone: "blue",
    countSuffix: "건",
  },
  {
    id: "todayShipment",
    label: "금일 출고",
    subLabel: "금일 출고 완료",
    icon: Truck,
    to: "/inout/shipment",
    tone: "purple",
    countSuffix: "건",
  },
];

/** HOME 제품 진행 Workflow 단계 (V1.4 · 9-stage · 영문 Key) */
export const HOME_WORKFLOW_PHASES = [
  { key: "RECEIVED", label: "입고등록" },
  { key: "HT_WAIT", label: "열처리 대기" },
  { key: "HT_RUNNING", label: "열처리 중" },
  { key: "INSPECTION_WAIT", label: "검사 대기" },
  { key: "INSPECTION_DONE", label: "검사 완료" },
  { key: "CERT_WAIT", label: "성적서 대기" },
  { key: "CERT_DONE", label: "성적서 발행 완료" },
  { key: "SHIP_WAIT", label: "출고 대기" },
  { key: "SHIPPED", label: "출고 완료" },
];

export const HOME_WORKFLOW_PREVIEW_LIMIT = 12;

/** HOME 진행현황 — 전체 보기 → Control Room Product View (Sprint 3E) */
export const HOME_WORKFLOW_FULL_VIEW_PATH = "/equipment-status?view=product";

/** @deprecated HomeWorkLauncherPanel + homeWorkLauncher.js 사용 */
export const HOME_HUB_SHORTCUTS = [
  {
    id: "equipmentStatus",
    label: "설비 현황",
    to: "/equipment-status",
    actionLabel: "전체 보기 →",
    summary: ({ equipmentRunning, equipmentReady, equipmentMaintenance }) =>
      `운전중 ${equipmentRunning} · 준비 ${equipmentReady} · 점검 ${equipmentMaintenance}`,
  },
  {
    id: "productStatus",
    label: "제품 현황",
    to: "/product-status",
    actionLabel: "전체 보기 →",
    summary: ({ productInProgress }) => `진행 중 ${productInProgress.toLocaleString("ko-KR")}건`,
  },
];

/** Status Chip KPI — @deprecated statusChipConfigs.js WORKFLOW_CHIP_STATUS_FILTER */
export { WORKFLOW_CHIP_STATUS_FILTER } from "./statusChipConfigs";
/** HOME 공지사항 — HOME Final V1.1 (SessionStorage · HOME 전용) */
export const HOME_NOTICES_PREVIEW_LIMIT = 3;
/** @deprecated HOME_NOTICES_FULL_VIEW_PATH — HOME에서 더보기/접기 */
export const HOME_NOTICES_FULL_VIEW_PATH = "/home";

/** HOME 업무일정 — 미리보기 건수 */
export const HOME_WORK_SCHEDULE_PREVIEW_LIMIT = 5;

/** @deprecated HOME_WORK_SCHEDULE_PREVIEW_LIMIT 사용 */
export const HOME_TODO_PREVIEW_LIMIT = HOME_WORK_SCHEDULE_PREVIEW_LIMIT;

/** HOME 좌측 현황 요약 Tab — 2×2 그리드 순서 (1행: 생산·입출고 / 2행: 검사·성적서) */
export const HOME_STATUS_SUMMARY_TABS = [
  { id: "production", label: "열처리현황" },
  { id: "inout", label: "입출고현황" },
  { id: "inspection", label: "검사현황" },
  { id: "certificate", label: "성적서현황" },
];

export const HOME_WORKFLOW_STATUS_OPTIONS = [
  "입고대기",
  "입고완료",
  "열처리중",
  "열처리완료",
  "검사대기",
  "검사완료",
  "성적서 대기",
  "성적서 완료",
  "출고 준비",
  "출고 완료",
];

export const HOME_RECENT_TABS = [
  { id: "incoming", label: "최근 입고" },
  { id: "production", label: "최근 작업" },
  { id: "inspection", label: "최근 검사" },
  { id: "shipment", label: "최근 출고" },
];

export const HOME_PRODUCTION_PERIODS = [
  { id: "today", label: "금일" },
  { id: "week", label: "주간" },
  { id: "month", label: "월간" },
];

export const HOME_QUICK_MENUS = [
  { id: "incoming", label: "입고등록", to: "/inout/incoming" },
  { id: "daily", label: "열처리일보", to: "/production/daily-report" },
  { id: "inspection", label: "검사등록", to: "/quality/inspection/register" },
  { id: "certificate", label: "성적서관리", to: "/quality/certificate" },
  { id: "shipment", label: "출고등록", to: "/inout/shipment" },
];

/** HOME 오늘 해야 할 일 — Workflow 기반 액션 미리보기 */
export const HOME_TODAY_TASKS_LIMIT = 6;

/** HOME 관리자 전용 바로가기 */
export const HOME_ADMIN_SHORTCUTS = [
  { id: "adminUsers", label: "사용자관리", to: "/environment/users" },
  { id: "adminPermissions", label: "권한관리", to: "/environment/permissions" },
  { id: "adminModules", label: "모듈관리", to: "/environment/modules" },
  { id: "adminStorage", label: "Storage 관리", to: "/environment/storage" },
  { id: "adminLogs", label: "시스템 로그", to: "/environment/logs" },
];

export const HOME_RECENT_LIST_TITLE = "최근 작업";
export const HOME_RECENT_PREVIEW_LIMIT = 7;
export const HOME_RECENT_FULL_VIEW_PATH = "/history";
export const HOME_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
