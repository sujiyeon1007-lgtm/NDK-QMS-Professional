import { getAuthSession } from "../../utils/titanAuthSession";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import {
  getSessionProductionRecords,
  isIncomingRegistered,
  updateSessionProductionRecord,
} from "../../utils/productionRecords";
import { getHtlPrintStatus, HTL_PRINT_STATUS } from "../../utils/htlPrintEligibility";
import { WORKFLOW_STATUS } from "../../utils/titanWorkflowStatus";
import { INBOUND_STATUS_LABELS, getInboundManagementStatus } from "../../utils/inboundManagementStatus";

export const INBOUND_PRINT_NO_SELECTION_MESSAGE = "출력할 제품을 선택해 주세요.";
export const INBOUND_REPRINT_CONFIRM_MESSAGE =
  "이미 LOT번호가 생성되어 있습니다.\n\n입고리스트를 다시 출력하시겠습니까?";

export function hasInboundCheckboxSelection(selectedIds = []) {
  return Array.isArray(selectedIds) && selectedIds.length > 0;
}

/** 체크된 행만 · 리스트 순서(선택 순서 아님) */
export function resolveInboundCheckboxPrintRows(selectedIds = [], rows = []) {
  if (!hasInboundCheckboxSelection(selectedIds)) return [];
  const idSet = new Set(selectedIds);
  return rows.filter((row) => idSet.has(row.id) && isIncomingRegistered(row.record ?? row));
}

export function inboundRowHasLotNumber(row) {
  const record = row?.record ?? row;
  return Boolean(String(record?.lotNo ?? "").trim());
}

export function selectedInboundRowsHaveLotNumber(printRows = []) {
  return printRows.some(inboundRowHasLotNumber);
}

export function confirmInboundListReprint() {
  return window.confirm(INBOUND_REPRINT_CONFIRM_MESSAGE);
}

export function isInboundListAlreadyPrinted(record) {
  if (!record) return false;
  const statusLabel = getInboundManagementStatus(record)?.label;
  if (statusLabel === INBOUND_STATUS_LABELS.PRODUCT_SHIP_WAIT) return true;
  if (getHtlPrintStatus(record) === HTL_PRINT_STATUS.PRINTED) return true;
  return Boolean(record.workSheetGenerated || record.inboundListPrintCount > 0);
}

function resolveInboundPrintUserName() {
  return getAuthSession()?.name?.trim() || getPrintUser();
}

/**
 * 입고리스트 출력 완료 — 행별 첫 출력/재출력 분기 · 출력 이력 저장
 * @param {object[]} printRows — printProps.rows (managementId 포함)
 * @param {string} listNo
 */
export function applyInboundListPrinted(printRows = [], listNo = "") {
  const trimmedListNo = listNo?.trim();
  if (!trimmedListNo || !printRows.length) return;

  const now = new Date();
  const nowIso = now.toISOString();
  const printDateTime = getPrintDateTime(now);
  const printedBy = resolveInboundPrintUserName();

  printRows.forEach((printRow) => {
    const id = String(printRow.managementId ?? printRow.id ?? "").trim();
    if (!id) return;

    const record = getSessionProductionRecords().find((item) => item.id === id);
    if (!record) return;

    const wasPrinted = isInboundListAlreadyPrinted(record);
    const history = Array.isArray(record.inboundListPrintHistory)
      ? [...record.inboundListPrintHistory]
      : Array.isArray(record.htlPrintHistory)
        ? [...record.htlPrintHistory]
        : [];

    const printCount = (record.inboundListPrintCount ?? history.length) + 1;

    history.push({
      at: nowIso,
      printDateTime,
      printedBy,
      docNo: trimmedListNo,
      reprint: wasPrinted,
      printCount,
    });

    const patch = {
      htlNo: trimmedListNo,
      workSheetGenerated: true,
      htlPrintedAt: nowIso,
      htlPrintStatus: "출력완료",
      htlPrintHistory: history,
      inboundListPrintHistory: history,
      inboundListPrintCount: printCount,
      inboundListLastPrintedAt: nowIso,
      inboundListLastPrintDateTime: printDateTime,
      inboundListLastPrintedBy: printedBy,
    };

    if (!wasPrinted) {
      patch.workflowStatus = WORKFLOW_STATUS.PROD_PROGRESS;
      patch.completionStatus = "작업중";
    }

    updateSessionProductionRecord(id, patch);
  });
}

export function resolveInboundPrintMode(printRows = []) {
  const records = printRows.map((row) => row.record ?? row);
  if (records.length === 0) return "none";
  if (records.every(isInboundListAlreadyPrinted)) return "reprint";
  if (records.some(isInboundListAlreadyPrinted)) return "mixed";
  return "first";
}
