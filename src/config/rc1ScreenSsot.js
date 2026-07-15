/**
 * RC1 screen data contracts (PM Final).
 *
 * This is documentation/config only. Screen code must use the domain helpers
 * named here instead of reading legacy quantity aliases directly.
 */
export const RC1_SCREEN_SSOT = Object.freeze({
  companyManagement: { source: "companyMaster", quantityField: null },
  productManagement: { source: "productMaster", quantityField: null },
  inboundRegister: { source: "inbound", quantityField: "inboundQty", lotAllowed: false },
  inboundHistory: { source: "inbound", quantityField: "inboundQty", lotAllowed: false },
  productionWaiting: {
    source: "inbound",
    quantityField: "remainingChargeQty",
    quantityResolver: "resolveRemainingChargeQty",
  },
  equipmentStatus: {
    source: "chargeHistory",
    quantityField: "chargeQty",
    quantityResolver: "resolveChargeQty",
  },
  productionDailyReport: {
    source: "chargeHistory",
    quantityField: "chargeQty",
    quantityResolver: "resolveChargeQty",
  },
  productionHistory: {
    source: "chargeHistory",
    quantityField: "chargeQty",
    quantityResolver: "resolveChargeQty",
  },
  /** 품질 = LOT-centric (검사등록 · 검사대기 · 성적서) — 제품 집계 ❌ */
  qualityManagement: {
    source: "chargeHistory",
    quantityField: "chargeQty",
    quantityResolver: "resolveChargeQty",
    rowModel: "lot",
  },
  certificateManagement: {
    source: "chargeHistory",
    quantityField: "chargeQty",
    quantityResolver: "resolveChargeQty",
    rowModel: "lot",
  },
  /**
   * 출고등록 — Product-centric UI + LOT-centric DB
   * UI: company+partNo(+partName) 집계 · 출고가능 = sum(shippable chargeQty)
   * DB: FIFO LOT 배분 → shipment events per LOT (chargeHistory traceability)
   */
  outboundManagement: {
    source: "inspectionCompleteLots",
    uiSource: "productAggregation",
    quantityField: "availableShipQty",
    quantityResolver: "resolveOutboundProductAvailableQty",
    rowModel: "product",
    dbAllocation: "lotFifo",
    allocationSource: "chargeHistory",
  },
  /** 출고이력 — shipment events · 목록은 제품 집계 가능, LOT는 상세/Trace */
  outboundHistory: {
    source: "shipment",
    quantityField: "shipQty",
    rowModel: "product",
  },
  lotHistory: { source: "lot", quantityField: "chargeQty" },
});

export const SCREEN_QTY_FIELD = Object.freeze(
  Object.fromEntries(
    Object.entries(RC1_SCREEN_SSOT).map(([screen, contract]) => [screen, contract.quantityField])
  )
);
