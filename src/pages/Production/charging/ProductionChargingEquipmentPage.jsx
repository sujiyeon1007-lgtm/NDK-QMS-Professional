import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { OPERATION_ROUTES } from "../../../config/operationsRouteRegistry";
import ProcessStepCompleteDialog from "./ProcessStepCompleteDialog";
import ProductionChargingPageShell from "./ProductionChargingPageShell";
import TitanListInteractionHint from "../../../foundation/components/TitanListInteractionHint";
import { buildProductionChargingBreadcrumb, breadcrumbTrailEnd } from "../../../config/titanBreadcrumbPolicy";
import { getEquipmentDetailSnapshot } from "../../../utils/equipmentWorkflowService";
import EquipmentChargingWorkflowContent from "../../QrManagement/components/EquipmentChargingWorkflowContent";
import EquipmentMonitorDetailPanel from "../../EquipmentStatus/EquipmentMonitorDetailPanel";
import { useQRWorkflow } from "../../QrManagement/hooks/useQRWorkflow";
import TitanWorkflowNextStepDialog from "../../../foundation/components/TitanWorkflowNextStepDialog";
import "../../QrManagement/QRManagement.css";
import "../../QrManagement/components/EquipmentChargingWorkflowContent.css";
import "../../EquipmentStatus/EquipmentMonitorDetailPanel.css";

/** 설비 상세 — 장입 시작 · 열처리 완료 작업 화면 */
export default function ProductionChargingEquipmentPage() {
  const navigate = useNavigate();
  const { equipmentId } = useParams();
  const workflow = useQRWorkflow(equipmentId);

  const detail = useMemo(
    () => getEquipmentDetailSnapshot(equipmentId),
    [equipmentId, workflow.refreshKey]
  );

  if (!detail || !workflow.selectedEquipment) {
    return <Navigate to={OPERATION_ROUTES.equipmentStatus} replace />;
  }

  const processPath = OPERATION_ROUTES.equipmentStatus;

  return (
    <ProductionChargingPageShell
      breadcrumbItems={buildProductionChargingBreadcrumb(
        { label: detail.process, to: processPath },
        breadcrumbTrailEnd(detail.equipmentName)
      )}
      title={detail.equipmentName}
      description={`${detail.process} · QR Scan · LOT 선택 · 장입 · 열처리 완료`}
    >
      <div className="qr-management-page">
        <TitanListInteractionHint />

        <EquipmentMonitorDetailPanel detail={detail} />

        <EquipmentChargingWorkflowContent
          layout="page"
          availableLots={workflow.availableLots}
          activeLotId={workflow.activeLotId}
          activeSession={workflow.activeSession}
          selectLot={workflow.selectLot}
          chargingButtons={workflow.chargingButtons}
          handleStartCharging={workflow.handleStartCharging}
          handleFinishCharging={workflow.handleFinishCharging}
          workflowError={workflow.workflowError}
          draftLotNo={workflow.draftLotNo}
          autoLotNo={workflow.autoLotNo}
          lotInputMode={workflow.lotInputMode}
          setLotInputMode={workflow.setLotInputMode}
          setDraftLotNo={workflow.setDraftLotNo}
          restoreAutoLotNo={workflow.restoreAutoLotNo}
          chargeQtyEnabled={workflow.chargeQtyEnabled}
          setChargeQtyEnabled={workflow.setChargeQtyEnabled}
          draftChargeQty={workflow.draftChargeQty}
          setDraftChargeQty={workflow.setDraftChargeQty}
        />
      </div>

      <ProcessStepCompleteDialog
        open={workflow.stepCompleteDialog.open}
        record={workflow.stepCompleteDialog.record}
        onClose={workflow.closeStepCompleteDialog}
        onConfirm={workflow.confirmStepComplete}
      />

      <TitanWorkflowNextStepDialog
        open={Boolean(workflow.workflowNextStep)}
        step={workflow.workflowNextStep}
        onNavigate={(path) => {
          navigate(path);
          workflow.setWorkflowNextStep(null);
        }}
        onStay={() => workflow.setWorkflowNextStep(null)}
        onClose={() => workflow.setWorkflowNextStep(null)}
      />
    </ProductionChargingPageShell>
  );
}
