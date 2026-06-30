export function SummaryCardGrid({ children, className = "" }) {
  return <div className={`ndk-summary-grid ${className}`.trim()}>{children}</div>;
}

export default function SummaryCard({
  label,
  value,
  unit,
  note,
  tone = "blue",
  icon: Icon,
  className = "",
}) {
  return (
    <article className={`ndk-summary-card ndk-summary-card--${tone} ${className}`.trim()}>
      {Icon ? (
        <span className="ndk-summary-card__icon" aria-hidden="true">
          <Icon size={22} />
        </span>
      ) : null}
      <div className="ndk-summary-card__body">
        <span className="ndk-summary-card__label">{label}</span>
        <strong className="ndk-summary-card__value">
          {typeof value === "number" ? value.toLocaleString() : value}
          {unit ? <small>{unit}</small> : null}
        </strong>
        {note ? <span className="ndk-summary-card__note">{note}</span> : null}
      </div>
    </article>
  );
}
