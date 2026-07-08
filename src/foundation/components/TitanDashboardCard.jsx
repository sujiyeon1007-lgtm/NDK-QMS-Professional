import Card from "./Card";

export default function TitanDashboardCard({
  title,
  icon: Icon,
  headerAction = null,
  children,
  className = "",
  bodyClassName = "",
  ...props
}) {
  return (
    <Card className={`titan-dashboard-card company-dashboard-panel ${className}`.trim()} {...props}>
      {title ? (
        <header className="titan-dashboard-card__head company-dashboard-panel__head">
          <h3>
            {Icon ? <Icon size={18} aria-hidden="true" /> : null}
            {title}
          </h3>
          {headerAction}
        </header>
      ) : null}
      <div className={`titan-dashboard-card__body ${bodyClassName}`.trim()}>{children}</div>
    </Card>
  );
}
