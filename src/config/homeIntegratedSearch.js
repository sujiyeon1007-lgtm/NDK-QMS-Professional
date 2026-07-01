/**
 * Project TITAN V1.0 — HOME 통합검색 Config
 */

import { HOME_WORKFLOW_STATUS_OPTIONS } from "./homeDashboard";

/** @typedef {'managementId' | 'lotNo' | 'dueDateRange' | 'manager'} HomeAdvancedFieldKey */

export const HOME_INTEGRATED_SEARCH_CONFIG = {
  id: "home",
  storageKey: "home",
  ariaLabel: "통합검색",
  collapse: {
    closedLabel: "▼ 통합검색",
    openLabel: "▲ 통합검색",
    defaultOpen: false,
  },
  debounceMs: 250,
  showStatusField: true,
  statusOptions: HOME_WORKFLOW_STATUS_OPTIONS,
  /** @type {HomeAdvancedFieldKey[]} */
  advancedFields: ["managementId", "lotNo", "dueDateRange", "manager"],
  panelClassName: "home-full-search",
  chipSetId: "home",
};
