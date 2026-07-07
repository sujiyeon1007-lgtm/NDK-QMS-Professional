import { useMemo, useState } from "react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import { CONTROL_ROOM_PRODUCT_COLUMNS } from "../../utils/controlRoomWorkspaceData";
import ControlRoomProductPopup from "./ControlRoomProductPopup";

const PRODUCT_COLUMN_WIDTHS = {
  productName: 18,
  partNo: 14,
  company: 13,
  currentLotNo: 12,
  equipmentName: 10,
  status: 10,
  operator: 9,
  progress: 8,
  lotCount: 6,
};

/**
 * Control Room — Product View (Blueprint ② · Sprint 3D)
 * 제품 중심 Monitor Grid · Product Status · Progress · Product Popup · Read Only
 * LOT View 복사 ❌ — 제품(품번+고객사) 기준 집계
 * Data: useControlRoom → ControlRoomWorkspaceData → TitanDataEngine
 */
export default function ControlRoomProductView({
  productMonitorRows = [],
  getProductDetail = () => null,
}) {
  const [selectedKey, setSelectedKey] = useState(
    () => productMonitorRows[0]?.productKey ?? null
  );
  const [popupKey, setPopupKey] = useState(null);

  const columns = useMemo(
    () =>
      CONTROL_ROOM_PRODUCT_COLUMNS.map((col) => {
        const key = col.id === "progress" ? "progressLabel" : col.id;
        return {
          key,
          label: col.label,
          widthPercent: PRODUCT_COLUMN_WIDTHS[col.id] ?? 8,
          widthHint: col.id === "productName" || col.id === "partNo" ? "wide" : "medium",
        };
      }),
    []
  );

  const popupDetail = useMemo(
    () => (popupKey ? getProductDetail(popupKey) : null),
    [getProductDetail, popupKey]
  );

  return (
    <div className="control-room__product-view">
      <TitanListInteractionHint message="💡 Product Monitor 행을 더블클릭하면 제품 상세 Popup을 확인할 수 있습니다." />

      <div className="control-room-product-view__grid">
        <TitanDataTable
          className="control-room-product-view__table"
          columns={columns}
          rows={productMonitorRows}
          getRowId={(row) => row.productKey}
          activeRowId={selectedKey}
          onRowClick={(row) => setSelectedKey(row.productKey)}
          onRowDoubleClick={(row) => setPopupKey(row.productKey)}
          emptyMessage="표시할 Product Monitor 데이터가 없습니다."
          ariaLabel="Product Monitor Grid"
          layout="compact"
        />
      </div>

      <ControlRoomProductPopup
        detail={popupDetail}
        open={Boolean(popupKey)}
        onClose={() => setPopupKey(null)}
      />
    </div>
  );
}
