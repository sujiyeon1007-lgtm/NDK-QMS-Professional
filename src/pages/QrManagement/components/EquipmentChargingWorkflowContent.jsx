import { QR_CHARGING_PAGE_COPY } from "../../../config/equipmentConfig";
import { SecondaryButton } from "../../../foundation/components/Button";
import CurrentProcess from "./CurrentProcess";
import EquipmentChargingActions from "./EquipmentChargingActions";
import LotChargeQtyPanel from "./LotChargeQtyPanel";
import LotTable from "./LotTable";
import "./EquipmentChargingWorkflowContent.css";

/**
 * 설비 장입 Workflow UI — ProductionChargingEquipmentPage · ControlRoomEquipmentPopup 공통
 */
export default function EquipmentChargingWorkflowContent({
  availableLots = [],
  activeLotId,
  activeSession,
  selectLot,
  chargingButtons,
  handleStartCharging,
  handleFinishCharging,
  workflowError,
  draftLotNo,
  autoLotNo,
  lotInputMode,
  setLotInputMode,
  setDraftLotNo,
  restoreAutoLotNo,
  chargeQtyEnabled,
  setChargeQtyEnabled,
  draftChargeQty,
  setDraftChargeQty,
  layout = "page",
}) {
  const selectedLotRow = availableLots.find((row) => row.id === activeLotId) ?? null;
  const showLotEdit =
    selectedLotRow && (selectedLotRow.needsLotCreation || !selectedLotRow.lotNo?.trim());
  const hasFooterActions = Boolean(chargingButtons?.showStart || chargingButtons?.showComplete);

  return (
    <div
      className={`equipment-charging-workflow equipment-charging-workflow--${layout}`}
      aria-label="설비 장입 작업"
    >
      <section className="equipment-charging-workflow__lot-panel" aria-label="장입 가능 LOT">
        <h2 className="equipment-charging-workflow__section-title">{QR_CHARGING_PAGE_COPY.lotSectionTitle}</h2>
        <LotTable rows={availableLots} activeRowId={activeLotId} onRowClick={(row) => selectLot(row.id)} />
        <LotChargeQtyPanel
          lotRow={selectedLotRow}
          chargeQtyEnabled={chargeQtyEnabled}
          onChargeQtyEnabledChange={setChargeQtyEnabled}
          draftChargeQty={draftChargeQty}
          onDraftChargeQtyChange={setDraftChargeQty}
        />
      </section>

      {showLotEdit ? (
        <section className="equipment-charging-workflow__lot-edit" aria-label="LOT 번호 편집">
          <fieldset className="equipment-charging-workflow__lot-mode">
            <legend>LOT 생성 방식</legend>
            <label>
              <input
                type="radio"
                name={`lot-input-mode-${layout}`}
                checked={lotInputMode === "auto"}
                onChange={() => setLotInputMode("auto")}
              />
              자동 생성
            </label>
            <label>
              <input
                type="radio"
                name={`lot-input-mode-${layout}`}
                checked={lotInputMode === "manual"}
                onChange={() => setLotInputMode("manual")}
              />
              수동 입력
            </label>
          </fieldset>
          <label className="equipment-charging-workflow__lot-edit-field">
            <span>LOT.NO</span>
            <input
              className="titan-input"
              type="text"
              value={draftLotNo}
              onChange={(event) => setDraftLotNo(event.target.value)}
              placeholder={autoLotNo || "자동 생성 번호"}
              readOnly={lotInputMode === "auto"}
            />
          </label>
          <SecondaryButton type="button" onClick={restoreAutoLotNo} disabled={!autoLotNo || lotInputMode === "auto"}>
            자동 생성 번호로 복원
          </SecondaryButton>
        </section>
      ) : null}

      {workflowError ? (
        <p className="equipment-charging-workflow__error" role="alert">
          {workflowError}
        </p>
      ) : null}

      <div
        className={`equipment-charging-workflow__footer${
          hasFooterActions ? "" : " equipment-charging-workflow__footer--no-actions"
        }`}
      >
        <CurrentProcess session={activeSession} />
        <EquipmentChargingActions
          buttonState={chargingButtons}
          onStart={handleStartCharging}
          onComplete={handleFinishCharging}
        />
      </div>
    </div>
  );
}
