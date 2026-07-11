/**
 * Project TITAN V1.3 — 검사관리 3탭 (양산 · 개발 · 기타)
 */

export const INSPECTION_MANAGEMENT_TABS = [
  { id: "mass", label: "양산검사", path: "/quality/inspection/mass" },
  { id: "dev", label: "개발검사", path: "/quality/inspection/dev" },
  { id: "other", label: "기타검사", path: "/quality/inspection/other" },
];

/** 검사등록 화면 — 양산 · 개발 · 기타 Tab (RC1) */
export const INSPECTION_REGISTER_TABS = [
  { id: "mass", label: "양산검사", path: "/quality/inspection/register" },
  { id: "dev", label: "개발검사", path: "/quality/inspection/register?tab=dev" },
  { id: "other", label: "기타검사", path: "/quality/inspection/register?tab=other" },
];

export const INSPECTION_TAB_IDS = INSPECTION_MANAGEMENT_TABS.map((tab) => tab.id);

export const MASS_INSPECTION_STATUS = {
  NOT_DONE: "미검사",
  DONE: "검사완료",
  /** @deprecated */
  WAIT: "미검사",
};

export const MASS_INSPECTION_STATUS_OPTIONS = ["미검사", "검사완료"];

export const DEVELOPMENT_INSPECTION_STATUS = ["대기", "진행중", "완료", "보류"];

export const OTHER_INSPECTION_STATUS = ["대기", "진행중", "완료", "보류"];

/** RC1 P1-QUALITY-002 — 기타검사 검사 구분 (config array · extensible) */
export const OTHER_INSPECTION_KIND_OPTIONS = [
  { value: "customer_request", label: "업체 검사의뢰" },
  { value: "internal", label: "사내 자체검사" },
  { value: "test_piece", label: "시험편" },
  { value: "equipment_verification", label: "설비검증" },
];

/** @deprecated display alias — use OTHER_INSPECTION_KIND_OPTIONS */
export const OTHER_INSPECTION_CATEGORIES = OTHER_INSPECTION_KIND_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const INSPECTION_TYPE = Object.freeze({
  MASS: "mass",
  DEVELOPMENT: "development",
});

export const INSPECTION_TYPE_OPTIONS = Object.freeze([
  { value: INSPECTION_TYPE.MASS, label: "양산" },
  { value: INSPECTION_TYPE.DEVELOPMENT, label: "개발" },
]);

export const INSPECTION_CATEGORY = Object.freeze({
  MASS: "mass",
  DEVELOPMENT: "development",
  OTHER: "other",
});

const OTHER_KIND_VALUES = new Set(OTHER_INSPECTION_KIND_OPTIONS.map((item) => item.value));

const LEGACY_OTHER_KIND_MAP = Object.freeze({
  업체의뢰: "customer_request",
  "업체 검사의뢰": "customer_request",
  자체검사: "internal",
  "사내 자체검사": "internal",
  시험편: "test_piece",
  설비: "equipment_verification",
  설비검증: "equipment_verification",
  게이지: "equipment_verification",
  기타: "internal",
});

export function normalizeInspectionType(value, fallback = INSPECTION_TYPE.MASS) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === INSPECTION_TYPE.DEVELOPMENT || raw === "dev" || raw === "development") {
    return INSPECTION_TYPE.DEVELOPMENT;
  }
  if (raw === INSPECTION_TYPE.MASS || raw === "mass") {
    return INSPECTION_TYPE.MASS;
  }
  return fallback;
}

export function resolveRecordInspectionType(record) {
  return normalizeInspectionType(record?.inspectionType, INSPECTION_TYPE.MASS);
}

export function getProductInspectionType(product) {
  return normalizeInspectionType(product?.inspectionType, INSPECTION_TYPE.MASS);
}

export function getInspectionTypeLabel(value) {
  const normalized = normalizeInspectionType(value);
  return INSPECTION_TYPE_OPTIONS.find((item) => item.value === normalized)?.label ?? "양산";
}

