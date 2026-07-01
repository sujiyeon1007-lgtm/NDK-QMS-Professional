import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import TitanErrorBoundary from "../foundation/components/TitanErrorBoundary";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import HomeNotices from "../pages/Home/HomeNotices";
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
import MasterDataManagement from "../pages/Settings/MasterDataManagement";
import ProductInspectionManagement from "../pages/Settings/ProductInspectionManagement";
import EnvironmentLayout from "../pages/Environment/EnvironmentLayout";
import EnvironmentManagement from "../pages/Environment/EnvironmentManagement";
import { LEGACY_ROUTE_REDIRECTS } from "../config/menuStructure";

function LegacyRedirect({ to }) {
  return <Navigate to={to} replace />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <TitanErrorBoundary resetKey={location.pathname}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/notices" element={<HomeNotices />} />

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

          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="companies" replace />} />
            <Route path="inspection" element={<ProductInspectionManagement />} />
            <Route path=":tab" element={<MasterDataManagement />} />
          </Route>

          <Route path="/environment" element={<EnvironmentLayout />}>
            <Route index element={<Navigate to="company" replace />} />
            <Route path=":tab" element={<EnvironmentManagement />} />
          </Route>

          {Object.entries(LEGACY_ROUTE_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<LegacyRedirect to={to} />} />
          ))}
        </Route>
      </Routes>
    </TitanErrorBoundary>
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
