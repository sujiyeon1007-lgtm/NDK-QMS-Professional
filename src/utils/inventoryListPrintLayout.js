import {
  buildListPrintPaginationOptions,
  TITAN_LIST_PRINT_ORIENTATION,
} from "../config/titanListPrintStandard";
import { INVENTORY_PRINT } from "../config/inventoryManagementPolicy";
import { formatQtyWithUnit } from "./productUnits";
import { computePrintColumnWidths, paginateRowsByLayout } from "./titanPrintLayout";

export const INVENTORY_PRINT_TITLE = INVENTORY_PRINT.title;

function buildPrintColumns(viewMode = "byItem") {
  const baseNo = {
    id: "no",
    header: "No.",
    baseRatio: 5,
    narrow: true,
    singleLine: true,
    align: "center",
    getValue: (row) => String(row.no),
  };

  if (viewMode === "byLot") {
    return [
      baseNo,
      { id: "managementId", header: "관리번호", baseRatio: 12, wrap: true, getValue: (r) => r.managementId ?? "" },
      { id: "lotNo", header: "LOT No.", baseRatio: 10, wrap: true, getValue: (r) => r.lotNo ?? "" },
      { id: "company", header: "업체명", baseRatio: 12, wrap: true, getValue: (r) => r.company ?? "" },
      { id: "partName", header: "품명", baseRatio: 14, wrap: true, getValue: (r) => r.partName ?? "" },
      { id: "partNo", header: "품번", baseRatio: 12, wrap: true, getValue: (r) => r.partNo ?? "" },
      {
        id: "stock",
        header: "실재고",
        baseRatio: 8,
        singleLine: true,
        align: "center",
        getValue: (r) => formatQtyWithUnit(r.currentStock, r.unit),
      },
      { id: "status", header: "상태", baseRatio: 8, singleLine: true, align: "center", getValue: (r) => r.statusLabel ?? "" },
    ];
  }

  if (viewMode === "byCompany") {
    return [
      baseNo,
      {
        id: "incomingDate",
        header: "입고일",
        baseRatio: 9,
        singleLine: true,
        align: "center",
        getValue: (r) => r.incomingDateLabel ?? r.lastIncomingDateLabel ?? "",
      },
      { id: "company", header: "업체명", baseRatio: 16, wrap: true, getValue: (r) => r.company ?? "" },
      { id: "sku", header: "품목수", baseRatio: 8, singleLine: true, align: "center", getValue: (r) => r.skuCountLabel ?? "" },
      { id: "lots", header: "LOT수", baseRatio: 8, singleLine: true, align: "center", getValue: (r) => r.lotCountLabel ?? "" },
      {
        id: "inbound",
        header: "입고수량",
        baseRatio: 10,
        singleLine: true,
        align: "center",
        getValue: (r) => r.inboundQtyLabel ?? "",
      },
      {
        id: "stock",
        header: "실재고",
        baseRatio: 10,
        singleLine: true,
        align: "center",
        getValue: (r) => r.currentStockLabel ?? "",
      },
      { id: "status", header: "상태", baseRatio: 8, singleLine: true, align: "center", getValue: (r) => r.statusLabel ?? "" },
    ];
  }

  return [
    baseNo,
    {
      id: "incomingDate",
      header: "입고일",
      baseRatio: 9,
      singleLine: true,
      align: "center",
      getValue: (r) => r.incomingDateLabel ?? r.lastIncomingDateLabel ?? "",
    },
    { id: "company", header: "업체명", baseRatio: 11, wrap: true, getValue: (r) => r.company ?? "" },
    { id: "partName", header: "품명", baseRatio: 16, wrap: true, getValue: (r) => r.partName ?? "" },
    { id: "partNo", header: "품번", baseRatio: 12, wrap: true, getValue: (r) => r.partNo ?? "" },
    { id: "material", header: "재질", baseRatio: 8, wrap: true, align: "center", getValue: (r) => r.material ?? "" },
    {
      id: "stock",
      header: "실재고",
      baseRatio: 9,
      singleLine: true,
      align: "center",
      getValue: (r) => r.currentStockLabel ?? formatQtyWithUnit(r.currentStock, r.unit),
    },
    {
      id: "inbound",
      header: "입고수량",
      baseRatio: 9,
      singleLine: true,
      align: "center",
      getValue: (r) => r.inboundQtyLabel ?? "",
    },
    {
      id: "shipped",
      header: "출고수량",
      baseRatio: 9,
      singleLine: true,
      align: "center",
      getValue: (r) => r.shippedQtyLabel ?? "",
    },
    { id: "status", header: "상태", baseRatio: 8, singleLine: true, align: "center", getValue: (r) => r.statusLabel ?? "" },
  ];
}

export function buildInventoryPrintLayout(rows = [], viewMode = "byItem") {
  const columns = buildPrintColumns(viewMode);
  const numbered = rows.map((row, index) => ({ ...row, no: index + 1 }));
  const columnWidths = computePrintColumnWidths(columns, TITAN_LIST_PRINT_ORIENTATION);
  const pages = paginateRowsByLayout(numbered, columns, columnWidths, buildListPrintPaginationOptions());

  return {
    columns,
    columnWidths,
    orientation: TITAN_LIST_PRINT_ORIENTATION,
    pages,
  };
}
