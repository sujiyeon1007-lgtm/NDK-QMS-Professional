/**
 * Project TITAN V1.0 — 거래처별 제품단가 · 이력 · 거래명세서 금액 (Sprint 2 설계)
 *
 * Block 2(입고등록) · Block 6(SQLite) · 출고 Sprint(거래명세서) 연동 준비
 * - 단가는 거래처+품번 기준 · 고정값 아님
 * - 이력 관리 → 과거 거래명세서는 당시 단가 유지 (입고 스냅샷)
 */

/** @typedef {'active' | 'closed'} CustomerPriceStatus */

/**
 * @typedef {object} CustomerMasterProfile
 * @property {string} id
 * @property {string} name — 거래처명
 * @property {string} [manager] — 담당자
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [address]
 * @property {string} [bizNo] — 사업자등록번호
 * @property {string} [ceoName] — 대표자
 * @property {string} [paymentTerms] — 기본 결제조건 (추후)
 */

/**
 * @typedef {object} CustomerProductPriceHistory
 * @property {string} id
 * @property {string} company — 거래처명
 * @property {string} partNo — 품번
 * @property {number} unitPrice — 단가(원)
 * @property {string} effectiveFrom — 적용 시작일 (YYYY-MM-DD)
 * @property {string} [effectiveTo] — 적용 종료일 (YYYY-MM-DD, 종료 시)
 * @property {CustomerPriceStatus} status — active | closed
 * @property {string} [note]
 * @property {string} createdAt
 */

/**
 * 입고 등록 시 관리번호에 저장되는 단가 스냅샷 (거래명세서 Traceability)
 * @typedef {object} InboundPricingSnapshot
 * @property {string} managementId
 * @property {string} company
 * @property {string} partNo
 * @property {number} qty
 * @property {string} unit — EA · kg 등
 * @property {number} unitPrice — 입고 시점 적용 단가 (수정 가능)
 * @property {string} [priceHistoryId] — 기준 이력 ID
 * @property {boolean} [unitPriceOverridden] — 기준 단가 대비 수정 여부
 * @property {number} supplyAmount — qty × unitPrice
 * @property {number} vat — 부가세 10%
 * @property {number} totalAmount — 합계금액
 * @property {string} pricedAt — ISO datetime
 */

export const CUSTOMER_PRICE_STATUS = {
  ACTIVE: "active",
  CLOSED: "closed",
};

export const VAT_RATE = 0.1;

/**
 * 수량 × 단가 → 공급가액 · 부가세 · 합계 (출고 Sprint에서 거래명세서 출력)
 * @param {number} qty
 * @param {number} unitPrice
 */
export function calculateTransactionStatementAmounts(qty, unitPrice) {
  const safeQty = Number(qty) || 0;
  const safePrice = Number(unitPrice) || 0;
  const supplyAmount = Math.round(safeQty * safePrice);
  const vat = Math.round(supplyAmount * VAT_RATE);
  const totalAmount = supplyAmount + vat;

  return {
    qty: safeQty,
    unitPrice: safePrice,
    supplyAmount,
    vat,
    totalAmount,
  };
}

/**
 * @param {CustomerProductPriceHistory[]} history
 * @param {string} company
 * @param {string} partNo
 * @param {string} [asOfDate] — YYYY-MM-DD (기본: 금일)
 * @returns {CustomerProductPriceHistory | null}
 */
export function resolveEffectiveCustomerUnitPrice(history = [], company, partNo, asOfDate) {
  const date = asOfDate || new Date().toISOString().slice(0, 10);
  const companyKey = String(company ?? "").trim();
  const partKey = String(partNo ?? "").trim();
  if (!companyKey || !partKey) return null;

  const candidates = history
    .filter(
      (row) =>
        row.company === companyKey &&
        row.partNo === partKey &&
        row.effectiveFrom <= date &&
        (row.status === CUSTOMER_PRICE_STATUS.ACTIVE || !row.effectiveTo || row.effectiveTo >= date)
    )
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

  return candidates[0] ?? null;
}

/**
 * 입고 등록용 pricing 스냅샷 생성 (관리번호 단위 저장)
 * @param {object} params
 * @param {string} params.managementId
 * @param {string} params.company
 * @param {string} params.partNo
 * @param {number} params.qty
 * @param {string} [params.unit]
 * @param {number} params.unitPrice
 * @param {string} [params.priceHistoryId]
 * @param {boolean} [params.unitPriceOverridden]
 * @returns {InboundPricingSnapshot}
 */
export function buildInboundPricingSnapshot({
  managementId,
  company,
  partNo,
  qty,
  unit = "EA",
  unitPrice,
  priceHistoryId = "",
  unitPriceOverridden = false,
}) {
  const amounts = calculateTransactionStatementAmounts(qty, unitPrice);

  return {
    managementId,
    company,
    partNo,
    qty: amounts.qty,
    unit,
    unitPrice: amounts.unitPrice,
    priceHistoryId,
    unitPriceOverridden,
    supplyAmount: amounts.supplyAmount,
    vat: amounts.vat,
    totalAmount: amounts.totalAmount,
    pricedAt: new Date().toISOString(),
  };
}
