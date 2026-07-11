/**
 * Project TITAN RC1 - Data Reset Policy
 */

export const TITAN_DATA_RESET_POLICY_VERSION = "RC1-2026-07-11";

export const DATA_RESET_SCOPES = Object.freeze({
  MASTER: "master",
  OPERATIONS: "operations",
  ALL: "all",
});

export const DATA_RESET_MASTER_CATEGORIES = Object.freeze([
  { key: "companies", label: "\uac70\ub798\ucc98" },
  { key: "products", label: "\uc81c\ud488" },
  { key: "materials", label: "\uc7ac\uc9c8" },
  { key: "equipment", label: "\uc124\ube44" },
  { key: "workers", label: "\uc791\uc5c5\uc790" },
  { key: "heatTreatment", label: "\uacf5\uc815" },
  { key: "customCodes", label: "\ubd88\ub7c9\ucf54\ub4dc \u00b7 \uc0ac\uc6a9\uc790 \uc815\uc758 \ucf54\ub4dc" },
]);

export const DATA_RESET_OPERATIONS_TARGETS = Object.freeze([
  { key: "incoming", label: "\uc785\uace0" },
  { key: "lot", label: "LOT" },
  { key: "production", label: "\uc0dd\uc0b0" },
  { key: "outbound", label: "\ucd9c\uace0" },
  { key: "inspection", label: "\uac80\uc0ac" },
  { key: "certificate", label: "\uc131\uc801\uc11c" },
  { key: "documents", label: "\ubb38\uc11c" },
  { key: "statistics", label: "\ud1b5\uacc4" },
]);

export const DATA_RESET_CONFIRM_STEPS = 2;

export const DATA_RESET_UI = Object.freeze({
  title: "\ub370\uc774\ud130 \uad00\ub9ac",
  desc: "Demo \u00b7 Master \u00b7 \uc5c5\ubb34 \ub370\uc774\ud130 \uad00\ub9ac (\uad00\ub9ac\uc790 \uc804\uc6a9 \u00b7 Repository \uacbd\uc720)",
  demoButton: "Demo \ub370\uc774\ud130 \ubd88\ub7ec\uc624\uae30",
  demoDesc: "Demo Master \u00b7 Demo \uc5c5\ubb34 \u00b7 \uc2dc\uc5f0\uc6a9 Workflow (\uad00\ub9ac\uc790 \uc804\uc6a9)",
  masterButton: "Master \ub370\uc774\ud130 \ucd08\uae30\ud654",
  operationsButton: "\uc5c5\ubb34 \ub370\uc774\ud130 \ucd08\uae30\ud654",
  allButton: "\uc804\uccb4 \ucd08\uae30\ud654",
  accessDenied: "\uad00\ub9ac\uc790\ub9cc \uc2e4\ud589\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
});
