/**
 * Project TITAN V1.0 — 공통 데이터 테이블 (TitanDataTable)
 * 모든 리스트 화면에서 동일한 마크업 · CSS 사용
 */

import { resolveColumnWidth, TITAN_COLUMN_WIDTHS } from "../../config/tableColumnPresets";

function buildRowClassName(row, { activeRowId, selectedRowIds }) {
  const classes = ["titan-table__row"];
  if (activeRowId != null && row.id === activeRowId) {
    classes.push("titan-table__row--active");
  }
  if (selectedRowIds?.includes(row.id)) {
    classes.push("titan-table__row--selected");
  }
  return classes.join(" ");
}

function resolveColDefinition(col) {
  if (col.widthPercent != null || col.width) {
    return col;
  }
  const preset = TITAN_COLUMN_WIDTHS[col.key];
  if (preset) {
    return { ...col, widthPercent: preset.widthPercent };
  }
  return col;
}

export default function TitanDataTable({
  columns,
  rows,
  emptyMessage = "표시할 데이터가 없습니다.",
  className = "",
  selectable = false,
  selectedRowIds = [],
  onToggleRow,
  onToggleAll,
  activeRowId,
  onRowClick,
  getRowId = (row) => row.id,
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
          widthPercent: TITAN_COLUMN_WIDTHS.select.widthPercent,
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
  ).map(resolveColDefinition);

  return (
    <div className={`titan-table-wrap ${className}`.trim()}>
      <table className="titan-table titan-table--ratio">
        <colgroup>
          {tableColumns.map((col) => (
            <col key={col.key} style={{ width: resolveColumnWidth(col) }} />
          ))}
        </colgroup>
        <thead className="titan-table__header">
          <tr className="titan-table__header-row">
            {tableColumns.map((col) => (
              <th
                key={col.key}
                className={`titan-table__cell titan-table__cell--head titan-table__cell--${col.key}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="titan-table__body">
          {rows.length === 0 ? (
            <tr className="titan-table__row titan-table__row--empty">
              <td colSpan={tableColumns.length} className="titan-table__cell titan-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const rowId = getRowId(row);
              return (
                <tr
                  key={rowId}
                  className={buildRowClassName(
                    { id: rowId },
                    { activeRowId, selectedRowIds }
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {tableColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`titan-table__cell titan-table__cell--${col.key}`}
                      title={
                        col.render || col.key === "__select"
                          ? undefined
                          : String(row[col.key] ?? "")
                      }
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
