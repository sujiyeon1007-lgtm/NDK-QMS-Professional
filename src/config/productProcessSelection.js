import { TITAN_PROCESS_MASTER_V2_PLANNED } from "./titanProcessMasterV2";

export const PRODUCT_PROCESS_CATEGORIES = [
  { id: "heatTreatment", label: "열처리", enabled: true },
  { id: "shot", label: "쇼트", enabled: true },
  { id: "cleaning", label: "세척", enabled: true },
];

export const PRODUCT_PROCESS_DETAILS = {
  heatTreatment: [
    "이온질화",
    "가스질화",
    "가스연질화",
    "침탄",
    "탈탄",
    "고주파",
    "질화",
    "질화+고주파",
    "기타",
  ],
  shot: ["쇼트"],
  cleaning: ["세척", "세청"],
};

export function getProductProcessDetailOptions(categoryId) {
  if (!categoryId) return [];
  return PRODUCT_PROCESS_DETAILS[categoryId] ?? [];
}

export function resolveProductProcessLabel(processCategory, processDetail, fallbackProcess = "") {
  const detail = String(processDetail ?? "").trim();
  if (detail) return detail;
  return String(fallbackProcess ?? "").trim();
}

export function inferProcessCategoryFromDetail(processDetail, fallbackProcess = "") {
  const value = String(processDetail ?? fallbackProcess ?? "").trim();
  if (!value) return "";
  if (value === "쇼트") return "shot";
  if (value === "세척" || value === "세청") return "cleaning";
  if ((PRODUCT_PROCESS_DETAILS.heatTreatment ?? []).includes(value)) return "heatTreatment";
  return "heatTreatment";
}

export const PRODUCT_PROCESS_SELECTION_NOTE = TITAN_PROCESS_MASTER_V2_PLANNED.note;