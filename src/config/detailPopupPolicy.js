/**
 * Project TITAN V1.3 FINAL — Detail Popup (Dialog) Layout Policy
 * supersedes Row Summary Cards · HOME UI Freeze 예외
 *
 * @see .cursor/rules/project-titan-master-detail-v1.3.mdc
 * @see src/config/masterDetailLayoutPolicy.js
 */

export const DETAIL_POPUP_LAYOUT_POLICY = {
  version: "V1.3-detail-popup",
  homeException: true,
  leftWidgetAllowed: false,
  collapsePanelAllowed: false,
  rowSummaryAllowed: false,
  structure: ["검색", "리스트(Table)", "작업 컬럼 [상세] + page actions", "[상세] → Modal/Dialog Tabs"],
  dialog: {
    widthPercent: "80%",
    heightPercent: "85%",
    maxWidth: "xl",
    footerActions: ["닫기"],
  },
  rowInteraction: {
    singleClick: "select",
    doubleClick: "detailPopup",
    editVia: "rowActionButton",
    registerVia: "toolbarOrRowAction",
  },
};

/** @deprecated use DETAIL_POPUP_LAYOUT_POLICY */
export const ROW_SUMMARY_LAYOUT_POLICY = DETAIL_POPUP_LAYOUT_POLICY;

/** V1.3 공통 Detail Popup 탭 (제품 관리 화면) */
export const V13_COMMON_DETAIL_POPUP_TABS = [
  { id: "basicInfo", label: "기본정보" },
  { id: "workInfo", label: "작업정보" },
  { id: "qrHistory", label: "QR 작업이력" },
  { id: "timeline", label: "공정 Timeline" },
  { id: "attachments", label: "첨부파일" },
  { id: "remarks", label: "비고" },
];

/** Screen keys → popup title + tab definitions */
export const DETAIL_POPUP_SCREENS = {
  inbound: {
    title: "입고관리 상세정보",
    tabs: V13_COMMON_DETAIL_POPUP_TABS,
  },
  dailyProductionReport: {
    title: "생산관리 상세정보",
    tabs: [
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(0, 2),
      { id: "chargeList", label: "장입리스트" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(2),
    ],
  },
  inspection: {
    title: "검사관리 상세정보",
    tabs: [
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(0, 2),
      { id: "inspectionInfo", label: "검사정보" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(2, 4),
      { id: "inspectionTimeline", label: "검사 Timeline" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(4),
    ],
  },
  inspectionLog: {
    title: "검사일지 상세정보",
    tabs: [
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(0, 2),
      { id: "inspectionInfo", label: "검사정보" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(2, 4),
      { id: "inspectionTimeline", label: "검사 Timeline" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(4),
    ],
  },
  certificate: {
    title: "성적서관리 상세정보",
    tabs: [
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(0, 2),
      { id: "inspectionResult", label: "검사결과" },
      { id: "certificatePdf", label: "성적서 PDF" },
      { id: "revision", label: "Revision" },
      { id: "issueHistory", label: "발행이력" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(4),
    ],
  },
  outbound: {
    title: "출고관리 상세정보",
    tabs: [
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(0, 2),
      { id: "outboundInfo", label: "출고정보" },
      { id: "statement", label: "거래명세서" },
      { id: "outboundHistory", label: "출고이력" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(2, 4),
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(4),
    ],
  },
  documents: {
    title: "문서관리 상세정보",
    tabs: [
      { id: "basicInfo", label: "기본정보" },
      { id: "documentHistory", label: "문서이력" },
      { id: "revision", label: "Revision" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(4),
    ],
  },
  inventory: {
    title: "재고관리 상세정보",
    tabs: [
      { id: "basicInfo", label: "기본정보" },
      { id: "inventoryInfo", label: "재고정보" },
      { id: "inOutHistory", label: "입출고이력" },
      { id: "lotHistory", label: "LOT이력" },
      ...V13_COMMON_DETAIL_POPUP_TABS.slice(4),
    ],
  },
  qr: {
    title: "QR관리 상세정보",
    tabs: [
      { id: "qrInfo", label: "QR정보" },
      { id: "qrPreview", label: "QR 미리보기" },
    ],
  },
  qrInout: {
    title: "입출고 QR 상세정보",
    tabs: [
      { id: "qrInfo", label: "QR정보" },
      { id: "qrPreview", label: "QR 미리보기" },
    ],
  },
  qrEquipment: {
    title: "설비 QR 상세정보",
    tabs: [
      { id: "equipmentQrInfo", label: "QR정보" },
      { id: "equipmentQrPreview", label: "QR 미리보기" },
    ],
  },
  masterData: {
    title: "기준정보 상세조회",
    tabs: [{ id: "detail", label: "상세정보" }],
  },
};

export const DETAIL_POPUP_MIGRATED_SCREENS = [
  "inbound",
  "outbound",
  "dailyProductionReport",
  "inspection",
  "inspectionLog",
  "certificate",
  "documents",
  "inventory",
  "qr",
  "qrInout",
  "qrEquipment",
  "masterData",
];

export function getDetailPopupConfig(screenKey) {
  return DETAIL_POPUP_SCREENS[screenKey] ?? null;
}
