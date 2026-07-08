import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import {
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_ROUTES,
} from "../../config/companyWorkspaceArchitecture";
import { TitanWorkspaceShell } from "../../foundation/uiKit";
import { ensureCompanyWorkspaceSeeded } from "../../utils/companyWorkspaceService";
import "../../foundation/styles/titan-hub-page.css";
import "./Company.css";

function isCompanyWorkspaceShellPath(pathname) {
  return pathname === "/company" || pathname.startsWith("/company/");
}

const MAIN_NAV = [
  { to: COMPANY_WORKSPACE_ROUTES.dashboard, label: COMPANY_WORKSPACE_COPY.dashboardTitle },
  { to: COMPANY_WORKSPACE_ROUTES.information, label: COMPANY_WORKSPACE_COPY.informationTitle },
  { to: COMPANY_WORKSPACE_ROUTES.sites, label: COMPANY_WORKSPACE_COPY.sitesTitle },
  { to: COMPANY_WORKSPACE_ROUTES.organization, label: COMPANY_WORKSPACE_COPY.organizationTitle },
  { to: COMPANY_WORKSPACE_ROUTES.departments, label: COMPANY_WORKSPACE_COPY.departmentsTitle },
  { to: COMPANY_WORKSPACE_ROUTES.employees, label: COMPANY_WORKSPACE_COPY.employeesTitle },
  { to: COMPANY_WORKSPACE_ROUTES.positions, label: COMPANY_WORKSPACE_COPY.positionsTitle },
  { to: COMPANY_WORKSPACE_ROUTES.branding, label: COMPANY_WORKSPACE_COPY.brandingTitle },
  { to: COMPANY_WORKSPACE_ROUTES.documentFooter, label: COMPANY_WORKSPACE_COPY.documentFooterTitle },
];

export default function CompanyLayout() {
  const location = useLocation();
  const isWorkspaceHome = location.pathname === COMPANY_WORKSPACE_ROUTES.dashboard;

  useEffect(() => {
    ensureCompanyWorkspaceSeeded();
  }, [location.pathname]);

  if (!isCompanyWorkspaceShellPath(location.pathname)) {
    return <Outlet />;
  }

  return (
    <TitanWorkspaceShell
      kicker={COMPANY_WORKSPACE_COPY.workspaceKicker}
      title={COMPANY_WORKSPACE_COPY.workspaceTitle}
      intro={COMPANY_WORKSPACE_COPY.workspaceIntro}
      note={COMPANY_WORKSPACE_COPY.environmentSeparationNote}
      navItems={MAIN_NAV}
      homePath={COMPANY_WORKSPACE_ROUTES.dashboard}
      isHome={isWorkspaceHome}
      ariaLabel="Company Workspace"
    >
      <Outlet />
    </TitanWorkspaceShell>
  );
}
