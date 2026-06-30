import { ChevronDown } from "lucide-react";
import { useTitanWorkspacePanel } from "../../../hooks/useTitanWorkspacePanel";
import "./TitanCollapsiblePanel.css";

/**
 * Project TITAN — Independent collapsible panel (workspace persistence per panelId).
 * Collapsed: title header only; body fully hidden. Other panels on the page are unaffected.
 *
 * @param {'detail'|'schedule'|undefined} layoutRole - Enables parent layout expansion via CSS :has()
 */
function TitanCollapsiblePanel({
  screenId,
  panelId,
  title,
  subtitle,
  defaultExpanded = true,
  layoutRole,
  className = "",
  headerExtra,
  children,
  toggleAriaLabel,
}) {
  const { expanded, toggle } = useTitanWorkspacePanel(screenId, panelId, defaultExpanded);

  const rootClass = [
    "titan-collapsible-panel",
    layoutRole ? `titan-collapsible-panel--${layoutRole}` : "",
    !expanded ? "is-collapsed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label = toggleAriaLabel ?? (expanded ? `${title} 접기` : `${title} 펼치기`);

  return (
    <div className={rootClass}>
      <div className="titan-collapsible-panel__header">
        <button
          type="button"
          className="titan-collapsible-panel__title-btn"
          onClick={toggle}
          aria-expanded={expanded}
          aria-label={label}
        >
          <ChevronDown size={16} className="titan-collapsible-panel__chevron" aria-hidden="true" />
          <span className="titan-collapsible-panel__title">{title}</span>
        </button>
        {headerExtra}
      </div>

      {subtitle && expanded ? (
        <p className="titan-collapsible-panel__subtitle">{subtitle}</p>
      ) : null}

      <div className="titan-collapsible-panel__body" aria-hidden={!expanded}>
        <div className="titan-collapsible-panel__body-inner">{children}</div>
      </div>
    </div>
  );
}

export default TitanCollapsiblePanel;
