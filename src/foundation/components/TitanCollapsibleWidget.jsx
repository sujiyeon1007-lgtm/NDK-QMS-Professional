import Card from "./Card";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";

/**
 * Collapsible dashboard widget — header always visible, body toggles.
 * Use storageKey (or widgetId) for sessionStorage persistence.
 */
export default function TitanCollapsibleWidget({
  widgetId,
  storageKey,
  title,
  children,
  className = "",
  headerActions = null,
  defaultOpen = true,
  as: Wrapper = Card,
}) {
  const resolvedKey = storageKey ?? `titan-home-widget-collapse:${widgetId}`;
  const [open, toggle] = usePersistedCollapse(resolvedKey, defaultOpen);

  return (
    <Wrapper
      className={`titan-collapsible-widget${open ? " is-expanded" : " is-collapsed"}${className ? ` ${className}` : ""}`.trim()}
    >
      <div className="home-panel__head titan-collapsible-widget__head">
        <h3>{title}</h3>
        <div className="home-panel__head-actions titan-collapsible-widget__actions">
          {headerActions}
          <button
            type="button"
            className="titan-collapsible-widget__toggle"
            onClick={toggle}
            aria-expanded={open}
            aria-label={open ? "위젯 접기" : "위젯 펼치기"}
          >
            {open ? "▲" : "▼"}
          </button>
        </div>
      </div>
      <div className="titan-collapsible-widget__body" aria-hidden={!open}>
        <div className="titan-collapsible-widget__body-inner">{children}</div>
      </div>
    </Wrapper>
  );
}
