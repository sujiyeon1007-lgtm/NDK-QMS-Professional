import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname, getWorkspaceNavigation } from "../../config/menuStructure";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

export default function InventoryStatusLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname);
  const workspaceNav = getWorkspaceNavigation("operations");
  const layoutSection = useMemo(
    () => (section ? { ...section, tabs: [] } : null),
    [section]
  );

  const breadcrumbItems = useMemo(
    () =>
      buildWorkspaceDrilldownBreadcrumb({
        hubLabel: "운영관리",
        hubPath: "/inout",
        items: [...workspaceNav.items, { to: "/inventory", label: "재고현황" }],
        pathname: location.pathname,
      }),
    [location.pathname, workspaceNav.items]
  );

  if (!layoutSection) return null;

  return (
    <SectionPageLayout
      section={layoutSection}
      description={null}
      workspaceNav={workspaceNav}
      breadcrumbItems={breadcrumbItems}
      hidePageHeader
    >
      <Outlet />
    </SectionPageLayout>
  );
}
