/**
 * Project TITAN V1.0 — 통계자료 Tab별 KPI · 조회기준 · 차트 · 강조색
 */

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Clock,
  FileText,
  Layers,
  Package,
  PackageCheck,
  Percent,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  ArrowDownToLine,
  Flame,
  Boxes,
} from "lucide-react";

export const STATISTICS_PERIODS = [
  { id: "day", label: "일간" },
  { id: "week", label: "주간" },
  { id: "month", label: "월간" },
  { id: "year", label: "연간" },
];

export const PERIOD_KPI_PREFIX = {
  day: "일간",
  week: "주간",
  month: "월간",
  year: "연간",
};

export const STATISTICS_UNIT_OPTIONS = [
  { value: "", label: "전체" },
  { value: "EA", label: "EA" },
  { value: "KG", label: "kg" },
  { value: "LOT", label: "LOT" },
];

export const STATISTICS_CHART_TYPES = [
  { id: "combo", label: "복합" },
  { id: "line", label: "추이" },
  { id: "bar", label: "비교" },
  { id: "pie", label: "비율" },
];

export const STATISTICS_STATUS_PANEL = {
  title: "통계 현황",
  titleIcon: BarChart3,
};

/** @deprecated V1.3 — redirects to production executive dashboard */
const INQUIRY_KPI = [];

const PRODUCTION_KPI = [
  { id: "inboundCount", label: "입고", unit: "건", icon: ArrowDownToLine, tone: "incoming" },
  { id: "heatTreatmentCount", label: "열처리", unit: "건", icon: Flame, tone: "production" },
  { id: "inspectionCount", label: "검사", unit: "건", icon: ShieldCheck, tone: "inspection" },
  { id: "certificateCount", label: "성적서", unit: "건", icon: FileText, tone: "certificate" },
  { id: "shipmentQty", label: "출고", quantity: true, icon: Truck, tone: "shipment" },
  { id: "inventoryQty", label: "재고", quantity: true, icon: Boxes, tone: "inventory" },
  { id: "passRate", label: "합격률", unit: "%", icon: CircleCheck, tone: "inspection" },
  { id: "defectRate", label: "불량률", unit: "%", icon: TrendingUp, tone: "rework" },
];

const QUALITY_KPI = [
  { id: "inspectionCount", label: "검사건수", unit: "건", icon: ClipboardCheck, tone: "inspection" },
  { id: "passCount", label: "합격", unit: "건", icon: CircleCheck, tone: "inspection" },
  { id: "failCount", label: "불합격", unit: "건", icon: CircleX, tone: "rework" },
  { id: "reinspectionCount", label: "재검사", unit: "건", icon: RotateCcw, tone: "rework" },
  { id: "passRate", label: "합격률", unit: "%", icon: Percent, tone: "inspection" },
  { id: "defectRate", label: "불량률", unit: "%", icon: TrendingUp, tone: "rework" },
  { id: "ncrCount", label: "NCR", unit: "건", icon: AlertTriangle, tone: "rework" },
  { id: "customerClaimCount", label: "고객클레임", unit: "건", icon: Users, tone: "rework" },
];

const SHOT_KPI = [
  { id: "shotCount", label: "쇼트 작업", unit: "건", icon: ClipboardCheck, tone: "production" },
  { id: "shotQty", label: "처리 EA", unit: "EA", icon: PackageCheck, tone: "incoming" },
  { id: "completedCount", label: "작업 완료", unit: "건", icon: CircleCheck, tone: "inspection" },
  { id: "waitingCount", label: "작업 대기", unit: "건", icon: Clock, tone: "hold" },
  { id: "completionRate", label: "완료율", unit: "%", icon: Percent, tone: "inspection" },
  { id: "workerCount", label: "작업자 수", unit: "명", icon: Users, tone: "certificate" },
];

/** @deprecated V1.3 — consolidated into sales executive dashboard */
const SHIPMENT_KPI = [];

const SALES_KPI = [
  { id: "totalShipmentQty", label: "총 출고", quantity: true, icon: Package, tone: "shipment" },
  { id: "shipmentCompleted", label: "출고 완료", unit: "건", icon: PackageCheck, tone: "shipment" },
  { id: "shipmentPending", label: "출고 대기", unit: "건", icon: Truck, tone: "shipment" },
  { id: "companyCount", label: "거래처 수", unit: "곳", icon: Building2, tone: "incoming" },
  { id: "monthlyRevenue", label: "월 매출", unit: "원", icon: TrendingUp, tone: "certificate" },
  { id: "avgLeadTime", label: "평균 출고 리드타임", unit: "일", icon: Clock, tone: "production" },
];

