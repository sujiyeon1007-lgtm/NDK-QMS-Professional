import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
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
import SectionPage from "../foundation/pages/SectionPage";
import { LEGACY_ROUTE_REDIRECTS } from "../config/menuStructure";

function LegacyRedirect({ to }) {
  return <Navigate to={to} replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

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
            <Route path="certificate" element={<CertificateManagement />} />
          </Route>

          <Route path="/personal" element={<Navigate to="/personal/pending" replace />} />
          <Route path="/personal/:tab" element={<SectionPage sectionId="personal" />} />

          <Route path="/statistics" element={<Navigate to="/statistics/history" replace />} />
          <Route path="/statistics/:tab" element={<SectionPage sectionId="statistics" />} />

          <Route path="/settings" element={<Navigate to="/settings/companies" replace />} />
          <Route path="/settings/:tab" element={<SectionPage sectionId="master" />} />

          <Route path="/environment" element={<Navigate to="/environment/program" replace />} />
          <Route path="/environment/:tab" element={<SectionPage sectionId="environment" />} />

          {Object.entries(LEGACY_ROUTE_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<LegacyRedirect to={to} />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
