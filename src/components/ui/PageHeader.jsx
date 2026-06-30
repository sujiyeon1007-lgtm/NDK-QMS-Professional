import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * NDK QMS V2.0 — fixed page chrome (title · description · breadcrumb · toolbar)
 * Same position on every screen.
 */
export default function PageHeader({
  kicker,
  title,
  description,
  breadcrumb,
  actions,
  className = "",
}) {
  return (
    <div className={`page-top-bar ${className}`.trim()}>
      <div className="page-title-block">
        {kicker ? <p className="page-kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="page-description">{description}</p> : null}
        {breadcrumb ? (
          <nav className="breadcrumb" aria-label="breadcrumb">
            {breadcrumb}
          </nav>
        ) : null}
      </div>
      {actions ? <div className="toolbar-actions">{actions}</div> : null}
    </div>
  );
}

export function BreadcrumbItem({ to, children }) {
  if (to) {
    return (
      <>
        <Link to={to}>{children}</Link>
        <ChevronRight size={14} />
      </>
    );
  }
  return <span>{children}</span>;
}
