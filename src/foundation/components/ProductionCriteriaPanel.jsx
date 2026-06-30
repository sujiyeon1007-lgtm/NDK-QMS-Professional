/**
 * Project TITAN V1.0 — 생산실적 조회 기준 패널 (시안 기준)
 */

import { ANALYSIS_DIMENSIONS, ANALYSIS_PERIODS } from "../../config/productionDashboard";
import { getDimensionSelectLabel } from "../../utils/productionAnalytics";

export default function ProductionCriteriaPanel({
  analysisDimension,
  analysisValue,
  analysisPeriod,
  dimensionOptions,
  onDimensionChange,
  onValueChange,
  onPeriodChange,
}) {
  const valueLabel = getDimensionSelectLabel(analysisDimension);

  return (
    <section className="production-criteria-panel">
      <div className="production-criteria-panel__row">
        <div className="production-criteria-panel__group production-criteria-panel__group--wide">
          <h3 className="production-criteria-panel__title">조회 기준</h3>
          <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="조회 기준">
            {ANALYSIS_DIMENSIONS.map((item) => (
              <label key={item.id} className="production-criteria-panel__radio">
                <input
                  type="radio"
                  name="analysis-dimension"
                  value={item.id}
                  checked={analysisDimension === item.id}
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
            value={analysisValue}
            onChange={(e) => onValueChange(e.target.value)}
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
          <h3 className="production-criteria-panel__title">조회 기간</h3>
          <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="조회 기간">
            {ANALYSIS_PERIODS.map((item) => (
              <label key={item.id} className="production-criteria-panel__radio">
                <input
                  type="radio"
                  name="analysis-period"
                  value={item.id}
                  checked={analysisPeriod === item.id}
                  onChange={() => onPeriodChange(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
