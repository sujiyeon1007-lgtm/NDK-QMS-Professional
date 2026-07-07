import { Outlet, useLocation } from "react-router-dom";

import TitanBreadcrumb from "../../../foundation/components/TitanBreadcrumb";
import { PRODUCTION_CHARGING_HUB_BREADCRUMB } from "../../../config/titanBreadcrumbPolicy";
import "../../../foundation/styles/titan-hub-page.css";

function isProductionChargingHubPath(pathname) {
  return pathname === "/production/charging" || pathname === "/production/charging/";
}

/**
 * 생산관리 → 설비장입 Hub
 * Hub: Header 1개 + Breadcrumb · 하위: Outlet만
 */
export default function ProductionChargingLayout() {
  const location = useLocation();
  const isHub = isProductionChargingHubPath(location.pathname);

  if (!isHub) {
    return <Outlet />;
  }

  return (
    <div className="titan-section-page">
      <header className="titan-section-page__header">
        <h1 className="titan-section-page__title">설비장입</h1>
      </header>
      <TitanBreadcrumb items={PRODUCTION_CHARGING_HUB_BREADCRUMB} />
      <div className="titan-section-page__body">
        <Outlet />
      </div>
    </div>
  );
}
