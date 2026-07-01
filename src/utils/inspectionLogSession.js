/**
 * Project TITAN — 검사일지 세션 (SessionStorage)
 */

import { getCurrentTitanUser } from "./titanHistorySession";
import { getJournalReferenceDate } from "./workJournalData";
import { onInspectionComplete } from "./titanWorkflowStatus";
import { applyProductDefaultsToForm, getProductByPartNo } from "./productRegistrationSession";
import { cloneSpecification } from "./productSpecificationModel";
import { DEFAULT_HARDENING_HV } from "./inspectionReportModel";
import { migrateHardeningDepthRows, normalizeHardeningDepthRows } from "./hardeningDepthModel";

const STORAGE_KEY = "project-titan-inspection-log-v1";

export const INSPECTION_CATEGORIES = [
  { value: "개발", label: "개발" },
  { value: "양산", label: "양산" },
  { value: "초도품", label: "초도품" },
  { value: "재검사", label: "재검사" },
  { value: "고객 요청", label: "고객 요청" },
  { value: "기타", label: "기타" },
];

export const INSPECTION_JUDGMENTS = ["합격", "불합격", "보류"];

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (parsed.length > 0) return parsed;
    return getSeedInspectionLogs();
  } catch {
    return getSeedInspectionLogs();
  }
}

function getSeedInspectionLogs() {
  return [
    normalizeLog({
      id: "INS-SEED-001",
      inspectionDate: "2026-06-28",
      category: "양산",
      managementId: "HA_20260626_003",
      company: "한국금속",
      partName: "기어 블랭크",
      partNo: "HK-3305-B",
      drawingNo: "DW-3305-02",
      material: "SNCM220",
      lotNo: "LOT260628-01",
      qty: 200,
      unit: "EA",
      assignee: "품질관리부 / 정반이 사원",
      inspectionItem: "표면경도",
      inspectionStandard: "HRC 58~62",
      measuredValue: "HRC 60.2",
      judgment: "합격",
      inspectionEquipment: "경도시험기",
      inspectionLocation: "품질검사실",
      note: "",
      process: "이온질화",
      appliedSpecification: null,
      hardnessMeasurements: [],
      dimensionMeasurements: [],
      appearanceMeasurements: [],
      hasMicrostructurePhoto: false,
      microstructureJudgment: "이상없음",
      hardeningDepthHv: [...DEFAULT_HARDENING_HV],
      deleted: false,
      createdAt: "2026-06-28T09:00:00.000Z",
      updatedAt: "2026-06-28T09:00:00.000Z",
    }),
  ];
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
  return {
    id: log.id,
    inspectionDate: log.inspectionDate?.trim() || getJournalReferenceDate(),
    category: log.category?.trim() || "양산",
    managementId: log.managementId?.trim() || "",
    company: log.company?.trim() || "",
    partName: log.partName?.trim() || "",
    partNo: log.partNo?.trim() || "",
    drawingNo: log.drawingNo?.trim() || "",
    material: log.material?.trim() || "",
    lotNo: log.lotNo?.trim() || "",
    qty: Number.isFinite(Number(log.qty)) ? Number(log.qty) : 0,
    unit: log.unit?.trim() || "EA",
    assignee: log.assignee?.trim() || getCurrentTitanUser(),
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
    hardnessMeasurements: Array.isArray(log.hardnessMeasurements) ? log.hardnessMeasurements : [],
    dimensionMeasurements: Array.isArray(log.dimensionMeasurements) ? log.dimensionMeasurements : [],
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
    note: log.note?.trim() || "",
    attachments: Array.isArray(log.attachments) ? log.attachments : [],
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

export function softDeleteInspectionLog(id) {
  return updateInspectionLog(id, { deleted: true });
}

export function buildInspectionLogFromRecord(record, overrides = {}) {
  if (!record) return null;
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
    qty: record.qty,
    unit: record.unit || "EA",
    process: record.heatTreatment || "",
    assignee: getCurrentTitanUser(),
    judgment: "합격",
    inspectionItems: [],
    hardeningDepthHv: [],
    hardeningDepthRows: [],
    hasMicrostructurePhoto: false,
    microstructureJudgment: "이상없음",
    hardnessMeasurements: [],
    dimensionMeasurements: [],
    appearanceMeasurements: [],
    ...overrides,
  };
  const product = getProductByPartNo(base.partNo);
  return product ? applyProductDefaultsToForm(base, product) : base;
}
