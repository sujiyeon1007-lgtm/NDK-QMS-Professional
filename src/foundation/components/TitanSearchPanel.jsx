import { Search, RotateCcw } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Button";
import Input from "./Input";
import TitanAdvancedSearch from "./TitanAdvancedSearch";
import {
  SEARCH_ADVANCED_CLOSE_LABEL,
  SEARCH_ADVANCED_OPEN_LABEL,
  SEARCH_RESET_LABEL,
  SEARCH_SUBMIT_LABEL,
} from "../../config/listSearchStandard";

function SearchField({ label, children }) {
  return (
    <label className="titan-search-panel__field">
      <span className="titan-search-panel__label">{label}</span>
      {children}
    </label>
  );
}

export default function TitanSearchPanel({
  draft,
  onDraftChange,
  onSearch,
  onReset,
  advancedOpen,
  onAdvancedToggle,
  advancedContent,
  companies = [],
  className = "",
}) {
  const update = (key, value) => onDraftChange({ ...draft, [key]: value });

  return (
    <div className={`titan-search-panel titan-card ${className}`.trim()}>
      <div className="titan-search-panel__basic">
        <div className="titan-search-panel__fields">
          <SearchField label="업체명">
            <select
              className="titan-search-panel__select"
              value={draft.company ?? ""}
              onChange={(e) => update("company", e.target.value)}
            >
              <option value="">전체</option>
              {companies.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </SearchField>
          <SearchField label="품명">
            <Input
              value={draft.partName ?? ""}
              onChange={(e) => update("partName", e.target.value)}
              placeholder="품명"
            />
          </SearchField>
          <SearchField label="품번">
            <Input
              value={draft.partNo ?? ""}
              onChange={(e) => update("partNo", e.target.value)}
              placeholder="품번"
            />
          </SearchField>
          <SearchField label="재질">
            <Input
              value={draft.material ?? ""}
              onChange={(e) => update("material", e.target.value)}
              placeholder="재질"
            />
          </SearchField>
        </div>
        <div className="titan-search-panel__actions">
          <PrimaryButton type="button" onClick={onSearch}>
            <Search size={14} aria-hidden="true" />
            {SEARCH_SUBMIT_LABEL}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onReset}>
            <RotateCcw size={14} aria-hidden="true" />
            {SEARCH_RESET_LABEL}
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onAdvancedToggle}>
            {advancedOpen ? SEARCH_ADVANCED_CLOSE_LABEL : SEARCH_ADVANCED_OPEN_LABEL}
          </SecondaryButton>
        </div>
      </div>

      <TitanAdvancedSearch open={advancedOpen}>{advancedContent}</TitanAdvancedSearch>
    </div>
  );
}
