/**
 * Project TITAN V1.3 — list row interaction
 * single click: select · double-click: detail popup (via [상세] 동일)
 */
export function resolveRowId(row, getRowId) {
  if (getRowId) return getRowId(row);
  return row?.rowKey ?? row?.id ?? row?.managementId ?? null;
}

export function openRowDetailPopup(row, { setActiveId, setDetailPopupRow, getRowId } = {}) {
  if (!row) return;
  const id = resolveRowId(row, getRowId);
  if (setActiveId && id != null && id !== "") setActiveId(id);
  setDetailPopupRow?.(row);
}
