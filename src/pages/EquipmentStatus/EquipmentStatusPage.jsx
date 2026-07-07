import { useMemo, useState } from "react";

import PageTopBar from "../../foundation/layout/PageTopBar";
import StatusChip from "../../foundation/components/StatusChip";
import { EQUIPMENT_RUN_STATUS_META, EQUIPMENT_STATUS_PAGE_COPY } from "../../config/equipmentConfig";
import {
  getEquipmentDetailSnapshot,
  getEquipmentListGroupedByProcess,
  getEquipmentSummary,
} from "../../utils/equipmentWorkflowService";
import EquipmentSummaryBar from "../QrManagement/components/EquipmentSummaryBar";
import EquipmentMonitorDetailPanel from "./EquipmentMonitorDetailPanel";
import "./EquipmentStatusPage.css";

function MonitorEquipmentCard({ equipment, selected, onSelect }) {
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
        <div>
          <dt>동일 LOT</dt>
          <dd>{equipment.sameLotProductCount > 0 ? `${equipment.sameLotProductCount}품목` : "—"}</dd>
        </div>
      </dl>
    </button>
  );
}

export default function EquipmentStatusPage() {
  const groups = useMemo(() => getEquipmentListGroupedByProcess(), []);
  const summary = useMemo(() => getEquipmentSummary(), []);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    () => groups[0]?.items[0]?.equipmentId ?? null
  );

  const detail = useMemo(
    () => getEquipmentDetailSnapshot(selectedEquipmentId),
    [selectedEquipmentId]
  );

  return (
    <div className="equipment-status-page">
      <PageTopBar
        kicker={EQUIPMENT_STATUS_PAGE_COPY.kicker}
        title={EQUIPMENT_STATUS_PAGE_COPY.title}
        description={EQUIPMENT_STATUS_PAGE_COPY.description}
      />

      <EquipmentSummaryBar summary={summary} />

      <div className="equipment-status-page__workspace">
        <div className="equipment-status-page__groups" aria-label="공정별 설비 현황">
          {groups.map((group) => (
            <section key={group.process} className="equipment-status-page__group">
              <h2 className="equipment-status-page__group-title">{group.process}</h2>
              <div className="equipment-status-page__cards">
                {group.items.map((equipment) => (
                  <MonitorEquipmentCard
                    key={equipment.equipmentId}
                    equipment={equipment}
                    selected={equipment.equipmentId === selectedEquipmentId}
                    onSelect={setSelectedEquipmentId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <EquipmentMonitorDetailPanel detail={detail} />
      </div>
    </div>
  );
}
