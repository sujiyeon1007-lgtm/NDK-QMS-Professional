import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Factory,
} from "lucide-react";
import { OPERATION_ROUTES } from "./operationsRouteRegistry";

/** 생산관리 Launcher — V2.0 Blueprint (Category Badge 공통) */
export const PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "production-plan",
    label: "생산 대기",
    badge: "대기",
    badgeColor: "blue",
    path: OPERATION_ROUTES.productionPending,
    icon: CalendarDays,
    description: "입고 완료 후 LOT 미생성 열처리 작업 대기 목록",
    metricKeys: ["planToday", "planCount"],
  },
  {
    id: "equipment-status",
    label: "설비 가동 현황",
    badge: "설비",
    badgeColor: "green",
    path: OPERATION_ROUTES.equipmentStatus,
    icon: Factory,
    description: "장입 준비 · 작업 시작 · 작업 종료 · LOT 확인",
    metricKeys: ["chargingRunning", "chargingReady"],
  },
  {
    id: "daily-report",
    label: "생산일보",
    badge: "일보",
    badgeColor: "blue",
    path: OPERATION_ROUTES.dailyWork,
    icon: ClipboardList,
    description: "공식 생산 기록 · QR 장입 시 초안 자동 생성",
    metricKeys: ["dailyReportPending", "htRunning"],
    emphasis: true,
  },
  {
    id: "shot-work",
    label: "쇼트 작업현황",
    badge: "쇼트",
    badgeColor: "cyan",
    path: OPERATION_ROUTES.shotStatus,
    icon: ClipboardCheck,
    description: "쇼트 입고 건 · 작업 대기/완료 · 작업자별 처리량",
    metricKeys: ["shotWaiting", "shotCompleted"],
  },
];
export function getProductionManagementLauncherItem(id) {
  return PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
