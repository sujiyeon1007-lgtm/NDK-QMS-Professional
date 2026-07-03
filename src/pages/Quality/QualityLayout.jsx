import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function QualityLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname);
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
