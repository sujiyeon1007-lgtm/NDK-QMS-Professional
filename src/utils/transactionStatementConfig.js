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
  대한정밀: {
    regNo: "123-45-67890",
    name: "대한정밀",
    representative: "홍길동",
    address: "경남 창원시 성산구 ...",
    businessType: "제조",
    businessItem: "기계부품",
    phone: "055-000-0000",
    fax: "055-000-0001",
  },
  삼성부품: {
    regNo: "234-56-78901",
    name: "삼성부품",
    representative: "김대표",
    address: "경남 김해시 ...",
    businessType: "제조",
    businessItem: "자동차부품",
    phone: "055-111-1111",
    fax: "055-111-1112",
  },
  한국금속: {
    regNo: "345-67-89012",
    name: "한국금속",
    representative: "박대표",
    address: "경남 창원시 ...",
    businessType: "제조",
    businessItem: "금속가공",
    phone: "055-222-2222",
    fax: "055-222-2223",
  },
  우성기계: {
    regNo: "456-78-90123",
    name: "우성기계",
    representative: "이대표",
    address: "경남 김해시 ...",
    businessType: "제조",
    businessItem: "기계부품",
    phone: "055-333-3333",
    fax: "055-333-3334",
  },
  신화산업: {
    regNo: "567-89-01234",
    name: "신화산업",
    representative: "최대표",
    address: "경남 창원시 ...",
    businessType: "제조",
    businessItem: "베어링부품",
    phone: "055-444-4444",
    fax: "055-444-4445",
  },
  성우정밀: {
    regNo: "678-90-12345",
    name: "성우정밀",
    representative: "정대표",
    address: "경남 김해시 ...",
    businessType: "제조",
    businessItem: "정밀부품",
    phone: "055-555-5555",
    fax: "055-555-5556",
  },
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
