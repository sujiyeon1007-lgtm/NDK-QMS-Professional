/**
 * DOC-01 — 열처리 작업 요청 리스트 출력 대상 · 상태
 */

import { isIncomingRegistered } from "./productionRecords";
import { getWorkflowStatus, WORKFLOW_STATUS } from "./titanWorkflowStatus";

export const HTL_PRINT_STATUS = {
  NOT_PRINTED: "미출력",
  PRINTED: "출력완료",
};

/** 입고완료 + 열처리(생산) 미진행 — LOT·생산일보 등록 전 */
export function isHeatTreatmentNotStarted(record) {
  if (!record) return false;
  if (record.registered && record.lotNo?.trim()) return false;

  const status = getWorkflowStatus(record);
  if (
    status === WORKFLOW_STATUS.PROD_PROGRESS ||
    status === WORKFLOW_STATUS.PROD_DONE ||
    status === WORKFLOW_STATUS.INSPECT_DONE ||
    status === WORKFLOW_STATUS.CERT_DONE ||
    status === WORKFLOW_STATUS.SHIP_DONE
  ) {
    return false;
  }

  return true;
}

export function getHtlPrintStatus(record) {
  if (record?.htlPrintStatus === HTL_PRINT_STATUS.PRINTED || record?.workSheetGenerated) {
    return HTL_PRINT_STATUS.PRINTED;
  }
  return HTL_PRINT_STATUS.NOT_PRINTED;
}

/** Sprint 3 — 첫 출력 대상 (미출력만) */
export function isHtlFirstPrintTarget(record) {
  if (!isIncomingRegistered(record)) return false;
  if (!isHeatTreatmentNotStarted(record)) return false;
  return getHtlPrintStatus(record) === HTL_PRINT_STATUS.NOT_PRINTED;
}

/** 재출력 가능 (이미 출력완료 + 열처리 미완료) */
export function isHtlReprintTarget(record) {
  if (!isIncomingRegistered(record)) return false;
  if (!isHeatTreatmentNotStarted(record)) return false;
  return getHtlPrintStatus(record) === HTL_PRINT_STATUS.PRINTED;
}

/**
 * @param {object[]} rows — list rows with `.record`
 */
export function filterHtlFirstPrintRows(rows = []) {
  return rows.filter((row) => isHtlFirstPrintTarget(row.record ?? row));
}

/**
 * @param {object | object[]} rowOrRows
 */
export function resolveHtlPrintRows(rowOrRows) {
  const rows = Array.isArray(rowOrRows) ? rowOrRows : rowOrRows ? [rowOrRows] : [];
  const firstPrint = filterHtlFirstPrintRows(rows);
  if (firstPrint.length > 0) return { rows: firstPrint, mode: "first" };
  const reprint = rows.filter((row) => isHtlReprintTarget(row.record ?? row));
  if (reprint.length > 0) return { rows: reprint, mode: "reprint" };
  const presentation = rows.filter((row) => isIncomingRegistered(row.record ?? row));
  if (presentation.length > 0) return { rows: presentation, mode: "presentation" };
  if (rows.length > 0) return { rows, mode: "presentation" };
  return { rows: [], mode: "none" };
}
