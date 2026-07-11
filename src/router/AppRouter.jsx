import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { OPERATION_MODE_WELCOME_ENABLED } from "../config/titanV1DevelopmentDirection";
import { OPERATION_ROUTES } from "../config/operationsRouteRegistry";

import MainLayout from "../layouts/MainLayout";

import OperationModeWelcome from "../pages/Welcome/OperationModeWelcome";

import Home from "../pages/Home/Home";

import InOutLayout from "../pages/InOut/InOutLayout";

import InoutManagementHubPage from "../pages/InOut/InoutManagementHubPage";
import InboundRegisterPage from "../pages/InOut/InboundRegisterPage";
import InboundHistoryPage from "../pages/InOut/InboundHistoryPage";

import OutboundRegisterPage from "../pages/InOut/OutboundRegisterPage";
import OutboundHistoryPage from "../pages/InOut/OutboundHistoryPage";

import ProductionLayout from "../pages/Production/ProductionLayout";

import ProductionManagementHubPage from "../pages/Production/ProductionManagementHubPage";
import DailyProductionReport from "../pages/Production/DailyProductionReport";
import ProductionPlanWorkspace from "../pages/Production/ProductionPlanWorkspace";
import ShotWorkStatusPage from "../pages/Production/ShotWorkStatusPage";

import ProductionResultsManagement from "../pages/Production/ProductionResultsManagement";

import ActualWorkRecordPage from "../pages/Production/ActualWorkRecordPage";
import KnowledgeRecordPage from "../pages/Quality/KnowledgeRecordPage";
import LotLifecyclePage from "../pages/LotLifecycle/LotLifecyclePage";

import DefectHistoryManagement from "../pages/Production/DefectHistoryManagement";

import QualityLayout from "../pages/Quality/QualityLayout";

import QualityManagementHubPage from "../pages/Quality/QualityManagementHubPage";
import InspectionManagementScreen from "../pages/Quality/InspectionManagementScreen";

import CertificateManagement from "../pages/Quality/CertificateManagement";
import CertificateStatusPage from "../pages/Quality/CertificateStatusPage";
import InspectionStatusPage from "../pages/Quality/InspectionStatusPage";
import InspectionRegisterPage, {
  InspectionRegisterEntryPage,
} from "../pages/Quality/InspectionRegisterPage";

import InspectionReportView from "../pages/Quality/InspectionReportView";

import StatisticsLayout from "../pages/Statistics/StatisticsLayout";

import StatisticsScreen from "../pages/Statistics/StatisticsScreen";
import StatisticsDashboard from "../pages/Statistics/StatisticsDashboard";
import StatisticsProduction from "../pages/Statistics/StatisticsProduction";
import StatisticsQuality from "../pages/Statistics/StatisticsQuality";
import StatisticsSales from "../pages/Statistics/StatisticsSales";

import SettingsLayout from "../pages/Settings/SettingsLayout";

import MasterDataHubPage from "../pages/Settings/MasterDataHubPage";
import MasterHoldPlaceholderPage from "../pages/Settings/MasterHoldPlaceholderPage";

import MasterDashboard from "../pages/Settings/MasterDashboard";

import CompanyManagementPage from "../pages/Settings/CompanyManagementPage";

import ProductManagementPage from "../pages/Settings/ProductManagementPage";

import RecipeManagementPage from "../pages/Settings/RecipeManagementPage";

import MasterEntityManagementPage from "../pages/Settings/MasterEntityManagementPage";

import MasterDataManagement from "../pages/Settings/MasterDataManagement";

import ProductInspectionManagement from "../pages/Settings/ProductInspectionManagement";

import EnvironmentLayout from "../pages/Environment/EnvironmentLayout";

import EnvironmentManagement from "../pages/Environment/EnvironmentManagement";
import EnvironmentDashboardPage from "../pages/Environment/EnvironmentDashboardPage";
import EnvironmentSectionPage from "../pages/Environment/EnvironmentSectionPage";

import DocumentsLayout, { DocumentsHubPage } from "../pages/Documents/DocumentsLayout";

import IncomingDocumentArchivePage from "../pages/Documents/IncomingDocumentArchivePage";
import QualityCertificatesPage from "../pages/Documents/QualityCertificatesPage";
import QualityByCompanyDocumentsPage from "../pages/Documents/QualityByCompanyDocumentsPage";
import IncomingPurchaseOrdersPage from "../pages/Documents/IncomingPurchaseOrdersPage";
import IncomingReturnSlipsPage from "../pages/Documents/IncomingReturnSlipsPage";
import IncomingOtherDocumentsPage from "../pages/Documents/IncomingOtherDocumentsPage";
import InternalDocumentsPage from "../pages/Documents/InternalDocumentsPage";

