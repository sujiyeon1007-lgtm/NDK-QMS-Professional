import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  ENVIRONMENT_WORKSPACE_COPY,
  ENVIRONMENT_WORKSPACE_NAV,
  ENVIRONMENT_WORKSPACE_ROUTES,
  isEnvironmentWorkspaceShellPath,
} from "../../config/environmentWorkspaceArchitecture";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import {
  getEnvironmentDefaultTab,
  getEnvironmentTabGroups,
  isEnvironmentAdminTab,
} from "../../config/environmentSettings";
import { TitanWorkspaceShell } from "../../foundation/uiKit";
import { SectionPageActionsProvider } from "../../foundation/layout/SectionPageActionsContext";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import EnvironmentGroupedTabs from "./EnvironmentGroupedTabs";
import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";
import "../Company/Company.css";
import "./Environment.css";

function EnvironmentMenuToolbar() {
  const groups = getEnvironmentTabGroups(isTitanAdminUser());

  return (
    <div className="titan-menu-toolbar environment-menu-toolbar" role="region" aria-label="환경설정 메뉴">
      <EnvironmentGroupedTabs groups={groups} />
    </div>
  );
}

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
            items: ENVIRONMENT_WORKSPACE_NAV,
            pathname: location.pathname,
          }),
    [isWorkspaceHome, location.pathname]
  );

  return (
    <TitanWorkspaceShell
      kicker={ENVIRONMENT_WORKSPACE_COPY.workspaceKicker}
      title={ENVIRONMENT_WORKSPACE_COPY.workspaceTitle}
      intro={ENVIRONMENT_WORKSPACE_COPY.workspaceIntro}
      navItems={ENVIRONMENT_WORKSPACE_NAV}
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
        <EnvironmentMenuToolbar />
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    </SectionPageActionsProvider>
  );
}

export default function EnvironmentLayout() {
  const location = useLocation();
  const isAdmin = isTitanAdminUser();

  if (location.pathname === "/environment" || location.pathname === "/environment/") {
    return <Navigate to={ENVIRONMENT_WORKSPACE_ROUTES.dashboard} replace />;
  }

  const tabParam = location.pathname.split("/").pop();
  if (isEnvironmentAdminTab(tabParam) && !isAdmin) {
    return <Navigate to={`/environment/${getEnvironmentDefaultTab(isAdmin)}`} replace />;
  }

  if (isEnvironmentWorkspaceShellPath(location.pathname)) {
    return <EnvironmentWorkspaceShell />;
  }

  return <EnvironmentLegacyShell />;
}
