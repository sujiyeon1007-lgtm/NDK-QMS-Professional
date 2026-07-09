/**
 * TITAN Workspace Design Principle V1.0 - PM Sprint 11 Final
 */

export const TITAN_WORKSPACE_HOME_PRINCIPLE = {
  version: "1.0",
  approvedAt: "2026-07-08",
  sprint: 11,
  structure: [
    "Workspace Home",
    "Quick Launcher",
    "관리 페이지",
    "Dashboard",
    "KPI",
    "검색",
    "목록",
    "CRUD",
  ],
  homeAllows: ["minimalHeader", "workspaceNav", "quickLauncherCards"],
  homeProhibits: [
    "charts", "tables", "longDescriptions", "crud",
    "kpiSummary", "companySummary", "businessSiteCards",
    "recentActivity", "dashboardWidgets", "searchPanel", "listTable",
  ],
  sectionPageLayers: [
    "pageTitle", "kpiArea", "contentDashboard",
    "searchArea", "listArea", "crudArea",
  ],
  workspaceRoadmap: [
    { id: "company", label: "Company Master", sprint: 11, basePath: "/company" },
    { id: "environment", label: "Environment", sprint: 12, basePath: "/environment" },
    { id: "qr", label: "QR 정보관리", sprint: 13, basePath: "/qr" },
    { id: "accounting-clerk", label: "경리", sprint: 14, basePath: "/accounting-clerk" },
    { id: "accounting", label: "회계", sprint: 15, basePath: "/accounting" },
    { id: "tde", label: "TDE", sprint: 16, basePath: "/tde" },
  ],
  copy: {
    homeLauncherTitle: "Quick Launcher",
    sectionKpiPlaceholder: "KPI 영역 (향후 Sprint 연결)",
    sectionSearchPlaceholder: "검색 영역 (TitanSearchPanel · 향후 Sprint 연결)",
    sectionListPlaceholder: "목록 영역 (TitanDataTable · 향후 Sprint 연결)",
    sectionCrudPlaceholder: "CRUD 영역 (등록 · 수정 · 삭제 · 향후 Sprint 연결)",
  },
};

export function isWorkspaceHomeRoute(pathname, dashboardPath) {
  return pathname === dashboardPath;
}
