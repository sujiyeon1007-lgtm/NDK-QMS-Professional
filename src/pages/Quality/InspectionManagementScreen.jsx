import { Navigate, useParams } from "react-router-dom";
import { resolveInspectionTab } from "../../config/inspectionManagement";
import MassProductionInspection from "./MassProductionInspection";
import DevelopmentInspection from "./DevelopmentInspection";
import OtherInspection from "./OtherInspection";

export default function InspectionManagementScreen() {
  const { inspectionTab: tabParam = "mass" } = useParams();

  if (tabParam === "register") {
    return <Navigate to="/quality/inspection/register" replace />;
  }

  const inspectionTab = resolveInspectionTab(tabParam);

  if (inspectionTab === "dev") {
    return <DevelopmentInspection />;
  }

  if (inspectionTab === "other") {
    return <OtherInspection />;
  }

  return <MassProductionInspection />;
}
