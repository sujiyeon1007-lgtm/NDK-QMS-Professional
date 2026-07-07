import { useSearchParams } from "react-router-dom";

import PageTopBar from "../../foundation/layout/PageTopBar";
import { EQUIPMENT_STATUS_PAGE_COPY } from "../../config/equipmentConfig";
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
export default function EquipmentStatusPage() {
  const [searchParams] = useSearchParams();
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

  return (
    <div className="equipment-status-page control-room">
      <PageTopBar
        kicker={EQUIPMENT_STATUS_PAGE_COPY.kicker}
        title={EQUIPMENT_STATUS_PAGE_COPY.title}
        description={EQUIPMENT_STATUS_PAGE_COPY.description}
        onRefresh={refresh}
      />

      <ControlRoomKpiBar cards={kpiCards} />

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
          />
        ) : null}
        {activeView === "lot" ? (
          <ControlRoomLotView
            lotMonitorRows={lotMonitorRows}
            getLotDetail={getLotDetail}
            getLotTimeline={getLotTimeline}
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
