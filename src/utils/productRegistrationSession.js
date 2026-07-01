/**
 * Project TITAN V1.0 — 제품등록 SessionStorage (제품정보 + Default Specification)
 */

import {
  cloneSpecification,
  createDefaultSpecification,
  normalizeProductRegistration,
} from "./productSpecificationModel";

const STORAGE_KEY = "project-titan-product-registration-v1";

function getSeedProducts() {
  return [
    normalizeProductRegistration({
      id: "PRD-SEED-001",
      company: "한국금속",
      partName: "기어 블랭크",
      partNo: "HK-3305-B",
      drawingNo: "DW-3305-02",
      material: "SNCM220",
      process: "이온질화",
      note: "",
      specification: {
        appearance: {
          enabled: true,
          items: [
            { key: "dent", label: "찍힘", enabled: true },
            { key: "color", label: "색상 이상", enabled: true },
            { key: "stain", label: "얼룩", enabled: true },
            { key: "other", label: "기타", enabled: false },
          ],
        },
        hardness: {
          enabled: true,
          unit: "HV",
          items: [
            { key: "surface", label: "표면경도", spec: "550~700", disabled: false },
            { key: "caseDepth", label: "경화깊이", spec: "없음", disabled: true },
            { key: "effectiveDepth", label: "유효경화깊이", spec: "0.20~0.40", disabled: false },
            { key: "compoundLayer", label: "화합물층", spec: "5~15", disabled: false },
            { key: "core", label: "심부경도", spec: "250~350", disabled: false },
          ],
        },
        dimension: {
          enabled: true,
          unit: "mm",
          items: [
            { id: "dim-1", label: "전장", spec: "120.0±0.2" },
            { id: "dim-2", label: "외경", spec: "45.0±0.1" },
            { id: "dim-3", label: "단차", spec: "0.05 max" },
          ],
        },
        hardeningDepth: { enabled: true },
        heatTreatment: {
          effectiveDepthBasis: "hv390",
          specifiedHv: 390,
          grindingAllowanceMm: 0.15,
          certificateOutputMode: "all",
        },
        microstructure: { enabled: false },
        other: { enabled: false, note: "" },
      },
    }),
    normalizeProductRegistration({
      id: "PRD-SEED-002",
      company: "삼성부품",
      partName: "VALVE STEM",
      partNo: "VS-10234",
      drawingNo: "DWG-204B1144P0001",
      material: "SACM645",
      process: "Ion Nitriding",
      note: "",
      specification: {
        appearance: {
          enabled: true,
          items: [
            { key: "dent", label: "찍힘", enabled: true },
            { key: "color", label: "색상 이상", enabled: true },
            { key: "stain", label: "얼룩", enabled: true },
            { key: "other", label: "기타", enabled: false },
          ],
        },
        hardness: {
          enabled: true,
          unit: "HV",
          items: [
            { key: "surface", label: "표면경도", spec: "550~700", disabled: false },
            { key: "caseDepth", label: "경화깊이", spec: "없음", disabled: true },
            { key: "effectiveDepth", label: "유효경화깊이", spec: "0.20~0.40", disabled: false },
            { key: "compoundLayer", label: "화합물층", spec: "5~15", disabled: false },
            { key: "core", label: "심부경도", spec: "250~350", disabled: false },
          ],
        },
        dimension: {
          enabled: false,
          unit: "mm",
          items: [],
        },
        hardeningDepth: { enabled: true },
        heatTreatment: {
          effectiveDepthBasis: "corePlus50",
          specifiedHv: 420,
          grindingAllowanceMm: 0.15,
          certificateOutputMode: "caseAndAfterGrinding",
        },
        microstructure: { enabled: true },
        other: { enabled: false, note: "" },
      },
    }),
  ];
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
