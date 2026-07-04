/**
 * Project TITAN — 경리관리 / 세금계산서 정책 (V1.0 PM Final)
 * SSoT: UI labels · workflow · feature scope
 */

/** TITAN은 ERP/홈택스 대체 ❌ — 발행 여부·이력 관리만 */
export const ACCOUNTING_CLERK_PHILOSOPHY = {
  headline: "TITAN은 ERP를 대체하지 않습니다.",
  body:
    "기존 운영(홈택스 전자세금계산서 발행)을 유지하고, TITAN에서는 거래명세서·마감·미수금·매출·세금계산서 발행 여부를 관리·조회합니다.",
  taxInvoiceNotice:
    "전자세금계산서는 국세청 홈택스에서 발행 · TITAN은 발행 여부·이력만 관리",
};

/** V1.0 포함 기능 */
export const ACCOUNTING_CLERK_V1_FEATURES = [
  { id: "invoiceMgmt", label: "거래명세서 관리", status: "planned" },
  { id: "invoiceReprint", label: "거래명세서 재출력", status: "planned", link: "outbound" },
  { id: "invoiceHistory", label: "거래명세서 발행이력", status: "planned" },
  { id: "outboundClosing", label: "출고 마감", status: "planned" },
  { id: "monthlyClose", label: "월 마감", status: "planned" },
  { id: "receivables", label: "미수금 관리", status: "planned" },
  { id: "salesByCompany", label: "거래처별 매출 조회", status: "planned" },
  {
    id: "taxInvoiceStatus",
    label: "세금계산서 발행 여부 관리",
    status: "active",
    path: "/accounting-clerk/tax-invoices",
    note: "홈택스 발행 후 TITAN에 발행여부·발행일·담당자 등록",
  },
  { id: "salesStatistics", label: "매출 통계", status: "planned" },
];

/** V2.0+ 제외 — 구현 금지 */
export const ACCOUNTING_CLERK_V2_EXCLUDED_FEATURES = [
  { id: "eTaxDirectIssue", label: "전자세금계산서 직접 발행", reason: "홈택스에서 발행" },
  { id: "hometaxApi", label: "홈택스 API 연동", reason: "V1.0 범위 외" },
  { id: "certAuth", label: "공동인증서 연동", reason: "V1.0 범위 외" },
  { id: "ntsAutoSend", label: "국세청 자동 전송", reason: "V1.0 범위 외" },
];

/** Workflow: 출고완료 → 거래명세서 → (HomeTax) → TITAN 발행여부 → 이력 → 매출통계 */
export const ACCOUNTING_CLERK_WORKFLOW_STEPS = [
  { order: 1, id: "outboundDone", label: "출고완료" },
  { order: 2, id: "statement", label: "거래명세서 출력" },
  { order: 3, id: "hometax", label: "홈택스 발행", external: true },
  { order: 4, id: "titanStatus", label: "TITAN 발행여부 등록" },
  { order: 5, id: "history", label: "발행 이력 조회" },
  { order: 6, id: "salesStats", label: "매출 통계" },
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

export const ACCOUNTING_CLERK_STUB_MESSAGE = "준비 중입니다.";

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
