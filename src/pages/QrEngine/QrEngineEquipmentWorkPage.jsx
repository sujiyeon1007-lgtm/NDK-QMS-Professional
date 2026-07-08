import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { getEquipmentDetailSnapshot } from "../../utils/equipmentWorkflowService";
import { buildQrWorkflowTechnologyView } from "../../utils/qrWorkflowTechnologyBridge";
import QrWorkflowTechnologyStack from "../QrManagement/components/QrWorkflowTechnologyStack";
import { useQRWorkflow } from "../QrManagement/hooks/useQRWorkflow";
import QrEnginePageShell, { qrEngineBreadcrumbTrail } from "./QrEnginePageShell";
import "../QrManagement/QRManagement.css";
import "../QrManagement/components/QrWorkflowTechnologyStack.css";

export default function QrEngineEquipmentWorkPage() {
  const { equipmentId } = useParams();
  const { selectedEquipment, activeSession, availableLots, activeLotId, refreshKey } =
    useQRWorkflow(equipmentId);

  const detail = useMemo(
    () => getEquipmentDetailSnapshot(equipmentId),
    [equipmentId, refreshKey]
  );

  const selectedLotRow = useMemo(
    () => availableLots.find((row) => row.id === activeLotId) ?? null,
    [availableLots, activeLotId]
  );

  const technologyView = useMemo(
    () =>
      buildQrWorkflowTechnologyView({
        equipmentDetail: detail,
        equipment: selectedEquipment,
        activeSession,
        selectedLotRow,
      }),
    [detail, selectedEquipment, activeSession, selectedLotRow, refreshKey]
  );

  if (!detail || !selectedEquipment) {
    return <Navigate to={QR_ENGINE_ROUTES.scan} replace />;
  }

  const title = detail.equipmentName ?? selectedEquipment.name ?? equipmentId;

  return (
    <QrEnginePageShell
      breadcrumbItems={[
        ...qrEngineBreadcrumbTrail(QR_ENGINE_COPY.equipmentWorkTitle),
        { label: title },
      ]}
      title={title}
      description={`${detail.process ?? ""} · ${QR_ENGINE_COPY.equipmentWorkTitle}`}
    >
      <div className="qr-engine-page qr-management-page">
        <div className="qr-engine-work-actions">
          <Link
            className="titan-btn titan-btn--primary"
            to={QR_ENGINE_ROUTES.chargingEquipment(equipmentId)}
          >
            {QR_ENGINE_COPY.openCharging}
          </Link>
          <Link className="titan-btn titan-btn--secondary" to={QR_ENGINE_ROUTES.scan}>
            {QR_ENGINE_COPY.backToScan}
          </Link>
          <Link className="titan-btn titan-btn--secondary" to={QR_ENGINE_ROUTES.dashboard}>
            {QR_ENGINE_COPY.backToDashboard}
          </Link>
        </div>

        <QrWorkflowTechnologyStack view={technologyView} />
      </div>
    </QrEnginePageShell>
  );
}