import Input from "./Input";
import {
  STATISTICS_PERIODS,
  STATISTICS_UNIT_OPTIONS,
} from "../../config/statisticsDashboard";
import {
  formatReferenceInputValue,
  getReferenceInputType,
  parseReferenceInputValue,
} from "../../utils/statisticsAnalytics";

export default function StatisticsCriteriaPanel({
  scope,
  dimensionId,
  dimensionValue,
  dimensionOptions,
  onDimensionChange,
  onDimensionValueChange,
  unitFilter,
  onUnitFilterChange,
  period,
  onPeriodChange,
  referenceDate,
  onReferenceDateChange,
}) {
  const inputType = getReferenceInputType(period);
  const inputValue = formatReferenceInputValue(period, referenceDate);

  const handleDateChange = (event) => {
    onReferenceDateChange(parseReferenceInputValue(period, event.target.value, referenceDate));
  };

  if (!scope.dimensions?.length && scope.useInquiryAnalytics) {
    return (
      <section className="statistics-criteria-panel production-criteria-panel">
        <div className="production-criteria-panel__row">
          <div className="production-criteria-panel__group production-criteria-panel__group--wide">
            <h3 className="production-criteria-panel__title">단위 선택</h3>
            <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="단위 선택">
              {STATISTICS_UNIT_OPTIONS.map((item) => (
                <label key={item.label} className="production-criteria-panel__radio">
                  <input
                    type="radio"
                    name="statistics-unit"
                    value={item.value}
                    checked={unitFilter === item.value}
                    onChange={() => onUnitFilterChange(item.value)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="production-criteria-panel__row">
          <div className="production-criteria-panel__group production-criteria-panel__group--wide">
            <h3 className="production-criteria-panel__title">조회 기간</h3>
            <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="조회 기간">
              {STATISTICS_PERIODS.map((item) => (
                <label key={item.id} className="production-criteria-panel__radio">
                  <input
                    type="radio"
                    name="statistics-period"
                    value={item.id}
                    checked={period === item.id}
                    onChange={() => onPeriodChange(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="production-criteria-panel__group">
            <h3 className="production-criteria-panel__title">기준일</h3>
            <Input type={inputType} value={inputValue} onChange={handleDateChange} aria-label="기준일" />
          </div>
        </div>
      </section>
    );
  }

  const valueLabel =
    scope.dimensions?.find((item) => item.id === dimensionId)?.label?.replace("별", " 선택") ?? "항목 선택";

  return (
    <section className="statistics-criteria-panel production-criteria-panel">
      <div className="production-criteria-panel__row">
        <div className="production-criteria-panel__group production-criteria-panel__group--wide">
          <h3 className="production-criteria-panel__title">조회 기준</h3>
          <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="조회 기준">
            {scope.dimensions?.map((item) => (
              <label key={item.id} className="production-criteria-panel__radio">
                <input
                  type="radio"
                  name="statistics-dimension"
                  value={item.id}
                  checked={dimensionId === item.id}
                  onChange={() => onDimensionChange(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="production-criteria-panel__group">
          <h3 className="production-criteria-panel__title">{valueLabel}</h3>
          <select
            className="titan-search-panel__select production-criteria-panel__select"
            value={dimensionValue}
            onChange={(e) => onDimensionValueChange(e.target.value)}
            disabled={dimensionOptions.length === 0}
          >
            <option value="">전체</option>
            {dimensionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="production-criteria-panel__row">
        <div className="production-criteria-panel__group production-criteria-panel__group--wide">
          <h3 className="production-criteria-panel__title">단위 선택</h3>
          <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="단위 선택">
            {STATISTICS_UNIT_OPTIONS.map((item) => (
              <label key={item.label} className="production-criteria-panel__radio">
                <input
                  type="radio"
                  name="statistics-unit"
                  value={item.value}
                  checked={unitFilter === item.value}
                  onChange={() => onUnitFilterChange(item.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="production-criteria-panel__row">
        <div className="production-criteria-panel__group production-criteria-panel__group--wide">
          <h3 className="production-criteria-panel__title">조회 기간</h3>
          <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="조회 기간">
            {STATISTICS_PERIODS.map((item) => (
              <label key={item.id} className="production-criteria-panel__radio">
                <input
                  type="radio"
                  name="statistics-period"
                  value={item.id}
                  checked={period === item.id}
                  onChange={() => onPeriodChange(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="production-criteria-panel__group">
          <h3 className="production-criteria-panel__title">기준일</h3>
          <Input type={inputType} value={inputValue} onChange={handleDateChange} aria-label="기준일" />
        </div>
      </div>
    </section>
  );
}
