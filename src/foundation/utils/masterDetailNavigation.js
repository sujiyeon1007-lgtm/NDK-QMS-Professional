export function resolveMasterDetailNavigation(rows, currentRowId) {
  const list = Array.isArray(rows) ? rows : [];
  const total = list.length;

  if (!total || currentRowId == null || currentRowId === "") {
    return {
      currentIndex: -1,
      position: 0,
      total,
      hasPrev: false,
      hasNext: false,
      prevRow: null,
      nextRow: null,
    };
  }

  const currentIndex = list.findIndex((row) => row?.id === currentRowId);
  if (currentIndex < 0) {
    return {
      currentIndex: -1,
      position: 0,
      total,
      hasPrev: false,
      hasNext: false,
      prevRow: null,
      nextRow: null,
    };
  }

  return {
    currentIndex,
    position: currentIndex + 1,
    total,
    hasPrev: currentIndex > 0,
    hasNext: currentIndex < total - 1,
    prevRow: currentIndex > 0 ? list[currentIndex - 1] : null,
    nextRow: currentIndex < total - 1 ? list[currentIndex + 1] : null,
  };
}

export function resolveMasterDetailPage(rows, rowId, pageSize) {
  const list = Array.isArray(rows) ? rows : [];
  const size = Math.max(1, Number(pageSize) || 10);
  const index = list.findIndex((row) => row?.id === rowId);
  if (index < 0) return 1;
  return Math.floor(index / size) + 1;
}
