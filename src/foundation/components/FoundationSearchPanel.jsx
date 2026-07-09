import TitanSearchPanel, {
  TitanAdvancedSearchField,
  TitanSearchField,
  useSearchSuggestionHelpers,
} from "./TitanSearchPanel";
import { DateRangeField } from "./TitanSearchAdvancedFields";
import {
  getTitanQuickDateRange,
  TITAN_DATE_RANGE_QUICK_FILTERS,
} from "../../config/listSearchStandard";

export const FOUNDATION_SEARCH_PERIOD_PRESETS = TITAN_DATE_RANGE_QUICK_FILTERS;

export function getFoundationSearchPeriodRange(periodId, referenceDate) {
  return getTitanQuickDateRange(periodId, referenceDate);
}

export function FoundationSearchPeriodField({
  label = "\uC870\uD68C\uAE30\uAC04",
  fromKey = "dateFrom",
  toKey = "dateTo",
  draft,
  onDraftChange,
  showQuickFilters = true,
}) {
  return (
    <DateRangeField
      label={label}
      fromKey={fromKey}
      toKey={toKey}
      draft={draft}
      onDraftChange={onDraftChange}
      showQuickFilters={showQuickFilters}
    />
  );
}

function renderAdvancedContent({ period, draft, onDraftChange, advancedContent }) {
  const showPeriod = period && period.enabled !== false;
  if (!showPeriod) return advancedContent ?? null;

  return (
    <>
      <FoundationSearchPeriodField
        label={period.label ?? "\uC870\uD68C\uAE30\uAC04"}
        fromKey={period.fromKey ?? "dateFrom"}
        toKey={period.toKey ?? "dateTo"}
        draft={draft}
        onDraftChange={onDraftChange}
        showQuickFilters={period.showQuickFilters ?? true}
      />
      {advancedContent ?? null}
    </>
  );
}

export default function FoundationSearchPanel({
  period,
  advancedContent,
  draft,
  onDraftChange,
  className = "",
  ...props
}) {
  const classes = ["foundation-search-panel", className].filter(Boolean).join(" ");

  return (
    <TitanSearchPanel
      {...props}
      draft={draft}
      onDraftChange={onDraftChange}
      className={classes}
      advancedContent={renderAdvancedContent({ period, draft, onDraftChange, advancedContent })}
    />
  );
}

export { TitanAdvancedSearchField, TitanSearchField, useSearchSuggestionHelpers };
