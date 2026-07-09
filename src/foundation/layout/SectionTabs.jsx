import { Link, useLocation } from "react-router-dom";

export default function SectionTabs({ tabs, className = "" }) {
  const location = useLocation();
  const exactSearchMatch = tabs.some((tab) => {
    const target = splitTarget(tab.path);
    return Boolean(target.search) && location.pathname === target.pathname && location.search === target.search;
  });

  return (
    <nav className={`titan-section-tabs ${className}`.trim()} aria-label="하위 메뉴">
      {tabs.map((tab) => {
        const active = isSectionTabActive(location, tab, exactSearchMatch);
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`titan-section-tabs__link${active ? " active" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function splitTarget(to) {
  const [pathname, search = ""] = String(to ?? "").split("?");
  return { pathname, search: search ? `?${search}` : "" };
}

function isSectionTabActive(location, tab, exactSearchMatch) {
  const target = splitTarget(tab.path);
  if (target.search) return location.pathname === target.pathname && location.search === target.search;
  if (location.pathname === target.pathname) return !exactSearchMatch;
  return location.pathname.startsWith(`${target.pathname}/`);
}

function isWorkspaceNavigationActive(location, item, homePath, exactSearchMatch) {
  const target = splitTarget(item.to);
  if (item.to === homePath) return location.pathname === target.pathname && !exactSearchMatch;
  if (target.search) return location.pathname === target.pathname && location.search === target.search;
  if (location.pathname === target.pathname) return !exactSearchMatch;
  return location.pathname.startsWith(`${target.pathname}/`);
}

export function WorkspaceNavigationTabs({ nav, className = "" }) {
  const location = useLocation();
  const items = nav?.items ?? [];
  if (!items.length) return null;
  const exactSearchMatch = items.some((item) => {
    const target = splitTarget(item.to);
    return Boolean(target.search) && location.pathname === target.pathname && location.search === target.search;
  });

  return (
    <nav className={`titan-workspace-nav company-workspace-nav ${className}`.trim()} aria-label={nav.ariaLabel}>
      {items.map((item) => {
        const active = isWorkspaceNavigationActive(location, item, nav.homePath, exactSearchMatch);
        return (
          <Link
            key={`${item.to}-${item.label}`}
            to={item.to}
            className={`titan-workspace-nav__link company-workspace-nav__link${
              active ? " titan-workspace-nav__link--active company-workspace-nav__link--active" : ""
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
