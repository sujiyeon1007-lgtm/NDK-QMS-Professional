import { Link } from "react-router-dom";
import TitanDetailPopup from "../../foundation/components/TitanDetailPopup";
import StatusChip from "../../foundation/components/StatusChip";
import { EQUIPMENT_RUN_STATUS_META } from "../../config/equipmentConfig";
import HomeAnimatedProgressBar from "../Home/HomeAnimatedProgressBar";

/**
 * Control Room — Equipment Popup (Blueprint ② 설비 View · 읽기 전용 관제)
 * Data: useControlRoom → getEquipmentDetail (WorkspaceData)
 */
export default function ControlRoomEquipmentPopup({ detail, open, onClose }) {
  const statusMeta = detail
    ? EQUIPMENT_RUN_STATUS_META[detail.status] ?? EQUIPMENT_RUN_STATUS_META.idle
    : null;
  const isRunning = detail?.status === "running";

  return (
    <TitanDetailPopup
      open={open}
      onClose={onClose}
      title={detail ? `설비 상세 — ${detail.equipmentName}` : "설비 상세"}
      renderTabContent={() => {
        if (!detail) {
          return <p className="control-room-equipment-popup__empty">설비 정보를 불러올 수 없습니다.</p>;
        }
        return (
          <div className="control-room-equipment-popup">
            <div className="control-room-equipment-popup__head">
              <h3>{detail.equipmentName}</h3>
              <StatusChip variant={statusMeta.variant}>
                {statusMeta.emoji} {statusMeta.label}
              </StatusChip>
              {detail.alarm ? (
                <span
                  className={`control-room-equipment-card__alarm control-room-equipment-card__alarm--${detail.alarm.level}`}
                >
                  {detail.alarm.label}
                </span>
              ) : null}
            </div>

            <dl className="control-room-equipment-popup__grid">
              <div>
                <dt>공정</dt>
                <dd>{detail.process ?? "—"}</dd>
              </div>
              <div>
                <dt>작업자</dt>
                <dd>{detail.operator ?? "—"}</dd>
              </div>
              <div>
                <dt>현재 LOT</dt>
                <dd>{detail.currentLotNo ?? "—"}</dd>
              </div>
              <div>
                <dt>현재 제품</dt>
                <dd>{detail.currentProductName ?? "—"}</dd>
              </div>
              <div>
                <dt>작업 시작</dt>
                <dd>{detail.startTime ?? "—"}</dd>
              </div>
              <div>
                <dt>예상 종료</dt>
                <dd>{detail.expectedEndTime ?? "—"}</dd>
              </div>
            </dl>

            <div className="control-room-equipment-popup__util">
              <span className="control-room-equipment-popup__util-label">가동률</span>
              <HomeAnimatedProgressBar
                percent={isRunning ? detail.utilization ?? 0 : 0}
                processKey="production"
              />
            </div>

            <Link
              className="titan-btn titan-btn--primary"
              to={`/production/charging/equipment/${encodeURIComponent(detail.equipmentId)}`}
            >
              작업 시작/종료 · LOT 확인
            </Link>

            {detail.sameLotProducts?.length > 0 ? (
              <div className="control-room-equipment-popup__same-lot">
                <h4>동일 LOT 제품</h4>
                {detail.currentLotNo ? (
                  <p className="control-room-equipment-popup__lot-no">{detail.currentLotNo}</p>
                ) : null}
                <ul>
                  {detail.sameLotProducts.map((product) => (
                    <li key={product.partName}>{product.partName}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}
