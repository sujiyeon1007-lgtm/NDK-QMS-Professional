import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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

import DepartmentWorkLayout from "../pages/DepartmentWork/DepartmentWorkLayout";

import DepartmentWorkManagement from "../pages/DepartmentWork/DepartmentWorkManagement";

import StatisticsLayout from "../pages/Statistics/StatisticsLayout";

import StatisticsScreen from "../pages/Statistics/StatisticsScreen";

import SettingsLayout from "../pages/Settings/SettingsLayout";

import MasterDataHubPage from "../pages/Settings/MasterDataHubPage";

import MasterDataManagement from "../pages/Settings/MasterDataManagement";

import ProductInspectionManagement from "../pages/Settings/ProductInspectionManagement";

import EnvironmentLayout from "../pages/Environment/EnvironmentLayout";

import EnvironmentManagement from "../pages/Environment/EnvironmentManagement";

import DocumentsLayout from "../pages/Documents/DocumentsLayout";

import DocumentManagementPage from "../pages/Documents/DocumentManagementPage";

import HistoryLayout from "../pages/History/HistoryLayout";

import QualityHistoryInquiry from "../pages/History/QualityHistoryInquiry";

import OperationModeGuard from "./OperationModeGuard";

import { LEGACY_ROUTE_REDIRECTS } from "../config/menuStructure";



function LegacyRedirect({ to }) {

  return <Navigate to={to} replace />;

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



            <Route path="/department-work" element={<DepartmentWorkLayout />}>

              <Route index element={<Navigate to="/department-work/all" replace />} />

              <Route path=":departmentTab" element={<DepartmentWorkManagement />} />

            </Route>



            <Route path="/personal" element={<Navigate to="/department-work/all" replace />} />

            <Route path="/personal/:tab" element={<Navigate to="/department-work/all" replace />} />



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

              <Route path="company" element={<Navigate to="/settings" replace />} />

              <Route path="baseline" element={<Navigate to="/settings" replace />} />

              <Route path="baseline/:baselineTab" element={<Navigate to="/settings" replace />} />

              <Route path="companies" element={<Navigate to="/settings" replace />} />

              <Route path="products" element={<Navigate to="/settings" replace />} />

              <Route path="materials" element={<Navigate to="/settings" replace />} />

              <Route path="processes" element={<Navigate to="/settings" replace />} />

              <Route path="equipment" element={<Navigate to="/settings" replace />} />

              <Route path="workers" element={<Navigate to="/settings" replace />} />

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

