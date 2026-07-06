import {
  buildListPrintPaginationOptions,
  TITAN_LIST_PRINT_ORIENTATION,
} from "../config/titanListPrintStandard";
import { computePrintColumnWidths, paginateRowsSimple } from "./titanPrintLayout";

export const PRODUCTION_DAILY_PRINT_TITLE = "열처리일보";

export function buildProductionDailyChargeColumns() {
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
      id: "managementId",
      header: "관리번호",
      baseRatio: 12,
      singleLine: true,
      align: "left",
      getValue: (row) => row.managementId ?? "",
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
      baseRatio: 14,
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
      baseRatio: 9,
      wrap: true,
      align: "left",
      getValue: (row) => row.material ?? "",
    },
    {
      id: "qty",
      header: "수량",
      baseRatio: 8,
      singleLine: true,
      align: "center",
      getValue: (row) => row.qtyLabel ?? "",
    },
    {
      id: "process",
      header: "공정",
      baseRatio: 8,
      singleLine: true,
      align: "center",
      getValue: (row) => row.process ?? "",
    },
  ];
}

export function buildProductionDailyChargeLayout(chargeProducts = [], options = {}) {
  const columns = buildProductionDailyChargeColumns();
  const columnWidths = computePrintColumnWidths(columns, chargeProducts);
  const orientation = TITAN_LIST_PRINT_ORIENTATION;
  const pages = paginateRowsSimple(
    chargeProducts,
    columns,
    columnWidths,
    orientation,
    buildListPrintPaginationOptions({
      reportMemo: options.note,
    })
  );

  return {
    columns,
    columnWidths,
    orientation,
    pages,
  };
}

/** @deprecated use buildProductionDailyChargeLayout */
export function buildProductionDailyPrintLayout(rows, options = {}) {
  return buildProductionDailyChargeLayout(rows, options);
}

/** 인쇄 테이블에 실제 렌더되는 행 수 (페이지 분할 후 합계) */
export function countProductionDailyPrintOutputRows(chargeProducts = [], options = {}) {
  const { pages } = buildProductionDailyChargeLayout(chargeProducts, options);
  return pages.reduce((sum, page) => sum + page.length, 0);
}
