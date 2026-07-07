import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Factory,
  Printer,
} from "lucide-react";

/** 생산관리 Launcher — V2.0 Blueprint (Category Badge 공통) */
export const PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "production-plan",
    label: "생산계획",
    badge: "계획",
    badgeColor: "blue",
    path: "/production/plan",
    icon: CalendarDays,
    description: "생산 일정 · 계획 조회 (부장/생산관리자)",
    metricKeys: ["planToday", "planCount"],
  },
  {
    id: "qr-charging",
    label: "설비장입",
    badge: "장입",
    badgeColor: "green",
    path: "/production/charging",
    icon: Factory,
    description: "LOT↔설비 연결 · 장입 · 열처리 완료 · 생산 Workflow 핵심",
    metricKeys: ["chargingRunning", "chargingReady"],
    emphasis: true,
  },
  {
    id: "daily-report",
    label: "생산일보",
    badge: "일보",
    badgeColor: "blue",
    path: "/production/daily-report",
    icon: ClipboardList,
    description: "공식 생산 기록 · QR 장입 시 초안 자동 생성",
    metricKeys: ["dailyReportPending", "htRunning"],
    emphasis: true,
  },
  {
    id: "production-results",
    label: "생산실적관리",
    badge: "실적",
    badgeColor: "purple",
    path: "/production/results",
    icon: BarChart3,
    description: "생산량 · 완료 · 불량 · 가동률 조회",
    metricKeys: ["resultsToday"],
  },
  {
    id: "print-management",
    label: "출력관리",
    badge: "출력",
    badgeColor: "orange",
    path: "/production/print",
    icon: Printer,
    description: "생산일보 · LOT 리스트 · 작업지시서 출력",
    metricKeys: ["dailyReportPrint", "htlPrint"],
  },
];
export function getProductionManagementLauncherItem(id) {
  return PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
