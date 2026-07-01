/**
 * Project TITAN V1.0 — 공통 데이터 테이블 (TitanDataTable)
 * 모든 리스트 화면에서 동일한 마크업 · CSS 사용
 */

import { Fragment } from "react";

import { resolveColumnWidth, TITAN_COLUMN_WIDTHS } from "../../config/tableColumnPresets";

function buildRowClassName(rowId, { activeRowId, selectedRowIds, clickable, isExpanded }) {
  const classes = ["titan-table__row"];
  if (clickable) {
    classes.push("titan-table__row--clickable");
  }
  const effectiveActiveId = isExpanded ? rowId : activeRowId;
  if (effectiveActiveId != null && rowId === effectiveActiveId) {
    classes.push("titan-table__row--active");
  }
  if (selectedRowIds?.includes(rowId)) {
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
  wrapClassName = "",
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
  const expandable = typeof renderExpandedRow === "function";
  const clickable = Boolean(onRowClick || onRowDoubleClick || expandable);

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

  const colCount = tableColumns.length;

  const handleRowClick = (row) => {
    const rowId = getRowId(row);
    if (expandable && onExpandedRowChange) {
      onExpandedRowChange(expandedRowId === rowId ? null : rowId);
    }
    onRowClick?.(row);
  };

  return (
    <div className={`titan-table-wrap ${wrapClassName}`.trim()}>
      <table
        className={`titan-table titan-table--ratio ${className}`.trim()}
        aria-label={ariaLabel}
      >
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
              <td colSpan={colCount} className="titan-table__cell titan-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const rowId = getRowId(row);
              const isExpanded = expandable && expandedRowId === rowId;

              return (
                <Fragment key={rowId}>
                  <tr
                    className={buildRowClassName(rowId, {
                      activeRowId,
                      selectedRowIds,
                      clickable,
                      isExpanded,
                    })}
                    onClick={clickable ? () => handleRowClick(row) : undefined}
                    onDoubleClick={
                      onRowDoubleClick ? () => onRowDoubleClick(row) : undefined
                    }
                    aria-expanded={expandable ? isExpanded : undefined}
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
                  {isExpanded ? (
                    <tr className="titan-standard-list__expand-row">
                      <td colSpan={colCount} className="titan-standard-list__expand-cell">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
