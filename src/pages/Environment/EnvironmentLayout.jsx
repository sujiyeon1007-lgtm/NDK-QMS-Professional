import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionById } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function EnvironmentLayout() {
  const location = useLocation();
  const section = getSectionById("environment");
  if (!section) return null;

  if (location.pathname === "/environment" || location.pathname === "/environment/") {
    return <Navigate to="/environment/company" replace />;
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
