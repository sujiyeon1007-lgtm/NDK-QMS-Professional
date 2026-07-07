import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useTitanAuth } from "../hooks/useTitanAuth";
import { isTitanAdminUser } from "../utils/titanAdminAccess";
import { isProgramAdministrator } from "../utils/titanAuthDataSession";
import { getAuthSession } from "../utils/titanAuthSession";
import { isRouteAllowedByPermissions } from "../utils/titanPermissionRuntime";

/** Permission check — ModuleGuard 이후 실행 */
export default function PermissionGuard() {
  const location = useLocation();
  const { authenticated } = useTitanAuth();
  const session = getAuthSession();

  if (!authenticated) return <Navigate to="/login" replace />;

  const isAdminUser =
    isTitanAdminUser() ||
    Boolean(session?.isProgramAdministrator) ||
    isProgramAdministrator(session?.userId);

  if (isAdminUser) {
    return <Outlet />;
  }

  if (!isRouteAllowedByPermissions(location.pathname)) {
    return <Navigate to="/home" replace state={{ permissionBlocked: true }} />;
  }

  return <Outlet />;
}
