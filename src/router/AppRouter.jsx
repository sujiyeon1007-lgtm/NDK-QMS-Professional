import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import { OPERATION_MODE_WELCOME_ENABLED } from "../config/titanV1DevelopmentDirection";

import MainLayout from "../layouts/MainLayout";

import OperationModeWelcome from "../pages/Welcome/OperationModeWelcome";

import Home from "../pages/Home/Home";

import InOutLayout from "../pages/InOut/InOutLayout";

import InoutManagementHubPage from "../pages/InOut/InoutManagementHubPage";
import InboundManagement from "../pages/InOut/InboundManagement";

import OutboundManagement from "../pages/InOut/OutboundManagement";

import ProductionLayout from "../pages/Production/ProductionLayout";

import ProductionManagementHubPage from "../pages/Production/ProductionManagementHubPage";
import DailyProductionReport from "../pages/Production/DailyProductionReport";
import ProductionPlanWorkspace from "../pages/Production/ProductionPlanWorkspace";

import ProductionResultsManagement from "../pages/Production/ProductionResultsManagement";

import ActualWorkRecordPage from "../pages/Production/ActualWorkRecordPage";
import KnowledgeRecordPage from "../pages/Quality/KnowledgeRecordPage";
import LotLifecyclePage from "../pages/LotLifecycle/LotLifecyclePage";

import DefectHistoryManagement from "../pages/Production/DefectHistoryManagement";

import QualityLayout from "../pages/Quality/QualityLayout";

import QualityManagementHubPage from "../pages/Quality/QualityManagementHubPage";
import InspectionManagementScreen from "../pages/Quality/InspectionManagementScreen";

import CertificateManagement from "../pages/Quality/CertificateManagement";

import InspectionReportView from "../pages/Quality/InspectionReportView";

import InspectionLogRegisterView from "../pages/Quality/InspectionLogRegisterView";

import StatisticsLayout from "../pages/Statistics/StatisticsLayout";

import StatisticsScreen from "../pages/Statistics/StatisticsScreen";
import StatisticsDashboard from "../pages/Statistics/StatisticsDashboard";
import StatisticsProduction from "../pages/Statistics/StatisticsProduction";
import StatisticsQuality from "../pages/Statistics/StatisticsQuality";
import StatisticsSales from "../pages/Statistics/StatisticsSales";

import SettingsLayout from "../pages/Settings/SettingsLayout";

import MasterDataHubPage from "../pages/Settings/MasterDataHubPage";

import MasterDashboard from "../pages/Settings/MasterDashboard";

import CompanyManagementPage from "../pages/Settings/CompanyManagementPage";

import ProductManagementPage from "../pages/Settings/ProductManagementPage";

import MaterialManagementPage from "../pages/Settings/MaterialManagementPage";

import ProcessManagementPage from "../pages/Settings/ProcessManagementPage";

import EquipmentManagementPage from "../pages/Settings/EquipmentManagementPage";

import WorkerManagementPage from "../pages/Settings/WorkerManagementPage";

import RecipeManagementPage from "../pages/Settings/RecipeManagementPage";

import MasterEntityManagementPage from "../pages/Settings/MasterEntityManagementPage";

import MasterDataManagement from "../pages/Settings/MasterDataManagement";

import ProductInspectionManagement from "../pages/Settings/ProductInspectionManagement";

import EnvironmentLayout from "../pages/Environment/EnvironmentLayout";

import EnvironmentManagement from "../pages/Environment/EnvironmentManagement";
import EnvironmentDashboardPage from "../pages/Environment/EnvironmentDashboardPage";
import EnvironmentSectionPage from "../pages/Environment/EnvironmentSectionPage";

import DocumentsLayout from "../pages/Documents/DocumentsLayout";

import DocumentManagementPage from "../pages/Documents/DocumentManagementPage";

import HistoryLayout from "../pages/History/HistoryLayout";

import QualityHistoryInquiry from "../pages/History/QualityHistoryInquiry";

import InventoryStatusLayout from "../pages/Inventory/InventoryStatusLayout";

import InventoryStatusPage from "../pages/Inventory/InventoryStatusPage";

import WorkJournal from "../pages/WorkJournal/WorkJournal";

import PrintManagementWorkspace from "../pages/InOut/PrintManagementWorkspace";

import OperationModeGuard from "./OperationModeGuard";
import ModuleGuard from "./ModuleGuard";
import LoginGuard from "./LoginGuard";
import PermissionGuard from "./PermissionGuard";

