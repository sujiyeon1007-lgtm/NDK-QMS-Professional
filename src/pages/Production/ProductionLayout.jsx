import { Outlet } from "react-router-dom";
import { getSectionById } from "../../config/menuStructure";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

export default function ProductionLayout() {
  const section = getSectionById("production");
  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={null}>
      <Outlet />
    </SectionPageLayout>
  );
}
