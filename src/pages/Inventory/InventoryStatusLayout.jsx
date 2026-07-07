import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname } from "../../config/menuStructure";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

export default function InventoryStatusLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname);
  const layoutSection = useMemo(
    () => (section ? { ...section, tabs: [] } : null),
    [section]
  );
  if (!layoutSection) return null;

  return (
    <SectionPageLayout section={layoutSection} description={null}>
      <TitanHubBackLink to="/inout" label="운영관리" />
      <Outlet />
    </SectionPageLayout>
  );
}
