import { NavLink } from "react-router-dom";

import {
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_QUICK_LINKS,
  COMPANY_WORKSPACE_ROUTES,
} from "../../../config/companyWorkspaceArchitecture";

export default function CompanyWorkspaceNav() {
  return (
    <aside className="company-workspace-rail" aria-label="Company Workspace sidebar">
      <div className="company-workspace-rail__brand">
        <span className="company-workspace-rail__kicker">{COMPANY_WORKSPACE_COPY.workspaceKicker}</span>
        <NavLink to={COMPANY_WORKSPACE_ROUTES.dashboard} className="company-workspace-rail__home" end>
          {COMPANY_WORKSPACE_COPY.workspaceTitle}
        </NavLink>
        <p className="company-workspace-rail__desc">{COMPANY_WORKSPACE_COPY.workspaceLauncherDesc}</p>
      </div>

      <div className="company-workspace-rail__section company-workspace-rail__section--quick">
        <span className="company-workspace-rail__section-label">Quick Links</span>
        <ul className="company-workspace-rail__list">
          {COMPANY_WORKSPACE_QUICK_LINKS.map((item) => (
            <li key={item.id}>
              <NavLink to={item.path} className="company-workspace-rail__link company-workspace-rail__link--quick">
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
