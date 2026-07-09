import { BarChart2 } from "lucide-react";
import {
  DashboardCard as FoundationDashboardCard,
  DashboardEmptyState,
  DashboardGrid,
  DashboardRow,
} from "./TitanDashboardCard";

const CHART_TONES = ["#2563eb", "#16a34a", "#f97316", "#8b5cf6", "#94a3b8"];
const WORKFLOW_SERIES = [
  { key: "inboundQty", label: "입고", color: "#2563eb" },
  { key: "heatTreatmentQty", label: "열처리", color: "#16a34a" },
  { key: "inspectionCount", label: "검사", color: "#f97316" },
  { key: "shipmentQty", label: "출고", color: "#8b5cf6" },
];

function buildConicGradient(items) {
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  if (total <= 0) return "conic-gradient(#e2e8f0 0deg 360deg)";
  let cumulative = 0;
  const segments = items.map((item, index) => {
    const start = (cumulative / total) * 100;
    cumulative += Number(item.value) || 0;
    const end = (cumulative / total) * 100;
    return `${CHART_TONES[index % CHART_TONES.length]} ${start}% ${end}%`;
  });
  return `conic-gradient(${segments.join(", ")})`;
}

function EmptyChartMessage() {
  return <DashboardEmptyState />;
}

function ExecLineChart({ items, unitLabel = "" }) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return <EmptyChartMessage />;
  const max = Math.max(...safeItems.map((item) => Number(item.value) || 0), 1);
  return (
    <div className="stat-exec-line-chart" role="img">
      {safeItems.map((item) => (
        <div key={String(item.label)} className="stat-exec-line-chart__col">
          <span
            className="stat-exec-line-chart__bar"
            style={{ height: `${Math.max(8, ((Number(item.value) || 0) / max) * 100)}%` }}
            title={`${item.label}: ${item.value}${unitLabel ? ` ${unitLabel}` : ""}`}
          />
          <span className="stat-exec-line-chart__label">{String(item.label ?? "").slice(-4)}</span>
        </div>
      ))}
    </div>
  );
}

function ExecBarChart({ items, ranked = false }) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return <EmptyChartMessage />;
  const max = Math.max(...safeItems.map((item) => Number(item.value) || 0), 1);
  return (
    <div className={`stat-bar-chart${ranked ? " stat-bar-chart--rank" : ""}`} role="img">
      {safeItems.map((item, index) => (
        <div key={String(item.label)} className="stat-bar-row">
          {ranked ? <span className="stat-bar-rank">{index + 1}</span> : null}
          <span className="stat-bar-label">{item.label}</span>
          <div className="stat-bar-track">
            <span className="stat-bar-fill blue" style={{ width: `${Math.max(4, ((Number(item.value) || 0) / max) * 100)}%` }} />
          </div>
          <span className="stat-bar-value">{(Number(item.value) || 0).toLocaleString("ko-KR")}</span>
        </div>
      ))}
    </div>
  );
}

