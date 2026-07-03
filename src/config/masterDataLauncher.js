import { Building2, Cog, HardHat, Layers, Package, Wrench } from "lucide-react";

/** 기준정보관리 Launcher — 6개 독립 관리 화면 */
export const MASTER_DATA_LAUNCHER_ITEMS = [
  {
    id: "companies",
    label: "거래처관리",
    path: "/settings/companies",
    icon: Building2,
    description: "거래처 목록 · 등록/수정 · 담당자 · 거래 이력",
  },
  {
    id: "products",
    label: "제품관리",
    path: "/settings/products",
    icon: Package,
    description: "제품 목록 · 거래처 연결 · 재질 · 규격 · 기본단가",
  },
  {
    id: "materials",
    label: "재질관리",
    path: "/settings/materials",
    icon: Layers,
    description: "재질코드 · 재질명 · 규격 · 사용 여부",
  },
  {
    id: "processes",
    label: "공정관리",
    path: "/settings/processes",
    icon: Cog,
    description: "공정코드 · 공정명 · 설명 · 사용 여부",
  },
  {
    id: "equipment",
    label: "설비관리",
    path: "/settings/equipment",
    icon: Wrench,
    description: "설비코드 · 설비명 · 공정 · 사용 여부",
  },
  {
    id: "workers",
    label: "작업자관리",
    path: "/settings/workers",
    icon: HardHat,
    description: "작업자 코드 · 작업자명 · 부서 · 사용 여부",
  },
];

export function getMasterDataLauncherItem(id) {
  return MASTER_DATA_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
