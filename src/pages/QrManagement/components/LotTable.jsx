import { useMemo } from "react";

import TitanDataTable from "../../../foundation/components/DataTable";
import { titanColumn } from "../../../config/tableColumnPresets";
import "./LotTable.css";

export default function LotTable({ rows = [], activeRowId, onRowClick }) {
  const columns = useMemo(
    () => [
      titanColumn("lotNo", { label: "LOT.NO", widthPercent: 18 }),
      titanColumn("partName", { label: "품명", widthPercent: 28 }),
      titanColumn("qty", {
        label: "수량",
        widthPercent: 12,
        render: (row) => `${row.qty?.toLocaleString("ko-KR") ?? "—"} ${row.unit ?? ""}`.trim(),
      }),
      titanColumn("statusLabel", { label: "상태", widthPercent: 14 }),
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
        emptyMessage="장입 가능 LOT가 없습니다."
        ariaLabel="장입 가능 LOT"
      />
    </div>
  );
}
