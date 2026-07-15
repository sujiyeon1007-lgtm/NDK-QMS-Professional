import { useEffect, useMemo, useState } from "react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import { CONTROL_ROOM_LOT_COLUMNS, matchesControlRoomLotKpi } from "../../utils/controlRoomWorkspaceData";
import ControlRoomLotTimelinePanel from "./ControlRoomLotTimelinePanel";
import ControlRoomLotPopup from "./ControlRoomLotPopup";

const LOT_COLUMN_WIDTHS = {
  lotNo: 12,
  company: 12,
  productName: 16,
  equipmentName: 10,
  process: 8,
  status: 9,
  operator: 8,
  startTime: 8,
  expectedEndTime: 8,
  progressLabel: 8,
};

function normalizeSearchText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function matchesLotSearch(row, keyword) {
  const q = normalizeSearchText(keyword);
  if (!q) return true;
  return [
    row.lotNo,
    row.managementId,
    row.company,
    row.productName,
    row.partNo,
    row.equipmentName,
    row.equipmentId,
    row.operator,
  ].some((value) => normalizeSearchText(value).includes(q));
}

/**
 * Control Room — LOT View (Blueprint ② · Sprint 3C)
 * LOT Monitor Grid 11 Column · Timeline Summary · LOT Popup · Read Only
 * Data: useControlRoom → ControlRoomWorkspaceData → TitanDataEngine
 */
export default function ControlRoomLotView({
  lotMonitorRows = [],
  getLotDetail = () => null,
  getLotTimeline = () => [],
  lotFilter = "all",
}) {
  const [selectedLotNo, setSelectedLotNo] = useState(() => lotMonitorRows[0]?.lotNo ?? null);
  const [popupLotNo, setPopupLotNo] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const columns = useMemo(
    () =>
      CONTROL_ROOM_LOT_COLUMNS.map((col) => {
        const key = col.id === "progress" ? "progressLabel" : col.id;
        return {
          key,
          label: col.label,
          widthPercent: LOT_COLUMN_WIDTHS[key] ?? 8,
          widthHint: key === "productName" ? "wide" : "medium",
        };
      }),
    []
  );

  const kpiFilteredRows = useMemo(
    () => lotMonitorRows.filter((row) => matchesControlRoomLotKpi(row, lotFilter)),
    [lotMonitorRows, lotFilter]
  );

  const filteredRows = useMemo(
    () => kpiFilteredRows.filter((row) => matchesLotSearch(row, searchKeyword)),
    [kpiFilteredRows, searchKeyword]
  );

  useEffect(() => {
    if (filteredRows.length === 0) {
      setSelectedLotNo(null);
      return;
    }

    if (!filteredRows.some((row) => row.lotNo === selectedLotNo)) {
      setSelectedLotNo(filteredRows[0].lotNo);
    }
  }, [filteredRows, selectedLotNo]);

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

      <div className="control-room-lot-view__search" role="search" aria-label="설비 가동 현황 LOT 검색">
        <label htmlFor="control-room-lot-search">통합 검색</label>
        <input
          id="control-room-lot-search"
          type="search"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="LOT · 관리번호 · 거래처 · 제품명 · 품번 · 설비 · 작업자"
          autoComplete="off"
        />
        {searchKeyword ? (
          <button type="button" onClick={() => setSearchKeyword("")}>
            초기화
          </button>
        ) : null}
        <span>
          {filteredRows.length.toLocaleString("ko-KR")} / {kpiFilteredRows.length.toLocaleString("ko-KR")}건
        </span>
      </div>

      <div className="control-room-lot-view__workspace">
        <div className="control-room-lot-view__grid">
          <TitanDataTable
            className="control-room-lot-view__table"
            columns={columns}
            rows={filteredRows}
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
