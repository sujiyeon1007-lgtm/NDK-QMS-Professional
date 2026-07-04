import { useCallback, useState } from "react";

import {
  readHomeLeftPanelCollapsed,
  writeHomeLeftPanelCollapsed,
} from "../../utils/homeLeftPanelSession";

export function useHomeLeftPanelCollapsed() {
  const [collapsed, setCollapsedState] = useState(() => readHomeLeftPanelCollapsed());

  const setCollapsed = useCallback((value) => {
    setCollapsedState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      writeHomeLeftPanelCollapsed(next);
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  return [collapsed, toggleCollapsed, setCollapsed];
}
