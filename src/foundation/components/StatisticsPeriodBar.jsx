import { CalendarDays } from "lucide-react";
import Input from "./Input";
import { STATISTICS_PERIODS } from "../../config/statisticsDashboard";
import {
  formatReferenceInputValue,
  getReferenceInputType,
} from "../../utils/statisticsAnalytics";

export default function StatisticsPeriodBar({
  period,
  onPeriodChange,
  referenceDate,
  onReferenceDateChange,
}) {
  const inputType = getReferenceInputType(period);
  const inputValue = formatReferenceInputValue(period, referenceDate);

  const handleDateChange = (event) => {
    onReferenceDateChange(event.target.value);
  };

  return (
    <section className="stat-period-bar" aria-label="조회 기간">
      <span className="stat-period-label">
        <CalendarDays size={16} aria-hidden="true" />
        조회 기간
      </span>
      <div className="stat-period-controls">
        <div className="stat-period-tabs" role="tablist" aria-label="조회 기간 구분">
          {STATISTICS_PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={period === item.id}
              className={`stat-period-tab${period === item.id ? " active" : ""}`}
              onClick={() => onPeriodChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="stat-period-date">
          <Input type={inputType} value={inputValue} onChange={handleDateChange} aria-label="기준일" />
        </label>
      </div>
    </section>
  );
}
