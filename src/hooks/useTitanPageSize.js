import { useState } from "react";

export const TITAN_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function useTitanPageSize(defaultSize = 10) {
  const [pageSize, setPageSize] = useState(defaultSize);
  return { pageSize, setPageSize, pageSizeOptions: TITAN_PAGE_SIZE_OPTIONS };
}

export function slicePagedRows(rows, pageSize, page = 1) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function getTotalPages(totalRows, pageSize) {
  return Math.max(1, Math.ceil(totalRows / pageSize));
}
