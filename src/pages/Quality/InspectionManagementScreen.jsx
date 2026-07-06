import { useParams } from "react-router-dom";
import { resolveInspectionTab } from "../../config/inspectionManagement";
import MassProductionInspection from "./MassProductionInspection";
import DevelopmentInspection from "./DevelopmentInspection";
import OtherInspection from "./OtherInspection";
import InspectionLogRegisterView from "./InspectionLogRegisterView";

export default function InspectionManagementScreen() {
  const { inspectionTab: tabParam = "mass" } = useParams();

  if (tabParam === "register") {
    return <InspectionLogRegisterView />;
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
