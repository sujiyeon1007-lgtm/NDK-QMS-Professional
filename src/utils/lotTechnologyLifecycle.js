/**
 * Sprint 9 Phase 5 — LOT Technology Lifecycle
 *
 * Blueprint §6.1 — LOT Lifecycle에 Knowledge + Actual Work 연결.
 * Technology Summary Block — 요약만 표시 (전체 Recipe 조건 ❌).
 *
 * Code SSoT: `src/utils/lotTechnologyLifecycle.js`
 */

import { resolveRecipeTemplate } from "../config/recipeTemplateEngine";
import {
  DEVIATION_JUDGMENT_LABELS,
  LOT_KNOWLEDGE_SUMMARY_BLOCK_FIELDS,
  LOT_LIFECYCLE_DISPLAY_FIELDS,
} from "../config/titanDocumentJsonModel";
import { KR_RESULT_LABELS } from "../config/knowledgeRecordModel";
import { findProductByCompanyAndPartNo } from "./masterData";
import { normalizeSpecification } from "./productSpecificationModel";
import { buildLotTraceabilityView } from "./lotTraceabilityModel";
import {
  buildKnowledgeConditionView,
  getKnowledgeRecords,
} from "./knowledgeRecordStore";
import {
  buildActualConditionView,
  getActualWorkRecords,
} from "./actualWorkRecordStore";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function normalizeLotKey(lotNo) {
  return String(lotNo ?? "").trim().toUpperCase();
}

export function getKnowledgeRecordsByLotNo(lotNo) {
  const key = normalizeLotKey(lotNo);
  if (!key) return [];
  return getKnowledgeRecords().filter((row) => normalizeLotKey(row.lotNo) === key);
}

export function getActualWorkRecordsByLotNo(lotNo) {
  const key = normalizeLotKey(lotNo);
  if (!key) return [];
  return getActualWorkRecords().filter((row) => normalizeLotKey(row.lotNo) === key);
}

/** 대표 Parameter 키 (Blueprint §6.1.1 — 대표 온도 · 대표 시간) */
const REPRESENTATIVE_KEYS = ["treatmentTemp", "treatmentTime"];

function resolveDeviationJudgment(deviationRows) {
  const diffs = deviationRows
    .map((row) => row.numericDiff)
    .filter((value) => typeof value === "number" && !Number.isNaN(value));

  if (!diffs.length) return { key: "normal", label: DEVIATION_JUDGMENT_LABELS.normal };

  const maxAbs = Math.max(...diffs.map((value) => Math.abs(value)));
  if (maxAbs <= 2) return { key: "normal", label: DEVIATION_JUDGMENT_LABELS.normal };
  if (maxAbs <= 10) return { key: "check", label: DEVIATION_JUDGMENT_LABELS.check };
  return { key: "review", label: DEVIATION_JUDGMENT_LABELS.review };
}

function flattenConditionRows(conditionView) {
  const rows = [];
  (conditionView?.sections ?? []).forEach((section) => {
    section.fields.forEach((field) => {
      const standard = field.standard === "—" ? "" : String(field.standard).replace(/[^\d.-]/g, "");
      const actual = field.actual === "—" ? "" : String(field.actual).replace(/[^\d.-]/g, "");
      const stdNum = Number(standard);
      const actNum = Number(actual);
      let numericDiff = null;
      if (hasText(standard) && hasText(actual) && !Number.isNaN(stdNum) && !Number.isNaN(actNum)) {
        numericDiff = actNum - stdNum;
      }
      rows.push({
        key: field.key,
        label: field.label,
        unit: field.unit,
        standard: field.standard,
        actual: field.actual,
        deviation: field.deviation,
        numericDiff,
      });
    });
  });
  return rows;
}

function resolveProductSpecificationSnapshot(company, partNo) {
  const product = findProductByCompanyAndPartNo(company, partNo);
  if (!product) return null;
  return {
    company: company ?? "",
    partNo: partNo ?? "",
    partName: product.name ?? product.partName ?? "",
    material: product.material ?? "",
    specification: normalizeSpecification(product.specification),
  };
}

