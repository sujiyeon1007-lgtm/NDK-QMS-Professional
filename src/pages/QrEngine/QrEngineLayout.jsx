import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { TitanWorkspaceShell } from "../../foundation/uiKit";
import { syncQrEngineAutoRegistry } from "../../utils/qrEngineRegistryService";
import "../../foundation/styles/titan-hub-page.css";
import "./QrEngine.css";

function isQrEngineShellPath(pathname) {
  return (
    pathname === "/qr" ||
    pathname === "/qr/" ||
    pathname.startsWith("/qr/dashboard") ||
    pathname.startsWith("/qr/generator") ||
    pathname.startsWith("/qr/registry") ||
    pathname.startsWith("/qr/scan")
  );
}

const NAV_ITEMS = [
  { to: QR_ENGINE_ROUTES.dashboard, label: QR_ENGINE_COPY.dashboardTitle },
  { to: QR_ENGINE_ROUTES.generator, label: QR_ENGINE_COPY.generatorTitle },
  { to: QR_ENGINE_ROUTES.registry, label: QR_ENGINE_COPY.registryTitle },
  { to: QR_ENGINE_ROUTES.scan, label: QR_ENGINE_COPY.scanTitle },
];

export default function QrEngineLayout() {
  const location = useLocation();
  const showShell = isQrEngineShellPath(location.pathname);

  useEffect(() => {
    syncQrEngineAutoRegistry();
  }, [location.pathname]);

  if (!showShell) {
    return <Outlet />;
  }

  return (
    <TitanWorkspaceShell
      kicker="QR Engine"
      title={QR_ENGINE_COPY.workspaceTitle}
      intro={QR_ENGINE_COPY.workspaceIntro}
      navItems={NAV_ITEMS}
      homePath={QR_ENGINE_ROUTES.dashboard}
      ariaLabel="QR Engine"
      className="qr-engine-workspace"
    >
      <Outlet />
    </TitanWorkspaceShell>
  );
}