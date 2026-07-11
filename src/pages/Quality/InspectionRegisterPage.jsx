import { useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import MassProductionInspection from "./MassProductionInspection";
import OtherInspection from "./OtherInspection";
import InspectionLogRegisterView from "./InspectionLogRegisterView";
import TitanWorkflowNavigation from "../../foundation/components/TitanWorkflowNavigation";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import {
  INSPECTION_TYPE,
  resolveInspectionRegisterTab,
} from "../../config/inspectionManagement";
import { getInspectionMassScreenData } from "../../utils/qualityWorkspaceData";
import "./QualityManagement.css";

export default function InspectionRegisterPage() {
  const [searchParams] = useSearchParams();
  const hasEntryQuery =
    searchParams.has("managementId") ||
    searchParams.has("category") ||
    searchParams.has("devId") ||
    searchParams.has("otherId");

  if (hasEntryQuery) {
    const query = searchParams.toString();
    return (
      <Navigate
        to={"/quality/inspection/register/entry" + (query ? "?" + query : "")}
        replace
      />
    );
  }

  const activeTab = resolveInspectionRegisterTab(searchParams.get("tab"));
  const chipRecords = useMemo(() => getInspectionMassScreenData().baseRecords, []);

  return (
    <div className="quality-register-page">
      <TitanWorkflowNavigation stepId="inspectionRegister" />
      <TitanKpiBarSlot ariaLabel="검사 등록" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar chipSetId="inspection" records={chipRecords} />
      </TitanKpiBarSlot>
      {activeTab === "mass" ? (
        <MassProductionInspection
          viewMode="task"
          inspectionTypeFilter={INSPECTION_TYPE.MASS}
          showToolbarRegister={false}
          showWorkflowNav={false}
          showKpi={false}
          registerOnlyActions
          registerCategory="양산"
        />
      ) : null}
      {activeTab === "dev" ? (
        <MassProductionInspection
          viewMode="task"
          inspectionTypeFilter={INSPECTION_TYPE.DEVELOPMENT}
          showToolbarRegister={false}
          showWorkflowNav={false}
          showKpi={false}
          registerOnlyActions
          registerCategory="개발"
        />
      ) : null}
      {activeTab === "other" ? <OtherInspection embedded /> : null}
    </div>
  );
}

export function InspectionRegisterEntryPage() {
  return <InspectionLogRegisterView />;
}
