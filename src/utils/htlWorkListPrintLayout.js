import {
  buildListPrintPaginationOptions,
  TITAN_LIST_PRINT_ORIENTATION,
} from "../config/titanListPrintStandard";
import { formatQtyWithUnit } from "./productUnits";
import { computePrintColumnWidths, paginateRowsByLayout } from "./titanPrintLayout";

/** DOC-01 PM Official — 입고 리스트 (A4 Landscape) */
export const HTL_PRINT_TITLE = "입고 리스트";

/** Project TITAN 입고 리스트 출력 컬럼 (DOC-01 PM Final) */
export function buildHtlPrintColumns() {
  return [
    {
      id: "no",
      header: "No",
      baseRatio: 3,
      narrow: true,
      singleLine: true,
      align: "center",
      getValue: (row) => String(row.no),
    },
    {
      id: "company",
      header: "업체명",
      baseRatio: 11,
      wrap: true,
      align: "left",
      getValue: (row) => row.company ?? "",
    },
    {
      id: "partName",
      header: "품명",
      baseRatio: 12,
      wrap: true,
      align: "left",
      getValue: (row) => row.partName ?? "",
    },
    {
      id: "partNo",
      header: "품번",
      baseRatio: 11,
      wrap: true,
      align: "left",
      getValue: (row) => row.partNo ?? "",
    },
    {
      id: "material",
      header: "재질",
      baseRatio: 7,
      wrap: true,
      align: "center",
      getValue: (row) => row.material ?? "",
    },
    {
      id: "stockQty",
      header: "입고수량",
      baseRatio: 8,
      singleLine: true,
      align: "right",
      getValue: (row) => formatQtyWithUnit(row.qty, row.unit || "EA"),
    },
    {
      id: "incomingDate",
      header: "입고일",
      baseRatio: 8,
      singleLine: true,
      align: "center",
      getValue: (row) => row.incomingDate ?? "",
    },
    {
      id: "lot",
      header: "LOT No.",
      baseRatio: 9,
      singleLine: true,
      align: "center",
      getValue: (row) => row.lotNo ?? "",
    },
    {
      id: "note",
      header: "비고",
      baseRatio: 18,
      wrap: true,
      align: "left",
      getValue: (row) => row.note ?? "",
    },
  ];
}

export function buildHtlPrintLayout(rows, _workDate = "", options = {}) {
  const columns = buildHtlPrintColumns();
  const columnWidths = computePrintColumnWidths(columns, rows);
  const orientation = TITAN_LIST_PRINT_ORIENTATION;
  const pages = paginateRowsByLayout(
    rows,
    columns,
    columnWidths,
    orientation,
    buildListPrintPaginationOptions({
      workMemo: options.workMemo,
      getGroupKey: (row) => row.managementId ?? row.id ?? "",
    })
  );

  return {
    columns,
    columnWidths,
    orientation,
    pages,
  };
}
