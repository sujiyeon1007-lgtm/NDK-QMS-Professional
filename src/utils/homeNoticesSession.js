/**
 * HOME — 공지사항 SessionStorage
 * @deprecated REV.4 — 품질 공지는 Document Management (`quality_notice`)로 통합
 * @see src/utils/qualityNoticeSession.js
 */

import {
  getActiveQualityNoticesForHome,
  mapQualityNoticeToHomePanelItem,
} from "./qualityNoticeSession";

/** @deprecated use qualityNoticeSession */
export const HOME_NOTICE_TYPES = {
  quality_notice: { value: "quality_notice", label: "품질 공지", emoji: "📢" },
  notice: { value: "quality_notice", label: "품질 공지", emoji: "📢" },
  urgent: { value: "quality_notice", label: "품질 공지", emoji: "📢" },
  schedule: { value: "quality_notice", label: "품질 공지", emoji: "📢" },
  general: { value: "quality_notice", label: "품질 공지", emoji: "📢" },
};

export function getHomeNotices() {
  return getActiveQualityNoticesForHome(20).map(mapQualityNoticeToHomePanelItem);
}

/** @deprecated use upsertQualityNotice in qualityNoticeSession */
export function addHomeNotice(payload) {
  void payload;
  return null;
}
