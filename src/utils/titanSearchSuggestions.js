/**
 * Project TITAN V1.0 — 검색 자동완성 인덱스
 */

import { getActiveMasterNames, getActiveEquipment, getActiveWorkerNames, getMasterDataByCategory } from "./masterData";
import {
  getCompanyAllPartNoOptions,
  getCompanyProductNameOptions,
} from "./productMasterSearch";
import { filterValuesByQuery, matchesSearchQuery } from "./titanSearchMatch";

export const TITAN_SEARCH_FIELD_LABELS = {
  company: "업체명",
  partName: "품명",
  productName: "품명",
  partNo: "품번",
  drawingNo: "도번",
  managementId: "관리번호",
  lotNo: "LOT",
  purchaseOrderNo: "발주번호",
  customerLotNo: "업체 LOT",
  material: "재질",
  process: "열처리 공정",
  assignee: "검사자",
  approver: "승인자",
  manager: "담당자",
  worker: "작업자",
  note: "비고",
  status: "상태",
  qty: "수량",
  equipment: "설비",
  defectType: "불량유형",
};

/** TitanAutoComplete fieldType → index key */
export const TITAN_AUTOCOMPLETE_FIELD_ALIASES = {
  company: "company",
  productName: "partName",
  partName: "partName",
  partNo: "partNo",
  material: "material",
  lot: "lotNo",
  lotNo: "lotNo",
  equipment: "equipment",
  worker: "worker",
};

export const TITAN_MASTER_AUTOCOMPLETE_DEFAULT_LIMIT = 50;
export const TITAN_MASTER_AUTOCOMPLETE_SEARCH_LIMIT = 30;

export const TITAN_MASTER_AUTOCOMPLETE_REGISTRY = Object.freeze({
  company: {
    fieldType: "company",
    label: "업체명",
    source: "master",
    masterCategory: "companies",
    defaultLimit: TITAN_MASTER_AUTOCOMPLETE_DEFAULT_LIMIT,
    searchLimit: TITAN_MASTER_AUTOCOMPLETE_SEARCH_LIMIT,
  },
  partName: {
    fieldType: "partName",
    label: "품명",
    source: "product",
    scopedByCompany: true,
    productAutofill: true,
    defaultLimit: TITAN_MASTER_AUTOCOMPLETE_DEFAULT_LIMIT,
    searchLimit: TITAN_MASTER_AUTOCOMPLETE_SEARCH_LIMIT,
  },
  productName: {
    fieldType: "partName",
    label: "품명",
    source: "product",
    scopedByCompany: true,
    productAutofill: true,
    defaultLimit: TITAN_MASTER_AUTOCOMPLETE_DEFAULT_LIMIT,
    searchLimit: TITAN_MASTER_AUTOCOMPLETE_SEARCH_LIMIT,
  },
  partNo: {
    fieldType: "partNo",
    label: "품번",
    source: "product",
    scopedByCompany: true,
    productAutofill: true,
    defaultLimit: TITAN_MASTER_AUTOCOMPLETE_DEFAULT_LIMIT,
    searchLimit: TITAN_MASTER_AUTOCOMPLETE_SEARCH_LIMIT,
  },
  material: {
    fieldType: "material",
    label: "재질",
    source: "master",
    masterCategory: "materials",
    defaultLimit: 30,
    searchLimit: 20,
  },
  equipment: {
    fieldType: "equipment",
    label: "설비",
    source: "master",
    masterCategory: "equipment",
    defaultLimit: 30,
    searchLimit: 20,
  },
  worker: {
    fieldType: "worker",
    label: "작업자",
    source: "master",
    masterCategory: "workers",
    defaultLimit: 30,
    searchLimit: 20,
  },
  drawingNo: {
    fieldType: "drawingNo",
    label: "도번",
    source: "product",
    scopedByCompany: true,
    defaultLimit: 20,
    searchLimit: 15,
  },
});

export function resolveMasterAutocompleteConfig(field) {
  const key = String(field ?? "").trim();
  return TITAN_MASTER_AUTOCOMPLETE_REGISTRY[key] ?? TITAN_MASTER_AUTOCOMPLETE_REGISTRY.partName;
}

export function resolveMasterAutocompleteLimit(field, query = "") {
  const config = resolveMasterAutocompleteConfig(field);
  const trimmed = String(query ?? "").trim();
  return trimmed ? config.searchLimit : config.defaultLimit;
}

