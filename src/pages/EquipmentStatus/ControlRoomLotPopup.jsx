import { useMemo } from "react";

import TitanDetailPopup from "../../foundation/components/TitanDetailPopup";
import StatusChip from "../../foundation/components/StatusChip";
import HomeAnimatedProgressBar from "../Home/HomeAnimatedProgressBar";
import { resolveChargeQty } from "../../utils/equipmentChargingQty";

function resolveLotStatusVariant(status) {
  const label = String(status ?? "");
  if (label.includes("운전") || label.includes("진행")) return "production";
  if (label.includes("장입")) return "prod-wait";
  if (label.includes("점검")) return "hold";
  if (label.includes("완료")) return "complete";
  return "inspect-wait";
}

/**
 * Control Room — LOT Popup (Blueprint ② · Read Only)
 * Data: useControlRoom → getLotDetail (WorkspaceData)
 */
export default function ControlRoomLotPopup({ detail, open, onClose }) {
  const statusVariant = useMemo(
    () => resolveLotStatusVariant(detail?.status),
    [detail?.status]
  );
  const progress = Number(detail?.progress ?? 0);

  return (
    <TitanDetailPopup
      open={open}
      onClose={onClose}
      title={detail ? `LOT 상세 — ${detail.lotNo}` : "LOT 상세"}
      renderTabContent={() => {
        if (!detail) {
          return <p className="control-room-lot-popup__empty">LOT 정보를 불러올 수 없습니다.</p>;
        }
        return (
          <div className="control-room-lot-popup">
            <div className="control-room-lot-popup__head">
              <h3>{detail.lotNo}</h3>
              <StatusChip variant={statusVariant}>{detail.status}</StatusChip>
            </div>

            <dl className="control-room-lot-popup__grid">
              <div>
                <dt>관리번호</dt>
                <dd>{detail.managementId}</dd>
              </div>
              <div>
                <dt>제품</dt>
                <dd>{detail.productName}</dd>
              </div>
              <div>
                <dt>거래처</dt>
                <dd>{detail.company}</dd>
              </div>
              <div>
                <dt>현재 설비</dt>
                <dd>{detail.equipmentName}</dd>
              </div>
              <div>
                <dt>현재 공정</dt>
                <dd>{detail.process}</dd>
              </div>
              <div>
                <dt>작업자</dt>
                <dd>{detail.operator}</dd>
              </div>
              <div>
                <dt>작업 시작</dt>
                <dd>{detail.startTime}</dd>
              </div>
              <div>
                <dt>예상 종료</dt>
                <dd>{detail.expectedEndTime}</dd>
              </div>
            </dl>

            <div className="control-room-lot-popup__progress">
              <span className="control-room-lot-popup__progress-label">진행률</span>
              <HomeAnimatedProgressBar percent={progress} processKey="production" />
            </div>

            {detail.lotItems?.length > 0 ? (
              <div className="control-room-lot-popup__items">
                <h4>LOT 구성품목 ({detail.lotItems.length}건)</h4>
                <table className="control-room-lot-popup__item-table">
                  <thead>
                    <tr>
                      <th>재질</th>
                      <th>품명</th>
                      <th>품번</th>
                      <th>수량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.lotItems.map((item) => (
                      <tr key={item.sourceRecordId || `${item.partNo}-${item.material}`}>
                        <td>{item.material || "—"}</td>
                        <td>{item.partName || item.productName || "—"}</td>
                        <td>{item.partNo || "—"}</td>
                        <td>
                          {resolveChargeQty(item, { lotNo: detail.lotNo }).toLocaleString("ko-KR")} EA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {detail.timelineSummary?.length > 0 ? (
              <div className="control-room-lot-popup__timeline">
                <h4>Timeline Summary</h4>
                <ul className="control-room-lot-timeline__list">
                  {detail.timelineSummary.map((event) => (
                    <li key={event.id}>
                      <time>{event.time}</time>
                      <strong>{event.title}</strong>
                      <span>{event.detail}</span>
                      <em>{event.user}</em>
                    </li>
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
