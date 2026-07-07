import { getEquipmentSummary, getEquipmentList } from "./equipmentWorkflowService";
import { buildHomeTopKpiCounts, countHomeStatusCards, getHomeScreenData } from "./homeDashboardData";
import { getJournalReferenceDate } from "./workJournalData";
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
  const shortageCount = records.filter((row) => {
    const stock = row.stockQty ?? row.quantity ?? 0;
    return stock > 0 && stock <= 5;
  }).length;
  const inboundHistory = records.filter((row) => row.incomingDate || row.workflowStatus).length;
  const outboundHistory = records.filter((row) => row.shipmentDate || row.workflowStatus === "SHIPPED").length;
  const referenceDate = getJournalReferenceDate();
  const operationsJournalToday = getWorkJournalEntries("operations", {
    dateFrom: referenceDate,
    dateTo: referenceDate,
    adminViewAll: true,
  }).length;

  return {
    todayIncoming: `금일 입고 ${topKpi.todayIncoming}건`,
    inboundWait: `입고 대기 ${counts.RECEIVED ?? 0}건`,
    todayShipment: `금일 출고 ${topKpi.todayShipment}건`,
    shipWait: `출고 대기 ${counts.SHIP_WAIT ?? 0}건`,
    inboundLookup: `입고 조회 ${inboundHistory}건`,
    outboundLookup: `출고 조회 ${outboundHistory}건`,
    currentInventory: `현재 재고 ${inventoryCount}건`,
    shortageItems: `부족 품목 ${shortageCount}건`,
    htlList: `입고리스트 ${printPending}건`,
    invoiceList: `거래명세서 ${counts.SHIP_WAIT ?? 0}건`,
    operationsJournalToday: `금일 작성 ${operationsJournalToday}건`,
  };
}

export function buildProductionLauncherMetrics(records = getSessionProductionRecords()) {
  const { counts } = getHomeScreenData(records);
  const dailyRows = records.filter((row) => row.productionStatus || row.workflowStatus === "HT_RUNNING");
  const dailyPending = records.filter(
    (row) => row.workflowStatus === "HT_RUNNING" && !row.productionStatus
  ).length;
  const todayQty = dailyRows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
  const referenceDate = getJournalReferenceDate();
  const journalTodayCount = getWorkJournalEntries("production", {
    dateFrom: referenceDate,
    dateTo: referenceDate,
    adminViewAll: true,
  }).length;
  const equipmentSummary = getEquipmentSummary();

  return {
    planToday: `금일 계획 ${dailyRows.length}건`,
    planCount: `계획 ${dailyRows.length}건`,
    chargingRunning: `운전중 ${equipmentSummary.running}대`,
    chargingReady: `장입 준비 ${equipmentSummary.ready}대`,
    dailyReportPending: `미작성 ${dailyPending}건`,
    htRunning: `열처리중 ${counts.HT_RUNNING ?? 0}건`,
    resultsToday: `금일 실적 ${todayQty}EA`,
    journalToday: `금일 작성 ${journalTodayCount}건`,
  };
}

export function buildQrChargingLauncherMetrics(records = getSessionProductionRecords()) {
  const { counts } = getHomeScreenData(records);
  const equipmentSummary = getEquipmentSummary();
  const chargeableLots = getEquipmentList().reduce(
    (sum, equipment) => sum + (equipment.chargeableLots?.length ?? 0),
    0
  );
  const activeSessions = getEquipmentList().filter((equipment) => equipment.runningSession).length;
  const lotsInProgress = records.filter((row) => row.workflowStatus === "HT_RUNNING").length;

  return {
    equipmentRunning: `운전중 ${equipmentSummary.running}대`,
    equipmentReady: `장입 준비 ${equipmentSummary.ready}대`,
    chargeableLots: `장입 가능 LOT ${chargeableLots}건`,
    activeSessions: `작업중 ${activeSessions}건`,
    lotsInProgress: `진행중 ${lotsInProgress}건`,
    htRunning: `열처리중 ${counts.HT_RUNNING ?? 0}건`,
    completedCharges: `완료 이력 ${records.filter((row) => row.productionStatus).length}건`,
    traceCount: `추적 가능 ${records.length}건`,
  };
}

export function buildQualityLauncherMetrics(records = getSessionProductionRecords()) {
  const { counts } = getHomeScreenData(records);
  const statusCounts = countHomeStatusCards(records);
  const referenceDate = getJournalReferenceDate();
  const qualityJournalToday = getWorkJournalEntries("quality", {
    dateFrom: referenceDate,
    dateTo: referenceDate,
    adminViewAll: true,
  }).length;
  const defectRows = records.filter((row) => row.defectStatus || row.inspectionResult === "불합격");

  return {
    inspectionWait: `검사대기 ${counts.INSPECTION_WAIT ?? 0}건`,
    inspectionDone: `진행중 검사 ${statusCounts.inspectDone ?? 0}건`,
    certificateWait: `발행대기 ${counts.CERT_WAIT ?? 0}건`,
    certificateDone: `금일 발행 ${statusCounts.certDone ?? 0}건`,
    defectToday: `금일 불량 ${defectRows.length}건`,
    documentStandards: "표준서 · 도면 · 절차서",
    documentQuality: "품질문서 · Revision",
    qualityJournalToday: `금일 작성 ${qualityJournalToday}건`,
  };
}
