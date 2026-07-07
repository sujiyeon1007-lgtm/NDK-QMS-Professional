import { useMemo, useState } from "react";

import EquipmentSummaryBar from "../QrManagement/components/EquipmentSummaryBar";
import EquipmentMonitorDetailPanel from "./EquipmentMonitorDetailPanel";
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
}) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    () => equipmentGroups[0]?.items?.[0]?.equipmentId ?? null
  );
  const [popupEquipmentId, setPopupEquipmentId] = useState(null);

  const detail = useMemo(
    () => getEquipmentDetail(selectedEquipmentId),
    [getEquipmentDetail, selectedEquipmentId]
  );

  const popupDetail = useMemo(
    () => (popupEquipmentId ? getEquipmentDetail(popupEquipmentId) : null),
    [getEquipmentDetail, popupEquipmentId]
  );

  return (
    <div className="control-room__equipment-view">
      <EquipmentSummaryBar summary={equipmentSummary} />

      <div className="equipment-status-page__workspace">
        <div className="equipment-status-page__groups" aria-label="공정별 설비 현황">
          {equipmentGroups.map((group) => (
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
        </div>

        <EquipmentMonitorDetailPanel detail={detail} showChargingLink={false} />
      </div>

      <ControlRoomEquipmentPopup
        detail={popupDetail}
        open={Boolean(popupEquipmentId)}
        onClose={() => setPopupEquipmentId(null)}
      />
    </div>
  );
}
