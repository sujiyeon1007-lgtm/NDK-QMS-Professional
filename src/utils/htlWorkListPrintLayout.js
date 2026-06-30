import { formatQtyWithUnit } from "./productUnits";
import {
  computePrintColumnWidths,
  paginateRowsByLayout,
  PRINT_ORIENTATION,
  resolvePrintOrientation,
} from "./titanPrintLayout";

/** 저장된 비고만 출력 — 자동 생성·임시값·대시(-) 금지 */
function formatNote(row) {
  const note = row.note?.trim();
  if (!note || note === "-") return "";
  return note;
}

export const HTL_PRINT_TITLE = "열처리 작업 계획 리스트";

/** Project TITAN HTL 출력 컬럼 — 권장 비율 기준 */
export function buildHtlPrintColumns(workDate = "") {
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
      baseRatio: 15,
      singleLine: true,
      align: "left",
      getValue: (row) => row.company ?? "",
    },
    {
      id: "partName",
      header: "품명",
      baseRatio: 20,
      wrapMaxLines: 2,
      align: "left",
      getValue: (row) => row.partName ?? "",
    },
    {
      id: "partNo",
      header: "품번",
      baseRatio: 15,
      singleLine: true,
      align: "left",
      getValue: (row) => row.partNo ?? "",
    },
    {
      id: "material",
      header: "재질",
      baseRatio: 10,
      singleLine: true,
      align: "center",
      getValue: (row) => row.material ?? "",
    },
    {
      id: "qty",
      header: "수량",
      baseRatio: 9,
      singleLine: true,
      align: "center",
      getValue: (row) => formatQtyWithUnit(row.qty, row.unit),
    },
    {
      id: "workDate",
      header: "작업일자",
      baseRatio: 10,
      singleLine: true,
      align: "center",
      getValue: () => workDate?.trim() || "",
    },
    {
      id: "lot",
      header: "LOT No.",
      baseRatio: 17,
      handwriting: true,
      singleLine: true,
      align: "center",
      /** 작업 계획서 — 현장 수기 작성용 빈칸 (시스템 LOT 미출력) */
      getValue: () => "",
    },
    {
      id: "note",
      header: "비고",
      baseRatio: 11,
      singleLine: true,
      align: "left",
      getValue: (row) => formatNote(row),
    },
  ];
}

export function buildHtlPrintLayout(rows, workDate = "", options = {}) {
  const columns = buildHtlPrintColumns(workDate);
  const columnWidths = computePrintColumnWidths(columns, rows);
  const orientation = resolvePrintOrientation(columns, rows, columnWidths);

  const trimmedMemo = options.workMemo?.trim() ?? "";
  let lastPageReserve = 3;
  if (trimmedMemo) lastPageReserve += 4;

  const rowLineBudget = {
    lineBudget: orientation === PRINT_ORIENTATION.LANDSCAPE ? 10 : 14,
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
