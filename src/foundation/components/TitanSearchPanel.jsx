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
  statusFieldLabel = "현재상태",
  basicFields = null,
  basicFieldsClassName = "",
  className = "",
  bare = false,
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

  const defaultBasicFields = [
    { key: "company", label: "업체명", placeholder: "업체명", allowEmpty: true, emptyLabel: "전체" },
    { key: "partName", label: "품명", placeholder: "품명" },
    { key: "partNo", label: "품번", placeholder: "품번" },
    { key: "material", label: "재질", placeholder: "재질" },
  ];

  const resolvedBasicFields = basicFields ?? defaultBasicFields;

  return (
    <div
      className={`titan-search-panel${bare ? "" : " titan-card"} ${className}`.trim()}
    >
      <div className="titan-search-panel__basic">
        <div className="titan-search-panel__row titan-search-panel__row--primary">
          <div
            className={`titan-search-panel__fields${basicFieldsClassName ? ` ${basicFieldsClassName}` : ""}`.trim()}
          >
            {resolvedBasicFields.map((field) => (
              <TitanSearchField
                key={field.key}
                label={field.label}
                fieldKey={field.key}
                value={draft[field.key] ?? ""}
                onChange={(value) => update(field.key, value)}
                suggestions={getSuggestions(field.key)}
                placeholder={field.placeholder ?? field.label}
                allowEmpty={field.allowEmpty}
                emptyLabel={field.emptyLabel}
                onEnterSearch={handleEnterSearch}
              />
            ))}
            {showStatusField ? (
              <TitanSearchField
                label={statusFieldLabel}
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