function buildActualWorkSummaryText(record) {
  if (!record) return "—";
  const parts = [
    record.equipmentName ? `설비 ${record.equipmentName}` : "",
    record.workerName ? `작업자 ${record.workerName}` : "",
    record.chargeStartAt ? `시작 ${record.chargeStartAt}` : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function buildInspectionSummaryText(knowledge) {
  if (!knowledge) return "—";
  const result = KR_RESULT_LABELS[knowledge.result] ?? knowledge.result ?? "—";
  const hardness = knowledge.inspectionResult?.surfaceHardness;
  const depth = knowledge.inspectionResult?.effectiveDepth;
  const parts = [result];
  if (hasText(hardness)) parts.push(`표면경도 ${hardness} HV`);
  if (hasText(depth)) parts.push(`유효경화깊이 ${depth} mm`);
  return parts.join(" · ");
}

/** LOT Lifecycle Knowledge Summary Block (PM Phase 5 · §6.1) */
export function buildLotKnowledgeSummaryBlock(lotNo) {
  const technology = buildLotTechnologySummary(lotNo);
  if (!technology) return null;

  const knowledgeRows = getKnowledgeRecordsByLotNo(lotNo);
  const primaryKnowledge = knowledgeRows[0] ?? null;

  const block = {
    recipeName: technology.recipeName ?? "—",
    recipeVersionNo: technology.recipeVersionNo ?? "V1",
    actualWorkSummary: buildActualWorkSummaryText(
      primaryKnowledge ?? getActualWorkRecordsByLotNo(lotNo)[0]
    ),
    inspectionSummary: buildInspectionSummaryText(primaryKnowledge),
    knowledgeRecordId: technology.knowledgeRecordId ?? "",
  };

  return {
    fields: LOT_KNOWLEDGE_SUMMARY_BLOCK_FIELDS.map((field) => ({
      label: field.label,
      value: block[field.key] ?? "—",
    })),
    ...block,
  };
}

/** Document JSON Payload (PM Phase 5 · TDE 전달 데이터 블록) */
export function resolveDocumentPayloadFromKnowledge(knowledgeRecord) {
  if (!knowledgeRecord) return null;
  const technology = buildLotTechnologySummary(knowledgeRecord.lotNo);
  const specSnapshot = resolveProductSpecificationSnapshot(
    knowledgeRecord.company,
    knowledgeRecord.partNo
  );

  return {
    customer: {
      company: knowledgeRecord.company ?? "",
    },
    product: {
      partNo: knowledgeRecord.partNo ?? "",
      partName: knowledgeRecord.partName ?? "",
      quantity: knowledgeRecord.quantity ?? "",
    },
    material: {
      materialId: knowledgeRecord.materialId ?? "",
      materialName: knowledgeRecord.materialName ?? "",
    },
    productSpecificationSnapshot: specSnapshot,
    recipeSnapshot: {
      recipeId: knowledgeRecord.recipeId ?? "",
      recipeCode: knowledgeRecord.recipeCode ?? "",
      recipeName: knowledgeRecord.recipeName ?? "",
      recipeVersionNo: knowledgeRecord.recipeVersionNo ?? "V1",
      templateId: knowledgeRecord.templateId ?? "",
      processName: knowledgeRecord.processName ?? "",
      parameters: { ...(knowledgeRecord.recipeParameterSnapshot ?? {}) },
    },
    actualWorkSnapshot: {
      actualWorkRecordId: knowledgeRecord.actualWorkRecordId ?? "",
      parameters: { ...(knowledgeRecord.actualParameters ?? {}) },
      equipmentName: knowledgeRecord.equipmentName ?? "",
      workerName: knowledgeRecord.workerName ?? "",
      chargeStartAt: knowledgeRecord.chargeStartAt ?? "",
      chargeEndAt: knowledgeRecord.chargeEndAt ?? "",
      workMemo: knowledgeRecord.workMemo ?? "",
    },
    inspectionResult: {
      values: { ...(knowledgeRecord.inspectionResult ?? {}) },
      result: knowledgeRecord.result ?? "",
      resultLabel: KR_RESULT_LABELS[knowledgeRecord.result] ?? "—",
      inspectorName: knowledgeRecord.inspectorName ?? "",
      inspectedAt: knowledgeRecord.inspectedAt ?? "",
    },
    knowledgeSummary: {
      deviationJudgment: technology?.deviationJudgment ?? "—",
      representativeTemp: technology?.representativeTemp ?? "—",
      representativeTime: technology?.representativeTime ?? "—",
      knowledgeMemo: knowledgeRecord.knowledgeMemo ?? "",
    },
    lotInfo: {
      lotNo: knowledgeRecord.lotNo ?? "",
      mesManagementNo: knowledgeRecord.mesManagementNo ?? "",
    },
  };
}

/**
 * LOT Technology Summary (Blueprint §6.1.1)
 * Knowledge Record 우선 · 없으면 Actual Work Record 기반.
 */
export function buildLotTechnologySummary(lotNo) {
  const key = normalizeLotKey(lotNo);
  if (!key) return null;

  const knowledgeRows = getKnowledgeRecordsByLotNo(key);
  const actualRows = getActualWorkRecordsByLotNo(key);
  const primaryKnowledge = knowledgeRows[0] ?? null;
  const primaryActual = actualRows[0] ?? null;
  const record = primaryKnowledge ?? primaryActual;

  if (!record) return null;

  const conditionView = primaryKnowledge
    ? buildKnowledgeConditionView(primaryKnowledge)
    : buildActualConditionView(primaryActual);
  const comparisonRows = flattenConditionRows(conditionView);

  const representative = comparisonRows.filter((row) => REPRESENTATIVE_KEYS.includes(row.key));
  const repTemp = representative.find((row) => row.key === "treatmentTemp");
  const repTime = representative.find((row) => row.key === "treatmentTime");

  const deviationJudgment = resolveDeviationJudgment(comparisonRows);
  const templateLabel =
    resolveRecipeTemplate({
      templateId: record.templateId,
      processName: record.processName,
    })?.label ?? "—";

  return {
    lotNo: record.lotNo,
    mesManagementNo: record.mesManagementNo ?? "",
    company: record.company ?? "",
    partNo: record.partNo ?? "",
    partName: record.partName ?? "",
    recipeId: record.recipeId,
    recipeCode: record.recipeCode,
    recipeName: record.recipeName,
    recipeVersionNo: record.recipeVersionNo ?? "V1",
    templateId: record.templateId ?? "",
    templateLabel,
    processName: record.processName ?? "",
    materialName: record.materialName ?? "",
    equipmentName: record.equipmentName ?? "",
    workerName: record.workerName ?? "",
    knowledgeRecordId: primaryKnowledge?.id ?? "",
    actualWorkRecordId: record.actualWorkRecordId ?? primaryActual?.id ?? "",
    representativeTemp: repTemp
      ? `${repTemp.actual !== "—" ? repTemp.actual : repTemp.standard}`
      : "—",
    representativeTime: repTime
      ? `${repTime.actual !== "—" ? repTime.actual : repTime.standard}`
      : "—",
    deviationJudgment: deviationJudgment.label,
    deviationJudgmentKey: deviationJudgment.key,
    inspectionResult: primaryKnowledge?.result ?? "—",
    inspectorName: primaryKnowledge?.inspectorName ?? "",
    inspectedAt: primaryKnowledge?.inspectedAt ?? "",
    comparisonRows,
    hasKnowledge: Boolean(primaryKnowledge),
    hasActualWork: Boolean(primaryActual),
    knowledgeCount: knowledgeRows.length,
    actualWorkCount: actualRows.length,
  };
}

/** LOT Lifecycle 통합 View — Traceability + Technology Summary */
export function buildLotLifecycleView(lotNo) {
  const key = String(lotNo ?? "").trim();
  if (!key) return null;

  const traceability = buildLotTraceabilityView(key);
  const technology = buildLotTechnologySummary(key);
  const knowledgeSummaryBlock = buildLotKnowledgeSummaryBlock(key);

  const displayRows = technology
    ? LOT_LIFECYCLE_DISPLAY_FIELDS.map((field) => ({
        label: field.label,
        value: technology[field.key] ?? "—",
      }))
    : [];

  return {
    lotNo: key,
    traceability,
    technology,
    knowledgeSummaryBlock,
    displayRows,
    hasTechnology: Boolean(technology),
  };
}

/** LOT Lifecycle KPI (Knowledge + Actual Work 연결 현황) */
export function buildLotLifecycleSummary() {
  const knowledgeLots = new Set(getKnowledgeRecords().map((row) => normalizeLotKey(row.lotNo)).filter(Boolean));
  const actualLots = new Set(getActualWorkRecords().map((row) => normalizeLotKey(row.lotNo)).filter(Boolean));
  const linkedLots = [...knowledgeLots].filter((lot) => actualLots.has(lot));

  return [
    { id: "knowledge", label: "Knowledge 귀속 LOT", value: knowledgeLots.size, unit: "건" },
    { id: "actual", label: "Actual Work LOT", value: actualLots.size, unit: "건" },
    { id: "linked", label: "연결 LOT", value: linkedLots.length, unit: "건" },
  ];
}
