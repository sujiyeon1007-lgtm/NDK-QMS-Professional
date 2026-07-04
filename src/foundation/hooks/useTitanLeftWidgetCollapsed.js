import { useCallback, useState } from "react";
import {
  readTitanLeftWidgetCollapsed,
  writeTitanLeftWidgetCollapsed,
} from "../../utils/titanLeftWidgetSession";

export function useTitanLeftWidgetCollapsed(storageKey) {
  const [collapsed, setCollapsedState] = useState(() => readTitanLeftWidgetCollapsed(storageKey));

  const setCollapsed = useCallback(
    (value) => {
      setCollapsedState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeTitanLeftWidgetCollapsed(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  return [collapsed, toggleCollapsed, setCollapsed];
}
