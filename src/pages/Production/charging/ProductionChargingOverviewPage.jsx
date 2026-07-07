import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ProductionChargingPageShell from "./ProductionChargingPageShell";
import StatusChip from "../../../foundation/components/StatusChip";
import { EQUIPMENT_RUN_STATUS_META } from "../../../config/equipmentConfig";
import { PRODUCTION_CHARGING_OVERVIEW_COPY } from "../../../config/productionChargingLauncher";
import { buildProductionChargingBreadcrumb, breadcrumbTrailEnd } from "../../../config/titanBreadcrumbPolicy";
import {
  getEquipmentDetailSnapshot,
  getEquipmentListGroupedByProcess,
} from "../../../utils/equipmentWorkflowService";
import { getProductionChargingScreenData } from "../../../utils/productionWorkspaceData";
import EquipmentSummaryBar from "../../QrManagement/components/EquipmentSummaryBar";
import EquipmentQrScanBar from "../../QrManagement/components/EquipmentQrScanBar";
import { useEquipmentQrScan } from "../../QrManagement/hooks/useEquipmentQrScan";
import HomeAnimatedProgressBar from "../../Home/HomeAnimatedProgressBar";
import "../../EquipmentStatus/EquipmentStatusPage.css";
import "../../EquipmentStatus/EquipmentMonitorDetailPanel.css";
import "../../QrManagement/QRManagement.css";

function OverviewEquipmentCard({ equipment, selected, onSelect }) {
  const statusMeta = EQUIPMENT_RUN_STATUS_META[equipment.status] ?? EQUIPMENT_RUN_STATUS_META.idle;

  return (
    <button
      type="button"
      className={`equipment-monitor-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(equipment.equipmentId)}
      aria-pressed={selected}
    >
      <div className="equipment-monitor-card__head">
        <span aria-hidden="true">{statusMeta.emoji}</span>
        <strong>{equipment.equipmentName}</strong>
        <StatusChip variant={statusMeta.variant}>{statusMeta.label}</StatusChip>
      </div>
      <dl className="equipment-monitor-card__meta">
        <div>
          <dt>LOT</dt>
          <dd>{equipment.currentLotNo ?? "—"}</dd>
        </div>
        <div>
          <dt>진행률</dt>
          <dd>{equipment.progress > 0 ? `${equipment.progress}%` : "—"}</dd>
        </div>
        <div>
          <dt>시작</dt>
          <dd>{equipment.startTime ?? "—"}</dd>
        </div>
        <div>
          <dt>종료예정</dt>
          <dd>{equipment.expectedEndTime ?? "—"}</dd>
        </div>
      </dl>
    </button>
  );
}

function OverviewDetailPanel({ detail }) {
  if (!detail) {
    return (
      <aside className="equipment-monitor-detail equipment-monitor-detail--empty">
        <p className="equipment-monitor-detail__empty">설비를 선택하면 상세 정보가 표시됩니다.</p>
      </aside>
    );
  }

  const statusMeta = EQUIPMENT_RUN_STATUS_META[detail.status] ?? EQUIPMENT_RUN_STATUS_META.idle;
  const workPath = `/production/charging/equipment/${detail.equipmentId}`;

  return (
    <aside className="equipment-monitor-detail" aria-label="설비 상세">
      <div className="equipment-monitor-detail__head">
        <h3>설비 상세</h3>
        <StatusChip variant={statusMeta.variant}>
          {statusMeta.emoji} {statusMeta.label}
        </StatusChip>
      </div>

      <dl className="equipment-monitor-detail__grid">
        <div>
          <dt>설비명</dt>
          <dd>{detail.equipmentName}</dd>
        </div>
        <div>
          <dt>LOT</dt>
          <dd>{detail.currentLotNo ?? "—"}</dd>
        </div>
        <div>
          <dt>시작시간</dt>
          <dd>{detail.startTime ?? "—"}</dd>
        </div>
        <div>
          <dt>종료예정</dt>
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
          <h4>동일 LOT 제품</h4>
          {detail.currentLotNo ? (
            <p className="equipment-monitor-detail__lot-no">{detail.currentLotNo}</p>
          ) : null}
          <ul>
            {detail.sameLotProducts.map((product) => (
              <li key={product.partName}>{product.partName}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="equipment-monitor-detail__footer">
        <Link to={workPath} className="equipment-monitor-detail__link">
          장입 작업 화면
        </Link>
      </div>
    </aside>
  );
}

/** 전체 설비 현황 — 생산 Workflow Dashboard */
export default function ProductionChargingOverviewPage() {
  const navigate = useNavigate();
  const groups = useMemo(() => getEquipmentListGroupedByProcess(), []);
  const { equipmentSummary: summary, counts: chargingCounts } = useMemo(
    () => getProductionChargingScreenData(),
    []
  );
  const { scan, error, processing } = useEquipmentQrScan();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    () => groups[0]?.items[0]?.equipmentId ?? null
  );

  const detail = useMemo(
    () => getEquipmentDetailSnapshot(selectedEquipmentId),
    [selectedEquipmentId]
  );

  const handleSelect = (equipmentId) => {
    setSelectedEquipmentId(equipmentId);
  };

  const handleOpenWork = (equipmentId) => {
    navigate(`/production/charging/equipment/${equipmentId}`);
  };

  return (
    <ProductionChargingPageShell
      breadcrumbItems={buildProductionChargingBreadcrumb(
        breadcrumbTrailEnd(PRODUCTION_CHARGING_OVERVIEW_COPY.title)
      )}
      title={PRODUCTION_CHARGING_OVERVIEW_COPY.title}
      description={PRODUCTION_CHARGING_OVERVIEW_COPY.description}
    >
      <div className="equipment-status-page">
        <EquipmentQrScanBar onScan={scan} error={error} disabled={processing} />
        <EquipmentSummaryBar summary={summary} />
        <p className="inventory-status-page__notice">
          설비 장입 Workspace — LOT 생성 완료 · 생산일보 미등록 제품 {chargingCounts.lotQueue}건
          (장입 대기 {chargingCounts.chargePending}건 · 장입중 {chargingCounts.chargeActive}대)
        </p>

        <div className="equipment-status-page__workspace">
          <div className="equipment-status-page__groups" aria-label="공정별 설비 현황">
            {groups.map((group) => (
              <section key={group.process} className="equipment-status-page__group">
                <h2 className="equipment-status-page__group-title">{group.process}</h2>
                <div className="equipment-status-page__cards">
                  {group.items.map((equipment) => (
                    <OverviewEquipmentCard
                      key={equipment.equipmentId}
                      equipment={equipment}
                      selected={equipment.equipmentId === selectedEquipmentId}
                      onSelect={(id) => {
                        handleSelect(id);
                        handleOpenWork(id);
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <OverviewDetailPanel detail={detail} />
        </div>
      </div>
    </ProductionChargingPageShell>
  );
}
