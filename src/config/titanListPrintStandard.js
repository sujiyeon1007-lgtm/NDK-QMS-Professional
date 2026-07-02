import { PRINT_ORIENTATION } from "../utils/titanPrintLayout";

/**
 * Project TITAN Official Print Standard — list documents (DOC-01 Layout Master)
 * DOC-01~06: A4 Landscape · 동일 Header/Footer/Table/QR · 공통 Print Engine
 */
export const TITAN_LIST_PRINT_ORIENTATION = PRINT_ORIENTATION.LANDSCAPE;

/** 페이지당 행 줄 예산 — 컴팩트 타이포 기준 (가독성 유지) */
export const TITAN_LIST_PRINT_LINE_BUDGET = 13;

export const TITAN_LIST_PRINT_LAST_PAGE_RESERVE = {
  base: 4,
  memo: 2,
};

/** 줄바꿈 추정 — 축소 글꼴 기준 (colMm 대비 문자 폭) */
export const TITAN_LIST_PRINT_WRAP_UNITS_FACTOR = 0.48;

export function buildListPrintPaginationOptions(options = {}) {
  const memo = options.workMemo?.trim() || options.reportMemo?.trim() || "";
  let lastPageReserve = TITAN_LIST_PRINT_LAST_PAGE_RESERVE.base;
  if (memo) {
    lastPageReserve += TITAN_LIST_PRINT_LAST_PAGE_RESERVE.memo;
  }

  const pagination = {
    lineBudget: TITAN_LIST_PRINT_LINE_BUDGET,
    lastPageReserve,
    minOrphanRows: options.minOrphanRows ?? TITAN_LIST_PRINT_MIN_ORPHAN_ROWS,
  };

  if (typeof options.getGroupKey === "function") {
    pagination.getGroupKey = options.getGroupKey;
  }

  return pagination;
}

export const TITAN_LIST_PRINT_DOCUMENT_CLASS = "titan-print-list";

export const TITAN_PRINT_ENGINE_VERSION = "PE-1.0";
export const TITAN_PRINT_LAYOUT_VERSION = "V1.0";

export const TITAN_LIST_DOCUMENT_CODES = {
  HTL: "DOC-01",
  DPR: "DOC-02",
  INS: "DOC-03",
  COA: "DOC-04",
  OUT: "DOC-05",
  HIST: "DOC-06",
};

/** 페이지 하단 orphan row 방지 — 최소 행 수 */
export const TITAN_LIST_PRINT_MIN_ORPHAN_ROWS = 2;
