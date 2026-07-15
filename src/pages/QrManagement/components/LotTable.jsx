import { useMemo } from "react";

import TitanDataTable from "../../../foundation/components/DataTable";
import { CHARGEABLE_LOT_COLUMN_SPEC, CHARGED_LOT_RUNNING_COLUMN_SPEC, titanColumn } from "../../../config/tableColumnPresets";
import {
  resolveInboundQtyForChargeRow,
  resolveRemainingChargeQty,
  resolveChargeQty,
} from "../../../utils/equipmentChargingQty";
import "./LotTable.css";

function formatChargeQty(value, unit = "EA") {
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty <= 0) return "—";
  return `${qty.toLocaleString("ko-KR")} ${String(unit ?? "EA").trim() || "EA"}`.trim();
}

function resolveMaterial(row) {
  return String(row?.material ?? row?.materialName ?? "").trim() || "—";
}

export default function LotTable({
  rows = [],
  activeRowId,
  onRowClick,
  selectable = false,
  selectedRowIds = [],
  onToggleRow,
  onToggleAll,
  chargeQtyByRowId: _chargeQtyByRowId = {},
  onChargeQtyChange: _onChargeQtyChange,
  chargeQtyInputEnabled: _chargeQtyInputEnabled = false,
  variant = "chargeable",
}) {
  const isRunningCharged = variant === "running-charged";
  const columnSpec = isRunningCharged ? CHARGED_LOT_RUNNING_COLUMN_SPEC : CHARGEABLE_LOT_COLUMN_SPEC;

  const columns = useMemo(() => {
    const renderers = {
      company: (row) => String(row.company ?? "").trim() || "—",
      partName: (row) =>
        String(row.partName ?? row.itemName ?? row.productName ?? "").trim() || "—",
      partNo: (row) => String(row.partNo ?? "").trim() || "—",
      material: resolveMaterial,
      inboundQty: (row) => formatChargeQty(resolveInboundQtyForChargeRow(row), row.unit),
      remainingChargeQty: (row) => formatChargeQty(resolveRemainingChargeQty(row), row.unit),
      chargeQty: (row) =>
        formatChargeQty(
          Number(row.chargeQty) > 0
            ? row.chargeQty
            : resolveChargeQty(row, { lotNo: row.lotNo }),
          row.unit
        ),
    };

    return columnSpec.map(({ preset, widthPercent, label }) =>
      titanColumn(preset, {
        widthPercent,
        ...(label ? { label } : {}),
        render: renderers[preset],
      })
    );
  }, [columnSpec]);

  return (
    <div className="qr-lot-table">
      <TitanDataTable
        className="qr-lot-table__grid"
        columns={columns}
        rows={rows}
        layout="ratio"
        getRowId={(row) => row.id}
        activeRowId={activeRowId}
        onRowClick={onRowClick}
        selectable={selectable}
        selectedRowIds={selectedRowIds}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
        emptyMessage={isRunningCharged ? "장입된 제품이 없습니다." : "장입 가능 제품이 없습니다."}
        ariaLabel={isRunningCharged ? "현재 장입된 제품" : "장입 가능 제품"}
      />
    </div>
  );
}