import TitanComingSoonPlaceholder from "../foundation/pages/TitanComingSoonPlaceholder";
import {
  RC1_ACCOUNTING_CLERK_COMING_SOON,
  RC1_ACCOUNTING_CLERK_POLICY,
  RC1_ACCOUNTING_COMING_SOON,
  RC1_ACCOUNTING_POLICY,
  RC1_SHOT_PROCESS_COMING_SOON,
  RC1_SHOT_PROCESS_POLICY,
} from "../config/rc1OperationalPolicy";

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
import ProductionChargingEquipmentPage from "../pages/Production/charging/ProductionChargingEquipmentPage";
import EquipmentStatusPage from "../pages/EquipmentStatus/EquipmentStatusPage";
import QrEngineLayout from "../pages/QrEngine/QrEngineLayout";
import QrEngineDashboardPage from "../pages/QrEngine/QrEngineDashboardPage";
import QrEngineGeneratorPage from "../pages/QrEngine/QrEngineGeneratorPage";
import QrEngineRegistryPage from "../pages/QrEngine/QrEngineRegistryPage";
import QrEngineScanPage from "../pages/QrEngine/QrEngineScanPage";
import QrEngineTestModePage from "../pages/QrEngine/QrEngineTestModePage";
import QrEngineDiagnosticsPage from "../pages/QrEngine/QrEngineDiagnosticsPage";
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

function Rc1AccountingClerkScreen({ children }) {
  if (RC1_ACCOUNTING_CLERK_COMING_SOON) {
    return (
      <TitanComingSoonPlaceholder title="경리관리" subtitle={RC1_ACCOUNTING_CLERK_POLICY.subtitle} />
    );
  }
  return children;
}

function Rc1AccountingScreen({ children }) {
  if (RC1_ACCOUNTING_COMING_SOON) {
    return (
      <TitanComingSoonPlaceholder title="회계관리" subtitle={RC1_ACCOUNTING_POLICY.subtitle} />
    );
  }
  return children;
}

/**
 * RC1 Route Registry — legacy 단일 목적지 경로(생산관리 4종) → canonical /operations/* redirect.
 * 기존 query string(예: ?view=product)은 canonical 경로로 그대로 이전한다.
 */
function LegacyOperationsRedirect({ to }) {
  const location = useLocation();
  const target = location.search ? `${to}${location.search}` : to;
  return <Navigate to={target} replace />;
}

/**
 * RC1 Route Registry — legacy 이중 목적지 경로(/inout/incoming · /inout/shipment) →
 * canonical /operations/* redirect. ?mode=register 여부로 등록/이력 화면을 분기하고,
 * mode를 제외한 나머지 query string(예: ?shortcut=...)은 canonical 경로로 이전한다.
 */
