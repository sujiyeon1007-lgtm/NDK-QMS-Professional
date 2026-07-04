import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useTitanAuth } from "../hooks/useTitanAuth";
import { isRouteAllowedByPermissions } from "../utils/titanPermissionRuntime";

/** Permission check — ModuleGuard 이후 실행 */
export default function PermissionGuard() {
  const location = useLocation();
  const { authenticated } = useTitanAuth();

  if (!authenticated) return <Navigate to="/login" replace />;

  if (!isRouteAllowedByPermissions(location.pathname)) {
    return <Navigate to="/home" replace state={{ permissionBlocked: true }} />;
  }

  return <Outlet />;
}
