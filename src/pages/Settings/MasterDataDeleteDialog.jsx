import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";
import "./MasterDataDeleteDialog.css";

function MasterDataDeleteDialog({ row, categoryLabel, onConfirm, onClose }) {
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
            <h2 id="master-delete-title">기준정보 삭제</h2>
            <p>{categoryLabel} · 세션 UI에서만 제거됩니다</p>
          </div>
          <button type="button" className="master-delete-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <div className="master-delete-body">
          <p>
            <strong>{row.code}</strong> · {row.name}
          </p>
          <span>삭제 후 SQLite 연동 Sprint에서 영구 반영됩니다.</span>
        </div>

        <footer className="master-delete-footer">
          <button type="button" className="master-delete-btn" onClick={onClose}>
            취소
          </button>
          <button type="button" className="master-delete-btn danger" onClick={onConfirm}>
            <Trash2 size={16} />
            삭제
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default MasterDataDeleteDialog;