function ExecPieChart({ items }) {
  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  if (total <= 0) return <EmptyChartMessage />;
  return (
    <div className="production-donut-chart production-donut-chart--dashboard">
      <div className="production-donut-chart__ring" style={{ background: buildConicGradient(safeItems) }} role="img">
        <div className="production-donut-chart__center">
          <span className="production-donut-chart__center-text">{total.toLocaleString("ko-KR")}</span>
        </div>
      </div>
      <ul className="production-chart-legend production-chart-legend--donut">
        {safeItems.slice(0, 5).map((item, index) => (
          <li key={String(item.label)}>
            <span className="production-chart-legend__dot" style={{ background: CHART_TONES[index] }} aria-hidden="true" />
            <span className="production-chart-legend__label">{item.label}</span>
            <strong className="production-chart-legend__value">{Math.round(((Number(item.value) || 0) / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExecMultiLineChart({ items }) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return <EmptyChartMessage />;

  const width = 960;
  const height = 240;
  const padding = { top: 24, right: 16, bottom: 32, left: 16 };
  const maxValues = WORKFLOW_SERIES.map((series) =>
    Math.max(...safeItems.map((item) => Number(item[series.key]) || 0), 1)
  );

  const buildPath = (seriesKey, max) => {
    if (safeItems.length <= 1) return "";
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const xStep = plotWidth / (safeItems.length - 1);
    return safeItems
      .map((item, index) => {
        const x = padding.left + index * xStep;
        const y = padding.top + plotHeight - ((Number(item[seriesKey]) || 0) / max) * plotHeight;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="stat-combined-trend">
      <svg className="stat-combined-trend__svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="월별 업무 처리 추이">
        {WORKFLOW_SERIES.map((series, seriesIndex) => (
          <path
            key={series.key}
            d={buildPath(series.key, maxValues[seriesIndex])}
            fill="none"
            stroke={series.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="stat-combined-trend__labels">
        {safeItems.map((item) => (
          <span key={String(item.label)}>{item.label}</span>
        ))}
      </div>
      <ul className="stat-combined-trend__legend">
        {WORKFLOW_SERIES.map((series) => (
          <li key={series.key}>
            <span className="stat-combined-trend__legend-dot" style={{ background: series.color }} aria-hidden="true" />
            {series.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExecDualRateChart({ passItems = [], failItems = [] }) {
  return (
    <div className="stat-exec-dual-rate">
      <div className="stat-exec-dual-rate__panel">
        <h4>합격률</h4>
        <ExecLineChart items={passItems} unitLabel="%" />
      </div>
      <div className="stat-exec-dual-rate__panel">
        <h4>불량률</h4>
        <ExecLineChart items={failItems} unitLabel="%" />
      </div>
    </div>
  );
}

function ExecParetoChart({ items }) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return <EmptyChartMessage />;
  const max = Math.max(...safeItems.map((item) => Number(item.value) || 0), 1);
  return (
    <div className="stat-exec-pareto" role="img">
      {safeItems.map((item) => (
        <div key={String(item.label)} className="stat-exec-pareto__row">
          <span className="stat-exec-pareto__label">{item.label}</span>
          <div className="stat-exec-pareto__track">
            <span className="stat-exec-pareto__bar" style={{ width: `${Math.max(4, ((Number(item.value) || 0) / max) * 100)}%` }} />
          </div>
          <span className="stat-exec-pareto__value">{item.cumulativePct ?? 0}%</span>
        </div>
      ))}
    </div>
  );
}

function ExecMetricCard({ value, unit }) {
  return (
    <div className="stat-exec-metric-card">
      <strong>{typeof value === "number" ? value.toLocaleString("ko-KR") : value ?? "0"}</strong>
      {unit ? <span>{unit}</span> : null}
    </div>
  );
}

function renderChartBody(chart) {
  if (!chart) return <EmptyChartMessage />;
  if (chart.type === "multi-line") return <ExecMultiLineChart items={chart.items} />;
  if (chart.type === "dual-rate") return <ExecDualRateChart passItems={chart.passItems} failItems={chart.failItems} />;
  if (chart.type === "line") return <ExecLineChart items={chart.items} unitLabel={chart.unitLabel} />;
  if (chart.type === "bar") return <ExecBarChart items={chart.items} ranked={chart.ranked} />;
  if (chart.type === "pie") return <ExecPieChart items={chart.items} />;
  if (chart.type === "pareto") return <ExecParetoChart items={chart.items} />;
  if (chart.type === "metric") return <ExecMetricCard value={chart.value} unit={chart.unit} />;
  return <EmptyChartMessage />;
}

function StatisticsDashboardCard({ chart, span = 4, height = "widget", className = "" }) {
  if (!chart) return null;
  return (
    <FoundationDashboardCard
      title={chart.title}
      icon={BarChart2}
      span={span}
      height={height}
      className={`stat-exec-card ${className}`.trim()}
    >
      <div className="stat-exec-card__body">{renderChartBody(chart)}</div>
    </FoundationDashboardCard>
  );
}

function TopListCard({ list }) {
  if (!list) return null;
  return (
    <FoundationDashboardCard title={list.title} icon={BarChart2} span={4} height="widget" className="stat-exec-top">
      <div className="stat-exec-top__body">
        <ExecBarChart items={list.items} ranked />
      </div>
    </FoundationDashboardCard>
  );
}

export default function StatisticsExecutiveDashboard({ dashboard }) {
  if (!dashboard) return null;

  const mainCharts = dashboard.mainCharts ?? [];
  const topLists = dashboard.topLists ?? [];
  const analysis = dashboard.analysis ?? [];
  const bottomCharts = dashboard.bottomCharts ?? [];

  return (
    <DashboardGrid className="stat-exec-dashboard" ariaLabel="경영 Dashboard">
      {dashboard.scopeLabel ? (
        <p className="statistics-charts-grid__scope">
          분석 기준: <strong>{dashboard.scopeLabel}</strong>
        </p>
      ) : null}

      <DashboardRow className="stat-exec-dashboard__main" minHeight="chart">
        {mainCharts.map((chart, index) => (
          <StatisticsDashboardCard
            key={chart.id}
            chart={chart}
            span={index === 0 ? 8 : 2}
            height="chart"
          />
        ))}
      </DashboardRow>

      {topLists.length ? (
        <DashboardRow className="stat-exec-dashboard__tops" minHeight="widget">
          {topLists.map((list) => (
            <TopListCard key={list.id} list={list} />
          ))}
        </DashboardRow>
      ) : null}

      {analysis.length ? (
        <DashboardRow className="stat-exec-dashboard__analysis" minHeight="widget">
          {analysis.map((chart) => (
            <StatisticsDashboardCard key={chart.id} chart={chart} span={4} height="widget" />
          ))}
        </DashboardRow>
      ) : null}

      {bottomCharts.length ? (
        <DashboardRow className="stat-exec-dashboard__bottom" minHeight="widget">
          {bottomCharts.map((chart) => (
            <StatisticsDashboardCard key={chart.id} chart={chart} span={3} height="widget" />
          ))}
        </DashboardRow>
      ) : null}
    </DashboardGrid>
  );
}
