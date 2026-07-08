/**
 * Sprint 9 Phase 3 — Actual Work Record Store (SessionStorage)
 *
 * Blueprint §5.4 — 표준 Recipe(읽기 전용) + 실제 작업 조건(작업자 입력).
 *
 * 핵심 원칙:
 *  - Production/Actual 화면에서 Recipe 자체를 수정하지 않는다 (Snapshot 참조만).
 *  - 실제 작업 조건 입력 항목은 Recipe Template(§5.3.0)에서 자동 생성한다.
 *  - Actual Work Record는 향후 Knowledge Record의 입력 데이터가 되도록 설계한다 (Engine ❌).
 */

import {
  AWR_STATUS_LABELS,
  AWR_STATUS_VALUES,
  AWR_STORAGE_KEY,
} from "../config/actualWorkRecordModel";
import {
  buildRecipeTemplateView,
  normalizeRecipeParameters,
  normalizeRecipeRecord,
  resolveRecipeTemplate,
} from "../config/recipeTemplateEngine";
import { getMasterDataByCategory } from "./masterData";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function nowIso() {
  return new Date().toISOString();
}

function statusLabel(status) {
  return AWR_STATUS_LABELS[status] ?? status ?? "—";
}

function normalizeAwrStatus(status) {
  return AWR_STATUS_VALUES.includes(status) ? status : "draft";
}

/**
 * 실제 작업의 표준으로 선택 가능한 Recipe (Blueprint §5.3.1 + PM V1.4):
 *  - Approved Recipe만
 *  - Template status가 `active`인 공정만 (planned = 이온질화·연질화 외 향후 공정은 숨김)
 *  - 향후 Template이 active로 변경되면 자동 표시
 */
export function getApprovedRecipesForSelection() {
  return getMasterDataByCategory("recipes")
    .filter((row) => row.isDeleted !== true && row.status === "Approved")
    .map((row) => normalizeRecipeRecord(row))
    .filter((row) => resolveRecipeTemplate(row)?.status === "active");
}

export function getRecipeById(recipeId) {
  const row = getMasterDataByCategory("recipes").find((r) => r.id === recipeId);
  return row ? normalizeRecipeRecord(row) : null;
}

/**
 * 표준 Recipe → Actual Work Record Snapshot (작업 시작 시점 · 불변)
 * Recipe 표준 Parameter를 복사하고, 실제값은 빈 값으로 초기화.
 */
export function buildActualWorkRecordSnapshot(recipe) {
  if (!recipe) return null;
  const normalized = normalizeRecipeRecord(recipe);
  const template = resolveRecipeTemplate(normalized);
  const standardParams = normalizeRecipeParameters(normalized);
  return {
    recipeId: normalized.id,
    recipeCode: normalized.code,
    recipeName: normalized.name,
    recipeVersionNo: normalized.versionNo || "V1",
    templateId: template?.id || normalized.templateId || "",
    processId: normalized.processId,
    processName: normalized.processName,
    materialId: normalized.materialId,
    materialName: normalized.materialName,
    recipeParameterSnapshot: { ...standardParams },
  };
}

/** 선택 Recipe의 Template Parameter 입력 항목 (실제 작업 조건 폼 자동 생성용) */
export function getActualParameterFields(recipe) {
  const view = buildRecipeTemplateView(recipe);
  return view.sections.map((section) => ({
    id: section.id,
    label: section.label,
    fields: section.fields.map((field) => ({
      key: field.key,
      label: field.label,
      unit: field.unit,
      required: field.required,
      standardValue: field.rawValue ?? "",
    })),
  }));
}

