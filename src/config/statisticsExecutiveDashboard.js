/**
 * Project TITAN V1.3 — 통계관리 ERP/MES Executive Dashboard (3 Tab)
 */

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Building2,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Factory,
  FileText,
  Layers,
  Package,
  PackageCheck,
  Percent,
  ShieldAlert,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

export const STATISTICS_EXECUTIVE_TABS = ["production", "quality", "sales"];

export const STATISTICS_LEGACY_TAB_REDIRECTS = {
  inquiry: "production",
  shipment: "sales",
};

const PRODUCTION_EXEC_KPI = [
  { id: "inboundCount", label: "입고", unit: "건", icon: ArrowDownToLine, tone: "blue" },
  { id: "heatTreatmentCount", label: "열처리", unit: "건", icon: Factory, tone: "blue" },
  { id: "inspectionCount", label: "검사", unit: "건", icon: ClipboardCheck, tone: "green" },
  { id: "certificateCount", label: "성적서", unit: "건", icon: FileText, tone: "purple" },
  { id: "outboundCount", label: "출고", unit: "건", icon: ArrowUpFromLine, tone: "orange" },
  { id: "inventoryQty", label: "재고", quantity: true, icon: Package, tone: "sky" },
  { id: "passRate", label: "합격률", unit: "%", icon: CircleCheck, tone: "green" },
  { id: "defectRate", label: "불량률", unit: "%", icon: TrendingUp, tone: "red" },
];

const QUALITY_EXEC_KPI = [
  { id: "inspectionCount", label: "검사건수", unit: "건", icon: ClipboardCheck, tone: "green" },
  { id: "passCount", label: "합격", unit: "건", icon: CircleCheck, tone: "green" },
  { id: "failCount", label: "불합격", unit: "건", icon: CircleX, tone: "red" },
  { id: "reinspectCount", label: "재검사", unit: "건", icon: BarChart3, tone: "orange" },
  { id: "passRate", label: "합격률", unit: "%", icon: Percent, tone: "green" },
  { id: "defectRate", label: "불량률", unit: "%", icon: TrendingUp, tone: "red" },
  { id: "ncrCount", label: "NCR", unit: "건", icon: ShieldAlert, tone: "red" },
  { id: "claimCount", label: "고객클레임", unit: "건", icon: Users, tone: "orange" },
];

const SALES_EXEC_KPI = [
  { id: "totalShipmentQty", label: "총 출고", quantity: true, icon: Truck, tone: "orange" },
  { id: "completedCount", label: "출고 완료", unit: "건", icon: CircleCheck, tone: "green" },
  { id: "waitingCount", label: "출고 대기", unit: "건", icon: PackageCheck, tone: "orange" },
  { id: "companyCount", label: "거래처 수", unit: "곳", icon: Building2, tone: "purple" },
  { id: "monthlyRevenue", label: "월 매출", unit: "만원", icon: TrendingUp, tone: "purple" },
  { id: "avgLeadTime", label: "평균 출고 리드타임", unit: "일", icon: Layers, tone: "blue" },
];

export const STATISTICS_EXECUTIVE_SCOPES = {
  production: {
    id: "production",
    label: "전체 생산통계",
    pageTitle: "전체 생산통계",
    accentClass: "statistics-accent--blue",
    kpiItems: PRODUCTION_EXEC_KPI,
  },
  quality: {
    id: "quality",
    label: "품질통계",
    pageTitle: "품질통계",
    accentClass: "statistics-accent--green",
    kpiItems: QUALITY_EXEC_KPI,
  },
  sales: {
    id: "sales",
    label: "영업통계",
    pageTitle: "영업통계",
    accentClass: "statistics-accent--purple",
    kpiItems: SALES_EXEC_KPI,
  },
};

export function resolveExecutiveStatisticsTab(tabParam) {
  const normalized = STATISTICS_LEGACY_TAB_REDIRECTS[tabParam] ?? tabParam;
  if (STATISTICS_EXECUTIVE_TABS.includes(normalized)) return normalized;
  return "production";
}

export function getExecutiveStatisticsScope(tabId) {
  return STATISTICS_EXECUTIVE_SCOPES[tabId] ?? STATISTICS_EXECUTIVE_SCOPES.production;
}
