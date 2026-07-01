import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Star, Trash2, X } from "lucide-react";
import {
  addRecentSearch,
  clearRecentSearches,
  getFavoritesForField,
  getRecentSearchesForField,
  isSearchFavorite,
  removeRecentSearch,
  toggleSearchFavorite,
} from "../../utils/titanSearchHistory";
import { TITAN_SEARCH_FIELD_LABELS } from "../../utils/titanSearchSuggestions";

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

/** Project TITAN — 공통 검색 자동완성 입력 */
export default function TitanSearchAutocomplete({
  fieldKey,
  value = "",
  onChange,
  onSelect,
  suggestions = [],
  placeholder = "",
  className = "",
  allowEmpty = false,
  emptyLabel = "전체",
  onEnterSearch,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentTick, setRecentTick] = useState(0);

  const query = String(value ?? "");
  const trimmed = query.trim();

  const favorites = useMemo(
    () => getFavoritesForField(fieldKey),
    [fieldKey, recentTick, open]
  );
  const recentItems = useMemo(
    () => getRecentSearchesForField(fieldKey),
    [fieldKey, recentTick, open]
  );

  const suggestionItems = useMemo(() => {
    const seen = new Set();
    const items = [];

    favorites.forEach((item) => {
      if (seen.has(item.value)) return;
      if (trimmed && !item.value.toLowerCase().includes(trimmed.toLowerCase())) return;
      seen.add(item.value);
      items.push({ type: "favorite", value: item.value, id: item.id });
    });

    suggestions.forEach((suggestion) => {
      if (seen.has(suggestion)) return;
      seen.add(suggestion);
      items.push({ type: "suggestion", value: suggestion, id: `suggest:${suggestion}` });
    });

    if (!trimmed) {
      recentItems.forEach((item) => {
        if (seen.has(item.value)) return;
        seen.add(item.value);
        items.push({ type: "recent", value: item.value, id: item.id });
      });
    }

    return items;
  }, [favorites, suggestions, recentItems, trimmed]);

  const showDropdown = open && (suggestionItems.length > 0 || allowEmpty);

  const commitValue = (nextValue, saveRecent = true) => {
    onChange?.(nextValue);
    onSelect?.(nextValue);
    if (saveRecent && String(nextValue ?? "").trim()) {
      addRecentSearch(fieldKey, nextValue);
      setRecentTick((tick) => tick + 1);
    }
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleSelectItem = (item) => {
    if (!item) return;
    commitValue(item.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showDropdown && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestionItems.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && suggestionItems[activeIndex]) {
        handleSelectItem(suggestionItems[activeIndex]);
      } else {
        commitValue(query);
      }
      onEnterSearch?.();
    }
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, open]);

  const fieldLabel = TITAN_SEARCH_FIELD_LABELS[fieldKey] || fieldKey;

  return (
    <div className={`titan-search-ac ${className}`.trim()} ref={rootRef}>
      <input
        ref={inputRef}
        type="text"
        className="titan-input titan-search-ac__input"
        value={query}
        placeholder={placeholder || fieldLabel}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange?.(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {showDropdown ? (
        <div className="titan-search-ac__dropdown" id={listId} role="listbox">
          {allowEmpty ? (
            <button
              type="button"
              className={`titan-search-ac__option${activeIndex === -1 && !trimmed ? " is-active" : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commitValue("")}
            >
              {emptyLabel}
            </button>
          ) : null}

          {favorites.length > 0 ? (
            <div className="titan-search-ac__section-label">⭐ 즐겨찾기</div>
          ) : null}

          {!trimmed && recentItems.length > 0 ? (
            <div className="titan-search-ac__recent-bar">
              <span className="titan-search-ac__section-label">최근 검색</span>
              <button
                type="button"
                className="titan-search-ac__clear"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  clearRecentSearches();
                  setRecentTick((tick) => tick + 1);
                }}
              >
                <Trash2 size={12} aria-hidden="true" />
                전체 삭제
              </button>
            </div>
          ) : null}

          {suggestionItems.map((item, index) => (
            <div
              key={item.id}
              className={`titan-search-ac__option-row${activeIndex === index ? " is-active" : ""}`}
            >
              <button
                type="button"
                className="titan-search-ac__option"
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectItem(item)}
              >
                {item.type === "favorite" ? <Star size={12} className="titan-search-ac__star" /> : null}
                {item.type === "recent" ? (
                  <span className="titan-search-ac__tag">최근</span>
                ) : null}
                <span>{highlightMatch(item.value, trimmed)}</span>
              </button>
              <button
                type="button"
                className="titan-search-ac__fav-btn"
                aria-label={isSearchFavorite(fieldKey, item.value) ? "즐겨찾기 해제" : "즐겨찾기 등록"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  toggleSearchFavorite(fieldKey, item.value);
                  setRecentTick((tick) => tick + 1);
                }}
              >
                <Star
                  size={12}
                  className={
                    isSearchFavorite(fieldKey, item.value)
                      ? "titan-search-ac__star is-on"
                      : "titan-search-ac__star"
                  }
                />
              </button>
              {item.type === "recent" ? (
                <button
                  type="button"
                  className="titan-search-ac__remove"
                  aria-label="최근 검색 삭제"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    removeRecentSearch(item.id);
                    setRecentTick((tick) => tick + 1);
                  }}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** 라벨 포함 공통 검색 필드 (기본 · 상세 검색 공용) */
export function TitanSearchField({
  label,
  fieldKey,
  value,
  onChange,
  suggestions = [],
  placeholder,
  allowEmpty = false,
  emptyLabel,
  onEnterSearch,
}) {
  return (
    <label className="titan-search-panel__field">
      <span className="titan-search-panel__label">{label}</span>
      <TitanSearchAutocomplete
        fieldKey={fieldKey}
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        placeholder={placeholder}
        allowEmpty={allowEmpty}
        emptyLabel={emptyLabel}
        onEnterSearch={onEnterSearch}
      />
    </label>
  );
}