export const STATISTICS_TAB_SCOPES = {
  inquiry: {
    id: "inquiry",
    label: "통계조회",
    pageTitle: "전체 생산통계",
    accentClass: "statistics-accent--blue",
    kpiItems: PRODUCTION_KPI,
    dimensions: [],
    charts: [],
    useInquiryAnalytics: false,
    integratedDashboard: false,
    executiveDashboard: true,
    redirectTo: "production",
  },
  production: {
    id: "production",
    label: "전체 생산통계",
    pageTitle: "전체 생산통계",
    accentClass: "statistics-accent--blue",
    executiveDashboard: true,
    kpiItems: PRODUCTION_KPI,
    dimensions: [
      { id: "company", label: "업체별", field: "company" },
      { id: "equipment", label: "설비별", field: "equipment" },
      { id: "material", label: "재질별", field: "material" },
      { id: "process", label: "공정별", field: "processName" },
      { id: "worker", label: "작업자별", field: "worker" },
    ],
    charts: [
      { id: "line", title: "월별 생산 추이", type: "line", valueKey: "productionQty" },
      { id: "bar1", title: "설비별 생산량", type: "bar", groupField: "equipment", valueKey: "productionQty" },
      { id: "bar2", title: "공정별 생산량", type: "bar", groupField: "processName", valueKey: "productionQty" },
      { id: "pie1", title: "재질별 생산량", type: "pie", groupField: "material", valueKey: "productionQty" },
    ],
    advancedFields: ["equipment", "process", "worker", "unit"],
  },
  quality: {
    id: "quality",
    label: "품질통계",
    pageTitle: "품질통계",
    accentClass: "statistics-accent--green",
    executiveDashboard: true,
    kpiItems: QUALITY_KPI,
    dimensions: [
      { id: "company", label: "업체별", field: "company" },
      { id: "material", label: "재질별", field: "material" },
      { id: "process", label: "공정별", field: "processName" },
      { id: "assignee", label: "검사자별", field: "assignee" },
    ],
    charts: [
      { id: "line", title: "월별 검사 건수", type: "line", valueKey: "count" },
      { id: "bar", title: "품질 지표", type: "bar", metric: "qualityRates" },
      { id: "pie1", title: "공정별 불량률", type: "pie", groupField: "processName", valueKey: "defectQty" },
      { id: "pie2", title: "재질별 불량률", type: "pie", groupField: "material", valueKey: "defectQty" },
    ],
    advancedFields: ["assignee", "process", "judgment"],
  },
  shot: {
    id: "shot",
    label: "쇼트현황",
    pageTitle: "쇼트현황",
    accentClass: "statistics-accent--blue",
    executiveDashboard: true,
    kpiItems: SHOT_KPI,
    dimensions: [
      { id: "company", label: "업체별", field: "company" },
      { id: "worker", label: "작업자별", field: "worker" },
      { id: "material", label: "재질별", field: "material" },
    ],
    charts: [
      { id: "line", title: "월별 쇼트 작업량", type: "line", valueKey: "shotQty" },
      { id: "bar1", title: "업체별 쇼트 처리량", type: "bar", groupField: "company", valueKey: "shotQty" },
      { id: "bar2", title: "작업자별 처리량", type: "bar", groupField: "worker", valueKey: "shotQty" },
    ],
    advancedFields: ["worker", "unit"],
  },
  shipment: {
    id: "shipment",
    label: "출고통계",
    pageTitle: "영업통계",
    accentClass: "statistics-accent--purple",
    executiveDashboard: true,
    redirectTo: "sales",
    kpiItems: SALES_KPI,
    dimensions: [
      { id: "company", label: "업체별", field: "company" },
      { id: "partName", label: "품목별", field: "partName" },
      { id: "material", label: "재질별", field: "material" },
      { id: "manager", label: "담당자별", field: "manager" },
    ],
    charts: [
      { id: "line", title: "월별 출고량", type: "line", valueKey: "shipmentQty" },
      { id: "bar1", title: "업체별 출고량", type: "bar", groupField: "company", valueKey: "shipmentQty" },
      { id: "bar2", title: "품목별 출고량", type: "bar", groupField: "partName", valueKey: "shipmentQty" },
      { id: "pie1", title: "재질별 출고 비율", type: "pie", groupField: "material", valueKey: "shipmentQty" },
    ],
    advancedFields: ["unit", "manager"],
  },
  sales: {
    id: "sales",
    label: "영업통계",
    pageTitle: "영업통계",
    accentClass: "statistics-accent--purple",
    executiveDashboard: true,
    kpiItems: SALES_KPI,
    dimensions: [
      { id: "company", label: "업체별", field: "company" },
      { id: "partName", label: "품목별", field: "partName" },
      { id: "material", label: "재질별", field: "material" },
    ],
    charts: [
      { id: "line", title: "월별 실적", type: "line", valueKey: "shipmentQty" },
      { id: "bar", title: "업체별 출고 실적", type: "bar", groupField: "company", valueKey: "shipmentQty" },
      { id: "pie1", title: "품목별 실적", type: "pie", groupField: "partName", valueKey: "shipmentQty" },
      { id: "pie2", title: "거래처 비율", type: "pie", groupField: "company", valueKey: "shipmentQty" },
    ],
    advancedFields: ["unit"],
  },
};

export function getStatisticsScope(tabId) {
  const scope = STATISTICS_TAB_SCOPES[tabId];
  if (scope?.redirectTo) return STATISTICS_TAB_SCOPES[scope.redirectTo] ?? STATISTICS_TAB_SCOPES.production;
  return scope ?? STATISTICS_TAB_SCOPES.production;
}

export function getPeriodKpiLabel(period, baseLabel) {
  const prefix = PERIOD_KPI_PREFIX[period] ?? "월간";
  return `${prefix} ${baseLabel}`;
}

export function displayStatisticsUnit(unit) {
  if (!unit) return "";
  return unit === "KG" ? "kg" : unit;
}

export function getDimensionField(scope, dimensionId) {
  return scope.dimensions?.find((item) => item.id === dimensionId)?.field ?? "company";
}

export function getDefaultDimension(scope) {
  return scope.dimensions?.[0]?.id ?? "company";
}
