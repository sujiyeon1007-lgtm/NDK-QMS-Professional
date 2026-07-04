import { useCallback, useState } from "react";

function readStoredOpen(storageKey, defaultOpen) {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored === null) return defaultOpen;
    return stored === "1";
  } catch {
    return defaultOpen;
  }
}

function writeStoredOpen(storageKey, open) {
  try {
    sessionStorage.setItem(storageKey, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/**
 * Persist widget collapse state in sessionStorage (survives navigation within session).
 * @param {string} storageKey — e.g. titan-home-widget-collapse:notice
 * @param {boolean} [defaultOpen=true]
 */
export function usePersistedCollapse(storageKey, defaultOpen = true) {
  const [open, setOpenState] = useState(() => readStoredOpen(storageKey, defaultOpen));

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
