import { getEquipmentSummary, getEquipmentList } from "./equipmentWorkflowService";
import { buildHomeTopKpiCounts, getHomeScreenData } from "./homeDashboardData";
import { getJournalReferenceDate } from "./workJournalData";
import { getSessionProductionRecords } from "./productionRecords";
import { getWorkJournalEntries } from "./workJournalSession";
import { getQualityWorkspaceSnapshot } from "./qualityWorkspaceData";
import {
  buildProductionChargingWorkspaceRecords,
  buildProductionDailyReportWorkspaceRecords,
  buildProductionPlanWorkspaceRecords,
  buildProductionResultWorkspaceRecords,
  countProductionChargingWorkspace,
  countProductionDailyReportWorkspace,
  countProductionPlanWorkspace,
  getProductionChargingScreenData,
} from "./productionWorkspaceData";

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
  const planCounts = countProductionPlanWorkspace(buildProductionPlanWorkspaceRecords(records));
  const chargingCounts = countProductionChargingWorkspace(buildProductionChargingWorkspaceRecords(records));
  const dailyCounts = countProductionDailyReportWorkspace(
    buildProductionDailyReportWorkspaceRecords(records)
  );
  const equipmentSummary = getEquipmentSummary();
  const printPending = records.filter(
    (row) => row.workflowStatus === "RECEIVED" || row.printStatus === "미출력"
  ).length;
  const todayQty = buildProductionResultWorkspaceRecords(records).reduce(
    (sum, row) => sum + (Number(row.qty) || 0),
    0
  );

  return {
    planToday: `열처리 대기 ${planCounts.htWait}건`,
    planCount: `LOT 미생성 ${planCounts.lotPending}건`,
    chargingRunning: `운전중 ${equipmentSummary.running}대`,
    chargingReady: `장입 대기 ${chargingCounts.chargePending}건`,
    dailyReportPending: `진행중 ${dailyCounts.prodProgress}건`,
    htRunning: `열처리중 ${dailyCounts.htRunning}건`,
    resultsToday: `완료 ${todayQty}EA`,
    dailyReportPrint: `생산일보 ${dailyCounts.prodProgress}건`,
    htlPrint: `작업지시 ${printPending}건`,
  };
}

export function buildProductionChargingLauncherMetrics(records = getSessionProductionRecords()) {
  const { counts, equipmentSummary } = getProductionChargingScreenData(records);
  const list = getEquipmentList();

  const countByProcess = (processName) =>
    list.filter((item) => item.process === processName).length;
  const runningByProcess = (processName) =>
    list.filter((item) => item.process === processName && item.status === "running").length;
  const idleCount = list.filter(
    (item) => item.status === "idle" || item.status === "ready"
  ).length;
  const maintenanceCount = list.filter((item) => item.status === "maintenance").length;

  return {
    equipmentRunning: `운전중 ${equipmentSummary.running}대`,
    equipmentIdle: `대기 ${idleCount}대`,
    equipmentMaintenance: `점검 ${maintenanceCount}대`,
    chargePending: `장입 대기 ${counts.chargePending}건`,
    chargeActive: `장입중 ${counts.chargeActive}건`,
    ionEquipmentCount: `설비 ${countByProcess("이온질화")}대`,
    ionRunning: `운전 ${runningByProcess("이온질화")}대`,
    gasEquipmentCount: `설비 ${countByProcess("가스질화")}대`,
    gasRunning: `운전 ${runningByProcess("가스질화")}대`,
    softEquipmentCount: `설비 ${countByProcess("가스연질화")}대`,
    softRunning: `운전 ${runningByProcess("가스연질화")}대`,
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
  const snapshot = getQualityWorkspaceSnapshot(records);
  const { counts, ncr } = snapshot;

  return {
    inspectionWait: `검사 대기 ${counts.inspectionWait}건`,
    inspectionDone: `검사 진행 ${counts.inspectionInProgress}건`,
    certificateWait: `발행 대기 ${counts.certNotIssued}건`,
    certificateDone: `발행 완료 ${counts.certIssued}건`,
    defectToday: `금일 불량 ${ncr.counts.todayDefect ?? ncr.counts.defectToday ?? 0}건`,
    documentStandards: "도면 · 절차 · 공차",
    documentQuality: "품질문서 · Revision",
    qualityJournalToday: `금일 작성 ${counts.qualityJournalToday}건`,
  };
}
