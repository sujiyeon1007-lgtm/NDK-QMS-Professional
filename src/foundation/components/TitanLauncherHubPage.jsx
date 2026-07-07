import { Link } from "react-router-dom";

import "../../foundation/styles/titan-hub-page.css";

/**
 * Project TITAN — 공통 Launcher(Hub) 페이지
 * 기준정보관리 Launcher UX 기준 (titan-hub-page.css)
 */
export default function TitanLauncherHubPage({ intro, items, metrics = {}, cardsClassName = "" }) {
  return (
    <div className="titan-hub-page">
      {intro ? <p className="titan-hub-page__intro">{intro}</p> : null}

      <div className={`titan-hub-page__cards ${cardsClassName}`.trim()}>
        {items.map((item) => {
          const Icon = item.icon;
          const metricLines = item.metricKeys?.length
            ? item.metricKeys.map((key) => metrics[key]).filter(Boolean)
            : [];
          const desc = metricLines.length > 0 ? metricLines.join(" · ") : item.description;

          return (
            <Link key={item.id} to={item.path} className="titan-hub-card">
              <Icon size={22} aria-hidden="true" />
              <span className="titan-hub-card__label">{item.label}</span>
              {desc ? <span className="titan-hub-card__desc">{desc}</span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
