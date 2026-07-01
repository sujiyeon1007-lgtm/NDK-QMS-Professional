import { BarChart2 } from "lucide-react";

const CHART_TONES = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#94a3b8"];

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

function MiniLineChart({ items, unitLabel }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="stat-trend-chart" role="img">
      {items.map((item) => (
        <div key={item.label} className="stat-trend-col">
          <span
            className="stat-trend-bar"
            style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
            title={`${item.label}: ${item.value}${unitLabel ? ` ${unitLabel}` : ""}`}
          />
          <span>{item.label.slice(-5)}</span>
        </div>
      ))}
    </div>
  );
}

function MiniBarChart({ items, unitLabel }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="stat-bar-chart" role="img">
      {items.map((item) => (
        <div key={item.label} className="stat-bar-row">
          <span className="stat-bar-label">{item.label}</span>
          <div className="stat-bar-track">
            <span className="stat-bar-fill blue" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
          </div>
          <span className="stat-bar-value">{item.value.toLocaleString("ko-KR")}</span>
        </div>
      ))}
    </div>
  );
}

function MiniPieChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return <p className="production-chart-card__empty">표시할 데이터가 없습니다.</p>;
  return (
    <div className="production-donut-chart production-donut-chart--compact">
      <div className="production-donut-chart__ring" style={{ background: buildConicGradient(items) }} role="img">
        <div className="production-donut-chart__center">
          <span className="production-donut-chart__center-text">{total.toLocaleString("ko-KR")}</span>
        </div>
      </div>
      <ul className="production-chart-legend production-chart-legend--donut">
        {items.slice(0, 4).map((item, index) => (
          <li key={item.label}>
            <span className="production-chart-legend__dot" style={{ background: CHART_TONES[index] }} aria-hidden="true" />
            <span className="production-chart-legend__label">{item.label}</span>
            <strong className="production-chart-legend__value">{Math.round((item.value / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({ chart }) {
  const renderBody = () => {
    if (!chart.items?.length) {
      return <p className="production-chart-card__empty">표시할 데이터가 없습니다.</p>;
    }
    if (chart.type === "line") return <MiniLineChart items={chart.items} unitLabel={chart.unitLabel} />;
    if (chart.type === "bar") return <MiniBarChart items={chart.items} unitLabel={chart.unitLabel} />;
    if (chart.type === "pie") return <MiniPieChart items={chart.items} />;
    return null;
  };

  return (
    <article className="statistics-chart-card panel">
      <header className="stat-chart-head">
        <BarChart2 size={16} aria-hidden="true" />
        <h3>{chart.title}</h3>
      </header>
      <div className="statistics-chart-card__body">{renderBody()}</div>
    </article>
  );
}

export default function StatisticsTabChartsGrid({
  charts = [],
  scopeLabel,
  integratedDashboard = false,
}) {
  const gridClass = integratedDashboard
    ? "statistics-charts-grid__inner statistics-charts-grid__inner--dashboard"
    : "statistics-charts-grid__inner";

  return (
    <section className="statistics-charts-grid" aria-label="분석 차트">
      {scopeLabel ? (
        <p className="statistics-charts-grid__scope">
          분석 기준: <strong>{scopeLabel}</strong>
        </p>
      ) : null}
      <div className={gridClass}>
        {charts.map((chart) => (
          <ChartCard key={chart.id} chart={chart} />
        ))}
      </div>
    </section>
  );
}
