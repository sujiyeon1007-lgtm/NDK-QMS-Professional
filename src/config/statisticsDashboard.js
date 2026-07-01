/**
 * Project TITAN V1.0 — 통계자료 Tab별 KPI · 조회기준 · 차트 · 강조색
 */

import {
  BarChart3,
  Building2,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Cog,
  Factory,
  FileText,
  Layers,
  Package,
  PackageCheck,
  Percent,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Wrench,
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

const INQUIRY_KPI = [
  { id: "productionQty", label: "생산량", quantity: true, icon: Factory, tone: "blue" },
  { id: "shipmentQty", label: "출고량", quantity: true, icon: PackageCheck, tone: "green" },
  { id: "inspectionCount", label: "검사 건수", unit: "건", icon: ShieldCheck, tone: "purple" },
  { id: "passRate", label: "합격률", unit: "%", icon: CircleCheck, tone: "orange" },
  { id: "defectRate", label: "불량률", unit: "%", icon: TrendingUp, tone: "red" },
  { id: "reprocessRate", label: "재처리율", unit: "%", icon: BarChart3, tone: "gray" },
];

const PRODUCTION_KPI = [
  { id: "productionQty", label: "생산량", quantity: true, icon: Factory, tone: "blue" },
  { id: "completedCount", label: "생산 완료 건수", unit: "건", icon: CircleCheck, tone: "blue" },
  { id: "inProgressCount", label: "생산 진행 건수", unit: "건", icon: Cog, tone: "blue" },
  { id: "avgProductionQty", label: "평균 생산량", quantity: true, icon: TrendingUp, tone: "blue" },
  { id: "equipmentRunCount", label: "설비 가동 건수", unit: "건", icon: Wrench, tone: "blue" },
  { id: "topProcessShare", label: "공정별 생산 비율", unit: "%", icon: Layers, tone: "blue" },
];

const QUALITY_KPI = [
  { id: "inspectionCount", label: "검사 건수", unit: "건", icon: ClipboardCheck, tone: "green" },
  { id: "passCount", label: "합격 건수", unit: "건", icon: CircleCheck, tone: "green" },
  { id: "failCount", label: "불합격 건수", unit: "건", icon: CircleX, tone: "green" },
  { id: "passRate", label: "합격률", unit: "%", icon: Percent, tone: "green" },
  { id: "defectRate", label: "불량률", unit: "%", icon: TrendingUp, tone: "green" },
  { id: "reprocessRate", label: "재처리율", unit: "%", icon: BarChart3, tone: "green" },
];

const SHIPMENT_KPI = [
  { id: "shipmentQty", label: "출고량", quantity: true, icon: Truck, tone: "orange" },
  { id: "completedCount", label: "출고 완료 건수", unit: "건", icon: CircleCheck, tone: "orange" },
  { id: "companyCount", label: "출고 업체 수", unit: "곳", icon: Building2, tone: "orange" },
  { id: "avgShipmentQty", label: "평균 출고량", quantity: true, icon: TrendingUp, tone: "orange" },
  { id: "statementCount", label: "거래명세서 발행 건수", unit: "건", icon: FileText, tone: "orange" },
  { id: "shipmentRatio", label: "출고 비율", unit: "%", icon: Percent, tone: "orange" },
];

const SALES_KPI = [
  { id: "totalShipmentQty", label: "총 출고량", quantity: true, icon: Package, tone: "purple" },
  { id: "companyCount", label: "거래 업체 수", unit: "곳", icon: Building2, tone: "purple" },
  { id: "itemCount", label: "품목 수", unit: "종", icon: Layers, tone: "purple" },
  { id: "avgShipmentQty", label: "평균 출고량", quantity: true, icon: TrendingUp, tone: "purple" },
  { id: "topCompanyShare", label: "업체별 실적", unit: "%", icon: Users, tone: "purple" },
  { id: "topItemShare", label: "품목별 실적", unit: "%", icon: BarChart3, tone: "purple" },
];

export const STATISTICS_TAB_SCOPES = {
  inquiry: {
    id: "inquiry",
    label: "통계조회",
    pageTitle: "통계조회",
    accentClass: "statistics-accent--default",
    kpiItems: INQUIRY_KPI,
    dimensions: [],
    charts: [],
    useInquiryAnalytics: true,
    integratedDashboard: true,
  },
  production: {
    id: "production",
    label: "생산통계",
    pageTitle: "생산통계",
    accentClass: "statistics-accent--blue",
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
  shipment: {
    id: "shipment",
    label: "출고통계",
    pageTitle: "출고통계",
    accentClass: "statistics-accent--orange",
    kpiItems: SHIPMENT_KPI,
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
    label: "영업실적",
    pageTitle: "영업실적",
    accentClass: "statistics-accent--purple",
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
  return STATISTICS_TAB_SCOPES[tabId] ?? STATISTICS_TAB_SCOPES.inquiry;
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
