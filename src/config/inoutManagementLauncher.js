import { ClipboardList, History, BookOpen, Package, Printer, Truck } from "lucide-react";
import { OPERATION_ROUTES } from "./operationsRouteRegistry";

/** 입출고관리 Launcher — RC1 Route Registry (Category Badge 공통) */
export const INOUT_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "incoming-pending",
    label: "입고 대기",
    badge: "입고",
    badgeColor: "blue",
    path: OPERATION_ROUTES.inboundPending,
    icon: ClipboardList,
    description: "입고 등록 · 입고 대기 현황",
    metricKeys: ["todayIncoming", "inboundWait"],
  },
  {
    id: "incoming-history",
    label: "입고 이력",
    badge: "이력",
    badgeColor: "cyan",
    path: OPERATION_ROUTES.inboundHistory,
    icon: History,
    description: "입고 이력 조회 · 입고 리스트 출력",
    metricKeys: ["inboundLookup"],
  },
  {
    id: "outbound-register",
    label: "출고 등록",
    badge: "출고",
    badgeColor: "purple",
    path: OPERATION_ROUTES.shipmentRegister,
    icon: Truck,
    description: "출고 등록 · 출고 대기 · 거래명세서",
    metricKeys: ["todayShipment", "shipWait"],
  },
  {
    id: "outbound-history",
    label: "출고 이력",
    badge: "이력",
    badgeColor: "cyan",
    path: OPERATION_ROUTES.shipmentHistory,
    icon: History,
    description: "출고 완료 이력 조회",
    metricKeys: ["outboundLookup"],
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
