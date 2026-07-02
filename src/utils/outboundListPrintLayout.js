import {
  buildListPrintPaginationOptions,
  TITAN_LIST_PRINT_ORIENTATION,
} from "../config/titanListPrintStandard";
import { formatQtyWithUnit } from "./productUnits";
import { computePrintColumnWidths, paginateRowsByLayout } from "./titanPrintLayout";

/** 저장된 비고만 출력 — 자동 생성·임시값·대시(-) 금지 */
function formatNote(row) {
  const note = row.note?.trim();
  if (!note || note === "-") return "";
  return note;
}

export const OUTBOUND_PRINT_TITLE = "출고 리스트";

/** Project TITAN 출고 리스트 — DOC-01 Layout Master · 컬럼만 출고 전용 */
export function buildOutboundPrintColumns(shipDate = "") {
  return [
    {
      id: "no",
      header: "No.",
      baseRatio: 5,
      narrow: true,
      singleLine: true,
      align: "center",
      getValue: (row) => String(row.no),
    },
    {
      id: "company",
      header: "업체명",
      baseRatio: 14,
      wrap: true,
      align: "left",
      getValue: (row) => row.company ?? "",
    },
    {
      id: "partName",
      header: "품명",
      baseRatio: 18,
      wrap: true,
      align: "left",
      getValue: (row) => row.partName ?? "",
    },
    {
      id: "partNo",
      header: "품번",
      baseRatio: 14,
      wrap: true,
      align: "left",
      getValue: (row) => row.partNo ?? "",
    },
    {
      id: "material",
      header: "재질",
      baseRatio: 9,
      wrap: true,
      align: "center",
      getValue: (row) => row.material ?? "",
    },
    {
      id: "qty",
      header: "출고수량",
      baseRatio: 9,
      singleLine: true,
      align: "center",
      getValue: (row) => formatQtyWithUnit(row.qty, row.unit),
    },
    {
      id: "shipDate",
      header: "출고일",
      baseRatio: 10,
      singleLine: true,
      align: "center",
      getValue: () => shipDate?.trim() || "",
    },
    {
      id: "lot",
      header: "LOT No.",
      baseRatio: 14,
      singleLine: true,
      align: "center",
      getValue: (row) => row.lotNo?.trim() || "",
    },
    {
      id: "note",
      header: "비고",
      baseRatio: 11,
      wrap: true,
      align: "left",
      getValue: (row) => formatNote(row),
    },
  ];
}

export function buildOutboundPrintLayout(rows, shipDate = "", options = {}) {
  const columns = buildOutboundPrintColumns(shipDate);
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