export function normalizeOtherInspectionKind(value, fallback = "internal") {
  const raw = String(value ?? "").trim();
  if (OTHER_KIND_VALUES.has(raw)) return raw;
  return LEGACY_OTHER_KIND_MAP[raw] ?? fallback;
}

export function getOtherInspectionKindLabel(value) {
  const kind = normalizeOtherInspectionKind(value);
  return OTHER_INSPECTION_KIND_OPTIONS.find((item) => item.value === kind)?.label ?? kind;
}

export function resolveLogInspectionCategory(log) {
  if (log?.inspectionCategory) return log.inspectionCategory;
  if (log?.category === "기타") return INSPECTION_CATEGORY.OTHER;
  if (log?.category === "개발" || log?.inspectionType === INSPECTION_TYPE.DEVELOPMENT) {
    return INSPECTION_CATEGORY.DEVELOPMENT;
  }
  return INSPECTION_CATEGORY.MASS;
}

export function resolveLogInspectionType(log) {
  if (log?.inspectionType) return normalizeInspectionType(log.inspectionType);
  if (log?.category === "개발") return INSPECTION_TYPE.DEVELOPMENT;
  return INSPECTION_TYPE.MASS;
}

export function matchesRecordInspectionTypeFilter(record, filterType) {
  if (!filterType) return true;
  return resolveRecordInspectionType(record) === normalizeInspectionType(filterType);
}

export function resolveInspectionCategoryFromLegacy(categoryLabel) {
  const label = String(categoryLabel ?? "").trim();
  if (label === "개발") return INSPECTION_CATEGORY.DEVELOPMENT;
  if (label === "기타") return INSPECTION_CATEGORY.OTHER;
  return INSPECTION_CATEGORY.MASS;
}

export function resolveInspectionLogMetaFromContext({
  categoryLabel = "양산",
  managementId = "",
  record = null,
  otherRecord = null,
} = {}) {
  const legacyCategory = String(categoryLabel ?? "").trim() || "양산";
  const inspectionCategory = resolveInspectionCategoryFromLegacy(legacyCategory);

  if (inspectionCategory === INSPECTION_CATEGORY.OTHER) {
    const otherInspectionKind = normalizeOtherInspectionKind(
      otherRecord?.otherInspectionKind ?? otherRecord?.category
    );
    return {
      category: "기타",
      inspectionType: INSPECTION_TYPE.MASS,
      inspectionCategory: INSPECTION_CATEGORY.OTHER,
      otherInspectionKind,
    };
  }

  if (inspectionCategory === INSPECTION_CATEGORY.DEVELOPMENT) {
    return {
      category: "개발",
      inspectionType: INSPECTION_TYPE.DEVELOPMENT,
      inspectionCategory: INSPECTION_CATEGORY.DEVELOPMENT,
      otherInspectionKind: "",
    };
  }

  const inspectionType = record ? resolveRecordInspectionType(record) : INSPECTION_TYPE.MASS;

  return {
    category: "양산",
    inspectionType,
    inspectionCategory: INSPECTION_CATEGORY.MASS,
    otherInspectionKind: "",
    managementId: managementId?.trim() || record?.id || "",
  };
}

export const RESERVED_INSPECTION_ROUTE_PARAMS = ["register"];

export function resolveInspectionTab(tabParam) {
  if (RESERVED_INSPECTION_ROUTE_PARAMS.includes(tabParam)) return null;
  if (INSPECTION_TAB_IDS.includes(tabParam)) return tabParam;
  return "mass";
}

export function resolveInspectionRegisterTab(tabParam) {
  const raw = String(tabParam ?? "").trim().toLowerCase();
  if (raw === "dev" || raw === "development") return "dev";
  if (raw === "other") return "other";
  return "mass";
}

export function getInspectionTabDef(tabId) {
  return INSPECTION_MANAGEMENT_TABS.find((tab) => tab.id === tabId) ?? INSPECTION_MANAGEMENT_TABS[0];
}