function readStore() {
  try {
    const raw = sessionStorage.getItem(AWR_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[actualWorkRecordStore.read]", error);
  }
  const seeded = buildSeedRecords();
  writeStore(seeded);
  return seeded;
}

function writeStore(records) {
  try {
    sessionStorage.setItem(AWR_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[actualWorkRecordStore.write]", error);
  }
}

function buildSeedRecords() {
  const approved = getApprovedRecipesForSelection();
  const byCode = (code) => approved.find((r) => r.code === code) ?? approved[0] ?? null;

  const seedDefs = [
    {
      id: "awr1",
      lotNo: "LOT-20260707-001",
      mesManagementNo: "DL260707-011",
      recipeCode: "RCP-ION-SCM415-001",
      equipmentName: "3S-3",
      workerName: "김작업",
      chargeStartAt: "2026-07-07 08:30",
      chargeEndAt: "2026-07-07 14:30",
      status: "completed",
      workMemo: "표준 대비 NH₃ 유량 정상 · 온도 안정",
      actual: {
        dischargeCurrent: "46",
        dischargeVoltage: "382",
        processPressure: "2.0",
        treatmentTemp: "522",
        treatmentTime: "1210",
        nitrogen: "24",
        hydrogen: "2",
        argon: "0",
        x2: "",
      },
    },
    {
      id: "awr2",
      lotNo: "LOT-20260708-002",
      mesManagementNo: "DL260708-004",
      recipeCode: "RCP-ION-SNCM439-001",
      equipmentName: "3S-1",
      workerName: "이작업",
      chargeStartAt: "2026-07-08 09:00",
      chargeEndAt: "",
      status: "in-progress",
      workMemo: "장입 진행 중",
      actual: {
        dischargeCurrent: "42",
        dischargeVoltage: "376",
        processPressure: "2.0",
        treatmentTemp: "519",
        treatmentTime: "",
        nitrogen: "22",
        hydrogen: "2",
        argon: "0",
        x2: "",
      },
    },
  ];

  const records = [];
  seedDefs.forEach((def) => {
    const recipe = byCode(def.recipeCode);
    if (!recipe) return;
    const snapshot = buildActualWorkRecordSnapshot(recipe);
    records.push({
      id: def.id,
      lotNo: def.lotNo,
      mesManagementNo: def.mesManagementNo,
      ...snapshot,
      equipmentName: def.equipmentName,
      workerName: def.workerName,
      chargeStartAt: def.chargeStartAt,
      chargeEndAt: def.chargeEndAt,
      workMemo: def.workMemo,
      actualParameters: def.actual,
      status: def.status,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      isDeleted: false,
    });
  });
  return records;
}

export function getActualWorkRecords() {
  return readStore().filter((row) => row.isDeleted !== true);
}

export function getActualWorkRecordById(id) {
  return getActualWorkRecords().find((row) => row.id === id) ?? null;
}

function nextId() {
  return `awr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * 실제 작업 조건 저장.
 * payload: { recipeId, lotNo, mesManagementNo, equipmentName, workerName,
 *            chargeStartAt, chargeEndAt, workMemo, status, actualParameters }
 * Recipe 표준은 Snapshot으로 복사 — Recipe 자체는 수정하지 않음.
 */
export function addActualWorkRecord(payload) {
  const records = readStore();
  const recipe = getRecipeById(payload.recipeId);
  if (!recipe) return { ok: false, message: "표준 Recipe(Approved)를 선택하세요." };
  if (!hasText(payload.lotNo)) return { ok: false, message: "LOT.NO는 필수입니다." };

  const snapshot = buildActualWorkRecordSnapshot(recipe);
  const record = {
    id: nextId(),
    lotNo: payload.lotNo.trim(),
    mesManagementNo: payload.mesManagementNo?.trim() ?? "",
    ...snapshot,
    equipmentName: payload.equipmentName?.trim() ?? "",
    workerName: payload.workerName?.trim() ?? "",
    chargeStartAt: payload.chargeStartAt?.trim() ?? "",
    chargeEndAt: payload.chargeEndAt?.trim() ?? "",
    workMemo: payload.workMemo?.trim() ?? "",
    actualParameters:
      payload.actualParameters && typeof payload.actualParameters === "object"
        ? { ...payload.actualParameters }
        : {},
    status: normalizeAwrStatus(payload.status),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isDeleted: false,
  };
  records.push(record);
  writeStore(records);
  return { ok: true, row: record };
}

/** 실제 작업 조건 · 작업 정보만 수정 (표준 Recipe Snapshot 불변) */
export function updateActualWorkRecord(id, payload) {
  const records = readStore();
  const idx = records.findIndex((row) => row.id === id);
  if (idx < 0) return { ok: false, message: "대상을 찾을 수 없습니다." };
  if (!hasText(payload.lotNo)) return { ok: false, message: "LOT.NO는 필수입니다." };

  const prev = records[idx];
  const updated = {
    ...prev,
    lotNo: payload.lotNo.trim(),
    mesManagementNo: payload.mesManagementNo?.trim() ?? prev.mesManagementNo,
    equipmentName: payload.equipmentName?.trim() ?? prev.equipmentName,
    workerName: payload.workerName?.trim() ?? prev.workerName,
    chargeStartAt: payload.chargeStartAt?.trim() ?? prev.chargeStartAt,
    chargeEndAt: payload.chargeEndAt?.trim() ?? prev.chargeEndAt,
    workMemo: payload.workMemo?.trim() ?? prev.workMemo,
    actualParameters:
      payload.actualParameters && typeof payload.actualParameters === "object"
        ? { ...payload.actualParameters }
        : prev.actualParameters,
    status: normalizeAwrStatus(payload.status),
    updatedAt: nowIso(),
  };
  records[idx] = updated;
  writeStore(records);
  return { ok: true, row: updated };
}

/** Soft Delete (물리 삭제 ❌ · 이력·추적성 유지) */
export function softDeleteActualWorkRecord(id) {
  const records = readStore();
  const idx = records.findIndex((row) => row.id === id);
  if (idx < 0) return { ok: false };
  records[idx] = { ...records[idx], isDeleted: true, deletedAt: nowIso() };
  writeStore(records);
  return { ok: true };
}

export function buildActualWorkRecordSummary() {
  try {
    const all = getActualWorkRecords();
    const inProgress = all.filter((row) => row.status === "in-progress");
    const completed = all.filter((row) => row.status === "completed");
    const lotSet = new Set(all.map((row) => row.lotNo).filter(hasText));
    return [
      { id: "total", label: "전체 작업기록", value: all.length, unit: "건" },
      { id: "in-progress", label: "작업중", value: inProgress.length, unit: "건" },
      { id: "completed", label: "완료", value: completed.length, unit: "건" },
      { id: "lots", label: "연결 LOT", value: lotSet.size, unit: "건" },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildActualWorkRecordSummary]", error);
    return [
      { id: "total", label: "전체 작업기록", value: 0, unit: "건" },
      { id: "in-progress", label: "작업중", value: 0, unit: "건" },
      { id: "completed", label: "완료", value: 0, unit: "건" },
      { id: "lots", label: "연결 LOT", value: 0, unit: "건" },
    ];
  }
}

/**
 * 표준값 vs 실제값 비교 View (Detail 「실제 작업 조건」탭)
 * Template Parameter 기반 자동 생성 — 표준(읽기 전용) + 실제(입력값) 2열.
 */
export function buildActualConditionView(record) {
  if (!record) return { templateLabel: "—", sections: [] };
  const recipe = {
    templateId: record.templateId,
    processName: record.processName,
    processId: record.processId,
    parameters: record.recipeParameterSnapshot ?? {},
  };
  const view = buildRecipeTemplateView(recipe);
  const actual = record.actualParameters ?? {};
  return {
    templateLabel: view.templateLabel,
    isPlanned: view.isPlanned,
    sections: view.sections.map((section) => ({
      id: section.id,
      label: section.label,
      fields: section.fields.map((field) => {
        const standard = field.rawValue ?? "";
        const actualValue = actual[field.key] ?? "";
        const stdNum = Number(standard);
        const actNum = Number(actualValue);
        let deviation = "—";
        if (hasText(standard) && hasText(actualValue) && !Number.isNaN(stdNum) && !Number.isNaN(actNum)) {
          const diff = actNum - stdNum;
          deviation = diff === 0 ? "정상" : `${diff > 0 ? "+" : ""}${Number(diff.toFixed(2))}`;
        }
        return {
          key: field.key,
          label: field.label,
          unit: field.unit,
          required: field.required,
          standard: hasText(standard) ? `${standard}${field.unit ? ` ${field.unit}` : ""}` : "—",
          actual: hasText(actualValue) ? `${actualValue}${field.unit ? ` ${field.unit}` : ""}` : "—",
          deviation,
        };
      }),
    })),
  };
}

/**
 * Knowledge Record 입력 데이터 구조 (Blueprint §5.4.4 · 설계만 · Engine ❌)
 * Actual Work Record → 향후 Knowledge Record의 actualWorkConditions 입력원.
 */
export function buildKnowledgeInputFromActualWorkRecord(record) {
  if (!record) return null;
  return {
    lotNo: record.lotNo,
    mesManagementNo: record.mesManagementNo,
    recipeVersionNo: record.recipeVersionNo,
    templateId: record.templateId,
    processName: record.processName,
    materialName: record.materialName,
    actualWorkConditions: record.actualParameters ?? {},
    equipmentName: record.equipmentName,
    workerName: record.workerName,
    chargeStartAt: record.chargeStartAt,
    chargeEndAt: record.chargeEndAt,
    // inspectionResult: (향후 Inspection Result 연계 · Phase 4+)
  };
}

export { statusLabel as awrStatusLabel };
