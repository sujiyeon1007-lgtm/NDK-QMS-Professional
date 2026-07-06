import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

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
      <Outlet />
    </SectionPageLayout>
  );
}
