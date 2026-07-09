import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";

import Card from "../../foundation/components/Card";
import { TitanStatusBadge } from "../../components/common/badge";
import { HOME_WORK_DASHBOARD_GROUPS } from "../../config/homeWorkLauncher";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";
import { buildHomeWorkLauncherMetrics } from "../../utils/homeWorkLauncherData";
import "./HomeWorkLauncherPanel.css";

function isLauncherItemVisible(item, isModuleEnabled) {
  if (!item.moduleId) return true;
  return isModuleEnabled(item.moduleId);
}

export default function HomeWorkLauncherPanel({ records }) {
  const { isModuleEnabled } = useTitanModuleFlags();
  const metricsByCard = useMemo(() => buildHomeWorkLauncherMetrics(records), [records]);

  const items = useMemo(
    () => HOME_WORK_DASHBOARD_GROUPS.filter((item) => isLauncherItemVisible(item, isModuleEnabled)),
    [isModuleEnabled]
  );

  if (items.length === 0) return null;

  return (
    <Card className="home-panel home-panel--work-launcher titan-card">
      <div className="home-panel__head home-panel__head--launcher">
        <h3>
          <Megaphone size={16} aria-hidden="true" />
          업무 바로가기
        </h3>
        <p className="home-work-launcher__subtitle">업무 영역별 금일 운영 현황</p>
      </div>

      <div className="home-work-launcher__grid" aria-label="업무 영역별 Dashboard">
        {items.map((item) => {
          const Icon = item.icon;
          const cardMetrics = metricsByCard[item.id] ?? {};

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`home-work-launcher-card home-work-launcher-card--${item.tone}`}
            >
              <div className="home-work-launcher-card__head">
                <span className={`home-work-launcher-card__icon home-work-launcher-card__icon--${item.tone}`}>
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="home-work-launcher-card__title-block">
                  <TitanStatusBadge text={item.badge} color={item.tone} />
                  <strong className="home-work-launcher-card__title">{item.label}</strong>
                </div>
              </div>

              <ul
                className={`home-work-launcher-card__metrics${
                  item.denseMetrics ? " home-work-launcher-card__metrics--dense" : ""
                }`}
              >
                {item.metrics.map((metric) => (
                  <li key={metric.key}>
                    <span>{metric.label}</span>
                    <strong>
                      {(cardMetrics[metric.key] ?? 0).toLocaleString("ko-KR")}
                      {metric.suffix}
                    </strong>
                  </li>
                ))}
              </ul>
              <span className="home-work-launcher-card__cta" aria-hidden="true">
                {item.ctaLabel ?? "바로 실행"}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
