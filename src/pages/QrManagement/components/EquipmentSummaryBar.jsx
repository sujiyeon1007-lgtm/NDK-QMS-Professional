import { Factory, Clock, PauseCircle, PlayCircle, Wrench } from "lucide-react";

import TitanKpiBarSlot from "../../../foundation/components/TitanKpiBarSlot";
import TitanKpiCard from "../../../foundation/components/TitanKpiCard";
import { QR_CHARGING_PAGE_COPY } from "../../../config/equipmentConfig";

function buildSummaryKpiItems(summary) {
  return [
    {
      id: "total",
      label: "현재 설비",
      value: summary.total,
      countUnit: "대",
      tone: "incoming",
      icon: Factory,
      filterable: false,
    },
    {
      id: "idle",
      label: "대기",
      value: summary.idle,
      countUnit: "대",
      tone: "inspect-wait",
      icon: PauseCircle,
      filterable: false,
    },
    {
      id: "ready",
      label: "장입 준비",
      value: summary.ready,
      countUnit: "대",
      tone: "prod-wait",
      icon: Clock,
      filterable: false,
    },
    {
      id: "running",
      label: "운전중",
      value: summary.running,
      countUnit: "대",
      tone: "production",
      icon: PlayCircle,
      filterable: false,
    },
    {
      id: "maintenance",
      label: "점검",
      value: summary.maintenance,
      countUnit: "대",
      tone: "hold",
      icon: Wrench,
      filterable: false,
    },
  ];
}

export default function EquipmentSummaryBar({ summary }) {
  const items = buildSummaryKpiItems(summary);

  return (
    <TitanKpiBarSlot
      ariaLabel={QR_CHARGING_PAGE_COPY.summaryAriaLabel}
      className="inbound-page__kpi qr-management-page__kpi"
    >
      <div className="titan-status-chip-bar" role="list" aria-label={QR_CHARGING_PAGE_COPY.summaryAriaLabel}>
        {items.map((chip) => (
          <TitanKpiCard key={chip.id} chip={chip} disabled />
        ))}
      </div>
    </TitanKpiBarSlot>
  );
}
