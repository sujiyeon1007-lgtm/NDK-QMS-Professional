import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import { PrimaryButton } from "../../foundation/components/Button";
import { PRODUCTION_DAILY_PRINT_NO_SELECTION_MESSAGE } from "./productionDailyReportPrintActions";
import "./ProductionDailyReportPrintDialog.css";

export default function ProductionDailyReportNoSelectionDialog({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("production-daily-print-dialog-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape" || event.key === "Enter") onClose?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("production-daily-print-dialog-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="production-daily-print-dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="production-daily-print-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="production-daily-no-selection-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="production-daily-print-dialog-header">
          <AlertCircle size={22} aria-hidden="true" />
          <div>
            <h2 id="production-daily-no-selection-title">열처리일보 출력</h2>
          </div>
          <button
            type="button"
            className="production-daily-print-dialog-close"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </header>

        <div className="production-daily-print-dialog-body">
          <p className="production-daily-print-dialog-message">{PRODUCTION_DAILY_PRINT_NO_SELECTION_MESSAGE}</p>
        </div>

        <footer className="production-daily-print-dialog-footer production-daily-print-dialog-footer--single">
          <PrimaryButton type="button" onClick={onClose}>
            확인
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}
