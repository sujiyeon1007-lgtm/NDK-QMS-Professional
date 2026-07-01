/**
 * Project TITAN V1.0 — Status Chip Count Resolvers
 *
 * V1: Mock / SessionStorage records 기반
 * V2: SQLite · API 실시간 count (동일 resolver 시그니처 유지)
 */

import { CERTIFICATE_STATUS, SHIPMENT_STATUS } from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { isIncomingRegistered, getSessionProductionRecords } from "./productionRecords";
import { hasInspectionLogForManagementId, getInspectionLogs } from "./inspectionLogSession";
import { getWorkflowStatus, WORKFLOW_STATUS } from "./titanWorkflowStatus";
import {
  filterInboundManagementRecords,
  getInboundManagementStatus,
  INBOUND_STATUS_LABELS,
  isInboundShipOutComplete,
} from "./inboundManagementStatus";
import { buildTodayWorkSummary } from "./homeDashboardData";

/**
 * @typedef {Record<string, number>} StatusChipCounts
 */

/** @type {Record<string, (records: object[]) => StatusChipCounts>} */
export const STATUS_CHIP_COUNT_RESOLVERS = {
  home: resolveHomeStatusChipCounts,
  inbound: resolveInboundStatusChipCounts,
  production: resolveProductionStatusChipCounts,
  inspection: resolveInspectionStatusChipCounts,
  certificate: resolveCertificateStatusChipCounts,
  outbound: resolveOutboundStatusChipCounts,
  statistics: resolveHomeStatusChipCounts,
};

/**
 * @param {string} chipSetId
 * @param {object[]} [records]
 * @returns {StatusChipCounts}
 */
export function computeStatusChipCounts(chipSetId, records = getSessionProductionRecords()) {
  const resolver = STATUS_CHIP_COUNT_RESOLVERS[chipSetId];
  if (!resolver) return {};
  return resolver(records);
}

/** HOME · 통계 — 금일 업무 요약 count */
export function resolveHomeStatusChipCounts(records) {
  const items = buildTodayWorkSummary(records);
  return Object.fromEntries(items.map((item) => [item.id, item.value]));
}

export function resolveInboundStatusChipCounts(records) {
  const visible = filterInboundManagementRecords(records);
  const statusOf = (record) => getInboundManagementStatus(record)?.label;

  return {
    productIncomingReg: visible.length,
    productShipWait: visible.filter((r) => statusOf(r) === INBOUND_STATUS_LABELS.SHIP_WAIT).length,
    productShipDone: records.filter((r) => isInboundShipOutComplete(r)).length,
  };
}

export function resolveProductionStatusChipCounts(records) {
  const active = records.filter((r) => isIncomingRegistered(r));
  return {
    prodProgress: active.filter((r) => getWorkflowStatus(r) === WORKFLOW_STATUS.PROD_PROGRESS).length,
    prodWait: active.filter((r) => getWorkflowStatus(r) === WORKFLOW_STATUS.WORK_WAIT).length,
    prodDone: active.filter((r) => getWorkflowStatus(r) === WORKFLOW_STATUS.PROD_DONE).length,
  };
}

export function resolveInspectionStatusChipCounts(records) {
  const logs = getInspectionLogs();
  return {
    inspectWait: records.filter(
      (r) => r.registered && r.lotNo?.trim() && !hasInspectionLogForManagementId(r.id)
    ).length,
    inspectProgress: logs.filter((log) => log.status === "검사중" || log.progress === "진행중").length,
    pass: logs.filter((log) => log.judgment === "합격").length,
    fail: logs.filter((log) => log.judgment === "불합격").length,
    reinspect: logs.filter((log) => log.reinspect === true || log.status === "재검사").length,
  };
}

export function resolveCertificateStatusChipCounts(records) {
  const active = records.filter((r) => isIncomingRegistered(r));
  return {
    certWait: active.filter((r) => r.certificateStatus === CERTIFICATE_STATUS.PENDING).length,
    certDone: active.filter((r) => r.certificateStatus === CERTIFICATE_STATUS.ISSUED).length,
  };
}

export function resolveOutboundStatusChipCounts(records) {
  const active = records.filter((r) => isIncomingRegistered(r) && getStockQty(r) > 0);
  return {
    productShipWait: active.filter((r) => r.shipmentStatus !== SHIPMENT_STATUS.DONE).length,
    productShipDone: records.filter((r) => r.shipmentStatus === SHIPMENT_STATUS.DONE).length,
  };
}
