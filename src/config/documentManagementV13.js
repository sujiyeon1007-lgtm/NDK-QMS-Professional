/**
 * Project TITAN V1.4 — 문서관리 (PM Final · 업체 중심 · 기술문서)
 */

/** Popup 사용자 폴더 — PM 기본값 */
export const DEFAULT_DOCUMENT_FOLDERS = [
  { id: "all", label: "전체 폴더" },
  { id: "drawing", label: "도면" },
  { id: "inspection_standard", label: "검사기준서" },
  { id: "work_standard", label: "작업표준서" },
  { id: "audit", label: "감사자료" },
  { id: "customer", label: "고객자료" },
  { id: "other", label: "기타" },
];

const FOLDER_TYPE_MAP = {
  drawing: ["drawing"],
  inspection_standard: ["inspection_standard", "control_plan", "check_sheet"],
  work_standard: ["work_standard", "sop"],
  audit: ["fmea", "ncr", "concession", "test_certificate"],
  customer: ["customer_requirement", "customer_spec", "contract"],
  other: ["quality_other", "other", "photo"],
};

/** 게시판/공지 — 문서관리 대상 외 (HOME 공지 등 별도) */
export const DOCUMENT_MANAGEMENT_EXCLUDED_TYPES = ["quality_notice"];

/** Popup 상단 가로 탭 — PM V1.4 (기술문서 · 품목별/업체 공통) */
export const DOCUMENT_PRODUCT_LINKED_TAB_IDS = [
  "drawing",
  "work_standard",
  "inspection_standard",
];

export const DOCUMENT_CATEGORY_TABS = [
  { id: "all", label: "전체", types: null, scope: "company" },
  { id: "drawing", label: "도면", types: ["drawing"], scope: "product" },
  { id: "work_standard", label: "작업표준서", types: ["work_standard", "sop"], scope: "product" },
  {
    id: "inspection_standard",
    label: "검사기준서",
    types: ["inspection_standard", "control_plan", "check_sheet"],
    scope: "product",
  },
  {
    id: "other",
    label: "기타",
    types: [
      "quality_other",
      "other",
      "photo",
      "fmea",
      "ncr",
      "concession",
      "test_certificate",
      "customer_requirement",
      "customer_spec",
      "contract",
    ],
    scope: "company",
  },
];

export function isDocumentManagementEligible(row) {
  if (!row) return false;
  if (row.source === "quality-notice") return false;
  const type = String(row.documentType ?? "").trim();
  return type && !DOCUMENT_MANAGEMENT_EXCLUDED_TYPES.includes(type);
}

export function isDocumentManagementEligibleType(documentType) {
  const type = String(documentType ?? "").trim();
  return type && !DOCUMENT_MANAGEMENT_EXCLUDED_TYPES.includes(type);
}

export function isProductLinkedDocumentTab(tabId = "all") {
  return DOCUMENT_PRODUCT_LINKED_TAB_IDS.includes(tabId);
}

export function resolveDocumentTabScope(tabId = "all") {
  const tab = DOCUMENT_CATEGORY_TABS.find((item) => item.id === tabId);
  return tab?.scope ?? "company";
}

/** @deprecated DOCUMENT_CATEGORY_TABS 사용 */
export const DOCUMENT_MANAGEMENT_TYPE_FILTERS = DOCUMENT_CATEGORY_TABS;

export function resolveDocumentFilterTypes(filterId) {
  const filter = DOCUMENT_MANAGEMENT_TYPE_FILTERS.find((item) => item.id === filterId);
  return filter?.types ?? null;
}

export function matchesDocumentTypeFilter(row, filterId = "all") {
  if (!isDocumentManagementEligible(row)) return false;
  const types = resolveDocumentFilterTypes(filterId);
  if (!types) return true;
  return types.includes(row.documentType);
}

export function resolveDefaultFolder(documentType) {
  const entry = Object.entries(FOLDER_TYPE_MAP).find(([, types]) => types.includes(documentType));
  if (!entry) return "기타";
  const folder = DEFAULT_DOCUMENT_FOLDERS.find((item) => item.id === entry[0]);
  return folder?.label ?? "기타";
}

export function resolveFolderFilterLabel(folderId) {
  return DEFAULT_DOCUMENT_FOLDERS.find((item) => item.id === folderId)?.label ?? "";
}

export function matchesDocumentFolderFilter(row, folderId = "all") {
  if (!folderId || folderId === "all") return true;
  const folderLabel = resolveFolderFilterLabel(folderId);
  if (folderLabel && row.folder === folderLabel) return true;
  const types = FOLDER_TYPE_MAP[folderId];
  if (types) return types.includes(row.documentType);
  return false;
}

export function createEmptyDocumentPopupSearch() {
  return {
    query: "",
  };
}

export function matchesUnifiedDocumentSearch(row, query = "") {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    row.title,
    row.documentNo,
    row.revision,
    row.registeredBy,
    row.description,
    row.folder,
    ...(row.tags ?? []),
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");

  return haystack.includes(q);
}

/** @returns {'ok'|'warning'|'danger'|'expired'} */
export function computeDocumentExpiryStatus(validUntil) {
  const raw = String(validUntil ?? "").trim();
  if (!raw) {
    return { level: "ok", label: "", daysLeft: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) {
    return { level: "ok", label: "", daysLeft: null };
  }

  const diffMs = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { level: "expired", label: "만료", daysLeft };
  }
  if (daysLeft === 0) {
    return { level: "danger", label: "금일 만료", daysLeft };
  }
  if (daysLeft <= 7) {
    return { level: "danger", label: `${daysLeft}일 후 만료`, daysLeft };
  }
  if (daysLeft <= 30) {
    return { level: "warning", label: `${daysLeft}일 후 만료`, daysLeft };
  }
  return { level: "ok", label: "", daysLeft };
}

export function formatDocumentRelativeTime(iso) {
  if (!iso) return "—";
  const viewed = new Date(iso);
  if (Number.isNaN(viewed.getTime())) return "—";

  const diffMs = Date.now() - viewed.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days === 0) return "금일";
  if (days === 1) return "전일";
  return `${days}일 전`;
}

export function resolvePreviewKind(row) {
  const mime = String(row?.mimeType ?? "").toLowerCase();
  const name = String(row?.pdfFileName ?? row?.fileName ?? "").toLowerCase();

  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/.test(name)) {
    return "image";
  }
  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    /\.docx?$/.test(name)
  ) {
    return "word";
  }
  if (
    mime.includes("sheet") ||
    mime.includes("excel") ||
    /\.xlsx?$/.test(name)
  ) {
    return "excel";
  }
  return "unknown";
}
