/**
 * Project TITAN — 검사일지 세션 (SessionStorage)
 */

import { resolveDefaultAssigneeFromAuth, normalizeAssigneeValue } from "./titanAssigneeResolver";
import { appendWorkJournalAutoEntry } from "./workJournalAutoRecord";
import { WORK_JOURNAL_ACTION_TYPES } from "../config/titanAssigneePolicy";
import { getJournalReferenceDate } from "./workJournalData";
import { onInspectionCancelled, onInspectionComplete } from "./titanWorkflowStatus";
import { applyProductDefaultsToForm, getProductByPartNo } from "./productRegistrationSession";
import { cloneSpecification } from "./productSpecificationModel";
import { DEFAULT_HARDENING_HV } from "./inspectionReportModel";
import { migrateHardeningDepthRows, normalizeHardeningDepthRows } from "./hardeningDepthModel";
import {
  FOUNDATION_ATTACHMENT_ACCEPT,
  FOUNDATION_ATTACHMENT_SUPPORTED_EXTENSIONS,
  getFoundationAttachmentExtension,
  isSupportedFoundationAttachment,
  normalizeFoundationAttachment,
  normalizeFoundationAttachments,
} from "./foundationAttachmentEngine";
import {
  INSPECTION_CATEGORY,
  INSPECTION_TYPE,
  normalizeInspectionType,
  normalizeOtherInspectionKind,
  resolveInspectionCategoryFromLegacy,
} from "../config/inspectionManagement";

const STORAGE_KEY = "project-titan-inspection-log-v3";
export const INSPECTION_ATTACHMENT_ACCEPT = FOUNDATION_ATTACHMENT_ACCEPT;
export const INSPECTION_ATTACHMENT_SUPPORTED_EXTENSIONS = FOUNDATION_ATTACHMENT_SUPPORTED_EXTENSIONS;

export const INSPECTION_CATEGORIES = [
  { value: "개발", label: "개발" },
  { value: "양산", label: "양산" },
  { value: "초도품", label: "초도품" },
  { value: "재검사", label: "재검사" },
  { value: "고객 요청", label: "고객 요청" },
  { value: "기타", label: "기타" },
];

export const INSPECTION_JUDGMENTS = ["합격", "불합격", "보류"];

export const getInspectionAttachmentExtension = getFoundationAttachmentExtension;
export const isSupportedInspectionAttachment = isSupportedFoundationAttachment;
export const normalizeTitanAttachment = normalizeFoundationAttachment;
export const normalizeTitanAttachments = normalizeFoundationAttachments;

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function safeWrite(logs) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // SQLite 전환 전 임시 저장소
  }
}

function createInspectionId() {
  return `INS-${Date.now()}`;
}

function normalizeLog(log) {
  const legacyCategory = log.category?.trim() || "양산";
  const inspectionCategory =
    log.inspectionCategory || resolveInspectionCategoryFromLegacy(legacyCategory);
  const inspectionType =
    log.inspectionType ||
    (inspectionCategory === INSPECTION_CATEGORY.DEVELOPMENT
      ? INSPECTION_TYPE.DEVELOPMENT
      : INSPECTION_TYPE.MASS);
  return {
    id: log.id,
    inspectionDate: log.inspectionDate?.trim() || getJournalReferenceDate(),
    category: legacyCategory,
    inspectionType: normalizeInspectionType(inspectionType),
    inspectionCategory,
    otherInspectionKind: normalizeOtherInspectionKind(log.otherInspectionKind, ""),
    managementId: log.managementId?.trim() || "",
    company: log.company?.trim() || "",
    partName: log.partName?.trim() || "",
    partNo: log.partNo?.trim() || "",
    drawingNo: log.drawingNo?.trim() || "",
    material: log.material?.trim() || "",
    lotNo: log.lotNo?.trim() || "",
    purchaseOrderNo: log.purchaseOrderNo?.trim() || "",
    customerLotNo: log.customerLotNo?.trim() || "",
    qty: Number.isFinite(Number(log.qty)) ? Number(log.qty) : 0,
    unit: log.unit?.trim() || "EA",
    assignee: normalizeAssigneeValue(log.assignee),
    inspectionItem: log.inspectionItem?.trim() || "",
    inspectionStandard: log.inspectionStandard?.trim() || "",
    measuredValue: log.measuredValue?.trim() || "",
    judgment: log.judgment?.trim() || "보류",
    inspectionEquipment: log.inspectionEquipment?.trim() || "",
    inspectionLocation: log.inspectionLocation?.trim() || "",
    process: log.process?.trim() || "",
    inspectionItems: Array.isArray(log.inspectionItems) ? log.inspectionItems : [],
    appliedSpecification: log.appliedSpecification
      ? cloneSpecification(log.appliedSpecification)
      : null,
    productMasterSpec: log.productMasterSpec
      ? cloneSpecification(log.productMasterSpec)
      : null,
    hardnessMeasurements: Array.isArray(log.hardnessMeasurements) ? log.hardnessMeasurements : [],
    dimensionMeasurements: Array.isArray(log.dimensionMeasurements) ? log.dimensionMeasurements : [],
    dimensionInspectionRows: Array.isArray(log.dimensionInspectionRows)
      ? log.dimensionInspectionRows
      : [],
    appearanceMeasurements: Array.isArray(log.appearanceMeasurements) ? log.appearanceMeasurements : [],
    hasMicrostructurePhoto: Boolean(log.hasMicrostructurePhoto),
    microstructureJudgment: log.microstructureJudgment?.trim() || "이상없음",
    microstructurePhotos: Array.isArray(log.microstructurePhotos) ? log.microstructurePhotos : [],
    hardeningDepthHv: Array.isArray(log.hardeningDepthHv)
      ? log.hardeningDepthHv.map((value) => Number(value) || 0)
      : [...DEFAULT_HARDENING_HV],
    hardeningDepthRows: normalizeHardeningDepthRows(migrateHardeningDepthRows(log)),
    heatTreatmentCalculations: log.heatTreatmentCalculations || null,
    heatTreatmentEdits: log.heatTreatmentEdits || {},
    coreHardnessHv: log.coreHardnessHv ?? "",
    note: log.note?.trim() || "",
    attachments: normalizeTitanAttachments(log.attachments),
    deleted: Boolean(log.deleted),
    createdAt: log.createdAt || new Date().toISOString(),
    updatedAt: log.updatedAt || new Date().toISOString(),
  };
}

