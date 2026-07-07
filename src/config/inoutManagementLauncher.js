import { ClipboardList, History, BookOpen, Package, Printer, Truck } from "lucide-react";

/** 입출고관리 Launcher — V2.0 Blueprint (Category Badge 공통) */
export const INOUT_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "incoming-register",
    label: "입고등록",
    badge: "입고",
    badgeColor: "blue",
    path: "/inout/incoming",
    icon: ClipboardList,
    description: "입고 등록 · 입고현황 · 작업지시 출력",
    metricKeys: ["todayIncoming", "inboundWait"],
  },
  {
    id: "outbound-register",
    label: "출고등록",
    badge: "출고",
    badgeColor: "purple",
    path: "/inout/shipment",
    icon: Truck,
    description: "출고 등록 · 출고현황 · 거래명세서",
    metricKeys: ["todayShipment", "shipWait"],
  },
  {
    id: "inout-history",
    label: "입출고이력",
    badge: "이력",
    badgeColor: "cyan",
    path: "/history",
    icon: History,
    description: "입고조회 · 출고조회 · Traceability",
    metricKeys: ["inboundLookup", "outboundLookup"],
  },
  {
    id: "inventory-status",
    label: "재고관리",
    badge: "재고",
    badgeColor: "green",
    path: "/inventory",
    icon: Package,
    description: "현재 재고 · LOT/품목별 조회 · 재고 PDF",
    metricKeys: ["currentInventory", "shortageItems"],
  },
  {
    id: "print-management",
    label: "출력관리",
    badge: "출력",
    badgeColor: "orange",
    path: "/inout/print",
    icon: Printer,
    description: "입고리스트 · 출고리스트 · 성적서 · 거래명세서 · 기타 문서",
    metricKeys: ["htlList", "invoiceList"],
  },
  {
    id: "operations-work-journal",
    label: "영업업무일지",
    badge: "일지",
    badgeColor: "cyan",
    path: "/inout/work-journal",
    icon: BookOpen,
    description: "입고 · 출고 · 재고 · 출력 관련 업무 기록",
    metricKeys: ["operationsJournalToday"],
  },
];
export function getInoutManagementLauncherItem(id) {
  return INOUT_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
