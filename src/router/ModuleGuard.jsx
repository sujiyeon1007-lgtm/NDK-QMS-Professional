import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useTitanModuleFlags } from "../hooks/useTitanModuleFlags";
import { getModuleIdForPath } from "../utils/titanModuleRuntime";
import { isTitanAdminUser } from "../utils/titanAdminAccess";
import { isDevelopmentPrivilegedUser } from "../utils/titanPermissionRuntime";

export default function ModuleGuard() {
  const location = useLocation();
  const { isModuleEnabled } = useTitanModuleFlags();
  const moduleId = getModuleIdForPath(location.pathname);

  if (moduleId && !isModuleEnabled(moduleId)) {
    if (isTitanAdminUser() || isDevelopmentPrivilegedUser()) {
      return <Outlet />;
    }
    return <Navigate to="/home" replace state={{ moduleBlocked: moduleId }} />;
  }

  return <Outlet />;
}
