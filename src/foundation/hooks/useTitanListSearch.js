import { useCallback, useEffect, useRef, useState } from "react";
import { useAdvancedSearchOpen } from "./useAdvancedSearchOpen";

/** Project TITAN — Live Search + draft/search 상태 (0.25s debounce) */
export function useTitanListSearch(emptyFactory, options = {}) {
  const { storageKey = "default", debounceMs = 250 } = options;
  const createEmpty = useCallback(
    () => (typeof emptyFactory === "function" ? emptyFactory() : { ...emptyFactory }),
    [emptyFactory]
  );

  const [search, setSearch] = useState(createEmpty);
  const [draft, setDraft] = useState(createEmpty);
  const [advancedOpen, toggleAdvanced, setAdvancedOpen] = useAdvancedSearchOpen(
    `titan-${storageKey}-advanced`
  );
  const debounceRef = useRef(null);

  const applySearch = useCallback(
    (nextDraft) => {
      setSearch(typeof nextDraft === "function" ? nextDraft : { ...nextDraft });
    },
    []
  );

  const onDraftChange = useCallback(
    (nextDraft) => {
      setDraft(nextDraft);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => applySearch(nextDraft), debounceMs);
    },
    [applySearch, debounceMs]
  );

  const onSearch = useCallback((overrideDraft) => {
    clearTimeout(debounceRef.current);
    const next = overrideDraft ?? draft;
    setSearch({ ...next });
    if (overrideDraft) {
      setDraft({ ...overrideDraft });
    }
  }, [draft]);

  const onReset = useCallback(() => {
    clearTimeout(debounceRef.current);
    const empty = createEmpty();
    setDraft(empty);
    setSearch(empty);
  }, [createEmpty]);

  useEffect(
    () => () => {
      clearTimeout(debounceRef.current);
    },
    []
  );

  return {
    search,
    draft,
    onDraftChange,
    onSearch,
    onReset,
    advancedOpen,
    onAdvancedToggle: toggleAdvanced,
    setAdvancedOpen,
  };
}
