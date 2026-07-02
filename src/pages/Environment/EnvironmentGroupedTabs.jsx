import { NavLink } from "react-router-dom";

/**
 * 환경설정 — 그룹형 서브메뉴 (일반 · 시스템 · 관리자)
 */
export default function EnvironmentGroupedTabs({ groups }) {
  if (!groups?.length) return null;

  return (
    <nav className="environment-tab-groups" aria-label="환경설정 메뉴">
      {groups.map((group) => (
        <div key={group.id} className="environment-tab-group">
          <span className="environment-tab-group__label">{group.label}</span>
          <div className="environment-tab-group__links" role="group" aria-label={group.label}>
            {group.tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) =>
                  `environment-tab-group__link${isActive ? " environment-tab-group__link--active" : ""}`
                }
                end
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
