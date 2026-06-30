import { ChevronRight } from "lucide-react";

export default function TitanRefCard({ label, value, unit, note, active = false, onClick }) {
  return (
    <button
      type="button"
      className={`titan-ref-card${active ? " active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="titan-ref-card__label">{label}</span>
      <strong className="titan-ref-card__value">
        {value.toLocaleString()}
        {unit ? <small> {unit}</small> : null}
      </strong>
      {note ? (
        <span className="titan-ref-card__link">
          {note}
          <ChevronRight size={12} />
        </span>
      ) : null}
    </button>
  );
}
