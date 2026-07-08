import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";

import ProductionChargingPageShell from "./ProductionChargingPageShell";
import TitanListInteractionHint from "../../../foundation/components/TitanListInteractionHint";
import { QR_CHARGING_PAGE_COPY } from "../../../config/equipmentConfig";
import { getProductionChargingProcessSlug } from "../../../config/productionChargingProcessSlugs";
import { buildProductionChargingBreadcrumb, breadcrumbTrailEnd } from "../../../config/titanBreadcrumbPolicy";
import { getEquipmentDetailSnapshot } from "../../../utils/equipmentWorkflowService";
import { buildQrWorkflowTechnologyView } from "../../../utils/qrWorkflowTechnologyBridge";
import EquipmentChargingActions from "../../QrManagement/components/EquipmentChargingActions";
import CurrentProcess from "../../QrManagement/components/CurrentProcess";
import LotTable from "../../QrManagement/components/LotTable";
import QrWorkflowTechnologyStack from "../../QrManagement/components/QrWorkflowTechnologyStack";
import { useQRWorkflow } from "../../QrManagement/hooks/useQRWorkflow";
import "../../QrManagement/QRManagement.css";
import "../../QrManagement/components/QrWorkflowTechnologyStack.css";

/** 설비 상세 — 장입 시작 · 열처리 완료 작업 화면 */
export default function ProductionChargingEquipmentPage() {
  const { equipmentId } = useParams();
  const {
    chargingButtons,
    availableLots,
    activeLotId,
    activeSession,
    selectLot,
    selectedEquipment,
    handleStartCharging,
    handleFinishCharging,
    workflowError,
    refreshKey,
  } = useQRWorkflow(equipmentId);

  const detail = useMemo(() => getEquipmentDetailSnapshot(equipmentId), [equipmentId, refreshKey]);

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

  const traceabilityLotNo =
    selectedLotRow?.lotNo ??
    activeSession?.lotNo ??
    detail?.currentLotNo ??
    "";

  if (!detail || !selectedEquipment) {
    return <Navigate to="/production/charging" replace />;
  }

  const processSlug = getProductionChargingProcessSlug(detail.process);
  const processPath = processSlug ? `/production/charging/process/${processSlug}` : "/production/charging";

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

      <section className="qr-management-page__lot-panel" aria-label="장입 가능 LOT">
        <h2 className="qr-management-page__section-title">{QR_CHARGING_PAGE_COPY.lotSectionTitle}</h2>
        <LotTable rows={availableLots} activeRowId={activeLotId} onRowClick={(row) => selectLot(row.id)} />
      </section>

      <QrWorkflowTechnologyStack view={technologyView} />

      {traceabilityLotNo && !technologyView?.hasTechnologyData ? (
        <p className="home-empty" role="status">
          LOT {traceabilityLotNo} — Sprint 9 기술 데이터(Recipe · Actual Work · Knowledge)가 아직 연결되지 않았습니다.
        </p>
      ) : null}

      {workflowError ? (
        <p className="home-empty" role="alert">
          {workflowError}
        </p>
      ) : null}

      <div
        className={`qr-management-page__footer${
          chargingButtons.showStart || chargingButtons.showComplete
            ? ""
            : " qr-management-page__footer--no-actions"
        }`}
      >
        <CurrentProcess session={activeSession} />
        <EquipmentChargingActions
          buttonState={chargingButtons}
          onStart={handleStartCharging}
          onComplete={handleFinishCharging}
        />
      </div>
      </div>
    </ProductionChargingPageShell>
  );
}
