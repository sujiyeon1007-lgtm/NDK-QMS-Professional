import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Droplets,
  Factory,
} from "lucide-react";
import { OPERATION_ROUTES } from "./operationsRouteRegistry";

/** 생산관리 Launcher — RC1 Menu Layout (Launcher = Sidebar) */
export const PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "production-pending",
    label: "생산대기",
    badge: "대기",
    badgeColor: "blue",
    path: OPERATION_ROUTES.productionPending,
    icon: CalendarDays,
    description: "입고 완료 · 열처리 대기 제품 조회",
    metricKeys: ["planToday", "planCount"],
  },
  {
    id: "equipment-status",
    label: "설비가동현황",
    badge: "설비",
    badgeColor: "green",
    path: OPERATION_ROUTES.equipmentStatus,
    icon: Factory,
    description: "장입 준비 · 작업 시작 · 작업 종료 · LOT 확인",
    metricKeys: ["chargingRunning", "chargingReady"],
  },
  {
    id: "cleaning-process",
    label: "세척공정",
    badge: "공정",
    badgeColor: "cyan",
    path: OPERATION_ROUTES.cleaningProcess,
    icon: Droplets,
    description: "세척공정 Workspace (준비중)",
    metricKeys: [],
  },
  {
    id: "daily-report",
    label: "작업일보",
    badge: "일보",
    badgeColor: "blue",
    path: OPERATION_ROUTES.dailyWork,
    icon: ClipboardList,
    description: "LOT 기준 통합 작업 기록 · 설비 장입 시 자동 생성",
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
  {
    id: "production-history",
    label: "생산이력",
    badge: "이력",
    badgeColor: "slate",
    path: "/production/results",
    icon: ClipboardCheck,
    description: "생산 실적 · 완료 이력 조회",
    metricKeys: ["productionDone"],
  },
];

export function getProductionManagementLauncherItem(id) {
  return PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
