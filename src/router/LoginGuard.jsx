import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useTitanAuth } from "../hooks/useTitanAuth";

export default function LoginGuard() {
  const location = useLocation();
  const { authenticated } = useTitanAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