import LoginPage from "../pages/Login/LoginPage";

import AccountingClerkHubPage from "../pages/AccountingClerk/AccountingClerkHubPage";
import AccountingClerkFeaturePage from "../pages/AccountingClerk/AccountingClerkFeaturePage";
import AccountingHubPage from "../pages/Accounting/AccountingHubPage";
import AccountingFeaturePage from "../pages/Accounting/AccountingFeaturePage";
import QrManagementLayout from "../pages/QrManagement/QrManagementLayout";
import QrInoutScreen from "../pages/QrManagement/QrInoutScreen";
import QrEquipmentScreen from "../pages/QrManagement/QrEquipmentScreen";
import ProductionChargingLayout from "../pages/Production/charging/ProductionChargingLayout";
import ProductionChargingHubPage from "../pages/Production/charging/ProductionChargingHubPage";
import ProductionChargingOverviewPage from "../pages/Production/charging/ProductionChargingOverviewPage";
import ProductionChargingProcessPage from "../pages/Production/charging/ProductionChargingProcessPage";
import ProductionChargingEquipmentPage from "../pages/Production/charging/ProductionChargingEquipmentPage";
import EquipmentStatusPage from "../pages/EquipmentStatus/EquipmentStatusPage";
import QrEngineLayout from "../pages/QrEngine/QrEngineLayout";
import QrEngineDashboardPage from "../pages/QrEngine/QrEngineDashboardPage";
import QrEngineGeneratorPage from "../pages/QrEngine/QrEngineGeneratorPage";
import QrEngineRegistryPage from "../pages/QrEngine/QrEngineRegistryPage";
import QrEngineScanPage from "../pages/QrEngine/QrEngineScanPage";
import QrEngineEquipmentWorkPage from "../pages/QrEngine/QrEngineEquipmentWorkPage";
import CompanyLayout from "../pages/Company/CompanyLayout";
import CompanyDashboardPage from "../pages/Company/CompanyDashboardPage";
import CompanyInformationPage from "../pages/Company/CompanyInformationPage";
import CompanyBusinessSitesPage from "../pages/Company/CompanyBusinessSitesPage";
import CompanyOrganizationPage from "../pages/Company/CompanyOrganizationPage";
import CompanyDepartmentsPage from "../pages/Company/CompanyDepartmentsPage";
import CompanyEmployeesPage from "../pages/Company/CompanyEmployeesPage";
import CompanyPositionsPage from "../pages/Company/CompanyPositionsPage";
import CompanyBrandingPage from "../pages/Company/CompanyBrandingPage";
import CompanyDocumentFooterPage from "../pages/Company/CompanyDocumentFooterPage";

import { LEGACY_ROUTE_REDIRECTS } from "../config/menuStructure";



function LegacyRedirect({ to }) {

  return <Navigate to={to} replace />;

}

const BASELINE_LEGACY_PATHS = {
  materials: "/settings/materials",
  processes: "/settings/processes",
  equipment: "/settings/equipment",
  workers: "/settings/workers",
};

function BaselineTabLegacyRedirect() {
  const { baselineTab } = useParams();
  return <Navigate to={BASELINE_LEGACY_PATHS[baselineTab] ?? "/settings/materials"} replace />;
}



