import {
  buildListPrintPaginationOptions,
  TITAN_LIST_PRINT_ORIENTATION,
} from "../config/titanListPrintStandard";
import { formatQtyWithUnit } from "./productUnits";
import { computePrintColumnWidths, paginateRowsByLayout } from "./titanPrintLayout";

/** DOC-01 PM Official — 열처리 작업 요청 리스트 (A4 Landscape) */
export const HTL_PRINT_TITLE = "열처리 작업 요청 리스트";

/** Project TITAN HTL 출력 컬럼 (DOC-01 PM Final) */
export function buildHtlPrintColumns() {
  return [
    {
      id: "check",
      header: "□",
      baseRatio: 3,
      narrow: true,
      checkbox: true,
      handwriting: true,
      singleLine: true,
      align: "center",
      getValue: () => "",
    },
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
      header: "실재고(EA)",
      baseRatio: 7,
      singleLine: true,
      align: "right",
      getValue: (row) => formatQtyWithUnit(row.qty, row.unit || "EA"),
    },
    {
      id: "workQty",
      header: "작업수량(EA)",
      baseRatio: 7,
      handwriting: true,
      singleLine: true,
      align: "center",
      getValue: () => "",
    },
    {
      id: "workDate",
      header: "작업일",
      baseRatio: 7,
      handwriting: true,
      singleLine: true,
      align: "center",
      getValue: () => "",
    },
    {
      id: "lot",
      header: "LOT No.",
      baseRatio: 9,
      handwriting: true,
      singleLine: true,
      align: "center",
      getValue: () => "",
    },
    {
      id: "note",
      header: "비고",
      baseRatio: 14,
      handwriting: true,
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
