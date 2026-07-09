/**
 * Project TITAN V1.0 — 문서관리 (Document Management) REV.4
 * TITAN 핵심 모듈 · mesManagementNo · 품번 기준 Revision
 * 품질 공지(Quality Notice) = 문서 종류 · 독립 게시판 ❌
 */

/** REV.4 — 일반 게시판 미운영 · 품질 공지는 Document Management 하위 */
export const DOCUMENT_MANAGEMENT_POLICY = {
  revision: "REV.4",
  generalBulletinBoard: false,
  qualityNoticeIntegration:
    "공지사항(독립 메뉴) ❌ → Document Management 하위 품질 공지(Quality Notice)",
  adminPath: "/documents",
  adminPathNote: "Sidebar 문서관리 — 기준 문서 · Revision · 승인 · PDF · 문서이력",
  v1Scope: ["등록", "조회"],
  v2Scope: ["읽음(ACK)"],
};

/** V1.0.1 — PM Blueprint only. No UI/router/runtime implementation. */
export const DOCUMENT_MANAGEMENT_V101_RESTRUCTURING_POLICY = Object.freeze({
  revision: "V1.0.1-blueprint",
  status: "architecture-only",
  implementationAllowed: false,
  docPath: "docs/blueprints/V2.0/document-management-v101.md",
  topLevelWorkspaceUnchanged: true,
  frozenV20WorkspaceOrderUnchanged: true,
  workspaces: [
    {
      id: "qualityDocumentManagement",
      labelKey: "qualityDocumentManagement",
      role: "qms-revision-approval",
      composition: ["dashboard", "list", "revManagement", "approvalStatus"],
      documentTypes: [
        "quality_manual",
        "procedure",
        "work_standard",
        "inspection_standard",
        "control_plan",
        "quality_drawing",
        "quality_form",
        "inspection_form",
        "training_material",
        "quality_other",
      ],
      features: [
        "revManagement",
        "currentVersion",
        "revisionHistory",
        "approvalStatus",
        "approvalHistory",
        "attachments",
        "onDemandQr",
        "pdfPreview",
        "relatedLot",
        "relatedProduct",
      ],
      searchFields: [
        "documentName",
        "documentNo",
        "revision",
        "registeredDate",
        "status",
        "registrant",
      ],
      detailTabs: [
        "basicInfo",
        "attachments",
        "qr",
        "relatedInfo",
        "memo",
        "revisionHistory",
        "approvalHistory",
      ],
    },
    {
      id: "internalDocumentManagement",
      labelKey: "internalDocumentManagement",
      role: "company-archive-search",
      composition: ["dashboard", "incomingArchive", "outgoingDocuments", "generalDocuments"],
      documentTypes: [
        "purchase_order",
        "customer_drawing",
        "release_slip",
        "mtc",
        "customer_request",
        "supplier_transaction_statement",
        "tax_invoice",
        "certificate",
        "transaction_statement",
        "outbound_slip",
        "contract",
        "quotation",
        "meeting_material",
        "photo",
        "internal_other",
      ],
      features: [
        "attachments",
        "search",
        "pdfPreview",
        "onDemandQr",
        "relatedCompany",
        "optionalRelatedLot",
      ],
      searchFields: [
        "company",
        "documentType",
        "documentName",
        "orderNo",
        "registeredDate",
        "receivedDate",
        "memo",
      ],
      detailTabs: ["basicInfo", "attachments", "qr", "relatedInfo", "memo"],
    },
  ],
  foundationReuse: {
    detailPopup: "TitanStandardDetailPopup",
    attachmentPanel: "FoundationAttachment",
    qrPanel: "FoundationQrPanel",
  },
  qrPolicy: {
    autoGenerateOnRegistration: false,
    generateOnlyFromDetailPopup: true,
    tabId: "qr",
    panel: "FoundationQrPanel",
  },
  incomingArchivePolicy: {
    forceInboundLink: false,
    optionalLinks: ["inbound", "lot", "product", "company"],
    validWithoutLinks: true,
  },
  developmentPrinciples: [
    "Foundation Detail Popup",
    "Foundation Attachment",
    "Foundation QR Panel",
    "Additive Development",
    "Minimal CRUD Changes",
    "Build -> Browser QA -> PM Review -> Official Freeze",
  ],
});

/** 품질 공지 — 문서 종류별 필드 (Revision 모델과 별도) */
export const QUALITY_NOTICE_FIELDS = [
  { key: "title", label: "제목", required: true },
  { key: "body", label: "내용", required: true },
  { key: "author", label: "작성자", required: true },
  { key: "createdDate", label: "작성일", required: true },
  { key: "effectiveDate", label: "적용일", required: true },
  { key: "attachments", label: "첨부파일", required: false },
  { key: "relatedPartNo", label: "관련 품번", required: false },
  { key: "relatedMaterial", label: "관련 재질", required: false },
  { key: "relatedDocuments", label: "관련 문서", required: false },
  { key: "status", label: "상태", required: true },
];

export const QUALITY_NOTICE_STATUS = [
  { value: "active", label: "공지중" },
  { value: "closed", label: "종료" },
];

/** 향후 — Revision/기준 변경 시 품질 공지 자동 생성 (V1.1+) */
export const QUALITY_NOTICE_AUTO_GENERATION = [
  "Revision 변경",
  "검사기준 변경",
  "도면 변경",
  "고객 요구사항 변경",
];

/** TITAN 핵심 정체성 — REV.3 FINAL (MES 관리번호) */
export const TITAN_CORE_IDENTITY = {
  headline:
    "MES 관리번호(mesManagementNo)를 중심으로 생산·품질 정보를 연결하는 열처리 전문 PQMS",
  relationToMes:
    "MES가 관리번호·Master·입출고를 생성 · TITAN은 생산·품질(PQMS) 실무 수행",
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
  { value: "ncr", label: "NCR", autoLinkOnInspection: false },
  { value: "concession", label: "특채 승인서", autoLinkOnInspection: false },
  { value: "quality_notice", label: "품질 공지", autoLinkOnInspection: false, noticeDocument: true },
  { value: "check_sheet", label: "Check Sheet", autoLinkOnInspection: false },
  { value: "test_certificate", label: "시험성적서", autoLinkOnInspection: false },
  { value: "quality_other", label: "기타 품질문서", autoLinkOnInspection: false },
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
      label: "기타 품질문서",
      autoLinkOnInspection: false,
    }
  );
}

export function isQualityNoticeDocumentType(typeValue) {
  return resolveQualityDocumentType(typeValue).value === "quality_notice";
}

export function getInspectionAutoLinkDocumentPlan(partNo) {
  void partNo;
  return INSPECTION_AUTO_LINK_DOCUMENT_TYPES.map((type) => {
    const meta = resolveQualityDocumentType(type);
    return { type: meta.value, label: meta.label };
  });
}
