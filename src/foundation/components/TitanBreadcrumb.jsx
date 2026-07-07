import { Link } from "react-router-dom";

import "./TitanBreadcrumb.css";

/**
 * @typedef {{ label: string, to?: string }} TitanBreadcrumbItem
 */

/**
 * Project TITAN 공식 Breadcrumb Navigation
 * @param {{ items: TitanBreadcrumbItem[], ariaLabel?: string, className?: string }} props
 */
export default function TitanBreadcrumb({
  items = [],
  ariaLabel = "현재 위치",
  className = "",
}) {
  if (!items.length) return null;

  return (
    <nav
      className={`titan-breadcrumb${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      <ol className="titan-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${index}`;

          return (
            <li key={key} className="titan-breadcrumb__item">
              {!isLast && item.to ? (
                <Link to={item.to} className="titan-breadcrumb__link">
                  {item.label}
                </Link>
              ) : (
                <span className="titan-breadcrumb__current" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span className="titan-breadcrumb__sep" aria-hidden="true">&gt;</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
