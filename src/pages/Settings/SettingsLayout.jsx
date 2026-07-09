import { Outlet, useLocation } from "react-router-dom";
import { getSectionById, getWorkspaceNavigation } from "../../config/menuStructure";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import TitanBreadcrumb from "../../foundation/components/TitanBreadcrumb";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";
import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";

const MASTER_HOME_DESCRIPTION = "거래처 · 제품 · 재질 · 설비 · 작업자 Master Data를 관리합니다.";

function isMasterDataHubPath(pathname) {
  return (
    pathname === "/settings" ||
    pathname === "/settings/" ||
    pathname === "/settings/dashboard" ||
    pathname === "/settings/hub"
  );
}

/**
 * 기준정보관리 — Launcher 허브 + 독립 관리 화면
 */
export default function SettingsLayout() {
  const location = useLocation();
  const isHub = isMasterDataHubPath(location.pathname);
  const section = getSectionById("masterData");
  const workspaceNav = getWorkspaceNavigation("master");
  if (!section) return null;

  const breadcrumbItems = isHub
    ? []
    : buildWorkspaceDrilldownBreadcrumb({
        hubLabel: "기준정보관리",
        hubPath: "/settings/hub",
        items: workspaceNav.items,
        pathname: location.pathname,
      });

  return (
    <div className="titan-section-page">
      {isHub ? (
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{section.label}</h1>
          <p className="titan-section-page__desc">{MASTER_HOME_DESCRIPTION}</p>
        </header>
      ) : null}
      <WorkspaceNavigationTabs nav={workspaceNav} />
      {breadcrumbItems.length ? <TitanBreadcrumb items={breadcrumbItems} /> : null}
      <div className="titan-section-page__body">
        <Outlet />
      </div>
    </div>
  );
}
