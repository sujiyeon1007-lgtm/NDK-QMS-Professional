import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { getRecordWorkflowState } from "./ndkWorkflow";

/** 업체별 입고·출고·최근 거래일 (Session 기준) */
export function getCompanyTradeSummary(companyName) {
  const name = companyName?.trim();
  if (!name) {
    return { inboundCount: 0, outboundCount: 0, lastTradeDate: "—" };
  }

  const records = getSessionProductionRecords().filter((record) => record.company === name);
  const inboundCount = records.filter(isIncomingRegistered).length;
  const outboundCount = records.filter(
    (record) =>
      getRecordWorkflowState(record) === "출고완료" || record.shipmentStatus === "출고완료"
  ).length;

  const dates = records
    .flatMap((record) => [record.incomingDate, record.workDate].filter(Boolean))
    .sort();

  return {
    inboundCount,
    outboundCount,
    lastTradeDate: dates.at(-1) ?? "—",
  };
}
