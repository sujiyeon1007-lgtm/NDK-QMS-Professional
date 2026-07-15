const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "src", "utils", "productProcessWorkflow.js");

const content = `/**
 * Product Master -> Runtime process workflow SSOT
 */

import {
  inferProcessCategoryFromDetail,
  resolveProductProcessLabel,
} from "../config/productProcessSelection";
import { WORKFLOW_STATUS } from "./titanWorkflowStatus";

/** @typedef {{ order: number, processCategory: string, processDetail: string }} ProcessWorkflowStep */

export function normalizeProcessWorkflow(steps) {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((step, index) => {
      const processDetail = String(step?.processDetail ?? "").trim();
      const processCategory =
        String(step?.processCategory ?? "").trim() ||
        inferProcessCategoryFromDetail(processDetail);
      if (!processDetail && !processCategory) return null;
      return {
        order: Number(step?.order) > 0 ? Number(step.order) : index + 1,
        processCategory,
        processDetail,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({ ...step, order: index + 1 }));
}

export function buildProcessWorkflowFromLegacy(
  processCategory = "",
  processDetail = "",
  fallbackProcess = ""
) {
  const detail = String(processDetail ?? fallbackProcess ?? "").trim();
  if (!detail) return [];
  const category =
    String(processCategory ?? "").trim() || inferProcessCategoryFromDetail(detail, fallbackProcess);
  return [{ order: 1, processCategory: category, processDetail: detail }];
}

export function resolveProductProcessWorkflow(product) {
  if (!product) return [];
  const fromWorkflow = normalizeProcessWorkflow(product.processWorkflow);
  if (fromWorkflow.length) return fromWorkflow;
  return buildProcessWorkflowFromLegacy(
    product.processCategory,
    product.processDetail,
    product.process
  );
}

export function getWorkflowStepAtIndex(workflow, index = 0) {
  const list = normalizeProcessWorkflow(workflow);
  if (!list.length) return null;
  const safeIndex = Math.max(0, Math.min(Number(index) || 0, list.length - 1));
  return list[safeIndex] ?? null;
}

export function getRecordProcessWorkflow(record) {
  if (!record) return [];
  const snapshot = normalizeProcessWorkflow(record.processWorkflow);
  if (snapshot.length) return snapshot;
  return buildProcessWorkflowFromLegacy(
    record.processCategory,
    record.processDetail ?? record.heatTreatment,
    record.process ?? record.heatTreatment
  );
}

export function resolveRecordCurrentProcessDetail(record) {
  if (!record) return "";
  const fromCurrent = String(record.currentProcessDetail ?? "").trim();
  if (fromCurrent) return fromCurrent;

  const workflow = getRecordProcessWorkflow(record);
  const step = getWorkflowStepAtIndex(workflow, record.currentProcessStepIndex ?? 0);
  if (step?.processDetail) return step.processDetail;

  return String(record.processDetail ?? record.heatTreatment ?? record.process ?? "").trim();
}

export function resolveRecordCurrentProcessCategory(record) {
  if (!record) return "";
  const fromCurrent = String(record.currentProcessCategory ?? "").trim();
  if (fromCurrent) return fromCurrent;

  const workflow = getRecordProcessWorkflow(record);
  const step = getWorkflowStepAtIndex(workflow, record.currentProcessStepIndex ?? 0);
  if (step?.processCategory) return step.processCategory;

  return String(record.processCategory ?? "").trim();
}

export function buildRecordProcessFieldsFromStep(step) {
  if (!step) return {};
  const processDetail = String(step.processDetail ?? "").trim();
  const processCategory = String(step.processCategory ?? "").trim();
  return {
    currentProcessCategory: processCategory,
    currentProcessDetail: processDetail,
    processCategory,
    processDetail,
    heatTreatment: resolveProductProcessLabel(processCategory, processDetail),
  };
}

export function buildInboundProcessWorkflowPatch(product) {
  const workflow = resolveProductProcessWorkflow(product);
  const firstStep = getWorkflowStepAtIndex(workflow, 0);
  if (!firstStep) return {};
  return {
    processWorkflow: workflow.map((step) => ({ ...step })),
    currentProcessStepIndex: 0,
    awaitingNextProcessStep: false,
    ...buildRecordProcessFieldsFromStep(firstStep),
  };
}

export function buildProductProcessWorkflowSavePatch(productPayload = {}) {
  const workflow = normalizeProcessWorkflow(productPayload.processWorkflow);
  const resolved =
    workflow.length > 0
      ? workflow
      : buildProcessWorkflowFromLegacy(
          productPayload.processCategory,
          productPayload.processDetail,
          productPayload.process
        );
  const firstStep = getWorkflowStepAtIndex(resolved, 0);
  if (!firstStep) {
    return { processWorkflow: [] };
  }
  return {
    processWorkflow: resolved,
    processCategory: firstStep.processCategory,
    processDetail: firstStep.processDetail,
    process: resolveProductProcessLabel(firstStep.processCategory, firstStep.processDetail),
  };
}

export function shouldAdvanceProcessWorkflowOnFinish(record) {
  const workflow = getRecordProcessWorkflow(record);
  if (workflow.length <= 1) return false;
  const idx = Number(record?.currentProcessStepIndex) || 0;
  return idx < workflow.length - 1;
}

export function buildProcessWorkflowAdvancePatch(record) {
  if (!shouldAdvanceProcessWorkflowOnFinish(record)) return null;

  const workflow = getRecordProcessWorkflow(record);
  const nextIndex = (Number(record?.currentProcessStepIndex) || 0) + 1;
  const nextStep = getWorkflowStepAtIndex(workflow, nextIndex);
  if (!nextStep) return null;

  return {
    currentProcessStepIndex: nextIndex,
    awaitingNextProcessStep: true,
    workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
    completionStatus: "작업대기",
    registered: false,
    dailyReportAutoCreated: false,
    dailyReportDraftStarted: false,
    productionEndAt: "",
    productionCompletedAt: "",
    productionCompletedBy: "",
    ...buildRecordProcessFieldsFromStep(nextStep),
  };
}

export function isAwaitingNextProcessStep(record) {
  return record?.awaitingNextProcessStep === true;
}

export function getRemainingProcessWorkflowSteps(record) {
  const workflow = getRecordProcessWorkflow(record);
  const fromIndex = Number(record?.currentProcessStepIndex) || 0;
  return workflow.slice(fromIndex + 1).map((step, offset) => ({
    ...step,
    stepIndex: fromIndex + 1 + offset,
  }));
}

export function shouldPromptProcessStepOnComplete(record) {
  if (!record) return false;
  const workflow = getRecordProcessWorkflow(record);
  const fromIndex = Number(record?.currentProcessStepIndex) || 0;
  return workflow.length > 1 && fromIndex < workflow.length - 1;
}

export function getProcessStepCompleteDialogModel(record) {
  const workflow = getRecordProcessWorkflow(record);
  const fromIndex = Number(record?.currentProcessStepIndex) || 0;
  const currentStep = getWorkflowStepAtIndex(workflow, fromIndex);
  const defaultNextIndex = fromIndex + 1;
  const defaultNextStep = getWorkflowStepAtIndex(workflow, defaultNextIndex);
  const remainingSteps = getRemainingProcessWorkflowSteps(record);

  return {
    fromIndex,
    defaultNextIndex,
    completedLabel: currentStep?.processDetail ?? "",
    defaultNextLabel: defaultNextStep?.processDetail ?? "",
    remainingSteps: remainingSteps.map((step) => ({
      stepIndex: step.stepIndex,
      label: step.processDetail,
      processCategory: step.processCategory,
      processDetail: step.processDetail,
    })),
  };
}

/**
 * @param {object} record
 * @param {number | null | undefined} targetStepIndex - omit for auto-advance (+1)
 */
export function resolveProcessStepCompletion(record, targetStepIndex = null) {
  const workflow = getRecordProcessWorkflow(record);
  const fromIndex = Number(record?.currentProcessStepIndex) || 0;
  const defaultNextIndex = fromIndex + 1;

  if (workflow.length <= 1 || fromIndex >= workflow.length - 1) {
    return { mode: "complete_final", fromIndex, toIndex: fromIndex, isAutoAdvance: true };
  }

  const toIndex =
    targetStepIndex == null || Number.isNaN(Number(targetStepIndex))
      ? defaultNextIndex
      : Number(targetStepIndex);

  if (toIndex <= fromIndex || toIndex >= workflow.length) {
    return null;
  }

  const isAutoAdvance = targetStepIndex == null || toIndex === defaultNextIndex;
  const targetStep = getWorkflowStepAtIndex(workflow, toIndex);
  const processFields = buildRecordProcessFieldsFromStep(targetStep);

  return {
    mode: "advance",
    fromIndex,
    toIndex,
    isAutoAdvance,
    patch: {
      currentProcessStepIndex: toIndex,
      awaitingNextProcessStep: true,
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      completionStatus: "작업대기",
      registered: false,
      dailyReportAutoCreated: false,
      dailyReportDraftStarted: false,
      productionEndAt: "",
      productionCompletedAt: "",
      productionCompletedBy: "",
      ...processFields,
    },
  };
}

export function buildWorkflowChangeLogEntry(record, { fromIndex, toIndex, user = "", note = "" }) {
  const workflow = getRecordProcessWorkflow(record);
  const fromStep = getWorkflowStepAtIndex(workflow, fromIndex);
  const toStep = getWorkflowStepAtIndex(workflow, toIndex);
  const fromLabel = String(fromStep?.processDetail ?? "").trim();
  const toLabel = String(toStep?.processDetail ?? "").trim();
  const skipped = toIndex > fromIndex + 1;
  const defaultNote = skipped
    ? \`\${fromLabel} 공정 생략 → \${toLabel}로 이동\`
    : \`\${fromLabel} 완료 → \${toLabel}로 변경\`;

  return {
    at: new Date().toISOString(),
    user: String(user ?? "").trim(),
    action: skipped ? "WORKFLOW_SKIP" : "WORKFLOW_OVERRIDE",
    fromStep: fromIndex,
    toStep: toIndex,
    fromLabel,
    toLabel,
    note: String(note ?? "").trim() || defaultNote,
  };
}

export function appendWorkflowChangeLog(record, entry) {
  const existing = Array.isArray(record?.workflowChangeLog) ? record.workflowChangeLog : [];
  return [...existing, entry];
}
`;

fs.writeFileSync(target, content, { encoding: "utf8" });
const buf = fs.readFileSync(target);
console.log("written", target, "bytes", buf.length, "encoding", buf[1] === 0 ? "UTF16" : "UTF8");
