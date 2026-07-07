import { Flame, LayoutGrid, Wind, Zap } from "lucide-react";

/** 설비 장입관리 Hub — 생산관리 Launcher 내부 (PM V1.5 FINAL) */
export const PRODUCTION_CHARGING_HUB_ROUTE = "/production/charging";

export const PRODUCTION_CHARGING_OVERVIEW_COPY = {
  title: "전체 설비 현황",
  kicker: "생산 Workflow",
  description:
    "공장 전체 설비를 한눈에 확인합니다. 운전중 · 대기 · 점검 · 현재 LOT · 최근 완료 작업 · 설비별 상태",
};

export const PRODUCTION_CHARGING_LAUNCHER_ITEMS = [
  {
    id: "overview",
    label: "전체 설비 현황",
    path: "/production/charging/overview",
    icon: LayoutGrid,
    description: "운전중 · 대기 · 점검 설비 · 현재 작업 LOT · 설비별 상태",
    metricKeys: ["equipmentRunning", "equipmentIdle", "equipmentMaintenance"],
    emphasis: true,
  },
  {
    id: "ion-nitriding",
    label: "이온질화",
    path: "/production/charging/process/ion-nitriding",
    icon: Zap,
    description: "이온질화 공정 설비 목록 · 장입 작업",
    metricKeys: ["ionEquipmentCount", "ionRunning"],
    process: "이온질화",
  },
  {
    id: "gas-nitriding",
    label: "가스질화",
    path: "/production/charging/process/gas-nitriding",
    icon: Flame,
    description: "가스질화 공정 설비 목록 · 장입 작업",
    metricKeys: ["gasEquipmentCount", "gasRunning"],
    process: "가스질화",
  },
  {
    id: "gas-softening",
    label: "가스연질화",
    path: "/production/charging/process/gas-softening",
    icon: Wind,
    description: "가스연질화 공정 설비 목록 · 장입 작업",
    metricKeys: ["softEquipmentCount", "softRunning"],
    process: "가스연질화",
  },
];

/** PM 공식 설비 장입 Hub Workflow */
export const PRODUCTION_CHARGING_HUB_WORKFLOW = [
  "전체 설비 현황",
  "이온질화",
  "가스질화",
  "가스연질화",
];

export function getProductionChargingLauncherItem(id) {
  return PRODUCTION_CHARGING_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
