import { Outlet, useLocation } from "react-router-dom";
import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

export default function HistoryLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname) ?? getSectionById("history");
  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={null}>
      <TitanHubBackLink to="/inout" label="입출고관리" />
      <Outlet />
    </SectionPageLayout>
  );
}
