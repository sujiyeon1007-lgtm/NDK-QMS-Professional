/**
 * Project TITAN V1.0 — 문서관리 (Document Management) REV.3 FINAL
 * TITAN 핵심 모듈 · mesManagementNo · 품번 기준 Revision
 */

/** TITAN 핵심 정체성 — REV.3 FINAL (MES 관리번호) */
export const TITAN_CORE_IDENTITY = {
  headline:
    "MES 관리번호(mesManagementNo)를 중심으로 모든 품질 정보를 연결하는 열처리 전문 QMS",
  relationToMes:
    "MES가 관리번호·Master·입출고를 생성 · TITAN은 조회 후 품질(QMS)만 수행",
  primaryKey: "mesManagementNo",
  example: "DL260702-016",
};

export const DOCUMENT_MANAGEMENT_HIERARCHY = [
  "partNo",
  "revision",
  "approver",
  "revisionDate",
  "pdf",
  "history",
];

export const DATA_DOMAIN_SEPARATION = {
  production: {
    owner: "mes",
    mode: "read-focused",
    examples: ["입고", "출고", "재고", "생산", "관리번호", "LOT"],
  },
  qualityDocuments: {
    owner: "titan",
    mode: "version-control",
    capabilities: ["개정이력", "승인", "검색", "연결", "자동연결"],
  },
};

export const DOCUMENT_TYPE_LEGACY_ALIASES = {
  sop: "work_standard",
  customer_spec: "customer_requirement",
  photo: "product_photo",
  other: "quality_other",
};

/** @type {Array<{ value: string, label: string, autoLinkOnInspection?: boolean, legacy?: boolean }>} */
export const QUALITY_DOCUMENT_TYPES = [
  { value: "drawing", label: "도면", autoLinkOnInspection: true },
  { value: "inspection_standard", label: "검사기준서", autoLinkOnInspection: true },
  { value: "control_plan", label: "관리계획서", autoLinkOnInspection: true },
  { value: "work_standard", label: "작업표준서", autoLinkOnInspection: true },
  { value: "fmea", label: "FMEA", autoLinkOnInspection: false },
  { value: "customer_requirement", label: "고객 요구사항", autoLinkOnInspection: false },
  { value: "concession", label: "특채 승인서", autoLinkOnInspection: false },
  { value: "ncr", label: "NCR", autoLinkOnInspection: false },
  { value: "quality_notice", label: "품질 공지", autoLinkOnInspection: false },
  { value: "quality_other", label: "기타 품질 문서", autoLinkOnInspection: false },
  { value: "sop", label: "SOP", autoLinkOnInspection: false, legacy: true },
  { value: "customer_spec", label: "고객사양서", autoLinkOnInspection: false, legacy: true },
  { value: "photo", label: "제품사진", autoLinkOnInspection: false, legacy: true },
  { value: "other", label: "기타", autoLinkOnInspection: false, legacy: true },
];

export const INSPECTION_AUTO_LINK_DOCUMENT_TYPES = QUALITY_DOCUMENT_TYPES.filter(
  (item) => item.autoLinkOnInspection
).map((item) => item.value);

export const QUALITY_DOCUMENT_TYPE_OPTIONS = QUALITY_DOCUMENT_TYPES.filter((item) => !item.legacy);

/** MES 관리번호 허브 — 품질 연결 (REV.3 FINAL) */
export const TRACE_ID_HUB_FLOW = [
  "mesManagementNo (MES 생성)",
  "품질접수",
  "LOT",
  "생산일보",
  "검사",
  "조직사진",
  "성적서",
  "출고",
  "QR",
  "품질이력",
];

export function resolveQualityDocumentType(typeValue) {
  const raw = String(typeValue ?? "").trim();
  const canonical = DOCUMENT_TYPE_LEGACY_ALIASES[raw] ?? raw;
  return (
    QUALITY_DOCUMENT_TYPES.find((item) => item.value === canonical) ??
    QUALITY_DOCUMENT_TYPES.find((item) => item.value === raw) ?? {
      value: canonical || "quality_other",
      label: "기타 품질 문서",
      autoLinkOnInspection: false,
    }
  );
}

export function getInspectionAutoLinkDocumentPlan(partNo) {
  void partNo;
  return INSPECTION_AUTO_LINK_DOCUMENT_TYPES.map((type) => {
    const meta = resolveQualityDocumentType(type);
    return { type: meta.value, label: meta.label };
  });
}
