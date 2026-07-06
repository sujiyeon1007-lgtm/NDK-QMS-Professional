/**
 * Project TITAN — 공통 Table Frame (Auto Layout + 마크업)
 */
import { Fragment, useRef } from "react";

import {
  resolveColumnClass,
  resolveColumnWidth,
  resolveColumnCellClassName,
} from "../../config/tableColumnPresets";
import { useTitanTableAutoLayout } from "../hooks/useTitanTableAutoLayout";
import { renderTitanTableCell } from "./titanTableCell";

function buildRowClassName(rowId, { activeRowId, selectedRowIds, clickable, isExpanded, useExpandedActive }) {
  const classes = ["titan-table__row"];
  if (clickable) {
    classes.push("titan-table__row--clickable");
  }
  const effectiveActiveId = useExpandedActive && isExpanded ? rowId : activeRowId;
  if (effectiveActiveId != null && rowId === effectiveActiveId) {
    classes.push("titan-table__row--active");
  }
  if (isExpanded) {
    classes.push("titan-table__row--expanded");
  }
  if (selectedRowIds?.includes(rowId)) {
    classes.push("titan-table__row--selected");
  }
  return classes.join(" ");
}

function renderFillHeadCell(isCompact) {
  if (!isCompact) {
    return null;
  }
  return (
    <th
      className="titan-table__cell titan-table__cell--head titan-table__cell--fill"
      aria-hidden="true"
    />
  );
}

function renderFillBodyCell(isCompact) {
  if (!isCompact) {
    return null;
  }
  return <td className="titan-table__cell titan-table__cell--fill" aria-hidden="true" />;
}

export default function TitanTableFrame({
  tableColumns,
  rows,
  emptyMessage = "표시할 데이터가 없습니다.",
  className = "",
  wrapClassName = "",
  layout = "compact",
  tableClassName = "titan-table",
  wrapExtraClassName = "titan-table-wrap",
  ariaLabel = "데이터 목록",
  getRowId = (row) => row.id,
  activeRowId,
  selectedRowIds = [],
  onRowClick,
  onRowDoubleClick,
  expandedRowId,
  onExpandedRowChange,
  renderExpandedRow,
  useExpandedActive = true,
}) {
  const isCompact = layout === "compact" || layout === "auto";
  const layoutClass = isCompact ? "titan-table--compact" : "titan-table--ratio";
  const expandable = typeof renderExpandedRow === "function";
  const clickable = Boolean(onRowClick || onRowDoubleClick || expandable);
  const colCount = tableColumns.length;
  const displayColCount = isCompact ? colCount + 1 : colCount;

  const { wrapRef, tableRef } = useTitanTableAutoLayout({
    enabled: isCompact,
    columnCount: colCount,
    rowCount: rows.length,
  });
  const rowClickTimerRef = useRef(null);

  const handleRowClick = (row) => {
    const rowId = getRowId(row);
    const runSingleClick = () => {
      if (expandable && onExpandedRowChange) {
        onExpandedRowChange(expandedRowId === rowId ? null : rowId);
      }
      onRowClick?.(row);
    };

    if (!onRowClick) {
      return;
    }

    if (onRowDoubleClick) {
      if (rowClickTimerRef.current) {
        clearTimeout(rowClickTimerRef.current);
      }
      rowClickTimerRef.current = setTimeout(() => {
        rowClickTimerRef.current = null;
        runSingleClick();
      }, 220);
      return;
    }

    runSingleClick();
  };

  const handleRowDoubleClick = (event, row) => {
    if (rowClickTimerRef.current) {
      clearTimeout(rowClickTimerRef.current);
      rowClickTimerRef.current = null;
    }
    event.preventDefault();
    event.stopPropagation();
    onRowDoubleClick?.(row);
  };

  return (
    <div
      ref={wrapRef}
      className={`${wrapExtraClassName} ${wrapClassName}`.trim()}
    >
      <table
        ref={tableRef}
        className={`${tableClassName} ${layoutClass} ${className}`.trim()}
        aria-label={ariaLabel}
      >
        <colgroup>
          {tableColumns.map((col) => (
            <col
              key={col.key}
              className={resolveColumnClass(col)}
              style={isCompact ? undefined : { width: resolveColumnWidth(col, layout) }}
            />
          ))}
          {isCompact ? <col className="titan-col--fill" /> : null}
        </colgroup>
        <thead className="titan-table__header">
          <tr className="titan-table__header-row">
            {tableColumns.map((col) => (
              <th
                key={col.key}
                className={`${resolveColumnCellClassName(col)} titan-table__cell--head`}
              >
                {col.label}
              </th>
            ))}
            {renderFillHeadCell(isCompact)}
          </tr>
        </thead>
        <tbody className="titan-table__body">
          {rows.length === 0 ? (
            <tr className="titan-table__row titan-table__row--empty">
              <td colSpan={displayColCount} className="titan-table__cell titan-table__empty">
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
                      useExpandedActive,
                    })}
                    onClick={clickable ? () => handleRowClick(row) : undefined}
                    onDoubleClick={
                      onRowDoubleClick ? (event) => handleRowDoubleClick(event, row) : undefined
                    }
                    aria-expanded={expandable ? isExpanded : undefined}
                  >
                    {tableColumns.map((col) => (
                      <td key={col.key} className={resolveColumnCellClassName(col)}>
                        {renderTitanTableCell(row, col)}
                      </td>
                    ))}
                    {renderFillBodyCell(isCompact)}
                  </tr>
                  {isExpanded ? (
                    <tr className="titan-standard-list__expand-row">
                      <td colSpan={displayColCount} className="titan-standard-list__expand-cell">
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

export { resolveColDefinition } from "../../config/tableColumnPresets";
