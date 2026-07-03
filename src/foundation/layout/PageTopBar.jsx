import { RefreshCw } from "lucide-react";
import "./PageTopBar.css";

function formatTodayLabel(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${y}-${m}-${d} ${weekdays[date.getDay()]}`;
}

export default function PageTopBar({ title, kicker, description, onRefresh }) {
  return (
    <header className="titan-page-top-bar">
      <div className="titan-page-top-bar__main">
        <h1 className="titan-page-top-bar__title">{title}</h1>
        {kicker ? <p className="titan-page-top-bar__kicker">{kicker}</p> : null}
        {description ? <p className="titan-page-top-bar__desc">{description}</p> : null}
      </div>
      <div className="titan-page-top-bar__actions">
        <span className="titan-page-top-bar__date">{formatTodayLabel()}</span>
        {onRefresh ? (
          <button type="button" className="titan-page-top-bar__refresh" onClick={onRefresh}>
            <RefreshCw size={14} aria-hidden="true" />
            새로고침
          </button>
        ) : null}
      </div>
    </header>
  );
}
