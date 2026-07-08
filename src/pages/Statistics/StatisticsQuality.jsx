import { useMemo } from "react";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  RefreshCw,
  TrendingUp,
  Layers,
  Bell,
} from "lucide-react";
import { buildQualityStatisticsSnapshot } from "../../utils/statisticsQualityData";
import { LineChart, Gauge, BarRank, Sparkline } from "./StatisticsCharts";
import "./StatisticsDashboard.css";
import "./StatisticsQuality.css";

const KPI_ICON = {
  clipboard: ClipboardList,
  check: CheckCircle2,
  alert: AlertTriangle,
  x: XCircle,
  shield: ShieldAlert,
  refresh: RefreshCw,
};

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

export default function StatisticsQuality() {
  const snapshot = useMemo(() => buildQualityStatisticsSnapshot(), []);
  const paretoMax = Math.max(...snapshot.pareto.map((row) => row.value), 1);
  const heatmapMax = Math.max(...snapshot.processDefects.map((row) => row.value), 1);

  const passRateTrend = snapshot.monthlyTrend.map((row) => ({
    label: row.label,
    value: row.passRate,
  }));

  return (
    <div className="stat-dash stat-qual">
      {/* KPI Cards */}
      <section className="stat-dash-kpis" aria-label="품질 KPI">
        {snapshot.kpiCards.map((card) => {
          const Icon = KPI_ICON[card.icon] ?? ClipboardList;
          return (
            <article key={card.id} className={`stat-dash-kpi${card.tone === "danger" ? " is-danger" : ""}`}>
              <div className="stat-dash-kpi__head">
                <span className="stat-dash-kpi__icon stat-qual-kpi__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="stat-dash-kpi__label">{card.label}</span>
              </div>
              <div className="stat-dash-kpi__value">
                {formatNumber(card.value)}
                <em>{card.unit}</em>
              </div>
              {card.spark?.length ? (
                <div className="stat-dash-kpi__spark stat-qual-kpi__spark">
                  <Sparkline points={card.spark} />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {/* 월별 품질 Trend + 품질목표 Gauge */}
      <section className="stat-qual-row stat-qual-row--main" aria-label="월별 품질 Trend">
        <article className="stat-dash-card stat-qual-trend">
          <header className="stat-dash-card__head">
            <TrendingUp size={16} aria-hidden="true" />
            <h3>월별 품질 Trend</h3>
            <span className="stat-dash-card__hint">합격률 %</span>
          </header>
          <LineChart series={passRateTrend} ariaLabel="월별 품질 Trend" />
          <div className="stat-qual-trend__meta">
            {snapshot.monthlyTrend.map((row) => (
              <span key={row.label}>
                {row.label} · 검사 {row.inspectionCount}건 · 불량 {row.defectRate}%
              </span>
            ))}
          </div>
        </article>

        <article className="stat-dash-card stat-qual-gauge">
          <header className="stat-dash-card__head">
            <CheckCircle2 size={16} aria-hidden="true" />
            <h3>품질목표 달성</h3>
          </header>
          <Gauge value={snapshot.qualityGauge?.value ?? 0} ariaLabel="품질목표 달성률" />
          <p className="stat-dash-gauge__meta">
            합격률 {formatNumber(snapshot.qualityGauge?.actual)}% / 목표{" "}
            {formatNumber(snapshot.qualityGauge?.target)}%
          </p>
          <div className="stat-dash-gauge-summary">
            <div className="stat-dash-gauge-summary__tile is-ok">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.qualityGauge?.actual)}
                <em>%</em>
              </span>
              <span className="stat-dash-gauge-summary__label">합격률</span>
            </div>
            <div className="stat-dash-gauge-summary__tile">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.qualityGauge?.target)}
                <em>%</em>
              </span>
              <span className="stat-dash-gauge-summary__label">목표</span>
            </div>
            <div className="stat-dash-gauge-summary__tile">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.qualityGauge?.value)}
                <em>%</em>
              </span>
              <span className="stat-dash-gauge-summary__label">달성</span>
            </div>
          </div>
        </article>
      </section>

      {/* Pareto + 불량유형 TOP10 */}
      <section className="stat-qual-row stat-qual-row--pareto" aria-label="Pareto · 불량유형 TOP10">
        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>불량 유형 분석</h3>
            <span className="stat-dash-card__hint">Pareto</span>
          </header>
          <div className="stat-dash-pareto">
            {snapshot.pareto.length ? (
              snapshot.pareto.map((row) => (
                <div key={row.label} className="stat-dash-pareto__row">
                  <span className="stat-dash-pareto__label" title={row.label}>
                    {row.label}
                  </span>
                  <span className="stat-dash-pareto__bar stat-qual-pareto__bar" aria-hidden="true">
                    <span style={{ width: `${(row.value / paretoMax) * 100}%` }} />
                  </span>
                  <span className="stat-dash-pareto__value">{row.value}</span>
                  <span className="stat-dash-pareto__cum">{row.cumulativePct}%</span>
                </div>
              ))
            ) : (
              <p className="stat-dash-empty">불량 데이터 없음</p>
            )}
          </div>
        </article>

        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>불량유형 TOP10</h3>
            <span className="stat-dash-card__hint">건</span>
          </header>
          <BarRank rows={snapshot.defectTop10} unit="건" numbered />
        </article>
      </section>

      {/* 공정별 / 설비별 / 검사원 Ranking */}
      <section className="stat-qual-row stat-qual-row--rank" aria-label="공정 · 설비 · 검사원">
        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>공정별 불량</h3>
            <span className="stat-dash-card__hint">Heatmap</span>
          </header>
          <div className="stat-dash-heatmap">
            {snapshot.processDefects.length ? (
              snapshot.processDefects.map((row) => {
                const intensity = row.value / heatmapMax;
                return (
                  <div
                    key={row.label}
                    className="stat-dash-heatmap__cell stat-qual-heatmap__cell"
                    style={{ "--heat": intensity.toFixed(2) }}
                  >
                    <span className="stat-dash-heatmap__label">{row.label}</span>
                    <span className="stat-dash-heatmap__rate">{row.rate}%</span>
                  </div>
                );
              })
            ) : (
              <p className="stat-dash-empty">불량 데이터 없음</p>
            )}
          </div>
        </article>

        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>설비별 불량</h3>
            <span className="stat-dash-card__hint">건</span>
          </header>
          <BarRank rows={snapshot.equipmentDefects} unit="건" numbered={false} />
        </article>

        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>검사원 Ranking</h3>
            <span className="stat-dash-card__hint">건</span>
          </header>
          <BarRank rows={snapshot.inspectorRanking} unit="건" numbered />
        </article>
      </section>

      {/* LOT 품질현황 + 고객별 불량현황 */}
      <section className="stat-qual-row stat-qual-row--lower" aria-label="LOT · 고객별 불량">
        <article className="stat-dash-card stat-qual-lot">
          <header className="stat-dash-card__head">
            <Layers size={16} aria-hidden="true" />
            <h3>LOT 품질현황</h3>
          </header>
          <div className="stat-dash-lot__grid">
            {snapshot.lotQuality.map((row) => (
              <div key={row.id} className={`stat-dash-lot__item is-${row.tone}`}>
                <span className="stat-dash-lot__value">
                  {formatNumber(row.value)}
                  {row.unit ? <em>{row.unit}</em> : null}
                </span>
                <span className="stat-dash-lot__label">{row.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>고객별 불량현황</h3>
            <span className="stat-dash-card__hint">건</span>
          </header>
          <BarRank rows={snapshot.customerDefects} unit="건" numbered />
        </article>
      </section>

      {/* 품질 Alarm Timeline */}
      <section aria-label="품질 Alarm Timeline">
        <article className="stat-dash-card stat-qual-alarm">
          <header className="stat-dash-card__head">
            <Bell size={16} aria-hidden="true" />
            <h3>품질 Alarm Timeline</h3>
          </header>
          <ul className="stat-qual-alarm__list">
            {snapshot.alarmTimeline.map((row) => (
              <li key={row.id} className={`stat-qual-alarm__item is-${row.level}`}>
                <span className="stat-qual-alarm__time">{row.time}</span>
                <span className="stat-qual-alarm__dot" aria-hidden="true" />
                <span className="stat-qual-alarm__label">{row.label}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
