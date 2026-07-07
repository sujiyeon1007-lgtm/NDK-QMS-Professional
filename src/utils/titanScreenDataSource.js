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
  filterProductionDailyReportRecords,
  getProductionDailyReportStatusLabel,
} from "./productionDailyReportStatus";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";

/** @typedef {Record<string, number>} StatusChipCounts */

export function getInboundScreenData(records = getSessionProductionRecords()) {
  const source = records.length ? records : getSessionProductionRecords();
  const taskRecords = buildIncomingTaskWorkspaceRecords(source);

  return {
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
}

export function getProductionScreenData(records = getSessionProductionRecords()) {
  const source = records?.length ? records : getSessionProductionRecords();
  const baseRecords = filterProductionDailyReportRecords(source);
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

export function getOutboundScreenData(records = getSessionProductionRecords()) {
  const source = records.length ? records : getSessionProductionRecords();
  const taskRecords = buildOutgoingTaskWorkspaceRecords(source);
  const completedRecords = buildOutgoingCompletedWorkspaceRecords(source);

  return {
    baseRecords: taskRecords,
    counts: {
      shipNotDone: taskRecords.length,
      shipDone: completedRecords.length,
    },
  };
}

export { getHomeScreenData } from "./homeDashboardData";

export function getMassInspectionBaseRows() {
  return getInspectionMassScreenData().baseRecords;
}

export function getProductionBaseRecords(records = getSessionProductionRecords()) {
  const source = records?.length ? records : getSessionProductionRecords();
  return filterProductionDailyReportRecords(source);
}

export { getProductionDailyReportStatusLabel };
