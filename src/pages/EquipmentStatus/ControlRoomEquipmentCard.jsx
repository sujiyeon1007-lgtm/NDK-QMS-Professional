import StatusChip from "../../foundation/components/StatusChip";
import { EQUIPMENT_RUN_STATUS_META } from "../../config/equipmentConfig";

/**
 * Control Room — Equipment Card (Blueprint ② 설비 View)
 * 필드: 설비 상태 · 작업자 · 현재 LOT · 현재 제품 · 장입수량 · Recipe · 작업 시작 · 예상 종료 · 동일 LOT · 가동률
 * Running Animation: 운전중 상태 pulse
 * 단일 클릭 → Equipment Popup (장입 Workflow 통합)
 */
export default function ControlRoomEquipmentCard({ equipment, selected, onSelect, onOpen }) {
  const statusMeta = EQUIPMENT_RUN_STATUS_META[equipment.status] ?? EQUIPMENT_RUN_STATUS_META.idle;
  const isRunning = equipment.status === "running";
  const isIdle = equipment.status === "idle" || equipment.status === "ready";
  const utilization = Number(equipment.utilization ?? 0);
  const placeholder = isIdle ? "대기" : "—";

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect?.(equipment.equipmentId);
    onOpen?.(equipment.equipmentId);
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleClick(event);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`control-room-equipment-card${selected ? " is-selected" : ""}${
        isRunning ? " is-running" : ""
      }`}
      data-status={equipment.status}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      title="클릭하면 장입 작업 팝업이 열립니다."
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
          <dd>{equipment.operator ?? placeholder}</dd>
        </div>
        <div>
          <dt>현재 LOT</dt>
          <dd>{equipment.currentLotNo ?? placeholder}</dd>
        </div>
        <div>
          <dt>현재 제품</dt>
          <dd title={equipment.currentProductName ?? placeholder}>
            {equipment.currentProductName ?? placeholder}
          </dd>
        </div>
        <div>
          <dt>장입수량</dt>
          <dd>{equipment.chargeQtyLabel ?? placeholder}</dd>
        </div>
        <div>
          <dt>Recipe</dt>
          <dd title={equipment.recipeName ?? placeholder}>{equipment.recipeName ?? placeholder}</dd>
        </div>
        <div>
          <dt>작업 시작</dt>
          <dd>{equipment.startTime ?? placeholder}</dd>
        </div>
        <div>
          <dt>예상 종료</dt>
          <dd>{equipment.expectedEndTime ?? placeholder}</dd>
        </div>
        <div>
          <dt>동일 LOT</dt>
          <dd>{equipment.sameLotProductCount > 0 ? `${equipment.sameLotProductCount}품목` : placeholder}</dd>
        </div>
      </dl>

      <div className="control-room-equipment-card__util control-room-equipment-card__util--span">
        <div className="control-room-equipment-card__util-head">
          <span>가동률</span>
          <strong>{isRunning ? `${utilization}%` : placeholder}</strong>
        </div>
        <div className="control-room-equipment-card__util-track" aria-hidden="true">
          <div
            className="control-room-equipment-card__util-bar"
            style={{ width: `${isRunning ? utilization : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
