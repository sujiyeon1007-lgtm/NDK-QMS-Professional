import { Outlet, useLocation } from "react-router-dom";
import {
  getSectionById,
  getSectionByPathname,
  getWorkspaceNavigation,
} from "../../config/menuStructure";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import {
  getOperationRouteKeyByPath,
  OPERATION_ROUTE_LABELS,
} from "../../config/operationsRouteRegistry";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import "../../foundation/styles/titan-hub-page.css";

const INOUT_HOME_DESCRIPTION = "입고 · 출고 · 이력 · 재고 · 출력 업무를 관리합니다.";

function isInoutHubPath(pathname) {
  return pathname === "/inout" || pathname === "/inout/";
}

function resolveInoutBreadcrumbItems(pathname, workspaceNav) {
  const operationKey = getOperationRouteKeyByPath(pathname);
  if (operationKey && OPERATION_ROUTE_LABELS[operationKey]) {
    return [
      { label: "운영관리", to: "/inout" },
      { label: OPERATION_ROUTE_LABELS[operationKey] },
    ];
  }

  return buildWorkspaceDrilldownBreadcrumb({
    hubLabel: "운영관리",
    hubPath: "/inout",
    items: workspaceNav.items,
    pathname,
  });
}

export default function InOutLayout() {
  const location = useLocation();
  const isHub = isInoutHubPath(location.pathname);
  const hubSection = getSectionById("inoutManagement");
  const section = isHub ? hubSection : getSectionByPathname(location.pathname);
  const workspaceNav = getWorkspaceNavigation("operations");
  const breadcrumbItems = resolveInoutBreadcrumbItems(location.pathname, workspaceNav);

  if (!section) return null;

  if (isHub) {
    return (
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{hubSection?.label ?? "운영관리"}</h1>
          <p className="titan-section-page__desc">{INOUT_HOME_DESCRIPTION}</p>
        </header>
        <WorkspaceNavigationTabs nav={workspaceNav} />
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SectionPageLayout
      section={section}
      description={null}
      workspaceNav={workspaceNav}
      breadcrumbItems={breadcrumbItems}
      hidePageHeader
    >
      <Outlet />
    </SectionPageLayout>
  );
}
