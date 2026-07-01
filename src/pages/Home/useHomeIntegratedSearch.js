import { useCallback, useRef } from "react";

import { HOME_INTEGRATED_SEARCH_CONFIG } from "../../config/homeIntegratedSearch";
import { createEmptyHomeSearch } from "../../config/listSearchStandard";
import { useStatusChipFilter } from "../../foundation/hooks/useStatusChipFilter";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";

/**
 * HOME — 통합검색 + Status Chip 필터 통합 Hook
 * 검색 초기화 시 Chip 선택도 함께 해제 · 수동 검색 편집 시 Chip 선택 해제
 */
export function useHomeIntegratedSearch() {
  const { debounceMs, storageKey } = HOME_INTEGRATED_SEARCH_CONFIG;

  const listSearch = useTitanListSearch(createEmptyHomeSearch, { storageKey, debounceMs });
  const { draft, onDraftChange: applyDraftChange, onReset, ...restListSearch } = listSearch;
  const skipChipClearRef = useRef(false);

  const chipFilter = useStatusChipFilter({
    draft,
    onDraftChange: applyDraftChange,
    onReset,
    onChipApplied: () => {
      skipChipClearRef.current = true;
    },
  });

  const { activeChipId, handleChipClick, clearChipFilter } = chipFilter;

  const onDraftChange = useCallback(
    (nextDraft) => {
      if (activeChipId && !skipChipClearRef.current) {
        clearChipFilter();
      }
      skipChipClearRef.current = false;
      applyDraftChange(nextDraft);
    },
    [activeChipId, applyDraftChange, clearChipFilter]
  );

  const handleSearchReset = useCallback(() => {
    clearChipFilter();
    onReset();
  }, [clearChipFilter, onReset]);

  return {
    ...restListSearch,
    draft,
    onDraftChange,
    onReset: handleSearchReset,
    activeChipId,
    handleChipClick,
    clearChipFilter,
  };
}
