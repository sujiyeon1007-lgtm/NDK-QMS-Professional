/**
 * Project TITAN V1.4 — Screen data source (KPI · List · Popup sync)
 */

import { getCertificateMenuListRows } from "./certificateStatus";
import {
  CERTIFICATE_MANAGEMENT_STATUS,
  getCertificateManagementStatus,
} from "./workflowProcessStatus";
import {
  filterInboundManagementRecords,
  getInboundManagementStatus,
  INBOUND_STATUS_LABELS,
  isInboundShipOutComplete,
} from "./inboundManagementStatus";
import { isHtlFirstPrintTarget } from "./htlPrintEligibility";
import { MENU_TASK_STATUS } from "./menuWorkflowGate";
import { getMassProductionInspectionRows } from "./massProductionInspection";
import {
  filterOutboundCompletedRecords,
  filterOutboundManagementRecords,
  getOutboundManagementStatus,
  OUTBOUND_STATUS_LABELS,
} from "./outboundManagementStatus";
import {
  countProductionChipBucket,
  filterProductionDailyReportRecords,
  getProductionDailyReportStatusLabel,
} from "./productionDailyReportStatus";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { getHomeScreenData } from "./homeDashboardData";

/** @typedef {Record<string, number>} StatusChipCounts */

export function getInboundScreenData(records = getSessionProductionRecords()) {
  const session = getSessionProductionRecords();
  const baseRecords = filterInboundManagementRecords(records.length ? records : session);
  const statusOf = (record) => getInboundManagementStatus(record)?.label;

  return {
    baseRecords,
    counts: {
      productIncomingReg: baseRecords.length,
      productHtlNotPrinted: baseRecords.filter(
        (record) => isIncomingRegistered(record) && isHtlFirstPrintTarget(record)
      ).length,
      productShipWait: baseRecords.filter(
        (record) => statusOf(record) === INBOUND_STATUS_LABELS.PRODUCT_SHIP_WAIT
      ).length,
      productShipDone: session.filter((record) => isInboundShipOutComplete(record)).length,
    },
  };
}

export function getProductionScreenData(records = getSessionProductionRecords()) {
  const baseRecords = filterProductionDailyReportRecords(records);

  return {
    baseRecords,
    counts: {
      prodProgress: countProductionChipBucket(baseRecords, "prodProgress"),
      prodDone: countProductionChipBucket(baseRecords, "prodDone"),
    },
  };
}

function isMassInspectionRow(record) {
  return Boolean(record?.rowKey != null || record?.inspectionStatus != null);
}

/**
 * @param {object[]} [records] — mass inspection rows
 * @returns {{ baseRecords: object[], counts: StatusChipCounts }}
 */
export function getInspectionScreenData(records) {
  const baseRecords =
    records?.length && isMassInspectionRow(records[0])
      ? records
      : getMassProductionInspectionRows();

  return {
    baseRecords,
    counts: {
      inspectNotDone: baseRecords.filter(
        (row) => row.statusLabel === MENU_TASK_STATUS.INSPECT_NOT_DONE
      ).length,
      inspectDone: baseRecords.filter(
        (row) => row.statusLabel === MENU_TASK_STATUS.INSPECT_DONE
      ).length,
    },
  };
}

/**
 * @param {object[]} [rows] — certificate list rows
 * @returns {{ baseRecords: object[], counts: StatusChipCounts }}
 */
export function getCertificateScreenData(rows) {
  const baseRecords = rows?.length ? rows : getCertificateMenuListRows();
  const statusOf = (row) => row.statusLabel ?? getCertificateManagementStatus(row.entry)?.label;

  return {
    baseRecords,
    counts: {
      certNotIssued: baseRecords.filter(
        (row) => statusOf(row) === CERTIFICATE_MANAGEMENT_STATUS.WAIT
      ).length,
      certIssued: baseRecords.filter(
        (row) => statusOf(row) === CERTIFICATE_MANAGEMENT_STATUS.DONE
      ).length,
    },
  };
}

export function getOutboundScreenData(records = getSessionProductionRecords()) {
  const session = getSessionProductionRecords();
  const baseRecords = filterOutboundManagementRecords(records.length ? records : session);
  const statusOf = (record) => getOutboundManagementStatus(record)?.label;

  return {
    baseRecords,
    counts: {
      shipNotDone: baseRecords.filter(
        (record) => statusOf(record) === OUTBOUND_STATUS_LABELS.NOT_DONE
      ).length,
      shipDone: filterOutboundCompletedRecords(session).length,
    },
  };
}

export { getHomeScreenData } from "./homeDashboardData";

export function getMassInspectionBaseRows() {
  return getMassProductionInspectionRows();
}

export function getProductionBaseRecords(records = getSessionProductionRecords()) {
  return filterProductionDailyReportRecords(records);
}

export { getProductionDailyReportStatusLabel };
