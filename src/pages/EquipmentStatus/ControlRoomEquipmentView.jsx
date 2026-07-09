import { useMemo, useState } from "react";

import EquipmentSummaryBar from "../QrManagement/components/EquipmentSummaryBar";
import ControlRoomEquipmentCard from "./ControlRoomEquipmentCard";
import ControlRoomEquipmentPopup from "./ControlRoomEquipmentPopup";

/**
 * Control Room — 설비 View (Blueprint ② · Sprint 3B)
 * Data: useControlRoom → ControlRoomWorkspaceData → TitanDataEngine
 */
export default function ControlRoomEquipmentView({
  equipmentGroups = [],
  equipmentSummary = { total: 0, idle: 0, ready: 0, running: 0, maintenance: 0 },
  getEquipmentDetail = () => null,
  statusFilter: controlledStatusFilter,
  onStatusFilterChange,
}) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    () => equipmentGroups[0]?.items?.[0]?.equipmentId ?? null
  );
  const [popupEquipmentId, setPopupEquipmentId] = useState(null);
  const [localStatusFilter, setLocalStatusFilter] = useState("total");
  const statusFilter = controlledStatusFilter ?? localStatusFilter;
  const handleStatusFilterChange = onStatusFilterChange ?? setLocalStatusFilter;

  const popupDetail = useMemo(
    () => (popupEquipmentId ? getEquipmentDetail(popupEquipmentId) : null),
    [getEquipmentDetail, popupEquipmentId]
  );

  const filteredGroups = useMemo(() => {
    if (statusFilter === "total") return equipmentGroups;

    return equipmentGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((equipment) => equipment.status === statusFilter),
      }))
      .filter((group) => group.items.length > 0);
  }, [equipmentGroups, statusFilter]);

  return (
    <div className="control-room__equipment-view">
      <EquipmentSummaryBar
        summary={equipmentSummary}
        activeFilter={statusFilter}
        onFilterChange={handleStatusFilterChange}
      />

      <div className="equipment-status-page__workspace equipment-status-page__workspace--single">
        <div className="equipment-status-page__groups" aria-label="공정별 설비 현황">
          {filteredGroups.map((group) => (
            <section key={group.process} className="equipment-status-page__group">
              <h2 className="equipment-status-page__group-title">{group.process}</h2>
              <div className="equipment-status-page__cards">
                {group.items.map((equipment) => (
                  <ControlRoomEquipmentCard
                    key={equipment.equipmentId}
                    equipment={equipment}
                    selected={equipment.equipmentId === selectedEquipmentId}
                    onSelect={setSelectedEquipmentId}
                    onOpen={setPopupEquipmentId}
                  />
                ))}
              </div>
            </section>
          ))}
          {filteredGroups.length === 0 ? (
            <div className="control-room__placeholder" role="status">
              <p className="control-room__placeholder-title">선택한 상태의 설비가 없습니다.</p>
              <p className="control-room__placeholder-desc">상단 KPI에서 현재 설비를 선택하면 전체 설비를 다시 볼 수 있습니다.</p>
            </div>
          ) : null}
        </div>
      </div>

      <ControlRoomEquipmentPopup
        detail={popupDetail}
        open={Boolean(popupEquipmentId)}
        onClose={() => setPopupEquipmentId(null)}
      />
    </div>
  );
}
