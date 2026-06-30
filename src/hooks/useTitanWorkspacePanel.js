import { useCallback, useEffect, useState } from "react";
import {
  getPanelExpanded,
  setPanelExpanded,
  TITAN_WORKSPACE_EVENT,
} from "../utils/titanWorkspaceSession";

export function useTitanWorkspacePanel(screenId, panelId, defaultExpanded = true) {
  const [expanded, setExpandedState] = useState(() =>
    getPanelExpanded(screenId, panelId, defaultExpanded)
  );

  useEffect(() => {
    const sync = (event) => {
      const { screenId: sid, panelId: pid } = event.detail ?? {};
      if (sid === screenId && pid === panelId) {
        setExpandedState(getPanelExpanded(screenId, panelId, defaultExpanded));
      }
    };
    globalThis.addEventListener(TITAN_WORKSPACE_EVENT, sync);
    return () => globalThis.removeEventListener(TITAN_WORKSPACE_EVENT, sync);
  }, [screenId, panelId, defaultExpanded]);

  const setExpanded = useCallback(
    (value) => {
      setExpandedState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        setPanelExpanded(screenId, panelId, Boolean(next));
        return Boolean(next);
      });
    },
    [screenId, panelId]
  );

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, [setExpanded]);

  return { expanded, setExpanded, toggle };
}
