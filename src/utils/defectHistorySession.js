/**
 * Project TITAN V1.0 — 불량이력 SessionStorage
 */

import { getSessionProductionRecords } from "./productionRecords";
import { sumRecordQty, getCompletedProductionRecords } from "./productionAnalytics";

const STORAGE_KEY = "titan-defect-history-v2";

export const DEFECT_TYPE_OPTIONS = ["치수불량", "경도불량", "조직불량", "외관불량", "기타"];
export const DEFECT_HANDLING_STATUS = ["등록", "조치중", "완료"];

const REFERENCE_DATE = new Date("2026-06-30T12:00:00");

function readStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(records) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function buildMockDefects() {
  return [];
}

export function getSessionDefectRecords() {
  const stored = readStorage();
  if (stored) return stored;
  const seed = buildMockDefects();
  writeStorage(seed);
  return seed;
}

export function addSessionDefectRecord(record) {
  const records = getSessionDefectRecords();
  const next = [record, ...records];
  writeStorage(next);
  return next;
}

export function updateSessionDefectRecord(id, patch) {
  const records = getSessionDefectRecords();
  const next = records.map((record) =>
    record.id === id ? { ...record, ...patch, updatedAt: new Date().toISOString() } : record
  );
  writeStorage(next);
  return next;
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(date, reference) {
  const day = (reference.getDay() + 6) % 7;
  const weekStart = new Date(reference);
  weekStart.setDate(reference.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

function isSameMonth(date, reference) {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function sumDefectQty(records, matcher) {
  return records
    .filter(matcher)
    .reduce((sum, record) => sum + (Number(record.defectQty) || 0), 0);
}

export function computeDefectMetrics(records = getSessionDefectRecords(), referenceDate = REFERENCE_DATE) {
  const productionRecords = getCompletedProductionRecords(getSessionProductionRecords());
  const monthProductionQty = sumRecordQty(
    productionRecords.filter((record) => {
      const date = parseDate(record.workDate || record.dueDate);
      return date && isSameMonth(date, referenceDate);
    })
  );
  const monthDefectQty = sumDefectQty(records, (record) => {
    const date = parseDate(record.occurredDate);
    return date && isSameMonth(date, referenceDate);
  });
  const defectRate = monthProductionQty > 0 ? Math.round((monthDefectQty / monthProductionQty) * 10000) / 100 : 0;

  return {
    todayDefect: sumDefectQty(records, (record) => {
      const date = parseDate(record.occurredDate);
      return date && isSameDay(date, referenceDate);
    }),
    weekDefect: sumDefectQty(records, (record) => {
      const date = parseDate(record.occurredDate);
      return date && isSameWeek(date, referenceDate);
    }),
    monthDefect: monthDefectQty,
    defectRate,
  };
}

export function createEmptyDefectRegister() {
  return {
    managementId: "",
    lotNo: "",
    company: "",
    partName: "",
    partNo: "",
    material: "",
    process: "",
    defectType: "",
    defectQty: "",
    occurredDate: "",
    equipment: "",
    worker: "",
    handlingStatus: "등록",
    fourM: {
      man: { worker: "", trained: "예", skillLevel: "보통" },
      machine: { equipment: "", unitNo: "", abnormal: "없음" },
      material: { material: "", lotNo: "", materialAbnormal: "없음" },
      method: { workMethod: "", processCondition: "", standardCompliance: "준수" },
    },
    action: {
      cause: "",
      actionContent: "",
      prevention: "",
    },
  };
}

export function generateDefectId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `DF_${y}${m}${d}_${seq}`;
}
