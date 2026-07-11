/**
 * Process Workflow Templates — default definitions (SessionStorage override in RC1)
 */

import { PRODUCT_PROCESS_DETAILS } from "./productProcessSelection";

export const PROCESS_WORKFLOW_TEMPLATES_STORAGE_KEY =
  "project-titan-process-workflow-templates-v1";

export const HEAT_TREATMENT_DETAIL_OPTIONS = [...PRODUCT_PROCESS_DETAILS.heatTreatment];

export const PROCESS_WORKFLOW_FUTURE_CATEGORIES = [
  { id: "pvd", label: "PVD", enabled: false },
  { id: "plating", label: "도금", enabled: false },
  { id: "oxidation", label: "산화", enabled: false },
];

export function normalizeProcessWorkflowTemplateStep(step, index = 0) {
  const order = Number(step?.order) > 0 ? Number(step.order) : index + 1;
  const processCategory = String(step?.processCategory ?? "").trim();
  const requiresDetailPick = step?.requiresDetailPick === true;
  const detailOptions = Array.isArray(step?.detailOptions)
    ? step.detailOptions.map((item) => String(item ?? "").trim()).filter(Boolean)
    : processCategory === "heatTreatment"
      ? [...HEAT_TREATMENT_DETAIL_OPTIONS]
      : [];
  const processDetail = requiresDetailPick
    ? String(step?.processDetail ?? "").trim() || null
    : String(step?.processDetail ?? "").trim() || null;

  return {
    order,
    processCategory,
    processDetail,
    requiresDetailPick,
    ...(requiresDetailPick || detailOptions.length ? { detailOptions } : {}),
  };
}

export function normalizeProcessWorkflowTemplate(template) {
  if (!template || typeof template !== "object") return null;
  const id = String(template.id ?? "").trim();
  const label = String(template.label ?? "").trim();
  if (!id || !label) return null;

  const steps = (Array.isArray(template.steps) ? template.steps : [])
    .map((step, index) => normalizeProcessWorkflowTemplateStep(step, index))
    .filter((step) => step.processCategory)
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({ ...step, order: index + 1 }));

  if (!steps.length) return null;

  return { id, label, steps, builtIn: template.builtIn === true };
}

export function summarizeProcessWorkflowTemplate(template) {
  const steps = template?.steps ?? [];
  return steps
    .map((step) => {
      if (step.requiresDetailPick) {
        const opts = (step.detailOptions ?? []).slice(0, 2).join("/");
        return `${step.order}. ${opts ? `(${opts}…)` : "세부공정 선택"}`;
      }
      const detail = step.processDetail ?? step.processCategory;
      return `${step.order}. ${detail}`;
    })
    .join(" → ");
}

export const DEFAULT_PROCESS_WORKFLOW_TEMPLATES = [
  {
    id: "tpl-cleaning",
    label: "세척",
    builtIn: true,
    steps: [
      { order: 1, processCategory: "cleaning", processDetail: "세척", requiresDetailPick: false },
    ],
  },
  {
    id: "tpl-heat-treatment",
    label: "열처리",
    builtIn: true,
    steps: [
      {
        order: 1,
        processCategory: "heatTreatment",
        processDetail: null,
        requiresDetailPick: true,
        detailOptions: HEAT_TREATMENT_DETAIL_OPTIONS,
      },
    ],
  },
  {
    id: "tpl-shot",
    label: "쇼트",
    builtIn: true,
    steps: [
      { order: 1, processCategory: "shot", processDetail: "쇼트", requiresDetailPick: false },
    ],
  },
  {
    id: "tpl-cleaning-ht-shot",
    label: "세척+열처리+쇼트",
    builtIn: true,
    steps: [
      { order: 1, processCategory: "cleaning", processDetail: "세척", requiresDetailPick: false },
      {
        order: 2,
        processCategory: "heatTreatment",
        processDetail: null,
        requiresDetailPick: true,
        detailOptions: HEAT_TREATMENT_DETAIL_OPTIONS,
      },
      { order: 3, processCategory: "shot", processDetail: "쇼트", requiresDetailPick: false },
    ],
  },
  {
    id: "tpl-ht-shot",
    label: "열처리+쇼트",
    builtIn: true,
    steps: [
      {
        order: 1,
        processCategory: "heatTreatment",
        processDetail: null,
        requiresDetailPick: true,
        detailOptions: HEAT_TREATMENT_DETAIL_OPTIONS,
      },
      { order: 2, processCategory: "shot", processDetail: "쇼트", requiresDetailPick: false },
    ],
  },
].map((item) => normalizeProcessWorkflowTemplate(item)).filter(Boolean);

export function cloneDefaultProcessWorkflowTemplates() {
  return DEFAULT_PROCESS_WORKFLOW_TEMPLATES.map((template) =>
    normalizeProcessWorkflowTemplate({
      ...template,
      steps: template.steps.map((step) => ({
        ...step,
        detailOptions: step.detailOptions ? [...step.detailOptions] : undefined,
      })),
    })
  ).filter(Boolean);
}
