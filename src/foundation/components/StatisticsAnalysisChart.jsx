import { useMemo } from "react";
import { BarChart2, LineChart, PieChart } from "lucide-react";
import { STATISTICS_CHART_TYPES } from "../../config/statisticsDashboard";
import { buildStatisticsPieItems } from "../../utils/statisticsAnalytics";

const CHART_TONES = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#94a3b8"];

function getMaxValue(items, keys) {
  return items.reduce((max, item) => {
    const value = keys.reduce((sum, key) => sum + (Number(item[key]) || 0), 0);
    return Math.max(max, value);
  }, 0);
}

function buildConicGradient(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return "conic-gradient(#e2e8f0 0deg 360deg)";

  let cumulative = 0;
  const segments = items.map((item, index) => {
    const start = (cumulative / total) * 100;
    cumulative += item.value;
    const end = (cumulative / total) * 100;
    return `${CHART_TONES[index % CHART_TONES.length]} ${start}% ${end}%`;
  });
  return `conic-gradient(${segments.join(", ")})`;
}

function StatisticsComboChart({ items, quantityUnitLabel }) {
  const unit = quantityUnitLabel || "";
  const maxValue = Math.max(getMaxValue(items, ["productionQty", "shipmentQty"]), items.length ? 1 : 0);
  const maxInspection = Math.max(...items.map((item) => item.inspectionCount), 1);

  return (
    <div className="statistics-combo-chart" role="img" aria-label="월간 추이 그래프">
      <div className="statistics-combo-chart__plot">
        {items.map((item) => (
          <div key={item.label} className="statistics-combo-chart__group">
            <div className="statistics-combo-chart__bars">
              <span
                className="statistics-combo-chart__bar statistics-combo-chart__bar--production"
                style={{ height: `${Math.max(8, (item.productionQty / maxValue) * 100)}%` }}
                title={`생산 ${item.productionQty.toLocaleString("ko-KR")} ${unit}`}
              />
              <span
                className="statistics-combo-chart__bar statistics-combo-chart__bar--shipment"
                style={{ height: `${Math.max(8, (item.shipmentQty / maxValue) * 100)}%` }}
                title={`출고 ${item.shipmentQty.toLocaleString("ko-KR")} ${unit}`}
              />
            </div>
            <span
              className="statistics-combo-chart__line-dot"
              style={{ bottom: `${Math.max(8, (item.inspectionCount / maxInspection) * 72)}%` }}
              title={`검사 ${item.inspectionCount}건`}
            />
            <span className="statistics-combo-chart__label">{item.label}</span>
          </div>
        ))}
      </div>
      <ul className="statistics-combo-chart__legend">
        <li>
          <span className="statistics-combo-chart__legend-bar statistics-combo-chart__legend-bar--production" />
          생산{unit ? `(${unit})` : ""}
        </li>
        <li>
          <span className="statistics-combo-chart__legend-bar statistics-combo-chart__legend-bar--shipment" />
          출고{unit ? `(${unit})` : ""}
        </li>
        <li>
          <span className="statistics-combo-chart__legend-line" />
          검사(건)
        </li>
      </ul>
    </div>
  );
}

function StatisticsBarChart({ items, valueKey = "productionQty", label = "생산량" }) {
  const maxValue = Math.max(...items.map((item) => item[valueKey] || 0), 1);
  return (
    <div className="stat-bar-chart" role="img" aria-label={label}>
      {items.map((item) => (
        <div key={item.label} className="stat-bar-row">
          <span className="stat-bar-label">{item.label}</span>
          <div className="stat-bar-track">
            <span
              className="stat-bar-fill blue"
              style={{ width: `${Math.max(4, ((item[valueKey] || 0) / maxValue) * 100)}%` }}
            />
          </div>
          <span className="stat-bar-value">{Number(item[valueKey] || 0).toLocaleString("ko-KR")}</span>
        </div>
      ))}
    </div>
  );
}