function AppRoutes() {
  return (
    <Routes>
        {OPERATION_MODE_WELCOME_ENABLED ? (
          <Route path="/" element={<OperationModeWelcome />} />
        ) : null}

        <Route path="/login" element={<LoginPage />} />

        <Route element={<LoginGuard />}>
        <Route element={<OperationModeGuard />}>
          <Route element={<ModuleGuard />}>
          <Route element={<PermissionGuard />}>
          <Route element={<MainLayout />}>
            {!OPERATION_MODE_WELCOME_ENABLED ? (
              <Route path="/" element={<Navigate to="/home" replace />} />
            ) : null}

            <Route path="/home" element={<Home />} />



            <Route path="/inout" element={<InOutLayout />}>

              <Route index element={<InoutManagementHubPage />} />

              <Route path="incoming" element={<InboundManagement />} />

              <Route path="shipment" element={<OutboundManagement />} />

              <Route path="print" element={<PrintManagementWorkspace />} />

              <Route path="work-journal" element={<WorkJournal />} />

            </Route>



            <Route path="/inventory" element={<InventoryStatusLayout />}>

              <Route index element={<InventoryStatusPage />} />

            </Route>



            <Route path="/work-journal" element={<Navigate to="/production/work-journal" replace />} />



            <Route path="/production" element={<ProductionLayout />}>

              <Route index element={<ProductionManagementHubPage />} />

              <Route path="register" element={<Navigate to="/production/daily-report" replace />} />

              <Route path="results" element={<ProductionResultsManagement />} />

              <Route path="actual-work" element={<ActualWorkRecordPage />} />

              <Route path="defect-history" element={<Navigate to="/quality/defect-history" replace />} />

              <Route path="plan" element={<ProductionPlanWorkspace />} />

              <Route path="daily-report" element={<DailyProductionReport />} />

              <Route path="print" element={<PrintManagementWorkspace />} />

              <Route path="work-journal" element={<WorkJournal />} />

              <Route path="charging" element={<ProductionChargingLayout />}>
                <Route index element={<ProductionChargingHubPage />} />
                <Route path="overview" element={<ProductionChargingOverviewPage />} />
                <Route path="process/:processSlug" element={<ProductionChargingProcessPage />} />
                <Route path="equipment/:equipmentId" element={<ProductionChargingEquipmentPage />} />
              </Route>

            </Route>



            <Route path="/quality" element={<QualityLayout />}>

              <Route index element={<QualityManagementHubPage />} />

              <Route path="inspection">
                <Route index element={<Navigate to="/quality/inspection/mass" replace />} />
                <Route path="register" element={<InspectionLogRegisterView />} />
                <Route path=":logId/report" element={<InspectionReportView />} />
                <Route path=":inspectionTab" element={<InspectionManagementScreen />} />
              </Route>

              <Route path="certificate" element={<CertificateManagement />} />

              <Route path="defect-history" element={<DefectHistoryManagement />} />

              <Route path="knowledge" element={<KnowledgeRecordPage />} />

              <Route path="lot-lifecycle" element={<LotLifecyclePage />} />

              <Route path="work-journal" element={<WorkJournal />} />

            </Route>



            <Route path="/department-work" element={<Navigate to="/work-journal" replace />} />

            <Route path="/department-work/:departmentTab" element={<Navigate to="/work-journal" replace />} />



            <Route path="/personal" element={<Navigate to="/work-journal" replace />} />

            <Route path="/personal/:tab" element={<Navigate to="/work-journal" replace />} />



            <Route path="/statistics" element={<StatisticsLayout />}>

              <Route index element={<Navigate to="/statistics/dashboard" replace />} />

              <Route path="dashboard" element={<StatisticsDashboard />} />

              <Route path="production" element={<StatisticsProduction />} />

              <Route path="quality" element={<StatisticsQuality />} />

              <Route path="sales" element={<StatisticsSales />} />

              <Route path="inquiry" element={<Navigate to="/statistics/production" replace />} />

              <Route path="shipment" element={<Navigate to="/statistics/sales" replace />} />

              <Route path=":statisticsTab" element={<StatisticsScreen />} />

            </Route>



            <Route path="/documents" element={<DocumentsLayout />}>

              <Route index element={<DocumentManagementPage />} />

              <Route path="inspection" element={<ProductInspectionManagement />} />

            </Route>



            <Route path="/history" element={<HistoryLayout />}>

              <Route index element={<QualityHistoryInquiry />} />

            </Route>



            <Route path="/accounting-clerk" element={<AccountingClerkHubPage />} />

            <Route path="/accounting-clerk/tax-invoices" element={<AccountingClerkFeaturePage featureIdOverride="taxInvoice" />} />

            <Route path="/accounting-clerk/:featureId" element={<AccountingClerkFeaturePage />} />

            <Route path="/accounting" element={<AccountingHubPage />} />

            <Route path="/accounting/:featureId" element={<AccountingFeaturePage />} />

            <Route path="/qr" element={<QrEngineLayout />}>
              <Route index element={<Navigate to="/qr/dashboard" replace />} />
              <Route path="dashboard" element={<QrEngineDashboardPage />} />
              <Route path="generator" element={<QrEngineGeneratorPage />} />
              <Route path="registry" element={<QrEngineRegistryPage />} />
              <Route path="scan" element={<QrEngineScanPage />} />
              <Route path="equipment/:equipmentId" element={<QrEngineEquipmentWorkPage />} />
            </Route>

            <Route path="/qr-workflow" element={<Navigate to="/production/charging" replace />} />
            <Route path="/qr-workflow/charging" element={<Navigate to="/production/charging" replace />} />
            <Route path="/equipment-status" element={<EquipmentStatusPage />} />
            <Route path="/company" element={<CompanyLayout />}>
              <Route index element={<Navigate to="/company/dashboard" replace />} />
              <Route path="dashboard" element={<CompanyDashboardPage />} />
              <Route path="information" element={<CompanyInformationPage />} />
              <Route path="sites" element={<CompanyBusinessSitesPage />} />
              <Route path="organization" element={<CompanyOrganizationPage />} />
              <Route path="departments" element={<CompanyDepartmentsPage />} />
              <Route path="employees" element={<CompanyEmployeesPage />} />
              <Route path="positions" element={<CompanyPositionsPage />} />
              <Route path="branding" element={<CompanyBrandingPage />} />
              <Route path="document-footer" element={<CompanyDocumentFooterPage />} />
            </Route>
            <Route path="/environment/company" element={<Navigate to="/company/dashboard" replace />} />
            {/* Sprint 3E — 제품현황 독립 메뉴 제거 · Control Room Product View로 흡수 */}
            <Route
              path="/product-status"
              element={<Navigate to="/equipment-status?view=product" replace />}
            />

            <Route path="/qr-management" element={<QrManagementLayout />}>
              <Route index element={<Navigate to="/qr-management/inout" replace />} />
              <Route path="inout" element={<QrInoutScreen />} />
              <Route path="equipment" element={<QrEquipmentScreen />} />
              <Route path="create" element={<Navigate to="/qr-management/inout" replace />} />
              <Route path="print" element={<Navigate to="/qr-management/inout" replace />} />
              <Route path="reprint" element={<Navigate to="/qr-management/inout" replace />} />
              <Route path="preview" element={<Navigate to="/qr-management/inout" replace />} />
              <Route path="guide" element={<Navigate to="/qr-management/inout" replace />} />
            </Route>

            <Route path="/environment/qr" element={<Navigate to="/qr-management/inout" replace />} />

            <Route path="/settings" element={<SettingsLayout />}>

              <Route index element={<Navigate to="/settings/dashboard" replace />} />

              <Route path="dashboard" element={<MasterDashboard />} />

              <Route path="hub" element={<MasterDataHubPage />} />

              <Route path="companies" element={<CompanyManagementPage />} />

              <Route path="products" element={<ProductManagementPage />} />

              <Route path="materials" element={<MaterialManagementPage />} />

              <Route path="processes" element={<ProcessManagementPage />} />

              <Route path="equipment" element={<EquipmentManagementPage />} />

              <Route path="workers" element={<WorkerManagementPage />} />

              <Route path="recipes" element={<RecipeManagementPage />} />

              <Route path="company" element={<Navigate to="/settings/companies" replace />} />

              <Route path="customers" element={<Navigate to="/settings/companies" replace />} />

              <Route path="baseline" element={<Navigate to="/settings/materials" replace />} />

              <Route path="baseline/:baselineTab" element={<BaselineTabLegacyRedirect />} />

            </Route>



            <Route path="/environment" element={<EnvironmentLayout />}>

              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<EnvironmentDashboardPage />} />

              <Route path="users" element={<EnvironmentSectionPage sectionId="users" />} />

              <Route path="permissions" element={<EnvironmentSectionPage sectionId="permissions" />} />

              <Route path="menus" element={<EnvironmentSectionPage sectionId="menus" />} />

              <Route path="menu-toggle" element={<EnvironmentSectionPage sectionId="menuToggle" />} />

              <Route path="numbering" element={<EnvironmentSectionPage sectionId="numbering" />} />

              <Route path="qr-settings" element={<EnvironmentSectionPage sectionId="qrSettings" />} />

              <Route path="backup" element={<EnvironmentSectionPage sectionId="backup" />} />

              <Route path="notifications" element={<EnvironmentSectionPage sectionId="notifications" />} />

              <Route path="system" element={<EnvironmentSectionPage sectionId="system" />} />

              <Route path="employees" element={<MasterDataManagement forcedTabId="employees" />} />

              <Route path="customCodes" element={<MasterDataManagement forcedTabId="customCodes" />} />

              <Route path=":tab" element={<EnvironmentManagement />} />

            </Route>



            {Object.entries(LEGACY_ROUTE_REDIRECTS).map(([from, to]) => (

              <Route key={from} path={from} element={<LegacyRedirect to={to} />} />

            ))}

          </Route>
          </Route>
          </Route>
          </Route>
        </Route>

      </Routes>
  );
}



function AppRouter() {

  return (

    <BrowserRouter>

      <AppRoutes />

    </BrowserRouter>

  );

}



export default AppRouter;

