/**
 * Project TITAN V1.7 — 성적서 자동 연동 준비 (Repository 교체 대비)
 */

import { normalizeProductionLotKey } from "./productionDailyReportPrintData";

/**
 * @param {string} lotNo
 * @param {{
 *   managementId?: string,
 *   inspectionRows?: Record<string, unknown>[],
 *   certificateRows?: Record<string, unknown>[],
 * }} [context]
 */
export function prepareCertificateLinkForLot(lotNo, context = {}) {
  const key = normalizeProductionLotKey(lotNo);
  const managementId = String(context.managementId ?? "").trim();
  const inspectionRows = context.inspectionRows ?? [];
  const certificateRows = context.certificateRows ?? [];

  const latestInspection = inspectionRows[inspectionRows.length - 1] ?? null;
  const existingCertificate = certificateRows[0] ?? null;

  const readyForIssue =
    Boolean(latestInspection) &&
    (latestInspection?.status === "검사완료" || latestInspection?.workflowState === "성적서대기");

  return {
    lotNo: key,
    managementId,
    inspectionId: latestInspection?.id ?? latestInspection?.logId ?? null,
    certificateId: existingCertificate?.id ?? existingCertificate?.certificateId ?? null,
    readyForIssue,
    pdfStatus: existingCertificate ? "issued" : readyForIssue ? "ready" : "pending",
    linkFields: {
      lotNo: key,
      managementId,
      inspectionId: latestInspection?.id ?? null,
      productNo: latestInspection?.partNo ?? null,
      judgment: latestInspection?.judgment ?? "합격",
    },
  };
}
