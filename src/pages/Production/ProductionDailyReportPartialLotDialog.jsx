import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import "./ProductionDailyReportPrintDialog.css";

export default function ProductionDailyReportPartialLotDialog({
  open,
  lotNo = "",
  selectedCount = 0,
  totalCount = 0,
  onPrintSelected,
  onPrintAllLot,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

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
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="production-daily-print-dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        className="production-daily-print-dialog production-daily-print-dialog--partial-lot"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="production-daily-partial-lot-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="production-daily-print-dialog-header">
          <AlertCircle size={22} aria-hidden="true" />
          <div>
            <h2 id="production-daily-partial-lot-title">열처리일보 출력</h2>
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
            동일 LOT의 제품이 모두 선택되지 않았습니다.
          </p>
          <p className="production-daily-print-dialog-detail">
            선택한 LOT <strong>{lotNo}</strong>에는 총 {totalCount}건의 제품이 있으며,
            <br />
            현재 {selectedCount}건만 선택되어 있습니다.
          </p>
          <p className="production-daily-print-dialog-question">어떻게 진행하시겠습니까?</p>
        </div>

        <footer className="production-daily-print-dialog-footer production-daily-print-dialog-footer--stack">
          <button
            type="button"
            className="production-daily-print-dialog-action production-daily-print-dialog-action--selected"
            onClick={onPrintSelected}
          >
            선택한 제품만 출력 (유지)
          </button>
          <button
            type="button"
            className="production-daily-print-dialog-action production-daily-print-dialog-action--all-lot"
            onClick={onPrintAllLot}
          >
            동일 LOT 전체 제품으로 변경 후 출력
          </button>
          <button
            type="button"
            className="production-daily-print-dialog-action production-daily-print-dialog-action--cancel"
            onClick={onCancel}
          >
            취소
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
