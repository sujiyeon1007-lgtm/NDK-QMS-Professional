import Card from "./Card";
import TitanMetricCard from "./TitanMetricCard";

function spanClass(span) {
  const safeSpan = Math.max(1, Math.min(12, Number(span) || 4));
  return `titan-dashboard-span-${safeSpan}`;
}

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

export function DashboardGrid({ children, className = "", ariaLabel = "Dashboard" }) {
  return (
    <section className={`titan-dashboard-foundation ${className}`.trim()} aria-label={ariaLabel}>
      {children}
    </section>
  );
}

export function DashboardRow({ children, className = "", minHeight = "standard" }) {
  return (
    <div className={`titan-dashboard-row titan-dashboard-row--${minHeight} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function DashboardCard({
  children,
  className = "",
  bodyClassName = "",
  span = 4,
  height = "standard",
  ...props
}) {
  return (
    <TitanDashboardCard
      className={`titan-dashboard-foundation-card titan-dashboard-foundation-card--${height} ${spanClass(span)} ${className}`.trim()}
      bodyClassName={`titan-dashboard-foundation-card__body ${bodyClassName}`.trim()}
      {...props}
    >
      {children}
    </TitanDashboardCard>
  );
}

export function DashboardChart(props) {
  return <DashboardCard height="chart" {...props} />;
}

export function DashboardWidget(props) {
  return <DashboardCard height="widget" {...props} />;
}

export function DashboardKPI({ className = "", span = 2, ...props }) {
  return (
    <TitanMetricCard
      className={`titan-dashboard-kpi ${spanClass(span)} ${className}`.trim()}
      {...props}
    />
  );
}

export function DashboardSummary(props) {
  return <DashboardCard height="summary" span={2} {...props} />;
}

export function DashboardEmptyState({
  title = "이번 기간에는 집계된 데이터가 없습니다.",
  description = "조회 기간을 변경하거나 데이터가 생성되면 차트가 자동으로 표시됩니다.",
}) {
  return (
    <div className="titan-dashboard-empty-state" role="status">
      <strong>{title}</strong>
      {description ? <span>{description}</span> : null}
    </div>
  );
}
