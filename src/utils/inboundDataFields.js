/**
 * 입고 데이터 공통 필드 — 발주번호 · 업체 LOT (제품 Master ❌)
 */

export function normalizeInboundDataFields(record = {}) {
  return {
    ...record,
    purchaseOrderNo: String(record.purchaseOrderNo ?? "").trim(),
    customerLotNo: String(record.customerLotNo ?? "").trim(),
    lotNo: String(record.lotNo ?? "").trim(),
  };
}

function includesField(value, query) {
  if (!query?.trim()) return true;
  return String(value ?? "")
    .toLowerCase()
    .includes(String(query).trim().toLowerCase());
}

/** 입고 관련 화면 공통 검색 — 발주번호 · 업체 LOT · 관리번호 · LOT 포함 */
export function matchesInboundDataSearch(search, record) {
  if (!search || !record) return true;

  if (!includesField(record.purchaseOrderNo, search.purchaseOrderNo)) return false;
  if (!includesField(record.customerLotNo, search.customerLotNo)) return false;
  if (!includesField(record.id ?? record.managementId, search.managementId)) return false;
  if (!includesField(record.lotNo, search.lotNo)) return false;

  return true;
}

/** 기본 4항목 + 입고 데이터 필드 통합 검색 */
export function matchesInboundRelatedSearch(search, record, linkedRecord = null) {
  if (!search || !record) return true;
  const merged = linkedRecord
    ? {
        ...record,
        id: record.id ?? linkedRecord.id,
        managementId: record.managementId ?? record.id ?? linkedRecord.id,
        company: record.company || linkedRecord.company,
        partName: record.partName || linkedRecord.partName,
        partNo: record.partNo || linkedRecord.partNo,
        material: record.material || linkedRecord.material,
        purchaseOrderNo: record.purchaseOrderNo || linkedRecord.purchaseOrderNo,
        customerLotNo: record.customerLotNo || linkedRecord.customerLotNo,
        lotNo: record.lotNo || linkedRecord.lotNo,
      }
    : record;
  return matchesInboundDataSearch(search, merged);
}

export function resolveInboundFieldsFromProductionRecord(record) {
  if (!record) {
    return { purchaseOrderNo: "", customerLotNo: "", lotNo: "" };
  }
  const normalized = normalizeInboundDataFields(record);
  return {
    purchaseOrderNo: normalized.purchaseOrderNo,
    customerLotNo: normalized.customerLotNo,
    lotNo: normalized.lotNo,
  };
}
