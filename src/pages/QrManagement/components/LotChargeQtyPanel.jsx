import { resolveInboundQtyForChargeRow } from "../../../utils/equipmentChargingQty";
import "./LotChargeQtyPanel.css";

export default function LotChargeQtyPanel({
  lotRow,
  chargeQtyEnabled = false,
  onChargeQtyEnabledChange,
  draftChargeQty = "",
  onDraftChargeQtyChange,
}) {
  if (!lotRow) return null;

  const inboundQty = resolveInboundQtyForChargeRow(lotRow);
  const unit = lotRow.unit ?? "EA";
  const lotLabel = lotRow.lotNo?.trim() || (lotRow.needsLotCreation ? "자동생성 예정" : "—");

  return (
    <section className="qr-lot-charge-qty" aria-label="장입수량 입력">
      <h3 className="qr-lot-charge-qty__title">장입 수량</h3>
      <dl className="qr-lot-charge-qty__summary">
        <div>
          <dt>LOT</dt>
          <dd>{lotLabel}</dd>
        </div>
        <div>
          <dt>입고수량</dt>
          <dd>
            {inboundQty > 0 ? `${inboundQty.toLocaleString("ko-KR")} ${unit}` : "—"}
          </dd>
        </div>
      </dl>

      <label className="qr-lot-charge-qty__toggle">
        <input
          type="checkbox"
          checked={chargeQtyEnabled}
          onChange={(event) => onChargeQtyEnabledChange?.(event.target.checked)}
        />
        장입수량 입력
      </label>

      {chargeQtyEnabled ? (
        <label className="qr-lot-charge-qty__field">
          <span>장입수량</span>
          <div className="qr-lot-charge-qty__input-row">
            <input
              className="titan-input"
              type="text"
              inputMode="numeric"
              value={draftChargeQty}
              placeholder={inboundQty > 0 ? String(inboundQty) : "수량"}
              onChange={(event) => onDraftChargeQtyChange?.(event.target.value)}
            />
            <span className="qr-lot-charge-qty__unit">{unit}</span>
          </div>
        </label>
      ) : null}

      <p className="qr-lot-charge-qty__hint" role="note">
        장입수량 입력을 사용하지 않거나 비워두면 입고수량 전체가 장입됩니다.
      </p>
    </section>
  );
}
