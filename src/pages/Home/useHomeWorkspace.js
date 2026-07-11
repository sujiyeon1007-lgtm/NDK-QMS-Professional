import { useCallback, useEffect, useMemo, useState } from "react";

import { subscribeWorkflowDataRefresh } from "../../utils/titanWorkflowRefresh";
import {
  getHomeWorkspaceRecords,
  refreshHomeWorkspaceCache,
} from "../../utils/homeWorkspaceData";

/**
 * HOME Workspace — TitanDataEngine 연동 Hook
 * Blueprint ①: HOME는 Engine에서 읽기만 · Session 직접 접근 ❌
 */
export function useHomeWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);

  const records = useMemo(() => getHomeWorkspaceRecords(), [refreshKey]);

  const refresh = useCallback(() => {
    refreshHomeWorkspaceCache();
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    refreshHomeWorkspaceCache();
    setRefreshKey((value) => value + 1);
    return subscribeWorkflowDataRefresh(() => {
      refreshHomeWorkspaceCache();
      setRefreshKey((value) => value + 1);
    });
  }, []);

  return { records, refreshKey, refresh };
}

export default useHomeWorkspace;
