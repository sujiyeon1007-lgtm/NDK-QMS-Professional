import { useState } from "react";
import "./TableHeaderCell.css";

function getNextDirection(current) {
  if (current === "asc") return "desc";
  return "asc";
}

export default function TableHeaderCell({
  label,
  columnKey,
  sortConfig,
  setSortConfig,
  filters,
  setFilters,
  filterOptions = [],
  filterMode = "search",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const activeSort = sortConfig.key === columnKey ? sortConfig.direction : "";
  const currentFilter = filters[columnKey] ?? { search: "", values: [] };
  const hasFilter = Boolean(currentFilter.search || currentFilter.values?.length);

  const handleSort = () => {
    setSortConfig({
      key: columnKey,
      direction: getNextDirection(activeSort),
    });
  };

  const updateSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: {
        ...(prev[columnKey] ?? { values: [] }),
        search: value,
      },
    }));
  };

  const updateValue = (value, checked) => {
    setFilters((prev) => {
      const filter = prev[columnKey] ?? { search: "", values: [] };
      const values = checked
        ? [...new Set([...(filter.values ?? []), value])]
        : (filter.values ?? []).filter((item) => item !== value);

      return {
        ...prev,
        [columnKey]: {
          ...filter,
          values,
        },
      };
    });
  };

  const clearFilter = () => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[columnKey];
      return next;
    });
  };

  return (
    <th className={className}>
      <div className="titan-table-head-cell">
        <button type="button" className="titan-table-head-label" onClick={handleSort}>
          <span>{label}</span>
          <span className={`titan-table-sort ${activeSort ? "active" : ""}`}>
            {activeSort === "desc" ? "▼" : "▲"}
          </span>
        </button>

        <button
          type="button"
          className={`titan-table-filter-trigger ${hasFilter ? "filtered" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
          aria-label={`${label} 필터`}
        >
          {hasFilter ? "●" : "▼"}
        </button>

        {open && (
          <div className="titan-table-filter-popover" onClick={(event) => event.stopPropagation()}>
            {(filterMode === "search" || filterMode === "mixed") && (
              <input
                type="search"
                value={currentFilter.search ?? ""}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="검색..."
              />
            )}

            <div className="titan-table-filter-options">
              {filterOptions.length > 0 && (
                <label>
                  <input
                    type="checkbox"
                    checked={!hasFilter}
                    onChange={clearFilter}
                  />
                  <span>전체</span>
                </label>
              )}
              {filterOptions.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={(currentFilter.values ?? []).includes(option)}
                    onChange={(event) => updateValue(option, event.target.checked)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <button type="button" className="titan-table-filter-clear" onClick={clearFilter}>
              필터 해제
            </button>
          </div>
        )}
      </div>
    </th>
  );
}
