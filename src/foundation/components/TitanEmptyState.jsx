import { Inbox } from "lucide-react";

export default function TitanEmptyState({
  icon: Icon = Inbox,
  title = "표시할 데이터가 없습니다.",
  description,
  action = null,
  className = "",
}) {
  return (
    <div className={`titan-empty-state ${className}`.trim()} role="status">
      <span className="titan-empty-state__icon" aria-hidden="true">
        <Icon size={24} />
      </span>
      <h3 className="titan-empty-state__title">{title}</h3>
      {description ? <p className="titan-empty-state__desc">{description}</p> : null}
      {action}
    </div>
  );
}
