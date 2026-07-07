import { Factory } from "lucide-react";

import { EQUIPMENT_RUN_STATUS_META } from "../../../config/equipmentConfig";
import "./EquipmentCard.css";

export default function EquipmentCard({ equipment, selected = false, onSelect }) {
  if (!equipment) return null;

  const statusMeta = EQUIPMENT_RUN_STATUS_META[equipment.status] ?? EQUIPMENT_RUN_STATUS_META.idle;

  return (
    <button
      type="button"
      className={`qr-equipment-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect?.(equipment.id)}
      aria-pressed={selected}
    >
      <div className="qr-equipment-card__head">
        <span className="qr-equipment-card__icon" aria-hidden="true">
          <Factory size={16} />
        </span>
        <span className="qr-equipment-card__code">{equipment.code}</span>
      </div>
      <strong className="qr-equipment-card__name">{equipment.name}</strong>
      <span className="qr-equipment-card__process">{equipment.process}</span>
      <span className="qr-equipment-card__status" aria-label={`상태 ${statusMeta.label}`}>
        <span className="qr-equipment-card__status-label">상태</span>
        <span className="qr-equipment-card__status-value">
          {statusMeta.emoji} {statusMeta.label}
        </span>
      </span>
    </button>
  );
}
