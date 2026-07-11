import { useCallback, useState } from "react";

/** @param {Record<string, unknown>} draft */
export function clearChipFilterPatches(draft) {
  for (const key of Object.keys(draft)) {
    if (key.startsWith("__chip")) {
      delete draft[key];
    }
  }
}

/**
 * Status Chip 클릭 → 검색 필터 토글 (Config chip.filterValue · filterPatch)
 *
 * @param {object} options
 * @param {object} options.draft
 * @param {Function} options.onDraftChange
 * @param {Function} [options.onReset]
 * @param {string} [options.statusField]
 * @param {Function} [options.onChipApplied] — chip 선택 시 콜백 (HOME list filter 등)
 */
export function useStatusChipFilter({
  draft,
  onDraftChange,
  onReset,
  onSearch,
  statusField = "status",
  onChipApplied,
}) {
  const [activeChipId, setActiveChipId] = useState(null);

  const applyChipFilter = useCallback(
    (chip) => {
      const nextDraft = { ...draft, [statusField]: "" };
      clearChipFilterPatches(nextDraft);

      if (chip.filterPatch) {
        Object.assign(nextDraft, chip.filterPatch);
      } else if (chip.filterValue != null) {
        nextDraft[statusField] = chip.filterValue;
      }

      // Chip click must sync search immediately — skip Live Search debounce when onSearch exists.
      if (onSearch) {
        onSearch(nextDraft);
      } else {
        onDraftChange(nextDraft);
      }
      onChipApplied?.(chip, nextDraft);
    },
    [draft, onDraftChange, onChipApplied, onSearch, statusField]
  );

  const handleChipClick = useCallback(
    (chip) => {
      if (chip.filterable === false) return;

      if (activeChipId === chip.id) {
        setActiveChipId(null);
        onReset?.();
        return;
      }

      setActiveChipId(chip.id);
      applyChipFilter(chip);
    },
    [activeChipId, applyChipFilter, onReset]
  );

  const clearChipFilter = useCallback(() => {
    setActiveChipId(null);
  }, []);

  return {
    activeChipId,
    handleChipClick,
    clearChipFilter,
    setActiveChipId,
    applyChipFilter,
  };
}

/** @deprecated useStatusChipFilter 사용 */
export function useWorkflowChipFilter(options) {
  return useStatusChipFilter(options);
}
