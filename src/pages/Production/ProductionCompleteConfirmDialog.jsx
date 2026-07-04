import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { REGISTER_MODAL_CANCEL_LABEL } from "../../config/registerModalStandard";
import "./ProductionCompleteConfirmDialog.css";

function ProductionCompleteConfirmDialog({ open, count = 1, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("production-complete-confirm-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("production-complete-confirm-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="production-complete-confirm-overlay" role="presentation" onClick={onCancel}>
      <div
        className="production-complete-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="production-complete-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="production-complete-confirm-header">
          <Check size={22} aria-hidden="true" />
          <div>
            <h2 id="production-complete-confirm-title">생산 완료</h2>
            {count > 1 ? <p>{count}건 선택</p> : null}
          </div>
          <button
            type="button"
            className="production-complete-confirm-close"
            onClick={onCancel}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </header>

        <div className="production-complete-confirm-body">
          <p className="production-complete-confirm-question">
            선택한 제품을 생산 완료 처리하시겠습니까?
          </p>
        </div>

        <footer className="production-complete-confirm-footer">
          <SecondaryButton type="button" onClick={onCancel}>
            {REGISTER_MODAL_CANCEL_LABEL}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onConfirm}>
            확인
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default ProductionCompleteConfirmDialog;
