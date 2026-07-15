import { useCallback, useMemo, useRef } from "react";

import { QR_CHARGING_PAGE_COPY } from "../../../config/equipmentConfig";
import { SecondaryButton } from "../../../foundation/components/Button";
import { buildChargedLotRunningRows } from "../../../utils/equipmentWorkflowService";
import ChargeStartConditionsForm from "./ChargeStartConditionsForm";
import CurrentProcess from "./CurrentProcess";
import EquipmentChargingActions from "./EquipmentChargingActions";
import LotChargeQtyPanel from "./LotChargeQtyPanel";
import LotTable from "./LotTable";
import RunningWorkConditionsPanel from "./RunningWorkConditionsPanel";
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
  selectedChargeRowIds = [],
  toggleChargeRow,
  toggleAllChargeRows,
  chargeQtyByRowId = {},
  setChargeQtyForRow,
  totalChargeQty = 0,
  processName = "",
  layout = "page",
}) {
  const chargeFormRef = useRef(null);

  const isRunningMonitor = Boolean(
    activeSession && chargingButtons?.showComplete && !chargingButtons?.showStart
  );

  const chargedLotRows = useMemo(
    () => (isRunningMonitor ? buildChargedLotRunningRows(activeSession) : []),
    [activeSession, isRunningMonitor]
  );

  const selectedLotRow = availableLots.find((row) => row.id === activeLotId) ?? null;
  const selectedChargeRows = availableLots.filter((row) => selectedChargeRowIds.includes(row.id));
  const showLotEdit =
    !isRunningMonitor &&
    selectedLotRow &&
    (selectedLotRow.needsLotCreation || !selectedLotRow.lotNo?.trim());
  const hasFooterActions = Boolean(chargingButtons?.showStart || chargingButtons?.showComplete);
  const showChargeQtyPanel =
    !isRunningMonitor && (selectedChargeRows.length > 0 || Boolean(selectedLotRow));
  const hasChargeSelection = selectedChargeRows.length > 0 || Boolean(selectedLotRow);
  const showStartForm = Boolean(chargingButtons?.showStart) && hasChargeSelection;

  const lotSummary = useMemo(() => {
    const rows =
      selectedChargeRows.length > 0
        ? selectedChargeRows
        : selectedLotRow
          ? [selectedLotRow]
          : [];
    const lotLabels = rows
      .map((row) => String(row.lotNo ?? row.partName ?? row.partNo ?? "").trim())
      .filter(Boolean);
    if (lotLabels.length > 1) return `${lotLabels.length}건 장입`;
    return lotLabels[0] || "";
  }, [selectedChargeRows, selectedLotRow]);

  const handleStartClick = useCallback(() => {
    const result = chargeFormRef.current?.validate?.();
    if (!result?.ok) return;
    handleStartCharging?.(result.payload);
  }, [handleStartCharging]);

  if (isRunningMonitor) {
    const compact = layout === "popup-split";

    return (
      <div
        className={`equipment-charging-workflow equipment-charging-workflow--${layout} equipment-charging-workflow--running-monitor`}
        aria-label="설비 운전 모니터"
      >
        <div className="equipment-charging-workflow__body">
          <section
            className="equipment-charging-workflow__running-header"
            aria-label="현재 작업 정보"
          >
            {workflowError ? (
              <p className="equipment-charging-workflow__error" role="alert">
                {workflowError}
              </p>
            ) : null}
            <CurrentProcess session={activeSession} compact={compact} mode="running-monitor" />
          </section>

          <section className="equipment-charging-workflow__lot-panel" aria-label="현재 장입된 제품">
            <h2 className="equipment-charging-workflow__section-title">현재 장입된 제품</h2>
            <LotTable rows={chargedLotRows} variant="running-charged" />
          </section>

          <section className="equipment-charging-workflow__work-panel" aria-label="운전조건 및 종료">
            <RunningWorkConditionsPanel
              session={activeSession}
              processName={processName}
              compact={compact}
            />

            <div className="equipment-charging-workflow__footer equipment-charging-workflow__footer--finish-only">
              <EquipmentChargingActions
                buttonState={chargingButtons}
                onStart={handleStartClick}
                onComplete={handleFinishCharging}
              />
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`equipment-charging-workflow equipment-charging-workflow--${layout}`}
      aria-label="설비 장입 작업"
    >
      <div className="equipment-charging-workflow__body">
        <section className="equipment-charging-workflow__lot-panel" aria-label="장입 LOT">
          <h2 className="equipment-charging-workflow__section-title">{QR_CHARGING_PAGE_COPY.lotSectionTitle}</h2>
          <LotTable
            rows={availableLots}
            activeRowId={activeLotId}
            onRowClick={(row) => selectLot(row.id)}
            selectable
            selectedRowIds={selectedChargeRowIds}
            onToggleRow={toggleChargeRow}
            onToggleAll={toggleAllChargeRows}
            chargeQtyByRowId={chargeQtyByRowId}
            onChargeQtyChange={setChargeQtyForRow}
            chargeQtyInputEnabled={chargeQtyEnabled}
          />
          {showChargeQtyPanel ? (
            <LotChargeQtyPanel
              lotRow={selectedLotRow}
              selectedRows={selectedChargeRows}
              chargeQtyEnabled={chargeQtyEnabled}
              onChargeQtyEnabledChange={setChargeQtyEnabled}
              draftChargeQty={draftChargeQty}
              onDraftChargeQtyChange={setDraftChargeQty}
              chargeQtyByRowId={chargeQtyByRowId}
              onChargeQtyForRowChange={setChargeQtyForRow}
              totalChargeQty={totalChargeQty}
            />
          ) : null}

          {showLotEdit ? (
            <div className="equipment-charging-workflow__lot-edit" aria-label="LOT 번호 편집">
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
              <SecondaryButton
                type="button"
                onClick={restoreAutoLotNo}
                disabled={!autoLotNo || lotInputMode === "auto"}
              >
                자동 생성 번호로 복원
              </SecondaryButton>
            </div>
          ) : null}
        </section>

        <section className="equipment-charging-workflow__work-panel" aria-label="작업 정보">
          {workflowError ? (
            <p className="equipment-charging-workflow__error" role="alert">
              {workflowError}
            </p>
          ) : null}

          {activeSession ? <CurrentProcess session={activeSession} compact={layout === "popup-split"} /> : null}

          {showStartForm ? (
            <ChargeStartConditionsForm
              ref={chargeFormRef}
              processName={processName}
              lotSummary={lotSummary}
              enabled={showStartForm}
              compact={layout === "popup-split"}
            />
          ) : !activeSession ? (
            <p className="equipment-charging-workflow__work-hint">
              장입 LOT를 선택한 뒤 작업 시작 조건을 입력하세요.
            </p>
          ) : null}

          <div
            className={`equipment-charging-workflow__footer${
              hasFooterActions ? "" : " equipment-charging-workflow__footer--no-actions"
            }`}
          >
            {layout !== "popup-split" ? <CurrentProcess session={activeSession} /> : null}
            <EquipmentChargingActions
              buttonState={chargingButtons}
              onStart={handleStartClick}
              onComplete={handleFinishCharging}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
