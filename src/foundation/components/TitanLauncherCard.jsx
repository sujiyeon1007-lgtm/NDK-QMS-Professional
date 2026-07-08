import { Link } from "react-router-dom";

import TitanStatusBadge from "./TitanStatusBadge";

export default function TitanLauncherCard({
  to,
  icon: Icon,
  label,
  title = label,
  description,
  badge,
  badgeColor = "blue",
  tone = "blue",
  placeholder = false,
  placeholderText = "Placeholder",
  className = "",
  ...props
}) {
  return (
    <Link
      to={to}
      className={`titan-launcher-card titan-launcher-card--${tone} company-launcher-card company-launcher-card--${tone}${
        placeholder ? " titan-launcher-card--placeholder company-launcher-card--placeholder" : ""
      } ${className}`.trim()}
      {...props}
    >
      <span className={`titan-launcher-card__icon titan-launcher-card__icon--${tone} company-launcher-card__icon company-launcher-card__icon--${tone}`}>
        {Icon ? <Icon size={32} strokeWidth={2} aria-hidden="true" /> : null}
      </span>
      {badge ? <TitanStatusBadge color={badgeColor} className="titan-launcher-card__badge" text={badge} /> : null}
      {placeholder ? (
        <span className="titan-launcher-card__placeholder company-launcher-card__placeholder">
          {placeholderText}
        </span>
      ) : null}
      <strong className="titan-launcher-card__title company-launcher-card__title">{title}</strong>
      {description ? (
        <span className="titan-launcher-card__desc company-launcher-card__desc">{description}</span>
      ) : null}
    </Link>
  );
}
