import { AWR_STATUS_LABELS, AWR_WORK_FIELDS } from "../config/actualWorkRecordModel";
import { KR_RESULT_LABELS } from "../config/knowledgeRecordModel";
import { buildRecipeTemplateView } from "../config/recipeTemplateEngine";
import { getRecipeById } from "./actualWorkRecordStore";
import { buildInspectionResultView } from "./knowledgeRecordStore";
import {
  buildLotKnowledgeSummaryBlock,
  buildLotLifecycleView,
  buildLotTechnologySummary,
  getActualWorkRecordsByLotNo,
  getKnowledgeRecordsByLotNo,
} from "./lotTechnologyLifecycle";
import { buildLotTraceabilityView } from "./lotTraceabilityModel";
import { listTitanDocumentJsonByLotNo } from "./titanDocumentJsonBuilder";
import { getWorkflowTimelineItems } from "./titanWorkflowIntegration";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function resolveActiveLotNo({ lotNo, equipmentDetail, activeSession, selectedLotRow }) {
  return (
    String(lotNo ?? "").trim() ||
    activeSession?.lotNo ||
    selectedLotRow?.lotNo ||
    equipmentDetail?.currentLotNo ||
    ""
  );
}

function buildRecipeSection(technology, knowledgeRecord, actualRecord) {
  const source = knowledgeRecord ?? actualRecord;
  if (!source) return null;
  const recipe = technology?.recipeId ? getRecipeById(technology.recipeId) : null;
  const templateView = recipe
    ? buildRecipeTemplateView(recipe)
    : buildRecipeTemplateView({
        templateId: source.templateId,
        processName: source.processName,
        parameters: source.recipeParameterSnapshot ?? {},
      });
  return {
    recipeName: technology?.recipeName ?? source.recipeName ?? "-",
    recipeVersionNo: technology?.recipeVersionNo ?? source.recipeVersionNo ?? "V1",
    templateLabel: technology?.templateLabel ?? templateView.templateLabel ?? "-",
    processName: technology?.processName ?? source.processName ?? "-",
    processSteps: (templateView.sections ?? []).map((section, index) => ({
      order: index + 1,
      label: section.label,
      fieldCount: section.fields?.length ?? 0,
    })),
    conditionRows: (templateView.sections ?? []).flatMap((section) =>
      (section.fields ?? []).map((field) => ({
        section: section.label,
        label: field.label,
        value: field.value,
      }))
    ),
  };
}

function buildActualWorkSection(actualRecord) {
  if (!actualRecord) return null;
  return {
    statusLabel: AWR_STATUS_LABELS[actualRecord.status] ?? actualRecord.status ?? "-",
    fields: AWR_WORK_FIELDS.map((field) => ({ label: field.label, value: actualRecord[field.key] ?? "-" })),
    workMemo: actualRecord.workMemo ?? "",
  };
}

function buildInspectionSection({ traceability, knowledgeRecord }) {
  const result = knowledgeRecord?.result ?? "";
  const resultLabel = KR_RESULT_LABELS[result] ?? (hasText(result) ? result : "-");
  return {
    inspectionStatus: traceability?.inspection?.status ?? "미검사",
    qualityStatus: hasText(result) ? resultLabel : traceability?.inspection?.status ?? "-",
    resultLabel,
    inspectorName: knowledgeRecord?.inspectorName ?? "-",
    inspectedAt: knowledgeRecord?.inspectedAt ?? "-",
    fields: knowledgeRecord ? buildInspectionResultView(knowledgeRecord) : [],
  };
}

function buildKnowledgeSection({ knowledgeRecord, technology, actualRecord }) {
  if (!knowledgeRecord && !actualRecord) return null;
  const summaryBlock = technology?.lotNo ? buildLotKnowledgeSummaryBlock(technology.lotNo) : null;
  return {
    deviationJudgment: technology?.deviationJudgment ?? "-",
    summaryFields: summaryBlock?.fields ?? [],
    tips: [knowledgeRecord?.knowledgeMemo, actualRecord?.workMemo ? `작업 메모: ${actualRecord.workMemo}` : ""].filter(hasText),
    recommendedConditions: (technology?.comparisonRows ?? [])
      .filter((row) => row.key === "treatmentTemp" || row.key === "treatmentTime")
      .map((row) => ({ label: row.label, standard: row.standard, actual: row.actual, deviation: row.deviation })),
  };
}

