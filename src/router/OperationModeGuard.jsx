import { Navigate, Outlet } from "react-router-dom";
import { OPERATION_MODE_WELCOME_ENABLED } from "../config/titanV1DevelopmentDirection";
import { hasStandaloneAppAccess } from "../utils/operationModeSession";

/** Redirects to Welcome when Standalone mode has not been selected (Welcome enabled only) */
export default function OperationModeGuard() {
  if (!OPERATION_MODE_WELCOME_ENABLED) {
    return <Outlet />;
  }

  if (!hasStandaloneAppAccess()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}