export function getInspectionLogs({ includeDeleted = false } = {}) {
  const logs = safeRead().map(normalizeLog);
  if (includeDeleted) return logs;
  return logs.filter((log) => !log.deleted);
}

export function getInspectionLogById(id) {
  return getInspectionLogs({ includeDeleted: true }).find((log) => log.id === id) ?? null;
}

export function getInspectionLogsByManagementId(managementId) {
  const trimmed = managementId?.trim();
  if (!trimmed) return [];
  return getInspectionLogs().filter((log) => log.managementId === trimmed);
}

export function getInspectionLogsByLotNo(lotNo) {
  const trimmed = lotNo?.trim();
  if (!trimmed) return [];
  return getInspectionLogs().filter(
    (log) => log.lotNo.toUpperCase() === trimmed.toUpperCase()
  );
}

export function hasInspectionLogForManagementId(managementId) {
  return getInspectionLogsByManagementId(managementId).length > 0;
}

export function addInspectionLog(payload) {
  const log = normalizeLog({
    category: "양산",
    ...payload,
    id: payload.id || createInspectionId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
  });
  const logs = safeRead();
  logs.unshift(log);
  safeWrite(logs);
  if (log.managementId) {
    onInspectionComplete(log.managementId);
  }
  appendWorkJournalAutoEntry({
    actionType: WORK_JOURNAL_ACTION_TYPES.INSPECTION_REGISTER,
    assignee: log.assignee,
    managementId: log.managementId,
    company: log.company,
    lotNo: log.lotNo,
    date: log.inspectionDate,
    title: `검사 등록 — ${log.company} ${log.lotNo || log.managementId}`,
    note: log.inspectionItem,
  });
  return log;
}

export function updateInspectionLog(id, patch) {
  const logs = safeRead();
  const index = logs.findIndex((log) => log.id === id);
  if (index < 0) return null;

  const updated = normalizeLog({
    ...logs[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  });
  logs[index] = updated;
  safeWrite(logs);
  return updated;
}

export function addInspectionLogAttachments(id, attachments = []) {
  const log = getInspectionLogById(id);
  if (!log) return null;
  const nextAttachments = [
    ...normalizeTitanAttachments(log.attachments),
    ...normalizeTitanAttachments(attachments),
  ];
  return updateInspectionLog(id, { attachments: nextAttachments });
}

export function removeInspectionLogAttachment(id, attachmentId) {
  const log = getInspectionLogById(id);
  if (!log) return null;
  const nextAttachments = normalizeTitanAttachments(log.attachments).filter(
    (attachment) => attachment.id !== attachmentId
  );
  return updateInspectionLog(id, { attachments: nextAttachments });
}

export function softDeleteInspectionLog(id) {
  return updateInspectionLog(id, { deleted: true });
}

/** Soft-delete log · revert workflow when last log for managementId removed */
export function cancelInspectionRegistration(id) {
  const log = getInspectionLogById(id);
  if (!log || log.deleted) return null;

  const managementId = log.managementId?.trim();
  softDeleteInspectionLog(id);

  if (managementId && !hasInspectionLogForManagementId(managementId)) {
    onInspectionCancelled(managementId);
  }

  return log;
}

export function buildInspectionLogFromRecord(record, overrides = {}) {
  if (!record) return null;
  const { assignee: overrideAssignee, ...restOverrides } = overrides;
  const base = {
    inspectionDate: getJournalReferenceDate(),
    category: "양산",
    managementId: record.id,
    company: record.company,
    partName: record.partName,
    partNo: record.partNo,
    drawingNo: record.drawingNo || "",
    material: record.material,
    lotNo: record.lotNo || "",
    purchaseOrderNo: record.purchaseOrderNo || "",
    customerLotNo: record.customerLotNo || "",
    qty: record.qty,
    unit: record.unit || "EA",
    process: record.heatTreatment || "",
    assignee: overrideAssignee ?? getCurrentTitanUser(),
    judgment: "합격",
    inspectionItems: [],
    hardeningDepthHv: [],
    hardeningDepthRows: [],
    hasMicrostructurePhoto: false,
    microstructureJudgment: "이상없음",
    hardnessMeasurements: [],
    dimensionMeasurements: [],
    appearanceMeasurements: [],
    ...restOverrides,
  };
  const product = getProductByPartNo(base.partNo);
  return product ? applyProductDefaultsToForm(base, product) : base;
}
