import { useMemo } from "react";
import { Search, RotateCcw } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Button";
import TitanAdvancedSearch from "./TitanAdvancedSearch";
import TitanSearchAutocomplete, { TitanSearchField } from "./TitanSearchAutocomplete";
import {
  SEARCH_ADVANCED_CLOSE_LABEL,
  SEARCH_ADVANCED_OPEN_LABEL,
  SEARCH_RESET_LABEL,
  SEARCH_SUBMIT_LABEL,
} from "../../config/listSearchStandard";
import {
  buildSearchSuggestionIndex,
  filterSearchSuggestions,
} from "../../utils/titanSearchSuggestions";

export { TitanSearchField };

export default function TitanSearchPanel({
  draft,
  onDraftChange,
  onSearch,
  onReset,
  advancedOpen,
  onAdvancedToggle,
  advancedContent,
  companies = [],
  records = [],
  extraSuggestions = {},
  showStatusField = false,
  className = "",
  enableEnterSearch = true,
}) {
  const update = (key, value) => onDraftChange({ ...draft, [key]: value });
  const handleEnterSearch = enableEnterSearch ? onSearch : undefined;

  const suggestionIndex = useMemo(
    () =>
      buildSearchSuggestionIndex(records, {
        company: companies.map((item) => item.name).filter(Boolean),
        ...extraSuggestions,
      }),
    [records, companies, extraSuggestions]
  );

  const getSuggestions = (fieldKey) =>
    filterSearchSuggestions(suggestionIndex, fieldKey, draft[fieldKey]);

  return (
    <div className={`titan-search-panel titan-card ${className}`.trim()}>
      <div className="titan-search-panel__basic">
        <div className="titan-search-panel__fields">
          <TitanSearchField
            label="업체명"
            fieldKey="company"
            value={draft.company ?? ""}
            onChange={(value) => update("company", value)}
            suggestions={getSuggestions("company")}
            placeholder="업체명"
            allowEmpty
            emptyLabel="전체"
            onEnterSearch={handleEnterSearch}
          />
          <TitanSearchField
            label="품명"
            fieldKey="partName"
            value={draft.partName ?? ""}
            onChange={(value) => update("partName", value)}
            suggestions={getSuggestions("partName")}
            placeholder="품명"
            onEnterSearch={handleEnterSearch}
          />
          <TitanSearchField
            label="품번"
            fieldKey="partNo"
            value={draft.partNo ?? ""}
            onChange={(value) => update("partNo", value)}
            suggestions={getSuggestions("partNo")}
            placeholder="품번"
            onEnterSearch={handleEnterSearch}
          />
          <TitanSearchField
            label="재질"
            fieldKey="material"
            value={draft.material ?? ""}
            onChange={(value) => update("material", value)}
            suggestions={getSuggestions("material")}
            placeholder="재질"
            onEnterSearch={handleEnterSearch}
          />
          {showStatusField ? (
            <TitanSearchField
              label="현재상태"
              fieldKey="status"
              value={draft.status ?? ""}
              onChange={(value) => update("status", value)}
              suggestions={getSuggestions("status")}
              placeholder="현재상태"
              onEnterSearch={handleEnterSearch}
            />
          ) : null}
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

/** 상세 검색 영역용 — suggestionIndex를 페이지에서 공유할 때 */
export function useSearchSuggestionHelpers(records = [], extraSuggestions = {}) {
  const suggestionIndex = useMemo(
    () => buildSearchSuggestionIndex(records, extraSuggestions),
    [records, extraSuggestions]
  );

  return {
    suggestionIndex,
    getSuggestions: (fieldKey, query) =>
      filterSearchSuggestions(suggestionIndex, fieldKey, query),
  };
}

/** 상세 검색 Input 대체 */
export function TitanAdvancedSearchField({
  label,
  fieldKey,
  value,
  onChange,
  suggestions = [],
  placeholder,
  className = "titan-advanced-search__field",
  allowEmpty = false,
  emptyLabel = "전체",
}) {
  return (
    <label className={className}>
      <span className="titan-advanced-search__label">{label}</span>
      <TitanSearchAutocomplete
        fieldKey={fieldKey}
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        placeholder={placeholder}
        allowEmpty={allowEmpty}
        emptyLabel={emptyLabel}
      />
    </label>
  );
}