export const TITAN_MASTER_AUTOCOMPLETE_EXTENSION_NOTES = Object.freeze({
  company: "getActiveMasterNames('companies') via buildMasterSuggestionIndex",
  partName: "getCompanyProductNameOptions(company) via productMasterSearch",
  partNo: "getCompanyAllPartNoOptions(company) via productMasterSearch",
  material: "getActiveMasterNames('materials')",
  equipment: "getActiveEquipment() name + code",
  worker: "getActiveWorkerNames()",
});

const FIELD_EXTRACTORS = {
  company: (record) => record.company,
  partName: (record) => record.partName,
  partNo: (record) => record.partNo,
  drawingNo: (record) => record.drawingNo,
  managementId: (record) => record.managementId || record.id,
  lotNo: (record) => record.lotNo,
  purchaseOrderNo: (record) => record.purchaseOrderNo,
  customerLotNo: (record) => record.customerLotNo,
  material: (record) => record.material,
  process: (record) => record.process || record.heatTreatment || record.processName,
  assignee: (record) => record.assignee || record.inspector,
  approver: (record) => record.approver,
  manager: (record) => record.manager,
  worker: (record) => record.worker,
  note: (record) => record.note,
  status: (record) => record.status || record.statusLabel || record.judgment,
  qty: (record) => (record.qty != null ? String(record.qty) : ""),
  equipment: (record) => record.equipment || record.equipmentName || record.equipmentCode,
  defectType: (record) => record.defectType,
};

function normalizeValue(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

function resolveFieldKey(fieldType) {
  return TITAN_AUTOCOMPLETE_FIELD_ALIASES[fieldType] || fieldType;
}

function sortKo(values) {
  return [...values].sort((a, b) => a.localeCompare(b, "ko"));
}

export function buildSearchSuggestionIndex(records = [], extraValues = {}) {
  const index = {};

  Object.keys(FIELD_EXTRACTORS).forEach((field) => {
    index[field] = new Set();
  });

  records.forEach((record) => {
    if (!record) return;
    Object.entries(FIELD_EXTRACTORS).forEach(([field, extract]) => {
      const value = normalizeValue(extract(record));
      if (value) index[field].add(value);
    });
  });

  Object.entries(extraValues).forEach(([field, values]) => {
    if (!index[field]) index[field] = new Set();
    (values || []).forEach((value) => {
      const normalized = normalizeValue(value);
      if (normalized) index[field].add(normalized);
    });
  });

  const result = {};
  Object.entries(index).forEach(([field, set]) => {
    result[field] = sortKo(Array.from(set));
  });
  return result;
}

/** Master + Session 기준 1회 인덱스 (키 입력마다 재구축 ❌) */
export function buildMasterSuggestionIndex(context = {}) {
  const { records = [], companies = [], companyFilter = "" } = context;

  const companyNames =
    companies.length > 0
      ? companies.map((item) => (typeof item === "string" ? item : item?.name)).filter(Boolean)
      : getActiveMasterNames("companies");

  const materialNames = getActiveMasterNames("materials");
  const workerNames = getActiveWorkerNames();
  const equipmentNames = getActiveEquipment()
    .flatMap((row) => [row.name, row.code].filter(Boolean));

  const productPartNames = companyFilter
    ? getCompanyProductNameOptions(companyFilter)
    : getActiveMasterNames("products");

  const productPartNos = companyFilter
    ? getCompanyAllPartNoOptions(companyFilter)
    : getActiveMasterNames("products").length
      ? [...new Set(getMasterDataByCategory("products").map((row) => row.partNo).filter(Boolean))]
      : [];

  return buildSearchSuggestionIndex(records, {
    company: companyNames,
    partName: productPartNames,
    partNo: productPartNos.length ? productPartNos : undefined,
    material: materialNames,
    worker: workerNames,
    equipment: equipmentNames,
  });
}

export function filterSearchSuggestions(index, field, query, limit = 8) {
  const fieldKey = resolveFieldKey(field);
  const values = index?.[fieldKey] || [];
  return filterValuesByQuery(values, query, limit);
}

/**
 * fieldType + query + context → suggestions
 * context: { records, companies, companyFilter, index? }
 */
export function getSuggestionsForField(fieldType, query, context = {}) {
  const fieldKey = resolveFieldKey(fieldType);
  const index = context.index || buildMasterSuggestionIndex(context);
  return filterSearchSuggestions(index, fieldKey, query, context.limit ?? 8);
}

export { matchesSearchQuery, filterValuesByQuery };
