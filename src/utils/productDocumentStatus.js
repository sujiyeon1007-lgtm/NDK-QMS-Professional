/**
 * Project TITAN — 제품 중심 문서현황 집계
 * @see src/config/documentManagementWorkflow.js
 * @see src/config/documentStatusPolicy.js
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { PRODUCT_DOCUMENT_STATUS_TYPES } from "../config/documentManagementWorkflow";
import {
  resolveDocumentStatusId,
  resolveRegisteredLabel,
} from "../config/documentStatusPolicy";
import { resolveQualityDocumentType } from "../config/qualityDocumentManagement";
import { getMasterDataByCategory } from "./masterData";
import { getQualityDocumentRegistryRows } from "./qualityDocumentRegistry";
import { getProductInspectionByProductId } from "./productInspectionSession";
import { getProductDrawingRecord } from "./productDrawingSession";

function normalizeCompany(value) {
  return String(value ?? "").trim();
}

function formatDate(value) {
  if (!value) return "—";
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return text.slice(0, 10);
}

function productMatchesCompany(product, company) {
  const q = normalizeCompany(company);
  if (!q) return true;
  return normalizeCompany(product.company) === q;
}

function registryMatchesProduct(row, product) {
  const partMatch =
    String(row.partNo ?? "").trim().toLowerCase() === String(product.partNo ?? "").trim().toLowerCase();
  if (!partMatch) return false;
  const company = normalizeCompany(product.company);
  if (!company) return true;
  return normalizeCompany(row.company) === company || row.company === "—";
}

function pickCurrentDocumentRow(rows) {
  if (!rows.length) return null;
  const current = rows.find((row) => row.approvalStatus === "현행");
  if (current) return current;
  return [...rows].sort((a, b) =>
    String(b.revisionDate || b.updatedAt).localeCompare(String(a.revisionDate || a.updatedAt))
  )[0];
}

function buildStatusPayload(base) {
  const statusId = resolveDocumentStatusId(base);
  return {
    ...base,
    statusId,
    statusLabel: resolveRegisteredLabel(statusId) === "미등록" ? "미등록" : base.approvalStatus || "—",
    registered: statusId !== "unregistered",
    registeredLabel: resolveRegisteredLabel(statusId),
    statusDisplay: statusId,
  };
}

function buildInspectionStandardStatus(product) {
  const inspection = getProductInspectionByProductId(product.id);
  const hasSpec = Boolean(inspection?.specification);
  const drawing = inspection?.drawing;
  const hasDrawingFile = Boolean(drawing?.dataUrl || drawing?.fileName);
  const registered = hasSpec || hasDrawingFile;
  const documentName = drawing?.fileName || (hasSpec ? `${product.partNo} 검사기준서` : product.partNo);
  const approvalStatus = registered ? (hasDrawingFile ? "등록" : "현행") : "";

  return buildStatusPayload({
    documentName,
    approvalStatus,
    revision: drawing?.revision ? `Rev.${drawing.revision.replace(/^Rev\.?/i, "")}` : "—",
    approver: drawing?.registeredBy || inspection?.specification?.approvedBy || "—",
    registeredDate: formatDate(drawing?.revisionDate || inspection?.updatedAt),
    lastModified: formatDate(inspection?.updatedAt || drawing?.revisionDate),
    canView: registered,
    canDownload: Boolean(drawing?.dataUrl),
    downloadFileName: drawing?.fileName || "",
    note: inspection?.note || "—",
    hasStaleRevision: false,
    isObsolete: false,
    source: "inspection-session",
    registryRow: null,
  });
}

function buildDrawingStatus(product, registryRows) {
  const drawingRecord = getProductDrawingRecord(product.id);
  const revisionRows = registryRows.filter(
    (row) => row.documentType === "drawing" && registryMatchesProduct(row, product)
  );
  const currentRevision = drawingRecord?.revisions?.find((item) => item.isCurrent);
  const registryCurrent = pickCurrentDocumentRow(revisionRows);
  const registered = Boolean(currentRevision || registryCurrent);
  const revisionValue = currentRevision?.revision || registryCurrent?.revision || "";
  const revision = revisionValue ? `Rev.${String(revisionValue).replace(/^Rev\.?/i, "")}` : "—";
  const documentName =
    currentRevision?.fileName ||
    registryCurrent?.title ||
    currentRevision?.drawingNo ||
    `${product.partNo} 도면`;
  const approvalStatus = registryCurrent?.approvalStatus || (currentRevision?.isCurrent ? "현행" : "");
  const hasStaleRevision =
    Boolean(drawingRecord?.revisions?.length > 1 && !currentRevision) ||
    (revisionRows.some((row) => row.approvalStatus === "이력") && !revisionRows.some((row) => row.approvalStatus === "현행"));

  return buildStatusPayload({
    documentName,
    approvalStatus,
    revision,
    approver: currentRevision?.registeredBy || registryCurrent?.approver || "—",
    registeredDate: formatDate(currentRevision?.revisionDate || currentRevision?.createdAt || registryCurrent?.revisionDate),
    lastModified: formatDate(
      currentRevision?.revisionDate ||
        currentRevision?.createdAt ||
        registryCurrent?.revisionDate ||
        registryCurrent?.updatedAt
    ),
    canView: Boolean(currentRevision?.dataUrl || registryCurrent?.hasPdf),
    canDownload: Boolean(currentRevision?.dataUrl || registryCurrent?.hasPdf),
    downloadFileName: currentRevision?.fileName || registryCurrent?.pdfFileName || "",
    note: currentRevision?.note || registryCurrent?.note || "—",
    hasStaleRevision,
    isObsolete: approvalStatus === "폐기",
    source: "drawing-session",
    registryRow: registryCurrent,
  });
}

function buildRelatedDocumentStatus(product, documentType, registryRows, label) {
  const typeRows = registryRows.filter(
    (row) => row.documentType === documentType && registryMatchesProduct(row, product)
  );
  const current = pickCurrentDocumentRow(typeRows);
  const allRows = typeRows.length;
  const hasStaleRevision = allRows > 0 && !typeRows.some((row) => row.approvalStatus === "현행");

  return buildStatusPayload({
    documentName: current?.title || `${product.partNo} ${label}`,
    approvalStatus: current?.approvalStatus || "",
    revision: current?.revision ? `Rev.${String(current.revision).replace(/^Rev\.?/i, "")}` : "—",
    approver: current?.approver || current?.registeredBy || "—",
    registeredDate: formatDate(current?.revisionDate || current?.updatedAt),
    lastModified: formatDate(current?.revisionDate || current?.updatedAt),
    canView: Boolean(current?.hasPdf),
    canDownload: Boolean(current?.hasPdf),
    downloadFileName: current?.pdfFileName || "",
    note: current?.note || "—",
    hasStaleRevision,
    isObsolete: current?.approvalStatus === "폐기",
    source: "registry",
    registryRow: current,
  });
}

export function getDocumentManagementProducts(company = "") {
  return getMasterDataByCategory("products")
    .filter((row) => row.active !== false)
    .filter((row) => productMatchesCompany(row, company))
    .map((row) => ({
      id: row.id,
      partNo: row.partNo ?? "",
      name: row.name ?? "",
      material: row.material ?? "",
      spec: row.spec ?? "",
      company: row.company ?? "",
    }))
    .sort((a, b) => String(a.partNo).localeCompare(String(b.partNo), "ko"));
}

export function buildProductDocumentStatusRows(product) {
  if (!product) return [];

  const registryRows = getQualityDocumentRegistryRows();

  return PRODUCT_DOCUMENT_STATUS_TYPES.map((typeDef) => {
    let status;
    if (typeDef.documentType === "drawing") {
      status = buildDrawingStatus(product, registryRows);
    } else if (typeDef.documentType === "inspection_standard") {
      status = buildInspectionStandardStatus(product);
    } else {
      status = buildRelatedDocumentStatus(product, typeDef.documentType, registryRows, typeDef.label);
    }

    return {
      id: `${product.id}-${typeDef.documentType}`,
      documentType: typeDef.documentType,
      label: typeDef.label,
      registerRoute: typeDef.registerRoute,
      ...status,
      typeMeta: resolveQualityDocumentType(typeDef.documentType),
    };
  });
}

export function countRegisteredDocuments(statusRows = []) {
  return statusRows.filter((row) => row.statusId !== "unregistered").length;
}

export function countDocumentsByStatus(statusRows = [], statusId) {
  return statusRows.filter((row) => row.statusId === statusId).length;
}

export function summarizeCompanyDocumentCoverage(products = []) {
  if (!products.length) {
    return { totalProducts: 0, fullyRegistered: 0, partial: 0, none: 0 };
  }

  let fullyRegistered = 0;
  let none = 0;
  let partial = 0;

  products.forEach((product) => {
    const rows = buildProductDocumentStatusRows(product);
    const registered = countRegisteredDocuments(rows);
    if (registered === 0) none += 1;
    else if (registered === rows.length) fullyRegistered += 1;
    else partial += 1;
  });

  return { totalProducts: products.length, fullyRegistered, partial, none };
}

const DOCUMENT_LIST_STATUS_PRIORITY = [
  "obsolete",
  "revision_required",
  "pending_approval",
  "unregistered",
  "current",
];

function pickAggregateDocumentStatusId(statusRows = []) {
  if (!statusRows.length) return "unregistered";
  const ids = statusRows.map((row) => row.statusId);
  for (const priority of DOCUMENT_LIST_STATUS_PRIORITY) {
    if (ids.includes(priority)) return priority;
  }
  return "current";
}

function pickLatestRevision(statusRows = []) {
  const drawing = statusRows.find((row) => row.documentType === "drawing");
  if (drawing?.revision && drawing.revision !== "—") return drawing.revision;
  const registered = statusRows.find((row) => row.statusId !== "unregistered" && row.revision !== "—");
  return registered?.revision ?? "—";
}

function pickLatestModified(statusRows = []) {
  const dates = statusRows
    .map((row) => row.lastModified)
    .filter((value) => value && value !== "—");
  if (!dates.length) return "—";
  return [...dates].sort((a, b) => String(b).localeCompare(String(a)))[0];
}

/** 제품 1건 — 문서관리 리스트 요약 (문서상태 · Revision · 최종 수정일) */
export function summarizeProductDocumentListSummary(product) {
  const statusRows = buildProductDocumentStatusRows(product);
  const documentStatusId = pickAggregateDocumentStatusId(statusRows);
  return {
    documentStatusId,
    documentStatusLabel: resolveRegisteredLabel(documentStatusId),
    revision: pickLatestRevision(statusRows),
    lastModified: pickLatestModified(statusRows),
    registeredCount: countRegisteredDocuments(statusRows),
    totalDocumentTypes: statusRows.length,
  };
}

/** 제품 Master → 문서관리 리스트 행 */
export function buildProductDocumentListRows() {
  return getDocumentManagementProducts()
    .map((product) => ({
      ...product,
      ...summarizeProductDocumentListSummary(product),
    }))
    .sort((a, b) => String(a.partNo).localeCompare(String(b.partNo), "ko"));
}

export function matchesDocumentManagementSearch(search, row) {
  const basicTarget = {
    company: row.company,
    partName: row.name,
    partNo: row.partNo,
    material: row.material,
  };
  if (!matchesBasicSearch(search, basicTarget)) return false;

  const statusQuery = String(search.status ?? "").trim();
  if (!statusQuery) return true;

  const q = statusQuery.toLowerCase();
  const label = String(row.documentStatusLabel ?? "").toLowerCase();
  const id = String(row.documentStatusId ?? "").toLowerCase();
  return label.includes(q) || id.includes(q) || statusQuery === row.documentStatusId;
}
