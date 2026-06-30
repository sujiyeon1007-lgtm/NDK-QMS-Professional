import { ANALYSIS_PERIODS } from "../../config/productionDashboard";

const CHART_TONES = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#94a3b8"];

function getMaxValue(items) {
  return items.reduce((max, item) => Math.max(max, item.value), 0);
}

function getNiceAxisMax(value) {
  if (value <= 0) return 2000;
  const steps = [100, 200, 500, 1000, 2000, 5000];
  for (const step of steps) {
    if (value <= step * 4) {
      return Math.ceil(value / step) * step;
    }
  }
  return Math.ceil(value / 5000) * 5000;
}

function buildAxisTicks(maxValue) {
  const max = getNiceAxisMax(maxValue);
  const step = max / 4;
  return [0, step, step * 2, step * 3, max];
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

function shouldShowAxisLabel(index, total) {
  if (total <= 7) return true;
  if (index === 0 || index === total - 1) return true;
  const step = Math.max(1, Math.round(total / 6));
  return index % step === 0;
}

function TitanChartShell({ title, unit, children, emptyMessage = "표시할 데이터가 없습니다." }) {
  return (
    <article className="production-chart-card">
      <header className="production-chart-card__head">
        <h4 className="production-chart-card__title">{title}</h4>
        {unit ? <span className="production-chart-card__unit">{unit}</span> : null}
      </header>
      <div className="production-chart-card__body">
        {children ?? <p className="production-chart-card__empty">{emptyMessage}</p>}
      </div>
    </article>
  );
}

function TitanLineTrendChart({ title = "생산량 추이", items = [] }) {
  const dataMax = getMaxValue(items);
  const axisMax = getNiceAxisMax(dataMax);
  const axisTicks = buildAxisTicks(dataMax);
  const plotWidth = 480;
  const plotHeight = 200;
  const padding = { top: 18, right: 20, bottom: 10, left: 48 };
  const innerWidth = plotWidth - padding.left - padding.right;
  const innerHeight = plotHeight - padding.top - padding.bottom;

  const points = items.map((item, index) => {
    const x =
      items.length <= 1
        ? padding.left + innerWidth / 2
        : padding.left + (index / (items.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (item.value / axisMax) * innerHeight;
    return { x, y, item, index };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <TitanChartShell title={title} unit="(단위: EA)" emptyMessage={items.length === 0 ? undefined : null}>
      {items.length > 0 ? (
        <div className="production-line-chart" role="img" aria-label={title}>
          <div className="production-line-chart__plot-wrap">
            <svg
              viewBox={`0 0 ${plotWidth} ${plotHeight}`}
              className="production-line-chart__svg"
              preserveAspectRatio="xMidYMid meet"
            >
              {axisTicks.map((tick) => {
                const y = padding.top + innerHeight - (tick / axisMax) * innerHeight;
                return (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      x2={plotWidth - padding.right}
                      y1={y}
                      y2={y}
                      className="production-line-chart__grid-line"
                    />
                    <text x={padding.left - 10} y={y + 4} className="production-line-chart__axis-label">
                      {tick.toLocaleString("ko-KR")}
                    </text>
                  </g>
                );
              })}
              {points.length > 1 ? (
                <polyline points={polyline} className="production-line-chart__line" />
              ) : null}
              {points.map((point) => (
                <circle
                  key={`${point.item.label}-${point.index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  className="production-line-chart__dot"
                />
              ))}
            </svg>
          </div>
          <div className="production-line-chart__labels">
            {points.map((point) => (
              <span
                key={`${point.item.label}-${point.index}`}
                className={`production-line-chart__label${
                  shouldShowAxisLabel(point.index, points.length) ? "" : " production-line-chart__label--hidden"
                }`}
              >
                {point.item.label}
              </span>
            ))}
          </div>
          <div className="production-line-chart__legend">
            <span className="production-line-chart__legend-line" aria-hidden="true" />
            <span>생산량</span>
          </div>
        </div>
      ) : null}
    </TitanChartShell>
  );
}

function TitanProductionSummaryCard({ title, stats }) {
  const rows = [
    { id: "total", label: "총 생산량", value: stats.total, emphasize: true },
    { id: "avg", label: "평균 생산량 (일)", value: stats.avg },
    { id: "max", label: "최대 생산량 (일)", value: stats.max },
    { id: "min", label: "최소 생산량 (일)", value: stats.min },
  ];

  return (
    <TitanChartShell title={title} unit="(단위: EA)">
      <dl className="production-summary-stats">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`production-summary-stats__row${
              row.emphasize ? " production-summary-stats__row--emphasis" : ""
            }`}
          >
            <dt>{row.label}</dt>
            <dd>
              {row.value.toLocaleString("ko-KR")}
              <small>EA</small>
            </dd>
          </div>
        ))}
      </dl>
    </TitanChartShell>
  );
}

function TitanDonutShareChart({ title, items = [] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <TitanChartShell title={title} unit="(단위: %)" emptyMessage={total <= 0 ? undefined : null}>
      {total > 0 ? (
        <div className="production-donut-chart">
          <div
            className="production-donut-chart__ring"
            style={{ background: buildConicGradient(items) }}
            role="img"
            aria-label={title}
          >
            <div className="production-donut-chart__center">
              <span className="production-donut-chart__center-text">
                총 {total.toLocaleString("ko-KR")} EA
              </span>
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
                  <strong className="production-chart-legend__value">
                    {percent}%
                    <span className="production-chart-legend__qty">
                      ({item.value.toLocaleString("ko-KR")} EA)
                    </span>
                  </strong>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </TitanChartShell>
  );
}

/**
 * Project TITAN V1.0 — 생산실적관리 분석 차트 (PM 승인 시안)
 *
 * 레이아웃:
 *   분석 차트 (scope)
 *   [일간][주간][월간][연간]
 *   ┌ 생산량 추이 ──┬ 생산량 요약 ─┐
 *   ├ 공정별 비율 ──┴ 재질별 비율 ─┘
 */
export default function ProductionAnalyticsCharts({
  scopeLabel,
  chartPeriod,
  onChartPeriodChange,
  trendTitle,
  summaryTitle,
  trendItems,
  summaryStats,
  processItems,
  materialItems,
}) {
  return (
    <section className="production-analytics-section">
      <header className="production-analytics-section__head">
        <h3 className="production-analytics-section__title">
          분석 차트
          {scopeLabel ? (
            <span className="production-analytics-section__scope"> ({scopeLabel})</span>
          ) : null}
        </h3>
        <div className="production-analytics-section__tabs" role="tablist" aria-label="차트 조회 기간">
          {ANALYSIS_PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={chartPeriod === item.id}
              className={`production-analytics-section__tab${
                chartPeriod === item.id ? " production-analytics-section__tab--active" : ""
              }`}
              onClick={() => onChartPeriodChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="production-analytics-layout">
        <div className="production-analytics-layout__cell production-analytics-layout__trend">
          <TitanLineTrendChart title={trendTitle} items={trendItems} />
        </div>
        <div className="production-analytics-layout__cell production-analytics-layout__summary">
          <TitanProductionSummaryCard title={summaryTitle} stats={summaryStats} />
        </div>
        <div className="production-analytics-layout__cell production-analytics-layout__process">
          <TitanDonutShareChart title="공정별 생산량 비율" items={processItems} />
        </div>
        <div className="production-analytics-layout__cell production-analytics-layout__material">
          <TitanDonutShareChart title="재질별 생산량 비율" items={materialItems} />
        </div>
      </div>
    </section>
  );
}
