import StatusChip from "../../foundation/components/StatusChip";
import { EQUIPMENT_RUN_STATUS_META } from "../../config/equipmentConfig";

/**
 * Control Room — Equipment Card (Blueprint ② 설비 View)
 * 필드: 설비 상태(Badge) · 작업자 · 현재 LOT · 현재 제품 · 작업 시작 · 예상 종료 · 설비 알람 · 가동률
 * Running Animation: 운전중 상태 pulse
 * 단일 클릭 = 선택(Detail Panel) · 더블클릭 = Equipment Popup
 */
export default function ControlRoomEquipmentCard({ equipment, selected, onSelect, onOpen }) {
  const statusMeta = EQUIPMENT_RUN_STATUS_META[equipment.status] ?? EQUIPMENT_RUN_STATUS_META.idle;
  const isRunning = equipment.status === "running";
  const utilization = Number(equipment.utilization ?? 0);

  return (
    <button
      type="button"
      className={`control-room-equipment-card${selected ? " is-selected" : ""}${
        isRunning ? " is-running" : ""
      }`}
      data-status={equipment.status}
      onClick={() => onSelect(equipment.equipmentId)}
      onDoubleClick={() => onOpen(equipment.equipmentId)}
      aria-pressed={selected}
      title="더블클릭하면 설비 상세가 표시됩니다."
    >
      <div className="control-room-equipment-card__head">
        <span className="control-room-equipment-card__dot" data-status={equipment.status} aria-hidden="true" />
        <strong className="control-room-equipment-card__name">{equipment.equipmentName}</strong>
        <StatusChip variant={statusMeta.variant}>{statusMeta.label}</StatusChip>
        {equipment.alarm ? (
          <span
            className={`control-room-equipment-card__alarm control-room-equipment-card__alarm--${equipment.alarm.level}`}
          >
            {equipment.alarm.label}
          </span>
        ) : null}
      </div>

      <dl className="control-room-equipment-card__meta">
        <div>
          <dt>작업자</dt>
          <dd>{equipment.operator ?? "—"}</dd>
        </div>
        <div>
          <dt>현재 LOT</dt>
          <dd>{equipment.currentLotNo ?? "—"}</dd>
        </div>
        <div>
          <dt>현재 제품</dt>
          <dd title={equipment.currentProductName ?? "—"}>{equipment.currentProductName ?? "—"}</dd>
        </div>
        <div>
          <dt>작업 시작</dt>
          <dd>{equipment.startTime ?? "—"}</dd>
        </div>
        <div>
          <dt>예상 종료</dt>
          <dd>{equipment.expectedEndTime ?? "—"}</dd>
        </div>
        <div>
          <dt>동일 LOT</dt>
          <dd>{equipment.sameLotProductCount > 0 ? `${equipment.sameLotProductCount}품목` : "—"}</dd>
        </div>
      </dl>

      <div className="control-room-equipment-card__util">
        <div className="control-room-equipment-card__util-head">
          <span>가동률</span>
          <strong>{isRunning ? `${utilization}%` : "—"}</strong>
        </div>
        <div className="control-room-equipment-card__util-track" aria-hidden="true">
          <div
            className="control-room-equipment-card__util-bar"
            style={{ width: `${isRunning ? utilization : 0}%` }}
          />
        </div>
      </div>
    </button>
  );
}
