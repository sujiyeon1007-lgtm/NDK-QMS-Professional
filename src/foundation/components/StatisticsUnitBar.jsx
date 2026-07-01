import { Scale } from "lucide-react";
import { STATISTICS_UNIT_OPTIONS } from "../../config/statisticsDashboard";

export default function StatisticsUnitBar({ unitFilter, onUnitFilterChange }) {
  return (
    <section className="stat-unit-bar" aria-label="단위 선택">
      <span className="stat-unit-bar__label">
        <Scale size={16} aria-hidden="true" />
        단위 선택
      </span>
      <div className="stat-unit-bar__tabs" role="tablist" aria-label="통계 단위">
        {STATISTICS_UNIT_OPTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={unitFilter === item.value}
            className={`stat-unit-bar__tab${unitFilter === item.value ? " active" : ""}`}
            onClick={() => onUnitFilterChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="stat-unit-bar__note">서로 다른 단위(EA / kg / LOT)는 하나의 수치로 합산하지 않습니다.</p>
    </section>
  );
}
