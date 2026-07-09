import { Link } from "react-router-dom";

import { TitanLauncherCategoryBadge } from "../../components/common/badge";
import "../../foundation/styles/titan-hub-page.css";

/**
 * Project TITAN — 공통 Launcher(Hub) 페이지
 * V1.5 FINAL — 기준정보관리 Launcher UX 기준 (titan-hub-page.css)
 * V1.0.1 Home UI Standard — Header → Navigation → KPI(필요 시) → Launcher Cards.
 * 개발용 Workflow/범위/Coming Soon 요약 패널은 Home에서 렌더링하지 않는다.
 */
export default function TitanLauncherHubPage({
  items,
  metrics = {},
  cardsClassName = "",
  header = null,
}) {
  return (
    <div className="titan-hub-page">
      {header}
      <div className={`titan-hub-page__cards ${cardsClassName}`.trim()}>
        {items.map((item) => {
          const Icon = item.icon;
          const metricLines = item.metricKeys?.length
            ? item.metricKeys.map((key) => metrics[key]).filter(Boolean)
            : [];
          const desc = metricLines.length > 0 ? metricLines.join(" · ") : item.description;
          const categoryBadge = item.badge ?? item.categoryBadge ?? "";
          const cardClass = [
            "titan-hub-card",
            item.emphasis ? "titan-hub-card--emphasis" : "",
            categoryBadge ? "titan-hub-card--badged" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Link key={item.id} to={item.path} className={cardClass}>
              {categoryBadge ? (
                <TitanLauncherCategoryBadge
                  text={categoryBadge}
                  color={item.badgeColor ?? item.tone ?? "blue"}
                />
              ) : null}
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
