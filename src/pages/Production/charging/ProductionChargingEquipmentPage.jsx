import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";

import ProductionChargingPageShell from "./ProductionChargingPageShell";
import StatusChip from "../../../foundation/components/StatusChip";
import TitanListInteractionHint from "../../../foundation/components/TitanListInteractionHint";
import {
  EQUIPMENT_RUN_STATUS_META,
  QR_CHARGING_PAGE_COPY,
} from "../../../config/equipmentConfig";
import { getProductionChargingProcessSlug } from "../../../config/productionChargingProcessSlugs";
import { buildProductionChargingBreadcrumb, breadcrumbTrailEnd } from "../../../config/titanBreadcrumbPolicy";
import { getEquipmentDetailSnapshot } from "../../../utils/equipmentWorkflowService";
import { getWorkflowTimelineItems } from "../../../utils/titanWorkflowIntegration";
import EquipmentChargingActions from "../../QrManagement/components/EquipmentChargingActions";
import CurrentProcess from "../../QrManagement/components/CurrentProcess";
import LotTable from "../../QrManagement/components/LotTable";
import LotTraceabilityPanel from "../../QrManagement/components/LotTraceabilityPanel";
import HomeAnimatedProgressBar from "../../Home/HomeAnimatedProgressBar";
import { useQRWorkflow } from "../../QrManagement/hooks/useQRWorkflow";
import "../../QrManagement/QRManagement.css";
import "../../EquipmentStatus/EquipmentMonitorDetailPanel.css";

function WorkTimeline({ items = [] }) {
  return (
    <section className="equipment-monitor-detail" aria-label="작업 내역">
      <h3 className="equipment-monitor-detail__head">작업 내역 (Timeline)</h3>
      {items.length === 0 ? (
        <p className="home-empty">표시할 Timeline 이력이 없습니다.</p>
      ) : (
        <ol className="equipment-monitor-detail__timeline">
          {items.map((row) => (
            <li key={`${row.time}-${row.label}-${row.detail}`}>
              <time>{row.time}</time>
              <strong>{row.label}</strong>
              <span>{row.detail}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

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

  const timelineItems = useMemo(
    () => getWorkflowTimelineItems(equipmentId, detail?.currentLotNo ?? activeSession?.lotNo ?? ""),
    [equipmentId, detail?.currentLotNo, activeSession?.lotNo, refreshKey]
  );

  const traceabilityLotNo =
    activeSession?.lotNo ??
    (availableLots.find((row) => row.id === activeLotId)?.lotNo ?? "") ??
    detail?.currentLotNo ??
    "";

  if (!detail || !selectedEquipment) {
    return <Navigate to="/production/charging" replace />;
  }

  const statusMeta = EQUIPMENT_RUN_STATUS_META[detail.status] ?? EQUIPMENT_RUN_STATUS_META.idle;
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
        <div className="equipment-monitor-detail equipment-monitor-detail--inline">
        <div className="equipment-monitor-detail__head">
          <h3>현재 상태</h3>
          <StatusChip variant={statusMeta.variant}>
            {statusMeta.emoji} {statusMeta.label}
          </StatusChip>
        </div>

        <dl className="equipment-monitor-detail__grid">
          <div>
            <dt>현재 LOT</dt>
            <dd>{detail.currentLotNo ?? "—"}</dd>
          </div>
          <div>
            <dt>시작시간</dt>
            <dd>{detail.startTime ?? "—"}</dd>
          </div>
          <div>
            <dt>예상 종료</dt>
            <dd>{detail.expectedEndTime ?? "—"}</dd>
          </div>
          <div className="equipment-monitor-detail__progress">
            <dt>진행률</dt>
            <dd>
              <HomeAnimatedProgressBar percent={detail.progress ?? 0} processKey="production" />
            </dd>
          </div>
        </dl>

        {detail.sameLotProducts?.length > 0 ? (
          <div className="equipment-monitor-detail__same-lot">
            <h4>작업 제품 목록</h4>
            {detail.currentLotNo ? (
              <p className="equipment-monitor-detail__lot-no">{detail.currentLotNo}</p>
            ) : null}
            <ul>
              {detail.sameLotProducts.map((product) => (
                <li key={product.partName}>
                  {product.partName}
                  {product.partNo ? ` · ${product.partNo}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        </div>

        <TitanListInteractionHint />

      <section className="qr-management-page__lot-panel" aria-label="장입 가능 LOT">
        <h2 className="qr-management-page__section-title">{QR_CHARGING_PAGE_COPY.lotSectionTitle}</h2>
        <LotTable rows={availableLots} activeRowId={activeLotId} onRowClick={(row) => selectLot(row.id)} />
      </section>

      <WorkTimeline items={timelineItems} />

      <LotTraceabilityPanel lotNo={traceabilityLotNo} />

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
