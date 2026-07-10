/**
 * 거래명세서 양식 — 공급자(NDK) 고정 · 공급받는자(업체) 프로필
 * 공급받는자 SSOT: 기준정보관리 거래처 Master (companies)
 */

import { getMasterDataByCategory } from "./masterData";

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

function findCompanyMasterByName(companyName) {
  const key = companyName?.trim();
  if (!key) return null;

  const companies = getMasterDataByCategory("companies").filter((row) => row.active !== false);
  return (
    companies.find((row) => row.name?.trim() === key) ??
    companies.find((row) => row.code?.trim() === key) ??
    null
  );
}

function mapCompanyMasterToCustomerProfile(company, fallbackName = "") {
  if (!company) {
    return {
      ...EMPTY_CUSTOMER,
      name: fallbackName,
    };
  }

  return {
    regNo: company.bizNo?.trim() ?? "",
    name: company.name?.trim() || fallbackName,
    representative: company.ceoName?.trim() || company.manager?.trim() || "",
    address: company.address?.trim() ?? "",
    businessType: company.businessType?.trim() ?? "",
    businessItem: company.businessItem?.trim() ?? "",
    phone: company.phone?.trim() || company.mobile?.trim() || "",
    fax: company.fax?.trim() ?? "",
  };
}

export function getCustomerProfile(companyName) {
  const key = companyName?.trim();
  if (!key) return { ...EMPTY_CUSTOMER };

  const company = findCompanyMasterByName(key);
  return mapCompanyMasterToCustomerProfile(company, key);
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
