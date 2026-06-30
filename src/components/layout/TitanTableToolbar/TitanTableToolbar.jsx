import { useEffect, useRef, useState } from "react";
import { Settings2 } from "lucide-react";
import { TITAN_PAGE_SIZE_OPTIONS } from "../../../hooks/useTitanPageSize";

export default function TitanTableToolbar({
  title,
  subtitle,
  count,
  countLabel = "총",
  columnDefs = null,
  visibleKeys = [],
  onToggleColumn = null,
  pageSize = null,
  onPageSizeChange = null,
  rightExtra = null,
}) {
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef(null);
  const showColumns = Boolean(columnDefs?.length && onToggleColumn);
  const showPageSize = pageSize != null && onPageSizeChange;

  useEffect(() => {
    if (!columnMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setColumnMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [columnMenuOpen]);

  return (
    <div className="titan-table-toolbar">
      <div className="titan-table-toolbar-left">
        <div>
          {title ? <h3 className="titan-table-title">{title}</h3> : null}
          {subtitle ? <p className="titan-table-subtitle">{subtitle}</p> : null}
        </div>
        {count != null ? (
          <span className="titan-table-count">
            {countLabel} {count.toLocaleString()}건
          </span>
        ) : null}
      </div>

      <div className="titan-table-toolbar-right">
        {rightExtra}
        {showColumns ? (
          <div className="titan-column-menu" ref={columnMenuRef}>
            <button
              type="button"
              className="titan-table-tool-btn"
              onClick={() => setColumnMenuOpen((prev) => !prev)}
              aria-expanded={columnMenuOpen}
            >
              <Settings2 size={14} />
              열 설정
            </button>
            {columnMenuOpen ? (
              <div className="titan-column-popover" role="dialog" aria-label="열 설정">
                {columnDefs.map((column) => (
                  <label key={column.key}>
                    <input
                      type="checkbox"
                      checked={visibleKeys.includes(column.key)}
                      onChange={() => onToggleColumn(column.key)}
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {showPageSize ? (
          <label className="titan-page-size">
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="페이지당 표시 건수"
            >
              {TITAN_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}개씩 보기
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}
