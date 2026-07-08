import { useMemo } from "react";
import {
  Truck,
  Layers,
  Clock,
  Hourglass,
  Building2,
  Target,
  TrendingUp,
  BarChart3,
  Bell,
} from "lucide-react";
import { buildSalesStatisticsSnapshot } from "../../utils/statisticsSalesData";
import { LineChart, Gauge, BarRank, Sparkline } from "./StatisticsCharts";
import "./StatisticsDashboard.css";
import "./StatisticsSales.css";

const KPI_ICON = {
  truck: Truck,
  layers: Layers,
  clock: Clock,
  hourglass: Hourglass,
  building: Building2,
  target: Target,
};

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

export default function StatisticsSales() {
  const snapshot = useMemo(() => buildSalesStatisticsSnapshot(), []);
  const itemMax = Math.max(...snapshot.itemShare.map((row) => row.value), 1);
  const trendMax = Math.max(...snapshot.monthlyShipment.map((row) => row.qty), 1);

  return (
    <div className="stat-dash stat-sales">
      {/* ① KPI Cards */}
      <section className="stat-dash-kpis" aria-label="영업 KPI">
        {snapshot.kpiCards.map((card) => {
          const Icon = KPI_ICON[card.icon] ?? Truck;
          return (
            <article key={card.id} className={`stat-dash-kpi${card.tone === "danger" ? " is-danger" : ""}`}>
              <div className="stat-dash-kpi__head">
                <span className="stat-dash-kpi__icon stat-sales-kpi__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="stat-dash-kpi__label">{card.label}</span>
              </div>
              <div className="stat-dash-kpi__value">
                {formatNumber(card.value)}
                <em>{card.unit}</em>
              </div>
              {card.spark?.length ? (
                <div className="stat-dash-kpi__spark stat-sales-kpi__spark">
                  <Sparkline points={card.spark} />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {/* ② 월별 출고 Trend + ⑥ 납기 준수 Gauge */}
      <section className="stat-sales-row stat-sales-row--main" aria-label="월별 출고 Trend · 납기 준수">
        <article className="stat-dash-card stat-sales-trend">
          <header className="stat-dash-card__head">
            <TrendingUp size={16} aria-hidden="true" />
            <h3>월별 출고 Trend</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <LineChart series={snapshot.shipmentTrend} ariaLabel="월별 출고 Trend" />
        </article>

        <article className="stat-dash-card stat-sales-gauge">
          <header className="stat-dash-card__head">
            <Clock size={16} aria-hidden="true" />
            <h3>납기 준수 현황</h3>
          </header>
          <Gauge value={snapshot.onTimeGauge.value} ariaLabel="납기 준수율" />
          <p className="stat-dash-gauge__meta">
            준수 {formatNumber(snapshot.onTimeGauge.onTime)} / {formatNumber(snapshot.onTimeGauge.total)}건
          </p>
          <div className="stat-dash-gauge-summary">
            <div className="stat-dash-gauge-summary__tile is-ok">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.onTimeGauge.onTime)}
              </span>
              <span className="stat-dash-gauge-summary__label">준수</span>
            </div>
            <div className="stat-dash-gauge-summary__tile">
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.onTimeGauge.total)}
              </span>
              <span className="stat-dash-gauge-summary__label">전체</span>
            </div>
            <div
              className={`stat-dash-gauge-summary__tile${snapshot.onTimeGauge.late ? " is-danger" : ""}`}
            >
              <span className="stat-dash-gauge-summary__value">
                {formatNumber(snapshot.onTimeGauge.late)}
              </span>
              <span className="stat-dash-gauge-summary__label">지연</span>
            </div>
          </div>
        </article>
      </section>

      {/* ③ 거래처 TOP10 + ④ 제품 TOP10 */}
      <section className="stat-sales-row stat-sales-row--top" aria-label="거래처 · 제품 TOP10">
        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>거래처 TOP10</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <BarRank rows={snapshot.companyTop10} unit="EA" numbered />
        </article>

        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <h3>제품 TOP10</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <BarRank rows={snapshot.productTop10} unit="EA" numbered />
        </article>
      </section>

      {/* ⑤ 품목별 출고 비율 + ⑦ 출고 LOT 현황 */}
      <section className="stat-sales-row stat-sales-row--mid" aria-label="품목별 출고 비율 · 출고 LOT 현황">
        <article className="stat-dash-card stat-sales-item">
          <header className="stat-dash-card__head">
            <BarChart3 size={16} aria-hidden="true" />
            <h3>품목별 출고 비율</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <div className="stat-sales-item__grid">
            {snapshot.itemShare.length ? (
              snapshot.itemShare.map((row) => (
                <div key={row.label} className="stat-sales-item__col">
                  <div className="stat-sales-item__bar" aria-hidden="true">
                    <span style={{ height: `${(row.value / itemMax) * 100}%` }} />
                  </div>
                  <span className="stat-sales-item__val">{formatNumber(row.value)}</span>
                  <span className="stat-sales-item__label" title={row.label}>
                    {row.label}
                  </span>
                </div>
              ))
            ) : (
              <p className="stat-dash-empty">출고 데이터 없음</p>
            )}
          </div>
        </article>

        <article className="stat-dash-card stat-sales-lot">
          <header className="stat-dash-card__head">
            <Layers size={16} aria-hidden="true" />
            <h3>출고 LOT 현황</h3>
          </header>
          <div className="stat-dash-lot__grid stat-sales-lot__grid">
            {snapshot.lotStatus.map((row) => (
              <div key={row.id} className={`stat-dash-lot__item is-${row.tone}`}>
                <span className="stat-dash-lot__value">{formatNumber(row.value)}</span>
                <span className="stat-dash-lot__label">{row.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ⑧ 거래처 비중 + ⑨ 월별 출고 실적 */}
      <section className="stat-sales-row stat-sales-row--lower" aria-label="거래처 비중 · 월별 출고 실적">
        <article className="stat-dash-card">
          <header className="stat-dash-card__head">
            <Building2 size={16} aria-hidden="true" />
            <h3>거래처 비중</h3>
            <span className="stat-dash-card__hint">EA</span>
          </header>
          <BarRank rows={snapshot.companyShare} unit="EA" numbered={false} />
        </article>

        <article className="stat-dash-card stat-sales-monthly">
          <header className="stat-dash-card__head">
            <BarChart3 size={16} aria-hidden="true" />
            <h3>월별 출고 실적</h3>
            <span className="stat-dash-card__hint">출고량 · LOT</span>
          </header>
          <div className="stat-sales-monthly__grid">
            {snapshot.monthlyShipment.map((row) => (
              <div key={row.label} className="stat-sales-monthly__col">
                <div className="stat-sales-monthly__bar" aria-hidden="true">
                  <span style={{ height: `${(row.qty / trendMax) * 100}%` }} />
                </div>
                <span className="stat-sales-monthly__qty">{formatNumber(row.qty)}</span>
                <span className="stat-sales-monthly__lot">LOT {row.lot}</span>
                <span className="stat-sales-monthly__label">{row.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ⑩ 영업 Alarm Timeline */}
      <section aria-label="영업 Alarm Timeline">
        <article className="stat-dash-card stat-sales-alarm">
          <header className="stat-dash-card__head">
            <Bell size={16} aria-hidden="true" />
            <h3>영업 Alarm Timeline</h3>
          </header>
          <ul className="stat-sales-alarm__list">
            {snapshot.alarmTimeline.map((row) => (
              <li key={row.id} className={`stat-sales-alarm__item is-${row.level}`}>
                <span className="stat-sales-alarm__time">{row.time}</span>
                <span className="stat-sales-alarm__dot" aria-hidden="true" />
                <span className="stat-sales-alarm__label">{row.label}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
