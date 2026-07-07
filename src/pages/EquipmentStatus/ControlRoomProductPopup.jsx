import { useMemo } from "react";

import TitanDetailPopup from "../../foundation/components/TitanDetailPopup";
import StatusChip from "../../foundation/components/StatusChip";
import HomeAnimatedProgressBar from "../Home/HomeAnimatedProgressBar";

function resolveProductStatusVariant(status) {
  const label = String(status ?? "");
  if (label.includes("운전") || label.includes("진행")) return "production";
  if (label.includes("장입")) return "prod-wait";
  if (label.includes("점검")) return "hold";
  if (label.includes("완료")) return "complete";
  return "inspect-wait";
}

/**
 * Control Room — Product Popup (Blueprint ② · Read Only · Sprint 3D)
 * 제품 중심 상세 + 해당 제품 LOT 목록 요약
 * 전체 Traceability ❌ (LOT Lifecycle 담당) — Control Room은 Summary만
 * Data: useControlRoom → getProductDetail (WorkspaceData)
 */
export default function ControlRoomProductPopup({ detail, open, onClose }) {
  const statusVariant = useMemo(
    () => resolveProductStatusVariant(detail?.status),
    [detail?.status]
  );
  const progress = Number(detail?.progress ?? 0);

  return (
    <TitanDetailPopup
      open={open}
      onClose={onClose}
      title={detail ? `제품 상세 — ${detail.productName}` : "제품 상세"}
      renderTabContent={() => {
        if (!detail) {
          return <p className="control-room-product-popup__empty">제품 정보를 불러올 수 없습니다.</p>;
        }
        return (
          <div className="control-room-product-popup">
            <div className="control-room-product-popup__head">
              <h3>{detail.productName}</h3>
              <StatusChip variant={statusVariant}>{detail.status}</StatusChip>
            </div>

            <dl className="control-room-product-popup__grid">
              <div>
                <dt>품번</dt>
                <dd>{detail.partNo}</dd>
              </div>
              <div>
                <dt>고객사</dt>
                <dd>{detail.company}</dd>
              </div>
              <div>
                <dt>현재 LOT</dt>
                <dd>{detail.currentLotNo}</dd>
              </div>
              <div>
                <dt>현재 설비</dt>
                <dd>{detail.equipmentName}</dd>
              </div>
              <div>
                <dt>작업자</dt>
                <dd>{detail.operator}</dd>
              </div>
              <div>
                <dt>LOT 수</dt>
                <dd>{detail.lotCount}</dd>
              </div>
            </dl>

            <div className="control-room-product-popup__progress">
              <span className="control-room-product-popup__progress-label">현재 LOT 진행률</span>
              <HomeAnimatedProgressBar percent={progress} processKey="production" />
            </div>

            {detail.lotSummary?.length > 0 ? (
              <div className="control-room-product-popup__lots">
                <h4>LOT 목록 요약</h4>
                <table className="control-room-product-popup__lot-table">
                  <thead>
                    <tr>
                      <th>LOT</th>
                      <th>현재 설비</th>
                      <th>공정</th>
                      <th>작업자</th>
                      <th>진행률</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.lotSummary.map((lot) => (
                      <tr key={lot.lotNo}>
                        <td>{lot.lotNo}</td>
                        <td>{lot.equipmentName}</td>
                        <td>{lot.process}</td>
                        <td>{lot.operator}</td>
                        <td>{lot.progressLabel}</td>
                        <td>{lot.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}
