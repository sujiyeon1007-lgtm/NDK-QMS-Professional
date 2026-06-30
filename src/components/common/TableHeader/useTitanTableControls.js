import { useMemo, useState } from "react";

function getColumnValue(row, column) {
  if (typeof column.accessor === "function") return column.accessor(row);
  return row?.[column.key] ?? "";
}

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function compareValues(a, b) {
  const aValue = normalizeValue(a);
  const bValue = normalizeValue(b);
  const aNumber = Number(aValue.replace(/,/g, ""));
  const bNumber = Number(bValue.replace(/,/g, ""));

  if (aValue !== "" && bValue !== "" && !Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
    return aNumber - bNumber;
  }

  return aValue.localeCompare(bValue, "ko-KR", { numeric: true, sensitivity: "base" });
}

export function useTitanTableControls(rows, columns) {
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [filters, setFilters] = useState({});

  const columnMap = useMemo(() => {
    return columns.reduce((map, column) => {
      map[column.key] = column;
      return map;
    }, {});
  }, [columns]);

  const controlledRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      return columns.every((column) => {
        const filter = filters[column.key];
        if (!filter) return true;

        const value = normalizeValue(getColumnValue(row, column));
        const search = normalizeValue(filter.search).toLowerCase();
        const selected = filter.values ?? [];

        if (search && !value.toLowerCase().includes(search)) return false;
        if (selected.length > 0 && !selected.includes(value)) return false;
        return true;
      });
    });

    if (!sortConfig.key || !sortConfig.direction) return filtered;

    const sortColumn = columnMap[sortConfig.key];
    if (!sortColumn) return filtered;

    return [...filtered].sort((a, b) => {
      const result = compareValues(getColumnValue(a, sortColumn), getColumnValue(b, sortColumn));
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [columnMap, columns, filters, rows, sortConfig]);

  const getFilterOptions = (columnKey) => {
    const column = columnMap[columnKey];
    if (!column) return [];

    return [...new Set(rows.map((row) => normalizeValue(getColumnValue(row, column))).filter(Boolean))]
      .sort((a, b) => compareValues(a, b));
  };

  const isFiltered = (columnKey) => {
    const filter = filters[columnKey];
    return Boolean(filter?.search || filter?.values?.length);
  };

  return {
    rows: controlledRows,
    sortConfig,
    setSortConfig,
    filters,
    setFilters,
    getFilterOptions,
    isFiltered,
  };
}
