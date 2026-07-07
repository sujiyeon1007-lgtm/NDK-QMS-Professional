import { Outlet, useLocation } from "react-router-dom";

import { getSectionById, getSectionByPathname } from "../../config/menuStructure";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import "../../foundation/styles/titan-hub-page.css";

function isQrChargingHubPath(pathname) {
  return pathname === "/qr-workflow" || pathname === "/qr-workflow/";
}

export default function QrChargingLayout() {
  const location = useLocation();
  const isHub = isQrChargingHubPath(location.pathname);
  const hubSection = getSectionById("qrCharging");
  const section = isHub ? hubSection : getSectionByPathname(location.pathname);

  if (!section) return null;

  if (isHub) {
    return (
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{hubSection?.label ?? "설비 장입관리"}</h1>
        </header>
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SectionPageLayout section={section} description={null}>
      <TitanHubBackLink to="/qr-workflow" label="설비 장입관리" />
      <Outlet />
    </SectionPageLayout>
  );
}
