/**
 * Sprint 9 Phase 5 — TITAN Document JSON Builder
 *
 * Blueprint §6.2.1 — Knowledge Record + LOT Source → Document JSON 생성.
 * TDE는 이 JSON을 수신하여 Rendering만 수행 (본 Phase TDE Engine ❌).
 *
 * Code SSoT: `src/utils/titanDocumentJsonBuilder.js`
 */

import {
  KR_INSPECTION_FIELDS,
  KR_RESULT_LABELS,
} from "../config/knowledgeRecordModel";
import {
  TITAN_DOCUMENT_JSON_SCHEMA_VERSION,
  TITAN_DOCUMENT_JSON_STORAGE_KEY,
  TITAN_DOCUMENT_TABLE_COLUMNS,
  TITAN_DOCUMENT_TYPES,
} from "../config/titanDocumentJsonModel";
import { buildLotTechnologySummary, resolveDocumentPayloadFromKnowledge } from "./lotTechnologyLifecycle";
import { getKnowledgeRecordById } from "./knowledgeRecordStore";

function nowIso() {
  return new Date().toISOString();
}

function nextDocumentId() {
  return `TDJ-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function readStore() {
  try {
    const raw = sessionStorage.getItem(TITAN_DOCUMENT_JSON_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[titanDocumentJsonBuilder.read]", error);
  }
  return [];
}

function writeStore(documents) {
  try {
    sessionStorage.setItem(TITAN_DOCUMENT_JSON_STORAGE_KEY, JSON.stringify(documents));
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[titanDocumentJsonBuilder.write]", error);
  }
}

/**
 * Knowledge Record → TITAN Document JSON (TDE Interface)
 * 계산·판정·Workflow 없음 — Snapshot 데이터 조립만.
 */
export function buildTechnologyDocumentJson(knowledgeRecord) {
  if (!knowledgeRecord) return null;

  const lotNo = knowledgeRecord.lotNo;
  const technology = buildLotTechnologySummary(lotNo);
  const payload = resolveDocumentPayloadFromKnowledge(knowledgeRecord);
  const inspection = knowledgeRecord.inspectionResult ?? {};

  const inspectionRows = KR_INSPECTION_FIELDS.map((field) => {
    const raw = inspection[field.key] ?? "";
    return {
      key: field.key,
      label: field.label,
      unit: field.unit,
      value: raw ? `${raw}${field.unit ? ` ${field.unit}` : ""}` : "—",
    };
  });

  const tableRows = (technology?.comparisonRows ?? []).map((row) => ({
    key: row.key,
    label: row.label,
    standard: row.standard,
    actual: row.actual,
    deviation: row.deviation,
  }));

  return {
    schemaVersion: TITAN_DOCUMENT_JSON_SCHEMA_VERSION,
    documentId: nextDocumentId(),
    documentType: TITAN_DOCUMENT_TYPES.TECHNOLOGY_SUMMARY,
    generatedAt: nowIso(),

    sources: {
      lotNo: knowledgeRecord.lotNo ?? "",
      mesManagementNo: knowledgeRecord.mesManagementNo ?? "",
      actualWorkRecordId: knowledgeRecord.actualWorkRecordId ?? "",
      knowledgeRecordId: knowledgeRecord.id ?? "",
      recipeVersionNo: knowledgeRecord.recipeVersionNo ?? "V1",
      templateId: knowledgeRecord.templateId ?? "",
      templateVersionNo: knowledgeRecord.templateVersionNo ?? null,
    },

    /** PM Phase 5 · TDE 전달 Payload (Customer · Product · Spec · Snapshots · LOT) */
    payload,

    header: {
      title: "Technology Summary",
      documentNo: `TS-${String(lotNo ?? "").replace(/\s+/g, "")}`,
      lotNo: knowledgeRecord.lotNo ?? "",
      mesManagementNo: knowledgeRecord.mesManagementNo ?? "",
      company: knowledgeRecord.company ?? "",
      partNo: knowledgeRecord.partNo ?? "",
      partName: knowledgeRecord.partName ?? "",
      processName: knowledgeRecord.processName ?? "",
      recipeName: knowledgeRecord.recipeName ?? "",
      recipeCode: knowledgeRecord.recipeCode ?? "",
      recipeVersionNo: knowledgeRecord.recipeVersionNo ?? "V1",
      templateId: knowledgeRecord.templateId ?? "",
    },

    body: {
      summary: technology?.deviationJudgment
        ? `편차 판정: ${technology.deviationJudgment} (Recipe vs Actual 참고용 · 합격/불합격 ❌)`
        : "",
      workMemo: knowledgeRecord.workMemo ?? knowledgeRecord.knowledgeMemo ?? "",
      equipmentName: knowledgeRecord.equipmentName ?? "",
      workerName: knowledgeRecord.workerName ?? "",
      chargeStartAt: knowledgeRecord.chargeStartAt ?? "",
      chargeEndAt: knowledgeRecord.chargeEndAt ?? "",
      representativeTemp: technology?.representativeTemp ?? "—",
      representativeTime: technology?.representativeTime ?? "—",
    },

    table: {
      title: "표준 Recipe vs 실제 작업 조건",
      columns: TITAN_DOCUMENT_TABLE_COLUMNS,
      rows: tableRows,
    },

    graph: {
      enabled: false,
      series: [],
      note: "Phase 5 placeholder — TDE Rendering only",
    },

    photo: {
      enabled: false,
      items: [],
      note: "Phase 5 placeholder — TDE Rendering only",
    },

    approval: {
      inspectorName: knowledgeRecord.inspectorName ?? "",
      inspectedAt: knowledgeRecord.inspectedAt ?? "",
      result: knowledgeRecord.result ?? "",
      resultLabel: KR_RESULT_LABELS[knowledgeRecord.result] ?? "—",
      inspectionRows,
    },

    footer: {
      generatedBy: "Project TITAN",
      platform: "NDK QMS Professional",
      renderingOnly: true,
      tdeNote: "TDE Engine 미구현 — Document JSON Interface only",
    },

    meta: {
      tdeEngine: false,
      renderingOnly: true,
      knowledgeSourcePolicy: "LOT · Actual Work · Inspection · Recipe Version · Template Version",
    },
  };
}

/** Document JSON 저장 (TDE 전달용 · SessionStorage) */
export function saveTitanDocumentJson(documentJson) {
  if (!documentJson?.documentId) return { ok: false };
  const store = readStore();
  const idx = store.findIndex((row) => row.documentId === documentJson.documentId);
  if (idx >= 0) {
    store[idx] = documentJson;
  } else {
    store.push(documentJson);
  }
  writeStore(store);
  return { ok: true, document: documentJson };
}

/** Knowledge Record ID → Document JSON 생성 + 저장 */
export function generateAndSaveTechnologyDocumentJson(knowledgeRecordId) {
  const record = getKnowledgeRecordById(knowledgeRecordId);
  if (!record) return { ok: false, message: "Knowledge Record를 찾을 수 없습니다." };
  const document = buildTechnologyDocumentJson(record);
  if (!document) return { ok: false, message: "Document JSON 생성 실패" };
  saveTitanDocumentJson(document);
  return { ok: true, document };
}

export function getTitanDocumentJsonById(documentId) {
  return readStore().find((row) => row.documentId === documentId) ?? null;
}

export function getTitanDocumentJsonByKnowledgeId(knowledgeRecordId) {
  return (
    readStore()
      .filter((row) => row.sources?.knowledgeRecordId === knowledgeRecordId)
      .sort((a, b) => String(b.generatedAt).localeCompare(String(a.generatedAt)))[0] ?? null
  );
}

export function listTitanDocumentJsonByLotNo(lotNo) {
  const key = String(lotNo ?? "").trim().toUpperCase();
  return readStore().filter(
    (row) => String(row.sources?.lotNo ?? "").trim().toUpperCase() === key
  );
}
