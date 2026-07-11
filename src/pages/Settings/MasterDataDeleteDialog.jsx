import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import "./MasterDataDeleteDialog.css";

function MasterDataDeleteDialog({
  row,
  categoryLabel,
  onConfirm,
  onClose,
  blocked = false,
  blockedMessage = "",
  confirmMessage = "정말 삭제하시겠습니까?",
  confirmLabel = "삭제",
  cancelLabel = "취소",
  softDelete = false,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("master-delete-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("master-delete-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!row) return null;

  return createPortal(
    <div className="master-delete-overlay" role="presentation" onClick={onClose}>
      <div
        className="master-delete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="master-delete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="master-delete-header">
          <AlertTriangle size={20} />
          <div>
            <h2 id="master-delete-title">{blocked ? "삭제 제한" : "기준정보 삭제"}</h2>
            <p>{categoryLabel}</p>
          </div>
          <button type="button" className="master-delete-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <div className="master-delete-body">
          {blocked ? (
            <span className="master-delete-blocked">{blockedMessage}</span>
          ) : (
            <>
              <p>
                <strong>{row.code}</strong> · {row.name}
              </p>
              <span>{confirmMessage}</span>
            </>
          )}
        </div>

        <footer className="master-delete-footer">
          <button type="button" className="master-delete-btn" onClick={onClose}>
            {blocked ? "확인" : cancelLabel}
          </button>
          {!blocked ? (
            <button type="button" className="master-delete-btn danger" onClick={onConfirm}>
              {softDelete ? "미사용 처리" : confirmLabel}
            </button>
          ) : null}
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default MasterDataDeleteDialog;
