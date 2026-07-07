import { Outlet, useLocation } from "react-router-dom";
import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

function isInoutHubPath(pathname) {
  return pathname === "/inout" || pathname === "/inout/";
}

export default function InOutLayout() {
  const location = useLocation();
  const isHub = isInoutHubPath(location.pathname);
  const hubSection = getSectionById("inoutManagement");
  const section = isHub ? hubSection : getSectionByPathname(location.pathname);

  if (!section) return null;

  if (isHub) {
    return (
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{hubSection?.label ?? "입출고관리"}</h1>
        </header>
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <TitanHubBackLink to="/inout" label="입출고관리" />
      <Outlet />
    </SectionPageLayout>
  );
}
