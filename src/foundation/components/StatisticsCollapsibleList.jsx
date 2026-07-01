import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function StatisticsCollapsibleList({ totalCount = 0, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggleLabel = open
    ? "▲ 통계 리스트 접기"
    : `▼ 통계 리스트 보기 (총 ${Number(totalCount).toLocaleString("ko-KR")}건)`;

  return (
    <section className="statistics-list-collapse panel">
      <button
        type="button"
        className="statistics-list-collapse__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>{toggleLabel}</span>
        <ChevronDown size={16} className={`statistics-list-collapse__chevron${open ? " is-open" : ""}`} aria-hidden="true" />
      </button>
      {open ? <div className="statistics-list-collapse__body">{children}</div> : null}
    </section>
  );
}
