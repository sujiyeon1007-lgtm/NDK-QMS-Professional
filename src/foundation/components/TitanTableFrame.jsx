/**
 * Project TITAN — 공통 Table Frame (Auto Layout + 마크업)
 */
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

function getFilterText(row, col) {
  if (typeof col.filterValue === "function") {
    return String(col.filterValue(row) ?? "").trim();
  }

  const key = col.filterKey ?? col.key;
  const value = row?.[key];
  if (value == null) return "";
  return String(value).trim();
}

function isDateLikeColumn(col) {
  const key = String(col.key ?? "").toLowerCase();
  const label = typeof col.label === "string" ? col.label : "";
  return (
    key.includes("date") ||
    key.includes("time") ||
    key.endsWith("at") ||
    /(등록일|입고일|출고일|작업일|납기일|발행일|검사일|생산일|일자|날짜|시간)/.test(label)
  );
}

function compareFilterText(a, b, direction) {
  const aText = String(a ?? "");
  const bText = String(b ?? "");
  const aTime = Date.parse(aText);
  const bTime = Date.parse(bText);
  const bothDate = Number.isFinite(aTime) && Number.isFinite(bTime);
  const result = bothDate
    ? aTime - bTime
    : aText.localeCompare(bText, "ko-KR", { numeric: true, sensitivity: "base" });

  return direction === "desc" ? -result : result;
}

function getUniqueFilterValues(rows, col) {
  return Array.from(new Set(rows.map((row) => getFilterText(row, col)).filter(Boolean))).sort((a, b) =>
    compareFilterText(a, b, "asc")
  );
}

function applyGridFilters(rows, tableColumns, filterState, sortState) {
  const filteredRows = rows.filter((row) =>
    tableColumns.every((col) => {
      const state = filterState[col.key];
      if (!state || !Array.isArray(state.selectedValues)) return true;
      return state.selectedValues.includes(getFilterText(row, col));
    })
  );

  if (!sortState?.key || !sortState.direction) return filteredRows;

  const sortColumn = tableColumns.find((col) => col.key === sortState.key);
  if (!sortColumn) return filteredRows;

  return [...filteredRows].sort((a, b) =>
    compareFilterText(getFilterText(a, sortColumn), getFilterText(b, sortColumn), sortState.direction)
  );
}

