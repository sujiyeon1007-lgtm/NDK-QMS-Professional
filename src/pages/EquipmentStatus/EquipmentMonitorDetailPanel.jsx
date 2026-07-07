import { Link } from "react-router-dom";

import StatusChip from "../../foundation/components/StatusChip";
import {
  EQUIPMENT_RUN_STATUS_META,
  EQUIPMENT_STATUS_PAGE_COPY,
} from "../../config/equipmentConfig";
import HomeAnimatedProgressBar from "../Home/HomeAnimatedProgressBar";
import "./EquipmentMonitorDetailPanel.css";

export default function EquipmentMonitorDetailPanel({ detail }) {
  if (!detail) {
    return (
      <aside className="equipment-monitor-detail equipment-monitor-detail--empty">
        <p className="equipment-monitor-detail__empty">설비를 선택하면 상세 정보가 표시됩니다.</p>
      </aside>
    );
  }

  const statusMeta = EQUIPMENT_RUN_STATUS_META[detail.status] ?? EQUIPMENT_RUN_STATUS_META.idle;
  const progress = detail.progress ?? 0;

  return (
    <aside className="equipment-monitor-detail" aria-label={EQUIPMENT_STATUS_PAGE_COPY.detailTitle}>
      <div className="equipment-monitor-detail__head">
        <h3>{EQUIPMENT_STATUS_PAGE_COPY.detailTitle}</h3>
        <StatusChip variant={statusMeta.variant}>
          {statusMeta.emoji} {statusMeta.label}
        </StatusChip>
      </div>

      <dl className="equipment-monitor-detail__grid">
        <div>
          <dt>설비명</dt>
          <dd>{detail.equipmentName}</dd>
        </div>
        <div>
          <dt>상태</dt>
          <dd>
            {statusMeta.emoji} {statusMeta.label}
          </dd>
        </div>
        <div>
          <dt>LOT</dt>
          <dd>{detail.currentLotNo ?? "—"}</dd>
        </div>
        <div>
          <dt>시작시간</dt>
          <dd>{detail.startTime ?? "—"}</dd>
        </div>
        <div>
          <dt>종료예정</dt>
          <dd>{detail.expectedEndTime ?? "—"}</dd>
        </div>
        <div className="equipment-monitor-detail__progress">
          <dt>진행률</dt>
          <dd>
            <HomeAnimatedProgressBar percent={progress} processKey="production" />
          </dd>
        </div>
      </dl>

      {detail.sameLotProducts?.length > 0 ? (
        <div className="equipment-monitor-detail__same-lot">
          <h4>{EQUIPMENT_STATUS_PAGE_COPY.sameLotTitle}</h4>
          {detail.currentLotNo ? (
            <p className="equipment-monitor-detail__lot-no">{detail.currentLotNo}</p>
          ) : null}
          <ul>
            {detail.sameLotProducts.map((product) => (
              <li key={product.partName}>{product.partName}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="equipment-monitor-detail__footer">
        <Link to={EQUIPMENT_STATUS_PAGE_COPY.chargingLinkTo} className="equipment-monitor-detail__link">
          {EQUIPMENT_STATUS_PAGE_COPY.chargingLinkLabel}
        </Link>
      </div>

      <div className="equipment-monitor-detail__future-slots" aria-hidden="true" hidden>
        <dl>
          <div data-future-field="operator" />
          <div data-future-field="temperature" />
          <div data-future-field="pressure" />
          <div data-future-field="gas" />
          <div data-future-field="voltage" />
          <div data-future-field="ampere" />
          <div data-future-field="alarm" />
          <div data-future-field="note" />
        </dl>
      </div>
    </aside>
  );
}
