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
        const active = isSectionTabActive(location, tab, exactSearchMatch, tabs);
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

function isSectionTabActive(location, tab, exactSearchMatch, tabs = []) {
  const target = splitTarget(tab.path);
  if (target.search) return location.pathname === target.pathname && location.search === target.search;
  const matches =
    location.pathname === target.pathname ||
    location.pathname.startsWith(`${target.pathname}/`);
  if (!matches) return false;
  const hasMoreSpecificMatch = tabs.some((candidate) => {
    if (candidate.id === tab.id) return false;
    const candidateTarget = splitTarget(candidate.path);
    if (candidateTarget.search) return false;
    const candidateMatches =
      location.pathname === candidateTarget.pathname ||
      location.pathname.startsWith(`${candidateTarget.pathname}/`);
    return candidateMatches && candidateTarget.pathname.length > target.pathname.length;
  });
  return !hasMoreSpecificMatch && (location.pathname !== target.pathname || !exactSearchMatch);
}

function isWorkspaceNavigationActive(location, item, homePath, exactSearchMatch) {
  const target = splitTarget(item.to);
  if (item.to === homePath) return location.pathname === target.pathname && !exactSearchMatch;
  if (target.search) return location.pathname === target.pathname && location.search === target.search;
  if (location.pathname === target.pathname) return !exactSearchMatch;
  return location.pathname.startsWith(`${target.pathname}/`);
}

export function WorkspaceNavigationTabs({ nav, className = "" }) {
  void nav;
  void className;
  return null;
}
