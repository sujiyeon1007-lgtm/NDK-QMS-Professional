import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useTitanModuleFlags } from "../hooks/useTitanModuleFlags";
import { getModuleIdForPath } from "../utils/titanModuleRuntime";

export default function ModuleGuard() {
  const location = useLocation();
  const { isModuleEnabled } = useTitanModuleFlags();
  const moduleId = getModuleIdForPath(location.pathname);

  if (moduleId && !isModuleEnabled(moduleId)) {
    return <Navigate to="/home" replace state={{ moduleBlocked: moduleId }} />;
  }

  return <Outlet />;
}
