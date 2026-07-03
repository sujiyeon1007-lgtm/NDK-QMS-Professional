import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Project TITAN — ERP/MES Workspace Modal (Popup Standard V1.0)
 * Portal → document.body · fixed shell · internal scroll only
 *
 * Layout slots: toolbar · search · table (children) · footer · detail
 */
export default function TitanWorkspaceModal({
  open,
  onClose,
  title,
  kicker,
  titleId = "titan-workspace-modal-title",
  children,
  toolbar = null,
  search = null,
  table = null,
  footer = null,
  detail = null,
  size = "workspace",
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

  const tableContent = table ?? children;

  return createPortal(
    <div className="titan-modal-overlay titan-modal-overlay--workspace" role="presentation" onClick={onClose}>
      <div
        className={`titan-modal titan-modal--${size} titan-workspace-modal`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="titan-modal__header titan-workspace-modal__header">
          <div>
            {kicker ? <p className="titan-modal__kicker">{kicker}</p> : null}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" className="titan-modal__close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        {toolbar ? (
          <div className="titan-workspace-modal__toolbar">{toolbar}</div>
        ) : null}

        {search ? (
          <div className="titan-workspace-modal__search">{search}</div>
        ) : null}

        <div
          className={`titan-workspace-modal__main${detail ? " titan-workspace-modal__main--with-detail" : ""}`}
        >
          <div className="titan-workspace-modal__table">
            <div className="titan-workspace-modal__table-inner">{tableContent}</div>
          </div>
          {detail ? <aside className="titan-workspace-modal__detail">{detail}</aside> : null}
        </div>

        {footer ? <footer className="titan-workspace-modal__footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body
  );
}
