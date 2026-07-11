import { useMemo } from "react";

import TitanDataTable from "../../../foundation/components/DataTable";
import { titanColumn } from "../../../config/tableColumnPresets";
import {
  resolveInboundQtyForChargeRow,
  resolveRemainingChargeQty,
} from "../../../utils/equipmentChargingQty";
import "./LotTable.css";

function formatChargeQty(value, unit = "EA") {
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty <= 0) return "—";
  return `${qty.toLocaleString("ko-KR")} ${String(unit ?? "EA").trim() || "EA"}`.trim();
}

function resolveManagementId(row) {
  return String(row?.managementId ?? row?.mesManagementNo ?? "").trim();
}

export default function LotTable({ rows = [], activeRowId, onRowClick }) {
  const columns = useMemo(
    () => [
      titanColumn("managementId", {
        label: "관리번호",
        widthPercent: 14,
        render: (row) => resolveManagementId(row) || "—",
      }),
      titanColumn("company", {
        label: "업체명",
        widthPercent: 14,
        render: (row) => String(row.company ?? "").trim() || "—",
      }),
      titanColumn("partName", {
        label: "품명",
        widthPercent: 16,
        render: (row) => String(row.partName ?? row.productName ?? "").trim() || "—",
      }),
      titanColumn("partNo", {
        label: "품번",
        widthPercent: 12,
        render: (row) => String(row.partNo ?? "").trim() || "—",
      }),
      titanColumn("inboundQty", {
        label: "입고수량",
        widthPercent: 10,
        render: (row) => formatChargeQty(resolveInboundQtyForChargeRow(row), row.unit),
      }),
      titanColumn("remainingChargeQty", {
        label: "잔여수량",
        widthPercent: 10,
        render: (row) => formatChargeQty(resolveRemainingChargeQty(row), row.unit),
      }),
      titanColumn("statusLabel", {
        label: "상태",
        widthPercent: 10,
        render: (row) => String(row.statusLabel ?? "").trim() || "—",
      }),
    ],
    []
  );

  return (
    <div className="qr-lot-table">
      <TitanDataTable
        className="qr-lot-table__grid"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        activeRowId={activeRowId}
        onRowClick={onRowClick}
        emptyMessage="장입 가능 제품이 없습니다."
        ariaLabel="장입 가능 제품"
      />
    </div>
  );
}
