import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Tags,
} from "lucide-react";

/** 생산관리 Launcher — V1.5 Hub */
export const PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "production-plan",
    label: "생산계획",
    path: "/production/daily-report",
    icon: CalendarDays,
    description: "생산 스케줄 · 계획 조회 (향후 확장)",
    metricKeys: ["planCount"],
  },
  {
    id: "daily-report",
    label: "생산일보",
    path: "/production/daily-report",
    icon: ClipboardList,
    description: "열처리일보 · LOT · 작업 완료",
    metricKeys: ["dailyReportCount", "htRunning"],
  },
  {
    id: "lot-management",
    label: "LOT 관리",
    path: "/production/daily-report",
    icon: Tags,
    description: "LOT 생성 · Traceability · 동일 LOT 제품",
    metricKeys: ["lotCount"],
  },
  {
    id: "work-order",
    label: "작업지시",
    path: "/inout/incoming",
    icon: FileText,
    description: "열처리 작업 요청 리스트 · HTL 출력",
    metricKeys: ["workOrderPending"],
  },
  {
    id: "production-results",
    label: "생산실적관리",
    path: "/production/results",
    icon: BarChart3,
    description: "생산 실적 · 공정별 집계",
    metricKeys: ["resultsCount"],
  },
  {
    id: "work-journal",
    label: "업무일지",
    path: "/work-journal",
    icon: BookOpen,
    description: "담당자 업무 기록 · 특이사항",
    metricKeys: ["journalCount"],
  },
  {
    id: "defect-history",
    label: "불량이력관리",
    path: "/production/defect-history",
    icon: AlertTriangle,
    description: "불량 · NCR · 재처리 이력",
    metricKeys: ["defectCount"],
  },
];
export function getProductionManagementLauncherItem(id) {
  return PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
