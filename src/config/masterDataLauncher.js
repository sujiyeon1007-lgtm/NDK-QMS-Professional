import { AlertTriangle, Building2, Cog, FlaskConical, HardHat, Hash, Layers, Package, Wrench } from "lucide-react";

/** 기준정보관리 Launcher — V1.6 (Category Badge 공통) */
export const MASTER_DATA_LAUNCHER_ITEMS = [
  {
    id: "companies",
    label: "거래처관리",
    badge: "거래처",
    badgeColor: "blue",
    path: "/settings/companies",
    icon: Building2,
    description: "거래처 목록 · 등록/수정 · 담당자 · 거래 이력",
  },
  {
    id: "products",
    label: "제품관리",
    badge: "제품",
    badgeColor: "green",
    path: "/settings/products",
    icon: Package,
    description: "제품 목록 · 거래처 연결 · 재질 · 규격 · 기본단가",
  },
  {
    id: "materials",
    label: "재질관리",
    badge: "재질",
    badgeColor: "orange",
    path: "/settings/materials",
    icon: Layers,
    description: "재질명 · 재질코드 · 사용여부",
  },
  {
    id: "processes",
    label: "공정관리",
    badge: "공정",
    badgeColor: "purple",
    path: "/settings/processes",
    icon: Cog,
    description: "공정코드 · 공정명 · 설명 · 사용 여부",
  },
  {
    id: "equipment",
    label: "설비관리",
    badge: "설비",
    badgeColor: "green",
    path: "/settings/equipment",
    icon: Wrench,
    description: "설비명 · 열처리 공정 · 사용여부",
  },
  {
    id: "workers",
    label: "작업자관리",
    badge: "작업자",
    badgeColor: "cyan",
    path: "/settings/workers",
    icon: HardHat,
    description: "작업자 코드 · 작업자명 · 부서 · 사용 여부",
  },
  {
    id: "recipes",
    label: "열처리 Recipe 관리",
    badge: "레시피",
    badgeColor: "orange",
    path: "/settings/recipes",
    icon: FlaskConical,
    description: "표준 열처리 조건 · Status · Version · Approval Metadata",
  },
];

/** V1.1 Master First Freeze — Hold (code retained · UI placeholder only) */
export const MASTER_DATA_HOLD_LAUNCHER_ITEMS = [
  {
    id: "defect-codes",
    label: "불량코드",
    badge: "Hold",
    badgeColor: "gray",
    path: "/settings/hold/defect-codes",
    icon: AlertTriangle,
    description: "Master Sprint 이후 활성화",
    hold: true,
    holdReason: "\uBCF4\uB958 \u00B7 PM \uAC80\uD1A0 \uC911",
  },
  {
    id: "custom-codes",
    label: "사용자정의코드",
    badge: "Hold",
    badgeColor: "gray",
    path: "/settings/hold/custom-codes",
    icon: Hash,
    description: "Master Sprint 이후 활성화",
    hold: true,
    holdReason: "\uBCF4\uB958 \u00B7 PM \uAC80\uD1A0 \uC911",
  },
];

export function getMasterDataLauncherItem(id) {
  return MASTER_DATA_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}

export function getMasterHoldDefinition(holdId) {
  return MASTER_DATA_HOLD_LAUNCHER_ITEMS.find((item) => item.id === holdId) ?? null;
}

/** P0 Sprint — sidebar / environment tab hold IDs (data not deleted) */
export const MASTER_SSOT_HOLD_SIDEBAR_IDS = new Set(["defect-codes", "custom-codes"]);

export const MASTER_SSOT_HOLD_ENVIRONMENT_TAB_IDS = new Set(["customCodes"]);

export const MASTER_SSOT_SPRINT_PRIORITY = Object.freeze([
  { order: 1, id: "company", label: "\uAC70\uB798\uCC98 Master", status: "ok", note: "\uBCC0\uACBD \uC5C6\uC74C (OK as-is)" },
  { order: 2, id: "product", label: "\uC81C\uD488 Master", status: "deferred", note: "\uC804\uBA74 \uC7AC\uC124\uACC4 \u2014 \uB2E4\uC74C Sprint" },
  { order: 3, id: "material", label: "\uC7AC\uC9C8 Master", status: "simplified", note: "\uC7AC\uC9C8\uBA85 \u00B7 \uC7AC\uC9C8\uCF54\uB4DC \u00B7 \uC0AC\uC6A9\uC5EC\uBD80" },
  { order: 4, id: "equipment", label: "\uC124\uBE44 Master", status: "simplified", note: "\uC124\uBE44\uBA85 \u00B7 \uC5F4\uCC98\uB9AC \uACF5\uC815 \u00B7 \uC0AC\uC6A9\uC5EC\uBD80" },
  { order: 5, id: "worker", label: "\uC791\uC5C5\uC790 Master", status: "partial", note: "\uAE30\uC874 \uC720\uC9C0" },
  { order: 6, id: "processType", label: "\uACF5\uC815\uC720\uD615 Master", status: "partial", note: "\uD658\uACBD\uC124\uC815 \uD15C\uD50C\uB9BF" },
  { order: 7, id: "inspectionTemplate", label: "\uAC80\uC0AC Template Master", status: "partial", note: "\uD658\uACBD\uC124\uC815" },
  { order: 8, id: "certificatePolicy", label: "\uC131\uC801\uC11C Policy Master", status: "partial", note: "\uD658\uACBD\uC124\uC815" },
  { order: 9, id: "numbering", label: "\uCC44\uBC88 Master", status: "partial", note: "\uD658\uACBD\uC124\uC815" },
]);
