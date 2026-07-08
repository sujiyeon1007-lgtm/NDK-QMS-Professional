import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Package,
  Layers,
  Cog,
  Wrench,
  HardHat,
  Activity,
  ShieldAlert,
  AlertTriangle,
  ClipboardList,
  History,
  ChevronRight,
} from "lucide-react";

import { buildMasterDataDashboardSnapshot } from "../../utils/masterDataDashboard";

import "../Statistics/StatisticsDashboard.css";
import "./MasterDashboard.css";

const SUMMARY_ICON = {
  companies: Building2,
  products: Package,
  materials: Layers,
  processes: Cog,
  equipment: Wrench,
  workers: HardHat,
};

const HEALTH_STATUS_LABEL = {
  ok: "정상",
  warn: "확인 필요",
  error: "조치 필요",
};

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

export default function MasterDashboard() {
  const snapshot = useMemo(() => buildMasterDataDashboardSnapshot(), []);
  const navigate = useNavigate();

  const goto = (route) => {
    if (route) navigate(route);
  };

  return (
    <div className="stat-dash master-dash">
      {/* ① Master Summary — 클릭 시 관리 화면 이동 */}
      <section className="stat-dash-kpis master-dash-summary" aria-label="Master Summary">
        {snapshot.summary.map((card) => {
          const Icon = SUMMARY_ICON[card.icon] ?? Activity;
          return (
            <button
              key={card.id}
              type="button"
              className={`stat-dash-kpi master-dash-summary__item is-${card.icon}`}
              onClick={() => goto(card.route)}
              aria-label={`${card.label} ${formatNumber(card.count)}개 · 관리 화면으로 이동`}
            >
              <div className="stat-dash-kpi__head">
                <span className="stat-dash-kpi__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="stat-dash-kpi__label">{card.label}</span>
              </div>
              <div className="stat-dash-kpi__value">
                {formatNumber(card.count)}
                <em>개</em>
              </div>
              <span className="master-dash-summary__go">
                관리 화면 <ChevronRight size={13} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </section>

      {/* ② Master Health + ③ Missing Information */}
      <section className="master-dash-grid2" aria-label="Master Health / Missing Information">
        <article className="stat-dash-card master-dash-health">
          <header className="stat-dash-card__head">
            <Activity size={16} aria-hidden="true" />
            <h3>기준정보 상태</h3>
            <span className="stat-dash-card__hint">Master Health</span>
          </header>
          <ul className="master-dash-health__list">
            {snapshot.health.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="master-dash-health__row"
                  onClick={() => goto(row.route)}
                >
                  <span className={`master-dash-health__dot is-${row.status}`} aria-hidden="true" />
                  <span className="master-dash-health__label">{row.label}</span>
                  <span className="master-dash-health__count">{formatNumber(row.count)}개</span>
                  <span className={`master-dash-health__msg is-${row.status}`}>
                    {row.message}
                  </span>
                  <span className={`master-dash-health__badge is-${row.status}`}>
                    {HEALTH_STATUS_LABEL[row.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="stat-dash-card master-dash-missing">
          <header className="stat-dash-card__head">
            <ShieldAlert size={16} aria-hidden="true" />
            <h3>확인이 필요한 정보</h3>
            <span
              className={`stat-dash-card__hint${snapshot.missingTotal ? " is-alert" : ""}`}
            >
              {snapshot.missingTotal ? `총 ${formatNumber(snapshot.missingTotal)}건` : "정상"}
            </span>
          </header>
          {snapshot.missingTotal ? (
            <ul className="master-dash-missing__list">
              {snapshot.missing
                .filter((item) => item.count > 0)
                .map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`master-dash-missing__row is-${item.tone}`}
                      onClick={() => goto(`${item.route}?filter=${item.filter}`)}
                    >
                      <span className="master-dash-missing__icon" aria-hidden="true">
                        <AlertTriangle size={15} />
                      </span>
                      <span className="master-dash-missing__label">{item.label}</span>
                      <span className="master-dash-missing__count">
                        {formatNumber(item.count)}
                        <em>{item.unit}</em>
                      </span>
                      <span className="master-dash-missing__go" aria-hidden="true">
                        <ChevronRight size={15} />
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="stat-dash-empty">모든 기준정보가 정상입니다.</p>
          )}
        </article>
      </section>

      {/* ④ Recent Registration + ⑤ Recent Update */}
      <section className="master-dash-grid2" aria-label="Recent Registration / Update">
        <article className="stat-dash-card master-dash-recent">
          <header className="stat-dash-card__head">
            <ClipboardList size={16} aria-hidden="true" />
            <h3>최근 등록</h3>
          </header>
          {snapshot.recentRegistrations.length ? (
            <ul className="master-dash-recent__list">
              {snapshot.recentRegistrations.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className="master-dash-recent__row"
                    onClick={() => goto(row.route)}
                  >
                    <span className={`master-dash-badge is-${row.badgeColor}`}>
                      {row.categoryLabel}
                    </span>
                    <span className="master-dash-recent__name" title={row.name}>
                      {row.name}
                    </span>
                    {row.code ? (
                      <span className="master-dash-recent__code">{row.code}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="stat-dash-empty">등록된 기준정보가 없습니다.</p>
          )}
        </article>

        <article className="stat-dash-card master-dash-recent">
          <header className="stat-dash-card__head">
            <History size={16} aria-hidden="true" />
            <h3>최근 수정 이력</h3>
          </header>
          {snapshot.recentUpdates.length ? (
            <ul className="master-dash-update__list">
              {snapshot.recentUpdates.map((row) => (
                <li key={row.id} className="master-dash-update__row">
                  <span className="master-dash-update__time">{row.time}</span>
                  <span className="master-dash-update__dot" aria-hidden="true" />
                  <span className="master-dash-update__body">
                    <span className="master-dash-update__label">{row.label}</span>
                    <span className="master-dash-update__user">{row.user}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="stat-dash-empty">수정 이력이 기록되면 표시됩니다.</p>
          )}
        </article>
      </section>

      {/* ⑥ Footer Status */}
      <footer className="stat-dash-footer" aria-label="시스템 상태">
        <span>Database · {snapshot.footer.database}</span>
        <span>Version · {snapshot.footer.version}</span>
        <span>Last Sync · {snapshot.footer.lastSync}</span>
        <span>User · {snapshot.footer.user}</span>
      </footer>
    </div>
  );
}
