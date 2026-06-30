/**
 * Project TITAN V1.0 — 불량이력 SessionStorage
 */

import { getSessionProductionRecords } from "./productionRecords";
import { sumRecordQty, getCompletedProductionRecords } from "./productionAnalytics";

const STORAGE_KEY = "titan-defect-history-v1";

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
  return [
    {
      id: "DF_20260628_001",
      managementId: "HA_20260626_003",
      lotNo: "LOT260628-01",
      company: "한국금속",
      partName: "기어 블랭크",
      partNo: "HK-3305-B",
      material: "SNCM220",
      process: "침탄",
      defectType: "경도불량",
      defectQty: 3,
      occurredDate: "2026-06-28",
      equipment: "GAS-01",
      worker: "김작업",
      handlingStatus: "조치중",
      fourM: {
        man: { worker: "김작업", trained: "예", skillLevel: "숙련" },
        machine: { equipment: "GAS-01", unitNo: "1호기", abnormal: "없음" },
        material: { material: "SNCM220", lotNo: "LOT260628-01", materialAbnormal: "없음" },
        method: { workMethod: "표준작업", processCondition: "820℃ × 4h", standardCompliance: "준수" },
      },
      action: {
        cause: "질화 온도 편차",
        actionContent: "온도 프로파일 재점검",
        prevention: "주간 설비 PM 강화",
      },
      createdAt: "2026-06-28T14:20:00.000Z",
      updatedAt: "2026-06-28T14:20:00.000Z",
    },
    {
      id: "DF_20260627_002",
      managementId: "SH_20260624_008",
      lotNo: "LOT260628-01",
      company: "신화산업",
      partName: "베어링 레이스",
      partNo: "SH-4412-J",
      material: "SUJ2",
      process: "침탄",
      defectType: "외관불량",
      defectQty: 2,
      occurredDate: "2026-06-27",
      equipment: "GAS-01",
      worker: "이작업",
      handlingStatus: "등록",
      fourM: {
        man: { worker: "이작업", trained: "예", skillLevel: "보통" },
        machine: { equipment: "GAS-01", unitNo: "1호기", abnormal: "없음" },
        material: { material: "SUJ2", lotNo: "LOT260628-01", materialAbnormal: "없음" },
        method: { workMethod: "표준작업", processCondition: "820℃ × 4h", standardCompliance: "준수" },
      },
      action: {
        cause: "적재 시 스크래치",
        actionContent: "포장 공정 분리",
        prevention: "완료품 전용 적재함 사용",
      },
      createdAt: "2026-06-27T11:05:00.000Z",
      updatedAt: "2026-06-27T11:05:00.000Z",
    },
  ];
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
