import { Factory, History, LayoutGrid, Monitor, QrCode } from "lucide-react";

/** 설비 장입관리 Launcher — V1.5 Hub (MES · QR 중심 생산) */
export const QR_CHARGING_LAUNCHER_ITEMS = [
  {
    id: "equipment-status",
    label: "설비 현황",
    path: "/equipment-status",
    icon: Monitor,
    description: "공장 설비 상태 · 설비별 현재 작업",
    metricKeys: ["equipmentRunning", "equipmentReady"],
  },
  {
    id: "qr-charging",
    label: "QR 장입",
    path: "/qr-workflow/charging",
    icon: QrCode,
    description: "QR Scan · LOT 선택 · 장입 시작 · 열처리 완료",
    metricKeys: ["chargeableLots", "activeSessions"],
    emphasis: true,
  },
  {
    id: "progress-status",
    label: "진행현황",
    path: "/product-status",
    icon: LayoutGrid,
    description: "작업중 LOT · 진행률 · 작업시간",
    metricKeys: ["lotsInProgress", "htRunning"],
  },
  {
    id: "work-history",
    label: "작업이력",
    path: "/history",
    icon: History,
    description: "완료 장입 · Timeline · 이력 조회",
    metricKeys: ["completedCharges", "traceCount"],
  },
];

export const QR_CHARGING_HUB_ROUTE = "/qr-workflow";

export function getQrChargingLauncherItem(id) {
  return QR_CHARGING_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
