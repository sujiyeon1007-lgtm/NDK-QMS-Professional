import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Button";
import {
  REGISTER_MODAL_CANCEL_LABEL,
  REGISTER_MODAL_SUBMIT_LABEL,
} from "../../config/registerModalStandard";

/**
 * Project TITAN V1.0 — 공통 등록 모달 Shell
 */
export default function TitanRegisterModal({
  open,
  onClose,
  onSubmit,
  title,
  kicker,
  titleId = "titan-register-modal-title",
  children,
  submitLabel = REGISTER_MODAL_SUBMIT_LABEL,
  cancelLabel = REGISTER_MODAL_CANCEL_LABEL,
  size = "wide",
}) {
  useEffect(() => {
    if (!open) return undefined;

    const root = document.documentElement;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = root.style.overflow;

    root.classList.add("titan-modal-open");
    document.body.classList.add("titan-modal-open");
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      root.classList.remove("titan-modal-open");
      document.body.classList.remove("titan-modal-open");
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  return createPortal(
    <div className="titan-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className={`titan-modal titan-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="titan-modal__header">
          <div>
            {kicker ? <p className="titan-modal__kicker">{kicker}</p> : null}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" className="titan-modal__close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <form className="titan-modal__form" onSubmit={handleSubmit}>
          <div className="titan-modal__body">{children}</div>
          <footer className="titan-modal__footer">
            <SecondaryButton type="button" onClick={onClose}>
              {cancelLabel}
            </SecondaryButton>
            <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
          </footer>
        </form>
      </div>
    </div>,
    document.body
  );
}
