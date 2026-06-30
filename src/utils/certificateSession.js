/**
 * Project TITAN V1.0 — 성적서 파일 등록 세션 (SessionStorage)
 * V1.0: 엑셀/PDF 파일 관리 · 향후 자동 발행 연동 확장
 */

import { getCurrentTitanUser } from "./titanHistorySession";
import { getJournalReferenceDate } from "./workJournalData";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { updateSessionProductionRecord } from "./productionRecords";
import { CERTIFICATE_STATUS } from "./ndkWorkflow";

const STORAGE_KEY = "project-titan-certificate-files-v1";

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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

function normalizeEntry(entry) {
  return {
    id: entry.id,
    managementId: entry.managementId?.trim() || "",
    company: entry.company?.trim() || "",
    partName: entry.partName?.trim() || "",
    partNo: entry.partNo?.trim() || "",
    material: entry.material?.trim() || "",
    lotNo: entry.lotNo?.trim() || "",
    qty: Number.isFinite(Number(entry.qty)) ? Number(entry.qty) : 0,
    unit: entry.unit?.trim() || "EA",
    process: entry.process?.trim() || "",
    excelFile: entry.excelFile ?? null,
    pdfFile: entry.pdfFile ?? null,
    registeredDate: entry.registeredDate?.trim() || getJournalReferenceDate(),
    registeredBy: entry.registeredBy?.trim() || getCurrentTitanUser(),
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

export function hasCertificateFilesForManagementId(managementId) {
  const entry = getCertificateEntryByManagementId(managementId);
  if (!entry) return false;
  return Boolean(entry.excelFile?.name && entry.pdfFile?.name);
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

export function buildCertificateEntryFromRecord(record, overrides = {}) {
  if (!record) return null;
  return {
    managementId: record.id,
    company: record.company,
    partName: record.partName,
    partNo: record.partNo,
    material: record.material,
    lotNo: record.lotNo || "",
    qty: record.qty,
    unit: record.unit || "EA",
    process: getProductionProcessName(record),
    registeredDate: getJournalReferenceDate(),
    registeredBy: getCurrentTitanUser(),
    ...overrides,
  };
}

export function upsertCertificateFileEntry(payload) {
  const base = normalizeEntry({
    ...payload,
    id: payload.id || createCertificateId(),
    excelFile: normalizeFileMeta(payload.excelFile) ?? payload.excelFile ?? null,
    pdfFile: normalizeFileMeta(payload.pdfFile) ?? payload.pdfFile ?? null,
    updatedAt: new Date().toISOString(),
    deleted: false,
  });

  const entries = safeRead();
  const index = entries.findIndex((entry) => entry.managementId === base.managementId);
  if (index >= 0) {
    entries[index] = normalizeEntry({
      ...entries[index],
      ...base,
      id: entries[index].id,
      createdAt: entries[index].createdAt,
    });
  } else {
    entries.unshift(
      normalizeEntry({
        ...base,
        createdAt: new Date().toISOString(),
      })
    );
  }

  safeWrite(entries);

  const saved = getCertificateEntryByManagementId(base.managementId);
  if (saved && saved.excelFile?.name && saved.pdfFile?.name) {
    updateSessionProductionRecord(saved.managementId, {
      certificateStatus: CERTIFICATE_STATUS.ISSUED,
    });
  }

  return saved;
}
