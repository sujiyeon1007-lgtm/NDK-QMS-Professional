import Panel from "./Panel";
import SectionTitle from "./SectionTitle";

export default function TableCard({
  title,
  subtitle,
  headerActions,
  toolbar,
  children,
  footer,
  className = "",
}) {
  return (
    <Panel className={`ndk-table-card titan-list-panel ${className}`.trim()}>
      {title || subtitle || headerActions ? (
        <SectionTitle title={title} subtitle={subtitle} actions={headerActions} />
      ) : null}
      {toolbar}
      {children}
      {footer ? <div className="ndk-table-card__footer">{footer}</div> : null}
    </Panel>
  );
}
