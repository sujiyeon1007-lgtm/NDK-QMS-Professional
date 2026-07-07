import { buildHomeTopKpiCounts, countHomeStatusCards, getHomeScreenData } from "./homeDashboardData";
import { getSessionProductionRecords } from "./productionRecords";
import { getWorkJournalEntries } from "./workJournalSession";

/**
 * Launcher Hub 카드 요약 — HOME KPI와 동일 records
 * @param {object[]} [records]
 */
export function buildInoutLauncherMetrics(records = getSessionProductionRecords()) {
  const { counts } = getHomeScreenData(records);
  const topKpi = buildHomeTopKpiCounts(records);
  const printPending = records.filter(
    (row) => row.workflowStatus === "RECEIVED" || row.printStatus === "미출력"
  ).length;
  const inventoryCount = records.filter((row) => (row.stockQty ?? row.quantity ?? 0) > 0).length;

  return {
    todayIncoming: `금일 입고 ${topKpi.todayIncoming}건`,
    inboundWait: `입고 대기 ${counts.RECEIVED ?? 0}건`,
    todayShipment: `금일 출고 ${topKpi.todayShipment}건`,
    shipWait: `출고 대기 ${counts.SHIP_WAIT ?? 0}건`,
    inventoryCount: `재고 품목 ${inventoryCount}건`,
    traceCount: `추적 가능 ${records.length}건`,
    printPending: `출력 대기 ${printPending}건`,
  };
}

export function buildProductionLauncherMetrics(records = getSessionProductionRecords()) {
  const { counts } = getHomeScreenData(records);
  const lotSet = new Set(records.map((row) => row.lotNo).filter(Boolean));
  const dailyRows = records.filter((row) => row.productionStatus || row.workflowStatus === "HT_RUNNING");
  const defectRows = records.filter((row) => row.defectStatus || row.inspectionResult === "불합격");
  let journalCount = 0;
  try {
    journalCount = getWorkJournalEntries()?.length ?? 0;
  } catch {
    journalCount = 0;
  }

  return {
    planCount: `계획 ${dailyRows.length}건`,
    dailyReportCount: `일보 ${dailyRows.length}건`,
    htRunning: `열처리중 ${counts.HT_RUNNING ?? 0}건`,
    lotCount: `LOT ${lotSet.size}건`,
    workOrderPending: `작업지시 대기 ${counts.RECEIVED ?? 0}건`,
    resultsCount: `실적 ${dailyRows.length}건`,
    journalCount: `업무일지 ${journalCount}건`,
    defectCount: `불량 ${defectRows.length}건`,
  };
}

export function buildQualityLauncherMetrics(records = getSessionProductionRecords()) {
  const { counts } = getHomeScreenData(records);
  const statusCounts = countHomeStatusCards(records);

  return {
    inspectionWait: `검사 대기 ${counts.INSPECTION_WAIT ?? 0}건`,
    inspectionDone: `검사완료 ${statusCounts.inspectDone ?? 0}건`,
    certificateWait: `미발행 ${counts.CERT_WAIT ?? 0}건`,
    certificateDone: `발행완료 ${statusCounts.certDone ?? 0}건`,
    documentCount: "품질 문서 · Revision 관리",
  };
}
