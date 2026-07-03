import { normalizeQualityNotice } from "./qualityNoticeSession";

function includesText(source, query) {
  if (!query) return true;
  return String(source ?? "")
    .toLowerCase()
    .includes(String(query).trim().toLowerCase());
}

function inDateRange(value, from, to) {
  if (!from && !to) return true;
  const date = String(value ?? "");
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function mapQualityNoticeToListRow(notice) {
  const row = normalizeQualityNotice(notice);
  return {
    id: row.id,
    title: row.title,
    documentType: row.documentType,
    documentTypeLabel: row.documentTypeLabel,
    author: row.author,
    createdDate: row.createdDate,
    effectiveDate: row.effectiveDate,
    status: row.status,
    statusLabel: row.statusLabel,
    body: row.body,
    attachments: row.attachments,
    relatedPartNo: row.relatedPartNo,
    relatedMaterial: row.relatedMaterial,
    relatedDocuments: row.relatedDocuments,
    updatedAt: row.updatedAt,
  };
}

export function matchesQualityNoticeSearch(row, search = {}) {
  if (!search) return true;

  if (search.status) {
    const statusQuery = String(search.status).trim();
    if (statusQuery && row.status !== statusQuery && row.statusLabel !== statusQuery) {
      return false;
    }
  }

  if (!includesText(row.title, search.title)) return false;
  if (!includesText(row.author, search.author)) return false;

  if (!inDateRange(row.createdDate, search.createdDateFrom, search.createdDateTo)) return false;
  if (!inDateRange(row.effectiveDate, search.effectiveDateFrom, search.effectiveDateTo)) return false;

  return true;
}

export function buildQualityNoticeSearchRecords(notices) {
  return notices.map(mapQualityNoticeToListRow);
}
