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
  description: "금일 운영 현황과 실시간 제품 진행 상태를 확인합니다.",
};

export const HOME_RECENT_LIST_TITLE = "입고 제품 현황";
export const HOME_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
