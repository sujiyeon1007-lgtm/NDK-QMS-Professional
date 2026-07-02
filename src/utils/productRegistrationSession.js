/**
 * Project TITAN V1.0 — 제품등록 SessionStorage (제품정보 + Default Specification)
 */

import {
  cloneSpecification,
  createDefaultSpecification,
  normalizeProductRegistration,
} from "./productSpecificationModel";

const STORAGE_KEY = "project-titan-product-registration-v2";

function getSeedProducts() {
  return [];
}

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (parsed.length > 0) return parsed.map(normalizeProductRegistration);
    return getSeedProducts();
  } catch {
    return getSeedProducts();
  }
}

function safeWrite(products) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // SQLite 전환 전 임시 저장소
  }
}

function createProductId() {
  return `PRD-${Date.now()}`;
}

export function getProductRegistrations() {
  return safeRead().filter((product) => product.active !== false);
}

export function getProductByPartNo(partNo) {
  const trimmed = partNo?.trim();
  if (!trimmed) return null;
  return getProductRegistrations().find((product) => product.partNo === trimmed) ?? null;
}

/** 업체 + 품번 기준 제품 조회 (동일 품번·다른 업체 구분) */
export function getProductByCompanyAndPartNo(company, partNo) {
  const companyTrimmed = company?.trim();
  const partNoTrimmed = partNo?.trim();
  if (!partNoTrimmed) return null;

  const products = getProductRegistrations();
  if (companyTrimmed) {
    const matched = products.find(
      (product) => product.company === companyTrimmed && product.partNo === partNoTrimmed
    );
    if (matched) return matched;
  }
  return products.find((product) => product.partNo === partNoTrimmed) ?? null;
}

export function getProductById(id) {
  return safeRead().find((product) => product.id === id) ?? null;
}

export function upsertProductRegistration(payload) {
  const normalized = normalizeProductRegistration({
    ...payload,
    id: payload.id || createProductId(),
    updatedAt: new Date().toISOString(),
    createdAt: payload.createdAt || new Date().toISOString(),
  });

  const products = safeRead();
  const index = products.findIndex((product) => product.id === normalized.id);
  if (index >= 0) {
    products[index] = normalized;
  } else {
    products.unshift(normalized);
  }
  safeWrite(products);
  return normalized;
}

export function getDefaultSpecificationForPartNo(partNo, company = "") {
  const product = getProductByCompanyAndPartNo(company, partNo);
  if (!product) return createDefaultSpecification();
  return cloneSpecification(product.specification);
}

export function applyProductDefaultsToForm(form, product) {
  if (!product) return form;
  return {
    ...form,
    company: product.company || form.company,
    partName: product.partName || form.partName,
    partNo: product.partNo || form.partNo,
    drawingNo: product.drawingNo || form.drawingNo,
    material: product.material || form.material,
    process: product.process || form.process,
    appliedSpecification: cloneSpecification(product.specification),
    hasMicrostructurePhoto: Boolean(product.specification?.microstructure?.enabled),
  };
}
