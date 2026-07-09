import { NavLink, Outlet, useLocation } from "react-router-dom";

import { getWorkspaceNavigation } from "../../config/menuStructure";
import TitanBreadcrumb from "../../foundation/components/TitanBreadcrumb";
import { SectionPageActionsProvider } from "../../foundation/layout/SectionPageActionsContext";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";

import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";
import "./DocumentManagementPage.css";

const DOCUMENT_WORKSPACE_TABS = [
  { to: "/documents", label: "사내 문서", end: true },
  { to: "/documents/incoming-archive", label: "수신문서 보관함" },
];

function resolveDocumentsBreadcrumbItems(pathname) {
  const path = String(pathname).split("?")[0];
  const items = [
    { label: "품질관리", to: "/quality" },
    { label: "문서관리", to: path === "/documents" ? undefined : "/documents" },
  ];

  if (path.startsWith("/documents/incoming-archive")) {
    items.push({ label: "수신문서 보관함" });
  }

  return items;
}

export default function DocumentsLayout() {
  const location = useLocation();
  const workspaceNav = getWorkspaceNavigation("quality");
  const breadcrumbItems = resolveDocumentsBreadcrumbItems(location.pathname);

  return (
    <SectionPageActionsProvider>
      <div className="titan-section-page">
        <WorkspaceNavigationTabs nav={workspaceNav} />
        <TitanBreadcrumb items={breadcrumbItems} />
        <nav className="document-workspace-tabs" aria-label="문서관리 Workspace">
          {DOCUMENT_WORKSPACE_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `document-workspace-tabs__item${isActive ? " is-active" : ""}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    </SectionPageActionsProvider>
  );
}
