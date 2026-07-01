import StatusSummaryCard from "./StatusSummaryCard";

/**
 * Project TITAN V1.0 — 생산관리 KPI 패널 (HOME 카드 디자인)
 */
export default function ProductionKpiPanel({
  title,
  titleIcon: TitleIcon,
  cards,
  metricMode = false,
}) {
  return (
    <section className="titan-kpi-panel production-kpi-panel">
      {title ? (
        <header className="titan-kpi-panel__head">
          {TitleIcon ? <TitleIcon size={16} strokeWidth={2.2} aria-hidden="true" /> : null}
          <h2 className="titan-kpi-panel__title">{title}</h2>
        </header>
      ) : null}
      <div
        className={`titan-kpi-panel__grid production-kpi-panel__grid${
          cards.length >= 6
            ? " production-kpi-panel__grid--6"
            : cards.length >= 4
              ? " production-kpi-panel__grid--4"
              : ""
        }`}
      >
        {cards.map((card) =>
          metricMode ? (
            <article key={card.id} className="titan-kpi-card production-metric-card">
              <span className="titan-kpi-card__label titan-word-wrap">{card.label}</span>
              <span
                className={`titan-kpi-card__icon titan-kpi-card__icon--${card.tone}`}
                aria-hidden="true"
              >
                {card.icon ? <card.icon size={22} strokeWidth={2} /> : null}
              </span>
              <strong className="titan-kpi-card__count production-metric-card__value">
                {card.value}
                <small>{card.unit}</small>
              </strong>
              <span className="titan-kpi-card__sub titan-word-wrap">{card.subLabel}</span>
            </article>
          ) : (
            <StatusSummaryCard key={card.id} {...card} />
          )
        )}
      </div>
    </section>
  );
}
