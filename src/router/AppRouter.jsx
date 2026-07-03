import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import { OPERATION_MODE_WELCOME_ENABLED } from "../config/titanV1DevelopmentDirection";

import MainLayout from "../layouts/MainLayout";

import OperationModeWelcome from "../pages/Welcome/OperationModeWelcome";

import Home from "../pages/Home/Home";

import InOutLayout from "../pages/InOut/InOutLayout";

import InboundManagement from "../pages/InOut/InboundManagement";

import OutboundManagement from "../pages/InOut/OutboundManagement";

import ProductionLayout from "../pages/Production/ProductionLayout";

import DailyProductionReport from "../pages/Production/DailyProductionReport";

import ProductionResultsManagement from "../pages/Production/ProductionResultsManagement";

import DefectHistoryManagement from "../pages/Production/DefectHistoryManagement";

import QualityLayout from "../pages/Quality/QualityLayout";

import InspectionLogManagement from "../pages/Quality/InspectionLogManagement";

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

import WorkJournalLayout from "../pages/WorkJournal/WorkJournalLayout";

import WorkJournal from "../pages/WorkJournal/WorkJournal";

import OperationModeGuard from "./OperationModeGuard";

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

        <Route element={<OperationModeGuard />}>
          <Route element={<MainLayout />}>
            {!OPERATION_MODE_WELCOME_ENABLED ? (
              <Route path="/" element={<Navigate to="/home" replace />} />
            ) : null}

            <Route path="/home" element={<Home />} />



            <Route path="/inout" element={<InOutLayout />}>

              <Route index element={<Navigate to="/inout/incoming" replace />} />

              <Route path="incoming" element={<InboundManagement />} />

              <Route path="shipment" element={<OutboundManagement />} />

            </Route>



            <Route path="/inventory" element={<InventoryStatusLayout />}>

              <Route index element={<InventoryStatusPage />} />

            </Route>



            <Route path="/work-journal" element={<WorkJournalLayout />}>

              <Route index element={<WorkJournal />} />

            </Route>



            <Route path="/production" element={<ProductionLayout />}>

              <Route index element={<Navigate to="/production/daily-report" replace />} />

              <Route path="register" element={<Navigate to="/production/daily-report" replace />} />

              <Route path="results" element={<ProductionResultsManagement />} />

              <Route path="defect-history" element={<DefectHistoryManagement />} />

              <Route path="daily-report" element={<DailyProductionReport />} />

            </Route>



            <Route path="/quality" element={<QualityLayout />}>

              <Route index element={<Navigate to="inspection" replace />} />

              <Route path="inspection" element={<InspectionLogManagement />} />

              <Route path="inspection/register" element={<InspectionLogRegisterView />} />

              <Route path="inspection/:logId/report" element={<InspectionReportView />} />

              <Route path="certificate" element={<CertificateManagement />} />

            </Route>



            <Route path="/department-work" element={<Navigate to="/work-journal" replace />} />

            <Route path="/department-work/:departmentTab" element={<Navigate to="/work-journal" replace />} />



            <Route path="/personal" element={<Navigate to="/work-journal" replace />} />

            <Route path="/personal/:tab" element={<Navigate to="/work-journal" replace />} />



            <Route path="/statistics" element={<StatisticsLayout />}>

              <Route index element={<Navigate to="/statistics/inquiry" replace />} />

              <Route path=":statisticsTab" element={<StatisticsScreen />} />

            </Route>



            <Route path="/documents" element={<DocumentsLayout />}>

              <Route index element={<DocumentManagementPage />} />

              <Route path="inspection" element={<ProductInspectionManagement />} />

            </Route>



            <Route path="/history" element={<HistoryLayout />}>

              <Route index element={<QualityHistoryInquiry />} />

            </Route>



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

              <Route index element={<Navigate to="program" replace />} />

              <Route path="employees" element={<MasterDataManagement forcedTabId="employees" />} />

              <Route path="customCodes" element={<MasterDataManagement forcedTabId="customCodes" />} />

              <Route path=":tab" element={<EnvironmentManagement />} />

            </Route>



            {Object.entries(LEGACY_ROUTE_REDIRECTS).map(([from, to]) => (

              <Route key={from} path={from} element={<LegacyRedirect to={to} />} />

            ))}

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