function LegacyOperationsModeRedirect({ registerTo, historyTo }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isRegister = params.get("mode") === "register";
  params.delete("mode");
  const remaining = params.toString();
  const target = isRegister ? registerTo : historyTo;
  return <Navigate to={remaining ? `${target}?${remaining}` : target} replace />;
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

              {/* RC1 Route Registry — legacy dual-mode path → canonical /operations/inbound-* */}
              <Route
                path="incoming"
                element={
                  <LegacyOperationsModeRedirect
                    registerTo={OPERATION_ROUTES.inboundPending}
                    historyTo={OPERATION_ROUTES.inboundHistory}
                  />
                }
              />

              {/* RC1 Route Registry — legacy dual-mode path → canonical /operations/shipment-* */}
              <Route
                path="shipment"
                element={
                  <LegacyOperationsModeRedirect
                    registerTo={OPERATION_ROUTES.shipmentRegister}
                    historyTo={OPERATION_ROUTES.shipmentHistory}
                  />
                }
              />

              <Route path="print" element={<PrintManagementWorkspace />} />

              <Route path="work-journal" element={<WorkJournal />} />

            </Route>

            {/* RC1 Route Registry — canonical 운영관리 화면 (입고/출고) — InOutLayout 재사용 */}
            <Route element={<InOutLayout />}>
              <Route path={OPERATION_ROUTES.inboundPending} element={<InboundRegisterPage />} />
              <Route path={OPERATION_ROUTES.inboundHistory} element={<InboundHistoryPage />} />
              <Route path={OPERATION_ROUTES.shipmentRegister} element={<OutboundRegisterPage />} />
              <Route path={OPERATION_ROUTES.shipmentHistory} element={<OutboundHistoryPage />} />
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
              <Route path="lot" element={<LotLifecyclePage />} />

              <Route path="defect-history" element={<Navigate to="/quality/defect-history" replace />} />

              {/* RC1 Route Registry — legacy single-target 경로 → canonical /operations/* (기존 query 유지) */}
              <Route path="plan" element={<LegacyOperationsRedirect to={OPERATION_ROUTES.productionPending} />} />
              <Route path="shot" element={<LegacyOperationsRedirect to={OPERATION_ROUTES.shotStatus} />} />
              <Route path="equipment-status" element={<LegacyOperationsRedirect to={OPERATION_ROUTES.equipmentStatus} />} />

              <Route path="daily-report" element={<LegacyOperationsRedirect to={OPERATION_ROUTES.dailyWork} />} />
              <Route path="cleaning-process" element={<LegacyOperationsRedirect to={OPERATION_ROUTES.cleaningProcess} />} />
              <Route path="manual-lot" element={<Navigate to={OPERATION_ROUTES.equipmentStatus} replace />} />

              <Route path="print" element={<PrintManagementWorkspace />} />

              <Route path="work-journal" element={<WorkJournal />} />

              <Route path="charging">
                <Route index element={<Navigate to={OPERATION_ROUTES.equipmentStatus} replace />} />
                <Route path="overview" element={<Navigate to={OPERATION_ROUTES.equipmentStatus} replace />} />
                <Route path="process/:processSlug" element={<Navigate to={OPERATION_ROUTES.equipmentStatus} replace />} />
                <Route path="equipment/:equipmentId" element={<ProductionChargingEquipmentPage />} />
              </Route>

            </Route>

            {/* RC1 Route Registry — canonical 생산관리 화면 (생산 대기/설비 가동 현황/작업일보/쇼트 작업현황) — ProductionLayout 재사용 */}
            <Route element={<ProductionLayout />}>
              <Route path={OPERATION_ROUTES.productionPending} element={<ProductionPlanWorkspace />} />
              <Route path={OPERATION_ROUTES.equipmentStatus} element={<EquipmentStatusPage embedded />} />
              <Route path={OPERATION_ROUTES.cleaningProcess} element={<TitanComingSoonPlaceholder title="세척공정" subtitle="세척공정 Workspace는 RC1 이후 Sprint에서 활성화 예정입니다." />} />
              <Route path={OPERATION_ROUTES.dailyWork} element={<DailyProductionReport />} />
              <Route
                path={OPERATION_ROUTES.shotStatus}
                element={
                  RC1_SHOT_PROCESS_COMING_SOON ? (
                    <TitanComingSoonPlaceholder
                      title="쇼트 작업현황"
                      subtitle={RC1_SHOT_PROCESS_POLICY.subtitle}
                    />
                  ) : (
                    <ShotWorkStatusPage />
                  )
                }
              />
            </Route>



            <Route path="/quality" element={<QualityLayout />}>

              <Route index element={<QualityManagementHubPage />} />

              <Route path="inspection">
                <Route index element={<Navigate to="/quality/inspection/status" replace />} />
                <Route path="register" element={<InspectionRegisterPage />} />
                <Route path="register/entry" element={<InspectionRegisterEntryPage />} />
                <Route path="status" element={<InspectionStatusPage />} />
                <Route path=":logId/report" element={<InspectionReportView />} />
                <Route path=":inspectionTab" element={<InspectionManagementScreen />} />
              </Route>

              <Route path="certificate">
                <Route index element={<Navigate to="/quality/certificate/register" replace />} />
                <Route path="register" element={<CertificateManagement />} />
                <Route path="status" element={<CertificateStatusPage />} />
              </Route>

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

              <Route index element={<DocumentsHubPage />} />
              <Route path="quality/certificates" element={<QualityCertificatesPage />} />
              <Route path="quality/by-company" element={<QualityByCompanyDocumentsPage />} />
              <Route path="incoming/purchase-orders" element={<IncomingPurchaseOrdersPage />} />
              <Route path="incoming/return-slips" element={<IncomingReturnSlipsPage />} />
              <Route path="incoming/other" element={<IncomingOtherDocumentsPage />} />
              <Route path="internal" element={<InternalDocumentsPage />} />
              <Route path="registry" element={<Navigate to="/documents/quality/by-company" replace />} />
              <Route path="incoming-archive" element={<IncomingDocumentArchivePage />} />
              <Route path="inspection" element={<ProductInspectionManagement />} />
              <Route path="drawings" element={<Navigate to="/documents/quality/by-company" replace />} />
              <Route path="work-standard" element={<Navigate to="/documents/quality/by-company" replace />} />
              <Route path="control-plan" element={<Navigate to="/documents/quality/by-company" replace />} />
              <Route path="other" element={<Navigate to="/documents/quality/by-company" replace />} />

            </Route>



            <Route path="/history" element={<HistoryLayout />}>

              <Route index element={<QualityHistoryInquiry />} />

            </Route>



            <Route
              path="/accounting-clerk"
              element={
                <Rc1AccountingClerkScreen>
                  <AccountingClerkHubPage />
                </Rc1AccountingClerkScreen>
              }
            />

            <Route
              path="/accounting-clerk/tax-invoices"
              element={
                <Rc1AccountingClerkScreen>
                  <AccountingClerkFeaturePage featureIdOverride="taxInvoice" />
                </Rc1AccountingClerkScreen>
              }
            />

            <Route
              path="/accounting-clerk/:featureId"
              element={
                <Rc1AccountingClerkScreen>
                  <AccountingClerkFeaturePage />
                </Rc1AccountingClerkScreen>
              }
            />

            <Route
              path="/accounting"
              element={
                <Rc1AccountingScreen>
                  <AccountingHubPage />
                </Rc1AccountingScreen>
              }
            />

            <Route
              path="/accounting/:featureId"
              element={
                <Rc1AccountingScreen>
                  <AccountingFeaturePage />
                </Rc1AccountingScreen>
              }
            />

            <Route path="/qr" element={<QrEngineLayout />}>
              <Route index element={<Navigate to="/qr/dashboard" replace />} />
              <Route path="dashboard" element={<QrEngineDashboardPage />} />
              <Route path="generator" element={<QrEngineGeneratorPage />} />
              <Route path="registry" element={<QrEngineRegistryPage />} />
              <Route path="scan" element={<QrEngineScanPage />} />
              <Route path="test-mode" element={<QrEngineTestModePage />} />
              <Route path="diagnostics" element={<QrEngineDiagnosticsPage />} />
              <Route path="equipment/:equipmentId" element={<QrEngineEquipmentWorkPage />} />
            </Route>

            <Route path="/qr-workflow" element={<Navigate to={OPERATION_ROUTES.equipmentStatus} replace />} />
            <Route path="/qr-workflow/charging" element={<Navigate to={OPERATION_ROUTES.equipmentStatus} replace />} />
            <Route path="/equipment-status" element={<Navigate to={OPERATION_ROUTES.equipmentStatus} replace />} />
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
              element={<Navigate to={`${OPERATION_ROUTES.equipmentStatus}?view=product`} replace />}
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

              <Route index element={<Navigate to="/settings/hub" replace />} />

              <Route path="dashboard" element={<MasterDashboard />} />

              <Route path="hub" element={<MasterDataHubPage />} />

              <Route path="companies" element={<CompanyManagementPage />} />

              <Route path="products" element={<ProductManagementPage />} />

              <Route path="materials" element={<MasterEntityManagementPage tabId="materials" />} />

              <Route path="processes" element={<MasterEntityManagementPage tabId="processes" />} />

              <Route path="equipment" element={<MasterEntityManagementPage tabId="equipment" />} />

              <Route path="workers" element={<MasterEntityManagementPage tabId="workers" />} />

              <Route path="recipes" element={<RecipeManagementPage />} />

              <Route path="hold/:holdId" element={<MasterHoldPlaceholderPage />} />

              <Route path="customCodes" element={<Navigate to="/settings/hold/custom-codes" replace />} />

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

              <Route path="process-templates" element={<EnvironmentSectionPage sectionId="processTemplates" />} />
              <Route path="inspection-templates" element={<EnvironmentSectionPage sectionId="inspectionTemplates" />} />
              <Route path="certificate-policies" element={<EnvironmentSectionPage sectionId="certificatePolicies" />} />

              <Route path="qr-settings" element={<EnvironmentSectionPage sectionId="qrSettings" />} />

              <Route path="backup" element={<EnvironmentSectionPage sectionId="backup" />} />

              <Route path="notifications" element={<EnvironmentSectionPage sectionId="notifications" />} />

              <Route path="system" element={<EnvironmentSectionPage sectionId="system" />} />

              <Route path="data" element={<EnvironmentSectionPage sectionId="data" />} />

              <Route path="status" element={<Navigate to="system" replace />} />

              <Route path="employees" element={<MasterDataManagement forcedTabId="employees" />} />

              <Route path="customCodes" element={<Navigate to="/settings/hold/custom-codes" replace />} />

              <Route path="defect-codes" element={<Navigate to="/settings/hold/defect-codes" replace />} />

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



/** file:// (Electron packaged) needs hash routing; http(s) keeps browser history. */
const isFileProtocol =
  typeof window !== "undefined" && window.location.protocol === "file:";
const AppHistoryRouter = isFileProtocol ? HashRouter : BrowserRouter;

function AppRouter() {
  return (
    <AppHistoryRouter>
      <AppRoutes />
    </AppHistoryRouter>
  );
}



export default AppRouter;

