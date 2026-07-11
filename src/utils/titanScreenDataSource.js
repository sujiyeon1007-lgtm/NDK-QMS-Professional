/**
 * Project TITAN V1.4 — Screen data source (KPI · List · Popup sync)
 */

import { isHtlFirstPrintTarget } from "./htlPrintEligibility";
import { MENU_TASK_STATUS } from "./menuWorkflowGate";
import {
  buildIncomingTaskWorkspaceRecords,
  buildOutgoingCompletedWorkspaceRecords,
  buildOutgoingTaskWorkspaceRecords,
} from "./operationsWorkspaceData";
import {
  countCertificateWorkspace,
  getCertificateWorkspaceScreenData,
  getInspectionMassScreenData,
} from "./qualityWorkspaceData";
import {
  countProductionChipBucket,
  getProductionDailyReportStatusLabel,
} from "./productionDailyReportStatus";
import { buildProductionDailyReportWorkspaceRecords } from "./productionWorkspaceData";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { registerWorkflowScreenCacheInvalidator } from "./titanWorkflowRefresh";

/** @typedef {Record<string, number>} StatusChipCounts */

let inboundScreenSnapshot = null;
let inboundScreenCache = null;
let outboundScreenSnapshot = null;
let outboundScreenCache = null;
let productionScreenSnapshot = null;
let productionScreenCache = null;

export function invalidateTitanScreenDataSourceCache() {
  inboundScreenSnapshot = null;
  inboundScreenCache = null;
  outboundScreenSnapshot = null;
  outboundScreenCache = null;
  productionScreenSnapshot = null;
  productionScreenCache = null;
}

export function getInboundScreenData(records) {
  const snapshot = records ?? getSessionProductionRecords();
  if (!records && inboundScreenSnapshot === snapshot && inboundScreenCache) {
    return inboundScreenCache;
  }

  const source = snapshot.length ? snapshot : getSessionProductionRecords();
  const taskRecords = buildIncomingTaskWorkspaceRecords(source);

  const result = {
    baseRecords: taskRecords,
    counts: {
      productIncomingReg: taskRecords.length,
      productHtlNotPrinted: taskRecords.filter(
        (record) => isIncomingRegistered(record) && isHtlFirstPrintTarget(record)
      ).length,
      productShipWait: 0,
      productShipDone: 0,
    },
  };

  if (!records) {
    inboundScreenSnapshot = snapshot;
    inboundScreenCache = result;
  }
  return result;
}

export function getProductionScreenData(records) {
  const snapshot = records ?? getSessionProductionRecords();
  if (!records && productionScreenSnapshot === snapshot && productionScreenCache) {
    return productionScreenCache;
  }

  const source = snapshot?.length ? snapshot : getSessionProductionRecords();
  const baseRecords = buildProductionDailyReportWorkspaceRecords(source);
  const result = {
    baseRecords,
    counts: {
      prodProgress: countProductionChipBucket(baseRecords, "prodProgress"),
      prodDone: countProductionChipBucket(baseRecords, "prodDone"),
    },
  };

  if (!records) {
    productionScreenSnapshot = snapshot;
    productionScreenCache = result;
  }
  return result;
}

function isMassInspectionRow(record) {
  return Boolean(record?.rowKey != null || record?.inspectionStatus != null);
}

/**
 * @param {object[]} [records] — mass inspection rows
 * @returns {{ baseRecords: object[], counts: StatusChipCounts }}
 */
export function getInspectionScreenData(records) {
  if (records?.length && isMassInspectionRow(records[0])) {
    return {
      baseRecords: records,
      counts: {
        inspectNotDone: records.filter(
          (row) => row.statusLabel === MENU_TASK_STATUS.INSPECT_NOT_DONE
        ).length,
        inspectDone: records.filter(
          (row) => row.statusLabel === MENU_TASK_STATUS.INSPECT_DONE
        ).length,
      },
    };
  }
  return getInspectionMassScreenData();
}

/**
 * @param {object[]} [rows] — certificate list rows
 * @returns {{ baseRecords: object[], counts: StatusChipCounts }}
 */
export function getCertificateScreenData(rows) {
  if (rows?.length) {
    return {
      baseRecords: rows,
      counts: countCertificateWorkspace(rows),
    };
  }
  return getCertificateWorkspaceScreenData();
}

export function getOutboundScreenData(records) {
  const snapshot = records ?? getSessionProductionRecords();
  if (!records && outboundScreenSnapshot === snapshot && outboundScreenCache) {
    return outboundScreenCache;
  }

  const source = snapshot.length ? snapshot : getSessionProductionRecords();
  const taskRecords = buildOutgoingTaskWorkspaceRecords(source);
  const completedRecords = buildOutgoingCompletedWorkspaceRecords(source);

  const result = {
    baseRecords: taskRecords,
    counts: {
      shipNotDone: taskRecords.length,
      shipDone: completedRecords.length,
    },
  };

  if (!records) {
    outboundScreenSnapshot = snapshot;
    outboundScreenCache = result;
  }
  return result;
}

export { getHomeScreenData } from "./homeDashboardData";

export function getMassInspectionBaseRows() {
  return getInspectionMassScreenData().baseRecords;
}

export function getProductionBaseRecords(records = getSessionProductionRecords()) {
  const source = records?.length ? records : getSessionProductionRecords();
  return buildProductionDailyReportWorkspaceRecords(source);
}

export { getProductionDailyReportStatusLabel };

registerWorkflowScreenCacheInvalidator(invalidateTitanScreenDataSourceCache);
