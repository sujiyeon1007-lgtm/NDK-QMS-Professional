import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  ENVIRONMENT_WORKSPACE_COPY,
  ENVIRONMENT_WORKSPACE_ROUTES,
  isEnvironmentWorkspaceShellPath,
} from "../../config/environmentWorkspaceArchitecture";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import {
  getEnvironmentDefaultTab,
  isEnvironmentAdminTab,
} from "../../config/environmentSettings";
import { TitanWorkspaceShell } from "../../foundation/uiKit";
import { SectionPageActionsProvider } from "../../foundation/layout/SectionPageActionsContext";
import { useTitanAuth } from "../../hooks/useTitanAuth";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";
import "../Company/Company.css";
import "./Environment.css";

function EnvironmentWorkspaceShell() {
  const location = useLocation();
  const isWorkspaceHome = location.pathname === ENVIRONMENT_WORKSPACE_ROUTES.dashboard;

  const breadcrumbItems = useMemo(
    () =>
      isWorkspaceHome
        ? []
        : buildWorkspaceDrilldownBreadcrumb({
            hubLabel: "환경설정",
            hubPath: ENVIRONMENT_WORKSPACE_ROUTES.dashboard,
            items: [],
            pathname: location.pathname,
          }),
    [isWorkspaceHome, location.pathname]
  );

  return (
    <TitanWorkspaceShell
      kicker={ENVIRONMENT_WORKSPACE_COPY.workspaceKicker}
      title={ENVIRONMENT_WORKSPACE_COPY.workspaceTitle}
      intro={ENVIRONMENT_WORKSPACE_COPY.workspaceIntro}
      navItems={[]}
      homePath={ENVIRONMENT_WORKSPACE_ROUTES.dashboard}
      isHome={isWorkspaceHome}
      breadcrumbItems={breadcrumbItems}
      ariaLabel="Environment Workspace"
    >
      <Outlet />
    </TitanWorkspaceShell>
  );
}

function EnvironmentLegacyShell() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname) ?? getSectionById("environment");
  if (!section) return null;

  return (
    <SectionPageActionsProvider>
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{section.label}</h1>
        </header>
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    </SectionPageActionsProvider>
  );
}

export default function EnvironmentLayout() {
  const location = useLocation();
  useTitanAuth();
  const isAdmin = isTitanAdminUser();

  if (location.pathname === "/environment" || location.pathname === "/environment/") {
    return <Navigate to={ENVIRONMENT_WORKSPACE_ROUTES.dashboard} replace />;
  }

  if (location.pathname === "/environment/status") {
    return <Navigate to={ENVIRONMENT_WORKSPACE_ROUTES.system} replace />;
  }

  const tabParam = location.pathname.split("/").pop();
  if (location.pathname === ENVIRONMENT_WORKSPACE_ROUTES.data && !isAdmin) {
    return <Navigate to={ENVIRONMENT_WORKSPACE_ROUTES.dashboard} replace />;
  }

  if (isEnvironmentAdminTab(tabParam) && !isAdmin) {
    return <Navigate to={`/environment/${getEnvironmentDefaultTab(isAdmin)}`} replace />;
  }

  if (isEnvironmentWorkspaceShellPath(location.pathname)) {
    return <EnvironmentWorkspaceShell />;
  }

  return <EnvironmentLegacyShell />;
}
