/**
 * Project TITAN V1.3 — 문서관리 · 업체 중심 리스트 / Popup 문서 집계
 */

import {
  isDocumentManagementEligible,
  matchesDocumentFolderFilter,
  matchesDocumentTypeFilter,
  matchesUnifiedDocumentSearch,
  resolveDocumentFilterTypes,
} from "../config/documentManagementV13";
import { isDocumentFavorite } from "./documentFavoritesSession";
import { isDocumentPinned } from "./documentPinsSession";
import { enrichRegistryRow } from "./documentMetadataSession";
import { getMasterDataByCategory } from "./masterData";
import { getQualityDocumentRegistryRows } from "./qualityDocumentRegistry";

function resolveCompanyManager(company) {
  const primary = company.contacts?.find((contact) => contact.isPrimary)?.name;
  return primary?.trim() || company.manager?.trim() || "—";
}

function resolveLatestDate(rows = []) {
  if (!rows.length) return "—";
  const dates = rows
    .map((row) => row.updatedAt?.slice(0, 10) || row.revisionDate || row.registeredDate || "")
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));
  return dates[0] || "—";
}

export function enrichCompanyDocumentRows(rows = []) {
  return rows.map((row) =>
    enrichRegistryRow(row, { isPinned: isDocumentPinned(row.id) })
  );
}

export function getCompanyDocumentRegistryRows(companyName) {
  const trimmed = String(companyName ?? "").trim();
  if (!trimmed) return [];
  return enrichCompanyDocumentRows(
    getQualityDocumentRegistryRows()
      .filter((row) => String(row.company ?? "").trim() === trimmed)
      .filter(isDocumentManagementEligible)
  );
}

export function buildCompanyDocumentListRows() {
  const registry = enrichCompanyDocumentRows(
    getQualityDocumentRegistryRows().filter(isDocumentManagementEligible)
  );
  const companies = getMasterDataByCategory("companies");

  return companies
    .map((company) => {
      const companyName = company.name?.trim() || "—";
      const docs = registry.filter((row) => String(row.company ?? "").trim() === companyName);
      const lastModified = resolveLatestDate(docs);

      return {
        id: company.id,
        company: companyName,
        manager: resolveCompanyManager(company),
        documentCount: docs.length,
        documentCountLabel: `${docs.length.toLocaleString("ko-KR")}건`,
        lastModified,
        record: company,
      };
    })
    .filter((row) => row.company && row.company !== "—")
    .sort((a, b) => {
      if (b.documentCount !== a.documentCount) return b.documentCount - a.documentCount;
      return a.company.localeCompare(b.company, "ko");
    });
}

export function matchesCompanyDocumentListSearch(row, search) {
  if (search.company && !String(row.company).includes(search.company.trim())) return false;
  if (search.manager && !String(row.manager).includes(search.manager.trim())) return false;
  return true;
}

function sortPopupDocuments(rows = []) {
  return [...rows].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return String(b.revisionDate || b.updatedAt).localeCompare(String(a.revisionDate || a.updatedAt));
  });
}

export function filterCompanyPopupDocuments(
  rows,
  { filterId = "all", folderId = "all", search = {}, favoritesOnly = false, userId } = {}
) {
  let filtered = rows
    .filter((row) => matchesDocumentTypeFilter(row, filterId))
    .filter((row) => matchesDocumentFolderFilter(row, folderId))
    .filter((row) => matchesUnifiedDocumentSearch(row, search.query));

  if (favoritesOnly) {
    filtered = filtered.filter((row) => isDocumentFavorite(row.id, userId));
  }

  return sortPopupDocuments(filtered);
}

export function groupDocumentsByDocumentNo(rows = []) {
  /** @type {Map<string, object[]>} */
  const groups = new Map();
  rows.forEach((row) => {
    const key = String(row.documentNo || row.title || row.id).trim();
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  });
  return [...groups.entries()].map(([documentNo, revisions]) => ({
    documentNo,
    revisions: revisions.sort((a, b) => String(b.revision).localeCompare(String(a.revision))),
    current: revisions.find((item) => item.approvalStatus === "현행") ?? revisions[0] ?? null,
  }));
}

export function getExpiringDocuments(rows = enrichCompanyDocumentRows(getQualityDocumentRegistryRows())) {
  return rows.filter((row) => {
    const level = row.expiryStatus?.level;
    return level === "warning" || level === "danger" || level === "expired";
  });
}

export function getCompanyMasterProducts(companyName) {
  const trimmed = String(companyName ?? "").trim();
  if (!trimmed) return [];
  return getMasterDataByCategory("products").filter(
    (product) => String(product.company ?? "").trim() === trimmed
  );
}

function matchDocumentToProduct(documentRow, product) {
  if (documentRow?.productId && product?.id) {
    return documentRow.productId === product.id;
  }
  const docPartNo = String(documentRow?.partNo ?? "").trim();
  const productPartNo = String(product?.partNo ?? "").trim();
  return Boolean(docPartNo && productPartNo && docPartNo === productPartNo);
}

export function getProductDocumentsForTab(sourceRows = [], product, tabId = "drawing") {
  const types = resolveDocumentFilterTypes(tabId);
  return sourceRows.filter((row) => {
    if (!matchDocumentToProduct(row, product)) return false;
    if (types && !types.includes(row.documentType)) return false;
    return true;
  });
}

export function matchesProductDocumentSummarySearch(row, query = "") {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return true;
  const haystack = [row.partName, row.partNo, row.material, row.spec, row.latestRevision]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
  return haystack.includes(q);
}

export function pickPreferredProductDocument(documents = [], tabId = "drawing") {
  if (!documents.length) return null;
  const tabTypes = resolveDocumentFilterTypes(tabId);
  const current = documents.find((item) => item.approvalStatus === "현행");
  if (current) return current;
  if (tabTypes?.length) {
    const primaryType = tabTypes.find((type) =>
      documents.some((item) => item.documentType === type)
    );
    if (primaryType) {
      return documents.find((item) => item.documentType === primaryType) ?? documents[0];
    }
  }
  return documents[0];
}

export function buildCompanyProductDocumentSummaryRows(companyName, sourceRows = [], tabId = "drawing") {
  const products = getCompanyMasterProducts(companyName);

  return products.map((product) => {
    const documents = getProductDocumentsForTab(sourceRows, product, tabId);
    const sorted = [...documents].sort((a, b) =>
      String(b.registeredDate || b.revisionDate || b.updatedAt || "").localeCompare(
        String(a.registeredDate || a.revisionDate || a.updatedAt || "")
      )
    );
    const current =
      documents.find((item) => item.approvalStatus === "현행") ?? sorted[0] ?? null;
    const count = documents.length;

    let statusLabel = "미등록";
    let statusVariant = "wait";
    if (current?.approvalStatus === "현행") {
      statusLabel = "현행";
      statusVariant = "complete";
    } else if (current) {
      statusLabel = current.approvalStatus || "등록";
      statusVariant = "wait";
    }

    return {
      id: product.id,
      partName: product.name || product.partName || "—",
      partNo: product.partNo || "—",
      material: product.material || "—",
      spec: product.spec || "—",
      documentCount: count,
      documentCountLabel: `${count.toLocaleString("ko-KR")}건`,
      latestRevision: current?.revision || "—",
      lastRegisteredDate: sorted[0]?.registeredDate || sorted[0]?.revisionDate || "—",
      statusLabel,
      statusVariant,
      product,
      documents,
    };
  });
}
