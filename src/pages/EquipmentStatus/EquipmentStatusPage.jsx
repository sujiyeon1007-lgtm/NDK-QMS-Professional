import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageTopBar from "../../foundation/layout/PageTopBar";
import { EQUIPMENT_STATUS_PAGE_COPY } from "../../config/equipmentConfig";
import { getWorkspaceNavigation } from "../../config/menuStructure";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";
import { CONTROL_ROOM_VIEWS } from "../../utils/controlRoomWorkspaceData";
import { useControlRoom } from "./useControlRoom";
import ControlRoomKpiBar from "./ControlRoomKpiBar";
import ControlRoomViewTabs from "./ControlRoomViewTabs";
import ControlRoomEquipmentView from "./ControlRoomEquipmentView";
import ControlRoomLotView from "./ControlRoomLotView";
import ControlRoomProductView from "./ControlRoomProductView";
import "./EquipmentStatusPage.css";

/**
 * Control Room Workspace (Blueprint ② 설비현황)
 * Data flow: TitanDataEngine → ControlRoomWorkspaceData → useControlRoom → View
 */
export default function EquipmentStatusPage({ embedded = false }) {
  const [searchParams] = useSearchParams();
  const workspaceNav = getWorkspaceNavigation("production");
  const [activeKpiId, setActiveKpiId] = useState(null);
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState("total");
  const [lotFilter, setLotFilter] = useState("all");
  const {
    activeView,
    setActiveView,
    kpiCards,
    equipmentGroups,
    equipmentSummary,
    lotMonitorRows,
    productMonitorRows,
    getEquipmentDetail,
    getLotDetail,
    getLotTimeline,
    getProductDetail,
    refresh,
  } = useControlRoom({ initialView: searchParams.get("view") });

  const handleKpiClick = useCallback(
    (chip) => {
      setActiveKpiId(chip.id);

      switch (chip.id) {
        case "runningEquipment":
          setActiveView("equipment");
          setEquipmentStatusFilter("running");
          setLotFilter("all");
          break;
        case "utilizationRate":
          setActiveView("equipment");
          setEquipmentStatusFilter("total");
          setLotFilter("all");
          break;
        case "alarms":
          setActiveView("equipment");
          setEquipmentStatusFilter("maintenance");
          setLotFilter("all");
          break;
        case "productionLots":
          setActiveView("lot");
          setLotFilter("production");
          break;
        case "waitingLots":
          setActiveView("lot");
          setLotFilter("waiting");
          break;
        case "productionDone":
          setActiveView("lot");
          setLotFilter("done");
          break;
        case "inspectionWait":
          setActiveView("lot");
          setLotFilter("inspectionWait");
          break;
        default:
          setActiveView("equipment");
          setEquipmentStatusFilter("total");
          setLotFilter("all");
          break;
      }
    },
    [setActiveView]
  );

  return (
    <div className="equipment-status-page control-room">
      {!embedded ? (
        <>
          <PageTopBar
            kicker={EQUIPMENT_STATUS_PAGE_COPY.kicker}
            title={EQUIPMENT_STATUS_PAGE_COPY.title}
            description={EQUIPMENT_STATUS_PAGE_COPY.description}
            onRefresh={refresh}
          />

          <WorkspaceNavigationTabs nav={workspaceNav} />
        </>
      ) : null}

      <ControlRoomKpiBar cards={kpiCards} activeKpiId={activeKpiId} onKpiClick={handleKpiClick} />

      <ControlRoomViewTabs
        views={CONTROL_ROOM_VIEWS}
        activeView={activeView}
        onChange={setActiveView}
      />

      <div className="control-room__view">
        {activeView === "equipment" ? (
          <ControlRoomEquipmentView
            equipmentGroups={equipmentGroups}
            equipmentSummary={equipmentSummary}
            getEquipmentDetail={getEquipmentDetail}
            statusFilter={equipmentStatusFilter}
            onStatusFilterChange={(nextFilter) => {
              setEquipmentStatusFilter(nextFilter);
              setActiveKpiId(null);
            }}
          />
        ) : null}
        {activeView === "lot" ? (
          <ControlRoomLotView
            lotMonitorRows={lotMonitorRows}
            getLotDetail={getLotDetail}
            getLotTimeline={getLotTimeline}
            lotFilter={lotFilter}
          />
        ) : null}
        {activeView === "product" ? (
          <ControlRoomProductView
            productMonitorRows={productMonitorRows}
            getProductDetail={getProductDetail}
          />
        ) : null}
      </div>
    </div>
  );
}
