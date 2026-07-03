/**
 * Project TITAN V1.0 — 검색 자동완성 인덱스
 */

export const TITAN_SEARCH_FIELD_LABELS = {
  company: "업체명",
  partName: "품명",
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
  equipment: (record) => record.equipment,
  defectType: (record) => record.defectType,
};

function normalizeValue(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
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
    result[field] = Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  });
  return result;
}

export function filterSearchSuggestions(index, field, query, limit = 8) {
  const values = index?.[field] || [];
  const trimmed = String(query ?? "").trim().toLowerCase();
  if (!trimmed) return [];

  return values
    .filter((value) => value.toLowerCase().includes(trimmed))
    .slice(0, limit);
}
