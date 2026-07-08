import { TitanBreadcrumb } from "../../foundation/uiKit";
import { COMPANY_WORKSPACE_COPY } from "../../config/companyWorkspaceArchitecture";

export default function CompanyPageShell({ breadcrumbItems, title, description = null, children }) {
  return (
    <div className="company-workspace-page">
      {title ? <h2 className="titan-section-page__subtitle">{title}</h2> : null}
      {description ? <p className="titan-section-page__desc">{description}</p> : null}
      {breadcrumbItems?.length ? <TitanBreadcrumb items={breadcrumbItems} /> : null}
      {children}
    </div>
  );
}

export function companyWorkspaceBreadcrumbTrail(currentLabel) {
  return [
    { label: COMPANY_WORKSPACE_COPY.workspaceTitle, to: "/company/dashboard" },
    { label: currentLabel },
  ];
}
