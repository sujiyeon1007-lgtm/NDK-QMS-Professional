import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
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
    <div className="titan-section-page">
      <header className="titan-section-page__header">
        <h1 className="titan-section-page__title">{QR_ENGINE_COPY.workspaceTitle}</h1>
        <p className="titan-section-page__desc">{QR_ENGINE_COPY.workspaceIntro}</p>
      </header>
      <nav className="qr-engine-nav" aria-label="QR Engine">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `qr-engine-nav__link${isActive ? " qr-engine-nav__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="titan-section-page__body">
        <Outlet />
      </div>
    </div>
  );
}