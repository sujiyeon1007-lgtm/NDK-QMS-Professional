import { Outlet, useLocation } from "react-router-dom";
import { getSectionById } from "../../config/menuStructure";
import { MASTER_DATA_HUB_BREADCRUMB } from "../../config/titanBreadcrumbPolicy";
import TitanBreadcrumb from "../../foundation/components/TitanBreadcrumb";
import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";

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
  if (!section) return null;

  return (
    <div className="titan-section-page">
      <header className="titan-section-page__header">
        <h1 className="titan-section-page__title">{section.label}</h1>
      </header>
      {isHub ? <TitanBreadcrumb items={MASTER_DATA_HUB_BREADCRUMB} /> : null}
      <div className="titan-section-page__body">
        <Outlet />
      </div>
    </div>
  );
}