function TitanGridFilterPopup({
  col,
  rows,
  state,
  sorted,
  position,
  onSort,
  onSearch,
  onToggleValue,
  onSelectAll,
  onClear,
  onApply,
  onCancel,
}) {
  const allValues = useMemo(() => getUniqueFilterValues(rows, col), [rows, col]);
  const search = state?.search ?? "";
  const selectedValues = Array.isArray(state?.selectedValues) ? state.selectedValues : null;
  const visibleValues = useMemo(
    () => allValues.filter((value) => value.toLowerCase().includes(search.toLowerCase())),
    [allValues, search]
  );
  const dateLike = isDateLikeColumn(col);

  return (
    <div
      className="titan-grid-filter"
      role="dialog"
      aria-label={`${col.label} 필터`}
      style={position ? { top: position.top, left: position.left, width: position.width } : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" className="titan-grid-filter__action" onClick={() => onSort("asc")}>
        {dateLike ? "오래된순" : "오름차순"}
        {sorted === "asc" ? " ✓" : ""}
      </button>
      <button type="button" className="titan-grid-filter__action" onClick={() => onSort("desc")}>
        {dateLike ? "최신순" : "내림차순"}
        {sorted === "desc" ? " ✓" : ""}
      </button>

      <input
        className="titan-grid-filter__search"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        onInput={(event) => onSearch(event.currentTarget.value)}
        placeholder="검색"
        aria-label={`${col.label} 검색`}
      />

      <div className="titan-grid-filter__toolbar">
        <button type="button" onClick={() => onSelectAll(visibleValues, allValues)}>
          전체 선택
        </button>
        <button type="button" onClick={onClear}>
          선택 해제
        </button>
      </div>

      {Array.isArray(selectedValues) && selectedValues.length === 0 ? (
        <p className="titan-grid-filter__none">선택된 항목 없음</p>
      ) : null}

      <div className="titan-grid-filter__values">
        {visibleValues.length > 0 ? (
          visibleValues.map((value) => (
            <label key={value} className="titan-grid-filter__value">
              <input
                type="checkbox"
                checked={selectedValues === null || selectedValues.includes(value)}
                onChange={() => onToggleValue(value, allValues)}
              />
              <span>{value}</span>
            </label>
          ))
        ) : (
          <p className="titan-grid-filter__empty">검색 결과가 없습니다.</p>
        )}
      </div>

      <div className="titan-grid-filter__footer">
        <button type="button" onClick={onApply}>
          적용
        </button>
        <button type="button" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
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
  const filterableColumns = tableColumns.filter((col) => col.key !== "__select" && col.filterable !== false);
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [filterPopupPosition, setFilterPopupPosition] = useState(null);
  const [filterState, setFilterState] = useState({});
  const [sortState, setSortState] = useState(null);
  const filterAnchorRef = useRef(null);
  const displayRows = useMemo(
    () => applyGridFilters(rows, filterableColumns, filterState, sortState),
    [rows, filterableColumns, filterState, sortState]
  );

  const { wrapRef, tableRef } = useTitanTableAutoLayout({
    enabled: isCompact,
    columnCount: colCount,
    rowCount: rows.length,
  });
  const rowClickTimerRef = useRef(null);

  const computeFilterPopupPosition = (headerCell) => {
    const minDropdownWidth = 220;
    const maxDropdownWidth = 320;
    const margin = 8;
    const headerRect = headerCell.getBoundingClientRect();
    const containerRect = wrapRef.current?.getBoundingClientRect();
    const headerWidth = Number.isFinite(headerRect.width) ? headerRect.width : minDropdownWidth;
    const dropdownWidth = Math.round(Math.min(Math.max(headerWidth, minDropdownWidth), maxDropdownWidth));
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || dropdownWidth;
    const containerLeft = Math.max(margin, containerRect?.left ?? margin);
    const maxLeft = Math.max(margin, viewportWidth - dropdownWidth - margin);
    const headerLeft = Number.isFinite(headerRect.left) ? headerRect.left : containerLeft;
    const left = Math.min(Math.max(containerLeft, headerLeft), maxLeft);

    return {
      top: Math.round(headerRect.bottom + 4),
      left: Math.round(left),
      width: dropdownWidth,
    };
  };

  const closeFilterPopup = () => {
    filterAnchorRef.current = null;
    setFilterPopupPosition(null);
    setOpenFilterKey(null);
  };

  useEffect(() => {
    if (!openFilterKey || !filterAnchorRef.current) return undefined;

    const updatePosition = () => {
      if (!filterAnchorRef.current?.isConnected) {
        closeFilterPopup();
        return;
      }
      setFilterPopupPosition(computeFilterPopupPosition(filterAnchorRef.current));
    };

    const handleDocumentPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".titan-grid-filter") || target.closest(".titan-grid-filter-head")) return;
      closeFilterPopup();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeFilterPopup();
      }
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("click", handleDocumentPointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("click", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openFilterKey]);

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

  const updateFilterState = (columnKey, patch) => {
    setFilterState((current) => ({
      ...current,
      [columnKey]: {
        ...(current[columnKey] ?? {}),
        ...patch,
      },
    }));
  };

  const handleToggleFilterValue = (columnKey, value, allValues) => {
    setFilterState((current) => {
      const currentState = current[columnKey] ?? {};
      const selectedValues = Array.isArray(currentState.selectedValues) ? currentState.selectedValues : allValues;
      const nextSelected = selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value];

      return {
        ...current,
        [columnKey]: {
          ...currentState,
          selectedValues: nextSelected.length === allValues.length ? undefined : nextSelected,
        },
      };
    });
  };

  const renderHeaderLabel = (col) => {
    const filterable = col.key !== "__select" && col.filterable !== false;
    if (!filterable) return col.label;

    const isOpen = openFilterKey === col.key;
    const isActive =
      sortState?.key === col.key || Array.isArray(filterState[col.key]?.selectedValues);

    return (
      <div
        className="titan-grid-filter-head"
        data-grid-filter-key={col.key}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="titan-grid-filter-head__label">{col.label}</span>
        <button
          type="button"
          className={`titan-grid-filter-head__button${isActive ? " is-active" : ""}`}
          aria-label={`${col.label} 필터`}
          aria-expanded={isOpen}
          onClick={(event) => {
            event.stopPropagation();
            const headerCell = event.currentTarget.closest("th");
            if (isOpen) {
              closeFilterPopup();
              return;
            }

            if (headerCell) {
              filterAnchorRef.current = headerCell;
              setFilterPopupPosition(computeFilterPopupPosition(headerCell));
            }
            setOpenFilterKey(col.key);
          }}
        >
          ▼
        </button>
        {isOpen && filterPopupPosition
          ? createPortal(
              <TitanGridFilterPopup
                col={col}
                rows={rows}
                state={filterState[col.key]}
                sorted={sortState?.key === col.key ? sortState.direction : null}
                position={filterPopupPosition}
                onSort={(direction) => {
                  setSortState({ key: col.key, direction });
                  closeFilterPopup();
                }}
                onSearch={(search) => updateFilterState(col.key, { search })}
                onToggleValue={(value, allValues) => handleToggleFilterValue(col.key, value, allValues)}
                onSelectAll={(visibleValues, allValues) =>
                  updateFilterState(col.key, {
                    selectedValues: visibleValues.length === allValues.length ? undefined : visibleValues,
                  })
                }
                onClear={() => updateFilterState(col.key, { selectedValues: [], search: "" })}
                onApply={() => {
                  closeFilterPopup();
                }}
                onCancel={() => {
                  closeFilterPopup();
                }}
              />,
              document.body
            )
          : null}
      </div>
    );
  };

  return (
    <div
      ref={wrapRef}
      className={`${wrapExtraClassName} ${wrapClassName}`.trim()}
      onClick={() => {
        closeFilterPopup();
      }}
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
                {renderHeaderLabel(col)}
              </th>
            ))}
            {renderFillHeadCell(isCompact)}
          </tr>
        </thead>
        <tbody className="titan-table__body">
          {displayRows.length === 0 ? (
            <tr className="titan-table__row titan-table__row--empty">
              <td colSpan={displayColCount} className="titan-table__cell titan-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            displayRows.map((row) => {
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
