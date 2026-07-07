import { ClipboardList, History, Package, Printer, Truck } from "lucide-react";

/** 입출고관리 Launcher — V1.5 Hub */
export const INOUT_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "incoming-register",
    label: "입고등록",
    path: "/inout/incoming",
    icon: ClipboardList,
    description: "입고 등록 · 입고현황 · 작업지시 출력",
    metricKeys: ["todayIncoming", "inboundWait"],
  },
  {
    id: "outbound-register",
    label: "출고등록",
    path: "/inout/shipment",
    icon: Truck,
    description: "출고 등록 · 출고현황 · 거래명세서",
    metricKeys: ["todayShipment", "shipWait"],
  },
  {
    id: "inventory-status",
    label: "재고관리",
    path: "/inventory",
    icon: Package,
    description: "현재 재고 · LOT/품목별 조회 · 재고 PDF",
    metricKeys: ["inventoryCount"],
  },
  {
    id: "inout-history",
    label: "입출고 이력",
    path: "/history",
    icon: History,
    description: "입고조회 · 출고조회 · Traceability",
    metricKeys: ["traceCount"],
  },
  {
    id: "print-management",
    label: "출력관리",
    path: "/inout/incoming",
    icon: Printer,
    description: "입고리스트 · 거래명세서 · PDF 출력",
    metricKeys: ["printPending"],
  },
];
export function getInoutManagementLauncherItem(id) {
  return INOUT_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
