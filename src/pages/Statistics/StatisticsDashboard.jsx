import { useMemo, useState } from "react";
import {
  Layers,
  AlertTriangle,
  TrendingUp,
  Activity,
  Gauge as GaugeIcon,
  CalendarClock,
} from "lucide-react";
import {
  buildStatisticsDashboardSnapshot,
  STATISTICS_MANAGEMENT_TABS,
} from "../../utils/statisticsDashboardData";
import { DashboardEmptyState } from "../../foundation/components/TitanDashboardCard";
import "./StatisticsDashboard.css";

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

function LineChart({ series }) {
  if (!series || !series.length) {
    return <DashboardEmptyState />;
  }
  const values = series.map((item) => Number(item.value) || 0);
  const max = Math.max(...values, 1);
  const width = 640;
  const height = 185; /* Final Polish: trend 높이 축소 (240→185, ~23%) */
  const padX = 36;
  const padY = 22;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const step = series.length > 1 ? innerW / (series.length - 1) : 0;
  const coords = series.map((item, index) => ({
    x: padX + index * step,
    y: padY + innerH - ((Number(item.value) || 0) / max) * innerH,
    label: item.label,
    value: Number(item.value) || 0,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(padY + innerH).toFixed(1)} L${coords[0].x.toFixed(1)},${(padY + innerH).toFixed(1)} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg className="stat-dash-line" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="생산량 추이">
      {gridLines.map((g) => {
        const y = padY + innerH - g * innerH;
        return <line key={g} x1={padX} y1={y} x2={width - padX} y2={y} className="stat-dash-line__grid" />;
      })}
      <path d={areaPath} className="stat-dash-line__area" />
      <path d={linePath} className="stat-dash-line__stroke" fill="none" />
      {coords.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r="3.5" className="stat-dash-line__dot" />
          <text x={c.x} y={height - 6} className="stat-dash-line__x">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Gauge({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 52;
  const circ = Math.PI * radius; // 반원
  const offset = circ - (pct / 100) * circ;
  return (
    <svg className="stat-dash-gauge" viewBox="0 0 140 80" role="img" aria-label={`설비 가동률 ${pct}%`}>
      <path d="M18 74 A52 52 0 0 1 122 74" className="stat-dash-gauge__track" fill="none" />
      <path
        d="M18 74 A52 52 0 0 1 122 74"
        className="stat-dash-gauge__value"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
      <text x="70" y="66" className="stat-dash-gauge__label">
        {pct}%
      </text>
    </svg>
  );
}

export default function StatisticsDashboard() {
  const snapshot = useMemo(() => buildStatisticsDashboardSnapshot(), []);
  const [managementTab, setManagementTab] = useState(STATISTICS_MANAGEMENT_TABS[0].id);

  const activeTabDef =
    STATISTICS_MANAGEMENT_TABS.find((tab) => tab.id === managementTab) ?? STATISTICS_MANAGEMENT_TABS[0];
  const managementRows = snapshot.managementTabs?.[managementTab] ?? [];
  const managementMax = Math.max(...managementRows.map((row) => Number(row.value) || 0), 1);
  const chartSummary = (snapshot.kpiCards ?? []).filter((card) =>
    ["monthProduction", "monthInspection", "monthShipment", "activeLot"].includes(card.id)
  );
  const heatmapMax = Math.max(...(snapshot.processDefectHeatmap ?? []).map((row) => row.value), 1);
  const paretoMax = Math.max(...(snapshot.qualityPareto ?? []).map((row) => row.value), 1);

  return (
    <div className="stat-dash titan-dashboard-layout-v2">
      {/* ① Executive Summary */}
      <section className="stat-dash-summary titan-dashboard-row titan-dashboard-kpi-bar-v2" aria-label="Executive Summary">
        {snapshot.executiveSummary.map((item) => (
          <div key={item.id} className="stat-dash-summary__item titan-dashboard-span-2">
            <span className="stat-dash-summary__label">{item.label}</span>
            <span className="stat-dash-summary__value">
              {formatNumber(item.value)}
              <em>{item.unit}</em>
            </span>
            <span className="stat-dash-summary__bar" aria-hidden="true">
              <span
                className={`stat-dash-summary__bar-fill${item.invert ? " is-invert" : ""}`}
                style={{ width: `${Math.min(100, Number(item.value) || 0)}%` }}
              />
            </span>
          </div>
        ))}
      </section>

      {/* ② Main Analytics — V2 핵심: 생산량 추이 + 금일 운영 현황 */}
      <section className="stat-dash-main titan-dashboard-row titan-dashboard-row--hero" aria-label="Main Analytics">
        <article className="stat-dash-card stat-dash-main__chart titan-dashboard-span-6">
          <header className="stat-dash-card__head">
            <TrendingUp size={16} aria-hidden="true" />
            <h3>생산량 추이</h3>
            <span className="stat-dash-card__hint">최근 6개월</span>
          </header>
          <LineChart series={snapshot.productionTrend} />
          {chartSummary.length ? (
            <div className="stat-dash-chart-summary">
              {chartSummary.map((tile) => (
                <div key={tile.id} className="stat-dash-chart-summary__tile">
                  <span className="stat-dash-chart-summary__label">{tile.label}</span>
                  <span className="stat-dash-chart-summary__value">
                    {formatNumber(tile.value)}
                    <em>{tile.unit}</em>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <article className="stat-dash-card stat-dash-main__today stat-dash-card--compact titan-dashboard-span-3">
          <header className="stat-dash-card__head">
            <Activity size={16} aria-hidden="true" />
            <h3>금일 실적현황</h3>
          </header>
          <div className="stat-dash-progress-list">
            {snapshot.todayPerformance.map((row) => (
              <div key={row.id} className="stat-dash-progress">
                <div className="stat-dash-progress__top">
                  <span>{row.label}</span>
                  <strong>{row.percent}%</strong>
                </div>
                <div className="stat-dash-progress__bar" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, row.percent)}%` }} />
                </div>
                <div className="stat-dash-progress__meta">
                  {formatNumber(row.actual)} / {formatNumber(row.target)} {row.unit}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="stat-dash-card stat-dash-main__alerts stat-dash-card--compact titan-dashboard-span-3">
          <header className="stat-dash-card__head">
            <AlertTriangle size={16} aria-hidden="true" />
            <h3>금일 이상 알림</h3>
          </header>
          <ul className="stat-dash-alerts">
            {snapshot.todayAlerts.map((alert) => (
              <li key={alert.id} className={`stat-dash-alert is-${alert.level}`}>
                <span className="stat-dash-alert__dot" aria-hidden="true" />
                {alert.label}
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* ③ Operations Core — 업체별 생산량 + 생산성 */}
      <section className="stat-dash-operations titan-dashboard-row titan-dashboard-row--operations" aria-label="업체별 생산량 및 생산성">
        <article className="stat-dash-card stat-dash-mgmt stat-dash-mgmt--wide titan-dashboard-span-8">
          <header className="stat-dash-card__head">
            <h3>업체별 생산량</h3>
            <div className="stat-dash-mgmt__tabs" role="tablist" aria-label="업체별 생산량">
              {STATISTICS_MANAGEMENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={managementTab === tab.id}
                  className={`stat-dash-mgmt__tab${managementTab === tab.id ? " is-active" : ""}`}
                  onClick={() => setManagementTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>
          <ol className="stat-dash-rank stat-dash-rank--wide">
            {managementRows.length ? (
              managementRows.map((row, index) => (
                <li key={row.label} className="stat-dash-rank__row">
                  <span className="stat-dash-rank__no">{index + 1}</span>
                  <span className="stat-dash-rank__label" title={row.label}>
                    {row.label}
                  </span>
                  <span className="stat-dash-rank__bar" aria-hidden="true">
                    <span style={{ width: `${(row.value / managementMax) * 100}%` }} />
                  </span>
                  <span className="stat-dash-rank__val">
                    {formatNumber(row.value)}
                    {activeTabDef.unit}
                  </span>
                </li>
              ))
            ) : (
              <DashboardEmptyState />
            )}
          </ol>
        </article>

        <article className="stat-dash-card stat-dash-quality__gauge stat-dash-productivity stat-dash-card--compact titan-dashboard-span-4">
          <header className="stat-dash-card__head">
            <GaugeIcon size={16} aria-hidden="true" />
            <h3>생산성</h3>
          </header>
          <Gauge value={snapshot.equipmentGauge.value} />
          <p className="stat-dash-gauge__meta">
            운전 {snapshot.equipmentGauge.running} / {snapshot.equipmentGauge.total}대
          </p>
          <div className="stat-dash-gauge-summary">
            <div className="stat-dash-gauge-summary__tile is-ok">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.equipmentGauge.running)}
              </span>
              <span className="stat-dash-gauge-summary__label">운전중</span>
            </div>
            <div className="stat-dash-gauge-summary__tile">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.equipmentGauge.total)}
              </span>
              <span className="stat-dash-gauge-summary__label">전체 설비</span>
            </div>
            <div className="stat-dash-gauge-summary__tile">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.equipmentGauge.value)}
                <em>%</em>
              </span>
              <span className="stat-dash-gauge-summary__label">가동률</span>
            </div>
          </div>
          <div className="stat-dash-eqtop">
            <h4>Top 5 설비</h4>
            <ul>
              {snapshot.equipmentTop.slice(0, 5).map((eq) => (
                <li key={eq.id}>
                  <span className="stat-dash-eqtop__name" title={eq.label}>
                    {eq.label}
                  </span>
                  <span className="stat-dash-eqtop__bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, eq.value)}%` }} />
                  </span>
                  <span className="stat-dash-eqtop__val">{eq.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      {/* ④ Analysis Zone — LOT / 공정 / 기타 Summary */}
      <section className="stat-dash-lower titan-dashboard-row titan-dashboard-row--analysis" aria-label="LOT / 공정 / 기타 Summary">
        <article className="stat-dash-card stat-dash-lot titan-dashboard-span-3">
          <header className="stat-dash-card__head">
            <Layers size={16} aria-hidden="true" />
            <h3>LOT 진행현황</h3>
          </header>
          <div className="stat-dash-lot__grid">
            {snapshot.lotCenter.map((row) => (
              <div key={row.id} className={`stat-dash-lot__item is-${row.tone}`}>
                <span className="stat-dash-lot__value">{formatNumber(row.value)}</span>
                <span className="stat-dash-lot__label">{row.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="stat-dash-card titan-dashboard-span-3">
          <header className="stat-dash-card__head">
            <h3>공정별 불량률</h3>
            <span className="stat-dash-card__hint">Heatmap</span>
          </header>
          <div className="stat-dash-heatmap">
            {snapshot.processDefectHeatmap.length ? (
              snapshot.processDefectHeatmap.map((row) => {
                const intensity = row.value / heatmapMax;
                return (
                  <div
                    key={row.label}
                    className="stat-dash-heatmap__cell"
                    style={{ "--heat": intensity.toFixed(2) }}
                  >
                    <span className="stat-dash-heatmap__label">{row.label}</span>
                    <span className="stat-dash-heatmap__rate">{row.rate}%</span>
                  </div>
                );
              })
            ) : (
              <DashboardEmptyState title="이번 기간에는 불량 데이터가 없습니다." />
            )}
          </div>
        </article>

        <article className="stat-dash-card titan-dashboard-span-3">
          <header className="stat-dash-card__head">
            <h3>불량 유형 분석</h3>
            <span className="stat-dash-card__hint">Pareto</span>
          </header>
          <div className="stat-dash-pareto">
            {snapshot.qualityPareto.length ? (
              snapshot.qualityPareto.map((row) => (
                <div key={row.label} className="stat-dash-pareto__row">
                  <span className="stat-dash-pareto__label" title={row.label}>
                    {row.label}
                  </span>
                  <span className="stat-dash-pareto__bar" aria-hidden="true">
                    <span style={{ width: `${(row.value / paretoMax) * 100}%` }} />
                  </span>
                  <span className="stat-dash-pareto__value">{row.value}</span>
                  <span className="stat-dash-pareto__cum">{row.cumulativePct}%</span>
                </div>
              ))
            ) : (
              <DashboardEmptyState title="이번 기간에는 불량 데이터가 없습니다." />
            )}
          </div>
        </article>

        <article className="stat-dash-card stat-dash-schedule titan-dashboard-span-3">
          <header className="stat-dash-card__head">
            <CalendarClock size={16} aria-hidden="true" />
            <h3>금일 일정</h3>
          </header>
          <ul className="stat-dash-timeline">
            {snapshot.schedule.map((row) => (
              <li key={row.id} className={`stat-dash-timeline__item is-${row.status}`}>
                <span className="stat-dash-timeline__time">{row.time}</span>
                <span className="stat-dash-timeline__dot" aria-hidden="true" />
                <span className="stat-dash-timeline__label">{row.label}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* ⑧ Footer Status Bar */}
      <footer className="stat-dash-footer" aria-label="시스템 상태">
        <span>Database · {snapshot.footer.database}</span>
        <span>API · {snapshot.footer.api}</span>
        <span>Last Sync · {snapshot.footer.lastSync}</span>
        <span>Version · {snapshot.footer.version}</span>
        <span>현재 접속자 · {snapshot.footer.activeUser}</span>
      </footer>
    </div>
  );
}
