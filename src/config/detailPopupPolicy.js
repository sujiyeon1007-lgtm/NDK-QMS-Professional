/**
 * Project TITAN — Detail Popup Layout Policy (UI Freeze)
 *
 * Standard popup: TitanStandardDetailPopup (880×660, 6 tabs)
 * Legacy popup: TitanDetailPopup (documents · QR · masterData 등)
 *
 * @see src/foundation/components/detailPopup/TitanStandardDetailPopup.jsx
 * @see src/config/masterDetailLayoutPolicy.js
 */

import {
  TITAN_STANDARD_DETAIL_POPUP_TABS,
  pickStandardDetailPopupTabs,
} from "../foundation/components/detailPopup/standardDetailPopupTabs";

export const DETAIL_POPUP_LAYOUT_POLICY = {
  version: "standard-detail-popup-v1.4",
  homeException: false,
  leftWidgetAllowed: false,
  collapsePanelAllowed: false,
  rowSummaryAllowed: false,
  structure: ["검색", "안내문(TitanListInteractionHint)", "리스트(Table)", "작업 컬럼(업무 버튼만)", "더블클릭 → Standard Detail Popup"],
  dialog: {
    widthPx: 880,
    heightPx: 660,
    footerActions: ["닫기"],
    animation: "fade-scale-180ms",
  },
  documentDialog: {
    widthPx: 1120,
    heightPx: 720,
  },
  sizeExceptions: ["documents", "environmentWizard", "login"],
  listHintMessage: "💡 리스트를 더블클릭하면 상세정보를 확인할 수 있습니다.",
  rowInteraction: {
    singleClick: "select",
    doubleClick: "detailPopup",
    editVia: "rowActionButton",
    registerVia: "toolbarOrRowAction",
    workJournalDoubleClick: "editModal",
  },
};

/** @deprecated use DETAIL_POPUP_LAYOUT_POLICY */
export const ROW_SUMMARY_LAYOUT_POLICY = DETAIL_POPUP_LAYOUT_POLICY;

/** @deprecated use TITAN_STANDARD_DETAIL_POPUP_TABS */
export const V13_COMMON_DETAIL_POPUP_TABS = TITAN_STANDARD_DETAIL_POPUP_TABS;

/** 표준 Detail Popup 적용 화면 (문서관리 제외) */
export const STANDARD_DETAIL_POPUP_SCREENS = [
  "inbound",
  "outbound",
  "dailyProductionReport",
  "inspection",
  "inspectionLog",
  "certificate",
  "inventory",
];

/** Legacy TitanDetailPopup 유지 화면 (문서관리 · QR · 기준정보) */
export const LEGACY_DETAIL_POPUP_SCREENS = [
  "documents",
  "qr",
  "qrInout",
  "qrEquipment",
  "masterData",
];

/** Screen keys → popup title + tab definitions */
export const DETAIL_POPUP_SCREENS = {
  inbound: {
    title: "입고관리 상세정보",
    useStandardPopup: true,
    tabs: TITAN_STANDARD_DETAIL_POPUP_TABS,
  },
  dailyProductionReport: {
    title: "열처리관리 상세정보",
    useStandardPopup: true,
    tabs: pickStandardDetailPopupTabs([
      "basicInfo",
      "processHistory",
      "qrHistory",
      "coLot",
      "attachments",
      "memo",
    ]),
  },
  inspection: {
    title: "검사관리 상세정보",
    useStandardPopup: true,
    tabs: TITAN_STANDARD_DETAIL_POPUP_TABS,
  },
  inspectionLog: {
    title: "검사일지 상세정보",
    useStandardPopup: true,
    tabs: TITAN_STANDARD_DETAIL_POPUP_TABS,
  },
  certificate: {
    title: "성적서관리 상세정보",
    useStandardPopup: true,
    tabs: TITAN_STANDARD_DETAIL_POPUP_TABS,
  },
  outbound: {
    title: "출고관리 상세정보",
    useStandardPopup: true,
    tabs: TITAN_STANDARD_DETAIL_POPUP_TABS,
  },
  documents: {
    title: "문서관리 상세정보",
    useStandardPopup: false,
    tabs: [
      { id: "basicInfo", label: "기본정보" },
      { id: "documentHistory", label: "문서이력" },
      { id: "revision", label: "Revision" },
      { id: "attachments", label: "첨부파일" },
      { id: "memo", label: "메모" },
    ],
  },
  inventory: {
    title: "재고관리 상세정보",
    useStandardPopup: true,
    tabs: TITAN_STANDARD_DETAIL_POPUP_TABS,
  },
  qr: {
    title: "QR관리 상세정보",
    useStandardPopup: false,
    tabs: [
      { id: "qrInfo", label: "QR정보" },
      { id: "qrPreview", label: "QR 미리보기" },
    ],
  },
  qrInout: {
    title: "입출고 QR 상세정보",
    useStandardPopup: false,
    tabs: [
      { id: "qrInfo", label: "QR정보" },
      { id: "qrPreview", label: "QR 미리보기" },
    ],
  },
  qrEquipment: {
    title: "설비 QR 상세정보",
    useStandardPopup: false,
    tabs: [
      { id: "equipmentQrInfo", label: "QR정보" },
      { id: "equipmentQrPreview", label: "QR 미리보기" },
    ],
  },
  masterData: {
    title: "기준정보 상세조회",
    useStandardPopup: false,
    tabs: [{ id: "detail", label: "상세정보" }],
  },
};

export const DETAIL_POPUP_MIGRATED_SCREENS = Object.keys(DETAIL_POPUP_SCREENS);

export function getDetailPopupConfig(screenKey) {
  return DETAIL_POPUP_SCREENS[screenKey] ?? null;
}

export function usesStandardDetailPopup(screenKey) {
  return Boolean(getDetailPopupConfig(screenKey)?.useStandardPopup);
}
