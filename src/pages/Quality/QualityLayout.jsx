import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionById } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function QualityLayout() {
  const location = useLocation();
  const section = getSectionById("quality");
  if (!section) return null;

  if (location.pathname === "/quality" || location.pathname === "/quality/") {
    return <Navigate to="/quality/inspection" replace />;
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