function StatisticsLineChart({ items, valueKey = "inspectionCount", label = "검사(건)" }) {
  const maxValue = Math.max(...items.map((item) => item[valueKey] || 0), 1);
  return (
    <div className="stat-trend-chart" role="img" aria-label={label}>
      {items.map((item) => (
        <div key={item.label} className="stat-trend-col">
          <span
            className="stat-trend-bar"
            style={{ height: `${Math.max(8, ((item[valueKey] || 0) / maxValue) * 100)}%` }}
            title={`${item.label}: ${item[valueKey]}`}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatisticsPieChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) {
    return <p className="production-chart-card__empty">표시할 데이터가 없습니다.</p>;
  }

  return (
    <div className="production-donut-chart">
      <div
        className="production-donut-chart__ring"
        style={{ background: buildConicGradient(items) }}
        role="img"
        aria-label="비율 분석"
      >
        <div className="production-donut-chart__center">
          <span className="production-donut-chart__center-text">총 {total.toLocaleString("ko-KR")}</span>
        </div>
      </div>
      <ul className="production-chart-legend production-chart-legend--donut">
        {items.map((item, index) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <li key={item.label}>
              <span
                className="production-chart-legend__dot"
                style={{ background: CHART_TONES[index % CHART_TONES.length] }}
                aria-hidden="true"
              />
              <span className="production-chart-legend__label">{item.label}</span>
              <strong className="production-chart-legend__value">{percent}%</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const CHART_ICON = {
  line: LineChart,
  bar: BarChart2,
  pie: PieChart,
  combo: BarChart2,
};

export default function StatisticsAnalysisChart({
  title,
  scopeLabel,
  chartType,
  onChartTypeChange,
  trendItems,
  selectedRow,
  listRows,
  quantityUnitLabel = "",
  unitFilter = "",
  hideHeader = false,
}) {
  const pieItems = useMemo(
    () => buildStatisticsPieItems(selectedRow, listRows, unitFilter),
    [selectedRow, listRows, unitFilter]
  );

  const productionLabel = quantityUnitLabel ? `생산(${quantityUnitLabel})` : "생산량";
  const shipmentLabel = quantityUnitLabel ? `출고(${quantityUnitLabel})` : "출고량";

  const renderChart = () => {
    if (chartType === "pie") return <StatisticsPieChart items={pieItems} />;
    if (chartType === "bar") {
      const valueKey = selectedRow ? "shipmentQty" : "productionQty";
      return (
        <StatisticsBarChart
          items={trendItems}
          valueKey={valueKey}
          label={selectedRow ? shipmentLabel : productionLabel}
        />
      );
    }
    if (chartType === "line") {
      return <StatisticsLineChart items={trendItems} valueKey="inspectionCount" />;
    }
    return <StatisticsComboChart items={trendItems} quantityUnitLabel={quantityUnitLabel} />;
  };

  return (
    <section className={`statistics-analysis-section${hideHeader ? "" : " panel"}`}>
      {!hideHeader ? (
        <header className="statistics-analysis-section__head">
          <div className="stat-chart-head">
            <BarChart2 size={16} aria-hidden="true" />
            <h3>
              {title}
              {scopeLabel ? <span className="statistics-analysis-section__scope"> ({scopeLabel})</span> : null}
            </h3>
          </div>
          <div className="statistics-analysis-section__types" role="tablist" aria-label="차트 유형">
            {STATISTICS_CHART_TYPES.map((item) => {
              const Icon = CHART_ICON[item.id] ?? BarChart2;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={chartType === item.id}
                  className={`statistics-analysis-section__type${
                    chartType === item.id ? " statistics-analysis-section__type--active" : ""
                  }`}
                  onClick={() => onChartTypeChange(item.id)}
                  title={item.label}
                >
                  <Icon size={14} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </header>
      ) : null}
      <div className="statistics-analysis-section__body">{renderChart()}</div>
    </section>
  );
}
