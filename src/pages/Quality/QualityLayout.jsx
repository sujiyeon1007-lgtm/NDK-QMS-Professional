import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getSectionById, getSectionByPathname, getWorkspaceNavigation } from "../../config/menuStructure";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

const QUALITY_HOME_DESCRIPTION = "검사 · 성적서 · 부적합 · 품질 문서 업무를 관리합니다.";

function isQualityHubPath(pathname) {
  return pathname === "/quality" || pathname === "/quality/";
}

function filterSectionTabs(section, isModuleEnabled) {
  if (!section?.tabs?.length) return section;
  const tabs = section.tabs.filter((tab) => {
    if (tab.path.startsWith("/quality/certificate")) return isModuleEnabled("certificate");
    if (tab.path.startsWith("/quality/inspection")) return isModuleEnabled("quality");
    if (tab.path.startsWith("/documents")) return isModuleEnabled("documents");
    return true;
  });
  if (tabs.length === section.tabs.length) return section;
  return { ...section, tabs };
}

export default function QualityLayout() {
  const location = useLocation();
  const { isModuleEnabled } = useTitanModuleFlags();
  const isHub = isQualityHubPath(location.pathname);
  const hubSection = getSectionById("qualityManagement");
  const section = isHub ? hubSection : getSectionByPathname(location.pathname);
  const workspaceNav = getWorkspaceNavigation("quality");

  const filteredSection = useMemo(
    () => {
      if (!section) return null;
      return isHub ? hubSection : filterSectionTabs(section, isModuleEnabled);
    },
    [hubSection, isHub, isModuleEnabled, section]
  );

  const breadcrumbItems = useMemo(
    () =>
      isHub
        ? []
        : buildWorkspaceDrilldownBreadcrumb({
            hubLabel: "품질관리",
            hubPath: "/quality",
            items: workspaceNav.items,
            pathname: location.pathname,
          }),
    [isHub, location.pathname, workspaceNav.items]
  );

  if (!section || !filteredSection) return null;

  if (isHub) {
    return (
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{hubSection?.label ?? "품질관리"}</h1>
          <p className="titan-section-page__desc">{QUALITY_HOME_DESCRIPTION}</p>
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
      section={filteredSection}
      description={null}
      workspaceNav={workspaceNav}
      breadcrumbItems={breadcrumbItems}
      hidePageHeader
    >
      <Outlet />
    </SectionPageLayout>
  );
}
