import {
  BarChart3,
  Calculator,
  Factory,
  LayoutGrid,
  Monitor,
  Package,
  QrCode,
  Truck,
  Wallet,
} from "lucide-react";

/**
 * HOME 업무 바로가기 — V1.5 UI Freeze (2×3 Launcher Grid)
 * @see src/pages/Home/HomeWorkLauncherPanel.jsx
 */
export const HOME_WORK_LAUNCHER_ITEMS = [
  {
    id: "inbound",
    label: "입고관리",
    badge: "입고",
    tone: "blue",
    path: "/inout",
    icon: Package,
    moduleId: "inbound",
    metrics: [
      { key: "todayIncoming", label: "금일 입고", suffix: "건" },
      { key: "inboundWait", label: "입고 대기", suffix: "건" },
    ],
  },
  {
    id: "equipmentStatus",
    label: "설비현황",
    badge: "관제",
    tone: "orange",
    path: "/equipment-status",
    icon: Monitor,
    moduleId: "qrSystem",
    metrics: [
      { key: "running", label: "운전중", suffix: "대" },
      { key: "ready", label: "장입 준비", suffix: "대" },
      { key: "maintenance", label: "점검중", suffix: "대" },
    ],
  },
  {
    id: "productStatus",
    label: "제품 현황",
    badge: "추적",
    tone: "green",
    path: "/equipment-status?view=product",
    icon: LayoutGrid,
    moduleId: null,
    metrics: [
      { key: "inProgress", label: "진행중", suffix: "건" },
      { key: "inspectionWait", label: "검사대기", suffix: "건" },
      { key: "shipWait", label: "출고대기", suffix: "건" },
    ],
  },
  {
    id: "qrCharging",
    label: "설비장입",
    badge: "작업",
    tone: "purple",
    path: "/production",
    icon: Factory,
    moduleId: "qrSystem",
    metrics: [
      { key: "chargeableLots", label: "장입 가능 LOT", suffix: "건" },
      { key: "runningEquipment", label: "운전중 설비", suffix: "대" },
    ],
  },
  {
    id: "outbound",
    label: "출고관리",
    badge: "출고",
    tone: "yellow",
    path: "/inout",
    icon: Truck,
    moduleId: "outbound",
    metrics: [
      { key: "todayShipment", label: "금일 출고", suffix: "건" },
      { key: "shipWait", label: "출고 대기", suffix: "건" },
    ],
  },
  {
    id: "statistics",
    label: "통계관리",
    badge: "통계",
    tone: "cyan",
    path: "/statistics",
    icon: BarChart3,
    moduleId: "statistics",
    metrics: [
      { key: "heatRunning", label: "열처리 중", suffix: "건" },
      { key: "inspectionWait", label: "검사 대기", suffix: "건" },
    ],
  },
  {
    id: "accountingClerk",
    label: "경리관리",
    badge: "경리",
    tone: "blue",
    path: "/accounting-clerk",
    icon: Wallet,
    moduleId: "accountingClerk",
    metrics: [
      { key: "activeFeatures", label: "사용 기능", suffix: "개" },
      { key: "comingSoon", label: "준비 중", suffix: "개" },
    ],
  },
  {
    id: "accounting",
    label: "회계관리",
    badge: "회계",
    tone: "purple",
    path: "/accounting",
    icon: Calculator,
    moduleId: "accounting",
    metrics: [
      { key: "referenceViews", label: "조회 화면", suffix: "개" },
      { key: "comingSoon", label: "준비 중", suffix: "개" },
    ],
  },
  {
    id: "qrEngine",
    label: "QR Engine",
    badge: "QR",
    tone: "cyan",
    path: "/qr",
    icon: QrCode,
    moduleId: "qrSystem",
    metrics: [
      { key: "registry", label: "Registry", suffix: "건" },
      { key: "scanRoutes", label: "Scan Route", suffix: "개" },
    ],
  },
];