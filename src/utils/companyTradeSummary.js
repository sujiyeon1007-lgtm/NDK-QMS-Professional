import { getCertificateFileEntries } from "./certificateSession";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { getRecordWorkflowState } from "./ndkWorkflow";

function formatTradeProducts(records) {
  const productNames = [...new Set(records.map((record) => record.partName?.trim()).filter(Boolean))];
  if (productNames.length === 0) return "—";
  if (productNames.length === 1) return productNames[0];
  if (productNames.length === 2) return productNames.join(", ");
  return `${productNames.slice(0, 2).join(", ")} 외 ${productNames.length - 2}품목`;
}

/** 업체별 입고·출고·성적서·거래이력 (Session 기준) */
export function getCompanyTradeSummary(companyName, companyRow = null) {
  const name = companyName?.trim();
  if (!name) {
    return {
      inboundCount: 0,
      outboundCount: 0,
      certificateCount: 0,
      firstTradeDate: "—",
      lastTradeDate: "—",
      tradeProductsLabel: "—",
      latestCertificate: "—",
    };
  }

  const records = getSessionProductionRecords().filter((record) => record.company === name);
  const inboundCount = records.filter(isIncomingRegistered).length;
  const outboundCount = records.filter(
    (record) =>
      getRecordWorkflowState(record) === "출고완료" || record.shipmentStatus === "출고완료"
  ).length;

  const certificates = getCertificateFileEntries().filter(
    (entry) => entry.company === name && !entry.deleted
  );
  const certificateCount = certificates.length;

  const dates = records
    .flatMap((record) => [record.incomingDate, record.workDate, record.shipDate].filter(Boolean))
    .sort();

  const certDates = certificates
    .map((entry) => entry.registeredDate?.trim())
    .filter(Boolean)
    .sort();

  const manualStart = companyRow?.tradeStartDate?.trim();

  return {
    inboundCount,
    outboundCount,
    certificateCount,
    firstTradeDate: dates[0] ?? manualStart ?? "—",
    lastTradeDate: dates.at(-1) ?? "—",
    tradeProductsLabel: formatTradeProducts(records),
    latestCertificate: certDates.at(-1) ?? "—",
  };
}
