import { Link } from "react-router-dom";
import { BarChart2 } from "lucide-react";

const CHART_TONES = ["#2563eb", "#16a34a", "#f97316"];
const QUALITY_TONES = ["#2563eb", "#ef4444", "#f97316"];

const SERIES_META = [
  { key: "productionQty", label: "생산량", color: "#2563eb" },
  { key: "shipmentQty", label: "출고량", color: "#16a34a" },
  { key: "inspectionCount", label: "검사 건수", color: "#f97316" },
];

function buildConicGradient(items, tones = CHART_TONES) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return "conic-gradient(#e2e8f0 0deg 360deg)";
  let cumulative = 0;
  const segments = items.map((item, index) => {
    const start = (cumulative / total) * 100;
    cumulative += item.value;
    const end = (cumulative / total) * 100;
    return `${tones[index % tones.length]} ${start}% ${end}%`;
  });
  return `conic-gradient(${segments.join(", ")})`;
}

function buildSeriesPath(items, key, max, width, height, padding) {
  if (items.length <= 1) return "";
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xStep = plotWidth / (items.length - 1);

  return items
    .map((item, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + plotHeight - (item[key] / max) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function CombinedTrendChart({ items, unitLabel }) {
  if (!items?.length) return <p className="production-chart-card__empty">표시할 데이터가 없습니다.</p>;

  const width = 960;
  const height = 240;
  const padding = { top: 24, right: 16, bottom: 32, left: 16 };
  const maxValues = SERIES_META.map((series) => Math.max(...items.map((item) => item[series.key] || 0), 1));

  return (
    <div className="stat-combined-trend">
      <svg
        className="stat-combined-trend__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="생산 출고 검사 통합 추이"
      >
        {items.map((item, index) => {
          if (index === 0) return null;
          const plotWidth = width - padding.left - padding.right;
          const x = padding.left + (index / (items.length - 1)) * plotWidth;
          return (
            <line
              key={`grid-${item.label}`}
              x1={x}
              y1={padding.top}
              x2={x}
              y2={height - padding.bottom}
              className="stat-combined-trend__grid"
            />
          );
        })}
        {SERIES_META.map((series, seriesIndex) => (
          <path
            key={series.key}
            d={buildSeriesPath(items, series.key, maxValues[seriesIndex], width, height, padding)}
            fill="none"
            stroke={series.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {SERIES_META.map((series, seriesIndex) =>
          items.map((item, index) => {
            const plotWidth = width - padding.left - padding.right;
            const plotHeight = height - padding.top - padding.bottom;
            const x = padding.left + (index / Math.max(items.length - 1, 1)) * plotWidth;
            const y = padding.top + plotHeight - (item[series.key] / maxValues[seriesIndex]) * plotHeight;
            return (
              <circle
                key={`${series.key}-${item.label}`}
                cx={x}
                cy={y}
                r="4"
                fill={series.color}
                stroke="#ffffff"
                strokeWidth="1.5"
              >
                <title>
                  {item.label} {series.label}: {item[series.key].toLocaleString("ko-KR")}
                  {series.key !== "inspectionCount" && unitLabel ? ` ${unitLabel}` : series.key === "inspectionCount" ? " 건" : ""}
                </title>
              </circle>
            );
          })
        )}
      </svg>
      <div className="stat-combined-trend__labels">
        {items.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
      <ul className="stat-combined-trend__legend">
        {SERIES_META.map((series) => (
          <li key={series.key}>
            <span className="stat-combined-trend__legend-dot" style={{ background: series.color }} aria-hidden="true" />
            {series.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareBarChart({ production, shipment, unitLabel }) {
  const max = Math.max(production, shipment, 1);
  const formatValue = (value) => `${value.toLocaleString("ko-KR")}${unitLabel ? ` ${unitLabel}` : ""}`;

  return (
    <div className="stat-compare-bar" role="img" aria-label="생산 출고 비교">
      <div className="stat-compare-bar__group">
        <div className="stat-compare-bar__col">
          <span className="stat-compare-bar__value">{formatValue(production)}</span>
          <div className="stat-compare-bar__track">
            <span
              className="stat-compare-bar__pillar stat-compare-bar__pillar--production"
              style={{ height: `${Math.max(12, (production / max) * 100)}%` }}
            />
          </div>
          <span className="stat-compare-bar__label">생산</span>
        </div>
        <div className="stat-compare-bar__col">
          <span className="stat-compare-bar__value">{formatValue(shipment)}</span>
          <div className="stat-compare-bar__track">
            <span
              className="stat-compare-bar__pillar stat-compare-bar__pillar--shipment"
              style={{ height: `${Math.max(12, (shipment / max) * 100)}%` }}
            />
          </div>
          <span className="stat-compare-bar__label">출고</span>
        </div>
      </div>
    </div>
  );
}

function QualityPieChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return <p className="production-chart-card__empty">표시할 데이터가 없습니다.</p>;

  return (
    <div className="stat-quality-pie stat-quality-pie--expanded">
      <div className="production-donut-chart production-donut-chart--dashboard production-donut-chart--expanded">
        <div
          className="production-donut-chart__ring"
          style={{ background: buildConicGradient(items, QUALITY_TONES) }}
          role="img"
        >
          <div className="production-donut-chart__center">
            <span className="production-donut-chart__center-text">{total.toLocaleString("ko-KR")}</span>
            <span className="production-donut-chart__center-sub">건</span>
          </div>
        </div>
      </div>
      <ul className="stat-quality-pie__legend stat-quality-pie__legend--expanded">
        {items.map((item, index) => {
          const pct = Math.round((item.value / total) * 1000) / 10;
          return (
            <li key={item.label}>
              <span
                className="production-chart-legend__dot"
                style={{ background: QUALITY_TONES[index] }}
                aria-hidden="true"
              />
              <span className="stat-quality-pie__label">{item.label}</span>
              <strong className="stat-quality-pie__metric">
                {item.value.toLocaleString("ko-KR")}건 ({pct}%)
              </strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecentActivityList({ items }) {
  if (!items?.length) return <p className="production-chart-card__empty">표시할 데이터가 없습니다.</p>;

  return (
    <ul className="stat-recent-list stat-recent-list--dashboard">
      {items.map((item) => (
        <li key={item.id}>
          <Link to={item.linkTo} className="stat-recent-list__item stat-recent-list__item--link">
            <div className="stat-recent-list__main">
              <strong>{item.company}</strong>
              {item.partName ? <span>{item.partName}</span> : null}
            </div>
            <div className="stat-recent-list__detail">
              {item.qtyLabel ? <span className="stat-recent-list__qty">{item.qtyLabel}</span> : null}
              <span className="stat-recent-list__status">{item.statusLabel}</span>
              <span className="stat-recent-list__date">{item.date}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DashboardCard({ chart, className = "" }) {
  const renderBody = () => {
    if (chart.type === "combined-line") {
      return <CombinedTrendChart items={chart.items} unitLabel={chart.unitLabel} />;
    }
    if (chart.type === "compare-bar") {
      return (
        <CompareBarChart production={chart.production} shipment={chart.shipment} unitLabel={chart.unitLabel} />
      );
    }
    if (chart.type === "pie-detailed") {
      return <QualityPieChart items={chart.items} />;
    }
    if (chart.type === "recent-list") {
      return <RecentActivityList items={chart.items} />;
    }
    return null;
  };

  return (
    <article
      className={`statistics-chart-card panel statistics-chart-card--${chart.size || "default"} ${className}`.trim()}
    >
      <header className="stat-chart-head">
        <BarChart2 size={16} aria-hidden="true" />
        <h3>{chart.title}</h3>
      </header>
      <div className="statistics-chart-card__body">{renderBody()}</div>
    </article>
  );
}

export default function StatisticsInquiryDashboard({ dashboard, scopeLabel }) {
  if (!dashboard) return null;

  return (
    <section className="statistics-inquiry-dashboard" aria-label="통합 대시보드">
      {scopeLabel ? (
        <p className="statistics-charts-grid__scope">
          분석 기준: <strong>{scopeLabel}</strong>
        </p>
      ) : null}

      <div className="statistics-inquiry-dashboard__row statistics-inquiry-dashboard__row--hero">
        {dashboard.row1?.map((chart) => (
          <DashboardCard key={chart.id} chart={chart} />
        ))}
      </div>

      <div className="statistics-inquiry-dashboard__row statistics-inquiry-dashboard__row--mid">
        {dashboard.row2?.map((chart) => (
          <DashboardCard key={chart.id} chart={chart} />
        ))}
      </div>

      <div className="statistics-inquiry-dashboard__row statistics-inquiry-dashboard__row--bottom">
        {dashboard.row3?.map((chart) => (
          <DashboardCard key={chart.id} chart={chart} />
        ))}
      </div>
    </section>
  );
}
