import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname } from "../../config/menuStructure";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

function resolveQualityTabPath(isModuleEnabled) {
  if (isModuleEnabled("quality")) return "/quality/inspection";
  if (isModuleEnabled("certificate")) return "/quality/certificate";
  return null;
}

function filterSectionTabs(section, isModuleEnabled) {
  if (!section?.tabs?.length) return section;
  const tabs = section.tabs.filter((tab) => {
    if (tab.path.startsWith("/quality/certificate")) return isModuleEnabled("certificate");
    if (tab.path.startsWith("/quality/inspection")) return isModuleEnabled("quality");
    return true;
  });
  if (tabs.length === section.tabs.length) return section;
  return { ...section, tabs };
}

export default function QualityLayout() {
  const location = useLocation();
  const { isModuleEnabled } = useTitanModuleFlags();
  const section = getSectionByPathname(location.pathname);
  if (!section) return null;

  if (location.pathname === "/quality" || location.pathname === "/quality/") {
    const target = resolveQualityTabPath(isModuleEnabled);
    if (target) return <Navigate to={target} replace />;
    return <Navigate to="/home" replace state={{ moduleBlocked: "quality" }} />;
  }

  const filteredSection = useMemo(
    () => filterSectionTabs(section, isModuleEnabled),
    [section, isModuleEnabled]
  );

  return (
    <SectionPageLayout section={filteredSection} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
