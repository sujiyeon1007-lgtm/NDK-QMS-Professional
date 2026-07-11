import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../../foundation/components/Button";
import { REGISTER_MODAL_CANCEL_LABEL } from "../../../config/registerModalStandard";
import { getProcessStepCompleteDialogModel } from "../../../utils/productProcessWorkflow";
import "../ProductionCompleteConfirmDialog.css";

export default function ProcessStepCompleteDialog({ open, record, onClose, onConfirm }) {
  const model = useMemo(
    () => (open && record ? getProcessStepCompleteDialogModel(record) : null),
    [open, record]
  );
  const [targetStepIndex, setTargetStepIndex] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !model) return;
    setTargetStepIndex(model.defaultNextIndex);
    setNote("");
  }, [open, model]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("production-complete-confirm-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("production-complete-confirm-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !model) return null;

  const handleConfirm = () => {
    onConfirm?.({
      targetStepIndex,
      note,
    });
  };

  return createPortal(
    <div className="production-complete-confirm-overlay" role="presentation" onClick={onClose}>
      <div
        className="production-complete-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="process-step-complete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="production-complete-confirm-header">
          <ArrowRight size={22} aria-hidden="true" />
          <div>
            <h2 id="process-step-complete-title">{"\uACF5\uC815 \uC644\uB8CC"}</h2>
            <p>
              {model.completedLabel}
              {" \u2192 "}
              {model.defaultNextLabel || "\uAC80\uC0AC \uB300\uAE30"}
            </p>
          </div>
          <button
            type="button"
            className="production-complete-confirm-close"
            onClick={onClose}
            aria-label={"\uB2EB\uAE30"}
          >
            <X size={18} />
          </button>
        </header>

        <div className="production-complete-confirm-body">
          <p className="production-complete-confirm-question">
            {"\uC644\uB8CC\uD55C \uACF5\uC815 \uD6C4 \uB2E4\uC74C \uACF5\uC815\uC744 \uC9C4\uD589\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?"}
          </p>

          {model.remainingSteps.length > 1 ? (
            <label className="production-complete-confirm-field">
              <span>{"\uB2E4\uC74C \uACF5\uC815"}</span>
              <select
                value={targetStepIndex ?? model.defaultNextIndex}
                onChange={(event) => setTargetStepIndex(Number(event.target.value))}
              >
                {model.remainingSteps.map((step) => (
                  <option key={step.stepIndex} value={step.stepIndex}>
                    {step.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="production-complete-confirm-field">
            <span>{"\uBA54\uBAA8"}</span>
            <textarea
              rows={2}
              value={note}
              placeholder={"\uACF5\uC815 \uBCC0\uACBD \uBA54\uBAA8 (\uC120\uD0DD)"}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>

        <footer className="production-complete-confirm-footer">
          <SecondaryButton type="button" onClick={onClose}>
            {REGISTER_MODAL_CANCEL_LABEL}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleConfirm}>
            {"\uD655\uC778"}
          </PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}
