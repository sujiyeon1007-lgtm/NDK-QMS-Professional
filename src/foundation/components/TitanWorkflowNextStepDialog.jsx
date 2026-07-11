import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Button";
import "./OperationsWorkflowNextDialog.css";

/** RC2 completion to next-step dialog. */
export default function TitanWorkflowNextStepDialog({ open, step, onNavigate, onStay, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("operations-workflow-next-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("operations-workflow-next-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !step) return null;

  const { title, message, hint, nextLabel, nextPath, stayLabel, stayPath } = step;

  const handleStay = () => {
    if (stayPath) {
      onNavigate?.(stayPath);
      return;
    }
    onStay?.();
  };

  return createPortal(
    <div className="operations-workflow-next-overlay" role="presentation" onClick={onClose}>
      <div
        className="operations-workflow-next-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="operations-workflow-next-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="operations-workflow-next-header">
          <ArrowRight size={22} aria-hidden="true" />
          <div>
            <h2 id="operations-workflow-next-title">{title}</h2>
            <p>{message}</p>
          </div>
          <button type="button" className="operations-workflow-next-close" onClick={onClose} aria-label={"\uB2EB\uAE30"}>
            <X size={18} />
          </button>
        </header>

        <div className="operations-workflow-next-body">{hint ? <p>{hint}</p> : null}</div>

        <footer className="operations-workflow-next-footer">
          <SecondaryButton type="button" onClick={handleStay}>
            {stayLabel}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={() => onNavigate?.(nextPath)}>
            {nextLabel}
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}
