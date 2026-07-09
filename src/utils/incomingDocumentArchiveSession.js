import { normalizeFoundationAttachments } from "./foundationAttachmentEngine";

export const INCOMING_DOCUMENT_ARCHIVE_STORAGE_KEY = "project-titan-incoming-document-archive-v1";

export const INCOMING_DOCUMENT_TYPES = Object.freeze([
  { id: "purchaseOrder", label: "\uBC1C\uC8FC\uC11C" },
  { id: "drawing", label: "\uB3C4\uBA74" },
  { id: "releaseSlip", label: "\uBC18\uCD9C\uC99D" },
  { id: "mtc", label: "MTC" },
  { id: "inspectionStandard", label: "\uAC80\uC0AC\uAE30\uC900\uC11C" },
  { id: "customerRequest", label: "\uACE0\uAC1D \uC694\uCCAD\uC0AC\uD56D" },
  { id: "customerStatement", label: "\uAC70\uB798\uBA85\uC138\uC11C(\uAC70\uB798\uCC98 \uBC1C\uD589)" },
  { id: "taxInvoice", label: "\uC138\uAE08\uACC4\uC0B0\uC11C" },
  { id: "etc", label: "\uAE30\uD0C0" },
]);

function today() { return new Date().toISOString().slice(0, 10); }
function nowIso() { return new Date().toISOString(); }

function readRows() {
  try {
    const raw = globalThis.sessionStorage?.getItem(INCOMING_DOCUMENT_ARCHIVE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeIncomingDocumentRow).filter(Boolean) : [];
  } catch { return []; }
}

function writeRows(rows) {
  try { globalThis.sessionStorage?.setItem(INCOMING_DOCUMENT_ARCHIVE_STORAGE_KEY, JSON.stringify(rows.map(normalizeIncomingDocumentRow).filter(Boolean))); } catch { /* SessionStorage demo repository. */ }
}

function seedRows() {
  const now = nowIso();
  const seeds = [
    { id: "IN-DOC-SE-001", company: "\uC11C\uC554\uAE30\uACC4\uACF5\uC5C5", documentType: "purchaseOrder", title: "\uC11C\uC554\uAE30\uACC4\uACF5\uC5C5 7\uC6D4 \uBC1C\uC8FC\uC11C", receivedDate: today(), orderNo: "PO-SE-202607-001", manager: "\uAD00\uB9AC\uC790", memo: "\uBC1C\uC8FC\uC11C\uC640 \uB3C4\uBA74\uC744 \uD568\uAED8 \uC218\uC2E0. \uC785\uACE0/LOT \uC790\uB3D9 \uC5F0\uACB0 \uC5C6\uC74C.", attachments: [{ id: "IN-DOC-SE-001-A1", name: "\uBC1C\uC8FC\uC11C.pdf", attachmentType: "etc" }, { id: "IN-DOC-SE-001-A2", name: "\uB3C4\uBA74.pdf", attachmentType: "drawing" }], createdAt: now, updatedAt: now, createdBy: "Program Administrator", history: [{ at: now, action: "\uB4F1\uB85D", user: "Program Administrator" }] },
    { id: "IN-DOC-HY-001", company: "\uD604\uB300\uC704\uC544", documentType: "drawing", title: "\uB3C4\uBA74 \uC218\uC2E0\uBB38\uC11C", receivedDate: today(), orderNo: "", manager: "\uD488\uC9C8\uAD00\uB9AC\uBD80", memo: "\uB3C4\uBA74\uB9CC \uC218\uC2E0\uD55C \uC5C5\uCCB4 \uCF00\uC774\uC2A4.", attachments: [{ id: "IN-DOC-HY-001-A1", name: "\uB3C4\uBA74.pdf", attachmentType: "drawing" }], createdAt: now, updatedAt: now, createdBy: "Program Administrator", history: [{ at: now, action: "\uB4F1\uB85D", user: "Program Administrator" }] },
  ];
  writeRows(seeds);
  return seeds.map(normalizeIncomingDocumentRow).filter(Boolean);
}

export function resolveIncomingDocumentType(typeId) {
  const id = String(typeId ?? "").trim();
  return INCOMING_DOCUMENT_TYPES.find((type) => type.id === id) ?? INCOMING_DOCUMENT_TYPES[INCOMING_DOCUMENT_TYPES.length - 1];
}

export function normalizeIncomingDocumentRow(row = {}) {
  if (!row) return null;
  const id = String(row.id ?? "").trim() || `IN-DOC-${Date.now()}`;
  const documentType = resolveIncomingDocumentType(row.documentType).id;
  const createdAt = row.createdAt || nowIso();
  return {
    id,
    company: String(row.company ?? "").trim(),
    documentType,
    documentTypeLabel: resolveIncomingDocumentType(documentType).label,
    title: String(row.title ?? "").trim(),
    receivedDate: String(row.receivedDate ?? today()).slice(0, 10),
    orderNo: String(row.orderNo ?? "").trim(),
    manager: String(row.manager ?? "").trim(),
    memo: String(row.memo ?? "").trim(),
    attachments: normalizeFoundationAttachments(row.attachments ?? []),
    createdAt,
    registeredDate: String(row.registeredDate ?? createdAt).slice(0, 10),
    updatedAt: row.updatedAt || createdAt,
    createdBy: String(row.createdBy ?? "Program Administrator").trim(),
    history: Array.isArray(row.history) ? row.history : [{ at: createdAt, action: "\uB4F1\uB85D", user: "Program Administrator" }],
  };
}

export function getIncomingDocumentArchiveRows() {
  const rows = readRows();
  return rows.length ? rows : seedRows();
}

export function saveIncomingDocumentArchiveRow(payload, user = "Program Administrator") {
  const rows = getIncomingDocumentArchiveRows();
  const isEdit = Boolean(payload.id);
  const now = nowIso();
  const base = isEdit ? rows.find((row) => row.id === payload.id) : null;
  const next = normalizeIncomingDocumentRow({ ...base, ...payload, id: payload.id || `IN-DOC-${Date.now()}`, createdAt: base?.createdAt || now, createdBy: base?.createdBy || user, updatedAt: now, history: [...(base?.history ?? []), { at: now, action: isEdit ? "\uC218\uC815" : "\uB4F1\uB85D", user }] });
  writeRows(isEdit ? rows.map((row) => row.id === next.id ? next : row) : [next, ...rows]);
  return next;
}

export function deleteIncomingDocumentArchiveRow(id) {
  const key = String(id ?? "").trim();
  const rows = getIncomingDocumentArchiveRows();
  const target = rows.find((row) => row.id === key);
  writeRows(rows.filter((row) => row.id !== key));
  return target ? { ok: true, row: target } : { ok: false };
}

export function matchesIncomingDocumentArchiveSearch(row, search = {}) {
  const includes = (value, query) => !String(query ?? "").trim() || String(value ?? "").toLowerCase().includes(String(query).trim().toLowerCase());
  const type = String(search.documentType ?? "all");
  const registeredDate = String(row.registeredDate ?? "").slice(0, 10);
  const receivedDate = String(row.receivedDate ?? "").slice(0, 10);
  return includes(row.company, search.company) && (type === "all" || row.documentType === type) && includes(row.title, search.title) && includes(row.orderNo, search.orderNo) && includes(row.memo, search.memo) && (!search.registeredDateFrom || registeredDate >= search.registeredDateFrom) && (!search.registeredDateTo || registeredDate <= search.registeredDateTo) && (!search.receivedDateFrom || receivedDate >= search.receivedDateFrom) && (!search.receivedDateTo || receivedDate <= search.receivedDateTo);
}