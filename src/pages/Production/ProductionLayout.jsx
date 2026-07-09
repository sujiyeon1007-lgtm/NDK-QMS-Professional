import { Outlet, useLocation } from "react-router-dom";
import {
  getSectionById,
  getSectionByPathname,
  getWorkspaceNavigation,
} from "../../config/menuStructure";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import { OPERATION_ROUTES, getOperationRouteKeyByPath, OPERATION_ROUTE_LABELS } from "../../config/operationsRouteRegistry";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import "../../foundation/styles/titan-hub-page.css";

const PRODUCTION_HOME_DESCRIPTION = "입고 완료된 작업을 생산 대기 → 설비 가동 → 작업일보 순으로 관리합니다.";

const PRODUCTION_PLAN_SECTION_TABS = [
  { id: "waiting", label: "생산 대기", path: OPERATION_ROUTES.productionPending },
];

const EQUIPMENT_STATUS_SECTION_TABS = [
  { id: "running-status", label: "가동 현황", path: OPERATION_ROUTES.equipmentStatus },
];

const SHOT_SECTION_TABS = [
  { id: "shot-status", label: "쇼트 작업현황", path: OPERATION_ROUTES.shotStatus },
];

const DAILY_REPORT_SECTION_TABS = [
  { id: "today-work", label: "금일 작업", path: OPERATION_ROUTES.dailyWork },
];

function isProductionHubPath(pathname) {
  return pathname === "/production" || pathname === "/production/";
}

function isProductionChargingPath(pathname) {
  return pathname === "/production/charging" || pathname.startsWith("/production/charging/");
}

function resolveProductionSectionTabs(pathname) {
  if (isProductionHubPath(pathname)) return [];
  if (pathname === OPERATION_ROUTES.productionPending || pathname.startsWith(`${OPERATION_ROUTES.productionPending}/`)) {
    return PRODUCTION_PLAN_SECTION_TABS;
  }
  if (pathname === OPERATION_ROUTES.equipmentStatus || pathname.startsWith(`${OPERATION_ROUTES.equipmentStatus}/`)) {
    return EQUIPMENT_STATUS_SECTION_TABS;
  }
  if (pathname === OPERATION_ROUTES.shotStatus || pathname.startsWith(`${OPERATION_ROUTES.shotStatus}/`)) {
    return SHOT_SECTION_TABS;
  }
  if (pathname === OPERATION_ROUTES.dailyWork || pathname.startsWith(`${OPERATION_ROUTES.dailyWork}/`)) {
    return DAILY_REPORT_SECTION_TABS;
  }
  return [];
}

function normalizeProductionSection(section, hubSection) {
  if (!section) return section;
  if (section.label !== "열처리관리") return section;
  return { ...section, label: hubSection?.label ?? "생산관리" };
}

function resolveProductionBreadcrumbItems(pathname, workspaceNav) {
  const operationKey = getOperationRouteKeyByPath(pathname);
  if (operationKey && OPERATION_ROUTE_LABELS[operationKey]) {
    return [
      { label: "생산관리", to: "/production" },
      { label: OPERATION_ROUTE_LABELS[operationKey] },
    ];
  }

  return buildWorkspaceDrilldownBreadcrumb({
    hubLabel: "생산관리",
    hubPath: "/production",
    items: workspaceNav.items,
    pathname,
  });
}

export default function ProductionLayout() {
  const location = useLocation();
  const isCharging = isProductionChargingPath(location.pathname);
  const isHub = isProductionHubPath(location.pathname);
  const hubSection = getSectionById("productionManagement");
  const section = isHub ? hubSection : getSectionByPathname(location.pathname);
  const workspaceNav = getWorkspaceNavigation("production");
  const breadcrumbItems = resolveProductionBreadcrumbItems(location.pathname, workspaceNav);
  const layoutSection = normalizeProductionSection(section, hubSection);
  const sectionTabs = resolveProductionSectionTabs(location.pathname);

  if (!layoutSection) return null;

  if (isCharging) {
    return <Outlet />;
  }

  if (isHub) {
    return (
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{hubSection?.label ?? "생산관리"}</h1>
          <p className="titan-section-page__desc">{PRODUCTION_HOME_DESCRIPTION}</p>
        </header>
        <WorkspaceNavigationTabs nav={workspaceNav} />
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SectionPageLayout
      section={layoutSection}
      description={null}
      workspaceNav={workspaceNav}
      breadcrumbItems={breadcrumbItems}
      sectionTabs={sectionTabs}
      hidePageHeader
    >
      <Outlet />
    </SectionPageLayout>
  );
}
