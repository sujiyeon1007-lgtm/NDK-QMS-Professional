import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionById } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function SettingsLayout() {
  const location = useLocation();
  const section = getSectionById("master");
  if (!section) return null;

  if (location.pathname === "/settings" || location.pathname === "/settings/") {
    return <Navigate to="/settings/companies" replace />;
  }

  if (location.pathname === "/settings/prices") {
    return <Navigate to="/settings/products" replace />;
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
