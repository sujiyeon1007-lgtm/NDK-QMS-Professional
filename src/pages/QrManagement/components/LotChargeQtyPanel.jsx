import {
  resolveInboundQtyForChargeRow,
  resolveRemainingChargeQty,
} from "../../../utils/equipmentChargingQty";
import "./LotChargeQtyPanel.css";

function formatQty(value, unit = "EA") {
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty <= 0) return "—";
  return `${qty.toLocaleString("ko-KR")} ${String(unit ?? "EA").trim() || "EA"}`.trim();
}

function resolveRowChargeQty(row, chargeQtyByRowId, chargeQtyInputEnabled) {
  const remainingQty = resolveRemainingChargeQty(row);
  const inboundQty = resolveInboundQtyForChargeRow(row);
  const draft = chargeQtyInputEnabled
    ? String(chargeQtyByRowId?.[row?.id] ?? "").trim()
    : "";
  if (!draft) return remainingQty || inboundQty || 0;
  const parsed = Number(draft.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default function LotChargeQtyPanel({
  lotRow,
  selectedRows = [],
  chargeQtyEnabled = false,
  onChargeQtyEnabledChange,
  draftChargeQty = "",
  onDraftChargeQtyChange,
  chargeQtyByRowId = {},
  onChargeQtyForRowChange,
  totalChargeQty = 0,
}) {
  const rows = selectedRows.length > 0 ? selectedRows : lotRow ? [lotRow] : [];
  if (rows.length === 0) return null;

  const isMulti = rows.length > 1;
  const primaryRow = lotRow ?? rows[0];
  const unit = primaryRow?.unit ?? "EA";

  if (isMulti) {
    return (
      <section className="qr-lot-charge-qty" aria-label="장입수량 입력">
        <h3 className="qr-lot-charge-qty__title">장입 수량 ({rows.length}건 선택)</h3>

        <label className="qr-lot-charge-qty__toggle">
          <input
            type="checkbox"
            checked={chargeQtyEnabled}
            onChange={(event) => onChargeQtyEnabledChange?.(event.target.checked)}
          />
          장입수량 입력
        </label>

        <ul className="qr-lot-charge-qty__multi-list">
          {rows.map((row) => {
            const rowId = String(row?.id ?? "").trim();
            const rowUnit = row?.unit ?? "EA";
            const rowQty = resolveRowChargeQty(row, chargeQtyByRowId, chargeQtyEnabled);
            return (
              <li key={rowId} className="qr-lot-charge-qty__multi-item">
                <div className="qr-lot-charge-qty__multi-meta">
                  <strong>{String(row?.managementId ?? row?.mesManagementNo ?? row?.partNo ?? "—").trim()}</strong>
                  <span>
                    잔여 {formatQty(resolveRemainingChargeQty(row), rowUnit)}
                  </span>
                </div>
                {chargeQtyEnabled ? (
                  <div className="qr-lot-charge-qty__input-row">
                    <input
                      className="titan-input"
                      type="text"
                      inputMode="numeric"
                      value={chargeQtyByRowId[rowId] ?? ""}
                      placeholder={String(resolveRemainingChargeQty(row) || resolveInboundQtyForChargeRow(row) || "")}
                      onChange={(event) => onChargeQtyForRowChange?.(rowId, event.target.value)}
                    />
                    <span className="qr-lot-charge-qty__unit">{rowUnit}</span>
                  </div>
                ) : (
                  <span className="qr-lot-charge-qty__multi-qty">{formatQty(rowQty, rowUnit)}</span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="qr-lot-charge-qty__total" aria-live="polite">
          <span>총 장입수량</span>
          <strong>{formatQty(totalChargeQty, unit)}</strong>
        </div>

        <p className="qr-lot-charge-qty__hint" role="note">
          장입수량 입력을 사용하지 않거나 비워두면 각 제품의 잔여수량 전체가 장입됩니다.
        </p>
      </section>
    );
  }

  const inboundQty = resolveInboundQtyForChargeRow(primaryRow);
  const lotLabel = primaryRow.lotNo?.trim() || (primaryRow.needsLotCreation ? "자동생성 예정" : "—");

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
          <dd>{inboundQty > 0 ? `${inboundQty.toLocaleString("ko-KR")} ${unit}` : "—"}</dd>
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
              placeholder={
                resolveRemainingChargeQty(primaryRow) > 0
                  ? String(resolveRemainingChargeQty(primaryRow))
                  : inboundQty > 0
                    ? String(inboundQty)
                    : "수량"
              }
              onChange={(event) => onDraftChargeQtyChange?.(event.target.value)}
            />
            <span className="qr-lot-charge-qty__unit">{unit}</span>
          </div>
        </label>
      ) : null}

      <div className="qr-lot-charge-qty__total" aria-live="polite">
        <span>총 장입수량</span>
        <strong>
          {formatQty(
            chargeQtyEnabled && String(draftChargeQty ?? "").trim()
              ? Number(String(draftChargeQty).replace(/,/g, "")) || resolveRemainingChargeQty(primaryRow) || inboundQty
              : resolveRemainingChargeQty(primaryRow) || inboundQty,
            unit
          )}
        </strong>
      </div>

      <p className="qr-lot-charge-qty__hint" role="note">
        장입수량 입력을 사용하지 않거나 비워두면 입고수량 전체가 장입됩니다.
      </p>
    </section>
  );
}
