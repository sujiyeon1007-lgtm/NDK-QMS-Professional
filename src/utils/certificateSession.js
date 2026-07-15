/**
 * Project TITAN V1.0 — 성적서 파일 등록 세션 (SessionStorage)
 * V1.0: 엑셀/PDF 파일 관리 · 향후 자동 발행 연동 확장
 */

import { resolveDefaultAssigneeFromAuth, normalizeAssigneeValue } from "./titanAssigneeResolver";
import { appendWorkJournalAutoEntry } from "./workJournalAutoRecord";
import { WORK_JOURNAL_ACTION_TYPES } from "../config/titanAssigneePolicy";
import { getJournalReferenceDate } from "./workJournalData";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { CERTIFICATE_STATUS } from "./ndkWorkflow";
import { getSessionProductionRecords } from "./productionRecords";
import { onCertificateIssued } from "./titanWorkflowStatus";
import { getInspectionLogsForRecord } from "./inspectionLogSession";
import { getInspectionReportByLogId } from "./inspectionReportSession";
import { resolveChargeQty } from "./equipmentChargingQty";

function normalizeCertificateLotKey(value) {
  return String(value ?? "").trim().toUpperCase();
}

const STORAGE_KEY = "project-titan-certificate-files-v2";

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

function safeWrite(entries) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // SQLite 전환 전 임시 저장소
  }
}

function createCertificateId() {
  return `CERT-${Date.now()}`;
}

