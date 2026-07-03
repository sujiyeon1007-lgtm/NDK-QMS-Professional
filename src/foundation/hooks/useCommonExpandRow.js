import { useCallback, useEffect, useState } from "react";

/**
 * Project TITAN — Common Row Expand (Toggle · 단일 Row · 선택 유지)
 */
export function useCommonExpandRow(options = {}) {
  const { storageKey = null, initialActiveId = null } = options;

  const [expandedRowId, setExpandedRowId] = useState(null);
  const [activeRowId, setActiveRowId] = useState(() => {
    if (storageKey && typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem(storageKey) || initialActiveId;
    }
    return initialActiveId;
  });

  const handleExpandedRowChange = useCallback(
    (rowId) => {
      setExpandedRowId(rowId);
      if (rowId) {
        setActiveRowId(rowId);
        if (storageKey) sessionStorage.setItem(storageKey, rowId);
      }
    },
    [storageKey]
  );

  const clearExpand = useCallback(() => {
    setExpandedRowId(null);
  }, []);

  const resetForTab = useCallback(() => {
    setExpandedRowId(null);
    if (storageKey && typeof sessionStorage !== "undefined") {
      setActiveRowId(sessionStorage.getItem(storageKey) || null);
    } else {
      setActiveRowId(null);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !activeRowId) return;
    sessionStorage.setItem(storageKey, activeRowId);
  }, [activeRowId, storageKey]);

  return {
    expandedRowId,
    activeRowId,
    setExpandedRowId,
    setActiveRowId,
    handleExpandedRowChange,
    clearExpand,
    resetForTab,
  };
}
