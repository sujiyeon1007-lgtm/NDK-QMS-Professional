import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import ProductionChargingPageShell from "./ProductionChargingPageShell";
import StatusChip from "../../../foundation/components/StatusChip";
import { EQUIPMENT_RUN_STATUS_META } from "../../../config/equipmentConfig";
import { resolveProductionChargingProcessSlug } from "../../../config/productionChargingProcessSlugs";
import { buildProductionChargingBreadcrumb, breadcrumbTrailEnd } from "../../../config/titanBreadcrumbPolicy";
import { getEquipmentList } from "../../../utils/equipmentWorkflowService";
import "../../EquipmentStatus/EquipmentStatusPage.css";

function ProcessEquipmentRow({ equipment }) {
  const statusMeta = EQUIPMENT_RUN_STATUS_META[equipment.status] ?? EQUIPMENT_RUN_STATUS_META.idle;
  const workPath = `/production/charging/equipment/${equipment.id}`;

  return (
    <Link to={workPath} className="equipment-monitor-card equipment-monitor-card--link">
      <div className="equipment-monitor-card__head">
        <span aria-hidden="true">{statusMeta.emoji}</span>
        <strong>{equipment.name}</strong>
        <StatusChip variant={statusMeta.variant}>{statusMeta.label}</StatusChip>
      </div>
      <dl className="equipment-monitor-card__meta">
        <div>
          <dt>코드</dt>
          <dd>{equipment.code}</dd>
        </div>
        <div>
          <dt>LOT</dt>
          <dd>{equipment.runningSession?.lotNo ?? "—"}</dd>
        </div>
        <div>
          <dt>진행률</dt>
          <dd>
            {equipment.runningSession?.progress > 0
              ? `${equipment.runningSession.progress}%`
              : "—"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

/** 공정별 설비 목록 — 이온질화 · 가스질화 · 가스연질화 */
export default function ProductionChargingProcessPage() {
  const { processSlug } = useParams();
  const processName = resolveProductionChargingProcessSlug(processSlug);

  const equipmentItems = useMemo(() => {
    if (!processName) return [];
    return getEquipmentList().filter((item) => item.process === processName);
  }, [processName]);

  if (!processName) {
    return <Navigate to="/production/charging" replace />;
  }

  return (
    <ProductionChargingPageShell
      breadcrumbItems={buildProductionChargingBreadcrumb(breadcrumbTrailEnd(processName))}
      title={processName}
      description={`${processName} 공정 설비를 선택하면 장입 · 열처리 완료 작업 화면으로 이동합니다.`}
    >
      <div className="equipment-status-page">
        <div className="equipment-status-page__workspace equipment-status-page__workspace--single">
          <section className="equipment-status-page__group" aria-label={`${processName} 설비 목록`}>
            <div className="equipment-status-page__cards">
              {equipmentItems.map((equipment) => (
                <ProcessEquipmentRow key={equipment.id} equipment={equipment} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </ProductionChargingPageShell>
  );
}
