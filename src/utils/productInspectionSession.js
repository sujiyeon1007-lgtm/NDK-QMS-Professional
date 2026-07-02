/**
 * Project TITAN V1.0 — 제품별 검사기준 · 도면 SessionStorage
 */

import { createDefaultSpecification, normalizeSpecification } from "./productSpecificationModel";
import { normalizeInspectionCriteriaSpec } from "./inspectionCriteriaModel";
import { findProductByCompanyAndPartNo, findProductByPartNo, getMasterDataByCategory, resolveProductByQuery } from "./masterData";
import {
  getCurrentDrawingRevision,
  getDrawingRevisionHistory,
} from "./productDrawingSession";

const STORAGE_KEY = "project-titan-product-inspection-v2";

const DRAWING_ACCEPT = ["application/pdf", "image/jpeg", "image/png"];

function createEmptyDrawing() {
  return {
    fileName: "",
    mimeType: "",
    dataUrl: "",
    drawingNo: "",
    revision: "",
    revisionDate: "",
  };
}

function normalizeDrawing(drawing = {}) {
  return {
    fileName: drawing.fileName?.trim() ?? "",
    mimeType: drawing.mimeType?.trim() ?? "",
    dataUrl: drawing.dataUrl ?? "",
    drawingNo: drawing.drawingNo?.trim() ?? "",
    revision: drawing.revision?.trim() ?? "",
    revisionDate: drawing.revisionDate?.trim() ?? "",
  };
}

function normalizeInspectionRecord(record) {
  const baseSpec = normalizeSpecification(record.specification);
  return {
    id: record.id || "",
    productId: record.productId || "",
    partNo: record.partNo?.trim() || "",
    specification: normalizeInspectionCriteriaSpec(baseSpec),
    drawing: normalizeDrawing(record.drawing),
    note: record.note?.trim() ?? "",
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

function getSeedRecords() {
  return [];
}

function loadRecords() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedRecords();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return getSeedRecords();
    return parsed.map(normalizeInspectionRecord);
  } catch {
    return getSeedRecords();
  }
}

let sessionRecords = loadRecords();

function persistRecords() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionRecords));
  } catch {
    /* session quota */
  }
}

export function getProductInspectionRecords() {
  return sessionRecords.map((row) => ({
    ...row,
    specification: normalizeInspectionCriteriaSpec(normalizeSpecification(row.specification)),
  }));
}

export function getProductInspectionByPartNo(partNo) {
  const q = String(partNo ?? "").trim().toLowerCase();
  if (!q) return null;
  return getProductInspectionRecords().find((row) => row.partNo.toLowerCase() === q) ?? null;
}

export function getProductInspectionByProductId(productId) {
  if (!productId) return null;
  return getProductInspectionRecords().find((row) => row.productId === productId) ?? null;
}

export function getProductMasterBundle(partNo, company = "") {
  const product =
    findProductByCompanyAndPartNo(company, partNo) ??
    resolveProductByQuery(partNo) ??
    findProductByPartNo(partNo);
  if (!product) return null;
  const inspection = getProductInspectionByPartNo(product.partNo);
  const drawing = getCurrentDrawingRevision(product.id);
  const drawingHistory = getDrawingRevisionHistory(product.id);
  return { product, inspection, drawing, drawingHistory, specification: inspection?.specification ?? null };
}

export function getProductAutofillBundle(partNo, company = "") {
  const bundle = getProductMasterBundle(partNo, company);
  if (!bundle?.product) return null;
  const { product, drawing, inspection } = bundle;
  return {
    partNo: product.partNo ?? "",
    partName: product.name ?? "",
    name: product.name ?? "",
    company: product.company ?? "",
    drawingNo: drawing?.drawingNo || product.drawingNo || "",
    material: product.material ?? "",
    spec: product.spec ?? "",
    unitPrice: product.unitPrice ?? null,
    process: product.process ?? "",
    unit: product.unit ?? "EA",
    revision: drawing?.revision ?? "",
    revisionDate: drawing?.revisionDate ?? "",
    drawing,
    inspection,
    specification: inspection?.specification ?? null,
  };
}

export function resolveInspectionSpecification(partNo) {
  const bundle = getProductMasterBundle(partNo);
  if (!bundle?.inspection?.specification) return null;
  return bundle.inspection.specification;
}

export function upsertProductInspection(payload) {
  const product = getMasterDataByCategory("products").find((row) => row.id === payload.productId);
  if (!product) {
    return { ok: false, message: "제품을 선택하세요." };
  }

  const normalized = normalizeInspectionRecord({
    ...payload,
    productId: product.id,
    partNo: product.partNo,
    specification: payload.specification ?? createDefaultSpecification(),
    drawing: createEmptyDrawing(),
    updatedAt: new Date().toISOString(),
  });

  const index = sessionRecords.findIndex(
    (row) => row.productId === normalized.productId || row.partNo === normalized.partNo
  );

  if (index >= 0) {
    normalized.id = sessionRecords[index].id;
    sessionRecords = sessionRecords.map((row, i) => (i === index ? normalized : row));
  } else {
    normalized.id = `PI-${Date.now()}`;
    sessionRecords = [...sessionRecords, normalized];
  }

  persistRecords();
  return { ok: true, row: normalized };
}

export function deleteProductInspection(productId) {
  const target = sessionRecords.find((row) => row.productId === productId);
  if (!target) return { ok: false, message: "삭제 대상을 찾을 수 없습니다." };
  sessionRecords = sessionRecords.filter((row) => row.productId !== productId);
  persistRecords();
  return { ok: true, row: target };
}

export { DRAWING_ACCEPT, createEmptyDrawing, normalizeDrawing };
export { readDrawingFile } from "./productDrawingSession";

export function createEmptyInspectionForm(product = null) {
  const productRow = product ?? null;
  return {
    productId: productRow?.id ?? "",
    partNo: productRow?.partNo ?? "",
    company: productRow?.company ?? "",
    partName: productRow?.name ?? "",
    drawingNo: productRow?.drawingNo ?? "",
    material: productRow?.material ?? "",
    specification: normalizeInspectionCriteriaSpec(createDefaultSpecification()),
    note: "",
  };
}
