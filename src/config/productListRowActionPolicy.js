/**
 * Project TITAN V1.3 — Product list row action policy (per screen)
 * @see .cursor/rules/project-titan-product-list-v1.3.mdc
 */

/** Screen keys for V1.3 product list action columns */
export const PRODUCT_LIST_ACTION_SCREENS = {
  INBOUND: "inbound",
  PRODUCTION: "production",
  INSPECTION: "inspection",
  CERTIFICATE: "certificate",
  OUTBOUND: "outbound",
  DOCUMENTS: "documents",
  INVENTORY: "inventory",
  QR_INOUT: "qrInout",
};

/** Expected action buttons per screen (detail is always first via TitanTableRowActions) */
export const PRODUCT_LIST_ROW_ACTIONS = {
  [PRODUCT_LIST_ACTION_SCREENS.INBOUND]: ["상세", "수정", "삭제"],
  [PRODUCT_LIST_ACTION_SCREENS.PRODUCTION]: ["상세", "완료", "취소"],
  [PRODUCT_LIST_ACTION_SCREENS.INSPECTION]: ["상세", "등록", "수정", "삭제"],
  [PRODUCT_LIST_ACTION_SCREENS.CERTIFICATE]: ["상세", "발행", "수정", "취소"],
  [PRODUCT_LIST_ACTION_SCREENS.OUTBOUND]: ["상세", "출고", "수정", "취소"],
  [PRODUCT_LIST_ACTION_SCREENS.DOCUMENTS]: ["상세", "등록", "수정", "삭제"],
  [PRODUCT_LIST_ACTION_SCREENS.INVENTORY]: ["상세", "수정"],
  [PRODUCT_LIST_ACTION_SCREENS.QR_INOUT]: ["상세", "출력", "재생성", "삭제"],
};
