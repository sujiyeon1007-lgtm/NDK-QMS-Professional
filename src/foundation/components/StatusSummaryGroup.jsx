import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusSummaryCard from "./StatusSummaryCard";

export default function StatusSummaryGroup({
  title,
  titleIcon: TitleIcon,
  cards,
  footerLabel,
  footerTo,
}) {
  return (
    <section className="titan-kpi-panel">
      <header className="titan-kpi-panel__head">
        <TitleIcon size={16} strokeWidth={2.2} aria-hidden="true" />
        <h2 className="titan-kpi-panel__title">{title}</h2>
      </header>
      <div className="titan-kpi-panel__grid">
        {cards.map((card) => (
          <StatusSummaryCard key={card.id} {...card} />
        ))}
      </div>
      <div className="titan-kpi-panel__footer">
        <Link to={footerTo} className="titan-kpi-panel__link">
          {footerLabel}
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
