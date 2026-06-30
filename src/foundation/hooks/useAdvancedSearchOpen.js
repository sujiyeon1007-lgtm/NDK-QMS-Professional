import { useCallback, useState } from "react";

const GLOBAL_STORAGE_KEY = "titan-advanced-search-open";

function readStoredOpen(storageKey) {
  try {
    return sessionStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

function writeStoredOpen(storageKey, open) {
  try {
    sessionStorage.setItem(storageKey, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function useAdvancedSearchOpen(storageKey = GLOBAL_STORAGE_KEY) {
  const [open, setOpenState] = useState(() => readStoredOpen(storageKey));

  const setOpen = useCallback(
    (value) => {
      setOpenState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeStoredOpen(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  return [open, toggle, setOpen];
}
