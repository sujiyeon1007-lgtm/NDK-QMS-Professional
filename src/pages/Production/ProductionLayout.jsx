import { Outlet, useLocation } from "react-router-dom";
import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

function isProductionHubPath(pathname) {
  return pathname === "/production" || pathname === "/production/";
}

export default function ProductionLayout() {
  const location = useLocation();
  const isHub = isProductionHubPath(location.pathname);
  const hubSection = getSectionById("productionManagement");
  const section = isHub ? hubSection : getSectionByPathname(location.pathname);

  if (!section) return null;

  if (isHub) {
    return (
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{hubSection?.label ?? "생산관리"}</h1>
        </header>
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <TitanHubBackLink to="/production" label="생산관리" />
      <Outlet />
    </SectionPageLayout>
  );
}
