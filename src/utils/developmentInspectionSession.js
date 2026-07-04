/**
 * Project TITAN V1.3 — 개발검사 SessionStorage
 */

import { getCurrentTitanUser } from "./titanHistorySession";
import { getJournalReferenceDate } from "./workJournalData";
import { DEVELOPMENT_INSPECTION_STATUS } from "../config/inspectionManagement";

const STORAGE_KEY = "project-titan-development-inspection-v1";

function createDevId() {
  return `DEV-${Date.now()}`;
}

function normalizeRecord(record) {
  return {
    id: record.id || createDevId(),
    testName: record.testName?.trim() || "",
    company: record.company?.trim() || "",
    partName: record.partName?.trim() || "",
    material: record.material?.trim() || "",
    requester: record.requester?.trim() || "",
    registeredDate: record.registeredDate?.trim() || getJournalReferenceDate(),
    status: DEVELOPMENT_INSPECTION_STATUS.includes(record.status) ? record.status : "대기",
    testPurpose: record.testPurpose?.trim() || "",
    measurementItems: record.measurementItems?.trim() || "",
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
      id: "DEV-SEED-001",
      testName: "신규 소재 경도 시험",
      company: "서암기계공업",
      partName: "BULL GEAR",
      material: "SNCM439",
      requester: "연구개발팀 / 김대리",
      registeredDate: "2026-07-02",
      status: "진행중",
      testPurpose: "신규 열처리 조건 검증",
      measurementItems: "표면경도 · 유효경화깊이",
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

export function getDevelopmentInspections({ includeDeleted = false } = {}) {
  const records = safeRead();
  if (includeDeleted) return records;
  return records.filter((record) => !record.deleted);
}

export function getDevelopmentInspectionById(id) {
  return getDevelopmentInspections({ includeDeleted: true }).find((record) => record.id === id) ?? null;
}

export function upsertDevelopmentInspection(payload) {
  const normalized = normalizeRecord({
    ...payload,
    id: payload.id || createDevId(),
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

export function softDeleteDevelopmentInspection(id) {
  const records = safeRead();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) return null;
  records[index] = { ...records[index], deleted: true, updatedAt: new Date().toISOString() };
  safeWrite(records);
  return records[index];
}

export function createEmptyDevelopmentInspectionRegister() {
  return {
    testName: "",
    company: "",
    partName: "",
    material: "",
    requester: getCurrentTitanUser(),
    registeredDate: getJournalReferenceDate(),
    status: "대기",
    testPurpose: "",
    measurementItems: "",
    note: "",
    attachments: [],
  };
}

export function mapDevelopmentInspectionToListRow(record) {
  return {
    id: record.id,
    devNo: record.id,
    company: record.company || "—",
    partName: record.partName || "—",
    testName: record.testName || "—",
    material: record.material || "—",
    requester: record.requester || "—",
    registeredDate: record.registeredDate || "—",
    status: record.status || "대기",
    record,
  };
}

export function matchesDevelopmentInspectionSearch(row, search) {
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
  if (
    search.material &&
    !String(record.material ?? "")
      .toLowerCase()
      .includes(search.material.toLowerCase())
  ) {
    return false;
  }
  if (search.managementId && !String(record.id).includes(search.managementId.trim())) return false;
  if (search.status && row.status !== search.status.trim()) return false;
  if (search.assignee && !String(record.requester ?? "").includes(search.assignee.trim())) return false;
  if (search.registeredDateFrom && record.registeredDate < search.registeredDateFrom) return false;
  if (search.registeredDateTo && record.registeredDate > search.registeredDateTo) return false;
  if (search.note && !String(record.note ?? "").includes(search.note.trim())) return false;
  return true;
}
