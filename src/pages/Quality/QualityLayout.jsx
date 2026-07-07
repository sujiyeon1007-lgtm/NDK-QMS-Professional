import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import { QUALITY_MANAGEMENT_HUB_BREADCRUMB } from "../../config/titanBreadcrumbPolicy";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";
import TitanBreadcrumb from "../../foundation/components/TitanBreadcrumb";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

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

  const filteredSection = useMemo(
    () => {
      if (!section) return null;
      return isHub ? hubSection : filterSectionTabs(section, isModuleEnabled);
    },
    [hubSection, isHub, isModuleEnabled, section]
  );

  if (!section || !filteredSection) return null;

  if (isHub) {
    return (
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{hubSection?.label ?? "품질관리"}</h1>
        </header>
        <TitanBreadcrumb items={QUALITY_MANAGEMENT_HUB_BREADCRUMB} />
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SectionPageLayout section={filteredSection} description={null}>
      <TitanHubBackLink to="/quality" label="품질관리" />
      <Outlet />
    </SectionPageLayout>
  );
}
