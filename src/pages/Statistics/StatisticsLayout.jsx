import { Navigate, Outlet, useLocation } from "react-router-dom";
import { resolveMenuSectionByPathname } from "../../config/menuConfig";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function StatisticsLayout() {
  const location = useLocation();
  const section = resolveMenuSectionByPathname(location.pathname);

  if (location.pathname === "/statistics" || location.pathname === "/statistics/") {
    return <Navigate to="/statistics/production" replace />;
  }

  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
