export default function TitanMetricCard({
  title,
  value,
  trend,
  description,
  icon: Icon,
  tone = "blue",
  className = "",
}) {
  return (
    <article className={`titan-metric-card titan-metric-card--${tone} ${className}`.trim()}>
      <div className="titan-metric-card__head">
        <span className="titan-metric-card__title">{title}</span>
        {Icon ? (
          <span className="titan-metric-card__icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <strong className="titan-metric-card__value">{value}</strong>
      {trend || description ? (
        <div className="titan-metric-card__meta">
          {trend ? <span className="titan-metric-card__trend">{trend}</span> : null}
          {description ? <span className="titan-metric-card__desc">{description}</span> : null}
        </div>
      ) : null}
    </article>
  );
}
