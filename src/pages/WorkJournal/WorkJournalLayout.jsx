import { Outlet, useLocation } from "react-router-dom";
import { getSectionByPathname } from "../../config/menuStructure";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

export default function WorkJournalLayout() {
  const location = useLocation();
  const section = getSectionByPathname(location.pathname);
  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={null}>
      <TitanHubBackLink to="/production" label="생산관리" />
      <Outlet />
    </SectionPageLayout>
  );
}
