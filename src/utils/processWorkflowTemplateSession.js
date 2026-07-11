/**
 * Process Workflow Template - SessionStorage CRUD (RC1)
 */

import {
  PROCESS_WORKFLOW_TEMPLATES_STORAGE_KEY,
  cloneDefaultProcessWorkflowTemplates,
  normalizeProcessWorkflowTemplate,
} from "../config/processWorkflowTemplates";

function safeReadRaw() {
  try {
    const raw = globalThis.sessionStorage?.getItem(PROCESS_WORKFLOW_TEMPLATES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.templates) ? parsed.templates : null;
  } catch {
    return null;
  }
}

function safeWriteTemplates(templates) {
  try {
    globalThis.sessionStorage?.setItem(
      PROCESS_WORKFLOW_TEMPLATES_STORAGE_KEY,
      JSON.stringify({ templates, updatedAt: new Date().toISOString() })
    );
    return true;
  } catch {
    return false;
  }
}

function normalizeTemplateList(rows) {
  const seen = new Set();
  return (Array.isArray(rows) ? rows : [])
    .map((row) => normalizeProcessWorkflowTemplate(row))
    .filter(Boolean)
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
}

export function getProcessWorkflowTemplates() {
  const stored = safeReadRaw();
  if (stored?.length) {
    return normalizeTemplateList(stored);
  }
  return cloneDefaultProcessWorkflowTemplates();
}

export function saveProcessWorkflowTemplates(templates) {
  const next = normalizeTemplateList(templates);
  safeWriteTemplates(next);
  return next;
}

export function resetProcessWorkflowTemplates() {
  try {
    globalThis.sessionStorage?.removeItem(PROCESS_WORKFLOW_TEMPLATES_STORAGE_KEY);
  } catch {}
  return cloneDefaultProcessWorkflowTemplates();
}

export function getProcessWorkflowTemplateById(templateId) {
  const id = String(templateId ?? "").trim();
  if (!id) return null;
  return getProcessWorkflowTemplates().find((row) => row.id === id) ?? null;
}

export function createProcessWorkflowTemplateId(label = "") {
  const slug = String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .slice(0, 24);
  const suffix = Date.now().toString(36).slice(-4);
  return `tpl-${slug || "custom"}-${suffix}`;
}

export function addProcessWorkflowTemplate(template) {
  const normalized = normalizeProcessWorkflowTemplate(template);
  if (!normalized) {
    return { ok: false, message: "template invalid" };
  }
  const rows = getProcessWorkflowTemplates();
  if (rows.some((row) => row.id === normalized.id)) {
    return { ok: false, message: "duplicate id" };
  }
  const next = saveProcessWorkflowTemplates([...rows, normalized]);
  return { ok: true, templates: next, template: normalized };
}

export function updateProcessWorkflowTemplate(templateId, patch) {
  const id = String(templateId ?? "").trim();
  const rows = getProcessWorkflowTemplates();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) {
    return { ok: false, message: "not found" };
  }
  const merged = normalizeProcessWorkflowTemplate({ ...rows[index], ...patch, id });
  if (!merged) {
    return { ok: false, message: "invalid" };
  }
  const nextRows = [...rows];
  nextRows[index] = merged;
  const next = saveProcessWorkflowTemplates(nextRows);
  return { ok: true, templates: next, template: merged };
}

export function deleteProcessWorkflowTemplate(templateId) {
  const id = String(templateId ?? "").trim();
  const rows = getProcessWorkflowTemplates();
  if (!rows.some((row) => row.id === id)) {
    return { ok: false, message: "not found" };
  }
  const next = saveProcessWorkflowTemplates(rows.filter((row) => row.id !== id));
  return { ok: true, templates: next };
}

export function getTemplateStepsRequiringDetailPick(template) {
  return (template?.steps ?? []).filter((step) => step.requiresDetailPick === true);
}

export function validateTemplateDetailPicks(template, detailPicksByOrder = {}) {
  const missing = getTemplateStepsRequiringDetailPick(template).filter((step) => {
    const picked =
      detailPicksByOrder[step.order] ??
      detailPicksByOrder[String(step.order)] ??
      "";
    return !String(picked ?? "").trim();
  });
  if (!missing.length) return { ok: true };
  return {
    ok: false,
    message: `missing detail picks: ${missing.map((step) => step.order).join(", ")}`,
  };
}

/**
 * Apply a process workflow template to a product payload.
 */
export function applyTemplateToProduct(templateId, detailPicksByOrder = {}, existingProduct = {}) {
  const id = String(templateId ?? "").trim();
  if (!id) return null;

  const template = getProcessWorkflowTemplateById(id);
  if (!template) return null;

  const fallbackDetail = String(existingProduct.processDetail ?? existingProduct.process ?? "").trim();

  const processWorkflow = (template.steps ?? []).map((step, index) => {
    const order = Number(step.order) > 0 ? Number(step.order) : index + 1;
    let processDetail = String(step.processDetail ?? "").trim();
    if (step.requiresDetailPick) {
      processDetail = String(
        detailPicksByOrder[step.order] ??
          detailPicksByOrder[String(step.order)] ??
          fallbackDetail ??
          (step.detailOptions && step.detailOptions[0]) ??
          ""
      ).trim();
    }
    return {
      order,
      processCategory: String(step.processCategory ?? "").trim(),
      processDetail,
    };
  });

  return {
    processWorkflowTemplateId: template.id,
    processWorkflow,
  };
}
