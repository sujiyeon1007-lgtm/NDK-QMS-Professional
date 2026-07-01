import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSectionById } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function DepartmentWorkLayout() {
  const location = useLocation();
  const section = getSectionById("departmentWork");
  if (!section) return null;

  if (location.pathname === "/department-work" || location.pathname === "/department-work/") {
    return <Navigate to="/department-work/all" replace />;
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
