import {

  BarChart3,

  BookOpen,

  CalendarDays,

  ClipboardList,

  Factory,

} from "lucide-react";



/** 생산관리 Launcher — V1.5 Production Architecture Renewal (PM 승인) */

export const PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS = [

  {

    id: "production-plan",

    label: "생산계획",

    path: "/production/daily-report",

    icon: CalendarDays,

    description: "생산 일정 · 계획 조회 (부장/생산관리자)",

    metricKeys: ["planToday", "planCount"],

  },

  {

    id: "qr-charging",

    label: "설비 장입관리",

    path: "/qr-workflow",

    icon: Factory,

    description: "QR Scan · LOT · 장입 · 열처리 완료 · 생산 Workflow 핵심",

    metricKeys: ["chargingRunning", "chargingReady"],

    emphasis: true,

  },

  {

    id: "daily-report",

    label: "생산일보",

    path: "/production/daily-report",

    icon: ClipboardList,

    description: "공식 생산 기록 · QR 장입 시 초안 자동 생성",

    metricKeys: ["dailyReportPending", "htRunning"],
    emphasis: true,
  },

  {

    id: "production-results",

    label: "생산실적관리",

    path: "/production/results",

    icon: BarChart3,

    description: "생산량 · 완료 · 불량 · 가동률 조회",

    metricKeys: ["resultsToday"],

  },

  {

    id: "work-journal",

    label: "생산 업무일지",

    path: "/production/work-journal",

    icon: BookOpen,

    description: "작업 특이사항 · 설비 이상 · 생산 메모",

    metricKeys: ["journalToday"],

  },

];



export function getProductionManagementLauncherItem(id) {

  return PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;

}


