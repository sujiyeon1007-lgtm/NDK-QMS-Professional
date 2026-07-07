import { QR_CHARGING_PAGE_COPY } from "../../../config/equipmentConfig";
import { PrimaryButton, SecondaryButton } from "../../../foundation/components/Button";
import "./EquipmentChargingActions.css";

export default function EquipmentChargingActions({ buttonState, onStart, onComplete }) {
  const { showStart, showComplete, startEnabled, completeEnabled } = buttonState ?? {};

  if (!showStart && !showComplete) {
    return null;
  }

  return (
    <div className="qr-equipment-actions" role="group" aria-label="설비 장입 작업">
      {showStart ? (
        <PrimaryButton
          type="button"
          disabled={!startEnabled}
          aria-disabled={!startEnabled}
          onClick={onStart}
        >
          {QR_CHARGING_PAGE_COPY.startLabel}
        </PrimaryButton>
      ) : null}
      {showComplete ? (
        <SecondaryButton
          type="button"
          disabled={!completeEnabled}
          aria-disabled={!completeEnabled}
          onClick={onComplete}
        >
          {QR_CHARGING_PAGE_COPY.completeLabel}
        </SecondaryButton>
      ) : null}
    </div>
  );
}
