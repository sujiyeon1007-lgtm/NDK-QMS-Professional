import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./KpiCard.css";

function KpiMiniBar({ stats }) {
  const total = stats.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="kpi-mini-bar" aria-hidden="true">
      {stats.map(({ label, value, barTone }) => (
        <span
          key={label}
          className={`kpi-mini-bar-segment ${barTone}`}
          style={{ flex: total > 0 ? value : 1 }}
        />
      ))}
    </div>
  );
}

function KpiCard({ to, tone = "blue", label, headline, stats, icon: Icon }) {
  return (
    <Link to={to} className={`kpi-card ${tone}`} aria-label={`${label} 상세 화면으로 이동`}>
      <div className="kpi-card-header">
        <span className="kpi-card-icon">{Icon && <Icon size={14} />}</span>
        <p className="kpi-card-label">{label}</p>
        <ChevronRight size={14} className="kpi-card-chevron" aria-hidden="true" />
      </div>

      <div className="kpi-card-metrics">
        <strong className="kpi-headline-value">
          {headline.primary}
          {headline.unit && <small>{headline.unit}</small>}
        </strong>
        <span className="kpi-headline-note">{headline.note}</span>
      </div>

      <KpiMiniBar stats={stats} />

      <ul className="kpi-stat-list">
        {stats.map(({ label: statLabel, value, unit, barTone }) => (
          <li key={statLabel} className="kpi-stat-row">
            <span className="kpi-stat-left">
              <span className={`kpi-stat-dot ${barTone}`} aria-hidden="true" />
              <span className="kpi-stat-label">{statLabel}</span>
            </span>
            <strong>
              {value}
              {unit}
            </strong>
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default KpiCard;
