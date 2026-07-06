/** Project TITAN — Standard Detail Popup 탭 (UI Freeze) */
export const TITAN_STANDARD_DETAIL_POPUP_TABS = [
  { id: "basicInfo", label: "기본정보" },
  { id: "processHistory", label: "공정이력" },
  { id: "qrHistory", label: "QR 작업이력" },
  { id: "coLot", label: "동일 LOT 제품" },
  { id: "attachments", label: "첨부파일" },
  { id: "memo", label: "메모" },
];

export const TITAN_STANDARD_DETAIL_POPUP_TAB_IDS = TITAN_STANDARD_DETAIL_POPUP_TABS.map((tab) => tab.id);

/** @param {string[]} visibleTabIds */
export function pickStandardDetailPopupTabs(visibleTabIds = TITAN_STANDARD_DETAIL_POPUP_TAB_IDS) {
  const allowed = new Set(visibleTabIds);
  return TITAN_STANDARD_DETAIL_POPUP_TABS.filter((tab) => allowed.has(tab.id));
}
