import TitanNoticeCard from "../TitanNoticeCard/TitanNoticeCard";
import TitanRefCard from "../TitanRefCard/TitanRefCard";

export default function TitanSideStack({ children, refCards = [], notices }) {
  const hasPinned = refCards.length > 0 || notices !== false;

  return (
    <div className="titan-side-stack">
      <div className="titan-side-stack__main">{children}</div>
      {hasPinned ? (
        <div className="titan-side-stack__pinned" aria-label="운영 현황">
          {refCards.map(({ key, label, value, unit, note, active, onClick }) => (
            <TitanRefCard
              key={key}
              label={label}
              value={value}
              unit={unit}
              note={note}
              active={active}
              onClick={onClick}
            />
          ))}
          {notices !== false ? <TitanNoticeCard notices={notices} /> : null}
        </div>
      ) : null}
    </div>
  );
}
