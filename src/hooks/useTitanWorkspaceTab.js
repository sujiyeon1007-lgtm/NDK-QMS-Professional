import { useCallback, useEffect, useState } from "react";
import {
  getWorkspaceTab,
  setWorkspaceTab,
  TITAN_WORKSPACE_EVENT,
} from "../utils/titanWorkspaceSession";

export function useTitanWorkspaceTab(screenId, defaultTab) {
  const [activeTab, setActiveTabState] = useState(() => getWorkspaceTab(screenId, defaultTab));

  useEffect(() => {
    const sync = (event) => {
      const { screenId: sid, panelId } = event.detail ?? {};
      if (sid === screenId && panelId === "activeTab") {
        setActiveTabState(getWorkspaceTab(screenId, defaultTab));
      }
    };
    globalThis.addEventListener(TITAN_WORKSPACE_EVENT, sync);
    return () => globalThis.removeEventListener(TITAN_WORKSPACE_EVENT, sync);
  }, [screenId, defaultTab]);

  const setActiveTab = useCallback(
    (tab) => {
      setWorkspaceTab(screenId, tab);
      setActiveTabState(tab);
    },
    [screenId]
  );

  return { activeTab, setActiveTab };
}
