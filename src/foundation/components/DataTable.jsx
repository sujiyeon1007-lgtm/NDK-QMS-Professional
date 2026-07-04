/**
 * Project TITAN V1.0 — 공통 데이터 테이블 (TitanDataTable)
 * ERP/MES Compact Grid — Header/Data 기반 Auto Layout
 */

import { resolveColDefinition } from "../../config/tableColumnPresets";
import TitanTableFrame from "./TitanTableFrame";

export default function TitanDataTable({
  columns,
  rows,
  emptyMessage = "표시할 데이터가 없습니다.",
  className = "",
  wrapClassName = "",
  layout = "compact",
  selectable = false,
  selectedRowIds = [],
  onToggleRow,
  onToggleAll,
  activeRowId,
  onRowClick,
  onRowDoubleClick,
  getRowId = (row) => row.id,
  expandedRowId,
  onExpandedRowChange,
  renderExpandedRow,
  ariaLabel = "데이터 목록",
}) {
  const allSelected = rows.length > 0 && selectedRowIds.length === rows.length;

  const tableColumns = (selectable
    ? [
        {
          key: "__select",
          label: (
            <input
              type="checkbox"
              className="titan-table__checkbox"
              checked={allSelected}
              onChange={() => onToggleAll?.()}
              aria-label="전체 선택"
            />
          ),
          widthHint: "narrow",
          render: (row) => (
            <input
              type="checkbox"
              className="titan-table__checkbox"
              checked={selectedRowIds.includes(getRowId(row))}
              onChange={() => onToggleRow?.(getRowId(row))}
              onClick={(e) => e.stopPropagation()}
              aria-label={`${getRowId(row)} 선택`}
            />
          ),
        },
        ...columns,
      ]
    : columns
  ).map((col) => resolveColDefinition(col, layout));

  return (
    <TitanTableFrame
      tableColumns={tableColumns}
      rows={rows}
      emptyMessage={emptyMessage}
      className={className}
      wrapClassName={wrapClassName}
      layout={layout}
      ariaLabel={ariaLabel}
      getRowId={getRowId}
      activeRowId={activeRowId}
      selectedRowIds={selectedRowIds}
      onRowClick={onRowClick}
      onRowDoubleClick={onRowDoubleClick}
      expandedRowId={expandedRowId}
      onExpandedRowChange={onExpandedRowChange}
      renderExpandedRow={renderExpandedRow}
      useExpandedActive
    />
  );
}
