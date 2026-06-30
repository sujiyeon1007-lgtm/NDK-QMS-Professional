import { formatQtyWithUnit } from "./productUnits";
import {
  computePrintColumnWidths,
  paginateRowsByLayout,
  PRINT_ORIENTATION,
  resolvePrintOrientation,
} from "./titanPrintLayout";
import { getProductionDailyReportApprovalStatus } from "./productionDailyReportStatus";
import { getProductionProcessName } from "../config/productionProcessCodes";

export const PRODUCTION_DAILY_PRINT_TITLE = "생산일보";

function formatNote(row) {
  const note = row.note?.trim();
  if (!note || note === "-") return "";
  return note;
}

/** @param {object} row */
export function mapRecordToProductionDailyPrintRow(row, index) {
  const record = row.record ?? row;
  return {
    no: index + 1,
    managementId: record.id ?? row.managementId ?? "",
    company: row.company ?? record.company ?? "",
    partName: row.partName ?? record.partName ?? "",
    partNo: row.partNo ?? record.partNo ?? "",
    lotNo: row.lotNo ?? record.lotNo ?? "",
    process: getProductionProcessName(record),
    equipment: record.equipment ?? "—",
    worker: record.registrar ?? record.worker ?? "관리자",
    workDate: record.workDate || record.dueDate || "—",
    qty: Number(record.qty) || 0,
    unit: record.unit ?? "EA",
    approval: getProductionDailyReportApprovalStatus(record),
    note: record.note ?? "",
  };
}

export function mapRowsToProductionDailyPrintRows(rows = []) {
  return rows.map((row, index) => mapRecordToProductionDailyPrintRow(row, index));
}

export function buildProductionDailyPrintColumns() {
  return [
    {
      id: "no",
      header: "No.",
      baseRatio: 4,
      narrow: true,
      singleLine: true,
      align: "center",
      getValue: (row) => String(row.no),
    },
    {
      id: "managementId",
      header: "관리번호",
      baseRatio: 11,
      singleLine: true,
      align: "left",
      getValue: (row) => row.managementId ?? "",
    },
    {
      id: "company",
      header: "업체명",
      baseRatio: 10,
      singleLine: true,
      align: "left",
      getValue: (row) => row.company ?? "",
    },
    {
      id: "partName",
      header: "품명",
      baseRatio: 12,
      wrapMaxLines: 2,
      align: "left",
      getValue: (row) => row.partName ?? "",
    },
    {
      id: "partNo",
      header: "품번",
      baseRatio: 10,
      singleLine: true,
      align: "left",
      getValue: (row) => row.partNo ?? "",
    },
    {
      id: "lotNo",
      header: "LOT No.",
      baseRatio: 10,
      singleLine: true,
      align: "center",
      getValue: (row) => row.lotNo ?? "",
    },
    {
      id: "process",
      header: "공정",
      baseRatio: 8,
      singleLine: true,
      align: "center",
      getValue: (row) => row.process ?? "",
    },
    {
      id: "equipment",
      header: "설비",
      baseRatio: 7,
      singleLine: true,
      align: "center",
      getValue: (row) => row.equipment ?? "",
    },
    {
      id: "worker",
      header: "작업자",
      baseRatio: 7,
      singleLine: true,
      align: "center",
      getValue: (row) => row.worker ?? "",
    },
    {
      id: "workDate",
      header: "작업일",
      baseRatio: 8,
      singleLine: true,
      align: "center",
      getValue: (row) => row.workDate ?? "",
    },
    {
      id: "qty",
      header: "수량",
      baseRatio: 7,
      singleLine: true,
      align: "center",
      getValue: (row) => formatQtyWithUnit(row.qty, row.unit),
    },
    {
      id: "approval",
      header: "승인",
      baseRatio: 6,
      singleLine: true,
      align: "center",
      getValue: (row) => row.approval ?? "",
    },
    {
      id: "note",
      header: "비고",
      baseRatio: 8,
      singleLine: true,
      align: "left",
      getValue: (row) => formatNote(row),
    },
  ];
}

export function buildProductionDailyPrintLayout(rows, options = {}) {
  const columns = buildProductionDailyPrintColumns();
  const columnWidths = computePrintColumnWidths(columns, rows);
  const orientation = resolvePrintOrientation(columns, rows, columnWidths);

  const trimmedMemo = options.reportMemo?.trim() ?? "";
  let lastPageReserve = 3;
  if (trimmedMemo) lastPageReserve += 4;

  const rowLineBudget = {
    lineBudget: orientation === PRINT_ORIENTATION.LANDSCAPE ? 8 : 12,
    lastPageReserve,
  };
  const pages = paginateRowsByLayout(rows, columns, columnWidths, orientation, rowLineBudget);

  return {
    columns,
    columnWidths,
    orientation,
    pages,
  };
}
