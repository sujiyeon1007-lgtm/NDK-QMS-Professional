/**
 * Sprint 9 Phase 4 — Knowledge Record Store (SessionStorage)
 *
 * Blueprint §5.6 — Actual Work Record + Inspection 결과를 하나의 기술 데이터로 저장.
 *
 * 핵심 원칙 (PM V1.5):
 *  - Store만 구현합니다 — 저장·조회(CRUD)만. Knowledge Engine · 추천 · 자동 판정 ❌.
 *  - Recipe Snapshot(`recipeParameterSnapshot`) · Actual Snapshot(`actualParameters`)
 *    · Template Engine(§5.3.0)을 Phase 3 구조 그대로 재사용합니다.
 *  - 실제 작업 데이터는 Actual Work Record에서 Snapshot으로 복사 — 원본은 수정하지 않습니다.
 */

import {
  KR_INSPECTION_FIELDS,
  KR_RESULT_LABELS,
  KR_RESULT_VALUES,
  KR_STORAGE_KEY,
} from "../config/knowledgeRecordModel";
import { resolveRecipeTemplate } from "../config/recipeTemplateEngine";
import {
  buildActualConditionView,
  getActualWorkRecords,
  getActualWorkRecordById,
} from "./actualWorkRecordStore";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function nowIso() {
  return new Date().toISOString();
}

function resultLabel(result) {
  return KR_RESULT_LABELS[result] ?? result ?? "—";
}

function normalizeResult(result) {
  return KR_RESULT_VALUES.includes(result) ? result : "PASS";
}

/** 검사 결과 값만 정규화 (KR_INSPECTION_FIELDS 기준) */
function normalizeInspectionValues(input) {
  const values = input && typeof input === "object" ? input : {};
  const out = {};
  KR_INSPECTION_FIELDS.forEach((field) => {
    out[field.key] = String(values[field.key] ?? "").trim();
  });
  return out;
}

/**
 * Actual Work Record → Knowledge Record Snapshot (기록 시점 · 불변)
 * Recipe Snapshot · Actual Snapshot을 그대로 복사합니다 (Phase 3 구조 재사용).
 */
export function buildKnowledgeSnapshotFromActualWorkRecord(awr) {
  if (!awr) return null;
  return {
    actualWorkRecordId: awr.id,
    lotNo: awr.lotNo,
    mesManagementNo: awr.mesManagementNo,
    // 표준 Recipe 참조 (Recipe Snapshot)
    recipeId: awr.recipeId,
    recipeCode: awr.recipeCode,
    recipeName: awr.recipeName,
    recipeVersionNo: awr.recipeVersionNo || "V1",
    templateId: awr.templateId,
    processId: awr.processId,
    processName: awr.processName,
    materialId: awr.materialId,
    materialName: awr.materialName,
    recipeParameterSnapshot: { ...(awr.recipeParameterSnapshot ?? {}) },
    // 실제 작업 조건 (Actual Snapshot)
    actualParameters: { ...(awr.actualParameters ?? {}) },
    equipmentName: awr.equipmentName,
    workerName: awr.workerName,
    chargeStartAt: awr.chargeStartAt,
    chargeEndAt: awr.chargeEndAt,
    workMemo: awr.workMemo,
  };
}

/**
 * Knowledge Record 등록 후보 (Blueprint §5.6):
 *  - 완료(completed) 또는 검사완료(inspected) 상태 Actual Work Record
 *  - 이미 Knowledge Record가 생성된 작업기록은 제외 (LOT 기술 데이터 중복 방지)
 */
export function getActualWorkRecordsForKnowledge() {
  const usedIds = new Set(
    getKnowledgeRecords()
      .map((row) => row.actualWorkRecordId)
      .filter(hasText)
  );
  return getActualWorkRecords()
    .filter((row) => row.status === "completed" || row.status === "inspected")
    .filter((row) => !usedIds.has(row.id));
}

