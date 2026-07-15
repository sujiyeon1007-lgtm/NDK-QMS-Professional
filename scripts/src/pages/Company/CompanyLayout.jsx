import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_ROUTES,
} from "../../config/companyWorkspaceArchitecture";
import { ensureCompanyWorkspaceSeeded } from "../../utils/companyWorkspaceService";
import CompanyWorkspaceNav from "./components/CompanyWorkspaceNav";
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
    <div className={`company-workspace titan-section-page${isWorkspaceHome ? " company-workspace--home" : ""}`}>
      <header className="company-workspace-header" aria-label="Company Workspace Header">
        <div className="company-workspace-header__main">
          <span className="company-workspace-header__kicker">{COMPANY_WORKSPACE_COPY.workspaceKicker}</span>
          <h1 className="company-workspace-header__title">{COMPANY_WORKSPACE_COPY.workspaceTitle}</h1>
          <p className="company-workspace-header__intro">{COMPANY_WORKSPACE_COPY.workspaceIntro}</p>
        </div>
        <span className="company-workspace-header__note">{COMPANY_WORKSPACE_COPY.environmentSeparationNote}</span>
      </header>

      <nav className="company-workspace-nav" aria-label="Company Workspace">
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === COMPANY_WORKSPACE_ROUTES.dashboard}
            className={({ isActive }) =>
              `company-workspace-nav__link${isActive ? " company-workspace-nav__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="company-workspace-shell">
        <CompanyWorkspaceNav />
        <div className="company-workspace-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
