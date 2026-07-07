import { Link } from "react-router-dom";

export default function StatusSummaryCard({
  label,
  subLabel,
  count,
  icon: Icon,
  to,
  tone = "blue",
  countSuffix = "건",
  iconSize = 24,
}) {
  return (
    <Link to={to} className="titan-kpi-card">
      <span className="titan-kpi-card__label titan-word-wrap">{label}</span>
      <span className={`titan-kpi-card__icon titan-kpi-card__icon--${tone}`} aria-hidden="true">
        <Icon size={iconSize} strokeWidth={2} />
      </span>
      <strong className="titan-kpi-card__count">
        {count}
        {countSuffix ? <small>{countSuffix}</small> : null}
      </strong>
      <span className="titan-kpi-card__sub titan-word-wrap">{subLabel}</span>
    </Link>
  );
}
