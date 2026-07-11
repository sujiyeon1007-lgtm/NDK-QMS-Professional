/** RC1 stub — quality certificates session (project-titan-quality-certificates-v1) */

export const QUALITY_CERTIFICATES_STORAGE_KEY = "project-titan-quality-certificates-v1";

export const QUALITY_CERTIFICATE_FIELDS = Object.freeze([
  { key: "name", label: "인증서명" },
  { key: "issuer", label: "발급기관" },
  { key: "issuedDate", label: "발급일" },
  { key: "expiryDate", label: "만료일" },
  { key: "attachments", label: "파일첨부" },
]);

function readRows() {
  try {
    const raw = globalThis.sessionStorage?.getItem(QUALITY_CERTIFICATES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRows(rows) {
  try {
    globalThis.sessionStorage?.setItem(QUALITY_CERTIFICATES_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* SessionStorage demo repository. */
  }
}

export function getQualityCertificateRows() {
  return readRows();
}

export function saveQualityCertificateRow(row = {}) {
  const rows = readRows();
  const id = String(row.id ?? "").trim() || `QCERT-${Date.now()}`;
  const next = {
    id,
    name: String(row.name ?? "").trim(),
    issuer: String(row.issuer ?? "").trim(),
    issuedDate: String(row.issuedDate ?? "").slice(0, 10),
    expiryDate: String(row.expiryDate ?? "").slice(0, 10),
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  };
  const index = rows.findIndex((item) => item.id === id);
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  writeRows(rows);
  return next;
}
