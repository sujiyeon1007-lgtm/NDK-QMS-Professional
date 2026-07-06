/**
 * Project TITAN V1.3 — Assignee & Work Journal Policy (PM Approved)
 * @see .cursor/rules/project-titan-work-journal-assignee-v1.3.mdc
 */

/** @typedef {'auto' | 'manual'} WorkJournalSourceType */

export const WORK_JOURNAL_STORAGE_KEY = "project-titan-work-journal-v1";

export const WORK_JOURNAL_SOURCE_TYPE = {
  AUTO: "auto",
  MANUAL: "manual",
};

export const WORK_JOURNAL_ACTION_TYPES = {
  INBOUND_REGISTER: "inboundRegister",
  PRODUCTION_DAILY_REGISTER: "productionDailyRegister",
  INSPECTION_REGISTER: "inspectionRegister",
  CERTIFICATE_ISSUE: "certificateIssue",
  OUTBOUND_REGISTER: "outboundRegister",
  INVENTORY_ADJUST: "inventoryAdjust",
  QR_REGISTER: "qrRegister",
};

/** actionType → 업무일지 category label (Korean) */
export const WORK_JOURNAL_ACTION_LABELS = {
  inboundRegister: "입고 등록",
  productionDailyRegister: "LOT 등록",
  inspectionRegister: "검사 등록",
  certificateIssue: "성적서 발행",
  outboundRegister: "출고 완료",
  inventoryAdjust: "재고 조정",
  qrRegister: "QR 등록",
};

/** Module → registration form field name for assignee */
export const ASSIGNEE_FIELD_BY_MODULE = {
  inbound: "manager",
  production: "worker",
  inspection: "assignee",
  certificate: "registeredBy",
  outbound: "manager",
};

/** Shared assignee metadata fields on records / journal entries */
export const ASSIGNEE_META_FIELDS = [
  "assignee",
  "assigneeUserId",
  "workerCode",
  "department",
];

export const WORK_JOURNAL_ASSIGNEE_FILTER_ALL = "";