function readStore() {
  try {
    const raw = sessionStorage.getItem(KR_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[knowledgeRecordStore.read]", error);
  }
  const seeded = buildSeedRecords();
  writeStore(seeded);
  return seeded;
}

function writeStore(records) {
  try {
    sessionStorage.setItem(KR_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[knowledgeRecordStore.write]", error);
  }
}

/** Actual Work Record 완료 건을 기반으로 Knowledge Record 초기 데이터 생성 */
function buildSeedRecords() {
  const candidates = getActualWorkRecords().filter((row) => row.status === "completed");
  if (!candidates.length) return [];
  const base = candidates[0];
  const snapshot = buildKnowledgeSnapshotFromActualWorkRecord(base);
  if (!snapshot) return [];
  return [
    {
      id: "kr1",
      ...snapshot,
      company: "서암기계공업",
      partNo: "SA-4032",
      partName: "샤프트",
      quantity: "120",
      inspectionResult: normalizeInspectionValues({
        surfaceHardness: "712",
        coreHardness: "352",
        effectiveDepth: "0.32",
        caseDepth: "0.41",
        compoundLayer: "8",
        appearance: "양호",
      }),
      result: "PASS",
      inspectorName: "박검사",
      inspectedAt: "2026-07-07 16:00",
      knowledgeMemo: "표준 대비 편차 미미 · 기술 데이터 정상 축적",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      isDeleted: false,
    },
  ];
}

export function getKnowledgeRecords() {
  return readStore().filter((row) => row.isDeleted !== true);
}

export function getKnowledgeRecordById(id) {
  return getKnowledgeRecords().find((row) => row.id === id) ?? null;
}

function nextId() {
  return `kr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Knowledge Record 저장.
 * payload: { actualWorkRecordId, company, partNo, partName, quantity,
 *            inspectionResult, result, inspectorName, inspectedAt, knowledgeMemo }
 * Actual Work Record는 Snapshot으로 복사 — 원본은 수정하지 않습니다.
 */
export function addKnowledgeRecord(payload) {
  const records = readStore();
  const awr = getActualWorkRecordById(payload.actualWorkRecordId);
  if (!awr) return { ok: false, message: "완료된 실제 작업 기록을 선택하세요." };

  const snapshot = buildKnowledgeSnapshotFromActualWorkRecord(awr);
  const record = {
    id: nextId(),
    ...snapshot,
    company: payload.company?.trim() ?? "",
    partNo: payload.partNo?.trim() ?? "",
    partName: payload.partName?.trim() ?? "",
    quantity: payload.quantity?.trim() ?? "",
    inspectionResult: normalizeInspectionValues(payload.inspectionResult),
    result: normalizeResult(payload.result),
    inspectorName: payload.inspectorName?.trim() ?? "",
    inspectedAt: payload.inspectedAt?.trim() ?? "",
    knowledgeMemo: payload.knowledgeMemo?.trim() ?? "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isDeleted: false,
  };
  records.push(record);
  writeStore(records);
  return { ok: true, row: record };
}

/**
 * 검사 결과·귀속 정보만 수정 (Recipe/Actual Snapshot 불변).
 * Snapshot(표준 Recipe · 실제 작업 조건)은 기록 시점 그대로 유지합니다.
 */
export function updateKnowledgeRecord(id, payload) {
  const records = readStore();
  const idx = records.findIndex((row) => row.id === id);
  if (idx < 0) return { ok: false, message: "대상을 찾을 수 없습니다." };

  const prev = records[idx];
  const updated = {
    ...prev,
    company: payload.company?.trim() ?? prev.company,
    partNo: payload.partNo?.trim() ?? prev.partNo,
    partName: payload.partName?.trim() ?? prev.partName,
    quantity: payload.quantity?.trim() ?? prev.quantity,
    inspectionResult: normalizeInspectionValues(payload.inspectionResult),
    result: normalizeResult(payload.result),
    inspectorName: payload.inspectorName?.trim() ?? prev.inspectorName,
    inspectedAt: payload.inspectedAt?.trim() ?? prev.inspectedAt,
    knowledgeMemo: payload.knowledgeMemo?.trim() ?? prev.knowledgeMemo,
    updatedAt: nowIso(),
  };
  records[idx] = updated;
  writeStore(records);
  return { ok: true, row: updated };
}

/** Soft Delete (물리 삭제 ❌ · 기술 데이터 추적성 유지) */
export function softDeleteKnowledgeRecord(id) {
  const records = readStore();
  const idx = records.findIndex((row) => row.id === id);
  if (idx < 0) return { ok: false };
  records[idx] = { ...records[idx], isDeleted: true, deletedAt: nowIso() };
  writeStore(records);
  return { ok: true };
}

export function buildKnowledgeRecordSummary() {
  try {
    const all = getKnowledgeRecords();
    const pass = all.filter((row) => row.result === "PASS");
    const fail = all.filter((row) => row.result === "FAIL" || row.result === "REWORK");
    const lotSet = new Set(all.map((row) => row.lotNo).filter(hasText));
    return [
      { id: "total", label: "기술 데이터", value: all.length, unit: "건" },
      { id: "pass", label: "합격", value: pass.length, unit: "건" },
      { id: "fail", label: "불합격/재처리", value: fail.length, unit: "건" },
      { id: "lots", label: "귀속 LOT", value: lotSet.size, unit: "건" },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildKnowledgeRecordSummary]", error);
    return [
      { id: "total", label: "기술 데이터", value: 0, unit: "건" },
      { id: "pass", label: "합격", value: 0, unit: "건" },
      { id: "fail", label: "불합격/재처리", value: 0, unit: "건" },
      { id: "lots", label: "귀속 LOT", value: 0, unit: "건" },
    ];
  }
}

/**
 * 표준값 vs 실제값 비교 View (Detail 「실제 작업 조건」탭)
 * Phase 3 buildActualConditionView 재사용 — Recipe Snapshot + Actual Snapshot 기반.
 */
export function buildKnowledgeConditionView(record) {
  return buildActualConditionView(record);
}

/** 검사 결과 표시용 (Detail 「검사 결과」탭) */
export function buildInspectionResultView(record) {
  const values = record?.inspectionResult ?? {};
  return KR_INSPECTION_FIELDS.map((field) => {
    const raw = values[field.key] ?? "";
    return {
      key: field.key,
      label: field.label,
      unit: field.unit,
      value: hasText(raw) ? `${raw}${field.unit ? ` ${field.unit}` : ""}` : "—",
    };
  });
}

export function resolveKnowledgeTemplateLabel(record) {
  if (!record) return "—";
  return (
    resolveRecipeTemplate({
      templateId: record.templateId,
      processName: record.processName,
    })?.label ?? "—"
  );
}

export { resultLabel as knowledgeResultLabel };
