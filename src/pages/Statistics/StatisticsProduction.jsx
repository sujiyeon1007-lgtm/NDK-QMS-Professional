import { useMemo } from "react";
import {
  Factory,
  Layers,
  Activity,
  Target,
  Gauge as GaugeIcon,
  TrendingUp,
} from "lucide-react";
import { buildProductionStatisticsSnapshot } from "../../utils/statisticsProductionData";
import { LineChart, Gauge, BarRank, Sparkline } from "./StatisticsCharts";
import "./StatisticsDashboard.css";
import "./StatisticsProduction.css";

const KPI_ICON = {
  factory: Factory,
  layers: Layers,
  activity: Activity,
  target: Target,
  gauge: GaugeIcon,
  trending: TrendingUp,
};

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

export default function StatisticsProduction() {
  const snapshot = useMemo(() => buildProductionStatisticsSnapshot(), []);
  const trendMax = Math.max(...snapshot.monthlyTrend.map((row) => row.qty), 1);

  return (
    <div className="stat-dash stat-prod">
      {/* KPI Cards */}
      <section className="stat-dash-kpis" aria-label="생산 KPI">
        {snapshot.kpiCards.map((card) => {
          const Icon = KPI_ICON[card.icon] ?? Activity;
          return (
            <article key={card.id} className="stat-dash-kpi">
              <div className="stat-dash-kpi__head">
                <span className="stat-dash-kpi__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="stat-dash-kpi__label">{card.label}</span>
              </div>
              <div className="stat-dash-kpi__value">
                {formatNumber(card.value)}
                <em>{card.unit}</em>
              </div>
              {card.spark?.length ? (
                <div className="stat-dash-kpi__spark">
                  <Sparkline points={card.spark} />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {/* 생산량 추이 + 생산 목표 달성률 */}
      <section className="stat-prod-row stat-prod-row--main" aria-label="생산량 추이 · 목표 달성률">
        <article className="stat-dash-card stat-prod-trend">
          <header className="stat-dash-card__head">
            <TrendingUp size={16} aria-hidden="true" />
            <h3>생산량 추이</h3>
          </header>
          <LineChart series={snapshot.productionTrend} ariaLabel="생산량 추이" />
        </article>

        <article className="stat-dash-card stat-prod-goal">
          <header className="stat-dash-card__head">
            <Target size={16} aria-hidden="true" />
            <h3>생산 목표 달성률</h3>
          </header>
          <Gauge value={snapshot.goalAchievement.value} ariaLabel="생산 목표 달성률" />
          <p className="stat-dash-gauge__meta">
            {formatNumber(snapshot.goalAchievement.actual)} / {formatNumber(snapshot.goalAchievement.target)} EA
          </p>
        </article>
      </section>

      {/* 공정별 / 설비별 / 작업자 Ranking */}
      <section className="stat-prod-row stat-prod-row--rank" aria-label="공정 · 설비 · 작업자">
        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>공정별 생산량</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <BarRank rows={snapshot.processProduction} unit="EA" numbered={false} />
        </article>

        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>설비별 생산량</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <BarRank rows={snapshot.equipmentProduction} unit="EA" numbered={false} />
        </article>

        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>작업자 Ranking</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <BarRank rows={snapshot.workerRanking} unit="EA" numbered />
        </article>
      </section>

      {/* 생산 LOT 현황 + 월별 Trend */}
      <section className="stat-prod-row stat-prod-row--lower" aria-label="LOT 현황 · 월별 Trend">
        <article className="stat-dash-card stat-prod-lot">
          <header className="stat-dash-card__head">
            <Layers size={16} aria-hidden="true" />
            <h3>생산 LOT 현황</h3>
          </header>
          <div className="stat-dash-lot__grid">
            {snapshot.lotStatus.map((row) => (
              <div key={row.id} className={`stat-dash-lot__item is-${row.tone}`}>
                <span className="stat-dash-lot__value">{formatNumber(row.value)}</span>
                <span className="stat-dash-lot__label">{row.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="stat-dash-card stat-prod-monthly">
          <header className="stat-dash-card__head">
            <Activity size={16} aria-hidden="true" />
            <h3>월별 Trend</h3>
            <span className="stat-dash-card__hint">생산량 · LOT</span>
          </header>
          <div className="stat-prod-monthly__grid">
            {snapshot.monthlyTrend.map((row) => (
              <div key={row.label} className="stat-prod-monthly__col">
                <div className="stat-prod-monthly__bar" aria-hidden="true">
                  <span style={{ height: `${(row.qty / trendMax) * 100}%` }} />
                </div>
                <span className="stat-prod-monthly__qty">{formatNumber(row.qty)}</span>
                <span className="stat-prod-monthly__lot">LOT {row.lot}</span>
                <span className="stat-prod-monthly__label">{row.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
