import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanKpiCard from "../../foundation/components/TitanKpiCard";

/**
 * Control Room KPI 7 Bar (Sprint 3A)
 * Blueprint ② 설비 가동 현황 상단 KPI — Dashboard Filter
 */
export default function ControlRoomKpiBar({ cards, activeKpiId = null, onKpiClick }) {
  const clickable = typeof onKpiClick === "function";

  return (
    <TitanKpiBarSlot ariaLabel="Control Room 실시간 KPI" className="inbound-page__kpi control-room__kpi">
      <div className="titan-status-chip-bar" role="list" aria-label="Control Room 실시간 KPI">
        {cards.map((chip) => (
          <TitanKpiCard
            key={chip.id}
            chip={chip}
            active={activeKpiId === chip.id}
            disabled={!clickable}
            onClick={() => onKpiClick?.(chip)}
          />
        ))}
      </div>
    </TitanKpiBarSlot>
  );
}
