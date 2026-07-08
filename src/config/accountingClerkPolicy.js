/**
 * Project TITAN — 경리관리 Lite 정책 (Sprint 14 PM Final)
 * SSoT: UI labels · workflow · feature scope
 */

/** TITAN은 ERP 회계 대체 ❌ — 출고/거래명세서 문서 업무 지원만 */
export const ACCOUNTING_CLERK_PHILOSOPHY = {
  headline: "경리관리 Lite는 ERP 회계 시스템이 아닙니다.",
  body:
    "V1.0에서는 출고 데이터와 거래명세서 문서를 중심으로 경리팀이 바로 조회·출력·재출력할 수 있는 Lite 업무를 지원합니다.",
  taxInvoiceNotice:
    "세금계산서·입금·채권·금융 연동은 V1.0에서 Coming Soon으로만 표시합니다.",
  statementNotice:
    "출고관리 → 거래명세서 → 거래처 Master → PDF 출력 흐름만 경리관리 Lite에서 조회·재출력합니다.",
};

/** V1.0 포함 기능 */
export const ACCOUNTING_CLERK_V1_FEATURES = [
  {
    id: "statementManagement",
    label: "거래명세서 관리",
    status: "active",
    path: "/accounting-clerk/statementManagement",
    note: "거래명세서 조회 · 출력 · 발행 이력",
  },
  {
    id: "outboundLink",
    label: "출고 연계",
    status: "active",
    path: "/accounting-clerk/statementManagement?view=outbound",
    note: "출고 데이터 자동 조회 · 거래명세서 자동 작성",
  },
  {
    id: "companyLookup",
    label: "거래처 조회",
    status: "active",
    path: "/accounting-clerk/companyLookup",
    note: "거래처 정보 · 사업자 정보 · 담당자 정보",
  },
  {
    id: "documentLookup",
    label: "발행 문서 조회",
    status: "active",
    path: "/accounting-clerk/documentLookup",
    note: "거래명세서 · 출고 관련 문서 · PDF 재출력",
  },
  {
    id: "statementReprint",
    label: "PDF 재출력",
    status: "active",
    path: "/accounting-clerk/statementManagement?view=reprint",
    note: "기존 거래명세서 PDF 재출력",
  },
  {
    id: "shipmentStatistics",
    label: "출고 통계",
    status: "active",
    path: "/accounting-clerk/shipmentStatistics",
    note: "월별 · 거래처별 · 품목별 출고 요약",
  },
  { id: "todayReceipts", label: "오늘 입금 예정", status: "comingSoon" },
  { id: "receivables", label: "미수금 관리", status: "comingSoon" },
  { id: "paymentConfirm", label: "입금 확인", status: "comingSoon" },
  { id: "creditManagement", label: "채권 관리", status: "comingSoon" },
  {
    id: "taxInvoice",
    label: "세금계산서 연동",
    status: "comingSoon",
    path: "/accounting-clerk/tax-invoices",
    note: "V1.0에서는 직접 발행·홈택스 연동을 제공하지 않습니다.",
  },
  { id: "financeIntegration", label: "금융 연동", status: "comingSoon" },
  { id: "bankAccounts", label: "계좌 관리", status: "comingSoon" },
];

/** V2.0+ 제외 — 구현 금지 */
export const ACCOUNTING_CLERK_V2_EXCLUDED_FEATURES = [
  { id: "eTaxDirectIssue", label: "전자세금계산서 직접 발행", reason: "홈택스에서 발행" },
  { id: "hometaxApi", label: "홈택스 API 연동", reason: "V1.0 범위 외" },
  { id: "certAuth", label: "공동인증서 연동", reason: "V1.0 범위 외" },
  { id: "ntsAutoSend", label: "국세청 자동 전송", reason: "V1.0 범위 외" },
];

/** Workflow: 출고완료 → 거래명세서 → 거래처 Master → PDF 출력 → 향후 TDE */
export const ACCOUNTING_CLERK_WORKFLOW_STEPS = [
  { order: 1, id: "outboundDone", label: "출고완료" },
  { order: 2, id: "statement", label: "거래명세서" },
  { order: 3, id: "companyMaster", label: "거래처 Master" },
  { order: 4, id: "pdfOutput", label: "PDF 출력" },
  { order: 5, id: "futureTde", label: "향후 TDE", future: true },
];

export const TAX_INVOICE_STATUS = {
  ISSUED: "issued",
  UNISSUED: "unissued",
};

export const TAX_INVOICE_STATUS_LABELS = {
  [TAX_INVOICE_STATUS.ISSUED]: "발행",
  [TAX_INVOICE_STATUS.UNISSUED]: "미발행",
};

export const TAX_INVOICE_STATUS_VARIANTS = {
  [TAX_INVOICE_STATUS.ISSUED]: "complete",
  [TAX_INVOICE_STATUS.UNISSUED]: "wait",
};

/** 세금계산서 관리 화면 컬럼 (PM Final) */
export const TAX_INVOICE_COLUMNS = [
  { key: "company", label: "거래처", widthPercent: 13 },
  { key: "managementId", label: "관리번호", widthPercent: 12 },
  { key: "shippedAt", label: "출고일", widthPercent: 9 },
  { key: "supplyAmount", label: "공급가액", widthPercent: 10, align: "right" },
  { key: "vat", label: "부가세", widthPercent: 9, align: "right" },
  { key: "issueStatus", label: "세금계산서 발행 여부", widthPercent: 12 },
  { key: "issuedAt", label: "발행일", widthPercent: 9 },
  { key: "manager", label: "담당자", widthPercent: 9 },
  { key: "note", label: "비고", widthPercent: 12 },
];

export const TAX_INVOICE_DETAIL_FIELDS = [
  { key: "issueStatus", label: "발행 여부", editable: true, type: "status" },
  { key: "issuedAt", label: "발행일", editable: true, type: "date" },
  { key: "manager", label: "담당자", editable: true, type: "text" },
  { key: "note", label: "비고", editable: true, type: "textarea" },
];

export const TAX_INVOICE_STATUS_OPTIONS = Object.values(TAX_INVOICE_STATUS);

export const ACCOUNTING_CLERK_STUB_MESSAGE = "준비 중 (Coming Soon)";

export function createEmptyTaxInvoiceSearch() {
  return {
    company: "",
    partName: "",
    partNo: "",
    material: "",
    managementId: "",
    issueStatus: "",
    manager: "",
    shippedAtFrom: "",
    shippedAtTo: "",
  };
}

export function formatTaxInvoiceAmount(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("ko-KR");
}

export function getTaxInvoiceFeatureById(id) {
  return ACCOUNTING_CLERK_V1_FEATURES.find((fn) => fn.id === id) ?? null;
}

export function isAccountingClerkFeatureActive(id) {
  return getTaxInvoiceFeatureById(id)?.status === "active";
}
