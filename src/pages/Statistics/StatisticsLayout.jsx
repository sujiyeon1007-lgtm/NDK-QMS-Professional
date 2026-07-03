import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function StatisticsLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname);
  if (!section) return null;

  if (location.pathname === "/statistics" || location.pathname === "/statistics/") {
    return <Navigate to="/statistics/inquiry" replace />;
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
