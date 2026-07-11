/**
 * Inspection Template Master - SessionStorage CRUD (RC1)
 */

import {
  INSPECTION_TEMPLATE_MASTER_STORAGE_KEY,
  cloneDefaultInspectionTemplates,
  normalizeInspectionTemplate,
  getInspectionTemplateSpecification,
} from "../config/inspectionTemplateMaster";

function safeReadRaw() {
  try {
    const raw = globalThis.sessionStorage?.getItem(INSPECTION_TEMPLATE_MASTER_STORAGE_KEY);
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
      INSPECTION_TEMPLATE_MASTER_STORAGE_KEY,
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
    .map((row) => normalizeInspectionTemplate(row))
    .filter(Boolean)
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
}

export function getInspectionTemplates() {
  const stored = safeReadRaw();
  if (stored?.length) {
    return normalizeTemplateList(stored);
  }
  return cloneDefaultInspectionTemplates();
}

export function saveInspectionTemplates(templates) {
  const next = normalizeTemplateList(templates);
  safeWriteTemplates(next);
  return next;
}

export function resetInspectionTemplates() {
  try {
    globalThis.sessionStorage?.removeItem(INSPECTION_TEMPLATE_MASTER_STORAGE_KEY);
  } catch {
    /* noop */
  }
  return cloneDefaultInspectionTemplates();
}

export function getInspectionTemplateById(templateId) {
  const id = String(templateId ?? "").trim();
  if (!id) return null;
  return getInspectionTemplates().find((row) => row.id === id) ?? null;
}

export function createInspectionTemplateId(label = "") {
  const slug = String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\uAC00-\uD7A3]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const suffix = Date.now().toString(36).slice(-4);
  return `tpl-inspection-${slug || "custom"}-${suffix}`;
}

export function addInspectionTemplate(template) {
  const normalized = normalizeInspectionTemplate(template);
  if (!normalized) {
    return { ok: false, message: "template invalid" };
  }
  const rows = getInspectionTemplates();
  if (rows.some((row) => row.id === normalized.id)) {
    return { ok: false, message: "duplicate id" };
  }
  const next = saveInspectionTemplates([...rows, normalized]);
  return { ok: true, templates: next, template: normalized };
}

export function updateInspectionTemplate(templateId, patch) {
  const id = String(templateId ?? "").trim();
  const rows = getInspectionTemplates();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) {
    return { ok: false, message: "not found" };
  }
  const merged = normalizeInspectionTemplate({ ...rows[index], ...patch, id });
  if (!merged) {
    return { ok: false, message: "invalid" };
  }
  const nextRows = [...rows];
  nextRows[index] = merged;
  const next = saveInspectionTemplates(nextRows);
  return { ok: true, templates: next, template: merged };
}

export function deleteInspectionTemplate(templateId) {
  const id = String(templateId ?? "").trim();
  const rows = getInspectionTemplates();
  if (!rows.some((row) => row.id === id)) {
    return { ok: false, message: "not found" };
  }
  const next = saveInspectionTemplates(rows.filter((row) => row.id !== id));
  return { ok: true, templates: next };
}

export function resolveInspectionSpecFromTemplate(templateId) {
  const template = getInspectionTemplateById(templateId);
  if (!template) return null;
  return getInspectionTemplateSpecification(template);
}

export function migrateProductInspectionTemplateId(product) {
  if (!product || product.inspectionTemplateId) return product;
  if (!product.specification) return product;
  return {
    ...product,
    inspectionTemplateId: "",
  };
}
