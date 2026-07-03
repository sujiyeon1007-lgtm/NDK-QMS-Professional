import { Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function InventoryStatusLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname);
  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