function buildTraceabilitySteps(traceability) {
  if (!traceability) return [];
  return [
    { label: "생산일보", value: traceability.dailyReport?.status ?? "-" },
    { label: "검사", value: traceability.inspection?.status ?? "-" },
    { label: "성적서", value: traceability.certificate?.status ?? "-" },
    { label: "출고", value: traceability.shipment?.status ?? "-" },
  ];
}

function buildLotLifecycleSection({ lotNo, equipmentId, traceability, lifecycleView }) {
  const timelineItems = equipmentId ? getWorkflowTimelineItems(equipmentId, lotNo) : traceability?.timeline ?? [];
  return {
    currentProcess: traceability?.status ?? lifecycleView?.traceability?.status ?? "-",
    progress: traceability?.progress ?? 0,
    managementId: traceability?.managementId ?? lifecycleView?.technology?.mesManagementNo ?? "-",
    timeline: Array.isArray(timelineItems)
      ? timelineItems.map((row) => ({
          time: row.time ?? row.at ?? "-",
          label: row.label ?? row.type ?? "-",
          detail: row.detail ?? row.description ?? "",
        }))
      : [],
    traceabilitySteps: buildTraceabilitySteps(traceability),
    relatedDocuments: listTitanDocumentJsonByLotNo(lotNo).map((doc) => ({
      documentId: doc.documentId,
      documentType: doc.documentType ?? "technology",
      schemaVersion: doc.schemaVersion ?? "",
    })),
  };
}

function buildEquipmentSummary(equipmentDetail, equipment, lotNo) {
  if (!equipmentDetail && !equipment) return null;
  const detail = equipmentDetail ?? {};
  const equip = equipment ?? {};
  return {
    equipmentName: detail.equipmentName ?? equip.name ?? "-",
    process: detail.process ?? equip.process ?? "-",
    status: detail.status ?? equip.status ?? "idle",
    currentWork: detail.currentProductName ?? detail.sameLotProducts?.[0]?.partName ?? "-",
    currentLotNo: lotNo || detail.currentLotNo || "-",
    progress: detail.progress ?? equip.runningSession?.progress ?? 0,
    operator: detail.operator ?? equip.runningSession?.operator ?? "-",
    startTime: detail.startTime ?? equip.runningSession?.startTime ?? "-",
    expectedEndTime: detail.expectedEndTime ?? equip.runningSession?.expectedEndTime ?? "-",
  };
}

function buildLinks(lotNo) {
  const key = String(lotNo ?? "").trim();
  const query = key ? `?lot=${encodeURIComponent(key)}` : "";
  return {
    lotLifecycle: `/quality/lot-lifecycle${query}`,
    documents: `/quality/lot-lifecycle${query}`,
  };
}

export function buildQrWorkflowTechnologyView(input = {}) {
  const { equipmentDetail, equipment, activeSession, selectedLotRow } = input;
  const resolvedLotNo = resolveActiveLotNo({
    lotNo: input.lotNo,
    equipmentDetail,
    activeSession,
    selectedLotRow,
  });
  const equipmentId = equipmentDetail?.equipmentId ?? equipment?.id ?? "";

  if (!resolvedLotNo) {
    return {
      lotNo: "",
      hasTechnologyData: false,
      equipmentSummary: buildEquipmentSummary(equipmentDetail, equipment, ""),
      recipe: null,
      actualWork: null,
      inspection: buildInspectionSection({ traceability: null, knowledgeRecord: null }),
      knowledge: null,
      lotLifecycle: null,
      links: buildLinks(""),
    };
  }

  const lifecycleView = buildLotLifecycleView(resolvedLotNo);
  const technology = buildLotTechnologySummary(resolvedLotNo);
  const knowledgeRecord = getKnowledgeRecordsByLotNo(resolvedLotNo)[0] ?? null;
  const actualRecord = getActualWorkRecordsByLotNo(resolvedLotNo)[0] ?? null;
  const traceability = buildLotTraceabilityView(resolvedLotNo);

  return {
    lotNo: resolvedLotNo,
    hasTechnologyData: Boolean(technology || knowledgeRecord || actualRecord),
    equipmentSummary: buildEquipmentSummary(equipmentDetail, equipment, resolvedLotNo),
    recipe: buildRecipeSection(technology, knowledgeRecord, actualRecord),
    actualWork: buildActualWorkSection(actualRecord),
    inspection: buildInspectionSection({ traceability, knowledgeRecord }),
    knowledge: buildKnowledgeSection({ knowledgeRecord, technology, actualRecord }),
    lotLifecycle: buildLotLifecycleSection({ lotNo: resolvedLotNo, equipmentId, traceability, lifecycleView }),
    links: buildLinks(resolvedLotNo),
  };
}