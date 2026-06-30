import { useEffect, useMemo, useState } from "react";

function getDefaultKeys(columnDefs) {
  return columnDefs.filter((column) => column.default !== false).map((column) => column.key);
}

function readStoredKeys(storageKey, columnDefs) {
  try {
    const raw = globalThis.sessionStorage?.getItem(storageKey);
    if (!raw) return getDefaultKeys(columnDefs);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return getDefaultKeys(columnDefs);
    const valid = parsed.filter((key) => columnDefs.some((column) => column.key === key));
    return valid.length > 0 ? valid : getDefaultKeys(columnDefs);
  } catch {
    return getDefaultKeys(columnDefs);
  }
}

function storeKeys(storageKey, keys) {
  try {
    globalThis.sessionStorage?.setItem(storageKey, JSON.stringify(keys));
  } catch {
    // Non-blocking
  }
}

export function useTitanColumnVisibility(screenId, columnDefs) {
  const storageKey = `${screenId}:visibleColumns`;

  const [visibleKeys, setVisibleKeys] = useState(() => readStoredKeys(storageKey, columnDefs));

  const visibleColumns = useMemo(
    () =>
      visibleKeys
        .map((key) => columnDefs.find((column) => column.key === key))
        .filter(Boolean),
    [columnDefs, visibleKeys]
  );

  useEffect(() => {
    storeKeys(storageKey, visibleKeys);
  }, [storageKey, visibleKeys]);

  const toggleColumn = (key) => {
    setVisibleKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== key);
      }
      const next = [...prev, key];
      return columnDefs.filter((column) => next.includes(column.key)).map((column) => column.key);
    });
  };

  return { visibleKeys, visibleColumns, toggleColumn, columnDefs };
}
