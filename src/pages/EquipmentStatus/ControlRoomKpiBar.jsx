import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanKpiCard from "../../foundation/components/TitanKpiCard";

/**
 * Control Room KPI 7 Bar (Sprint 3A)
 * Blueprint ② 설비현황 상단 KPI — Engine 런타임 값 (읽기 전용)
 */
export default function ControlRoomKpiBar({ cards }) {
  return (
    <TitanKpiBarSlot ariaLabel="Control Room 실시간 KPI" className="inbound-page__kpi control-room__kpi">
      <div className="titan-status-chip-bar" role="list" aria-label="Control Room 실시간 KPI">
        {cards.map((chip) => (
          <TitanKpiCard key={chip.id} chip={chip} disabled />
        ))}
      </div>
    </TitanKpiBarSlot>
  );
}
