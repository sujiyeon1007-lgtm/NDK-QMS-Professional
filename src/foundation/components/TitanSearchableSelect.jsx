import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

function highlightMatch(text, query) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const index = lower.indexOf(q);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="titan-search-ac__mark">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

/** Excel 자동필터 스타일 — 선택 전용 검색 DropDown */
export default function TitanSearchableSelect({
  label,
  value = "",
  onChange,
  options = [],
  placeholder = "선택",
  disabled = false,
  className = "",
  emptySearchMessage = "",
  onEmptySearch,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedFilter = filter.trim();
  const filteredOptions = useMemo(() => {
    const q = trimmedFilter.toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, trimmedFilter]);

  const showEmptySearch =
    open && trimmedFilter && filteredOptions.length === 0 && options.length > 0;

  const commitValue = (nextValue) => {
    onChange?.(nextValue);
    setOpen(false);
    setFilter("");
    setActiveIndex(-1);
  };

  useEffect(() => {
    if (!open) return undefined;
    searchRef.current?.focus();
    return undefined;
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setFilter("");
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [filter, open]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      setFilter("");
      return;
    }
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      if (!disabled) setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        commitValue(filteredOptions[activeIndex]);
      } else if (showEmptySearch) {
        onEmptySearch?.(trimmedFilter);
      }
    }
  };

  return (
    <label className={className || undefined}>
      {label ? <span>{label}</span> : null}
      <div
        className={`titan-search-ac titan-searchable-select${disabled ? " is-disabled" : ""}${open ? " is-open" : ""}`.trim()}
        ref={rootRef}
      >
        <button
          type="button"
          className="titan-searchable-select__trigger"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
          }}
          onKeyDown={handleKeyDown}
        >
          <span className={value ? "" : "is-placeholder"}>{value || placeholder}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>

        {open ? (
          <div className="titan-search-ac__dropdown titan-searchable-select__dropdown" id={listId}>
            <input
              ref={searchRef}
              type="text"
              className="titan-searchable-select__search"
              value={filter}
              placeholder="검색"
              onChange={(event) => setFilter(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            {filteredOptions.length > 0 ? (
              <div role="listbox">
                {filteredOptions.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={`titan-search-ac__option${index === activeIndex ? " is-active" : ""}${option === value ? " is-selected" : ""}`}
                    role="option"
                    aria-selected={option === value}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => commitValue(option)}
                  >
                    {highlightMatch(option, trimmedFilter)}
                  </button>
                ))}
              </div>
            ) : null}
            {showEmptySearch ? (
              <div className="titan-searchable-select__empty" role="status">
                <p>{emptySearchMessage || "검색 결과가 없습니다."}</p>
                {onEmptySearch ? (
                  <button
                    type="button"
                    className="titan-searchable-select__empty-action"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onEmptySearch(trimmedFilter)}
                  >
                    등록
                  </button>
                ) : null}
              </div>
            ) : null}
            {!options.length ? (
              <div className="titan-searchable-select__empty" role="status">
                <p>등록된 항목이 없습니다.</p>
                {onEmptySearch ? (
                  <button
                    type="button"
                    className="titan-searchable-select__empty-action"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onEmptySearch("")}
                  >
                    등록
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </label>
  );
}
