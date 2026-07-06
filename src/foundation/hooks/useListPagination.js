import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../config/listSearchStandard";

export function useListPagination(items = [], initialPageSize = DEFAULT_TABLE_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  const handlePageChange = useCallback((nextPage) => {
    setPage(() => {
      const pages = Math.max(1, Math.ceil(items.length / pageSize));
      return Math.min(Math.max(1, nextPage), pages);
    });
  }, [items.length, pageSize]);

  const handlePageSizeChange = useCallback((nextSize) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  return {
    page: safePage,
    pageSize,
    totalCount,
    totalPages,
    pagedItems,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
  };
}
