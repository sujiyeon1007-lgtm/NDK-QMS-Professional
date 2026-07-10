import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TitanBreadcrumb from "./TitanBreadcrumb";
import { WorkspaceNavigationTabs } from "../layout/SectionTabs";

export default function TitanWorkspaceShell({
  kicker,
  title,
  intro,
  note,
  navItems = [],
  homePath,
  isHome = false,
  breadcrumbItems = [],
  backLink = null,
  hideHeaderWhenNotHome = true,
  ariaLabel = "Workspace",
  children,
  className = "",
}) {
  const showHeader = isHome || !hideHeaderWhenNotHome;
  const normalizedBreadcrumb = (breadcrumbItems ?? []).filter((item) => item?.label);

  return (
    <div
      className={`titan-workspace company-workspace titan-section-page${
        isHome ? " titan-workspace--home company-workspace--home" : ""
      } ${className}`.trim()}
    >
      {showHeader ? (
        <header
          className={`titan-workspace-header company-workspace-header${
            isHome ? " titan-workspace-header--home company-workspace-header--home" : ""
          }`}
          aria-label={`${ariaLabel} Header`}
        >
          <div className="titan-workspace-header__main company-workspace-header__main">
            {kicker ? (
              <span className="titan-workspace-header__kicker company-workspace-header__kicker">{kicker}</span>
            ) : null}
            <h1 className="titan-workspace-header__title company-workspace-header__title">{title}</h1>
            {intro ? (
              <p className="titan-workspace-header__intro company-workspace-header__intro">{intro}</p>
            ) : null}
          </div>
          {note ? (
            <span className="titan-workspace-header__note company-workspace-header__note">{note}</span>
          ) : null}
        </header>
      ) : null}

      {navItems.length ? (
        <WorkspaceNavigationTabs nav={{ items: navItems, homePath, ariaLabel }} />
      ) : null}

      {backLink?.to ? (
        <Link to={backLink.to} className={backLink.className || "titan-hub-back-link"}>
          <ChevronLeft size={16} aria-hidden="true" />
          {backLink.label || "Back"}
        </Link>
      ) : null}

      {normalizedBreadcrumb.length ? <TitanBreadcrumb items={normalizedBreadcrumb} /> : null}

      <div className="titan-workspace__body company-workspace-shell">{children}</div>
    </div>
  );
}
