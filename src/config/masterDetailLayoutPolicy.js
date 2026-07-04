/**
 * Project TITAN V1.3 FINAL — Detail Popup Layout Policy
 * supersedes Row Summary Cards
 */

export {
  DETAIL_POPUP_LAYOUT_POLICY,
  DETAIL_POPUP_SCREENS,
  DETAIL_POPUP_MIGRATED_SCREENS,
  getDetailPopupConfig,
  ROW_SUMMARY_LAYOUT_POLICY,
} from "./detailPopupPolicy";

/** @deprecated use DETAIL_POPUP_MIGRATED_SCREENS */
export { DETAIL_POPUP_MIGRATED_SCREENS as ROW_SUMMARY_MIGRATED_SCREENS } from "./detailPopupPolicy";

/** @deprecated use DETAIL_POPUP_SCREENS */
export { DETAIL_POPUP_SCREENS as ROW_SUMMARY_SECTIONS_BY_SCREEN } from "./detailPopupPolicy";

/** @deprecated use DETAIL_POPUP_LAYOUT_POLICY */
export { DETAIL_POPUP_LAYOUT_POLICY as MASTER_DETAIL_LAYOUT_POLICY } from "./detailPopupPolicy";

/** @deprecated use DETAIL_POPUP_SCREENS */
export { DETAIL_POPUP_SCREENS as MASTER_DETAIL_SECTIONS_BY_SCREEN } from "./detailPopupPolicy";

/** @deprecated use DETAIL_POPUP_MIGRATED_SCREENS */
export { DETAIL_POPUP_MIGRATED_SCREENS as MASTER_DETAIL_MIGRATED_SCREENS } from "./detailPopupPolicy";
