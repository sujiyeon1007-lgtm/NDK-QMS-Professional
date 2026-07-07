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

import ProductionResultsManagement from "../pages/Production/ProductionResultsManagement";

import DefectHistoryManagement from "../pages/Production/DefectHistoryManagement";

import QualityLayout from "../pages/Quality/QualityLayout";

import QualityManagementHubPage from "../pages/Quality/QualityManagementHubPage";
import InspectionManagementScreen from "../pages/Quality/InspectionManagementScreen";

import CertificateManagement from "../pages/Quality/CertificateManagement";

import InspectionReportView from "../pages/Quality/InspectionReportView";

import InspectionLogRegisterView from "../pages/Quality/InspectionLogRegisterView";

import StatisticsLayout from "../pages/Statistics/StatisticsLayout";

import StatisticsScreen from "../pages/Statistics/StatisticsScreen";

import SettingsLayout from "../pages/Settings/SettingsLayout";

import MasterDataHubPage from "../pages/Settings/MasterDataHubPage";

import CompanyManagementPage from "../pages/Settings/CompanyManagementPage";

import ProductManagementPage from "../pages/Settings/ProductManagementPage";

import MasterEntityManagementPage from "../pages/Settings/MasterEntityManagementPage";

import MasterDataManagement from "../pages/Settings/MasterDataManagement";

import ProductInspectionManagement from "../pages/Settings/ProductInspectionManagement";

import EnvironmentLayout from "../pages/Environment/EnvironmentLayout";

import EnvironmentManagement from "../pages/Environment/EnvironmentManagement";

import DocumentsLayout from "../pages/Documents/DocumentsLayout";

import DocumentManagementPage from "../pages/Documents/DocumentManagementPage";

import HistoryLayout from "../pages/History/HistoryLayout";

import QualityHistoryInquiry from "../pages/History/QualityHistoryInquiry";

import InventoryStatusLayout from "../pages/Inventory/InventoryStatusLayout";

import InventoryStatusPage from "../pages/Inventory/InventoryStatusPage";

import WorkJournal from "../pages/WorkJournal/WorkJournal";

import OperationModeGuard from "./OperationModeGuard";
import ModuleGuard from "./ModuleGuard";
import LoginGuard from "./LoginGuard";
import PermissionGuard from "./PermissionGuard";

import LoginPage from "../pages/Login/LoginPage";

import AccountingClerkHubPage from "../pages/AccountingClerk/AccountingClerkHubPage";
import AccountingClerkFeaturePage from "../pages/AccountingClerk/AccountingClerkFeaturePage";
import TaxInvoiceStatusPage from "../pages/AccountingClerk/TaxInvoiceStatusPage";
import AccountingHubPage from "../pages/Accounting/AccountingHubPage";
import AccountingFeaturePage from "../pages/Accounting/AccountingFeaturePage";
import QrManagementLayout from "../pages/QrManagement/QrManagementLayout";
import QrInoutScreen from "../pages/QrManagement/QrInoutScreen";
import QrEquipmentScreen from "../pages/QrManagement/QrEquipmentScreen";
import QRManagement from "../pages/QrManagement";
import QrChargingLayout from "../pages/QrManagement/QrChargingLayout";
import QrChargingHubPage from "../pages/QrManagement/QrChargingHubPage";
import EquipmentStatusPage from "../pages/EquipmentStatus/EquipmentStatusPage";
import ProductStatusPage from "../pages/ProductStatus/ProductStatusPage";

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

              <Route path="defect-history" element={<Navigate to="/quality/defect-history" replace />} />

              <Route path="daily-report" element={<DailyProductionReport />} />

              <Route path="work-journal" element={<WorkJournal />} />

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

              <Route path="work-journal" element={<WorkJournal />} />

            </Route>



            <Route path="/department-work" element={<Navigate to="/work-journal" replace />} />

            <Route path="/department-work/:departmentTab" element={<Navigate to="/work-journal" replace />} />



            <Route path="/personal" element={<Navigate to="/work-journal" replace />} />

            <Route path="/personal/:tab" element={<Navigate to="/work-journal" replace />} />



            <Route path="/statistics" element={<StatisticsLayout />}>

              <Route index element={<Navigate to="/statistics/production" replace />} />

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

            <Route path="/accounting-clerk/tax-invoices" element={<TaxInvoiceStatusPage />} />

            <Route path="/accounting-clerk/:featureId" element={<AccountingClerkFeaturePage />} />

            <Route path="/accounting" element={<AccountingHubPage />} />

            <Route path="/accounting/:featureId" element={<AccountingFeaturePage />} />

            <Route path="/qr-workflow" element={<QrChargingLayout />}>
              <Route index element={<QrChargingHubPage />} />
              <Route path="charging" element={<QRManagement />} />
            </Route>
            <Route path="/equipment-status" element={<EquipmentStatusPage />} />
            <Route path="/product-status" element={<ProductStatusPage />} />

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

              <Route index element={<MasterDataHubPage />} />

              <Route path="companies" element={<CompanyManagementPage />} />

              <Route path="products" element={<ProductManagementPage />} />

              <Route path="materials" element={<MasterEntityManagementPage tabId="materials" />} />

              <Route path="processes" element={<MasterEntityManagementPage tabId="processes" />} />

              <Route path="equipment" element={<MasterEntityManagementPage tabId="equipment" />} />

              <Route path="workers" element={<MasterEntityManagementPage tabId="workers" />} />

              <Route path="company" element={<Navigate to="/settings/companies" replace />} />

              <Route path="baseline" element={<Navigate to="/settings/materials" replace />} />

              <Route path="baseline/:baselineTab" element={<BaselineTabLegacyRedirect />} />

            </Route>



            <Route path="/environment" element={<EnvironmentLayout />}>

              <Route index element={<Navigate to="users" replace />} />

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

