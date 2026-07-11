import { ClipboardList, History, Package, Printer, Truck } from "lucide-react";
import { OPERATION_ROUTES } from "./operationsRouteRegistry";

/** 입출고관리 Launcher — RC1 Menu Layout (Launcher = Sidebar) */
export const INOUT_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "incoming-management",
    label: "입고관리",
    badge: "입고",
    badgeColor: "blue",
    path: OPERATION_ROUTES.inboundPending,
    icon: ClipboardList,
    description: "입고 등록 · 입고 대기 현황",
    metricKeys: ["todayIncoming", "inboundWait"],
  },
  {
    id: "incoming-history",
    label: "입고이력",
    badge: "이력",
    badgeColor: "cyan",
    path: OPERATION_ROUTES.inboundHistory,
    icon: History,
    description: "입고 이력 조회 · 입고 리스트 출력",
    metricKeys: ["inboundLookup"],
  },
  {
    id: "outbound-management",
    label: "출고관리",
    badge: "출고",
    badgeColor: "purple",
    path: OPERATION_ROUTES.shipmentRegister,
    icon: Truck,
    description: "출고 등록 · 출고 대기 · 거래명세서",
    metricKeys: ["todayShipment", "shipWait"],
  },
  {
    id: "outbound-history",
    label: "출고이력",
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
    description: "고객 제품 보관 상태 · LOT/품목별 조회 · 재고 PDF",
    metricKeys: ["currentInventory", "shipWaitInventory"],
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
];

export function getInoutManagementLauncherItem(id) {
  return INOUT_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
