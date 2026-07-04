/**
 * Project TITAN V1.0 — Standard List Component
 */

import { resolveColDefinition } from "../../config/tableColumnPresets";
import TitanTableFrame from "./TitanTableFrame";

export default function TitanStandardList({
  columns,
  rows,
  emptyMessage = "표시할 데이터가 없습니다.",
  className = "",
  wrapClassName = "",
  layout = "compact",
  getRowId = (row) => row.id,
  activeRowId,
  onRowClick,
  expandedRowId,
  onExpandedRowChange,
  renderExpandedRow,
  selectable = false,
  selectedRowIds = [],
  onToggleRow,
  onToggleAll,
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
      tableClassName="titan-standard-list titan-table"
      wrapExtraClassName="titan-standard-list-wrap titan-table-wrap"
      ariaLabel={ariaLabel}
      getRowId={getRowId}
      activeRowId={activeRowId}
      selectedRowIds={selectedRowIds}
      onRowClick={onRowClick}
      expandedRowId={expandedRowId}
      onExpandedRowChange={onExpandedRowChange}
      renderExpandedRow={renderExpandedRow}
      useExpandedActive={false}
    />
  );
}
