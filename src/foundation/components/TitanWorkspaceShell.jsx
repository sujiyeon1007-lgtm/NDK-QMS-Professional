import { NavLink } from "react-router-dom";

export default function TitanWorkspaceShell({
  kicker,
  title,
  intro,
  note,
  navItems = [],
  homePath,
  isHome = false,
  ariaLabel = "Workspace",
  children,
  className = "",
}) {
  return (
    <div
      className={`titan-workspace company-workspace titan-section-page${
        isHome ? " titan-workspace--home company-workspace--home" : ""
      } ${className}`.trim()}
    >
      <header
        className={`titan-workspace-header company-workspace-header${
          isHome ? " titan-workspace-header--home company-workspace-header--home" : ""
        }`}
        aria-label={`${ariaLabel} Header`}
      >
        <div className="titan-workspace-header__main company-workspace-header__main">
          {kicker ? <span className="titan-workspace-header__kicker company-workspace-header__kicker">{kicker}</span> : null}
          <h1 className="titan-workspace-header__title company-workspace-header__title">{title}</h1>
          {!isHome && intro ? (
            <p className="titan-workspace-header__intro company-workspace-header__intro">{intro}</p>
          ) : null}
        </div>
        {!isHome && note ? (
          <span className="titan-workspace-header__note company-workspace-header__note">{note}</span>
        ) : null}
      </header>

      {navItems.length ? (
        <nav className="titan-workspace-nav company-workspace-nav" aria-label={ariaLabel}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === homePath}
              className={({ isActive }) =>
                `titan-workspace-nav__link company-workspace-nav__link${
                  isActive ? " titan-workspace-nav__link--active company-workspace-nav__link--active" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}

      <div className="titan-workspace__body company-workspace-shell">{children}</div>
    </div>
  );
}