function normalizeFileMeta(file) {
  if (!file?.name) return null;
  return {
    name: file.name,
    size: Number(file.size) || 0,
    type: file.type || "",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeIssueHistoryEntry(item) {
  if (!item || typeof item !== "object") return null;
  return {
    issuedAt: item.issuedAt || new Date().toISOString(),
    issuedBy: normalizeAssigneeValue(item.issuedBy) || resolveDefaultAssigneeFromAuth(),
    excelFile: item.excelFile ?? null,
    pdfFile: item.pdfFile ?? null,
  };
}

function normalizeEntry(entry) {
  return {
    id: entry.id,
    managementId: entry.managementId?.trim() || "",
    company: entry.company?.trim() || "",
    partName: entry.partName?.trim() || "",
    partNo: entry.partNo?.trim() || "",
    material: entry.material?.trim() || "",
    lotNo: entry.lotNo?.trim() || "",
    purchaseOrderNo: entry.purchaseOrderNo?.trim() || "",
    customerLotNo: entry.customerLotNo?.trim() || "",
    qty: Number.isFinite(Number(entry.qty)) ? Number(entry.qty) : 0,
    unit: entry.unit?.trim() || "EA",
    process: entry.process?.trim() || "",
    excelFile: entry.excelFile ?? null,
    pdfFile: entry.pdfFile ?? null,
    registeredDate: entry.registeredDate?.trim() || getJournalReferenceDate(),
    registeredBy: normalizeAssigneeValue(entry.registeredBy) || resolveDefaultAssigneeFromAuth(),
    issueCount: Number.isFinite(Number(entry.issueCount)) ? Number(entry.issueCount) : 0,
    lastIssuedDate: entry.lastIssuedDate?.trim() || "",
    lastIssuedBy: normalizeAssigneeValue(entry.lastIssuedBy) || "",
    isReissue: Boolean(entry.isReissue),
    firstIssuedAt: entry.firstIssuedAt || "",
    issueHistory: Array.isArray(entry.issueHistory)
      ? entry.issueHistory.map(normalizeIssueHistoryEntry).filter(Boolean)
      : [],
    deleted: Boolean(entry.deleted),
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: entry.updatedAt || new Date().toISOString(),
  };
}

export function getCertificateFileEntries({ includeDeleted = false } = {}) {
  const entries = safeRead().map(normalizeEntry);
  if (includeDeleted) return entries;
  return entries.filter((entry) => !entry.deleted);
}

export function getCertificateEntryById(id) {
  return getCertificateFileEntries({ includeDeleted: true }).find((entry) => entry.id === id) ?? null;
}

export function getCertificateEntryByManagementId(managementId) {
  const trimmed = managementId?.trim();
  if (!trimmed) return null;
  return getCertificateFileEntries().find((entry) => entry.managementId === trimmed) ?? null;
}

export function getCertificateEntryForRecord(record) {
  const managementId = String(record?.id ?? record?.managementId ?? "").trim();
  if (!managementId) return null;
  const lotKey = normalizeCertificateLotKey(record?.lotNo);
  const entries = getCertificateFileEntries().filter((entry) => entry.managementId === managementId);
  if (!lotKey) return entries[0] ?? null;
  return entries.find((entry) => normalizeCertificateLotKey(entry.lotNo) === lotKey) ?? null;
}

export function hasCertificateFilesForManagementId(managementId) {
  const entry = getCertificateEntryByManagementId(managementId);
  if (!entry) return false;
  return Boolean(entry.excelFile?.name && entry.pdfFile?.name);
}

export function hasCertificateFilesForRecord(record) {
  const entry = getCertificateEntryForRecord(record);
  return Boolean(entry?.excelFile?.name && entry?.pdfFile?.name);
}

export function getCertificateFileStatus(entry) {
  const hasExcel = Boolean(entry?.excelFile?.name);
  const hasPdf = Boolean(entry?.pdfFile?.name);

  if (hasExcel && hasPdf) {
    return { label: "등록완료", variant: "complete" };
  }
  if (hasExcel) {
    return { label: "엑셀만", variant: "production" };
  }
  if (hasPdf) {
    return { label: "PDF만", variant: "certificate" };
  }
  return { label: "등록대기", variant: "wait" };
}

function getLatestInspectionReportForRecord(record) {
  if (!record) return { log: null, report: null };
  const log = getInspectionLogsForRecord(record)
    .filter((entry) => !entry.deleted)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];

  if (!log) return { log: null, report: null };
  return { log, report: getInspectionReportByLogId(log.id) };
}

export function buildCertificateEntryFromRecord(record, overrides = {}) {
  if (!record) return null;

  const managementId = record.id || record.managementId;
  const lotNo = String(record.lotNo ?? "").trim();
  /** LOT charge qty SSOT — never product inbound sum */
  const chargeQty = resolveChargeQty(record, { lotNo });
  const fromRecord = {
    managementId,
    company: record.company,
    partName: record.partName,
    partNo: record.partNo,
    material: record.material,
    lotNo,
    purchaseOrderNo: record.purchaseOrderNo || "",
    customerLotNo: record.customerLotNo || "",
    qty: chargeQty,
    unit: record.unit || "EA",
    process: getProductionProcessName(record),
    registeredDate: getJournalReferenceDate(),
    registeredBy: resolveDefaultAssigneeFromAuth(),
  };

  const { log, report } = getLatestInspectionReportForRecord(record);
  if (!report) {
    const resolvedLotNo = log?.lotNo?.trim() || fromRecord.lotNo;
    return {
      ...fromRecord,
      ...(log
        ? {
            lotNo: resolvedLotNo,
            qty: resolveChargeQty(
              { ...record, lotNo: resolvedLotNo, chargeQty: record.chargeQty },
              { lotNo: resolvedLotNo }
            ) || chargeQty,
            unit: log.unit || fromRecord.unit,
            registeredDate: log.inspectionDate || fromRecord.registeredDate,
            registeredBy: log.assignee || fromRecord.registeredBy,
            inspectionLogId: log.id,
          }
        : {}),
      ...overrides,
    };
  }

  const reportLotNo = report.lotNo?.trim() || fromRecord.lotNo;
  return {
    ...fromRecord,
    company: report.company?.trim() || fromRecord.company,
    partName: report.partName?.trim() || fromRecord.partName,
    partNo: report.partNo?.trim() || fromRecord.partNo,
    material: report.material?.trim() || fromRecord.material,
    lotNo: reportLotNo,
    purchaseOrderNo: report.purchaseOrderNo?.trim() || fromRecord.purchaseOrderNo,
    customerLotNo: report.customerLotNo?.trim() || fromRecord.customerLotNo,
    qty:
      resolveChargeQty(
        { ...record, lotNo: reportLotNo, chargeQty: record.chargeQty },
        { lotNo: reportLotNo }
      ) || chargeQty,
    unit: report.unit?.trim() || fromRecord.unit,
    process: report.process?.trim() || fromRecord.process,
    registeredDate: report.inspectionDate?.trim() || log?.inspectionDate || fromRecord.registeredDate,
    registeredBy: report.inspector?.trim() || log?.assignee || fromRecord.registeredBy,
    inspectionLogId: log?.id || "",
    ...overrides,
  };
}

export function upsertCertificateFileEntry(payload) {
  const entries = safeRead();
  const managementId = payload.managementId?.trim();
  const lotKey = normalizeCertificateLotKey(payload.lotNo);
  const index = entries.findIndex(
    (entry) =>
      entry.managementId === managementId &&
      (!lotKey || normalizeCertificateLotKey(entry.lotNo) === lotKey)
  );
  const existingRaw = index >= 0 ? entries[index] : null;
  const existingEntry = existingRaw ? normalizeEntry(existingRaw) : null;

  const record = getSessionProductionRecords().find((item) => item.id === payload.managementId?.trim());
  const wasAlreadyIssued =
    record?.certificateStatus === CERTIFICATE_STATUS.ISSUED ||
    Number(existingEntry?.issueCount) > 0;

  const issuedAt = new Date().toISOString();
  const issuedDate = getJournalReferenceDate();
  const issuedBy =
    normalizeAssigneeValue(payload.registeredBy) ||
    existingEntry?.registeredBy ||
    resolveDefaultAssigneeFromAuth();

  const base = normalizeEntry({
    ...(existingEntry ?? {}),
    ...payload,
    id: payload.id || existingEntry?.id || createCertificateId(),
    excelFile: normalizeFileMeta(payload.excelFile) ?? payload.excelFile ?? existingEntry?.excelFile ?? null,
    pdfFile: normalizeFileMeta(payload.pdfFile) ?? payload.pdfFile ?? existingEntry?.pdfFile ?? null,
    registeredBy: issuedBy,
    updatedAt: issuedAt,
    deleted: false,
    createdAt: existingEntry?.createdAt || new Date().toISOString(),
  });

  const issueSnapshot = {
    issuedAt,
    issuedBy,
    excelFile: base.excelFile ?? null,
    pdfFile: base.pdfFile ?? null,
  };

  const nextIssueCount = wasAlreadyIssued
    ? Math.max(Number(existingEntry?.issueCount) || 1, 1) + 1
    : 1;

  const persisted = normalizeEntry({
    ...base,
    issueCount: nextIssueCount,
    lastIssuedDate: issuedDate,
    lastIssuedBy: issuedBy,
    isReissue: wasAlreadyIssued,
    firstIssuedAt: wasAlreadyIssued ? existingEntry?.firstIssuedAt || issuedAt : issuedAt,
    issueHistory: wasAlreadyIssued
      ? [...(existingEntry?.issueHistory ?? []), issueSnapshot]
      : [issueSnapshot],
  });

  if (index >= 0) {
    entries[index] = persisted;
  } else {
    entries.unshift(persisted);
  }
  safeWrite(entries);

  // RC1: 최초 발행 = workflow 전환 (첨부파일 선택) · 재발행은 이력만 갱신
  if (!wasAlreadyIssued) {
    onCertificateIssued(persisted.managementId);
    appendWorkJournalAutoEntry({
      actionType: WORK_JOURNAL_ACTION_TYPES.CERTIFICATE_ISSUE,
      assignee: persisted.lastIssuedBy || persisted.registeredBy,
      managementId: persisted.managementId,
      company: persisted.company,
      lotNo: persisted.lotNo,
      date: persisted.lastIssuedDate || persisted.registeredDate,
      title: `성적서 발행 — ${persisted.company} ${persisted.lotNo || persisted.managementId}`,
    });
  } else {
    appendWorkJournalAutoEntry({
      actionType: WORK_JOURNAL_ACTION_TYPES.CERTIFICATE_ISSUE,
      assignee: persisted.lastIssuedBy || persisted.registeredBy,
      managementId: persisted.managementId,
      company: persisted.company,
      lotNo: persisted.lotNo,
      date: persisted.lastIssuedDate || persisted.registeredDate,
      title: `성적서 재발행 — ${persisted.company} ${persisted.lotNo || persisted.managementId}`,
    });
  }

  return persisted;
}

/** 성적서현황 — 발행 완료 이력 (발행 후에도 유지) */
export function getCertificateHistoryEntries({ includeDeleted = false } = {}) {
  return getCertificateFileEntries({ includeDeleted }).filter((entry) => {
    if (Number(entry.issueCount) > 0) return true;
    const record = getSessionProductionRecords().find((item) => item.id === entry.managementId);
    return record?.certificateStatus === CERTIFICATE_STATUS.ISSUED;
  });
}

export function isCertificateEntryIssued(entry) {
  if (!entry) return false;
  if (Number(entry.issueCount) > 0) return true;
  // LOT-keyed pending entry must not inherit product-level certificateStatus
  if (normalizeCertificateLotKey(entry.lotNo)) return false;
  const record = getSessionProductionRecords().find((item) => item.id === entry.managementId);
  return record?.certificateStatus === CERTIFICATE_STATUS.ISSUED;
}
