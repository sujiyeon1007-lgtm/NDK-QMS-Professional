import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { TitanWorkspaceShell } from "../../foundation/uiKit";
import { scheduleQrEngineAutoRegistrySync } from "../../utils/qrEngineRegistryService";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import "../../foundation/styles/titan-hub-page.css";
import "./QrEngine.css";

function isQrEngineShellPath(pathname) {
  return (
    pathname === "/qr" ||
    pathname === "/qr/" ||
    pathname.startsWith("/qr/dashboard") ||
    pathname.startsWith("/qr/generator") ||
    pathname.startsWith("/qr/registry") ||
    pathname.startsWith("/qr/scan") ||
    pathname.startsWith("/qr/test-mode") ||
    pathname.startsWith("/qr/diagnostics")
  );
}

const BASE_NAV_ITEMS = [
  { to: QR_ENGINE_ROUTES.dashboard, label: QR_ENGINE_COPY.dashboardTitle },
  { to: QR_ENGINE_ROUTES.generator, label: QR_ENGINE_COPY.generatorTitle },
  { to: QR_ENGINE_ROUTES.registry, label: QR_ENGINE_COPY.registryTitle },
  { to: QR_ENGINE_ROUTES.scan, label: QR_ENGINE_COPY.scanTitle },
];

const ADMIN_NAV_ITEMS = [
  { to: QR_ENGINE_ROUTES.testMode, label: QR_ENGINE_COPY.testModeTitle },
  { to: QR_ENGINE_ROUTES.diagnostics, label: QR_ENGINE_COPY.diagnosticsTitle },
];

export default function QrEngineLayout() {
  const location = useLocation();
  const showShell = isQrEngineShellPath(location.pathname);
  const navItems = useMemo(() => {
    if (!isTitanAdminUser()) return BASE_NAV_ITEMS;
    return [...BASE_NAV_ITEMS, ...ADMIN_NAV_ITEMS];
  }, [location.pathname]);

  useEffect(() => {
    scheduleQrEngineAutoRegistrySync();
  }, []);

  if (!showShell) {
    return <Outlet />;
  }

  return (
    <TitanWorkspaceShell
      kicker="QR 정보관리"
      title={QR_ENGINE_COPY.workspaceTitle}
      intro={QR_ENGINE_COPY.workspaceIntro}
      navItems={navItems}
      homePath={QR_ENGINE_ROUTES.dashboard}
      ariaLabel="QR 정보관리"
      className="qr-engine-workspace"
    >
      <Outlet />
    </TitanWorkspaceShell>
  );
}