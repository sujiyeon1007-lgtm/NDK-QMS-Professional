/**
 * Project TITAN V1.3 — 기타검사 SessionStorage
 */

import { getCurrentTitanUser } from "./titanHistorySession";
import { getJournalReferenceDate } from "./workJournalData";
import { OTHER_INSPECTION_CATEGORIES, OTHER_INSPECTION_STATUS } from "../config/inspectionManagement";

const STORAGE_KEY = "project-titan-other-inspection-v1";

const CATEGORY_VALUES = OTHER_INSPECTION_CATEGORIES.map((item) => item.value);

function createOtherId() {
  return `OTH-${Date.now()}`;
}

function normalizeRecord(record) {
  return {
    id: record.id || createOtherId(),
    category: CATEGORY_VALUES.includes(record.category) ? record.category : "기타",
    company: record.company?.trim() || "",
    partName: record.partName?.trim() || "",
    content: record.content?.trim() || "",
    assignee: record.assignee?.trim() || getCurrentTitanUser(),
    registeredDate: record.registeredDate?.trim() || getJournalReferenceDate(),
    status: OTHER_INSPECTION_STATUS.includes(record.status) ? record.status : "대기",
    note: record.note?.trim() || "",
    attachments: Array.isArray(record.attachments) ? record.attachments : [],
    deleted: Boolean(record.deleted),
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

function getSeedRecords() {
  return [
    normalizeRecord({
      id: "OTH-SEED-001",
      category: "게이지",
      company: "NDK",
      partName: "경도시험기 Mitutoyo",
      content: "게이지 R&R 정기 점검",
      assignee: "품질관리부 / 정반이 사원",
      registeredDate: "2026-07-01",
      status: "완료",
      note: "",
    }),
  ];
}

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (parsed.length > 0) return parsed.map(normalizeRecord);
    return getSeedRecords();
  } catch {
    return getSeedRecords();
  }
}

function safeWrite(records) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // SQLite 전환 전 임시 저장소
  }
}

export function getOtherInspections({ includeDeleted = false } = {}) {
  const records = safeRead();
  if (includeDeleted) return records;
  return records.filter((record) => !record.deleted);
}

export function getOtherInspectionById(id) {
  return getOtherInspections({ includeDeleted: true }).find((record) => record.id === id) ?? null;
}

export function upsertOtherInspection(payload) {
  const normalized = normalizeRecord({
    ...payload,
    id: payload.id || createOtherId(),
    updatedAt: new Date().toISOString(),
    createdAt: payload.createdAt || new Date().toISOString(),
  });

  const records = safeRead();
  const index = records.findIndex((record) => record.id === normalized.id);
  if (index >= 0) {
    records[index] = normalized;
  } else {
    records.unshift(normalized);
  }
  safeWrite(records);
  return normalized;
}

export function softDeleteOtherInspection(id) {
  const records = safeRead();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) return null;
  records[index] = { ...records[index], deleted: true, updatedAt: new Date().toISOString() };
  safeWrite(records);
  return records[index];
}

export function createEmptyOtherInspectionRegister() {
  return {
    category: "기타",
    company: "",
    partName: "",
    content: "",
    assignee: getCurrentTitanUser(),
    registeredDate: getJournalReferenceDate(),
    status: "대기",
    note: "",
    attachments: [],
  };
}

export function mapOtherInspectionToListRow(record) {
  return {
    id: record.id,
    managementId: record.id,
    category: record.category || "—",
    company: record.company || "—",
    partName: record.partName || "—",
    content: record.content || "—",
    assignee: record.assignee || "—",
    registeredDate: record.registeredDate || "—",
    status: record.status || "대기",
    record,
  };
}

export function matchesOtherInspectionSearch(row, search) {
  const record = row.record;
  if (
    search.company &&
    !String(record.company ?? "")
      .toLowerCase()
      .includes(search.company.toLowerCase())
  ) {
    return false;
  }
  if (
    search.partName &&
    !String(record.partName ?? "")
      .toLowerCase()
      .includes(search.partName.toLowerCase())
  ) {
    return false;
  }
  if (search.managementId && !String(record.id).includes(search.managementId.trim())) return false;
  if (search.category && record.category !== search.category.trim()) return false;
  if (search.status && row.status !== search.status.trim()) return false;
  if (search.assignee && !String(record.assignee ?? "").includes(search.assignee.trim())) return false;
  if (search.registeredDateFrom && record.registeredDate < search.registeredDateFrom) return false;
  if (search.registeredDateTo && record.registeredDate > search.registeredDateTo) return false;
  if (search.note && !String(record.note ?? "").includes(search.note.trim())) return false;
  return true;
}
