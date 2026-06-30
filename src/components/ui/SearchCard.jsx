import { RotateCcw, Search } from "lucide-react";
import Panel from "./Panel";
import { PrimaryButton, SecondaryButton } from "./Button";

export default function SearchCard({
  children,
  className = "",
  onSearch,
  onReset,
  searchLabel = "조회",
  resetLabel = "초기화",
  extraActions = null,
}) {
  return (
    <Panel className={`ndk-search-card titan-search-panel--compact ${className}`.trim()}>
      {children}
      <div className="ndk-search-card__actions search-actions">
        {extraActions}
        {onReset ? (
          <SecondaryButton type="button" onClick={onReset}>
            <RotateCcw size={16} />
            {resetLabel}
          </SecondaryButton>
        ) : null}
        {onSearch ? (
          <PrimaryButton type="button" onClick={onSearch}>
            <Search size={16} />
            {searchLabel}
          </PrimaryButton>
        ) : null}
      </div>
    </Panel>
  );
}
