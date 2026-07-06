import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { REGISTER_MODAL_CANCEL_LABEL } from "../../config/registerModalStandard";
import "./ProductionDailyReportPrintDialog.css";

export default function ProductionDailyReportLotSelectDialog({
  open,
  lotGroups = [],
  onConfirm,
  onCancel,
}) {
  const [selectedLotKey, setSelectedLotKey] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedLotKey("");
      return undefined;
    }

    setSelectedLotKey(lotGroups[0]?.lotKey ?? "");

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("production-daily-print-dialog-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("production-daily-print-dialog-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, lotGroups, onCancel]);

  if (!open || !lotGroups.length) return null;

  const handleConfirm = () => {
    const selected = lotGroups.find((group) => group.lotKey === selectedLotKey);
    if (!selected) return;
    onConfirm?.(selected.lotNo);
  };

  return createPortal(
    <div className="production-daily-print-dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        className="production-daily-print-dialog production-daily-print-dialog--lot-select"
        role="dialog"
        aria-modal="true"
        aria-labelledby="production-daily-lot-select-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="production-daily-print-dialog-header">
          <Printer size={22} aria-hidden="true" />
          <div>
            <h2 id="production-daily-lot-select-title">열처리일보 출력</h2>
          </div>
          <button
            type="button"
            className="production-daily-print-dialog-close"
            onClick={onCancel}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </header>

        <div className="production-daily-print-dialog-body">
          <p className="production-daily-print-dialog-message">
            선택한 제품에 여러 LOT가 포함되어 있습니다.
            <br />
            출력할 LOT를 선택해 주세요.
          </p>

          <fieldset className="production-daily-print-dialog-lot-list">
            <legend className="sr-only">출력 LOT 선택</legend>
            {lotGroups.map((group) => (
              <label key={group.lotKey} className="production-daily-print-dialog-lot-option">
                <input
                  type="radio"
                  name="production-daily-print-lot"
                  value={group.lotKey}
                  checked={selectedLotKey === group.lotKey}
                  onChange={() => setSelectedLotKey(group.lotKey)}
                />
                <span>
                  LOT {group.lotNo} ({group.count}건)
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <footer className="production-daily-print-dialog-footer">
          <SecondaryButton type="button" onClick={onCancel}>
            {REGISTER_MODAL_CANCEL_LABEL}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleConfirm} disabled={!selectedLotKey}>
            확인
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}
