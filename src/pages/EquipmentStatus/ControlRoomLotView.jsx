import { useMemo, useState } from "react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import { CONTROL_ROOM_LOT_COLUMNS } from "../../utils/controlRoomWorkspaceData";
import ControlRoomLotTimelinePanel from "./ControlRoomLotTimelinePanel";
import ControlRoomLotPopup from "./ControlRoomLotPopup";

const LOT_COLUMN_WIDTHS = {
  lotNo: 10,
  managementId: 11,
  productName: 12,
  company: 10,
  equipmentName: 9,
  process: 8,
  operator: 8,
  progressLabel: 8,
  status: 8,
  startTime: 8,
  expectedEndTime: 8,
};

/**
 * Control Room — LOT View (Blueprint ② · Sprint 3C)
 * LOT Monitor Grid 11 Column · Timeline Summary · LOT Popup · Read Only
 * Data: useControlRoom → ControlRoomWorkspaceData → TitanDataEngine
 */
export default function ControlRoomLotView({
  lotMonitorRows = [],
  getLotDetail = () => null,
  getLotTimeline = () => [],
}) {
  const [selectedLotNo, setSelectedLotNo] = useState(() => lotMonitorRows[0]?.lotNo ?? null);
  const [popupLotNo, setPopupLotNo] = useState(null);

  const columns = useMemo(
    () =>
      CONTROL_ROOM_LOT_COLUMNS.map((col) => {
        const key = col.id === "progress" ? "progressLabel" : col.id;
        return {
          key,
          label: col.label,
          widthPercent: LOT_COLUMN_WIDTHS[key] ?? 8,
          widthHint: key === "managementId" || key === "productName" ? "wide" : "medium",
        };
      }),
    []
  );

  const timelineEvents = useMemo(
    () => (selectedLotNo ? getLotTimeline(selectedLotNo, 7) : []),
    [getLotTimeline, selectedLotNo]
  );

  const popupDetail = useMemo(
    () => (popupLotNo ? getLotDetail(popupLotNo) : null),
    [getLotDetail, popupLotNo]
  );

  return (
    <div className="control-room__lot-view">
      <TitanListInteractionHint message="💡 LOT Monitor 행을 더블클릭하면 LOT 상세 Popup을 확인할 수 있습니다." />

      <div className="control-room-lot-view__workspace">
        <div className="control-room-lot-view__grid">
          <TitanDataTable
            className="control-room-lot-view__table"
            columns={columns}
            rows={lotMonitorRows}
            getRowId={(row) => row.lotNo}
            activeRowId={selectedLotNo}
            onRowClick={(row) => setSelectedLotNo(row.lotNo)}
            onRowDoubleClick={(row) => setPopupLotNo(row.lotNo)}
            emptyMessage="표시할 LOT Monitor 데이터가 없습니다."
            ariaLabel="LOT Monitor Grid"
            layout="compact"
          />
        </div>

        <ControlRoomLotTimelinePanel lotNo={selectedLotNo} events={timelineEvents} />
      </div>

      <ControlRoomLotPopup
        detail={popupDetail}
        open={Boolean(popupLotNo)}
        onClose={() => setPopupLotNo(null)}
      />
    </div>
  );
}
