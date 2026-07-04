import { Outlet, useLocation } from "react-router-dom";

import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function QrManagementLayout() {
  const location = useLocation();
  const section =
    getSectionByPathname(location.pathname) ?? getSectionById("qrManagement");
  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
