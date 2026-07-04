import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import { getEnvironmentTabGroups, isEnvironmentAdminTab, getEnvironmentDefaultTab } from "../../config/environmentSettings";
import { SectionPageActionsProvider } from "../../foundation/layout/SectionPageActionsContext";
import { useSectionPageActionsContext } from "../../foundation/layout/SectionPageActionsContext";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import EnvironmentGroupedTabs from "./EnvironmentGroupedTabs";
import "../../foundation/layout/SectionPageLayout.css";
import "./Environment.css";

function EnvironmentMenuToolbar() {
  const ctx = useSectionPageActionsContext();
  const actions = ctx?.actions ?? null;
  const groups = getEnvironmentTabGroups(isTitanAdminUser());

  return (
    <div className="titan-menu-toolbar environment-menu-toolbar" role="region" aria-label="환경설정 메뉴">
      <EnvironmentGroupedTabs groups={groups} />
      {actions ? (
        <div className="titan-menu-toolbar__actions" role="toolbar" aria-label="화면 기능">
          {actions}
        </div>
      ) : (
        <div className="titan-menu-toolbar__actions titan-menu-toolbar__actions--empty" aria-hidden="true" />
      )}
    </div>
  );
}

export default function EnvironmentLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname) ?? getSectionById("environment");
  if (!section) return null;

  if (location.pathname === "/environment" || location.pathname === "/environment/") {
    return <Navigate to={`/environment/${getEnvironmentDefaultTab(isTitanAdminUser())}`} replace />;
  }

  const tabParam = location.pathname.split("/").pop();
  if (isEnvironmentAdminTab(tabParam) && !isTitanAdminUser()) {
    return <Navigate to="/environment/program" replace />;
  }

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
