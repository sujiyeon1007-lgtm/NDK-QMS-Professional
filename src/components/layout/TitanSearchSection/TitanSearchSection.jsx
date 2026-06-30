import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../ui/Button";
import { TITAN_PANEL } from "../../../config/titanWorkspace";
import { useTitanWorkspacePanel } from "../../../hooks/useTitanWorkspacePanel";

export default function TitanSearchSection({
  screenId,
  baseFields,
  advancedFields,
  onSearch,
  onReset,
  headerExtra = null,
  className = "",
}) {
  const { expanded: advancedOpen, toggle: toggleAdvanced } = useTitanWorkspacePanel(
    screenId,
    TITAN_PANEL.SEARCH_ADVANCED,
    false
  );

  return (
    <section
      className={`ndk-search-card panel search-panel titan-search-panel--compact ${className}`.trim()}
    >
      {headerExtra}

      <div className="search-grid">{baseFields}</div>

      {advancedFields ? (
        <>
          <button
            type="button"
            className={`titan-search-advanced-toggle${advancedOpen ? "" : " is-collapsed"}`}
            onClick={toggleAdvanced}
            aria-expanded={advancedOpen}
          >
            <ChevronDown size={14} className="chevron" />
            추가 옵션
          </button>

          {advancedOpen && <div className="search-grid search-grid--advanced">{advancedFields}</div>}
        </>
      ) : null}

      <div className="ndk-search-card__actions search-actions">
        {onReset ? (
          <SecondaryButton type="button" onClick={onReset}>
            <RotateCcw size={16} />
            초기화
          </SecondaryButton>
        ) : null}
        {onSearch ? (
          <PrimaryButton type="button" onClick={onSearch}>
            <Search size={16} />
            조회
          </PrimaryButton>
        ) : null}
      </div>
    </section>
  );
}
