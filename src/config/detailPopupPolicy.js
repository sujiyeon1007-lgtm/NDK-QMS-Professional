/**
 * Project TITAN — Detail Popup Layout Policy (UI Freeze)
 *
 * Foundation popup: common 880×660 layout shell.
 * Tabs are workspace-specific; do not force a common tab set.
 *
 * @see src/foundation/components/detailPopup/TitanStandardDetailPopup.jsx
 * @see src/config/masterDetailLayoutPolicy.js
 */

import {
  TITAN_STANDARD_DETAIL_POPUP_TABS,
  pickStandardDetailPopupTabs,
} from "../foundation/components/detailPopup/standardDetailPopupTabs";
import { QUALITY_DOCUMENT_DETAIL_TABS } from "./detailTabs/documentDetailTabs";
import { LOT_DETAIL_TABS } from "./detailTabs/lotDetailTabs";
import { EQUIPMENT_DETAIL_TABS } from "./detailTabs/equipmentDetailTabs";
import { COMPANY_WORKSPACE_DETAIL_TABS } from "./detailTabs/companyDetailTabs";
import { PRODUCT_DETAIL_TABS, MATERIAL_DETAIL_TABS } from "./detailTabs/productDetailTabs";
import { INSPECTION_DETAIL_TABS } from "./detailTabs/inspectionDetailTabs";

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
    widthPx: 880,
    heightPx: 660,
  },
  sizeExceptions: ["environmentWizard", "login"],
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

/** @deprecated tab composition is workspace-specific */
export const V13_COMMON_DETAIL_POPUP_TABS = TITAN_STANDARD_DETAIL_POPUP_TABS;

/** 표준 Detail Popup 적용 화면 */
export const STANDARD_DETAIL_POPUP_SCREENS = [
  "inbound",
  "outbound",
  "dailyProductionReport",
  "inspection",
  "inspectionLog",
  "certificate",
  "inventory",
  "documents",
];

/** Legacy TitanDetailPopup 유지 화면 (QR · 기준정보) */
export const LEGACY_DETAIL_POPUP_SCREENS = [
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
    useStandardPopup: true,
    tabs: QUALITY_DOCUMENT_DETAIL_TABS,
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
    useStandardPopup: true,
    tabs: [
      { id: "detail", label: "상세정보" },
      { id: "attachments", label: "첨부파일" },
    ],
  },
  lot: {
    title: "LOT 상세정보",
    useStandardPopup: true,
    tabs: LOT_DETAIL_TABS,
  },
  equipment: {
    title: "설비 상세정보",
    useStandardPopup: true,
    tabs: EQUIPMENT_DETAIL_TABS,
  },
  companyWorkspace: {
    title: "회사정보 상세정보",
    useStandardPopup: true,
    tabs: COMPANY_WORKSPACE_DETAIL_TABS,
  },
  product: {
    title: "제품 상세정보",
    useStandardPopup: true,
    tabs: PRODUCT_DETAIL_TABS,
  },
  material: {
    title: "재질 상세정보",
    useStandardPopup: true,
    tabs: MATERIAL_DETAIL_TABS,
  },
  inspectionV101: {
    title: "검사 상세정보",
    useStandardPopup: true,
    tabs: INSPECTION_DETAIL_TABS,
  },
};

export const DETAIL_POPUP_MIGRATED_SCREENS = Object.keys(DETAIL_POPUP_SCREENS);

export function getDetailPopupConfig(screenKey) {
  return DETAIL_POPUP_SCREENS[screenKey] ?? null;
}

export function usesStandardDetailPopup(screenKey) {
  return Boolean(getDetailPopupConfig(screenKey)?.useStandardPopup);
}

export function resolveMasterDetailNavigation(rows, currentRowId) {
  const list = Array.isArray(rows) ? rows : [];
  const total = list.length;

  if (!total || !currentRowId) {
    return {
      currentIndex: -1,
      position: 0,
      total,
      hasPrev: false,
      hasNext: false,
      prevRow: null,
      nextRow: null,
    };
  }

  const currentIndex = list.findIndex((row) => row?.id === currentRowId);
  if (currentIndex < 0) {
    return {
      currentIndex: -1,
      position: 0,
      total,
      hasPrev: false,
      hasNext: false,
      prevRow: null,
      nextRow: null,
    };
  }

  return {
    currentIndex,
    position: currentIndex + 1,
    total,
    hasPrev: currentIndex > 0,
    hasNext: currentIndex < total - 1,
    prevRow: currentIndex > 0 ? list[currentIndex - 1] : null,
    nextRow: currentIndex < total - 1 ? list[currentIndex + 1] : null,
  };
}

export function resolveMasterDetailPage(rows, rowId, pageSize) {
  const list = Array.isArray(rows) ? rows : [];
  const size = Math.max(1, Number(pageSize) || 10);
  const index = list.findIndex((row) => row?.id === rowId);
  if (index < 0) return 1;
  return Math.floor(index / size) + 1;
}
