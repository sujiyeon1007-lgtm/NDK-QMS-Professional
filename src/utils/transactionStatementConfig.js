/**
 * 거래명세서 양식 — 공급자(NDK) 고정 · 공급받는자(업체) 프로필
 */

export const NDK_SUPPLIER = {
  regNo: "615-81-86148",
  name: "(주)엔디케이",
  representative: "전윤조",
  address: "경남 김해시 김해대로 2596번길 93 (안동)",
  businessType: "제조",
  businessItem: "플라즈마장치수탁가공",
  phone: "055-326-4242",
  fax: "055-326-4244",
};

/** 업체명 기준 공급받는자 정보 (향후 기준정보/SQLite 연동) */
export const CUSTOMER_PROFILES = {
  "(주)모전기공": {
    regNo: "314-88-00265",
    name: "(주)모전기공",
    representative: "손두현",
    address: "부산광역시 강서구 과학산단2로43번길 38(지사동)",
    businessType: "제조",
    businessItem: "자동차부품외",
    phone: "051-971-1551",
    fax: "051-971-1552",
  },
};

const EMPTY_CUSTOMER = {
  regNo: "",
  name: "",
  representative: "",
  address: "",
  businessType: "",
  businessItem: "",
  phone: "",
  fax: "",
};

export function getCustomerProfile(companyName) {
  if (!companyName?.trim()) return { ...EMPTY_CUSTOMER };
  return (
    CUSTOMER_PROFILES[companyName.trim()] ?? {
      ...EMPTY_CUSTOMER,
      name: companyName.trim(),
    }
  );
}

/** 품목 행 + 빈 행 (양식 10행) */
export const STATEMENT_ITEM_ROW_COUNT = 10;

export function buildStatementLineItem(record, shipQty, unitPrice, amounts) {
  return {
    partNo: record.partNo ?? "",
    partName: record.partName ?? "",
    unit: record.unit ?? "EA",
    qty: Number(shipQty) || 0,
    unitPrice: Number(unitPrice) || 0,
    supplyAmount: amounts.supplyAmount,
    vat: amounts.vat,
    totalAmount: amounts.totalAmount,
    note: record.drawingNo ? `도번 ${record.drawingNo}` : "",
  };
}

export function buildStatementItemRows(lineItem) {
  const rows = [lineItem];
  while (rows.length < STATEMENT_ITEM_ROW_COUNT) {
    rows.push(null);
  }
  return rows;
}
