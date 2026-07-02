/**
 * Project TITAN V1.0 — Internal document QR payloads (print)
 */

export const TITAN_DOCUMENT_QR = {
  HTL: { kind: "HTL", label: "열처리 작업 요청 리스트", version: "1.0" },
  DPR: { kind: "DPR", label: "생산일보", version: "1.0" },
  COA: { kind: "COA", label: "검사성적서", version: "1.0" },
  INV: { kind: "INV", label: "거래명세서", version: "1.0" },
};

/**
 * NDK|DOC|{kind}|{docNo}|{managementId}|{company}|{partNo}|{lot}|{version}
 * @param {{ kind: keyof typeof TITAN_DOCUMENT_QR, docNo: string, managementId?: string, company?: string, partNo?: string, lotNo?: string, version?: string }} params
 */
export function buildTitanDocumentQrPayload({
  kind,
  docNo,
  managementId = "",
  company = "",
  partNo = "",
  lotNo = "",
  version,
}) {
  const meta = TITAN_DOCUMENT_QR[kind];
  if (!meta || !docNo?.trim()) return "";

  const parts = [
    "NDK",
    "DOC",
    meta.kind,
    docNo.trim(),
    managementId.trim(),
    company.trim(),
    partNo.trim(),
    lotNo.trim(),
    version?.trim() || meta.version,
  ];

  return parts.join("|");
}

/**
 * Batch document QR — primary row + batch management ids
 * @param {{ kind: keyof typeof TITAN_DOCUMENT_QR, docNo: string, rows?: Array<{ managementId?: string, id?: string, company?: string, partNo?: string, lotNo?: string }> }} params
 */
export function buildTitanDocumentQrPayloadFromRows({ kind, docNo, rows = [] }) {
  const primary = rows[0] ?? {};
  const managementIds = rows
    .map((row) => row.managementId ?? row.id ?? "")
    .filter(Boolean)
    .join(";");

  return buildTitanDocumentQrPayload({
    kind,
    docNo,
    managementId: managementIds,
    company: primary.company ?? "",
    partNo: primary.partNo ?? "",
    lotNo: primary.lotNo ?? "",
  });
}

/**
 * @param {string} raw
 */
export function parseTitanDocumentQrPayload(raw) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed.toUpperCase().startsWith("NDK|DOC|")) return null;

  const parts = trimmed.split("|");
  if (parts.length < 9) return null;

  return {
    docKind: parts[2],
    docNo: parts[3],
    managementIds: parts[4]?.split(";").filter(Boolean) ?? [],
    company: parts[5] ?? "",
    partNo: parts[6] ?? "",
    lotNo: parts[7] ?? "",
    version: parts[8] ?? "1.0",
  };
}
